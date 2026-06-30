<?php
declare(strict_types=1);

$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH);
if (!is_string($path)) $path = '/';

$docRoot = __DIR__;
$filePath = realpath($docRoot . $path);
if ($filePath && str_starts_with($filePath, $docRoot) && is_file($filePath)) {
  return false;
}

function serve(string $rel): void {
  $full = __DIR__ . '/' . ltrim($rel, '/');
  if (is_file($full)) {
    $_SERVER['SCRIPT_NAME'] = '/' . ltrim($rel, '/');
    require $full;
    exit;
  }
  http_response_code(404);
  require __DIR__ . '/404.html';
  exit;
}

if ($path === '/' || $path === '') serve('index.html');

if (preg_match('#^/official/id/([a-zA-Z0-9-]+)/?$#', $path, $m)) {
  $_GET['id'] = $m[1];
  serve('official.html');
}
if (preg_match('#^/official/([a-zA-Z0-9-]+)--([0-9a-fA-F-]{36})/?$#', $path, $m)) {
  $_GET['slug'] = $m[1];
  $_GET['id'] = $m[2];
  serve('official.html');
}
if (preg_match('#^/official/([a-zA-Z0-9-]+)/?$#', $path, $m)) {
  $_GET['slug'] = $m[1];
  serve('official.html');
}

if (preg_match('#^/politician/id/([a-zA-Z0-9-]+)/?$#', $path, $m)) {
  $_GET['id'] = $m[1];
  serve('politician.html');
}
if (preg_match('#^/politician/([a-zA-Z0-9-]+)--([0-9a-fA-F-]{36})/?$#', $path, $m)) {
  $_GET['slug'] = $m[1];
  $_GET['id'] = $m[2];
  serve('politician.html');
}

$top = [
  '/leaderboard' => 'leaderboard.html',
  '/polls' => 'polls.html',
  '/official' => 'official.html',
  '/agencies' => 'agencies.html',
  '/politicians' => 'politicians.html',
  '/news' => 'news.html',
  '/news-curated' => 'news-curated.html',
  '/news-item' => 'news-item.html',
  '/promise' => 'promise.html',
  '/blog' => 'blog.html',
];

$key = rtrim($path, '/');
if ($key === '') $key = '/';
if (isset($top[$key])) serve($top[$key]);

if (preg_match('#^/news/([a-zA-Z0-9-]+)/?$#', $path, $m)) {
  $_GET['slug'] = $m[1];
  if (is_file(__DIR__ . '/news-post.php')) serve('news-post.php');
  serve('news-post.html');
}

if (preg_match('#^/blog/([a-zA-Z0-9-]+)/?$#', $path, $m)) {
  $_GET['slug'] = $m[1];
  if (is_file(__DIR__ . '/blog-post.php')) serve('blog-post.php');
  serve('blog-post.html');
}

http_response_code(404);
require __DIR__ . '/404.html';
exit;

