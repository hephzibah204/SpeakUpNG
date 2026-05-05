<?php
/**
 * evote.ng AUTONOMOUS BOT
 * A hands-free background agent that monitors news, creates officials, and publishes articles.
 *
 * Usage: php scripts/autonomous_bot.php
 * Requires: config/secrets.php with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY
 */
declare(strict_types=1);

if (php_sapi_name() !== 'cli') die("CLI only.\n");

echo "=========================================================\n";
echo "  🤖 evote.ng AUTONOMOUS BOT - ENGAGED\n";
echo "=========================================================\n\n";

$secretsPath = __DIR__ . '/../config/secrets.php';
if (!is_file($secretsPath)) die("Error: secrets.php missing.\n");
$secrets = require $secretsPath;

$supabaseUrl   = rtrim((string)($secrets['SUPABASE_URL'] ?? ''), '/');
$serviceKey    = (string)($secrets['SUPABASE_SERVICE_ROLE_KEY'] ?? '');
$openrouterKey = (string)($secrets['OPENROUTER_API_KEY'] ?? '');
$model         = (string)($secrets['OPENROUTER_MODEL'] ?? 'openai/gpt-4o-mini');

if (!$supabaseUrl || !$serviceKey || !$openrouterKey) {
  die("Error: Missing credentials in secrets.php (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY required).\n");
}

// ── HTTP HELPERS ─────────────────────────────────────
function supa_req(string $method, string $path, $body = null): ?array {
  global $supabaseUrl, $serviceKey;
  $ch = curl_init("{$supabaseUrl}/rest/v1/{$path}");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
  curl_setopt($ch, CURLOPT_TIMEOUT, 30);
  $headers = [
    'apikey: ' . $serviceKey,
    'Authorization: Bearer ' . $serviceKey,
    'Content-Type: application/json',
    'Prefer: return=representation',
  ];
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
  $res = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($res === false) {
    echo "    HTTP Error: {$err}\n";
    return null;
  }
  $json = json_decode((string)$res, true);
  if ($code < 200 || $code >= 300) {
    echo "    API Error (HTTP {$code}): " . substr((string)$res, 0, 200) . "\n";
  }
  return is_array($json) ? $json : null;
}

function ai_chat(string $systemPrompt, string $userPrompt): string {
  global $openrouterKey, $model;
  $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, 60);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $openrouterKey,
    'Content-Type: application/json',
    'HTTP-Referer: https://evote.ng',
    'X-Title: evote.ng Autonomous Bot',
  ]);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'model' => $model,
    'messages' => [
      ['role' => 'system', 'content' => $systemPrompt],
      ['role' => 'user', 'content' => $userPrompt],
    ],
    'temperature' => 0.2,
    'max_tokens' => 2000,
  ]));
  $resp = curl_exec($ch);
  curl_close($ch);
  if (!$resp) return '';
  $json = json_decode((string)$resp, true);
  return trim((string)($json['choices'][0]['message']['content'] ?? ''));
}

function fetch_news_context(): string {
  // Use approved news items from Supabase instead of scraping Google
  $items = supa_req('GET', 'news_items?select=title,summary,url&moderation_status=eq.approved&is_politics=eq.true&order=published_at.desc&limit=30');
  if (!is_array($items) || empty($items)) return '';
  $context = '';
  foreach ($items as $it) {
    $title = trim((string)($it['title'] ?? ''));
    $summary = trim((string)($it['summary'] ?? ''));
    $url = trim((string)($it['url'] ?? ''));
    if ($title) $context .= "- {$title}";
    if ($summary) $context .= ": {$summary}";
    if ($url) $context .= " ({$url})";
    $context .= "\n";
  }
  return $context;
}

// ── STEP 1: MONITOR & DISCOVER ──────────────────────────
echo "Fetching recent approved news for government changes...\n";
$newsContext = fetch_news_context();
if (!$newsContext) {
  echo "No approved news items found. Run the news ingest first.\n";
  echo "Autonomous Cycle Finished (no data).\n";
  exit(0);
}

// ── STEP 2: AI EXTRACTION ──────────────────────────────
echo "AI analyzing news for government personnel changes...\n";
$prompt = "Based on these recent Nigerian news items, identify any NEW government appointments, removals, or changes.\n\n" .
  $newsContext . "\n\n" .
  "Return a JSON array of objects with:\n" .
  "- name: Full name of the person\n" .
  "- role: New role or position\n" .
  "- type: 'appointed' | 'removed' | 'resigned' | 'died' | 'suspended' | 'impeached'\n" .
  "- news_headline: The actual news headline\n" .
  "- source_url: The news source URL if available\n" .
  "If no clear changes are found, return []. ONLY return the JSON array.";

$content = ai_chat('You are a Nigerian governance analyst. Return only strict JSON.', $prompt);
$content = preg_replace('/^```json\s*|```\s*$/i', '', trim($content));
$changes = json_decode($content, true) ?: [];

echo "Found " . count($changes) . " potential updates.\n";

$alertsCreated = 0;
$officialsCreated = 0;

foreach ($changes as $c) {
  if (!is_array($c) || empty($c['name'])) continue;
  echo "\nProcessing: {$c['name']} ({$c['role'] ?? 'unknown role'})...\n";

  // ── STEP 3: SAVE AS ALERT ────────────────────────
  $alert = [
    'official_name' => $c['name'],
    'new_role'      => $c['role'] ?? 'Unknown',
    'change_type'   => $c['type'] ?? 'appointed',
    'source'        => $c['source_url'] ?? null,
    'headline'      => $c['news_headline'] ?? null,
    'confidence'    => 'medium',
    'is_processed'  => false,
  ];
  $saved = supa_req('POST', 'news_alerts', $alert);
  if ($saved !== null) {
    echo "  ✓ Alert saved.\n";
    $alertsCreated++;
  }

  // ── STEP 4: AUTO-CREATE OFFICIAL (if appointed) ──
  if (($c['type'] ?? '') === 'appointed') {
    $exists = supa_req('GET', 'officials?full_name=eq.' . urlencode($c['name']) . '&limit=1');
    if (is_array($exists) && empty($exists)) {
      echo "  Creating new official profile...\n";

      // Generate a brief bio via AI
      $bioPrompt = "Write a 2-sentence professional biography for {$c['name']}, who was recently appointed as {$c['role']} in Nigeria. Be factual and concise.";
      $bio = ai_chat('You are a Nigerian civic-tech writer.', $bioPrompt);
      if (!$bio) $bio = "Recently appointed as {$c['role']}. Profile data being gathered.";

      $newOff = [
        'full_name' => $c['name'],
        'role'      => $c['role'] ?? 'Government Official',
        'bio'       => $bio,
        'status'    => 'active',
      ];
      $created = supa_req('POST', 'officials', $newOff);
      if ($created !== null) {
        echo "  ✓ Official profile created.\n";
        $officialsCreated++;
      }
    } else {
      echo "  - Official already exists in database.\n";
    }
  }

  // Rate limiting pause
  sleep(2);
}

echo "\n=========================================================\n";
echo "AUTONOMOUS CYCLE FINISHED\n";
echo "Changes Found:     " . count($changes) . "\n";
echo "Alerts Created:    {$alertsCreated}\n";
echo "Officials Created: {$officialsCreated}\n";
echo "=========================================================\n";
