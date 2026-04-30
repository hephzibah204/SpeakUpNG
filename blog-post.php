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
$canonicalUrl = $slug !== '' ? ($origin . '/blog/' . rawurlencode($slug)) : ($origin . '/blog');

$dataPath = __DIR__ . '/data/blog-posts.json';
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

if (!$post) {
  http_response_code($slug === '' ? 400 : 404);
  $pageTitle = $slug === '' ? 'Blog | NaijaRate' : 'Post not found | NaijaRate Blog';
  $desc = $slug === '' ? 'Read the NaijaRate blog.' : 'This blog post could not be found.';
  $img = $origin . '/images/naijarate-og.jpg';
  ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= nr_h($pageTitle) ?></title>
  <meta name="description" content="<?= nr_h($desc) ?>">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="<?= nr_h($origin . '/blog') ?>">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="NaijaRate">
  <meta property="og:locale" content="en_NG">
  <meta property="og:title" content="<?= nr_h($pageTitle) ?>">
  <meta property="og:description" content="<?= nr_h($desc) ?>">
  <meta property="og:image" content="<?= nr_h($img) ?>">
  <meta property="og:url" content="<?= nr_h($origin . '/blog') ?>">
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
    <a href="/" class="nav-logo">🇳🇬 Naija<span>Rate</span> <span class="badge">Beta</span></a>
    <div class="nav-links">
      <a href="/" class="nav-link show-mobile">Officials</a>
      <a href="/leaderboard" class="nav-link">Rankings</a>
      <a href="/polls" class="nav-link">Polls</a>
      <a href="/blog" class="nav-link active">Blog</a>
      <a href="/news" class="nav-link">News</a>
    </div>
  </nav>
  <div class="section">
    <div class="container post-wrap">
      <div class="page-header">
        <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;">
          <a href="/blog" class="btn btn-ghost btn-sm">Back to Blog</a>
          <a href="/polls" class="btn btn-green btn-sm">See Polls</a>
        </div>
      </div>
      <article class="card">
        <h1 class="post-title"><?= nr_h($slug === '' ? 'Pick a post' : 'Post not found') ?></h1>
        <div class="post-body">
          <p class="muted"><?= nr_h($slug === '' ? 'This post link looks incomplete. Go back to the blog page and pick a post.' : 'We no see this post. Use the blog page to pick another one.') ?></p>
        </div>
        <div class="post-cta">
          <a href="/blog" class="btn btn-ghost">More Blog Posts</a>
          <a href="/" class="btn btn-green">Rate an Official</a>
        </div>
      </article>
    </div>
  </div>
  <footer class="site-footer">
    <strong>NaijaRate</strong> — Civic insights for informed public participation<br>
    <a href="/" style="color:var(--green-light);">Officials</a> ·
    <a href="/leaderboard" style="color:var(--green-light);">Rankings</a> ·
    <a href="/news" style="color:var(--green-light);">News Updates</a>
  </footer>
</body>
</html>
<?php
  exit;
}

$title = (string)($post['title'] ?? 'NaijaRate Blog');
$excerpt = (string)($post['meta_description'] ?? $post['excerpt'] ?? '');
if ($excerpt === '') $excerpt = nr_first_sentence((string)($post['body_html'] ?? ''));
$keywords = (string)($post['meta_keywords'] ?? '');
if ($keywords === '') {
  $tags = $post['tags'] ?? [];
  if (is_array($tags)) $keywords = implode(', ', array_values(array_filter($tags, fn($t) => is_string($t) && $t !== '')));
}
$featured = (string)($post['featured_image'] ?? '/images/naijarate-og.jpg');
$featuredAbs = preg_match('/^https?:\/\//i', $featured) ? $featured : ($origin . $featured);
$pageTitle = $title . ' | NaijaRate Blog';
$published = (string)($post['published_at'] ?? '');
$updated = (string)($post['updated_at'] ?? $published);
$category = (string)($post['category'] ?? '');
$readingTime = (int)($post['reading_time_minutes'] ?? 0);
$metaLine = trim(implode(' · ', array_values(array_filter([
  $category !== '' ? strtoupper($category) : '',
  $published !== '' ? strtoupper(nr_format_date($published)) : '',
  $readingTime > 0 ? strtoupper((string)$readingTime . ' MIN READ') : ''
]))));
$bodyHtml = (string)($post['body_html'] ?? '');

$ld = [
  '@context' => 'https://schema.org',
  '@type' => 'BlogPosting',
  'headline' => $title,
  'description' => $excerpt,
  'image' => [$featuredAbs],
  'datePublished' => $published,
  'dateModified' => $updated,
  'author' => ['@type' => 'Organization', 'name' => 'NaijaRate'],
  'publisher' => ['@type' => 'Organization', 'name' => 'NaijaRate'],
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
  <meta property="og:site_name" content="NaijaRate">
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
    .post-hero { margin-bottom: 1rem; }
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
    <a href="/" class="nav-logo">🇳🇬 Naija<span>Rate</span> <span class="badge">Beta</span></a>
    <div class="nav-links">
      <a href="/" class="nav-link show-mobile">Officials</a>
      <a href="/leaderboard" class="nav-link">Rankings</a>
      <a href="/polls" class="nav-link">Polls</a>
      <a href="/blog" class="nav-link active">Blog</a>
      <a href="/news" class="nav-link">News</a>
    </div>
  </nav>

  <div class="section">
    <div class="container post-wrap">
      <div class="page-header">
        <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;">
          <a href="/blog" class="btn btn-ghost btn-sm">Back to Blog</a>
          <a href="/polls" class="btn btn-green btn-sm">See Polls</a>
        </div>
        <p class="page-sub" style="margin-top:.8rem;">Short gist, long lesson. Read am finish.</p>
      </div>

      <article class="card">
        <h1 class="post-title"><?= nr_h($title) ?></h1>
        <div class="post-meta"><?= nr_h($metaLine) ?></div>
        <div class="post-hero">
          <img class="post-img" alt="<?= nr_h((string)($post['featured_image_alt'] ?? $title)) ?>" src="<?= nr_h($featured) ?>">
        </div>
        <div class="post-body"><?= $bodyHtml ?></div>
        <div class="post-cta">
          <a href="/blog" class="btn btn-ghost">More Blog Posts</a>
          <a href="/" class="btn btn-green">Rate an Official</a>
        </div>
      </article>
    </div>
  </div>

  <footer class="site-footer">
    <strong>NaijaRate</strong> — Civic insights for informed public participation<br>
    <a href="/" style="color:var(--green-light);">Officials</a> ·
    <a href="/leaderboard" style="color:var(--green-light);">Rankings</a> ·
    <a href="/news" style="color:var(--green-light);">News Updates</a>
  </footer>
</body>
</html>
