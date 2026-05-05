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

function nr_read_cron_token(): string {
  $hdr = $_SERVER['HTTP_X_CRON_TOKEN'] ?? '';
  if (is_string($hdr) && trim($hdr) !== '') return trim($hdr);
  $q = $_GET['cron_token'] ?? '';
  return is_string($q) ? trim($q) : '';
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

function nr_fetch(string $url, int $timeout = 20): string {
  if (!preg_match('#^https?://#i', $url)) return '';
  if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'evote.ng-news-ingestor/1.0');
    $resp = curl_exec($ch);
    curl_close($ch);
    return $resp === false ? '' : (string)$resp;
  }
  $ctx = stream_context_create(['http' => [
    'method' => 'GET',
    'timeout' => $timeout,
    'header' => "User-Agent: evote.ng-news-ingestor/1.0\r\nAccept: application/rss+xml, application/xml, text/xml, */*",
    'ignore_errors' => true,
  ]]);
  $resp = @file_get_contents($url, false, $ctx);
  return $resp === false ? '' : (string)$resp;
}

function nr_canonical_url(string $url): string {
  $s = trim($url);
  $s = preg_replace('/\s+/', '', $s);
  if ($s === '') return '';
  if (stripos($s, 'http://') === 0) $s = 'https://' . substr($s, 7);
  $p = @parse_url($s);
  if (!is_array($p) || empty($p['host'])) return $s;
  $host = strtolower((string)$p['host']);
  $path = isset($p['path']) ? (string)$p['path'] : '';
  $path = preg_replace('#/+#', '/', $path);
  $query = '';
  if (!empty($p['query'])) {
    parse_str((string)$p['query'], $q);
    foreach ($q as $k => $v) {
      $kl = strtolower((string)$k);
      if ($kl === '' || str_starts_with($kl, 'utm_')) { unset($q[$k]); continue; }
      if (in_array($kl, ['fbclid','gclid','igshid','ref','ref_src','source','mc_cid','mc_eid','_ga','_gid','_gl','gbraid','wbraid'], true)) { unset($q[$k]); continue; }
      if ($v === '' || $v === null) unset($q[$k]);
    }
    ksort($q);
    $query = http_build_query($q);
  }
  $scheme = 'https';
  $out = $scheme . '://' . $host;
  if ($path !== '') $out .= $path;
  if ($query !== '') $out .= '?' . $query;
  return $out;
}

function nr_parse_rss(string $xml): array {
  if ($xml === '') return [];
  libxml_use_internal_errors(true);
  $sx = @simplexml_load_string($xml);
  if (!$sx) return [];
  $items = [];
  if (isset($sx->channel->item)) {
    foreach ($sx->channel->item as $it) {
      $title = trim((string)($it->title ?? ''));
      $link = trim((string)($it->link ?? ''));
      $pub = trim((string)($it->pubDate ?? ''));
      $desc = trim((string)($it->description ?? ''));
      $cats = [];
      if (isset($it->category)) {
        foreach ($it->category as $c) {
          $v = trim((string)$c);
          if ($v !== '') $cats[] = $v;
        }
      }
      if ($title === '' || $link === '') continue;
      $items[] = ['title' => $title, 'url' => $link, 'published_at' => $pub, 'description' => $desc, 'categories' => $cats];
    }
  } elseif (isset($sx->entry)) {
    foreach ($sx->entry as $it) {
      $title = trim((string)($it->title ?? ''));
      $link = '';
      if (isset($it->link)) {
        foreach ($it->link as $lnk) {
          $href = (string)($lnk['href'] ?? '');
          if ($href !== '') { $link = $href; break; }
        }
      }
      $pub = trim((string)($it->updated ?? ($it->published ?? '')));
      $desc = trim((string)($it->summary ?? ($it->content ?? '')));
      $cats = [];
      if (isset($it->category)) {
        foreach ($it->category as $c) {
          $term = (string)($c['term'] ?? '');
          $v = trim($term !== '' ? $term : (string)$c);
          if ($v !== '') $cats[] = $v;
        }
      }
      if ($title === '' || $link === '') continue;
      $items[] = ['title' => $title, 'url' => $link, 'published_at' => $pub, 'description' => $desc, 'categories' => $cats];
    }
  }
  return $items;
}

function nr_is_politics_item(string $title, string $desc, array $categories, ?string $topic): bool {
  $hay = mb_strtolower(trim($title . ' ' . $desc), 'UTF-8');
  $cat = mb_strtolower(trim(implode(' ', array_map(fn($x) => (string)$x, $categories))), 'UTF-8');
  $t = mb_strtolower(trim((string)($topic ?? '')), 'UTF-8');
  $good = [
    'politic', 'election', 'govern', 'president', 'tinubu', 'senate', 'house of reps', 'assembly', 'governor',
    'minister', 'commissioner', 'inec', 'apc', 'pdp', 'lp', 'nnpp', 'supreme court', 'tribunal', 'policy',
    'budget', 'national assembly', 'state house', 'aso rock', 'cabinet', 'federal government', 'fg', 'nass'
  ];
  $bad = ['sport', 'entertain', 'music', 'movie', 'nollywood', 'celebrity', 'fashion', 'lifestyle', 'relationship', 'gossip'];

  if ($t !== '') {
    if (in_array($t, ['policy','scandal','achievement','economy','security','governance','election'], true)) return true;
  }
  foreach ($good as $w) {
    if (str_contains($hay, $w) || str_contains($cat, $w)) return true;
  }
  foreach ($bad as $w) {
    if (str_contains($hay, $w) || str_contains($cat, $w)) return false;
  }
  return false;
}

function nr_official_candidates(): array {
  $res = sb_rest('/officials?select=id,full_name,common_name,role,tier&status=eq.active&limit=3000', 'GET', [], null);
  if (!$res['ok'] || !is_array($res['json'])) return [];
  $out = [];
  foreach ($res['json'] as $o) {
    if (!is_array($o)) continue;
    $id = (string)($o['id'] ?? '');
    $name = trim((string)($o['full_name'] ?? ''));
    if ($id === '' || $name === '') continue;
    $tier = strtolower((string)($o['tier'] ?? ''));
    if (!in_array($tier, ['federal_executive','state_executive','federal_agency','state_agency','federal_legislature','state_legislature','military_security'], true)) continue;
    $common = trim((string)($o['common_name'] ?? ''));
    $out[] = ['id' => $id, 'full_name' => $name, 'common_name' => $common];
  }
  return $out;
}

function nr_politician_candidates(): array {
  $res = sb_rest('/politicians?select=id,full_name,common_name,party,aliases,is_active&is_active=eq.true&limit=2000', 'GET', [], null);
  if (!$res['ok'] || !is_array($res['json'])) return [];
  $out = [];
  foreach ($res['json'] as $p) {
    if (!is_array($p)) continue;
    $id = (string)($p['id'] ?? '');
    $name = trim((string)($p['full_name'] ?? ''));
    if ($id === '' || $name === '') continue;
    $common = trim((string)($p['common_name'] ?? ''));
    $aliases = [];
    if (isset($p['aliases']) && is_array($p['aliases'])) {
      foreach ($p['aliases'] as $a) {
        $v = is_string($a) ? trim($a) : '';
        if ($v !== '') $aliases[] = $v;
      }
    }
    $out[] = ['id' => $id, 'full_name' => $name, 'common_name' => $common, 'aliases' => array_values(array_slice(array_unique($aliases), 0, 12))];
  }
  return $out;
}

function nr_name_variants(string $fullName, string $commonName): array {
  $names = [];
  $f = trim($fullName);
  if ($f !== '') $names[] = $f;
  $c = trim($commonName);
  if ($c !== '' && mb_strlen($c, 'UTF-8') >= 3) $names[] = $c;

  $parts = preg_split('/\s+/', $f) ?: [];
  $parts = array_values(array_filter(array_map('trim', $parts), fn($x) => $x !== ''));
  if (count($parts) >= 2) {
    $first = $parts[0];
    $last = $parts[count($parts) - 1];
    $names[] = $first . ' ' . $last;
  }

  $uniq = [];
  foreach ($names as $n) {
    $k = mb_strtolower($n, 'UTF-8');
    if (!isset($uniq[$k])) $uniq[$k] = $n;
  }
  return array_values($uniq);
}

function nr_name_variants_with_aliases(string $fullName, string $commonName, array $aliases): array {
  $names = nr_name_variants($fullName, $commonName);
  foreach ($aliases as $a) {
    $v = is_string($a) ? trim($a) : '';
    if ($v !== '') $names[] = $v;
  }
  $uniq = [];
  foreach ($names as $n) {
    $k = mb_strtolower($n, 'UTF-8');
    if (!isset($uniq[$k])) $uniq[$k] = $n;
  }
  return array_values($uniq);
}

function nr_match_officials_to_item(array $candidates, string $title, string $desc, ?string $summary): array {
  $text = mb_strtolower(trim($title . ' ' . $desc . ' ' . (string)($summary ?? '')), 'UTF-8');
  if ($text === '') return [];
  $matches = [];
  foreach ($candidates as $o) {
    $oid = (string)($o['id'] ?? '');
    $full = (string)($o['full_name'] ?? '');
    $common = (string)($o['common_name'] ?? '');
    if ($oid === '' || $full === '') continue;

    $best = 0.0;
    $terms = [];
    foreach (nr_name_variants($full, $common) as $variant) {
      $v = mb_strtolower($variant, 'UTF-8');
      if (mb_strlen($v, 'UTF-8') < 5) continue;
      $re = '/(^|[^\pL\pN])' . preg_quote($v, '/') . '([^\pL\pN]|$)/u';
      if (preg_match($re, $text) === 1) {
        $terms[] = $variant;
        if ($variant === $full) $best = max($best, 0.95);
        else if ($variant === $common && $common !== '') $best = max($best, 0.85);
        else $best = max($best, 0.75);
      }
    }
    if ($best > 0 && count($terms)) {
      $matches[] = ['profile_type' => 'official', 'profile_id' => $oid, 'confidence' => $best, 'method' => 'keyword', 'matched_terms' => array_values(array_slice(array_unique($terms), 0, 8))];
    }
  }

  usort($matches, fn($a, $b) => ($b['confidence'] <=> $a['confidence']));
  return array_slice($matches, 0, 10);
}

function nr_match_politicians_to_item(array $candidates, string $title, string $desc, ?string $summary): array {
  $text = mb_strtolower(trim($title . ' ' . $desc . ' ' . (string)($summary ?? '')), 'UTF-8');
  if ($text === '') return [];
  $matches = [];
  foreach ($candidates as $p) {
    $pid = (string)($p['id'] ?? '');
    $full = (string)($p['full_name'] ?? '');
    $common = (string)($p['common_name'] ?? '');
    $aliases = isset($p['aliases']) && is_array($p['aliases']) ? $p['aliases'] : [];
    if ($pid === '' || $full === '') continue;

    $best = 0.0;
    $terms = [];
    foreach (nr_name_variants_with_aliases($full, $common, $aliases) as $variant) {
      $v = mb_strtolower($variant, 'UTF-8');
      if (mb_strlen($v, 'UTF-8') < 5) continue;
      $re = '/(^|[^\pL\pN])' . preg_quote($v, '/') . '([^\pL\pN]|$)/u';
      if (preg_match($re, $text) === 1) {
        $terms[] = $variant;
        if ($variant === $full) $best = max($best, 0.95);
        else if ($variant === $common && $common !== '') $best = max($best, 0.85);
        else $best = max($best, 0.7);
      }
    }
    if ($best > 0 && count($terms)) {
      $matches[] = ['profile_type' => 'politician', 'profile_id' => $pid, 'confidence' => $best, 'method' => 'keyword', 'matched_terms' => array_values(array_slice(array_unique($terms), 0, 8))];
    }
  }

  usort($matches, fn($a, $b) => ($b['confidence'] <=> $a['confidence']));
  return array_slice($matches, 0, 10);
}

function nr_to_ts(?string $s): ?string {
  if (!$s) return null;
  $t = strtotime($s);
  if ($t === false) return null;
  return gmdate('c', $t);
}

function nr_openrouter_analyze(string $title, string $desc): ?array {
  $secrets = nr_load_secrets();
  $key = (string)($secrets['OPENROUTER_API_KEY'] ?? '') ?: nr_env('OPENROUTER_API_KEY');
  $model = (string)($secrets['OPENROUTER_MODEL'] ?? '') ?: (nr_env('OPENROUTER_MODEL') ?: 'openai/gpt-4o-mini');
  if ($key === '') return null;

  $prompt = "Return strict JSON with keys: summary (max 35 words), sentiment_score (number -1..1), topic (one of: policy, scandal, achievement, economy, security, governance, election, general).\nTitle: " . $title . "\nSnippet: " . $desc;
  $req = [
    'model' => $model,
    'messages' => [
      ['role' => 'system', 'content' => 'You are a strict JSON generator. Output JSON only.'],
      ['role' => 'user', 'content' => $prompt],
    ],
    'temperature' => 0.2,
    'max_tokens' => 250,
  ];

  $siteUrl = (string)($_SERVER['HTTP_HOST'] ?? 'evote.ng');
  $resp = nr_http_json('https://openrouter.ai/api/v1/chat/completions', 'POST', [
    'Authorization' => 'Bearer ' . $key,
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'HTTP-Referer' => 'https://' . $siteUrl,
    'X-Title' => 'evote.ng News Ingest',
  ], json_encode($req, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), 40);
  if (!$resp['ok'] || !is_array($resp['json'])) return null;
  $content = $resp['json']['choices'][0]['message']['content'] ?? '';
  if (!is_string($content) || trim($content) === '') return null;
  $json = json_decode($content, true);
  if (!is_array($json)) return null;
  $summary = isset($json['summary']) ? trim((string)$json['summary']) : '';
  $sent = isset($json['sentiment_score']) ? (float)$json['sentiment_score'] : null;
  $topic = isset($json['topic']) ? trim((string)$json['topic']) : null;
  if ($summary === '') return null;
  if ($sent !== null) {
    if ($sent > 1) $sent = 1;
    if ($sent < -1) $sent = -1;
  }
  return ['summary' => $summary, 'sentiment_score' => $sent, 'topic' => $topic];
}

function nr_ingest_run(): array {
  $srcResp = sb_rest('/news_sources?select=id,name,feed_url,credibility_tier,is_active&is_active=eq.true&credibility_tier=not.eq.blocked', 'GET', [], null);
  if (!$srcResp['ok'] || !is_array($srcResp['json'])) return ['ok' => false, 'error' => 'Unable to load sources'];
  $sources = $srcResp['json'];
  $officialCandidates = nr_official_candidates();
  $politicianCandidates = nr_politician_candidates();
  $total = 0;
  $inserted = 0;
  $errors = [];

  foreach ($sources as $src) {
    $feed = is_array($src) ? (string)($src['feed_url'] ?? '') : '';
    $sid = is_array($src) ? (string)($src['id'] ?? '') : '';
    if ($feed === '' || $sid === '') continue;

    $xml = nr_fetch($feed, 25);
    if ($xml === '') { $errors[] = ['source_id' => $sid, 'error' => 'Unable to fetch feed']; continue; }
    $items = nr_parse_rss($xml);
    if (!count($items)) continue;

    $rows = [];
    foreach (array_slice($items, 0, 30) as $it) {
      $total++;
      $url = nr_canonical_url((string)$it['url']);
      if ($url === '') continue;
      $title = trim((string)$it['title']);
      $desc = trim((string)($it['description'] ?? ''));
      $cats = isset($it['categories']) && is_array($it['categories']) ? $it['categories'] : [];
      $published = nr_to_ts((string)($it['published_at'] ?? ''));
      $hashBase = mb_strtolower(preg_replace('/\s+/', ' ', $title . ' ' . $url), 'UTF-8');
      $contentHash = hash('sha256', $hashBase);

      $ai = nr_openrouter_analyze($title, $desc);
      $summary = $ai ? (string)($ai['summary'] ?? '') : '';
      $sent = $ai && array_key_exists('sentiment_score', $ai) ? $ai['sentiment_score'] : null;
      $topic = $ai ? (string)($ai['topic'] ?? '') : '';
      $isPolitics = nr_is_politics_item($title, $desc, $cats, $topic !== '' ? $topic : null);
      $matches1 = count($officialCandidates) ? nr_match_officials_to_item($officialCandidates, $title, $desc, $summary !== '' ? $summary : null) : [];
      $matches2 = count($politicianCandidates) ? nr_match_politicians_to_item($politicianCandidates, $title, $desc, $summary !== '' ? $summary : null) : [];
      $matches = array_slice(array_merge($matches1, $matches2), 0, 10);
      $matchSummary = count($matches) ? array_map(fn($m) => ['profile_type' => $m['profile_type'], 'profile_id' => $m['profile_id'], 'confidence' => $m['confidence']], $matches) : [];

      $rows[] = [
        'source_id' => $sid,
        'title' => $title,
        'url' => $url,
        'published_at' => $published,
        'content_hash' => $contentHash,
        'raw_json' => ['description' => $desc],
        'summary' => $summary !== '' ? $summary : null,
        'sentiment_score' => $sent,
        'topic' => $topic !== '' ? $topic : null,
        'categories' => count($cats) ? array_values($cats) : null,
        'is_politics' => $isPolitics,
        'matched_profiles' => count($matchSummary) ? $matchSummary : null,
        'moderation_status' => 'pending',
      ];
    }

    if (!count($rows)) continue;
    $ins = sb_rest('/news_items?on_conflict=url', 'POST', [
      'Content-Type' => 'application/json',
      'Prefer' => 'resolution=merge-duplicates,return=representation',
    ], $rows);
    if (!$ins['ok'] || !is_array($ins['json'])) {
      $errors[] = ['source_id' => $sid, 'error' => 'Insert failed', 'details' => $ins['raw'] ?? null];
      continue;
    }

    $inserted += count($ins['json']);

    $matchRows = [];
    foreach ($ins['json'] as $saved) {
      if (!is_array($saved)) continue;
      $nid = (string)($saved['id'] ?? '');
      if ($nid === '') continue;
      $title2 = (string)($saved['title'] ?? '');
      $sum2 = (string)($saved['summary'] ?? '');
      $desc2 = '';
      if (isset($saved['raw_json']) && is_array($saved['raw_json'])) $desc2 = (string)($saved['raw_json']['description'] ?? '');
      $m1 = count($officialCandidates) ? nr_match_officials_to_item($officialCandidates, $title2, $desc2, $sum2 !== '' ? $sum2 : null) : [];
      $m2 = count($politicianCandidates) ? nr_match_politicians_to_item($politicianCandidates, $title2, $desc2, $sum2 !== '' ? $sum2 : null) : [];
      $m = array_slice(array_merge($m1, $m2), 0, 10);
      foreach ($m as $row) {
        $row['news_item_id'] = $nid;
        $matchRows[] = $row;
      }
    }

    if (count($matchRows)) {
      sb_rest('/news_profile_matches?on_conflict=profile_type,profile_id,news_item_id', 'POST', [
        'Content-Type' => 'application/json',
        'Prefer' => 'resolution=merge-duplicates,return=minimal',
      ], $matchRows);
    }
  }

  sb_rest('/news_audit_log', 'POST', [
    'Content-Type' => 'application/json',
    'Prefer' => 'return=minimal',
  ], [
    'actor_user_id' => null,
    'action' => 'INGEST_RUN',
    'target_type' => 'SYSTEM',
    'target_id' => null,
    'reason' => null,
    'meta' => ['total_seen' => $total, 'rows_written' => $inserted, 'errors' => $errors],
  ]);

  return ['ok' => true, 'total_seen' => $total, 'rows_written' => $inserted, 'errors' => $errors];
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'POST') nr_json(405, ['error' => 'Method not allowed']);
$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;
if (!is_array($payload)) nr_json(400, ['error' => 'Invalid JSON body']);

$action = isset($payload['action']) && is_string($payload['action']) ? strtolower(trim($payload['action'])) : '';

$secrets = nr_load_secrets();
$cronToken = nr_read_cron_token();
$cronSecret = is_array($secrets) ? (string)($secrets['NEWS_CRON_TOKEN'] ?? '') : '';
$isCron = ($cronSecret !== '' && $cronToken !== '' && hash_equals($cronSecret, $cronToken));

if (!($isCron && $action === 'run_ingest')) {
  nr_require_admin();
}

if ($action === 'run_ingest') {
  $res = nr_ingest_run();
  nr_json(200, $res);
}

if ($action === 'set_item_status') {
  $itemId = isset($payload['item_id']) && is_string($payload['item_id']) ? trim($payload['item_id']) : '';
  $status = isset($payload['status']) && is_string($payload['status']) ? strtolower(trim($payload['status'])) : '';
  $reason = isset($payload['reason']) && is_string($payload['reason']) ? trim($payload['reason']) : '';
  if ($itemId === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $itemId)) nr_json(400, ['error' => 'Invalid item_id']);
  if (!in_array($status, ['approved','rejected','pending'], true)) nr_json(400, ['error' => 'Invalid status']);
  if ($reason === '') nr_json(400, ['error' => 'Reason is required']);

  $before = sb_rest('/news_items?select=id,moderation_status&limit=1&id=eq.' . rawurlencode($itemId), 'GET', [], null);
  $prev = ($before['ok'] && is_array($before['json']) && count($before['json'])) ? $before['json'][0] : null;

  $upd = sb_rest('/news_items?id=eq.' . rawurlencode($itemId), 'PATCH', [
    'Content-Type' => 'application/json',
    'Prefer' => 'return=representation',
  ], ['moderation_status' => $status]);
  if (!$upd['ok'] || !is_array($upd['json']) || !count($upd['json'])) nr_json(500, ['error' => 'Update failed']);

  sb_rest('/news_audit_log', 'POST', [
    'Content-Type' => 'application/json',
    'Prefer' => 'return=minimal',
  ], [
    'actor_user_id' => null,
    'action' => 'MODERATION_STATUS',
    'target_type' => 'NEWS_ITEM',
    'target_id' => $itemId,
    'reason' => $reason,
    'meta' => ['before' => $prev, 'after' => $upd['json'][0]],
  ]);

  nr_json(200, ['ok' => true]);
}

if ($action === 'upsert_source') {
  $id = isset($payload['id']) && is_string($payload['id']) ? trim($payload['id']) : '';
  $name = isset($payload['name']) && is_string($payload['name']) ? trim($payload['name']) : '';
  $home = isset($payload['home_url']) && is_string($payload['home_url']) ? trim($payload['home_url']) : '';
  $feed = isset($payload['feed_url']) && is_string($payload['feed_url']) ? trim($payload['feed_url']) : '';
  $tier = isset($payload['credibility_tier']) && is_string($payload['credibility_tier']) ? trim($payload['credibility_tier']) : 'tier2';
  $active = isset($payload['is_active']) ? (bool)$payload['is_active'] : true;
  if ($name === '' || $home === '' || $feed === '') nr_json(400, ['error' => 'Missing required fields']);
  if (!in_array($tier, ['tier1','tier2','blocked'], true)) nr_json(400, ['error' => 'Invalid tier']);
  $row = [
    'name' => $name,
    'home_url' => $home,
    'feed_url' => $feed,
    'ingest_type' => 'rss',
    'credibility_tier' => $tier,
    'is_active' => $active,
  ];
  if ($id !== '' && preg_match('/^[0-9a-f\-]{36}$/i', $id)) $row['id'] = $id;

  $ins = sb_rest('/news_sources?on_conflict=feed_url', 'POST', [
    'Content-Type' => 'application/json',
    'Prefer' => 'resolution=merge-duplicates,return=representation',
  ], [$row]);
  if (!$ins['ok'] || !is_array($ins['json']) || !count($ins['json'])) nr_json(500, ['error' => 'Upsert failed']);

  sb_rest('/news_audit_log', 'POST', [
    'Content-Type' => 'application/json',
    'Prefer' => 'return=minimal',
  ], [
    'actor_user_id' => null,
    'action' => 'SOURCE_UPSERT',
    'target_type' => 'NEWS_SOURCE',
    'target_id' => $ins['json'][0]['id'] ?? null,
    'reason' => null,
    'meta' => ['row' => $ins['json'][0]],
  ]);

  nr_json(200, ['ok' => true, 'source' => $ins['json'][0]]);
}

nr_json(400, ['error' => 'Unknown action']);
