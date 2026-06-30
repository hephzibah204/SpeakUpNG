<?php
declare(strict_types=1);
header('Content-Type: text/html; charset=utf-8');

function nr_origin(): string {
  $https = $_SERVER['HTTPS'] ?? '';
  $proto = (!empty($https) && strtolower((string)$https) !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? ($_SERVER['SERVER_NAME'] ?? 'localhost');
  return $proto . '://' . $host;
}

function nr_h(?string $s): string {
  return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function nr_strlen(string $s): int {
  return function_exists('mb_strlen') ? (int)mb_strlen($s) : strlen($s);
}

function nr_substr(string $s, int $start, int $len): string {
  return function_exists('mb_substr') ? (string)mb_substr($s, $start, $len) : substr($s, $start, $len);
}

function nr_first_sentence(string $html, int $maxLen = 180): string {
  $text = trim(preg_replace('/\s+/', ' ', strip_tags($html)));
  if ($text === '') return '';
  if (nr_strlen($text) <= $maxLen) return $text;
  return rtrim(nr_substr($text, 0, $maxLen - 1)) . '…';
}

function nr_format_date(?string $iso): string {
  if (!$iso) return '';
  try {
    $d = new DateTime($iso);
    return $d->format('M j, Y');
  } catch (Throwable $e) {
    return $iso;
  }
}

$slug = isset($_GET['slug']) ? trim((string)$_GET['slug']) : '';
$origin = nr_origin();
$canonicalUrl = $slug !== '' ? ($origin . '/news/' . rawurlencode($slug)) : ($origin . '/news');

$dataPath = __DIR__ . '/data/news-posts.json';
$post = null;
if ($slug !== '' && is_file($dataPath)) {
  $raw = file_get_contents($dataPath);
  if ($raw !== false) {
    $json = json_decode($raw, true);
    $posts = is_array($json) ? ($json['posts'] ?? []) : [];
    if (is_array($posts)) {
      foreach ($posts as $p) {
        if (is_array($p) && (($p['slug'] ?? '') === $slug)) {
          $post = $p;
          break;
        }
      }
    }
  }
}

if (is_array($post) && strtolower((string)($post['status'] ?? 'published')) === 'draft') {
  $post = null;
}

if (!$post) {
  http_response_code($slug === '' ? 400 : 404);
  $pageTitle = $slug === '' ? 'News | evote.ng' : 'Update not found | evote.ng News';
  $desc = $slug === '' ? 'Read evote.ng news updates.' : 'This news update could not be found.';
  $img = $origin . '/images/logo.png';
  ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= nr_h($pageTitle) ?></title>
  <meta name="description" content="<?= nr_h($desc) ?>">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="<?= nr_h($origin . '/news') ?>">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="evote.ng">
  <meta property="og:locale" content="en_NG">
  <meta property="og:title" content="<?= nr_h($pageTitle) ?>">
  <meta property="og:description" content="<?= nr_h($desc) ?>">
  <meta property="og:image" content="<?= nr_h($img) ?>">
  <meta property="og:url" content="<?= nr_h($origin . '/news') ?>">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= nr_h($pageTitle) ?>">
  <meta name="twitter:description" content="<?= nr_h($desc) ?>">
  <meta name="twitter:image" content="<?= nr_h($img) ?>">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .post-wrap { max-width: 920px; }
    .post-title { font-size: 1.85rem; margin-bottom: .6rem; }
    .post-body { margin-top: 1.2rem; display: grid; gap: .9rem; }
  </style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-logo"><img src="/images/logo.png" alt="evote.ng logo"></a>
    <div class="nav-links">
      <a href="/" class="nav-link show-mobile">Officials</a>
      <a href="/agencies" class="nav-link">Agencies</a>
      <a href="/leaderboard" class="nav-link">Rankings</a>
      <a href="/polls" class="nav-link">Polls</a>
      <a href="/blog" class="nav-link">Blog</a>
      <a href="/news" class="nav-link active">News</a>
    </div>
  </nav>
  <div class="section">
    <div class="container post-wrap">
      <div class="page-header">
        <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;">
          <a href="/news" class="btn btn-ghost btn-sm">Back to News</a>
          <a href="/" class="btn btn-green btn-sm">Rate an Official</a>
        </div>
      </div>
      <article class="card">
        <h1 class="post-title"><?= nr_h($slug === '' ? 'Pick an update' : 'Update not found') ?></h1>
        <div class="post-body">
          <p class="muted"><?= nr_h($slug === '' ? 'This news link looks incomplete. Go back to the news page and pick an update.' : 'We no see this update. Use the news page to pick another one.') ?></p>
        </div>
        <div class="post-cta">
          <a href="/news" class="btn btn-ghost">More Updates</a>
          <a href="/polls" class="btn btn-green">Answer Polls</a>
        </div>
      </article>
    </div>
  </div>
  <footer class="site-footer">
    <strong>evote.ng</strong> — Follow the governance timeline<br>
    <a href="/" style="color:var(--green-light);">Officials</a> ·
    <a href="/polls" style="color:var(--green-light);">Polls</a> ·
    <a href="/blog" style="color:var(--green-light);">Blog</a>
  </footer>
</body>
</html>
<?php
  exit;
}

$title = (string)($post['title'] ?? 'evote.ng News');
$excerpt = (string)($post['meta_description'] ?? $post['excerpt'] ?? '');
if ($excerpt === '') $excerpt = nr_first_sentence((string)($post['body_html'] ?? ''));
$keywords = (string)($post['meta_keywords'] ?? '');
if ($keywords === '') {
  $tags = $post['tags'] ?? [];
  if (is_array($tags)) $keywords = implode(', ', array_values(array_filter($tags, fn($t) => is_string($t) && $t !== '')));
}
$featured = (string)($post['featured_image'] ?? '/images/logo.png');
$featuredAbs = preg_match('/^https?:\/\//i', $featured) ? $featured : ($origin . $featured);
$pageTitle = $title . ' | evote.ng News';
$published = (string)($post['published_at'] ?? '');
$updated = (string)($post['updated_at'] ?? $published);
$category = (string)($post['category'] ?? '');
$metaLine = trim(implode(' · ', array_values(array_filter([
  $published !== '' ? strtoupper(nr_format_date($published)) : '',
  $category !== '' ? strtoupper($category) : ''
]))));
$bodyHtml = (string)($post['body_html'] ?? '');

$ld = [
  '@context' => 'https://schema.org',
  '@type' => 'NewsArticle',
  'headline' => $title,
  'description' => $excerpt,
  'image' => [$featuredAbs],
  'datePublished' => $published,
  'dateModified' => $updated,
  'author' => ['@type' => 'Organization', 'name' => 'evote.ng'],
  'publisher' => ['@type' => 'Organization', 'name' => 'evote.ng'],
  'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $canonicalUrl],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= nr_h($pageTitle) ?></title>
  <meta name="description" content="<?= nr_h($excerpt) ?>">
  <?php if ($keywords !== '') { ?><meta name="keywords" content="<?= nr_h($keywords) ?>"><?php } ?>
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="<?= nr_h($canonicalUrl) ?>">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="evote.ng">
  <meta property="og:locale" content="en_NG">
  <meta property="og:title" content="<?= nr_h($title) ?>">
  <meta property="og:description" content="<?= nr_h($excerpt) ?>">
  <meta property="og:image" content="<?= nr_h($featuredAbs) ?>">
  <meta property="og:url" content="<?= nr_h($canonicalUrl) ?>">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?= nr_h($title) ?>">
  <meta name="twitter:description" content="<?= nr_h($excerpt) ?>">
  <meta name="twitter:image" content="<?= nr_h($featuredAbs) ?>">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .post-wrap { max-width: 920px; }
    .post-title { font-size: 1.85rem; margin-bottom: .6rem; }
    .post-meta { color: var(--muted); font-size: .84rem; margin-bottom: 1rem; display: flex; flex-wrap: wrap; gap: .6rem; text-transform: uppercase; letter-spacing: .05em; }
    .post-img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 12px; border: 1px solid var(--border); background: #101310; }
    .post-body { margin-top: 1.2rem; display: grid; gap: .9rem; }
    .post-body p { color: var(--off); font-size: 1rem; }
    .post-body h2 { margin-top: .7rem; font-size: 1.2rem; }
    .post-body ul { padding-left: 1.1rem; display: grid; gap: .35rem; }
    .post-body li { color: var(--off); }
    .post-cta { margin-top: 1.4rem; display: flex; gap: .7rem; flex-wrap: wrap; }
  </style>
  <script type="application/ld+json"><?= json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script>
</head>
<body>
  <nav class="nav">
    <a href="/" class="nav-logo"><img src="/images/logo.png" alt="evote.ng logo"></a>
    <div class="nav-links">
      <a href="/" class="nav-link show-mobile">Officials</a>
      <a href="/agencies" class="nav-link">Agencies</a>
      <a href="/leaderboard" class="nav-link">Rankings</a>
      <a href="/polls" class="nav-link">Polls</a>
      <a href="/blog" class="nav-link">Blog</a>
      <a href="/news" class="nav-link active">News</a>
    </div>
  </nav>

  <div class="section">
    <div class="container post-wrap">
      <div class="page-header">
        <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;">
          <a href="/news" class="btn btn-ghost btn-sm">Back to News</a>
          <a href="/" class="btn btn-green btn-sm">Rate an Official</a>
        </div>
        <p class="page-sub" style="margin-top:.8rem;">Curated updates with context, so you know wetin matter.</p>
      </div>

      <article class="card">
        <h1 class="post-title"><?= nr_h($title) ?></h1>
        <div class="post-meta"><?= nr_h($metaLine) ?></div>
        <div style="margin-bottom:1rem;">
          <img class="post-img" alt="<?= nr_h((string)($post['featured_image_alt'] ?? $title)) ?>" src="<?= nr_h($featured) ?>">
        </div>
        <div class="post-body"><?= $bodyHtml ?></div>
        <div class="post-cta">
          <a href="/news" class="btn btn-ghost">More Updates</a>
          <a href="/polls" class="btn btn-green">Answer Polls</a>
        </div>
      </article>
    </div>
  </div>

  <footer class="site-footer">
    <strong>evote.ng</strong> — Follow the governance timeline<br>
    <a href="/" style="color:var(--green-light);">Officials</a> ·
    <a href="/polls" style="color:var(--green-light);">Polls</a> ·
    <a href="/blog" style="color:var(--green-light);">Blog</a>
  </footer>
</body>
</html>
