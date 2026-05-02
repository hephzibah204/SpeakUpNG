<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function mc_json(int $status, array $payload): void {
  http_response_code($status);
  echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

function mc_env(string $key): string {
  $v = getenv($key);
  return $v === false ? '' : (string)$v;
}

function mc_load_secrets(): array {
  $path = __DIR__ . '/../config/secrets.php';
  if (is_file($path)) {
    $data = require $path;
    if (is_array($data)) return $data;
  }
  return [];
}

function mc_read_bearer(): string {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$hdr) return '';
  if (preg_match('/^Bearer\s+(.+)$/i', $hdr, $m)) return trim($m[1]);
  return '';
}

/**
 * Fetch a URL and return raw text, stripping HTML tags.
 * Returns empty string on failure.
 */
function mc_fetch_text(string $url, int $timeoutSec = 12): string {
  $userAgent = 'Mozilla/5.0 (compatible; evote.ng-bot/1.0; +https://evote.ng)';

  if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSec);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 4);
    curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: text/html,application/xhtml+xml,*/*']);
    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($resp === false || $code < 200 || $code >= 400) return '';
    return (string)$resp;
  }

  $ctx = stream_context_create(['http' => [
    'method'  => 'GET',
    'timeout' => $timeoutSec,
    'header'  => "User-Agent: {$userAgent}\r\nAccept: text/html,*/*",
    'ignore_errors' => true,
  ]]);
  $resp = @file_get_contents($url, false, $ctx);
  return $resp !== false ? (string)$resp : '';
}

/**
 * Strip HTML and collapse whitespace to at most ~$maxChars chars.
 */
function mc_clean(string $html, int $maxChars = 4000): string {
  // Remove script/style blocks
  $text = preg_replace('#<(script|style|noscript)[^>]*>.*?</\1>#si', ' ', $html) ?? $html;
  // Remove all tags
  $text = strip_tags((string)$text);
  // Collapse whitespace
  $text = (string)preg_replace('/\s{2,}/', ' ', $text);
  $text = trim((string)$text);
  if (mb_strlen($text) > $maxChars) {
    $text = mb_substr($text, 0, $maxChars) . '…';
  }
  return $text;
}

/**
 * Fetch Wikipedia extract for a person's name.
 */
function mc_fetch_wikipedia(string $name): string {
  $q   = urlencode($name);
  $url = "https://en.wikipedia.org/w/api.php?action=query&titles={$q}&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json";
  $raw = mc_fetch_text($url, 10);
  if (!$raw) return '';
  $data = json_decode($raw, true);
  if (!is_array($data)) return '';
  $pages = $data['query']['pages'] ?? [];
  foreach ($pages as $page) {
    if (!empty($page['extract'])) {
      return mb_substr(trim((string)$page['extract']), 0, 3000);
    }
  }
  return '';
}

/**
 * Fetch a search-result snippet from manifesto.ng
 */
function mc_fetch_manifesto_ng(string $name): string {
  $q   = urlencode($name . ' Nigeria');
  $url = "https://manifesto.ng/?s={$q}";
  $raw = mc_fetch_text($url, 10);
  return $raw ? mc_clean($raw, 2500) : '';
}

/**
 * Fetch from followthepromises.org
 */
function mc_fetch_follow_promises(string $name): string {
  $q   = urlencode($name);
  $url = "https://followthepromises.org/?s={$q}";
  $raw = mc_fetch_text($url, 10);
  return $raw ? mc_clean($raw, 2500) : '';
}

/**
 * Fetch from tracka.ng
 */
function mc_fetch_tracka(string $name): string {
  $q   = urlencode($name);
  $url = "https://tracka.ng/?s={$q}";
  $raw = mc_fetch_text($url, 10);
  return $raw ? mc_clean($raw, 2500) : '';
}

/**
 * Fetch from orderpaper.ng
 */
function mc_fetch_orderpaper(string $name): string {
  $q   = urlencode($name);
  $url = "https://orderpaper.ng/?s={$q}";
  $raw = mc_fetch_text($url, 10);
  return $raw ? mc_clean($raw, 2500) : '';
}

/**
 * Fetch from dataphyte.com
 */
function mc_fetch_dataphyte(string $name): string {
  $q   = urlencode($name);
  $url = "https://www.dataphyte.com/?s={$q}";
  $raw = mc_fetch_text($url, 10);
  return $raw ? mc_clean($raw, 2500) : '';
}

/**
 * Fetch from promisetracker.ng
 */
function mc_fetch_promise_tracker(string $name): string {
  $q   = urlencode($name);
  $url = "https://promisetracker.ng/?s={$q}";
  $raw = mc_fetch_text($url, 10);
  return $raw ? mc_clean($raw, 2500) : '';
}

/**
 * Fetch an official's personal / government website.
 */
function mc_fetch_official_website(string $website): string {
  if (!$website) return '';
  // Only allow http/https
  if (!preg_match('#^https?://#i', $website)) return '';
  $raw = mc_fetch_text($website, 12);
  return $raw ? mc_clean($raw, 3000) : '';
}

// ── AUTH ──────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  mc_json(405, ['error' => 'Method not allowed']);
}

$secrets    = mc_load_secrets();
$supabaseUrl  = (string)($secrets['SUPABASE_URL']  ?? '') ?: mc_env('SUPABASE_URL');
$supabaseAnon = (string)($secrets['SUPABASE_ANON_KEY'] ?? '') ?: mc_env('SUPABASE_ANON_KEY');
$adminEmails  = $secrets['ADMIN_EMAILS'] ?? [];

if ($supabaseUrl === '' || $supabaseAnon === '') {
  mc_json(500, ['error' => 'Supabase auth not configured']);
}

$token = mc_read_bearer();
if ($token === '') mc_json(401, ['error' => 'Missing Authorization bearer token']);

// Verify token against Supabase
$ctx = stream_context_create(['http' => [
  'method'        => 'GET',
  'timeout'       => 10,
  'header'        => "apikey: {$supabaseAnon}\r\nAuthorization: Bearer {$token}\r\nAccept: application/json",
  'ignore_errors' => true,
]]);
$userRaw = @file_get_contents(rtrim($supabaseUrl, '/') . '/auth/v1/user', false, $ctx);
$userJson = $userRaw ? json_decode((string)$userRaw, true) : null;
if (!is_array($userJson) || empty($userJson['email'])) {
  mc_json(401, ['error' => 'Invalid or expired session']);
}
$email = (string)$userJson['email'];
if (is_array($adminEmails) && count($adminEmails) > 0 && !in_array($email, $adminEmails, true)) {
  mc_json(403, ['error' => 'Forbidden']);
}

// ── REQUEST BODY ─────────────────────────────────────
$raw     = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($payload)) mc_json(400, ['error' => 'Invalid JSON body']);

$name    = trim((string)($payload['name']    ?? ''));
$role    = trim((string)($payload['role']    ?? ''));
$state   = trim((string)($payload['state']   ?? ''));
$website = trim((string)($payload['website'] ?? ''));

if ($name === '') mc_json(400, ['error' => 'name is required']);

// ── FETCH CONTEXTS IN PARALLEL (best-effort) ─────────
$contexts = [];

// 1. Wikipedia
$wikiText = mc_fetch_wikipedia($name);
if ($wikiText) {
  $contexts[] = ['source' => 'Wikipedia', 'text' => $wikiText];
}

// 2. manifesto.ng
$manifestoText = mc_fetch_manifesto_ng($name);
if ($manifestoText) {
  $contexts[] = ['source' => 'manifesto.ng', 'text' => $manifestoText];
}

// 3. promisetracker.ng
$ptText = mc_fetch_promise_tracker($name);
if ($ptText) {
  $contexts[] = ['source' => 'promisetracker.ng', 'text' => $ptText];
}

// 4. followthepromises.org
$ftpText = mc_fetch_follow_promises($name);
if ($ftpText) {
  $contexts[] = ['source' => 'followthepromises.org', 'text' => $ftpText];
}

// 5. tracka.ng
$trackaText = mc_fetch_tracka($name);
if ($trackaText) {
  $contexts[] = ['source' => 'tracka.ng', 'text' => $trackaText];
}

// 6. orderpaper.ng
$opText = mc_fetch_orderpaper($name);
if ($opText) {
  $contexts[] = ['source' => 'orderpaper.ng', 'text' => $opText];
}

// 7. dataphyte.com
$dpText = mc_fetch_dataphyte($name);
if ($dpText) {
  $contexts[] = ['source' => 'dataphyte.com', 'text' => $dpText];
}

// 8. Official personal / government website
if ($website) {
  $websiteText = mc_fetch_official_website($website);
  if ($websiteText) {
    $contexts[] = ['source' => 'Official Website', 'text' => $websiteText];
  }
}

// Always return results (even if all fetches failed — AI uses its training knowledge)
mc_json(200, [
  'name'     => $name,
  'role'     => $role,
  'state'    => $state,
  'contexts' => $contexts,
  'sources_fetched' => count($contexts),
]);
