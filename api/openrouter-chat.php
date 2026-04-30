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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  nr_json(405, ['error' => 'Method not allowed']);
}

$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($payload)) nr_json(400, ['error' => 'Invalid JSON body']);

$secrets = nr_load_secrets();
$openrouterKey = (string)($secrets['OPENROUTER_API_KEY'] ?? '') ?: nr_env('OPENROUTER_API_KEY');
$defaultModel = (string)($secrets['OPENROUTER_MODEL'] ?? '') ?: (nr_env('OPENROUTER_MODEL') ?: 'openai/gpt-4o-mini');
$adminEmails = $secrets['ADMIN_EMAILS'] ?? [];

if ($openrouterKey === '') nr_json(500, ['error' => 'OpenRouter is not configured on the server']);

$token = nr_read_bearer();
if ($token === '') nr_json(401, ['error' => 'Missing Authorization bearer token']);

$supabaseUrl = (string)($secrets['SUPABASE_URL'] ?? '') ?: nr_env('SUPABASE_URL');
$supabaseAnon = (string)($secrets['SUPABASE_ANON_KEY'] ?? '') ?: nr_env('SUPABASE_ANON_KEY');
if ($supabaseUrl === '' || $supabaseAnon === '') {
  nr_json(500, ['error' => 'Supabase auth validation is not configured on the server']);
}

$userResp = nr_http_json(rtrim($supabaseUrl, '/') . '/auth/v1/user', 'GET', [
  'apikey' => $supabaseAnon,
  'Authorization' => 'Bearer ' . $token,
  'Accept' => 'application/json',
], null, 12);

if (!$userResp['ok'] || !is_array($userResp['json'])) nr_json(401, ['error' => 'Invalid or expired session']);
$email = (string)($userResp['json']['email'] ?? '');
if (is_array($adminEmails) && count($adminEmails) > 0 && $email !== '' && !in_array($email, $adminEmails, true)) {
  nr_json(403, ['error' => 'Forbidden']);
}

$model = isset($payload['model']) && is_string($payload['model']) && $payload['model'] !== '' ? $payload['model'] : $defaultModel;
$messages = $payload['messages'] ?? null;
if (!is_array($messages) || count($messages) === 0) nr_json(400, ['error' => 'Missing messages']);

$req = [
  'model' => $model,
  'messages' => $messages,
];
if (isset($payload['temperature'])) $req['temperature'] = $payload['temperature'];
if (isset($payload['max_tokens'])) $req['max_tokens'] = $payload['max_tokens'];

$siteUrl = (string)($_SERVER['HTTP_HOST'] ?? 'evote.ng');
$aiResp = nr_http_json('https://openrouter.ai/api/v1/chat/completions', 'POST', [
  'Authorization' => 'Bearer ' . $openrouterKey,
  'Content-Type' => 'application/json',
  'Accept' => 'application/json',
  'HTTP-Referer' => 'https://' . $siteUrl,
  'X-Title' => 'evote.ng Admin AI',
], $req, 40);

if (!$aiResp['ok']) {
  $msg = is_array($aiResp['json']) ? ($aiResp['json']['error']['message'] ?? $aiResp['json']['error'] ?? null) : null;
  nr_json(502, ['error' => 'OpenRouter request failed', 'details' => $msg ?: ('HTTP ' . ($aiResp['code'] ?? 0))]);
}

nr_json(200, $aiResp['json'] ?? ['error' => 'Bad upstream response']);

