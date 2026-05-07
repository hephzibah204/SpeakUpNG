<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function nr_json(int $status, array $payload): void {
  http_response_code($status);
  echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

function nr_env(string $key): string {
  $v = getenv($key);
  return $v === false ? '' : (string)$v;
}

function nr_load_secrets(): array {
  $path = __DIR__ . '/../config/secrets.php';
  if (is_file($path)) {
    $data = require $path;
    if (is_array($data)) return $data;
  }
  return [];
}

function nr_read_bearer(): string {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$hdr) return '';
  if (preg_match('/^Bearer\s+(.+)$/i', $hdr, $m)) return trim($m[1]);
  return '';
}

function nr_http_raw(string $url, string $method, array $headers, ?string $body, int $timeoutSec = 20): array {
  $hdrLines = [];
  foreach ($headers as $k => $v) $hdrLines[] = $k . ': ' . $v;

  if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSec);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $hdrLines);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($resp === false) return ['ok' => false, 'code' => 0, 'raw' => '', 'err' => $err ?: 'Request failed'];
    return ['ok' => $code >= 200 && $code < 300, 'code' => $code, 'raw' => (string)$resp];
  }

  $ctx = stream_context_create([
    'http' => [
      'method' => $method,
      'timeout' => $timeoutSec,
      'header' => implode("\r\n", $hdrLines),
      'content' => $body ?? '',
      'ignore_errors' => true,
    ],
  ]);
  $resp = @file_get_contents($url, false, $ctx);
  $code = 0;
  if (isset($http_response_header) && is_array($http_response_header)) {
    foreach ($http_response_header as $h) {
      if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) { $code = (int)$m[1]; break; }
    }
  }
  if ($resp === false) return ['ok' => false, 'code' => $code, 'raw' => '', 'err' => 'Request failed'];
  return ['ok' => $code >= 200 && $code < 300, 'code' => $code, 'raw' => (string)$resp];
}

function nr_http_json(string $url, string $method, array $headers, ?array $body, int $timeoutSec = 20): array {
  $payload = null;
  if ($body !== null) $payload = json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  $res = nr_http_raw($url, $method, $headers, $payload, $timeoutSec);
  $json = null;
  if ($res['raw'] !== '') {
    $decoded = json_decode($res['raw'], true);
    if (is_array($decoded)) $json = $decoded;
  }
  return ['ok' => $res['ok'], 'code' => $res['code'], 'json' => $json, 'raw' => $res['raw'], 'err' => $res['err'] ?? null];
}

function nr_supabase_cfg(): array {
  $secrets = nr_load_secrets();
  $url = (string)($secrets['SUPABASE_URL'] ?? '') ?: nr_env('SUPABASE_URL');
  $anon = (string)($secrets['SUPABASE_ANON_KEY'] ?? '') ?: nr_env('SUPABASE_ANON_KEY');
  $service = (string)($secrets['SUPABASE_SERVICE_ROLE_KEY'] ?? '') ?: nr_env('SUPABASE_SERVICE_ROLE_KEY');
  return ['url' => $url, 'anon' => $anon, 'service' => $service, 'admin_emails' => $secrets['ADMIN_EMAILS'] ?? []];
}

function nr_require_admin(): array {
  $token = nr_read_bearer();
  if ($token === '') nr_json(401, ['ok' => false, 'error' => 'Missing Authorization bearer token']);

  $cfg = nr_supabase_cfg();
  if ($cfg['url'] === '' || $cfg['anon'] === '') nr_json(500, ['ok' => false, 'error' => 'Supabase auth validation is not configured on the server']);

  $userResp = nr_http_json(rtrim($cfg['url'], '/') . '/auth/v1/user', 'GET', [
    'apikey' => $cfg['anon'],
    'Authorization' => 'Bearer ' . $token,
    'Accept' => 'application/json',
  ], null, 12);
  if (!$userResp['ok'] || !is_array($userResp['json'])) nr_json(401, ['ok' => false, 'error' => 'Invalid or expired session']);

  $email = (string)($userResp['json']['email'] ?? '');
  $admins = $cfg['admin_emails'];
  if (is_array($admins) && count($admins) > 0 && $email !== '' && !in_array($email, $admins, true)) nr_json(403, ['ok' => false, 'error' => 'Forbidden']);
  return ['email' => $email];
}

function sb_rest(string $path, string $method, array $headers, $body): array {
  $cfg = nr_supabase_cfg();
  if ($cfg['url'] === '' || $cfg['service'] === '') nr_json(500, ['ok' => false, 'error' => 'Supabase service role is not configured']);
  $url = rtrim($cfg['url'], '/') . '/rest/v1' . $path;
  $hdr = array_merge([
    'apikey' => $cfg['service'],
    'Authorization' => 'Bearer ' . $cfg['service'],
    'Accept' => 'application/json',
  ], $headers);
  $payload = null;
  if ($body !== null) $payload = json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  $res = nr_http_raw($url, $method, $hdr, $payload, 35);
  $json = null;
  if ($res['raw'] !== '') {
    $decoded = json_decode($res['raw'], true);
    if (is_array($decoded)) $json = $decoded;
  }
  return ['ok' => $res['ok'], 'code' => $res['code'], 'json' => $json, 'raw' => $res['raw'], 'err' => $res['err'] ?? null];
}

function nr_clean_bio(string $t, int $maxChars): string {
  $t = trim(preg_replace('/\s+/', ' ', $t) ?? $t);
  if ($t === '') return '';
  if (mb_strlen($t, 'UTF-8') <= $maxChars) return $t;
  return rtrim(mb_substr($t, 0, $maxChars, 'UTF-8'));
}

function nr_wiki_summary(string $name): array {
  $url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' . rawurlencode($name);
  return nr_http_json($url, 'GET', [
    'Accept' => 'application/json',
    'User-Agent' => 'evote.ng-repair/1.0',
  ], null, 18);
}

function nr_wiki_extract_and_image(string $title, int $exChars): array {
  $qs = http_build_query([
    'action' => 'query',
    'format' => 'json',
    'redirects' => 1,
    'prop' => 'extracts|pageimages',
    'explaintext' => 1,
    'exsectionformat' => 'plain',
    'exchars' => $exChars,
    'piprop' => 'thumbnail',
    'pithumbsize' => 900,
    'titles' => $title,
  ]);
  $url = 'https://en.wikipedia.org/w/api.php?' . $qs;
  return nr_http_json($url, 'GET', [
    'Accept' => 'application/json',
    'User-Agent' => 'evote.ng-repair/1.0',
  ], null, 22);
}

function nr_extract_first_page(array $json): array {
  $pages = $json['query']['pages'] ?? null;
  if (!is_array($pages)) return ['extract' => '', 'thumb' => ''];
  foreach ($pages as $p) {
    if (!is_array($p)) continue;
    $ex = is_string($p['extract'] ?? null) ? (string)$p['extract'] : '';
    $thumb = '';
    if (isset($p['thumbnail']['source']) && is_string($p['thumbnail']['source'])) $thumb = trim((string)$p['thumbnail']['source']);
    return ['extract' => $ex, 'thumb' => $thumb];
  }
  return ['extract' => '', 'thumb' => ''];
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'POST') nr_json(405, ['ok' => false, 'error' => 'Method not allowed']);

nr_require_admin();

$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($payload)) nr_json(400, ['ok' => false, 'error' => 'Invalid JSON body']);

$officialId = isset($payload['official_id']) && is_string($payload['official_id']) ? trim($payload['official_id']) : '';
$name = isset($payload['name']) && is_string($payload['name']) ? trim($payload['name']) : '';
$minBio = isset($payload['min_bio_chars']) ? (int)$payload['min_bio_chars'] : 180;
$minProfileBio = isset($payload['min_profile_bio_chars']) ? (int)$payload['min_profile_bio_chars'] : 450;

if ($officialId === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $officialId)) nr_json(400, ['ok' => false, 'error' => 'Invalid official_id']);
if ($name === '') nr_json(400, ['ok' => false, 'error' => 'Missing name']);

$current = sb_rest('/officials?select=id,full_name,bio,profile_bio,photo_url&limit=1&id=eq.' . rawurlencode($officialId), 'GET', [], null);
if (!$current['ok'] || !is_array($current['json']) || !count($current['json'])) nr_json(404, ['ok' => false, 'error' => 'Official not found']);
$cur = $current['json'][0];

$curBio = is_string($cur['bio'] ?? null) ? trim((string)$cur['bio']) : '';
$curProfileBio = is_string($cur['profile_bio'] ?? null) ? trim((string)$cur['profile_bio']) : '';
$curPhoto = is_string($cur['photo_url'] ?? null) ? trim((string)$cur['photo_url']) : '';

$needsBio = ($curBio === '' || mb_strlen($curBio, 'UTF-8') < $minBio);
$needsProfileBio = ($curProfileBio === '' || mb_strlen($curProfileBio, 'UTF-8') < $minProfileBio);
$needsPhoto = ($curPhoto === '');
if (!$needsBio && !$needsProfileBio && !$needsPhoto) {
  nr_json(200, ['ok' => true, 'updated' => false, 'message' => 'Already healthy']);
}

$sum = nr_wiki_summary($name);
if (!$sum['ok'] || !is_array($sum['json'])) nr_json(200, ['ok' => true, 'updated' => false, 'message' => 'No Wikipedia summary found']);
$sumJson = $sum['json'];
$wikiTitle = is_string($sumJson['title'] ?? null) ? trim((string)$sumJson['title']) : $name;
$short = is_string($sumJson['extract'] ?? null) ? trim((string)$sumJson['extract']) : '';

$long = '';
$thumb = '';
if ($needsProfileBio || $needsPhoto) {
  $full = nr_wiki_extract_and_image($wikiTitle !== '' ? $wikiTitle : $name, 4500);
  if ($full['ok'] && is_array($full['json'])) {
    $picked = nr_extract_first_page($full['json']);
    $long = $picked['extract'] ?? '';
    $thumb = $picked['thumb'] ?? '';
  }
}

$updates = [];
if ($needsBio && $short !== '') $updates['bio'] = nr_clean_bio($short, 1200);
if ($needsProfileBio) {
  $candidate = $long !== '' ? $long : $short;
  if ($candidate !== '') $updates['profile_bio'] = nr_clean_bio($candidate, 4500);
}
if ($needsPhoto) {
  $p = '';
  if (isset($sumJson['thumbnail']['source']) && is_string($sumJson['thumbnail']['source'])) $p = trim((string)$sumJson['thumbnail']['source']);
  if ($p === '' && $thumb !== '') $p = $thumb;
  if ($p !== '') $updates['photo_url'] = $p;
}

if (!count($updates)) nr_json(200, ['ok' => true, 'updated' => false, 'message' => 'No usable data found']);

$patch = sb_rest('/officials?id=eq.' . rawurlencode($officialId), 'PATCH', [
  'Content-Type' => 'application/json',
  'Prefer' => 'return=representation',
], [$updates]);
if (!$patch['ok'] || !is_array($patch['json']) || !count($patch['json'])) nr_json(500, ['ok' => false, 'error' => 'Update failed', 'details' => $patch['raw'] ?? null]);

nr_json(200, ['ok' => true, 'updated' => true, 'official' => $patch['json'][0]]);

