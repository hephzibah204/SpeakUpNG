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

function nr_http_json(string $url, string $method, array $headers, ?string $body, int $timeoutSec = 25): array {
  $hdrLines = [];
  foreach ($headers as $k => $v) $hdrLines[] = $k . ': ' . $v;

  if (function_exists('curl_init')) {
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
  if ($resp === false) return ['ok' => false, 'code' => $code, 'json' => null, 'raw' => '', 'err' => 'Request failed'];
  $json = json_decode((string)$resp, true);
  return ['ok' => $code >= 200 && $code < 300, 'code' => $code, 'json' => is_array($json) ? $json : null, 'raw' => (string)$resp];
}

function nr_supabase_cfg(): array {
  $secrets = nr_load_secrets();
  $url = (string)($secrets['SUPABASE_URL'] ?? '') ?: nr_env('SUPABASE_URL');
  $anon = (string)($secrets['SUPABASE_ANON_KEY'] ?? '') ?: nr_env('SUPABASE_ANON_KEY');
  $service = (string)($secrets['SUPABASE_SERVICE_ROLE_KEY'] ?? '') ?: nr_env('SUPABASE_SERVICE_ROLE_KEY');
  if ($url === '' || $anon === '') {
    $jsPath = __DIR__ . '/../js/supabase-client.js';
    if (is_file($jsPath)) {
      $raw = file_get_contents($jsPath);
      if ($raw !== false) {
        if ($url === '' && preg_match("/const\\s+SUPABASE_URL\\s*=\\s*'([^']+)'/m", $raw, $m)) $url = trim((string)$m[1]);
        if ($anon === '' && preg_match("/const\\s+SUPABASE_ANON_KEY\\s*=\\s*'([^']+)'/m", $raw, $m)) $anon = trim((string)$m[1]);
      }
    }
  }
  return ['url' => $url, 'anon' => $anon, 'service' => $service];
}

function nr_require_admin(): array {
  $token = nr_read_bearer();
  if ($token === '') nr_json(401, ['error' => 'Missing Authorization bearer token']);

  $cfg = nr_supabase_cfg();
  if ($cfg['url'] === '' || $cfg['anon'] === '') nr_json(500, ['error' => 'Supabase auth validation is not configured on the server']);

  $userResp = nr_http_json(rtrim($cfg['url'], '/') . '/auth/v1/user', 'GET', [
    'apikey' => $cfg['anon'],
    'Authorization' => 'Bearer ' . $token,
    'Accept' => 'application/json',
  ], null, 12);

  if (!$userResp['ok'] || !is_array($userResp['json'])) nr_json(401, ['error' => 'Invalid or expired session']);
  $email = (string)($userResp['json']['email'] ?? '');

  $secrets = nr_load_secrets();
  $adminEmails = $secrets['ADMIN_EMAILS'] ?? [];
  if (is_array($adminEmails) && count($adminEmails) > 0 && $email !== '' && !in_array($email, $adminEmails, true)) {
    nr_json(403, ['error' => 'Forbidden']);
  }

  return ['token' => $token, 'email' => $email];
}

function sb_rest(string $path, string $method, array $headers, $body): array {
  $cfg = nr_supabase_cfg();
  if ($cfg['url'] === '' || $cfg['service'] === '') nr_json(500, ['error' => 'Supabase service role is not configured']);
  $url = rtrim($cfg['url'], '/') . '/rest/v1' . $path;
  $hdr = array_merge([
    'apikey' => $cfg['service'],
    'Authorization' => 'Bearer ' . $cfg['service'],
    'Accept' => 'application/json',
  ], $headers);
  $payload = null;
  if ($body !== null) $payload = json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  return nr_http_json($url, $method, $hdr, $payload, 35);
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'POST') nr_json(405, ['error' => 'Method not allowed']);
$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($payload)) nr_json(400, ['error' => 'Invalid JSON body']);

$action = isset($payload['action']) && is_string($payload['action']) ? strtolower(trim($payload['action'])) : '';

nr_require_admin();

if ($action === 'upsert') {
  $id = isset($payload['id']) && is_string($payload['id']) ? trim($payload['id']) : '';
  $full = isset($payload['full_name']) && is_string($payload['full_name']) ? trim($payload['full_name']) : '';
  $common = isset($payload['common_name']) && is_string($payload['common_name']) ? trim($payload['common_name']) : '';
  $party = isset($payload['party']) && is_string($payload['party']) ? strtoupper(trim($payload['party'])) : '';
  $title = isset($payload['aspiration_title']) && is_string($payload['aspiration_title']) ? trim($payload['aspiration_title']) : '';
  $bio = isset($payload['bio']) && is_string($payload['bio']) ? trim($payload['bio']) : '';
  $photo = isset($payload['photo_url']) && is_string($payload['photo_url']) ? trim($payload['photo_url']) : '';
  $priority = isset($payload['priority']) ? (int)$payload['priority'] : 0;
  $active = isset($payload['is_active']) ? (bool)$payload['is_active'] : true;
  $aliases = isset($payload['aliases']) && is_array($payload['aliases']) ? $payload['aliases'] : [];
  $links = isset($payload['social_links']) && is_array($payload['social_links']) ? $payload['social_links'] : [];

  if ($full === '' || $party === '') nr_json(400, ['error' => 'full_name and party are required']);
  if (!preg_match('/^[A-Z0-9]{2,10}$/', $party)) nr_json(400, ['error' => 'Invalid party code']);
  $aliases = array_values(array_slice(array_filter(array_map(fn($x) => is_string($x) ? trim($x) : '', $aliases), fn($x) => $x !== ''), 0, 12));

  $row = [
    'full_name' => $full,
    'common_name' => ($common !== '' ? $common : null),
    'party' => $party,
    'aspiration_title' => ($title !== '' ? $title : null),
    'bio' => ($bio !== '' ? $bio : null),
    'photo_url' => ($photo !== '' ? $photo : null),
    'priority' => $priority,
    'is_active' => $active,
    'aliases' => $aliases,
    'social_links' => $links,
  ];
  if ($id !== '' && preg_match('/^[0-9a-f\-]{36}$/i', $id)) $row['id'] = $id;

  $ins = sb_rest('/politicians?on_conflict=id', 'POST', [
    'Content-Type' => 'application/json',
    'Prefer' => 'resolution=merge-duplicates,return=representation',
  ], [$row]);
  if (!$ins['ok'] || !is_array($ins['json']) || !count($ins['json'])) nr_json(500, ['error' => 'Upsert failed', 'details' => $ins['raw'] ?? null]);
  nr_json(200, ['ok' => true, 'politician' => $ins['json'][0]]);
}

if ($action === 'delete') {
  $id = isset($payload['id']) && is_string($payload['id']) ? trim($payload['id']) : '';
  if ($id === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $id)) nr_json(400, ['error' => 'Invalid id']);
  $del = sb_rest('/politicians?id=eq.' . rawurlencode($id), 'DELETE', [
    'Prefer' => 'return=minimal',
  ], null);
  if (!$del['ok']) nr_json(500, ['error' => 'Delete failed', 'details' => $del['raw'] ?? null]);
  nr_json(200, ['ok' => true]);
}

nr_json(400, ['error' => 'Unknown action']);

