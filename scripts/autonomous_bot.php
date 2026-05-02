<?php
/**
 * evote.ng AUTONOMOUS BOT
 * A hands-free background agent that monitors news, creates officials, and publishes articles.
 */
declare(strict_types=1);

if (php_sapi_name() !== 'cli') die("CLI only.\n");

require_once __DIR__ . '/../api/openrouter-chat.php'; // For secrets and AI helpers

echo "=========================================================\n";
echo "  🤖 evote.ng AUTONOMOUS BOT - ENGAGED\n";
echo "=========================================================\n\n";

$secretsPath = __DIR__ . '/../config/secrets.php';
if (!is_file($secretsPath)) die("Error: secrets.php missing.\n");
$secrets = require $secretsPath;

$supabaseUrl = rtrim($secrets['SUPABASE_URL'] ?? '', '/');
$serviceKey  = $secrets['SUPABASE_SERVICE_ROLE_KEY'] ?? '';
$openrouterKey = $secrets['OPENROUTER_API_KEY'] ?? '';

if (!$supabaseUrl || !$serviceKey || !$openrouterKey) {
  die("Error: Missing credentials in secrets.php.\n");
}

function supa_req($method, $path, $body = null) {
  global $supabaseUrl, $serviceKey;
  $ch = curl_init("{$supabaseUrl}/rest/v1/{$path}");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
  $headers = [
    'apikey: ' . $serviceKey,
    'Authorization: Bearer ' . $serviceKey,
    'Content-Type: application/json',
    'Prefer: return=representation'
  ];
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  if ($body) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
  $res = curl_exec($ch);
  curl_close($ch);
  return json_decode((string)$res, true);
}

// ── STEP 1: MONITOR & DISCOVER ──────────────────────────
echo "Searching for new appointments and governance changes...\n";
$queries = [
  "Nigeria President appoints new 2026",
  "Nigeria Governor appoints commissioners 2026",
  "New Head of Agency Nigeria 2026"
];

$allContext = "";
foreach ($queries as $q) {
  $url = "https://www.google.com/search?q=" . urlencode($q);
  $ch = curl_init($url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
  $html = curl_exec($ch);
  curl_close($ch);
  $text = strip_tags((string)$html);
  $allContext .= mb_substr($text, 0, 2000) . "\n\n";
}

// ── STEP 2: AI EXTRACTION ──────────────────────────────
echo "AI analyzing news context...\n";
$prompt = "Based on these news snippets, identify any NEW government appointments or removals in Nigeria for 2026.
Return a JSON array of objects with:
- name: Full name
- role: New role
- type: [appointed | removed]
- news_headline: The actual news headline found
- news_source: The news site link if found
If no clear changes are found, return []. ONLY JSON.";

$aiRes = openRouterChat([
  'messages' => [['role' => 'user', 'content' => $prompt . "\n\n" . $allContext]],
  'temperature' => 0.2
]);
$content = $aiRes['choices'][0]['message']['content'] ?? '[]';
$changes = json_decode(preg_replace('/^```json\s*|```\s*$/i', '', trim($content)), true) ?: [];

echo "Found " . count($changes) . " potential updates.\n";

foreach ($changes as $c) {
  echo "Processing: {$c['name']} ({$c['role']})...\n";

  // ── STEP 3: AUTO-CREATE OFFICIAL ────────────────────
  if ($c['type'] === 'appointed') {
    // Check if exists
    $exists = supa_req('GET', "officials?full_name=eq." . urlencode($c['name']));
    if (empty($exists)) {
      echo " - Creating new official profile...\n";
      // Fetch rich profile data
      $profRes = @file_get_contents("http://localhost/api/fetch-official-profile.php", false, stream_context_create([
        'http' => ['method' => 'POST', 'header' => "Content-Type: application/json\r\n", 'content' => json_encode(['name' => $c['name']])]
      ]));
      $prof = json_decode((string)$profRes, true)['profile'] ?? [];
      
      $newOff = [
        'full_name' => $c['name'],
        'role' => $c['role'],
        'bio' => $prof['bio'] ?? "Appointed in 2026. Data being gathered.",
        'photo_url' => $prof['photo_url'] ?? null,
        'status' => 'active'
      ];
      supa_req('POST', 'officials', $newOff);
    }
  }

  // ── STEP 4: AUTO-PUBLISH NEWS ───────────────────────
  echo " - Drafting and publishing news article...\n";
  $newsPrompt = "Write a short, professional news article (150 words) about: {$c['news_headline']}. Focus on the impact of this change for evote.ng readers.";
  $newsAi = openRouterChat(['messages' => [['role' => 'user', 'content' => $newsPrompt]]]);
  $articleText = $newsAi['choices'][0]['message']['content'] ?? '';
  
  if ($articleText) {
    $newPost = [
      'title' => $c['news_headline'],
      'content' => $articleText,
      'excerpt' => mb_substr($articleText, 0, 160) . '...',
      'category' => 'Governance',
      'status' => 'published',
      'author_id' => '00000000-0000-0000-0000-000000000000' // AI System Author
    ];
    supa_req('POST', 'posts', $newPost);
  }
}

echo "\nAutonomous Cycle Finished.\n";
