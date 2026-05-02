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

function nr_slugify(string $s): string {
  $s = trim($s);
  $s = preg_replace('/[^\pL\pN]+/u', '-', $s) ?? $s;
  $s = strtolower($s);
  $s = preg_replace('/[^a-z0-9-]+/', '', $s) ?? $s;
  $s = preg_replace('/-+/', '-', $s) ?? $s;
  $s = trim($s, '-');
  return $s;
}

function nr_content_file(string $type): string {
  $t = strtolower(trim($type));
  if ($t === 'blog') return __DIR__ . '/../data/blog-posts.json';
  if ($t === 'news') return __DIR__ . '/../data/news-posts.json';
  nr_json(400, ['error' => 'Invalid content_type']);
}

function nr_read_store(string $path): array {
  if (!is_file($path)) return ['version' => 1, 'posts' => []];
  $raw = file_get_contents($path);
  if ($raw === false) nr_json(500, ['error' => 'Failed to read content store']);
  $json = json_decode($raw, true);
  if (!is_array($json)) return ['version' => 1, 'posts' => []];
  if (!isset($json['version'])) $json['version'] = 1;
  if (!isset($json['posts']) || !is_array($json['posts'])) $json['posts'] = [];
  return $json;
}

function nr_write_store(string $path, array $store): void {
  $dir = dirname($path);
  if (!is_dir($dir)) nr_json(500, ['error' => 'Missing content store directory']);
  $tmp = $path . '.tmp';
  $data = json_encode($store, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  if ($data === false) nr_json(500, ['error' => 'Failed to encode content store']);
  if (file_put_contents($tmp, $data, LOCK_EX) === false) nr_json(500, ['error' => 'Failed to write content store']);
  if (!@rename($tmp, $path)) {
    @unlink($tmp);
    nr_json(500, ['error' => 'Failed to commit content store']);
  }
}

function nr_require_admin(): array {
  $token = nr_read_bearer();
  if ($token === '') nr_json(401, ['error' => 'Missing Authorization bearer token']);

  $secrets = nr_load_secrets();
  $supabaseUrl = (string)($secrets['SUPABASE_URL'] ?? '') ?: nr_env('SUPABASE_URL');
  $supabaseAnon = (string)($secrets['SUPABASE_ANON_KEY'] ?? '') ?: nr_env('SUPABASE_ANON_KEY');
  if ($supabaseUrl === '' || $supabaseAnon === '') nr_json(500, ['error' => 'Supabase auth validation is not configured on the server']);

  $userResp = nr_http_json(rtrim($supabaseUrl, '/') . '/auth/v1/user', 'GET', [
    'apikey' => $supabaseAnon,
    'Authorization' => 'Bearer ' . $token,
    'Accept' => 'application/json',
  ], null, 12);

  if (!$userResp['ok'] || !is_array($userResp['json'])) nr_json(401, ['error' => 'Invalid or expired session']);
  $email = (string)($userResp['json']['email'] ?? '');

  $adminEmails = $secrets['ADMIN_EMAILS'] ?? [];
  if (is_array($adminEmails) && count($adminEmails) > 0 && $email !== '' && !in_array($email, $adminEmails, true)) {
    nr_json(403, ['error' => 'Forbidden']);
  }

  return ['token' => $token, 'email' => $email];
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'GET' && $method !== 'POST') nr_json(405, ['error' => 'Method not allowed']);

nr_require_admin();

$type = (string)($_GET['content_type'] ?? '');
$path = nr_content_file($type);

if ($method === 'GET') {
  nr_json(200, nr_read_store($path));
}

$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($payload)) nr_json(400, ['error' => 'Invalid JSON body']);

$action = isset($payload['action']) && is_string($payload['action']) ? strtolower(trim($payload['action'])) : '';
$store = nr_read_store($path);
$posts = $store['posts'];
if (!is_array($posts)) $posts = [];

$today = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d');

if ($action === 'delete') {
  $slug = isset($payload['slug']) ? (string)$payload['slug'] : '';
  $slug = nr_slugify($slug);
  if ($slug === '') nr_json(400, ['error' => 'Missing slug']);
  $before = count($posts);
  $posts = array_values(array_filter($posts, fn($p) => is_array($p) && (string)($p['slug'] ?? '') !== $slug));
  if (count($posts) === $before) nr_json(404, ['error' => 'Not found']);
  $store['posts'] = $posts;
  $store['version'] = (int)($store['version'] ?? 1);
  nr_write_store($path, $store);
  nr_json(200, ['ok' => true]);
}

if ($action === 'create' || $action === 'update' || $action === 'publish' || $action === 'unpublish') {
  $post = $payload['post'] ?? null;
  if (!is_array($post)) nr_json(400, ['error' => 'Missing post']);

  $incomingSlug = isset($post['slug']) ? (string)$post['slug'] : '';
  if ($incomingSlug === '' && isset($post['title'])) $incomingSlug = (string)$post['title'];
  $slug = nr_slugify($incomingSlug);
  if ($slug === '') nr_json(400, ['error' => 'Missing slug/title']);

  $idx = -1;
  foreach ($posts as $i => $p) {
    if (is_array($p) && (string)($p['slug'] ?? '') === $slug) { $idx = (int)$i; break; }
  }

  if ($action === 'create' && $idx !== -1) nr_json(409, ['error' => 'Slug already exists']);
  if ($action !== 'create' && $idx === -1) nr_json(404, ['error' => 'Not found']);

  $merged = $idx !== -1 && is_array($posts[$idx]) ? $posts[$idx] : [];
  foreach ($post as $k => $v) {
    if (!is_string($k)) continue;
    $merged[$k] = $v;
  }

  $merged['slug'] = $slug;
  $merged['updated_at'] = $today;

  $status = isset($merged['status']) ? strtolower((string)$merged['status']) : '';
  if ($status !== 'draft' && $status !== 'published') {
    $status = ((string)($merged['published_at'] ?? '') !== '') ? 'published' : 'draft';
  }

  if ($action === 'publish') $status = 'published';
  if ($action === 'unpublish') $status = 'draft';

  $merged['status'] = $status;

  if ($status === 'published' && ((string)($merged['published_at'] ?? '') === '')) {
    $merged['published_at'] = $today;
  }

  if ($action !== 'publish' && $action !== 'unpublish') {
    $title = trim((string)($merged['title'] ?? ''));
    $excerpt = trim((string)($merged['excerpt'] ?? ''));
    $body = trim((string)($merged['body_html'] ?? ''));
    if ($title === '' || $excerpt === '' || $body === '') nr_json(400, ['error' => 'title, excerpt, and body_html are required']);
  }

  if ($idx === -1) $posts[] = $merged;
  else $posts[$idx] = $merged;

  usort($posts, function ($a, $b) {
    $ap = is_array($a) ? (string)($a['published_at'] ?? '') : '';
    $bp = is_array($b) ? (string)($b['published_at'] ?? '') : '';
    return strcmp($bp, $ap);
  });

  $store['posts'] = $posts;
  $store['version'] = (int)($store['version'] ?? 1);
  nr_write_store($path, $store);
  nr_json(200, ['ok' => true, 'post' => $merged, 'store' => $store]);
}

nr_json(400, ['error' => 'Invalid action']);

