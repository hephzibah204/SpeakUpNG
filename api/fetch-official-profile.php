<?php
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

function nr_load_secrets(): array {
  $path = __DIR__ . '/../config/secrets.php';
  if (is_file($path)) return require $path;
  return [];
}

// ── AUTH ──────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  mc_json(405, ['error' => 'Method not allowed']);
}

$secrets = nr_load_secrets();
$supabaseUrl  = (string)($secrets['SUPABASE_URL'] ?? getenv('SUPABASE_URL'));
$supabaseAnon = (string)($secrets['SUPABASE_ANON_KEY'] ?? getenv('SUPABASE_ANON_KEY'));

// Fallback to JS client config
if ($supabaseUrl === '' || $supabaseAnon === '') {
  $jsPath = __DIR__ . '/../js/supabase-client.js';
  if (is_file($jsPath)) {
    $rawJs = file_get_contents($jsPath);
    if ($rawJs !== false) {
      if (preg_match("/const\\s+SUPABASE_URL\\s*=\\s*'([^']+)'/m", $rawJs, $m)) $supabaseUrl = trim((string)$m[1]);
      if (preg_match("/const\\s+SUPABASE_ANON_KEY\\s*=\\s*'([^']+)'/m", $rawJs, $m)) $supabaseAnon = trim((string)$m[1]);
    }
  }
}

if ($supabaseUrl === '' || $supabaseAnon === '') mc_json(500, ['error' => 'Supabase auth not configured']);

$token = mc_read_bearer();
if ($token === '') mc_json(401, ['error' => 'Missing Authorization token']);

$ctx = stream_context_create(['http' => [
  'method' => 'GET', 'timeout' => 10,
  'header' => "apikey: {$supabaseAnon}\r\nAuthorization: Bearer {$token}\r\nAccept: application/json",
  'ignore_errors' => true,
]]);
$userRaw = @file_get_contents(rtrim($supabaseUrl, '/') . '/auth/v1/user', false, $ctx);
$userJson = $userRaw ? json_decode((string)$userRaw, true) : null;

if (!is_array($userJson) || empty($userJson['email'])) {
  mc_json(401, ['error' => 'Invalid or expired session']);
}

// ── PAYLOAD ───────────────────────────────────────────
$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
$name = trim((string)($payload['name'] ?? ''));

if ($name === '') mc_json(400, ['error' => 'Name is required']);

// ── WIKIPEDIA FETCH ───────────────────────────────────
$q = urlencode($name);
$wikiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles={$q}&prop=pageimages|extracts&pithumbsize=600&exintro=1&explaintext=1&redirects=1&format=json";

$userAgent = 'Mozilla/5.0 (compatible; evote.ng-bot/1.0; +https://evote.ng)';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $wikiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 8);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
$wikiRaw = curl_exec($ch);
curl_close($ch);

$wikiExtract = '';
$wikiImage = '';

if ($wikiRaw) {
  $wikiData = json_decode((string)$wikiRaw, true);
  if (is_array($wikiData) && !empty($wikiData['query']['pages'])) {
    foreach ($wikiData['query']['pages'] as $page) {
      if (!empty($page['extract'])) $wikiExtract = trim(mb_substr((string)$page['extract'], 0, 3000));
      if (!empty($page['thumbnail']['source'])) $wikiImage = trim((string)$page['thumbnail']['source']);
      break;
    }
  }
}

// ── OPENROUTER AI CHAT ────────────────────────────────
$openrouterKey = (string)($secrets['OPENROUTER_API_KEY'] ?? getenv('OPENROUTER_API_KEY'));
$model = (string)($secrets['OPENROUTER_MODEL'] ?? getenv('OPENROUTER_MODEL')) ?: 'openai/gpt-4o-mini';

if ($openrouterKey === '') {
  mc_json(500, ['error' => 'OpenRouter API key is not configured']);
}

$prompt = [
  "You are an AI assistant for a Nigerian civic-tech platform compiling profiles of government officials and agencies.",
  "Given the name '{$name}', return a JSON object with their profile.",
  "Wikipedia context (if available): " . ($wikiExtract ?: 'None found. Use your base knowledge.'),
  "",
  "Rules:",
  "1. Return ONLY valid JSON.",
  "2. Use this exact schema:",
  "  {",
  "    \"common_name\": \"Short familiar name (e.g., Tinubu instead of Bola Ahmed Tinubu)\",",
  "    \"party\": \"Current political party acronym (e.g. APC, PDP, LP), or null if non-partisan/agency\",",
  "    \"role\": \"Current formal title (e.g. Governor, Lagos State or Director General)\",",
  "    \"tier\": \"One of: federal_executive, federal_legislature, federal_judiciary, state_executive, state_legislature, local_government, federal_agency, state_agency, military_security\",",
  "    \"bio\": \"A comprehensive, SEO-optimized 3-4 paragraph biography. Include their background, recent key achievements, mandate, and what they are responsible for. Make it professional and civic-minded.\",",
  "    \"social_twitter\": \"Their Twitter handle without the @ (e.g. officialABAT), or null\",",
  "    \"website\": \"Official government or personal website URL, or null\",",
  "    \"office_start\": \"YYYY-MM-DD of when they assumed this specific office, or null\"",
  "  }"
];

$chAi = curl_init();
curl_setopt($chAi, CURLOPT_URL, "https://openrouter.ai/api/v1/chat/completions");
curl_setopt($chAi, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAi, CURLOPT_POST, true);
curl_setopt($chAi, CURLOPT_TIMEOUT, 20);
curl_setopt($chAi, CURLOPT_HTTPHEADER, [
  "Authorization: Bearer {$openrouterKey}",
  "Content-Type: application/json"
]);
curl_setopt($chAi, CURLOPT_POSTFIELDS, json_encode([
  'model' => $model,
  'temperature' => 0.2,
  'messages' => [
    ['role' => 'system', 'content' => 'Return ONLY valid JSON. No markdown, no explanations.'],
    ['role' => 'user', 'content' => implode("\n", $prompt)]
  ]
], JSON_UNESCAPED_UNICODE));

$aiRaw = curl_exec($chAi);
curl_close($chAi);

if (!$aiRaw) mc_json(500, ['error' => 'AI generation failed']);

$aiData = json_decode((string)$aiRaw, true);
$content = $aiData['choices'][0]['message']['content'] ?? '{}';
$content = preg_replace('/^```json\s*|```\s*$/i', '', trim($content));
$parsed = json_decode($content, true);

if (!is_array($parsed)) mc_json(500, ['error' => 'AI returned invalid JSON']);

// Inject the image found from Wikipedia if AI didn't provide one (the prompt didn't ask for one to avoid hallucinations, we just use Wiki's real image)
$parsed['photo_url'] = $wikiImage ?: null;

mc_json(200, ['ok' => true, 'profile' => $parsed]);
