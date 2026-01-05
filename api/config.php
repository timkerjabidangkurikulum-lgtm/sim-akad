<?php
// Konfigurasi dasar API SIM-AKAD

header('Content-Type: application/json; charset=utf-8');

// Untuk pengembangan lokal dengan Vite di port berbeda, boleh diaktifkan CORS ini.
// Untuk produksi (setelah build dan ditempatkan di satu domain dengan PHP), ini aman untuk di-nonaktifkan.
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Cookie policy:
// - Web (localhost:5173 -> localhost) tetap "same-site" (port tidak dihitung), jadi SameSite=Lax aman dan paling kompatibel.
// - Android/Capacitor (origin capacitor://localhost) butuh SameSite=None; Secure.
//   Catatan: browser umumnya menolak SameSite=None tanpa Secure.
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ((int)($_SERVER['SERVER_PORT'] ?? 0) === 443);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isCapacitor = is_string($origin) && str_starts_with($origin, 'capacitor://');

$sameSite = $isCapacitor ? 'None' : 'Lax';

// Prefer session_set_cookie_params options (PHP 7.3+). Fallback to ini_set.
if (PHP_VERSION_ID >= 70300) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isCapacitor ? true : $isHttps,
        'httponly' => true,
        'samesite' => $sameSite,
    ]);
} else {
    @ini_set('session.cookie_secure', ($isCapacitor || $isHttps) ? '1' : '0');
    @ini_set('session.cookie_httponly', '1');
    // Older PHP cannot reliably set SameSite=None.
}

session_start();

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function require_method(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD']) !== strtoupper($method)) {
        json_response(['error' => 'Method not allowed'], 405);
    }
}

function get_json_input(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function require_login(): void
{
    if (!isset($_SESSION['user'])) {
        json_response(['error' => 'Unauthorized'], 401);
    }
}

function current_user(): ?array
{
    return $_SESSION['user'] ?? null;
}
