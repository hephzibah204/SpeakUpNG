<?php
declare(strict_types=1);

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH);
if (!is_string($path) || $path === '') $path = '/';

$full = __DIR__ . $path;
if ($path !== '/' && is_file($full)) return false;

if ($path === '/') {
  $idx = __DIR__ . '/index.html';
  if (is_file($idx)) { readfile($idx); exit; }
}

if (preg_match('#^/admin/([a-zA-Z0-9-]+)/?$#', $path, $m)) {
  $p = __DIR__ . '/admin/' . $m[1] . '.html';
  if (is_file($p)) { readfile($p); exit; }
}

if (preg_match('#^/(index|leaderboard|polls|official|blog|news|news-curated|agencies|politicians|politician)/?$#', $path, $m)) {
  $p = __DIR__ . '/' . $m[1] . '.html';
  if (is_file($p)) { readfile($p); exit; }
}

if (preg_match('#^/politician/id/([a-zA-Z0-9-]+)/?$#', $path, $m)) {
  header('Location: /politician.html?id=' . rawurlencode($m[1]), true, 302);
  exit;
}

if (preg_match('#^/politician/([a-zA-Z0-9-]+)--([0-9a-fA-F-]{36})/?$#', $path, $m)) {
  header('Location: /politician.html?id=' . rawurlencode($m[2]) . '&slug=' . rawurlencode($m[1]), true, 302);
  exit;
}

http_response_code(404);
if (is_file(__DIR__ . '/404.html')) {
  readfile(__DIR__ . '/404.html');
} else {
  header('Content-Type: text/plain; charset=utf-8');
  echo "404";
}

