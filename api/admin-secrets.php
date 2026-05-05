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

function nr_guess_supabase_from_client(): array {
  $path = __DIR__ . '/../js/supabase-client.js';
  if (!is_file($path)) return ['url' => '', 'anon' => ''];
  $raw = file_get_contents($path);
  if ($raw === false) return ['url' => '', 'anon' => ''];
  $url = '';
  $anon = '';
  if (preg_match("/const\\s+SUPABASE_URL\\s*=\\s*'([^']+)'/m", $raw, $m)) $url = trim((string)$m[1]);
  if (preg_match("/const\\s+SUPABASE_ANON_KEY\\s*=\\s*'([^']+)'/m", $raw, $m)) $anon = trim((string)$m[1]);
  return ['url' => $url, 'anon' => $anon];
}

function nr_supabase_cfg(): array {
  $secrets = nr_load_secrets();
  $url = (string)($secrets['SUPABASE_URL'] ?? '') ?: nr_env('SUPABASE_URL');
  $anon = (string)($secrets['SUPABASE_ANON_KEY'] ?? '') ?: nr_env('SUPABASE_ANON_KEY');
  if ($url !== '' && $anon !== '') return ['url' => $url, 'anon' => $anon, 'source' => 'secrets_or_env'];
  $guess = nr_guess_supabase_from_client();
  return ['url' => (string)($guess['url'] ?? ''), 'anon' => (string)($guess['anon'] ?? ''), 'source' => 'client_fallback'];
}

function nr_require_admin(): array {
  $token = nr_read_bearer();
  if ($token === '') nr_json(401, ['error' => 'Missing Authorization bearer token']);

  $cfg = nr_supabase_cfg();
  if (($cfg['url'] ?? '') === '' || ($cfg['anon'] ?? '') === '') nr_json(500, ['error' => 'Supabase auth validation is not configured on the server']);

  $userResp = nr_http_json(rtrim((string)$cfg['url'], '/') . '/auth/v1/user', 'GET', [
    'apikey' => (string)$cfg['anon'],
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

function nr_write_secrets(array $data): void {
  $path = __DIR__ . '/../config/secrets.php';
  $dir = dirname($path);
  if (!is_dir($dir)) nr_json(500, ['error' => 'Missing config directory']);

  $out = [
    'SUPABASE_URL' => (string)($data['SUPABASE_URL'] ?? ''),
    'SUPABASE_ANON_KEY' => (string)($data['SUPABASE_ANON_KEY'] ?? ''),
    'SUPABASE_SERVICE_ROLE_KEY' => (string)($data['SUPABASE_SERVICE_ROLE_KEY'] ?? ''),
    'OPENROUTER_API_KEY' => (string)($data['OPENROUTER_API_KEY'] ?? ''),
    'OPENROUTER_MODEL' => (string)($data['OPENROUTER_MODEL'] ?? 'openai/gpt-4o-mini'),
    'ADMIN_EMAILS' => is_array($data['ADMIN_EMAILS'] ?? null) ? array_values(array_filter($data['ADMIN_EMAILS'], fn($e) => is_string($e) && trim($e) !== '')) : [],
  ];

  $php = "<?php\n";
  $php .= "declare(strict_types=1);\n\n";
  $php .= "return " . var_export($out, true) . ";\n";

  $tmp = $path . '.tmp';
  if (file_put_contents($tmp, $php, LOCK_EX) === false) nr_json(500, ['error' => 'Failed to write secrets']);
  if (!@rename($tmp, $path)) {
    @unlink($tmp);
    nr_json(500, ['error' => 'Failed to commit secrets']);
  }
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'GET' && $method !== 'POST') nr_json(405, ['error' => 'Method not allowed']);

nr_require_admin();

if ($method === 'GET') {
  $secrets = nr_load_secrets();
  $cfg = nr_supabase_cfg();
  nr_json(200, [
    'openrouter_configured' => ((string)($secrets['OPENROUTER_API_KEY'] ?? '') !== ''),
    'openrouter_model' => (string)($secrets['OPENROUTER_MODEL'] ?? 'openai/gpt-4o-mini'),
    'supabase_configured' => ((string)($cfg['url'] ?? '') !== '' && (string)($cfg['anon'] ?? '') !== ''),
    'supabase_source' => (string)($cfg['source'] ?? ''),
    'has_service_key' => ((string)($secrets['SUPABASE_SERVICE_ROLE_KEY'] ?? '') !== ''),
    'admin_emails_count' => is_array($secrets['ADMIN_EMAILS'] ?? null) ? count($secrets['ADMIN_EMAILS']) : 0,
  ]);
}

$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($payload)) nr_json(400, ['error' => 'Invalid JSON body']);

$action = isset($payload['action']) && is_string($payload['action']) ? strtolower(trim($payload['action'])) : '';
if ($action !== 'set') nr_json(400, ['error' => 'Invalid action']);

$existing = nr_load_secrets();

$updates = [];
if (isset($payload['openrouter_api_key']) && is_string($payload['openrouter_api_key'])) $updates['OPENROUTER_API_KEY'] = trim($payload['openrouter_api_key']);
if (isset($payload['openrouter_model']) && is_string($payload['openrouter_model'])) $updates['OPENROUTER_MODEL'] = trim($payload['openrouter_model']);
if (isset($payload['supabase_url']) && is_string($payload['supabase_url'])) $updates['SUPABASE_URL'] = trim($payload['supabase_url']);
if (isset($payload['supabase_anon_key']) && is_string($payload['supabase_anon_key'])) $updates['SUPABASE_ANON_KEY'] = trim($payload['supabase_anon_key']);
if (isset($payload['supabase_service_role_key']) && is_string($payload['supabase_service_role_key'])) $updates['SUPABASE_SERVICE_ROLE_KEY'] = trim($payload['supabase_service_role_key']);
if (isset($payload['admin_emails']) && is_array($payload['admin_emails'])) $updates['ADMIN_EMAILS'] = $payload['admin_emails'];

foreach ($updates as $k => $v) $existing[$k] = $v;

nr_write_secrets($existing);
nr_json(200, ['ok' => true]);
