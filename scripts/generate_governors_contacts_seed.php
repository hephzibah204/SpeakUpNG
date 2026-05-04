<?php
declare(strict_types=1);

if (php_sapi_name() !== 'cli') { http_response_code(400); echo "CLI only\n"; exit(1); }

$query = <<<SPARQL
SELECT ?stateLabel ?governorLabel ?image ?twitter ?instagram ?facebook ?website WHERE {
  ?state wdt:P31 wd:Q35657 .
  ?state wdt:P17 wd:Q1033 .
  ?state wdt:P6 ?governor .
  OPTIONAL { ?governor wdt:P18 ?image }
  OPTIONAL { ?governor wdt:P2002 ?twitter }
  OPTIONAL { ?governor wdt:P2003 ?instagram }
  OPTIONAL { ?governor wdt:P2013 ?facebook }
  OPTIONAL { ?governor wdt:P856 ?website }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
SPARQL;

$url = 'https://query.wikidata.org/sparql?format=json&query=' . rawurlencode($query);

function http_get_json(string $url): array {
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 12);
  curl_setopt($ch, CURLOPT_TIMEOUT, 30);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/sparql-results+json',
    'User-Agent: evote.ng-seed-bot/1.0 (contact: admin@evote.ng)',
  ]);
  $raw = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($raw === false || $code < 200 || $code >= 300) {
    fwrite(STDERR, "Fetch failed (HTTP {$code}): {$err}\n");
    exit(1);
  }
  $json = json_decode((string)$raw, true);
  if (!is_array($json)) {
    fwrite(STDERR, "Bad JSON response\n");
    exit(1);
  }
  return $json;
}

$json = http_get_json($url);
$bindings = $json['results']['bindings'] ?? [];
if (!is_array($bindings) || count($bindings) === 0) {
  fwrite(STDERR, "No results\n");
  exit(1);
}

$rowsByState = [];
foreach ($bindings as $b) {
  if (!is_array($b)) continue;
  $state = (string)($b['stateLabel']['value'] ?? '');
  $gov = (string)($b['governorLabel']['value'] ?? '');
  if ($state === '' || $gov === '') continue;

  $image = (string)($b['image']['value'] ?? '');
  $twitter = (string)($b['twitter']['value'] ?? '');
  $instagram = (string)($b['instagram']['value'] ?? '');
  $facebook = (string)($b['facebook']['value'] ?? '');
  $website = (string)($b['website']['value'] ?? '');

  $rowsByState[$state] = [
    'governor' => $gov,
    'photo_url' => $image !== '' ? preg_replace('#^http://#', 'https://', $image) : '',
    'social_twitter' => $twitter,
    'social_instagram' => $instagram,
    'social_facebook' => $facebook !== '' ? $facebook : '',
    'website' => $website !== '' ? $website : '',
  ];
}

ksort($rowsByState);

function sql_str(?string $s): string {
  $s = (string)$s;
  $s = str_replace("'", "''", $s);
  return "'" . $s . "'";
}

$out = [];
$out[] = "begin;";
$out[] = "";
foreach ($rowsByState as $state => $r) {
  $set = [];
  if (($r['photo_url'] ?? '') !== '') $set[] = "photo_url = coalesce(photo_url, " . sql_str($r['photo_url']) . ")";
  if (($r['social_twitter'] ?? '') !== '') $set[] = "social_twitter = coalesce(social_twitter, " . sql_str($r['social_twitter']) . ")";
  if (($r['social_instagram'] ?? '') !== '') $set[] = "social_instagram = coalesce(social_instagram, " . sql_str($r['social_instagram']) . ")";
  if (($r['social_facebook'] ?? '') !== '') $set[] = "social_facebook = coalesce(social_facebook, " . sql_str($r['social_facebook']) . ")";
  if (($r['website'] ?? '') !== '') $set[] = "website = coalesce(website, " . sql_str($r['website']) . ")";
  if (count($set) === 0) continue;

  $out[] = "update public.officials set";
  $out[] = "  " . implode(",\n  ", $set) . ",";
  $out[] = "  profile_updated_at = now()";
  $out[] = "where";
  $out[] = "  status = 'active'";
  $out[] = "  and tier = 'state_executive'";
  $out[] = "  and role ilike '%governor%'";
  $out[] = "  and role not ilike '%deputy%'";
  $out[] = "  and state_id = (select id from public.states where name = " . sql_str($state) . " limit 1);";
  $out[] = "";
}
$out[] = "commit;";
$out[] = "";

$target = __DIR__ . '/../data/seed-governors-contacts.wikidata.sql';
if (file_put_contents($target, implode("\n", $out)) === false) {
  fwrite(STDERR, "Failed to write: {$target}\n");
  exit(1);
}

echo "Wrote: {$target}\n";

