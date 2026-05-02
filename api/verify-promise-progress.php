<?php
/**
 * AI PROMISE VERIFICATION ENGINE
 * Searches the web for updates on a specific promise and returns an AI evaluation.
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

// ── AUTH ──────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  mc_json(405, ['error' => 'Method not allowed']);
}

$secretsPath = __DIR__ . '/../config/secrets.php';
$secrets = [];
if (is_file($secretsPath)) {
  $secrets = require $secretsPath;
}

$supabaseUrl  = (string)($secrets['SUPABASE_URL'] ?? getenv('SUPABASE_URL'));
$supabaseAnon = (string)($secrets['SUPABASE_ANON_KEY'] ?? getenv('SUPABASE_ANON_KEY'));
$openrouterKey = (string)($secrets['OPENROUTER_API_KEY'] ?? getenv('OPENROUTER_API_KEY'));
$model = (string)($secrets['OPENROUTER_MODEL'] ?? getenv('OPENROUTER_MODEL')) ?: 'openai/gpt-4o-mini';

if (!$supabaseUrl || !$supabaseAnon) {
  mc_json(500, ['error' => 'Supabase auth not configured on server']);
}

$token = mc_read_bearer();
if ($token === '') mc_json(401, ['error' => 'Missing Authorization bearer token']);

// Verify token (Simple session check)
$ctx = stream_context_create(['http' => [
  'method'        => 'GET',
  'timeout'       => 10,
  'header'        => "apikey: {$supabaseAnon}\r\nAuthorization: Bearer {$token}\r\nAccept: application/json",
  'ignore_errors' => true,
]]);
$userRaw = @file_get_contents(rtrim((string)$supabaseUrl, '/') . '/auth/v1/user', false, $ctx);
if (!$userRaw) mc_json(401, ['error' => 'Invalid or expired session']);

// ── PAYLOAD ───────────────────────────────────────────
$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
$promiseId = $payload['promise_id'] ?? '';
$officialName = $payload['official_name'] ?? '';
$promiseTitle = $payload['promise_title'] ?? '';

if (!$promiseId || !$officialName || !$promiseTitle) {
  mc_json(400, ['error' => 'promise_id, official_name, and promise_title are required']);
}

// ── WEB SCRAPING ──────────────────────────────────────
function mc_fetch_text(string $url, int $timeoutSec = 10): string {
  $userAgent = 'Mozilla/5.0 (compatible; evote.ng-bot/1.0; +https://evote.ng)';
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSec);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  $resp = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($resp === false || $code < 200 || $code >= 400) return '';
  return (string)$resp;
}

function mc_clean(string $html, int $maxChars = 3000): string {
  $text = preg_replace('#<(script|style)[^>]*>.*?</\1>#si', ' ', $html) ?? $html;
  $text = strip_tags((string)$text);
  $text = (string)preg_replace('/\s{2,}/', ' ', $text);
  return mb_strlen($text) > $maxChars ? mb_substr($text, 0, $maxChars) . '…' : $text;
}

// Search queries
$queries = [
  "{$officialName} \"{$promiseTitle}\" update",
  "{$officialName} \"{$promiseTitle}\" commissioned",
  "{$officialName} \"{$promiseTitle}\" progress news"
];

$contexts = [];
foreach ($queries as $q) {
  // Use Google Search (simulated via news sites or direct search proxy if available)
  // For now, we hit generic search landing pages or news archives
  $url = "https://www.google.com/search?q=" . urlencode($q);
  $raw = mc_fetch_text($url);
  if ($raw) $contexts[] = "=== SEARCH RESULTS FOR: {$q} ===\n" . mc_clean($raw);
}

// ── AI EVALUATION ─────────────────────────────────────
$contextText = implode("\n\n", $contexts);
$prompt = [
  "You are a Nigerian civic-tech auditor. Evaluate the progress of this promise:",
  "Official: {$officialName}",
  "Promise: {$promiseTitle}",
  "",
  "Here are recent search results and web context:",
  $contextText,
  "",
  "Return a JSON object with:",
  "- suggested_status: [pending | in_progress | fulfilled | broken | disputed]",
  "- suggested_progress_percent: (number 0-100)",
  "- ai_summary: (2-3 sentences explaining the progress found)",
  "- evidence_url: (the most relevant news link found, or null)",
  "Return ONLY the JSON object."
];

$chAi = curl_init();
curl_setopt($chAi, CURLOPT_URL, "https://openrouter.ai/api/v1/chat/completions");
curl_setopt($chAi, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAi, CURLOPT_POST, true);
curl_setopt($chAi, CURLOPT_HTTPHEADER, [
  "Authorization: Bearer {$openrouterKey}",
  "Content-Type: application/json"
]);
curl_setopt($chAi, CURLOPT_POSTFIELDS, json_encode([
  'model' => $model,
  'messages' => [
    ['role' => 'system', 'content' => 'Return only strict JSON.'],
    ['role' => 'user', 'content' => implode("\n", $prompt)]
  ]
]));

$aiRaw = curl_exec($chAi);
curl_close($chAi);

if (!$aiRaw) mc_json(500, ['error' => 'AI evaluation failed']);
$aiJson = json_decode((string)$aiRaw, true);
$content = $aiJson['choices'][0]['message']['content'] ?? '{}';
$content = preg_replace('/^```json\s*|```\s*$/i', '', trim($content));
$parsed = json_decode($content, true);

if (!is_array($parsed)) mc_json(500, ['error' => 'AI returned invalid JSON']);

mc_json(200, ['ok' => true, 'verification' => $parsed]);
