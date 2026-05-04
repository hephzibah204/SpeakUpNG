<?php
declare(strict_types=1);

if (php_sapi_name() !== 'cli') { http_response_code(400); echo "CLI only\n"; exit(1); }

$listPath = __DIR__ . '/../data/governors-seed-list.json';
if (!is_file($listPath)) { fwrite(STDERR, "Missing list: {$listPath}\n"); exit(1); }
$listRaw = file_get_contents($listPath);
if ($listRaw === false) { fwrite(STDERR, "Failed to read list\n"); exit(1); }
$listJson = json_decode($listRaw, true);
if (!is_array($listJson) || !is_array($listJson['items'] ?? null)) { fwrite(STDERR, "Invalid list JSON\n"); exit(1); }
$items = $listJson['items'];

function http_get_json(string $url, array $headers = [], int $timeoutSec = 25): array {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 12);
  curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSec);
  $base = [
    'Accept: application/json',
    'User-Agent: evote.ng-seed-bot/1.0 (contact: admin@evote.ng)',
  ];
  curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($base, $headers));
  $raw = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($raw === false || $code < 200 || $code >= 300) {
    throw new RuntimeException("HTTP {$code}: " . ($err ?: 'Request failed'));
  }
  $json = json_decode((string)$raw, true);
  if (!is_array($json)) throw new RuntimeException('Bad JSON');
  return $json;
}

function wikidata_search_qid(string $name): string {
  $url = 'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' . rawurlencode($name) . '&language=en&format=json&limit=1';
  $json = http_get_json($url);
  $arr = $json['search'] ?? [];
  if (!is_array($arr) || !isset($arr[0]['id'])) return '';
  return (string)$arr[0]['id'];
}

function wikidata_entity(string $qid): array {
  $url = 'https://m.wikidata.org/wiki/Special:EntityData/' . rawurlencode($qid) . '.json';
  $json = http_get_json($url, ['Accept: application/json'], 25);
  return $json['entities'][$qid] ?? [];
}

function first_claim_value(array $entity, string $pid): ?array {
  $claims = $entity['claims'][$pid] ?? null;
  if (!is_array($claims) || !isset($claims[0]['mainsnak']['datavalue']['value'])) return null;
  return $claims[0]['mainsnak']['datavalue']['value'];
}

function wikidata_props(array $entity): array {
  $imageVal = first_claim_value($entity, 'P18');
  $twitterVal = first_claim_value($entity, 'P2002');
  $instagramVal = first_claim_value($entity, 'P2003');
  $facebookVal = first_claim_value($entity, 'P2013');
  $websiteVal = first_claim_value($entity, 'P856');
  $youtubeVal = first_claim_value($entity, 'P2397');
  $tiktokVal = first_claim_value($entity, 'P7085');
  $linkedinVal = first_claim_value($entity, 'P6634');

  return [
    'image_name' => is_string($imageVal) ? $imageVal : '',
    'twitter' => is_string($twitterVal) ? $twitterVal : '',
    'instagram' => is_string($instagramVal) ? $instagramVal : '',
    'facebook' => is_string($facebookVal) ? $facebookVal : '',
    'website' => is_string($websiteVal) ? $websiteVal : '',
    'youtube' => is_string($youtubeVal) ? $youtubeVal : '',
    'tiktok' => is_string($tiktokVal) ? $tiktokVal : '',
    'linkedin' => is_string($linkedinVal) ? $linkedinVal : '',
  ];
}

function sql_str(string $s): string {
  return "'" . str_replace("'", "''", $s) . "'";
}

function normalize_handle(string $h): string {
  $h = trim($h);
  $h = preg_replace('/^@+/', '', $h) ?? $h;
  return $h;
}

function normalize_commons_url(string $u): string {
  if ($u === '') return '';
  $u = preg_replace('#^http://#', 'https://', $u) ?? $u;
  return $u;
}

function commons_file_url(string $filename): string {
  $filename = trim($filename);
  if ($filename === '') return '';
  return 'https://commons.wikimedia.org/wiki/Special:FilePath/' . rawurlencode($filename);
}

$sql = [];
$sql[] = 'begin;';
$sql[] = '';
$missing = [];

foreach ($items as $it) {
  if (!is_array($it)) continue;
  $state = trim((string)($it['state'] ?? ''));
  $name = trim((string)($it['name'] ?? ''));
  if ($state === '' || $name === '') continue;

  $qid = '';
  $props = [];
  try {
    $qid = wikidata_search_qid($name);
    if ($qid !== '') {
      $entity = wikidata_entity($qid);
      if (is_array($entity)) $props = wikidata_props($entity);
    }
  } catch (Throwable $e) {
    $qid = '';
    $props = [];
  }

  $set = [];
  $img = commons_file_url((string)($props['image_name'] ?? ''));
  $img = normalize_commons_url($img);
  if ($img !== '') $set[] = 'photo_url = coalesce(photo_url, ' . sql_str($img) . ')';
  $tw = normalize_handle((string)($props['twitter'] ?? ''));
  if ($tw !== '') $set[] = 'social_twitter = coalesce(social_twitter, ' . sql_str($tw) . ')';
  $ig = normalize_handle((string)($props['instagram'] ?? ''));
  if ($ig !== '') $set[] = 'social_instagram = coalesce(social_instagram, ' . sql_str($ig) . ')';
  $fb = trim((string)($props['facebook'] ?? ''));
  if ($fb !== '') $set[] = 'social_facebook = coalesce(social_facebook, ' . sql_str($fb) . ')';
  $web = trim((string)($props['website'] ?? ''));
  if ($web !== '') $set[] = 'website = coalesce(website, ' . sql_str($web) . ')';
  $yt = trim((string)($props['youtube'] ?? ''));
  if ($yt !== '') $set[] = 'social_youtube = coalesce(social_youtube, ' . sql_str($yt) . ')';
  $tt = normalize_handle((string)($props['tiktok'] ?? ''));
  if ($tt !== '') $set[] = 'social_tiktok = coalesce(social_tiktok, ' . sql_str($tt) . ')';
  $li = trim((string)($props['linkedin'] ?? ''));
  if ($li !== '') $set[] = 'social_linkedin = coalesce(social_linkedin, ' . sql_str($li) . ')';

  if (!$set) {
    $missing[] = ['state' => $state, 'name' => $name, 'qid' => $qid];
    continue;
  }

  echo "OK: {$state} — {$name}" . ($qid ? " ({$qid})" : "") . "\n";

  $sql[] = 'update public.officials set';
  $sql[] = '  ' . implode(",\n  ", $set) . ',';
  $sql[] = '  profile_updated_at = now()';
  $sql[] = 'where';
  $sql[] = "  status = 'active'";
  $sql[] = "  tier = 'state_executive'";
  $sql[] = "  and role ilike '%governor%'";
  $sql[] = "  and role not ilike '%deputy%'";
  $sql[] = "  and state_id = (select id from public.states where name = " . sql_str($state) . " limit 1);";
  $sql[] = '';
}

$sql[] = 'commit;';
$sql[] = '';

$target = __DIR__ . '/../data/seed-governors-contacts.generated.sql';
if (file_put_contents($target, implode("\n", $sql)) === false) {
  fwrite(STDERR, "Failed to write: {$target}\n");
  exit(1);
}

echo "Wrote: {$target}\n";

$missingPath = __DIR__ . '/../data/seed-governors-contacts.missing.json';
file_put_contents($missingPath, json_encode(['version' => 1, 'missing' => $missing], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
echo "Wrote: {$missingPath}\n";
