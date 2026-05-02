<?php
/**
 * AI SENTIMENT ANALYSIS ENGINE
 * Analyzes citizen reviews to generate a sentiment summary and priority tagging.
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
if (is_file($secretsPath)) $secrets = require $secretsPath;

$supabaseUrl  = (string)($secrets['SUPABASE_URL'] ?? getenv('SUPABASE_URL'));
$supabaseAnon = (string)($secrets['SUPABASE_ANON_KEY'] ?? getenv('SUPABASE_ANON_KEY'));
$openrouterKey = (string)($secrets['OPENROUTER_API_KEY'] ?? getenv('OPENROUTER_API_KEY'));

if (!$supabaseUrl || !$supabaseAnon || !$openrouterKey) {
  mc_json(500, ['error' => 'Server secrets not configured']);
}

$token = mc_read_bearer();
if ($token === '') mc_json(401, ['error' => 'Missing Authorization token']);

// ── PAYLOAD ───────────────────────────────────────────
$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
$officialId = $payload['official_id'] ?? '';
$officialName = $payload['official_name'] ?? '';

if (!$officialId) mc_json(400, ['error' => 'official_id is required']);

// ── FETCH REVIEWS ─────────────────────────────────────
$ctx = stream_context_create(['http' => [
  'method' => 'GET', 'timeout' => 10,
  'header' => "apikey: {$supabaseAnon}\r\nAuthorization: Bearer {$token}\r\nAccept: application/json",
]]);
$reviewUrl = rtrim($supabaseUrl, '/') . "/rest/v1/ratings?official_id=eq.{$officialId}&select=review_text,overall&review_text=not.is.null&limit=20";
$reviewRaw = @file_get_contents($reviewUrl, false, $ctx);
$reviews = $reviewRaw ? json_decode((string)$reviewRaw, true) : [];

if (empty($reviews)) {
  mc_json(200, ['ok' => true, 'sentiment' => 'neutral', 'summary' => 'Not enough written reviews to analyze yet.']);
}

// ── AI ANALYSIS ───────────────────────────────────────
$reviewText = implode("\n---\n", array_map(fn($r) => "[Score: {$r['overall']}/5] {$r['review_text']}", $reviews));

$prompt = [
  "You are a political sentiment analyst. Analyze these citizen reviews for '{$officialName}':",
  "",
  $reviewText,
  "",
  "Return a JSON object with:",
  "- sentiment_score: (number 0-100, where 100 is extremely positive)",
  "- primary_concerns: (array of top 3 things people are complaining about)",
  "- key_strengths: (array of top 2 things people like)",
  "- executive_summary: (2 sentences summarizing the public mood)",
  "Return ONLY JSON."
];

$chAi = curl_init();
curl_setopt($chAi, CURLOPT_URL, "https://openrouter.ai/api/v1/chat/completions");
curl_setopt($chAi, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAi, CURLOPT_POST, true);
curl_setopt($chAi, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$openrouterKey}", "Content-Type: application/json"]);
curl_setopt($chAi, CURLOPT_POSTFIELDS, json_encode([
  'model' => $secrets['OPENROUTER_MODEL'] ?? 'openai/gpt-4o-mini',
  'messages' => [['role' => 'user', 'content' => implode("\n", $prompt)]]
]));

$aiRaw = curl_exec($chAi);
curl_close($chAi);

if (!$aiRaw) mc_json(500, ['error' => 'AI analysis failed']);
$aiJson = json_decode((string)$aiRaw, true);
$content = $aiJson['choices'][0]['message']['content'] ?? '{}';
$content = preg_replace('/^```json\s*|```\s*$/i', '', trim($content));
$parsed = json_decode($content, true);

mc_json(200, ['ok' => true, 'analysis' => $parsed]);
