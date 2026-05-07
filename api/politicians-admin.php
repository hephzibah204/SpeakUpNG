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

function nr_wikipedia_summary(string $title, string $ua): array {
  $title = trim($title);
  if ($title === '') return ['ok' => false, 'json' => null];
  $url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' . rawurlencode($title);
  return nr_http_json($url, 'GET', ['Accept' => 'application/json', 'User-Agent' => $ua], null, 18);
}

function nr_wikipedia_extract(string $title, int $chars, string $ua): array {
  $title = trim($title);
  if ($title === '') return ['ok' => false, 'json' => null];
  $qs = http_build_query([
    'action' => 'query',
    'format' => 'json',
    'redirects' => 1,
    'prop' => 'extracts',
    'explaintext' => 1,
    'exsectionformat' => 'plain',
    'exchars' => $chars,
    'titles' => $title,
  ]);
  $url = 'https://en.wikipedia.org/w/api.php?' . $qs;
  return nr_http_json($url, 'GET', ['Accept' => 'application/json', 'User-Agent' => $ua], null, 22);
}

function nr_pick_wikipedia_extract(?array $json): string {
  if (!$json) return '';
  $pages = $json['query']['pages'] ?? null;
  if (!is_array($pages)) return '';
  foreach ($pages as $p) {
    if (!is_array($p)) continue;
    $ex = $p['extract'] ?? '';
    if (is_string($ex) && trim($ex) !== '') return trim($ex);
    return '';
  }
  return '';
}

function nr_words_limit(string $text, int $maxWords): string {
  $t = trim(preg_replace('/\s+/', ' ', $text) ?? $text);
  if ($t === '') return '';
  $parts = preg_split('/\s+/', $t) ?: [];
  if (count($parts) <= $maxWords) return $t;
  return implode(' ', array_slice($parts, 0, $maxWords));
}

function nr_pick_wikipedia_photo(?array $json): string {
  if (!$json) return '';
  $thumb = $json['thumbnail']['source'] ?? '';
  if (is_string($thumb) && trim($thumb) !== '') return trim($thumb);
  $orig = $json['originalimage']['source'] ?? '';
  if (is_string($orig) && trim($orig) !== '') return trim($orig);
  return '';
}

function nr_pick_wikipedia_url(?array $json): string {
  if (!$json) return '';
  $u = $json['content_urls']['desktop']['page'] ?? '';
  return is_string($u) ? trim($u) : '';
}

function nr_wikipedia_best_match(string $preferredTitle, array $fallbackTitles, string $ua): array {
  $titles = array_values(array_filter(array_merge([trim($preferredTitle)], $fallbackTitles), fn($x) => is_string($x) && trim($x) !== ''));
  foreach ($titles as $t) {
    $res = nr_wikipedia_summary($t, $ua);
    if (!$res['ok'] || !is_array($res['json'])) continue;
    $j = $res['json'];
    $type = (string)($j['type'] ?? '');
    if ($type === 'disambiguation') continue;
    $photo = nr_pick_wikipedia_photo($j);
    if ($photo === '') continue;
    return ['ok' => true, 'title' => (string)($j['title'] ?? $t), 'photo_url' => $photo, 'wiki_url' => nr_pick_wikipedia_url($j)];
  }
  return ['ok' => false, 'title' => '', 'photo_url' => '', 'wiki_url' => ''];
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

  $aspiringFor = isset($payload['aspiring_for']) && is_string($payload['aspiring_for']) ? trim($payload['aspiring_for']) : '';
  $previousOffices = isset($payload['previous_offices']) && is_string($payload['previous_offices']) ? trim($payload['previous_offices']) : '';
  $wikiTitle = isset($payload['wiki_title']) && is_string($payload['wiki_title']) ? trim($payload['wiki_title']) : '';
  $wikiUrl = isset($payload['wiki_url']) && is_string($payload['wiki_url']) ? trim($payload['wiki_url']) : '';

  $row = [
    'full_name' => $full,
    'common_name' => ($common !== '' ? $common : null),
    'party' => $party,
    'aspiration_title' => ($title !== '' ? $title : null),
    'aspiring_for' => ($aspiringFor !== '' ? $aspiringFor : null),
    'previous_offices' => ($previousOffices !== '' ? $previousOffices : null),
    'wiki_title' => ($wikiTitle !== '' ? $wikiTitle : null),
    'wiki_url' => ($wikiUrl !== '' ? $wikiUrl : null),
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

if ($action === 'fetch_photo') {
  $id = isset($payload['id']) && is_string($payload['id']) ? trim($payload['id']) : '';
  if ($id === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $id)) nr_json(400, ['error' => 'Invalid id']);

  $get = sb_rest('/politicians?select=id,full_name,common_name,wiki_title&limit=1&id=eq.' . rawurlencode($id), 'GET', [], null);
  if (!$get['ok'] || !is_array($get['json']) || !count($get['json'])) nr_json(404, ['error' => 'Not found']);
  $p = $get['json'][0];
  $full = (string)($p['full_name'] ?? '');
  $common = (string)($p['common_name'] ?? '');
  $wikiTitle = (string)($p['wiki_title'] ?? '');

  $ua = 'evote.ng-politicians-admin/1.0';
  $res = nr_wikipedia_best_match($wikiTitle, [$common, $full], $ua);
  if (!$res['ok']) nr_json(200, ['ok' => true, 'updated' => false, 'message' => 'No Wikipedia photo found']);

  $upd = sb_rest('/politicians?id=eq.' . rawurlencode($id), 'PATCH', [
    'Content-Type' => 'application/json',
    'Prefer' => 'return=representation',
  ], [[
    'photo_url' => $res['photo_url'],
    'wiki_title' => $res['title'] !== '' ? $res['title'] : null,
    'wiki_url' => $res['wiki_url'] !== '' ? $res['wiki_url'] : null,
  ]]);
  if (!$upd['ok'] || !is_array($upd['json']) || !count($upd['json'])) nr_json(500, ['error' => 'Update failed', 'details' => $upd['raw'] ?? null]);
  nr_json(200, ['ok' => true, 'updated' => true, 'politician' => $upd['json'][0]]);
}

if ($action === 'fetch_bio') {
  $id = isset($payload['id']) && is_string($payload['id']) ? trim($payload['id']) : '';
  if ($id === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $id)) nr_json(400, ['error' => 'Invalid id']);

  $get = sb_rest('/politicians?select=id,full_name,common_name,wiki_title,profile_bio,bio&limit=1&id=eq.' . rawurlencode($id), 'GET', [], null);
  if (!$get['ok'] || !is_array($get['json']) || !count($get['json'])) nr_json(404, ['error' => 'Not found']);
  $p = $get['json'][0];
  $full = (string)($p['full_name'] ?? '');
  $common = (string)($p['common_name'] ?? '');
  $wikiTitle = (string)($p['wiki_title'] ?? '');

  $ua = 'evote.ng-politicians-admin/1.0';
  $best = nr_wikipedia_best_match($wikiTitle, [$common, $full], $ua);
  $title = $best['ok'] ? (string)($best['title'] ?? '') : '';
  if ($title === '') $title = $wikiTitle !== '' ? $wikiTitle : ($common !== '' ? $common : $full);

  $ex = nr_wikipedia_extract($title, 6500, $ua);
  if (!$ex['ok'] || !is_array($ex['json'])) nr_json(200, ['ok' => true, 'updated' => false, 'message' => 'No Wikipedia extract found']);
  $rawBio = nr_pick_wikipedia_extract($ex['json']);
  if ($rawBio === '') nr_json(200, ['ok' => true, 'updated' => false, 'message' => 'No Wikipedia extract found']);

  $long = nr_words_limit($rawBio, 500);
  $short = nr_words_limit($rawBio, 120);
  $upd = sb_rest('/politicians?id=eq.' . rawurlencode($id), 'PATCH', [
    'Content-Type' => 'application/json',
    'Prefer' => 'return=representation',
  ], [[
    'profile_bio' => $long !== '' ? $long : null,
    'bio' => $short !== '' ? $short : null,
    'bio_source' => 'wikipedia',
    'bio_updated_at' => gmdate('c'),
    'wiki_title' => $title !== '' ? $title : null,
  ]]);
  if (!$upd['ok'] || !is_array($upd['json']) || !count($upd['json'])) nr_json(500, ['error' => 'Update failed', 'details' => $upd['raw'] ?? null]);
  nr_json(200, ['ok' => true, 'updated' => true, 'politician' => $upd['json'][0]]);
}

if ($action === 'bulk_fetch_bios') {
  $limit = isset($payload['limit']) ? (int)$payload['limit'] : 200;
  if ($limit < 1) $limit = 1;
  if ($limit > 3000) $limit = 3000;

  $list = sb_rest('/politicians?select=id,full_name,common_name,wiki_title,profile_bio,is_active&is_active=eq.true&limit=' . $limit, 'GET', [], null);
  if (!$list['ok'] || !is_array($list['json'])) nr_json(500, ['error' => 'Unable to load politicians']);
  $ua = 'evote.ng-politicians-admin/1.0';
  $updated = 0;
  $skipped = 0;
  $failed = 0;
  foreach ($list['json'] as $p) {
    if (!is_array($p)) continue;
    $id = (string)($p['id'] ?? '');
    if ($id === '') continue;
    $pb = is_string($p['profile_bio'] ?? null) ? trim((string)$p['profile_bio']) : '';
    if ($pb !== '' && mb_strlen($pb, 'UTF-8') >= 800) { $skipped++; continue; }
    $full = (string)($p['full_name'] ?? '');
    $common = (string)($p['common_name'] ?? '');
    $wikiTitle = (string)($p['wiki_title'] ?? '');
    $best = nr_wikipedia_best_match($wikiTitle, [$common, $full], $ua);
    $title = $best['ok'] ? (string)($best['title'] ?? '') : '';
    if ($title === '') $title = $wikiTitle !== '' ? $wikiTitle : ($common !== '' ? $common : $full);
    $ex = nr_wikipedia_extract($title, 6500, $ua);
    if (!$ex['ok'] || !is_array($ex['json'])) { $failed++; continue; }
    $rawBio = nr_pick_wikipedia_extract($ex['json']);
    if ($rawBio === '') { $failed++; continue; }
    $long = nr_words_limit($rawBio, 500);
    $short = nr_words_limit($rawBio, 120);
    $upd = sb_rest('/politicians?id=eq.' . rawurlencode($id), 'PATCH', [
      'Content-Type' => 'application/json',
      'Prefer' => 'return=minimal',
    ], [[
      'profile_bio' => $long !== '' ? $long : null,
      'bio' => $short !== '' ? $short : null,
      'bio_source' => 'wikipedia',
      'bio_updated_at' => gmdate('c'),
      'wiki_title' => $title !== '' ? $title : null,
    ]]);
    if ($upd['ok']) $updated++; else $failed++;
    usleep(350000);
  }
  nr_json(200, ['ok' => true, 'updated' => $updated, 'skipped' => $skipped, 'failed' => $failed]);
}

if ($action === 'bulk_fetch_photos') {
  $limit = isset($payload['limit']) ? (int)$payload['limit'] : 50;
  if ($limit < 1) $limit = 1;
  if ($limit > 3000) $limit = 3000;

  $list = sb_rest('/politicians?select=id,full_name,common_name,wiki_title,photo_url&is_active=eq.true&limit=' . $limit, 'GET', [], null);
  if (!$list['ok'] || !is_array($list['json'])) nr_json(500, ['error' => 'Unable to load politicians']);
  $ua = 'evote.ng-politicians-admin/1.0';
  $updated = 0;
  $skipped = 0;
  $failed = 0;
  foreach ($list['json'] as $p) {
    if (!is_array($p)) continue;
    $id = (string)($p['id'] ?? '');
    if ($id === '') continue;
    if (is_string($p['photo_url'] ?? null) && trim((string)$p['photo_url']) !== '') { $skipped++; continue; }
    $full = (string)($p['full_name'] ?? '');
    $common = (string)($p['common_name'] ?? '');
    $wikiTitle = (string)($p['wiki_title'] ?? '');
    $res = nr_wikipedia_best_match($wikiTitle, [$common, $full], $ua);
    if (!$res['ok']) { $failed++; continue; }
    $upd = sb_rest('/politicians?id=eq.' . rawurlencode($id), 'PATCH', [
      'Content-Type' => 'application/json',
      'Prefer' => 'return=minimal',
    ], [[
      'photo_url' => $res['photo_url'],
      'wiki_title' => $res['title'] !== '' ? $res['title'] : null,
      'wiki_url' => $res['wiki_url'] !== '' ? $res['wiki_url'] : null,
    ]]);
    if ($upd['ok']) $updated++; else $failed++;
    usleep(250000);
  }
  nr_json(200, ['ok' => true, 'updated' => $updated, 'skipped' => $skipped, 'failed' => $failed]);
}

if ($action === 'list_promises') {
  $politicianId = isset($payload['politician_id']) && is_string($payload['politician_id']) ? trim($payload['politician_id']) : '';
  if ($politicianId === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $politicianId)) nr_json(400, ['error' => 'Invalid politician_id']);
  $res = sb_rest('/official_promises?select=id,promise_title,promise_detail,promise_category,promise_date,promise_source,status,progress_percent,evidence_url,last_updated,created_at&politician_id=eq.' . rawurlencode($politicianId) . '&order=created_at.desc&limit=200', 'GET', [], null);
  if (!$res['ok'] || !is_array($res['json'])) nr_json(500, ['error' => 'Unable to load promises']);
  nr_json(200, ['ok' => true, 'promises' => $res['json']]);
}

if ($action === 'upsert_promise') {
  $politicianId = isset($payload['politician_id']) && is_string($payload['politician_id']) ? trim($payload['politician_id']) : '';
  if ($politicianId === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $politicianId)) nr_json(400, ['error' => 'Invalid politician_id']);

  $id = isset($payload['id']) && is_string($payload['id']) ? trim($payload['id']) : '';
  $title = isset($payload['promise_title']) && is_string($payload['promise_title']) ? trim($payload['promise_title']) : '';
  $detail = isset($payload['promise_detail']) && is_string($payload['promise_detail']) ? trim($payload['promise_detail']) : '';
  $category = isset($payload['promise_category']) && is_string($payload['promise_category']) ? trim($payload['promise_category']) : '';
  $date = isset($payload['promise_date']) && is_string($payload['promise_date']) ? trim($payload['promise_date']) : '';
  $source = isset($payload['promise_source']) && is_string($payload['promise_source']) ? trim($payload['promise_source']) : '';
  $status = isset($payload['status']) && is_string($payload['status']) ? trim($payload['status']) : 'pending';
  $progress = isset($payload['progress_percent']) ? (int)$payload['progress_percent'] : 0;
  $evidence = isset($payload['evidence_url']) && is_string($payload['evidence_url']) ? trim($payload['evidence_url']) : '';

  if ($title === '') nr_json(400, ['error' => 'promise_title is required']);
  $row = [
    'politician_id' => $politicianId,
    'official_id' => null,
    'promise_title' => $title,
    'promise_detail' => ($detail !== '' ? $detail : null),
    'promise_category' => ($category !== '' ? $category : null),
    'promise_date' => ($date !== '' ? $date : null),
    'promise_source' => ($source !== '' ? $source : null),
    'status' => $status,
    'progress_percent' => max(0, min(100, $progress)),
    'evidence_url' => ($evidence !== '' ? $evidence : null),
    'last_updated' => gmdate('c'),
  ];
  if ($id !== '' && preg_match('/^[0-9a-f\-]{36}$/i', $id)) $row['id'] = $id;

  $ins = sb_rest('/official_promises?on_conflict=id', 'POST', [
    'Content-Type' => 'application/json',
    'Prefer' => 'resolution=merge-duplicates,return=representation',
  ], [$row]);
  if (!$ins['ok'] || !is_array($ins['json']) || !count($ins['json'])) nr_json(500, ['error' => 'Upsert failed', 'details' => $ins['raw'] ?? null]);
  nr_json(200, ['ok' => true, 'promise' => $ins['json'][0]]);
}

if ($action === 'delete_promise') {
  $id = isset($payload['id']) && is_string($payload['id']) ? trim($payload['id']) : '';
  if ($id === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $id)) nr_json(400, ['error' => 'Invalid id']);
  $del = sb_rest('/official_promises?id=eq.' . rawurlencode($id), 'DELETE', ['Prefer' => 'return=minimal'], null);
  if (!$del['ok']) nr_json(500, ['error' => 'Delete failed', 'details' => $del['raw'] ?? null]);
  nr_json(200, ['ok' => true]);
}

if ($action === 'seed_mandate_template') {
  $politicianId = isset($payload['politician_id']) && is_string($payload['politician_id']) ? trim($payload['politician_id']) : '';
  if ($politicianId === '' || !preg_match('/^[0-9a-f\-]{36}$/i', $politicianId)) nr_json(400, ['error' => 'Invalid politician_id']);
  $kind = isset($payload['kind']) && is_string($payload['kind']) ? strtolower(trim($payload['kind'])) : 'president';
  if (!in_array($kind, ['president','governor','legislator','general'], true)) $kind = 'general';

  $existing = sb_rest('/official_promises?select=id&politician_id=eq.' . rawurlencode($politicianId) . '&limit=1', 'GET', [], null);
  if ($existing['ok'] && is_array($existing['json']) && count($existing['json']) > 0) {
    nr_json(200, ['ok' => true, 'inserted' => 0, 'message' => 'Promises already exist']);
  }

  $templates = [];
  if ($kind === 'president') {
    $templates = [
      ['promise_title' => 'Reduce cost of living and inflation', 'promise_category' => 'economy'],
      ['promise_title' => 'Improve national security and public safety', 'promise_category' => 'security'],
      ['promise_title' => 'Strengthen anti-corruption and transparency', 'promise_category' => 'governance'],
      ['promise_title' => 'Create jobs and support small businesses', 'promise_category' => 'economy'],
      ['promise_title' => 'Improve electricity and infrastructure', 'promise_category' => 'policy'],
      ['promise_title' => 'Improve education access and quality', 'promise_category' => 'policy'],
      ['promise_title' => 'Improve healthcare access and outcomes', 'promise_category' => 'policy'],
    ];
  } else if ($kind === 'governor') {
    $templates = [
      ['promise_title' => 'Improve state security and safety', 'promise_category' => 'security'],
      ['promise_title' => 'Fix and expand roads and transport', 'promise_category' => 'policy'],
      ['promise_title' => 'Improve primary healthcare services', 'promise_category' => 'policy'],
      ['promise_title' => 'Improve public education and schools', 'promise_category' => 'policy'],
      ['promise_title' => 'Create jobs and support local businesses', 'promise_category' => 'economy'],
      ['promise_title' => 'Strengthen transparency and accountability', 'promise_category' => 'governance'],
    ];
  } else if ($kind === 'legislator') {
    $templates = [
      ['promise_title' => 'Sponsor/Support bills that improve governance', 'promise_category' => 'governance'],
      ['promise_title' => 'Ensure constituency engagement and transparency', 'promise_category' => 'governance'],
      ['promise_title' => 'Push policies that reduce unemployment', 'promise_category' => 'economy'],
      ['promise_title' => 'Support reforms that improve security', 'promise_category' => 'security'],
    ];
  } else {
    $templates = [
      ['promise_title' => 'Improve transparency and accountability', 'promise_category' => 'governance'],
      ['promise_title' => 'Improve economic opportunities', 'promise_category' => 'economy'],
      ['promise_title' => 'Improve security and safety', 'promise_category' => 'security'],
    ];
  }

  $rows = [];
  foreach ($templates as $t) {
    $rows[] = [
      'politician_id' => $politicianId,
      'official_id' => null,
      'promise_title' => $t['promise_title'],
      'promise_detail' => null,
      'promise_source' => 'Template',
      'promise_date' => null,
      'promise_category' => $t['promise_category'],
      'status' => 'pending',
      'progress_percent' => 0,
      'verified_by' => 'template',
      'last_updated' => gmdate('c'),
    ];
  }

  $ins = sb_rest('/official_promises', 'POST', [
    'Content-Type' => 'application/json',
    'Prefer' => 'return=representation',
  ], $rows);
  if (!$ins['ok'] || !is_array($ins['json'])) nr_json(500, ['error' => 'Insert failed', 'details' => $ins['raw'] ?? null]);
  nr_json(200, ['ok' => true, 'inserted' => count($ins['json'])]);
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
