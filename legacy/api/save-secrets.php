<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function mc_json(int $status, array $payload): void {
  http_response_code($status);
  echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
  exit;
}

function mc_read_bearer(): string {
  $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!$hdr) return '';
  if (preg_match('/^Bearer\s+(.+)$/i', $hdr, $m)) return trim($m[1]);
  return '';
}

// ── AUTH ──────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  mc_json(405, ['error' => 'Method not allowed']);
}

$secretsPath = __DIR__ . '/../config/secrets.php';
$secrets = [];
if (is_file($secretsPath)) {
  $secrets = require $secretsPath;
}

$supabaseUrl  = (string)($secrets['SUPABASE_URL'] ?? getenv('SUPABASE_URL'));
$supabaseAnon = (string)($secrets['SUPABASE_ANON_KEY'] ?? getenv('SUPABASE_ANON_KEY'));

// Fallback to JS client config if secrets.php isn't populated
if ($supabaseUrl === '' || $supabaseAnon === '') {
  $jsPath = __DIR__ . '/../js/supabase-client.js';
  if (is_file($jsPath)) {
    $rawJs = file_get_contents($jsPath);
    if ($rawJs !== false) {
      if (preg_match("/const\\s+SUPABASE_URL\\s*=\\s*'([^']+)'/m", $rawJs, $m)) $supabaseUrl = trim((string)$m[1]);
      if (preg_match("/const\\s+SUPABASE_ANON_KEY\\s*=\\s*'([^']+)'/m", $rawJs, $m)) $supabaseAnon = trim((string)$m[1]);
    }
  }
}

$adminEmails  = $secrets['ADMIN_EMAILS'] ?? [];

if ($supabaseUrl === '' || $supabaseAnon === '') {
  mc_json(500, ['error' => 'Supabase auth not configured on server']);
}

$token = mc_read_bearer();
if ($token === '') mc_json(401, ['error' => 'Missing Authorization bearer token']);

// Verify token
$ctx = stream_context_create(['http' => [
  'method'        => 'GET',
  'timeout'       => 10,
  'header'        => "apikey: {$supabaseAnon}\r\nAuthorization: Bearer {$token}\r\nAccept: application/json",
  'ignore_errors' => true,
]]);
$userRaw = @file_get_contents(rtrim((string)$supabaseUrl, '/') . '/auth/v1/user', false, $ctx);
$userJson = $userRaw ? json_decode((string)$userRaw, true) : null;

if (!is_array($userJson) || empty($userJson['email'])) {
  mc_json(401, ['error' => 'Invalid or expired session']);
}
$email = (string)$userJson['email'];

if (is_array($adminEmails) && count($adminEmails) > 0 && !in_array($email, $adminEmails, true)) {
  mc_json(403, ['error' => 'Forbidden: Admins only']);
}

// ── SAVE SECRETS ──────────────────────────────────────
$raw = file_get_contents('php://input');
$payload = $raw !== false ? json_decode($raw, true) : null;

if (is_array($payload) && isset($payload['service_role_key'])) {
  $newKey = trim((string)$payload['service_role_key']);
  if ($newKey !== '') {
    $secrets['SUPABASE_SERVICE_ROLE_KEY'] = $newKey;
    
    // Also save the URL and Anon Key if we fell back to parsing them
    if (empty($secrets['SUPABASE_URL'])) $secrets['SUPABASE_URL'] = $supabaseUrl;
    if (empty($secrets['SUPABASE_ANON_KEY'])) $secrets['SUPABASE_ANON_KEY'] = $supabaseAnon;
    
    // Write back to file securely
    $exported = var_export($secrets, true);
    $phpCode = "<?php\ndeclare(strict_types=1);\n\nreturn " . $exported . ";\n";
    
    if (file_put_contents($secretsPath, $phpCode) === false) {
      mc_json(500, ['error' => 'Failed to write to config/secrets.php. Check folder permissions.']);
    }
  }
}

// Don't return the full keys for security, just success and whether keys exist
mc_json(200, [
  'ok' => true, 
  'has_service_key' => !empty($secrets['SUPABASE_SERVICE_ROLE_KEY'])
]);
