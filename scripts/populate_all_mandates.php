<?php
/**
 * BACKGROUND MANDATE POPULATION SCRIPT
 * Usage: php scripts/populate_all_mandates.php
 */
declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
  die("This script can only be run from the command line.\n");
}

echo "=========================================================\n";
echo "  evote.ng - Background Mandate Auto-Populate Service\n";
echo "=========================================================\n\n";

$secretsPath = __DIR__ . '/../config/secrets.php';
if (!is_file($secretsPath)) {
  die("Error: config/secrets.php not found.\n");
}
$secrets = require $secretsPath;

$supabaseUrl = rtrim($secrets['SUPABASE_URL'] ?? '', '/');
$serviceKey  = $secrets['SUPABASE_SERVICE_ROLE_KEY'] ?? '';
$openrouterKey = $secrets['OPENROUTER_API_KEY'] ?? '';
$model = $secrets['OPENROUTER_MODEL'] ?? 'openai/gpt-4o-mini';

if (!$supabaseUrl || !$serviceKey) {
  die("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in secrets.php.\nPlease add your Service Role Key via the Admin AI Manager -> Settings tab.\n");
}
if (!$openrouterKey) {
  die("Error: OPENROUTER_API_KEY missing in secrets.php.\n");
}

// ── HTTP HELPER ─────────────────────────────────────────
function fetch_json($url, $method = 'GET', $body = null, $headers = []) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
  curl_setopt($ch, CURLOPT_TIMEOUT, 30);
  
  $httpHeaders = [];
  foreach ($headers as $k => $v) $httpHeaders[] = "$k: $v";
  curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
  
  if ($body !== null) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_UNICODE));
  }
  
  $resp = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  
  if ($resp === false) return ['ok' => false, 'code' => 0, 'err' => $err];
  $json = json_decode((string)$resp, true);
  return ['ok' => $code >= 200 && $code < 300, 'code' => $code, 'json' => $json];
}

// ── SCRAPER FUNCTIONS ───────────────────────────────────
function mc_fetch_text(string $url, int $timeoutSec = 12): string {
  $userAgent = 'Mozilla/5.0 (compatible; evote.ng-bot/1.0; +https://evote.ng)';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSec);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: text/html,*/*']);
  $resp = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($resp === false || $code < 200 || $code >= 400) return '';
  return (string)$resp;
}

function mc_clean(string $html, int $maxChars = 4000): string {
  $text = preg_replace('#<(script|style)[^>]*>.*?</\1>#si', ' ', $html) ?? $html;
  $text = strip_tags((string)$text);
  $text = (string)preg_replace('/\s{2,}/', ' ', $text);
  $text = trim($text);
  return mb_strlen($text) > $maxChars ? mb_substr($text, 0, $maxChars) . '…' : $text;
}

// ── FETCH CONTEXT FOR OFFICIAL ──────────────────────────
function fetch_all_context($official) {
  $name = $official['full_name'];
  $contexts = [];
  $q = urlencode($name);
  
  echo "    Fetching context across the web... ";
  
  // Wikipedia
  $url = "https://en.wikipedia.org/w/api.php?action=query&titles={$q}&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json";
  $raw = mc_fetch_text($url, 10);
  $data = json_decode($raw, true);
  if (is_array($data) && !empty($data['query']['pages'])) {
    foreach ($data['query']['pages'] as $page) {
      if (!empty($page['extract'])) {
        $contexts[] = "=== SOURCE: Wikipedia ===\n" . mb_substr(trim((string)$page['extract']), 0, 3000);
        break;
      }
    }
  }
  
  // Trackers
  $sources = [
    'manifesto.ng' => "https://manifesto.ng/?s=".urlencode($name.' Nigeria'),
    'promisetracker.ng' => "https://promisetracker.ng/?s={$q}",
    'followthepromises.org' => "https://followthepromises.org/?s={$q}",
    'tracka.ng' => "https://tracka.ng/?s={$q}",
    'orderpaper.ng' => "https://orderpaper.ng/?s={$q}",
    'dataphyte.com' => "https://www.dataphyte.com/?s={$q}",
  ];
  
  foreach ($sources as $domain => $url) {
    $raw = mc_fetch_text($url, 8);
    if ($raw) $contexts[] = "=== SOURCE: {$domain} ===\n" . mc_clean($raw, 2500);
  }
  
  echo "Found " . count($contexts) . " sources.\n";
  return implode("\n\n", $contexts);
}

// ── MAIN SCRIPT ─────────────────────────────────────────

$supaHeaders = [
  'apikey' => $serviceKey,
  'Authorization' => "Bearer {$serviceKey}",
  'Content-Type' => 'application/json',
  'Prefer' => 'return=minimal'
];

echo "Fetching all active officials from Supabase...\n";
$res = fetch_json("{$supabaseUrl}/rest/v1/officials?status=eq.active&select=id,full_name,role,state_code,website", 'GET', null, $supaHeaders);
if (!$res['ok']) die("Failed to fetch officials: " . json_encode($res['json'] ?? $res['err']) . "\n");

$officials = $res['json'];
$total = count($officials);
echo "Found {$total} active officials.\n\n";

$processed = 0;
$skipped = 0;
$imported = 0;

foreach ($officials as $i => $o) {
  $num = $i + 1;
  echo "[{$num}/{$total}] {$o['full_name']} ({$o['role']})\n";
  
  // Check if they already have promises
  $checkRes = fetch_json("{$supabaseUrl}/rest/v1/official_promises?official_id=eq.{$o['id']}&select=id", 'GET', null, $supaHeaders);
  if ($checkRes['ok'] && is_array($checkRes['json']) && count($checkRes['json']) > 0) {
    echo "    -> Skipped (Already has " . count($checkRes['json']) . " promises).\n";
    $skipped++;
    continue;
  }
  
  $processed++;
  $contextText = fetch_all_context($o);
  if (!$contextText) $contextText = "No web context found. Rely on your base training knowledge.";
  
  // Call AI
  echo "    Calling OpenRouter AI... ";
  $prompt = [
    "You are a Nigerian civic-tech analyst. Compile a Mandate Scorecard.",
    "Name: {$o['full_name']}",
    "Role: {$o['role']}",
    $o['state_code'] ? "State: {$o['state_code']}" : '',
    "Extract every trackable promise or campaign pledge. If context is empty, list known promises.",
    $contextText,
    "Return a JSON array with: promise_title (max 80 chars), promise_detail, promise_category (Infrastructure, Education, Health, Security, Economy, Governance, Agriculture, Technology, Other), measurability (high|medium|low), promise_source.",
    "ONLY RETURN JSON ARRAY."
  ];
  
  $aiRes = fetch_json("https://openrouter.ai/api/v1/chat/completions", 'POST', [
    'model' => $model,
    'temperature' => 0.2,
    'max_tokens' => 3000,
    'messages' => [
      ['role' => 'system', 'content' => 'Return only strict JSON. Extract at least 3-5 major promises if possible.'],
      ['role' => 'user', 'content' => implode("\n", $prompt)]
    ]
  ], [
    'Authorization' => "Bearer {$openrouterKey}",
    'Content-Type' => 'application/json'
  ]);
  
  if (!$aiRes['ok']) {
    echo "AI Error: " . ($aiRes['err'] ?? json_encode($aiRes['json'])) . "\n";
    continue;
  }
  
  $content = $aiRes['json']['choices'][0]['message']['content'] ?? '[]';
  // Strip markdown fences if present
  $content = preg_replace('/^```json\s*|```\s*$/i', '', trim($content));
  $parsed = json_decode($content, true);
  
  if (!is_array($parsed)) {
    echo "Error parsing JSON from AI.\n";
    continue;
  }
  
  if (count($parsed) === 0) {
    echo "No promises found by AI.\n";
    continue;
  }
  
  // Insert into DB
  $rows = [];
  foreach ($parsed as $p) {
    if (empty($p['promise_title'])) continue;
    $rows[] = [
      'official_id' => $o['id'],
      'promise_title' => trim(substr($p['promise_title'], 0, 80)),
      'promise_detail' => trim($p['promise_detail'] ?? ''),
      'promise_category' => trim($p['promise_category'] ?? 'Other'),
      'status' => 'pending',
      'progress_percent' => 0,
      'promise_source' => $p['promise_source'] ?? 'other',
      'verified_by' => 'ai_agent'
    ];
  }
  
  if (!empty($rows)) {
    $insertRes = fetch_json("{$supabaseUrl}/rest/v1/official_promises", 'POST', $rows, $supaHeaders);
    if ($insertRes['ok']) {
      echo "    -> SUCCESS! Saved " . count($rows) . " promises.\n";
      $imported += count($rows);
    } else {
      echo "    -> DB Insert Error: " . json_encode($insertRes['json']) . "\n";
    }
  }
  
  // Rate limiting pause
  sleep(2);
}

echo "\n=========================================================\n";
echo "FINISHED BACKGROUND RUN\n";
echo "Officials Processed: {$processed}\n";
echo "Officials Skipped:   {$skipped}\n";
echo "Total Promises Saved: {$imported}\n";
echo "=========================================================\n";
