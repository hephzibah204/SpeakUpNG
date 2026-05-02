<?php
/**
 * GLOBAL AUDIT & REPAIR SCRIPT
 * Finds officials with missing data and uses AI to populate them.
 */
declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
  die("This script can only be run from the command line.\n");
}

echo "=========================================================\n";
echo "  evote.ng - Global Audit & Repair Service\n";
echo "=========================================================\n\n";

$secretsPath = __DIR__ . '/../config/secrets.php';
if (!is_file($secretsPath)) die("Error: config/secrets.php not found.\n");
$secrets = require $secretsPath;

$supabaseUrl = rtrim($secrets['SUPABASE_URL'] ?? '', '/');
$serviceKey  = $secrets['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

if (!$supabaseUrl || !$serviceKey) {
  die("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in secrets.php.\n");
}

// ── HTTP HELPER ─────────────────────────────────────────
function fetch_json($url, $method = 'GET', $body = null, $headers = []) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
  curl_setopt($ch, CURLOPT_TIMEOUT, 30);
  $httpHeaders = [];
  foreach ($headers as $k => $v) $httpHeaders[] = "$k: $v";
  curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeaders);
  if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
  $resp = curl_exec($ch);
  $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return ['ok' => $code >= 200 && $code < 300, 'json' => json_decode((string)$resp, true)];
}

$supaHeaders = [
  'apikey' => $serviceKey,
  'Authorization' => "Bearer {$serviceKey}",
  'Content-Type' => 'application/json'
];

echo "Auditing officials for missing data...\n";
// Find officials with missing bio or photo_url
$res = fetch_json("{$supabaseUrl}/rest/v1/officials?or=(bio.is.null,photo_url.is.null)&status=eq.active&select=id,full_name,role", 'GET', null, $supaHeaders);

if (!$res['ok']) die("Failed to fetch officials: " . json_encode($res['json']) . "\n");

$targets = $res['json'];
$total = count($targets);
echo "Found {$total} officials needing repair.\n\n";

if ($total === 0) {
  echo "Database is healthy! No repairs needed.\n";
  exit;
}

foreach ($targets as $i => $o) {
  $num = $i + 1;
  echo "[{$num}/{$total}] Repairing: {$o['full_name']}... ";
  
  // Call the existing logic (simplified here)
  // We'll hit the internal API or just simulate the logic
  // For safety in bulk, we simulate the logic here to avoid overhead
  
  $q = urlencode($o['full_name']);
  $wikiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles={$q}&prop=pageimages|extracts&pithumbsize=600&exintro=1&explaintext=1&redirects=1&format=json";
  
  $ch = curl_init($wikiUrl);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_USERAGENT, 'evote.ng-repair-bot/1.0');
  $wikiRaw = curl_exec($ch);
  curl_close($ch);
  
  $wikiExtract = '';
  $wikiImage = '';
  if ($wikiRaw) {
    $wikiData = json_decode((string)$wikiRaw, true);
    if (!empty($wikiData['query']['pages'])) {
      foreach ($wikiData['query']['pages'] as $page) {
        if (!empty($page['extract'])) $wikiExtract = trim(mb_substr((string)$page['extract'], 0, 2000));
        if (!empty($page['thumbnail']['source'])) $wikiImage = trim((string)$page['thumbnail']['source']);
        break;
      }
    }
  }

  // Update logic
  $updates = [];
  if ($wikiExtract) $updates['bio'] = $wikiExtract;
  if ($wikiImage) $updates['photo_url'] = $wikiImage;

  if (!empty($updates)) {
    $upRes = fetch_json("{$supabaseUrl}/rest/v1/officials?id=eq.{$o['id']}", 'PATCH', $updates, $supaHeaders);
    if ($upRes['ok']) echo "REPAIRED! ✓\n";
    else echo "FAILED. " . json_encode($upRes['json']) . "\n";
  } else {
    echo "SKIPPED (No data found).\n";
  }
  
  usleep(500000); // 0.5s pause
}

echo "\nGlobal Audit & Repair Finished.\n";
