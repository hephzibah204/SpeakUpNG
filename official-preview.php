<?php
declare(strict_types=1);
header('Content-Type: text/html; charset=utf-8');

const SUPABASE_URL = 'https://dyrsygrjsxqfszglqrez.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wKGjAwnpc2sOwjSAf6Zl6Q_bi3PegsD';

function nr_origin(): string {
  $https = $_SERVER['HTTPS'] ?? '';
  $proto = (!empty($https) && strtolower((string)$https) !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? 'localhost');
  return $proto . '://' . $host;
}

function nr_h(?string $s): string {
  return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function nr_slugify(string $name): string {
  $lower = function_exists('mb_strtolower') ? (string)mb_strtolower($name) : strtolower($name);
  $s = trim($lower);
  $s = preg_replace('/[^a-z0-9]+/u', '-', $s);
  $s = preg_replace('/-+/', '-', (string)$s);
  $s = trim((string)$s, '-');
  return $s !== '' ? $s : 'official';
}

function nr_http_get_json(string $url, array $headers): ?array {
  if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $body = curl_exec($ch);
    $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false || $code < 200 || $code >= 300) return null;
    $json = json_decode((string)$body, true);
    return is_array($json) ? $json : null;
  }

  $ctx = stream_context_create([
    'http' => [
      'method' => 'GET',
      'header' => implode("\r\n", $headers),
      'timeout' => 8,
    ]
  ]);
  $body = @file_get_contents($url, false, $ctx);
  if ($body === false) return null;
  $json = json_decode((string)$body, true);
  return is_array($json) ? $json : null;
}

$id = isset($_GET['id']) ? trim((string)$_GET['id']) : '';
if ($id === '') {
  http_response_code(400);
  ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NaijaRate</title>
  <meta name="robots" content="noindex">
</head>
<body>
  <p>Missing official id.</p>
</body>
</html>
<?php
  exit;
}

$origin = nr_origin();
$previewUrl = $origin . '/official/p/' . rawurlencode($id);
$idRouteUrl = $origin . '/official/id/' . rawurlencode($id);
$headers = [
  'apikey: ' . SUPABASE_ANON_KEY,
  'Authorization: Bearer ' . SUPABASE_ANON_KEY,
  'Accept: application/json',
];

$select = rawurlencode('id,full_name,common_name,role,photo_url,states(name)');
$cacheDir = __DIR__ . '/cache/officials';
$cacheFile = $cacheDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $id) . '.json';
$o = null;
if (is_file($cacheFile) && (time() - filemtime($cacheFile) < 86400)) {
  $raw = file_get_contents($cacheFile);
  if ($raw !== false) {
    $json = json_decode($raw, true);
    if (is_array($json)) $o = $json;
  }
}
if (!$o) {
  $url = SUPABASE_URL . '/rest/v1/officials?id=eq.' . rawurlencode($id) . '&status=eq.active&select=' . $select . '&limit=1';
  $res = nr_http_get_json($url, $headers);
  $row = (is_array($res) && isset($res[0]) && is_array($res[0])) ? $res[0] : null;
  if ($row) {
    $o = $row;
    if (!is_dir($cacheDir)) @mkdir($cacheDir, 0775, true);
    @file_put_contents($cacheFile, json_encode($o, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
  }
}

if (!$o) {
  http_response_code(404);
  $pageTitle = 'Official not found | NaijaRate';
  $desc = 'This official profile could not be found.';
  $img = $origin . '/images/naijarate-og.jpg';
  ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= nr_h($pageTitle) ?></title>
  <meta name="description" content="<?= nr_h($desc) ?>">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="<?= nr_h($origin . '/') ?>">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NaijaRate">
  <meta property="og:locale" content="en_NG">
  <meta property="og:title" content="<?= nr_h($pageTitle) ?>">
  <meta property="og:description" content="<?= nr_h($desc) ?>">
  <meta property="og:image" content="<?= nr_h($img) ?>">
  <meta property="og:url" content="<?= nr_h($origin . '/') ?>">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= nr_h($pageTitle) ?>">
  <meta name="twitter:description" content="<?= nr_h($desc) ?>">
  <meta name="twitter:image" content="<?= nr_h($img) ?>">
</head>
<body>
  <p>Official not found.</p>
  <p><a href="/">Go to home</a></p>
</body>
</html>
<?php
  exit;
}

$fullName = (string)($o['full_name'] ?? ($o['common_name'] ?? 'Official'));
$role = (string)($o['role'] ?? 'Public Official');
$stateName = '';
if (isset($o['states']) && is_array($o['states']) && isset($o['states']['name'])) $stateName = (string)$o['states']['name'];

$slug = nr_slugify($fullName);
$canonicalUrl = $origin . '/official/' . rawurlencode($slug);
$pageTitle = $fullName . ' - ' . $role . ' | NaijaRate';
$desc = $fullName . ' (' . $role . ') on NaijaRate: ratings, citizen reviews, reports, and accountability insights' . ($stateName !== '' ? (' in ' . $stateName) : '') . '.';
$photo = (string)($o['photo_url'] ?? '');
$img = ($photo !== '' && preg_match('/^https?:\/\//i', $photo)) ? $photo : ($origin . '/images/naijarate-og.jpg');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= nr_h($pageTitle) ?></title>
  <meta name="description" content="<?= nr_h($desc) ?>">
  <meta name="robots" content="noindex,follow,max-image-preview:large">
  <link rel="canonical" href="<?= nr_h($canonicalUrl) ?>">
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="NaijaRate">
  <meta property="og:locale" content="en_NG">
  <meta property="og:title" content="<?= nr_h($pageTitle) ?>">
  <meta property="og:description" content="<?= nr_h($desc) ?>">
  <meta property="og:image" content="<?= nr_h($img) ?>">
  <meta property="og:url" content="<?= nr_h($previewUrl) ?>">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= nr_h($pageTitle) ?>">
  <meta name="twitter:description" content="<?= nr_h($desc) ?>">
  <meta name="twitter:image" content="<?= nr_h($img) ?>">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .wrap { max-width: 920px; margin: 0 auto; padding: 24px 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1 style="margin:0 0 10px;"><?= nr_h($fullName) ?></h1>
    <p class="muted" style="margin:0 0 14px;"><?= nr_h($role . ($stateName !== '' ? (' · ' . $stateName) : '')) ?></p>
    <p style="margin:0 0 18px;">Opening profile…</p>
    <p><a class="btn btn-green" href="<?= nr_h($idRouteUrl) ?>">Continue</a></p>
  </div>
  <script>
    setTimeout(function () { window.location.replace(<?= json_encode($idRouteUrl, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>); }, 450);
  </script>
</body>
</html>
