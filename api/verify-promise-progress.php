<?php
/**
 * AI PROMISE VERIFICATION ENGINE
 * Searches approved news items + web sources for updates on a specific promise
 * and returns an AI evaluation.
 *
 * POST /api/verify-promise-progress.php
 * Body: { promise_id, official_name, promise_title }
 * Auth: Bearer token (Supabase session)
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function mc_json(int $status, array $payload): void {
  http_response_code($status);
  echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

function mc_read_bearer(): string {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$hdr) return '';
  if (preg_match('/^Bearer\s+(.+)$/i', $hdr, $m)) return trim($m[1]);
  return '';
}

function mc_http_json(string $url, string $method, array $headers, ?string $body, int $timeoutSec = 25): array {
  $hdrLines = [];
  foreach ($headers as $k => $v) $hdrLines[] = $k . ': ' . $v;
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
  curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSec);
  curl_setopt($ch, CURLOPT_HTTPHEADER, $hdrLines);
  if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
  $resp = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($resp === false) return ['ok' => false, 'code' => 0, 'json' => null, 'raw' => '', 'err' => $err ?: 'Request failed'];
  $json = json_decode((string)$resp, true);
  return ['ok' => $code >= 200 && $code < 300, 'code' => $code, 'json' => is_array($json) ? $json : null, 'raw' => (string)$resp];
}

// ── AUTH ──────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  mc_json(405, ['error' => 'Method not allowed']);
}

$secretsPath = __DIR__ . '/../config/secrets.php';
$secrets = [];
if (is_file($secretsPath)) {
  $data = require $secretsPath;
  if (is_array($data)) $secrets = $data;
}

$supabaseUrl   = (string)($secrets['SUPABASE_URL'] ?? getenv('SUPABASE_URL'));
$supabaseAnon  = (string)($secrets['SUPABASE_ANON_KEY'] ?? getenv('SUPABASE_ANON_KEY'));
$serviceKey    = (string)($secrets['SUPABASE_SERVICE_ROLE_KEY'] ?? getenv('SUPABASE_SERVICE_ROLE_KEY'));
$openrouterKey = (string)($secrets['OPENROUTER_API_KEY'] ?? getenv('OPENROUTER_API_KEY'));
$model         = (string)($secrets['OPENROUTER_MODEL'] ?? getenv('OPENROUTER_MODEL')) ?: 'openai/gpt-4o-mini';

if (!$supabaseUrl || !$supabaseAnon) {
  mc_json(500, ['error' => 'Supabase auth not configured on server']);
}

$token = mc_read_bearer();
if ($token === '') mc_json(401, ['error' => 'Missing Authorization bearer token']);

// Verify token
$userResp = mc_http_json(
  rtrim($supabaseUrl, '/') . '/auth/v1/user',
  'GET',
  ['apikey' => $supabaseAnon, 'Authorization' => 'Bearer ' . $token, 'Accept' => 'application/json'],
  null,
  12
);
if (!$userResp['ok'] || !is_array($userResp['json'])) {
  mc_json(401, ['error' => 'Invalid or expired session']);
}

// ── PAYLOAD ───────────────────────────────────────────
$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
$promiseId = (string)($payload['promise_id'] ?? '');
$officialName = (string)($payload['official_name'] ?? '');
$promiseTitle = (string)($payload['promise_title'] ?? '');

if (!$promiseId || !$officialName || !$promiseTitle) {
  mc_json(400, ['error' => 'promise_id, official_name, and promise_title are required']);
}

// ── EVIDENCE GATHERING ────────────────────────────────
// Strategy: Search our own approved news items + news profile matches for context
// This avoids Google scraping which gets blocked in production
$contexts = [];

// Source 1: Search our own news items for mentions of the official or promise
$useKey = $serviceKey !== '' ? $serviceKey : $supabaseAnon;
$searchTerms = urlencode($officialName);
$newsResp = mc_http_json(
  rtrim($supabaseUrl, '/') . '/rest/v1/news_items?select=title,summary,url,published_at&moderation_status=eq.approved&is_politics=eq.true&or=(title.ilike.*' . $searchTerms . '*,summary.ilike.*' . $searchTerms . '*)&order=published_at.desc&limit=15',
  'GET',
  ['apikey' => $useKey, 'Authorization' => 'Bearer ' . $useKey, 'Accept' => 'application/json'],
  null,
  15
);
if ($newsResp['ok'] && is_array($newsResp['json']) && count($newsResp['json'])) {
  $newsContext = "=== APPROVED NEWS ITEMS MENTIONING {$officialName} ===\n";
  foreach ($newsResp['json'] as $item) {
    $newsContext .= "- " . trim((string)($item['title'] ?? ''));
    if (!empty($item['summary'])) $newsContext .= ": " . trim((string)$item['summary']);
    if (!empty($item['url'])) $newsContext .= " (" . trim((string)$item['url']) . ")";
    if (!empty($item['published_at'])) $newsContext .= " [" . substr((string)$item['published_at'], 0, 10) . "]";
    $newsContext .= "\n";
  }
  $contexts[] = $newsContext;
}

// Source 2: Search news profile matches for this official
$matchResp = mc_http_json(
  rtrim($supabaseUrl, '/') . '/rest/v1/news_profile_matches?select=news_item_id,confidence,news_items(title,summary,url,published_at)&profile_type=eq.official&confidence=gte.0.7&order=created_at.desc&limit=10',
  'GET',
  ['apikey' => $useKey, 'Authorization' => 'Bearer ' . $useKey, 'Accept' => 'application/json'],
  null,
  15
);
if ($matchResp['ok'] && is_array($matchResp['json']) && count($matchResp['json'])) {
  $matchContext = "=== NEWS ITEMS MATCHED TO OFFICIAL PROFILE ===\n";
  foreach ($matchResp['json'] as $match) {
    $ni = $match['news_items'] ?? [];
    if (!is_array($ni) || empty($ni['title'])) continue;
    $matchContext .= "- " . trim((string)$ni['title']);
    if (!empty($ni['summary'])) $matchContext .= ": " . trim((string)$ni['summary']);
    if (!empty($ni['url'])) $matchContext .= " (" . trim((string)$ni['url']) . ")";
    $matchContext .= " [conf: " . round((float)($match['confidence'] ?? 0), 2) . "]\n";
  }
  $contexts[] = $matchContext;
}

// Source 3: Fetch Wikipedia for background context (reliable, not blocked)
$wikiQuery = urlencode($officialName);
$wikiResp = mc_http_json(
  "https://en.wikipedia.org/w/api.php?action=query&titles={$wikiQuery}&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json",
  'GET',
  ['Accept' => 'application/json', 'User-Agent' => 'evote.ng-bot/1.0 (+https://evote.ng)'],
  null,
  10
);
if ($wikiResp['ok'] && is_array($wikiResp['json'])) {
  $pages = $wikiResp['json']['query']['pages'] ?? [];
  foreach ($pages as $page) {
    $extract = trim((string)($page['extract'] ?? ''));
    if ($extract !== '' && strlen($extract) > 50) {
      $contexts[] = "=== WIKIPEDIA: {$officialName} ===\n" . mb_substr($extract, 0, 2000);
      break;
    }
  }
}

$contextText = implode("\n\n", $contexts);
if (!$contextText) {
  $contextText = "No web context found for {$officialName}. Use your training knowledge about Nigerian governance.";
}

// ── AI EVALUATION ─────────────────────────────────────
if (!$openrouterKey) {
  mc_json(500, ['error' => 'OpenRouter API key not configured']);
}

$prompt = implode("\n", [
  "You are a Nigerian civic-tech auditor. Evaluate the progress of this promise:",
  "Official: {$officialName}",
  "Promise: {$promiseTitle}",
  "",
  "Here is relevant context from news and public sources:",
  $contextText,
  "",
  "Return a JSON object with:",
  "- suggested_status: [pending | in_progress | fulfilled | broken | disputed]",
  "- suggested_progress_percent: (number 0-100)",
  "- ai_summary: (2-3 sentences explaining the progress found)",
  "- evidence_url: (the most relevant news link found, or null)",
  "Return ONLY the JSON object.",
]);

$aiResp = mc_http_json(
  'https://openrouter.ai/api/v1/chat/completions',
  'POST',
  [
    'Authorization' => 'Bearer ' . $openrouterKey,
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'HTTP-Referer' => 'https://evote.ng',
    'X-Title' => 'evote.ng Promise Verification',
  ],
  json_encode([
    'model' => $model,
    'messages' => [
      ['role' => 'system', 'content' => 'Return only strict JSON.'],
      ['role' => 'user', 'content' => $prompt],
    ],
    'temperature' => 0.2,
    'max_tokens' => 400,
  ]),
  40
);

if (!$aiResp['ok'] || !is_array($aiResp['json'])) {
  mc_json(500, ['error' => 'AI evaluation failed']);
}

$content = (string)($aiResp['json']['choices'][0]['message']['content'] ?? '{}');
$content = preg_replace('/^```json\s*|```\s*$/i', '', trim($content));
$parsed = json_decode($content, true);

if (!is_array($parsed)) mc_json(500, ['error' => 'AI returned invalid JSON']);

mc_json(200, ['ok' => true, 'verification' => $parsed]);
