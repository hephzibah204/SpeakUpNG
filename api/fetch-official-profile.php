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

function nr_http_json(string $url, string $method, array $headers, ?array $body, int $timeoutSec = 20): array {
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
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    $resp = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($resp === false) return ['ok' => false, 'code' => 0, 'json' => null, 'err' => $err ?: 'Request failed'];
    $json = json_decode((string)$resp, true);
    return ['ok' => $code >= 200 && $code < 300, 'code' => $code, 'json' => is_array($json) ? $json : null, 'raw' => (string)$resp];
  }

  $context = stream_context_create([
    'http' => [
      'method' => $method,
      'timeout' => $timeoutSec,
      'header' => implode("\r\n", $hdrLines),
      'content' => $body !== null ? json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : '',
      'ignore_errors' => true,
    ],
  ]);
  $resp = @file_get_contents($url, false, $context);
  $code = 0;
  if (isset($http_response_header) && is_array($http_response_header)) {
    foreach ($http_response_header as $h) {
      if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) { $code = (int)$m[1]; break; }
    }
  }
  if ($resp === false) return ['ok' => false, 'code' => $code, 'json' => null, 'err' => 'Request failed'];
  $json = json_decode((string)$resp, true);
  return ['ok' => $code >= 200 && $code < 300, 'code' => $code, 'json' => is_array($json) ? $json : null, 'raw' => (string)$resp];
}

function nr_require_admin(): array {
  $token = nr_read_bearer();
  if ($token === '') nr_json(401, ['ok' => false, 'error' => 'Missing Authorization bearer token']);

  $secrets = nr_load_secrets();
  $supabaseUrl = (string)($secrets['SUPABASE_URL'] ?? '') ?: nr_env('SUPABASE_URL');
  $supabaseAnon = (string)($secrets['SUPABASE_ANON_KEY'] ?? '') ?: nr_env('SUPABASE_ANON_KEY');
  if ($supabaseUrl === '' || $supabaseAnon === '') nr_json(500, ['ok' => false, 'error' => 'Supabase auth validation is not configured on the server']);

  $userResp = nr_http_json(rtrim($supabaseUrl, '/') . '/auth/v1/user', 'GET', [
    'apikey' => $supabaseAnon,
    'Authorization' => 'Bearer ' . $token,
    'Accept' => 'application/json',
  ], null, 12);
  if (!$userResp['ok'] || !is_array($userResp['json'])) nr_json(401, ['ok' => false, 'error' => 'Invalid or expired session']);

  $email = (string)($userResp['json']['email'] ?? '');
  $adminEmails = $secrets['ADMIN_EMAILS'] ?? [];
  if (is_array($adminEmails) && count($adminEmails) > 0 && $email !== '' && !in_array($email, $adminEmails, true)) {
    nr_json(403, ['ok' => false, 'error' => 'Forbidden']);
  }
  return ['email' => $email];
}

function nr_claim_string(array $entity, string $pid): string {
  $claims = $entity['claims'][$pid] ?? null;
  if (!is_array($claims) || !isset($claims[0]['mainsnak']['datavalue']['value'])) return '';
  $v = $claims[0]['mainsnak']['datavalue']['value'];
  return is_string($v) ? trim($v) : '';
}

function nr_claim_time_ymd(array $entity, string $pid): string {
  $claims = $entity['claims'][$pid] ?? null;
  if (!is_array($claims) || !isset($claims[0]['mainsnak']['datavalue']['value']['time'])) return '';
  $t = (string)($claims[0]['mainsnak']['datavalue']['value']['time'] ?? '');
  if (!$t) return '';
  if (preg_match('/^[+-]?\d{4,}-\d{2}-\d{2}/', $t, $m)) return $m[0];
  return '';
}

function nr_handle(string $h): string {
  $h = trim($h);
  $h = preg_replace('/^@+/', '', $h) ?? $h;
  return $h;
}

function nr_commons_file_url(string $filename): string {
  $filename = trim($filename);
  if ($filename === '') return '';
  return 'https://commons.wikimedia.org/wiki/Special:FilePath/' . rawurlencode($filename);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') nr_json(405, ['ok' => false, 'error' => 'Method not allowed']);
nr_require_admin();

$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($payload)) nr_json(400, ['ok' => false, 'error' => 'Invalid JSON body']);

$name = isset($payload['name']) ? trim((string)$payload['name']) : '';
if ($name === '') nr_json(400, ['ok' => false, 'error' => 'Missing name']);

$ua = 'evote.ng-admin/1.0 (profile enrichment)';

$searchUrl = 'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' . rawurlencode($name) . '&language=en&format=json&limit=1';
$search = nr_http_json($searchUrl, 'GET', ['Accept' => 'application/json', 'User-Agent' => $ua], null, 18);
if (!$search['ok'] || !is_array($search['json'])) nr_json(502, ['ok' => false, 'error' => 'Wikidata search failed']);
$arr = $search['json']['search'] ?? [];
if (!is_array($arr) || !isset($arr[0]['id'])) nr_json(404, ['ok' => false, 'error' => 'No Wikidata match found']);
$qid = (string)$arr[0]['id'];

$entityUrl = 'https://m.wikidata.org/wiki/Special:EntityData/' . rawurlencode($qid) . '.json';
$entityResp = nr_http_json($entityUrl, 'GET', ['Accept' => 'application/json', 'User-Agent' => $ua], null, 20);
if (!$entityResp['ok'] || !is_array($entityResp['json'])) nr_json(502, ['ok' => false, 'error' => 'Wikidata entity fetch failed']);
$entity = $entityResp['json']['entities'][$qid] ?? null;
if (!is_array($entity)) nr_json(502, ['ok' => false, 'error' => 'Bad Wikidata entity response']);

$imageName = nr_claim_string($entity, 'P18');
$twitter = nr_handle(nr_claim_string($entity, 'P2002'));
$instagram = nr_handle(nr_claim_string($entity, 'P2003'));
$facebook = nr_claim_string($entity, 'P2013');
$website = nr_claim_string($entity, 'P856');
$youtube = nr_claim_string($entity, 'P2397');
$tiktok = nr_handle(nr_claim_string($entity, 'P7085'));
$linkedin = nr_claim_string($entity, 'P6634');
$dob = nr_claim_time_ymd($entity, 'P569');

$profile = [
  'source' => 'wikidata',
  'qid' => $qid,
  'common_name' => null,
  'party' => null,
  'role' => null,
  'tier' => null,
  'bio' => null,
  'office_start' => null,
  'photo_url' => $imageName ? nr_commons_file_url($imageName) : null,
  'website' => $website ?: null,
  'social_twitter' => $twitter ?: null,
  'social_instagram' => $instagram ?: null,
  'social_facebook' => $facebook ? ('https://facebook.com/' . $facebook) : null,
  'social_youtube' => $youtube ? ('https://www.youtube.com/channel/' . $youtube) : null,
  'social_tiktok' => $tiktok ?: null,
  'social_linkedin' => $linkedin ? ('https://www.linkedin.com/in/' . $linkedin) : null,
  'contact_email' => null,
  'contact_phone' => null,
  'date_of_birth' => $dob ?: null
];

nr_json(200, ['ok' => true, 'profile' => $profile]);

