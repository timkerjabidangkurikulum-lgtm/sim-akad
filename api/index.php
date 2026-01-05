<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/data.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handle_login(read_users_all());
        break;

    case 'logout':
        handle_logout();
        break;

    case 'me':
        handle_me();
        break;

    case 'dashboard':
        // boleh diakses setelah login, tapi untuk demo tidak dibatasi terlalu ketat
        json_response(['stats' => $STATS]);
        break;

    case 'teachers':
        json_response(['teachers' => $TEACHERS]);
        break;

    case 'users_list':
        handle_users_list();
        break;

    case 'users_upsert':
        handle_users_upsert();
        break;

    case 'users_reset_password':
        handle_users_reset_password();
        break;

    case 'evaluasi_list':
        handle_evaluasi_list();
        break;

    case 'evaluasi_upsert':
        handle_evaluasi_upsert();
        break;

    case 'evaluasi_delete':
        handle_evaluasi_delete();
        break;

    case 'agenda':
        json_response(['agenda' => $AGENDA]);
        break;

    case 'kma1503':
        json_response(['kma1503' => $KMA1503]);
        break;

    case 'gemini':
        handle_gemini_generate();
        break;

    case 'journal_list':
        handle_journal_list();
        break;

    case 'journal_upsert':
        handle_journal_upsert();
        break;

    case 'journal_delete':
        handle_journal_delete();
        break;

    case 'journal_export':
        handle_journal_export();
        break;

    case 'profile_get':
        handle_profile_get();
        break;

    case 'profile_update':
        handle_profile_update();
        break;

    case 'nilai_list':
        handle_nilai_list();
        break;

    case 'nilai_get':
        handle_nilai_get();
        break;

    case 'nilai_upsert':
        handle_nilai_upsert();
        break;

    case 'nilai_delete':
        handle_nilai_delete();
        break;

    case 'nilai_export':
        handle_nilai_export();
        break;

    case 'roster_get':
        handle_roster_get();
        break;

    case 'roster_upsert':
        handle_roster_upsert();
        break;

    default:
        json_response(['error' => 'Not found'], 404);
}

function storage_path(string $name): string
{
    $dir = __DIR__ . '/storage';
    if (!is_dir($dir)) {
        @mkdir($dir, 0777, true);
    }
    return $dir . '/' . $name;
}

function users_path(): string
{
    return storage_path('users.json');
}

function read_users_all(): array
{
    $path = users_path();
    $stored = read_json_file($path);
    if (is_array($stored) && count($stored) > 0) {
        return $stored;
    }

    // fallback defaults from data.php
    global $USERS;
    return (isset($USERS) && is_array($USERS)) ? $USERS : [];
}

function write_users_all(array $users): void
{
    // keep list structure and stable serialization
    $normalized = [];
    foreach ($users as $u) {
        if (!is_array($u)) continue;
        $username = $u['username'] ?? '';
        $password = $u['password'] ?? '';
        $role = $u['role'] ?? 'guru';
        $name = $u['name'] ?? '';
        if (!is_string($username) || trim($username) === '') continue;
        $normalized[] = [
            'username' => trim($username),
            'password' => is_string($password) ? $password : '',
            'role' => is_string($role) ? $role : 'guru',
            'name' => is_string($name) ? $name : '',
        ];
    }
    write_json_file_atomic(users_path(), array_values($normalized));
}

function user_password_matches(string $plain, string $stored): bool
{
    if ($stored === '') return false;
    // Support hashed passwords (PASSWORD_DEFAULT) and legacy plaintext passwords.
    if (str_starts_with($stored, '$2y$') || str_starts_with($stored, '$argon2')) {
        return password_verify($plain, $stored);
    }
    return hash_equals($stored, $plain);
}

function generate_temp_password(int $len = 10): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    $max = strlen($alphabet) - 1;
    $out = '';
    for ($i = 0; $i < $len; $i++) {
        $out .= $alphabet[random_int(0, $max)];
    }
    return $out;
}

function validate_username(string $username): bool
{
    return (bool) preg_match('/^[A-Za-z0-9_.-]{3,32}$/', $username);
}

function evaluasi_path(): string
{
    return storage_path('evaluasi.json');
}

function read_evaluasi_default(): array
{
    global $TEACHERS;
    return isset($TEACHERS) && is_array($TEACHERS) ? $TEACHERS : [];
}

function read_evaluasi_all(): array
{
    $data = read_json_file(evaluasi_path());
    if (is_array($data) && count($data) > 0) {
        return $data;
    }
    return read_evaluasi_default();
}

function require_admin(): void
{
    require_login();
    $u = current_user();
    $role = $u['role'] ?? 'guru';
    if ($role !== 'admin') {
        json_response(['error' => 'Forbidden'], 403);
    }
}

function read_json_file(string $path): array
{
    if (!file_exists($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function write_json_file_atomic(string $path, array $data): void
{
    $tmp = $path . '.' . uniqid('tmp_', true);
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) {
        json_response(['error' => 'Gagal serialisasi data'], 500);
    }
    if (file_put_contents($tmp, $json, LOCK_EX) === false) {
        json_response(['error' => 'Gagal menyimpan data'], 500);
    }
    if (!@rename($tmp, $path)) {
        @unlink($tmp);
        json_response(['error' => 'Gagal finalisasi penyimpanan data'], 500);
    }
}

function get_gemini_api_key(): string
{
    $key = '';

    $secretFile = __DIR__ . '/secret.php';
    if (file_exists($secretFile)) {
        // secret.php should define $GEMINI_API_KEY
        include $secretFile;
        if (isset($GEMINI_API_KEY) && is_string($GEMINI_API_KEY)) {
            $key = trim($GEMINI_API_KEY);
        }
    }

    if (!$key) {
        $env = getenv('GEMINI_API_KEY');
        if (is_string($env) && trim($env) !== '') {
            $key = trim($env);
        }
    }

    return $key;
}

function get_app_settings(): array
{
    $settings = [
        'place' => '',
        'headTitle' => '',
        'headName' => '',
        'headNip' => '',
    ];

    $settingsFile = __DIR__ . '/settings.php';
    if (file_exists($settingsFile)) {
        include $settingsFile;
        if (isset($SIMAKAD_PLACE) && is_string($SIMAKAD_PLACE)) {
            $settings['place'] = trim($SIMAKAD_PLACE);
        }
        if (isset($SIMAKAD_HEAD_TITLE) && is_string($SIMAKAD_HEAD_TITLE)) {
            $settings['headTitle'] = trim($SIMAKAD_HEAD_TITLE);
        }
        if (isset($SIMAKAD_HEAD_NAME) && is_string($SIMAKAD_HEAD_NAME)) {
            $settings['headName'] = trim($SIMAKAD_HEAD_NAME);
        }
        if (isset($SIMAKAD_HEAD_NIP) && is_string($SIMAKAD_HEAD_NIP)) {
            $settings['headNip'] = trim($SIMAKAD_HEAD_NIP);
        }
    }

    return $settings;
}

function profiles_path(): string
{
    return storage_path('profiles.json');
}

function nilai_path(): string
{
    return storage_path('nilai.json');
}

function roster_path(): string
{
    return storage_path('roster.json');
}

function normalize_roster_student(array $s): array
{
    // reuse a subset of nilai student normalization (id, name, nis)
    $n = normalize_nilai_student($s);
    return [
        'id' => (string) ($n['id'] ?? ''),
        'name' => (string) ($n['name'] ?? ''),
        'nis' => (string) ($n['nis'] ?? ''),
    ];
}

function normalize_kelas_key(string $kelas): string
{
    $kelas = trim($kelas);
    // collapse internal whitespace
    $kelas = preg_replace('/\s+/', ' ', $kelas);
    return is_string($kelas) ? $kelas : '';
}

function read_nilai_all(): array
{
    $all = read_json_file(nilai_path());
    return is_array($all) ? $all : [];
}

function normalize_nilai_student(array $s): array
{
    $id = $s['id'] ?? null;
    if (is_string($id)) $id = trim($id);
    if ($id === null || $id === '') {
        $id = (string) (time() . '_' . bin2hex(random_bytes(4)));
    }

    $name = $s['name'] ?? '';
    if (!is_string($name)) $name = '';
    $name = trim($name);
    if ($name === '') $name = 'Tanpa Nama';
    if (mb_strlen($name) > 120) $name = mb_substr($name, 0, 120);

    $nis = $s['nis'] ?? '';
    if (!is_string($nis)) $nis = '';
    $nis = trim($nis);
    if (mb_strlen($nis) > 30) $nis = mb_substr($nis, 0, 30);

    $scoreRaw = $s['score'] ?? '';
    $score = null;
    if ($scoreRaw === '' || $scoreRaw === null) {
        $score = null;
    } else {
        $score = (float) $scoreRaw;
        if ($score < 0) $score = 0;
        if ($score > 100) $score = 100;
        // Keep integers clean
        if (abs($score - round($score)) < 1e-9) $score = (int) round($score);
    }

    $note = $s['note'] ?? '';
    if (!is_string($note)) $note = '';
    $note = trim($note);
    if (mb_strlen($note) > 200) $note = mb_substr($note, 0, 200);

    return [
        'id' => (string) $id,
        'name' => $name,
        'nis' => $nis,
        'score' => $score,
        'note' => $note,
    ];
}

function normalize_nilai_package(array $p): array
{
    $id = $p['id'] ?? null;
    if (is_string($id)) $id = trim($id);
    if ($id === null || $id === '') {
        $id = (string) (time() . '_' . bin2hex(random_bytes(4)));
    }

    $mapel = $p['mapel'] ?? '';
    if (!is_string($mapel)) $mapel = '';
    $mapel = trim($mapel);
    if ($mapel === '') $mapel = 'Mapel';
    if (mb_strlen($mapel) > 80) $mapel = mb_substr($mapel, 0, 80);

    $kelas = $p['kelas'] ?? '';
    if (!is_string($kelas)) $kelas = '';
    $kelas = trim($kelas);
    if ($kelas === '') $kelas = '-';
    if (mb_strlen($kelas) > 40) $kelas = mb_substr($kelas, 0, 40);

    $kompetensi = $p['kompetensi'] ?? '';
    if (!is_string($kompetensi)) $kompetensi = '';
    $kompetensi = trim($kompetensi);
    if (mb_strlen($kompetensi) > 500) $kompetensi = mb_substr($kompetensi, 0, 500);

    $sumber = $p['sumber'] ?? ($p['source'] ?? '');
    if (!is_string($sumber)) $sumber = '';
    $sumber = trim($sumber);
    if (mb_strlen($sumber) > 60) $sumber = mb_substr($sumber, 0, 60);

    $tanggal = $p['tanggal'] ?? '';
    if (!is_string($tanggal)) $tanggal = '';
    $tanggal = trim($tanggal);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $tanggal)) {
        $tanggal = date('Y-m-d');
    }

    $status = $p['status'] ?? 'Draft';
    if (!is_string($status)) $status = 'Draft';
    $status = trim($status);
    if (!in_array($status, ['Draft', 'Terkirim'], true)) {
        $status = 'Draft';
    }

    $studentsIn = $p['students'] ?? [];
    if (!is_array($studentsIn)) $studentsIn = [];
    $students = [];
    foreach ($studentsIn as $s) {
        if (!is_array($s)) continue;
        $students[] = normalize_nilai_student($s);
    }

    // Stable sort students by name then NIS
    usort($students, function ($a, $b) {
        $na = is_array($a) ? ($a['name'] ?? '') : '';
        $nb = is_array($b) ? ($b['name'] ?? '') : '';
        $cmp = strcmp($na, $nb);
        if ($cmp !== 0) return $cmp;
        $ia = is_array($a) ? ($a['nis'] ?? '') : '';
        $ib = is_array($b) ? ($b['nis'] ?? '') : '';
        return strcmp($ia, $ib);
    });

    $now = date('c');

    return [
        'id' => (string) $id,
        'mapel' => $mapel,
        'kelas' => $kelas,
        'sumber' => $sumber,
        'kompetensi' => $kompetensi,
        'tanggal' => $tanggal,
        'status' => $status,
        'students' => $students,
        'updatedAt' => $now,
    ];
}

function get_profile_overrides(string $username): array
{
    $all = read_json_file(profiles_path());
    if (!is_array($all)) {
        return [];
    }
    $p = $all[$username] ?? null;
    return is_array($p) ? $p : [];
}

function save_profile_overrides(string $username, array $profile): void
{
    $path = profiles_path();
    $all = read_json_file($path);
    if (!is_array($all)) {
        $all = [];
    }
    $all[$username] = $profile;
    write_json_file_atomic($path, $all);
}

function find_user_base(string $username): ?array
{
    $users = read_users_all();
    foreach ($users as $u) {
        if (is_array($u) && ($u['username'] ?? '') === $username) {
            return $u;
        }
    }
    return null;
}

function build_current_user(string $username, ?array $sessionUser = null): array
{
    $base = find_user_base($username) ?? [];
    $profile = get_profile_overrides($username);

    $role = $base['role'] ?? ($sessionUser['role'] ?? 'guru');
    $name = $profile['name'] ?? ($base['name'] ?? ($sessionUser['name'] ?? $username));

    $user = [
        'username' => $username,
        'role' => $role,
        'name' => $name,
    ];

    $nip = $profile['nip'] ?? ($base['nip'] ?? '');
    if (is_string($nip) && trim($nip) !== '') {
        $user['nip'] = trim($nip);
    }

    return $user;
}

function find_user_nip(string $username): string
{
    $p = get_profile_overrides($username);
    $pn = $p['nip'] ?? '';
    if (is_string($pn) && trim($pn) !== '') {
        return trim($pn);
    }

    $base = find_user_base($username);
    $nip = is_array($base) ? ($base['nip'] ?? '') : '';
    if (is_string($nip) && trim($nip) !== '') return trim($nip);
    return '';
}

function handle_gemini_generate(): void
{
    require_login();
    require_method('POST');

    $apiKey = get_gemini_api_key();
    if (!$apiKey) {
        json_response([
            'error' => 'Server API key belum diset. Admin: salin api/secret.example.php menjadi api/secret.php lalu isi $GEMINI_API_KEY.',
        ], 500);
    }

    $input = get_json_input();
    $userPrompt = $input['userPrompt'] ?? '';
    $systemInstruction = $input['systemInstruction'] ?? '';
    $model = $input['model'] ?? 'gemini-2.5-flash-preview-09-2025';

    if (!is_string($userPrompt) || trim($userPrompt) === '') {
        json_response(['error' => 'userPrompt wajib diisi'], 400);
    }
    if (!is_string($systemInstruction)) {
        $systemInstruction = '';
    }
    if (!is_string($model) || trim($model) === '') {
        $model = 'gemini-2.5-flash-preview-09-2025';
    }

    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent?key=' . rawurlencode($apiKey);

    $payload = [
        'contents' => [
            ['parts' => [['text' => $userPrompt]]],
        ],
        'systemInstruction' => [
            'parts' => [['text' => $systemInstruction]],
        ],
        'generationConfig' => [
            'responseMimeType' => 'application/json',
        ],
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);

    $raw = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($raw === false) {
        json_response(['error' => 'Gagal menghubungi Gemini API: ' . ($curlErr ?: 'unknown error')], 502);
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_response(['error' => 'Respons Gemini tidak valid'], 502);
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        $message = $decoded['error']['message'] ?? 'Gemini API error';
        json_response(['error' => $message, 'details' => $decoded], 502);
    }

    json_response($decoded);
}

function handle_login(array $USERS): void
{
    require_method('POST');
    $input = get_json_input();
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    foreach ($USERS as $user) {
        if (!is_array($user)) continue;
        if (($user['username'] ?? '') === $username && user_password_matches((string) $password, (string) ($user['password'] ?? ''))) {
            // Simpan user di session (sederhana, belum hashing password karena hanya demo)
            $_SESSION['user'] = build_current_user($user['username'], [
                'username' => $user['username'],
                'role' => $user['role'],
                'name' => $user['name'],
            ]);

            json_response([
                'user' => $_SESSION['user'],
            ]);
        }
    }

    json_response(['error' => 'Username atau password salah'], 401);
}

function handle_users_list(): void
{
    require_admin();
    require_method('GET');

    $users = read_users_all();
    $out = [];
    foreach ($users as $u) {
        if (!is_array($u)) continue;
        $username = $u['username'] ?? '';
        if (!is_string($username) || trim($username) === '') continue;
        $out[] = [
            'username' => (string) $username,
            'role' => (string) ($u['role'] ?? 'guru'),
            'name' => (string) ($u['name'] ?? ''),
        ];
    }

    usort($out, function ($a, $b) {
        $ra = is_array($a) ? (string)($a['role'] ?? '') : '';
        $rb = is_array($b) ? (string)($b['role'] ?? '') : '';
        // admin first
        if ($ra !== $rb) {
            if ($ra === 'admin') return -1;
            if ($rb === 'admin') return 1;
        }
        $na = is_array($a) ? (string)($a['name'] ?? '') : '';
        $nb = is_array($b) ? (string)($b['name'] ?? '') : '';
        $cmp = strcmp($na, $nb);
        if ($cmp !== 0) return $cmp;
        $ua = is_array($a) ? (string)($a['username'] ?? '') : '';
        $ub = is_array($b) ? (string)($b['username'] ?? '') : '';
        return strcmp($ua, $ub);
    });

    json_response(['users' => $out]);
}

function handle_users_upsert(): void
{
    require_admin();
    require_method('POST');

    $input = get_json_input();
    $u = $input['user'] ?? null;
    if (!is_array($u)) {
        json_response(['error' => 'user wajib berupa object'], 400);
    }


    $username = $u['username'] ?? '';
    $name = $u['name'] ?? '';
    $password = $u['password'] ?? '';
    $oldUsername = $u['oldUsername'] ?? '';

    if (!is_string($username) || trim($username) === '') {
        json_response(['error' => 'username wajib diisi'], 400);
    }
    $username = trim($username);
    if (!validate_username($username)) {
        json_response(['error' => 'username hanya boleh A-Z a-z 0-9 . _ - (3-32 karakter)'], 400);
    }

    if (!is_string($name) || trim($name) === '') {
        json_response(['error' => 'name wajib diisi'], 400);
    }
    $name = trim($name);


    $users = read_users_all();
    if (!is_array($users)) $users = [];

    $found = false;
    $tempPassword = '';
    $renamed = false;
    $oldUsername = is_string($oldUsername) ? trim($oldUsername) : '';
    if ($oldUsername && $oldUsername !== $username) {
        // Rename: cari user lama, hapus, lalu tambahkan user baru
        foreach ($users as $i => $existing) {
            if (!is_array($existing)) continue;
            if ((string)($existing['username'] ?? '') !== $oldUsername) continue;
            $role = (string) ($existing['role'] ?? 'guru');
            if ($role === 'admin') {
                json_response(['error' => 'Akun admin tidak boleh diubah dari sini'], 400);
            }
            // Hapus user lama
            array_splice($users, $i, 1);
            $renamed = true;
            break;
        }
    }

    // Cek jika username baru sudah ada (selain dari rename)
    foreach ($users as $i => $existing) {
        if (!is_array($existing)) continue;
        if ((string)($existing['username'] ?? '') !== $username) continue;
        $role = (string) ($existing['role'] ?? 'guru');
        if ($role === 'admin') {
            json_response(['error' => 'Akun admin tidak boleh diubah dari sini'], 400);
        }
        $users[$i]['name'] = $name;
        $users[$i]['role'] = 'guru';
        if (is_string($password) && trim($password) !== '') {
            $plain = trim($password);
            $users[$i]['password'] = password_hash($plain, PASSWORD_DEFAULT);
        }
        $found = true;
        break;
    }

    if (!$found) {
        $plain = '';
        if (is_string($password) && trim($password) !== '') {
            $plain = trim($password);
        } else {
            $plain = generate_temp_password();
            $tempPassword = $plain;
        }
        $users[] = [
            'username' => $username,
            'password' => password_hash($plain, PASSWORD_DEFAULT),
            'role' => 'guru',
            'name' => $name,
        ];
    }

    write_users_all($users);

    $resp = [
        'success' => true,
        'user' => [
            'username' => $username,
            'role' => 'guru',
            'name' => $name,
        ],
    ];
    if ($tempPassword !== '') {
        $resp['tempPassword'] = $tempPassword;
    }
    json_response($resp);
}

function handle_users_reset_password(): void
{
    require_admin();
    require_method('POST');

    $input = get_json_input();
    $username = $input['username'] ?? '';
    if (!is_string($username) || trim($username) === '') {
        json_response(['error' => 'username wajib diisi'], 400);
    }
    $username = trim($username);

    $users = read_users_all();
    if (!is_array($users)) $users = [];

    $found = false;
    $tempPassword = generate_temp_password();

    foreach ($users as $i => $u) {
        if (!is_array($u)) continue;
        if ((string)($u['username'] ?? '') !== $username) continue;

        $role = (string) ($u['role'] ?? 'guru');
        if ($role === 'admin') {
            json_response(['error' => 'Password admin tidak bisa di-reset dari sini'], 400);
        }

        $users[$i]['password'] = password_hash($tempPassword, PASSWORD_DEFAULT);
        $found = true;
        break;
    }

    if (!$found) {
        json_response(['error' => 'User tidak ditemukan'], 404);
    }

    write_users_all($users);
    json_response(['success' => true, 'username' => $username, 'tempPassword' => $tempPassword]);
}

function handle_logout(): void
{
    require_method('POST');
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params['path'], $params['domain'],
            $params['secure'], $params['httponly']
        );
    }
    session_destroy();
    json_response(['success' => true]);
}

function handle_me(): void
{
    $user = current_user();
    if (!$user) {
        json_response(['user' => null]);
    }

    $username = $user['username'] ?? '';
    if (!is_string($username) || trim($username) === '') {
        json_response(['user' => $user]);
    }

    $fresh = build_current_user($username, $user);
    $_SESSION['user'] = $fresh;
    json_response(['user' => $fresh]);
}

function handle_evaluasi_list(): void
{
    require_admin();
    $teachers = read_evaluasi_all();
    json_response(['teachers' => $teachers]);
}

function normalize_teacher(array $t): array
{
    $id = $t['id'] ?? null;
    if (is_string($id)) {
        $id = trim($id);
    }
    if ($id === null || $id === '' || $id === 0) {
        $id = (string) (time() . '_' . bin2hex(random_bytes(4)));
    }

    $n = [
        'id' => $id,
        'name' => trim((string) ($t['name'] ?? 'Tanpa Nama')),
        'kelas' => trim((string) ($t['kelas'] ?? '-')),
        'mapel' => trim((string) ($t['mapel'] ?? '-')),
        'kehadiran' => (int) ($t['kehadiran'] ?? 0),
        'modul' => trim((string) ($t['modul'] ?? 'Belum diatur')),
        'metode' => trim((string) ($t['metode'] ?? '-')),
        'status' => trim((string) ($t['status'] ?? 'Aman')),
        'adminScore' => (int) ($t['adminScore'] ?? 3),
        'pelaksanaanScore' => (int) ($t['pelaksanaanScore'] ?? 3),
        'penilaianScore' => (int) ($t['penilaianScore'] ?? 3),
        'kompetensiScore' => (int) ($t['kompetensiScore'] ?? 3),
        'teknik' => trim((string) ($t['teknik'] ?? 'Dokumen, Observasi')),
        'updatedAt' => date('c'),
    ];

    if ($n['name'] === '') $n['name'] = 'Tanpa Nama';
    if ($n['kelas'] === '') $n['kelas'] = '-';
    if ($n['mapel'] === '') $n['mapel'] = '-';
    if ($n['kehadiran'] < 0) $n['kehadiran'] = 0;
    if ($n['kehadiran'] > 100) $n['kehadiran'] = 100;
    foreach (['adminScore', 'pelaksanaanScore', 'penilaianScore', 'kompetensiScore'] as $k) {
        if ($n[$k] < 1) $n[$k] = 1;
        if ($n[$k] > 4) $n[$k] = 4;
    }

    return $n;
}

function handle_evaluasi_upsert(): void
{
    require_admin();
    require_method('POST');

    $input = get_json_input();
    $teacher = $input['teacher'] ?? null;
    if (!is_array($teacher)) {
        json_response(['error' => 'teacher wajib berupa object'], 400);
    }

    $normalized = normalize_teacher($teacher);

    $list = read_evaluasi_all();
    if (!is_array($list)) $list = [];

    $found = false;
    foreach ($list as $i => $t) {
        if (is_array($t) && (string) ($t['id'] ?? '') === (string) $normalized['id']) {
            $normalized['createdAt'] = (string) ($t['createdAt'] ?? date('c'));
            $list[$i] = array_merge($t, $normalized);
            $found = true;
            break;
        }
    }
    if (!$found) {
        $normalized['createdAt'] = date('c');
        $list[] = $normalized;
    }

    // stable sort by name
    usort($list, function ($a, $b) {
        $na = is_array($a) ? ($a['name'] ?? '') : '';
        $nb = is_array($b) ? ($b['name'] ?? '') : '';
        return strcmp($na, $nb);
    });

    write_json_file_atomic(evaluasi_path(), $list);
    json_response(['success' => true, 'teacher' => $normalized, 'teachers' => $list]);
}

function handle_evaluasi_delete(): void
{
    require_admin();
    require_method('POST');

    $input = get_json_input();
    $id = $input['id'] ?? '';
    if (!is_string($id) || trim($id) === '') {
        json_response(['error' => 'id wajib diisi'], 400);
    }

    $list = read_evaluasi_all();
    if (!is_array($list)) $list = [];
    $before = count($list);

    $list = array_values(array_filter($list, function ($t) use ($id) {
        return !(is_array($t) && (string) ($t['id'] ?? '') === (string) $id);
    }));

    if ($before !== count($list)) {
        write_json_file_atomic(evaluasi_path(), $list);
    }

    json_response(['success' => true, 'teachers' => $list]);
}

function handle_profile_get(): void
{
    require_login();
    $user = current_user();
    $username = $user['username'] ?? '';
    if (!is_string($username) || trim($username) === '') {
        json_response(['error' => 'User tidak valid'], 400);
    }

    $base = find_user_base($username) ?? [];
    $profile = get_profile_overrides($username);

    json_response([
        'profile' => [
            'username' => $username,
            'name' => $profile['name'] ?? ($base['name'] ?? ''),
            'nip' => $profile['nip'] ?? ($base['nip'] ?? ''),
        ],
    ]);
}

function handle_profile_update(): void
{
    require_login();
    require_method('POST');

    $user = current_user();
    $username = $user['username'] ?? '';
    if (!is_string($username) || trim($username) === '') {
        json_response(['error' => 'User tidak valid'], 400);
    }

    $input = get_json_input();
    $name = $input['name'] ?? '';
    $nip = $input['nip'] ?? '';

    if (!is_string($name) || trim($name) === '') {
        json_response(['error' => 'Nama wajib diisi'], 400);
    }
    $name = trim($name);
    if (mb_strlen($name) > 120) {
        json_response(['error' => 'Nama terlalu panjang (maks 120 karakter)'], 400);
    }

    if (!is_string($nip)) {
        $nip = '';
    }
    $nip = trim($nip);
    if ($nip !== '' && mb_strlen($nip) > 30) {
        json_response(['error' => 'NIP terlalu panjang (maks 30 karakter)'], 400);
    }

    $profile = get_profile_overrides($username);
    $profile['name'] = $name;
    $profile['nip'] = $nip;
    $profile['updatedAt'] = date('c');
    if (!isset($profile['createdAt']) || !is_string($profile['createdAt']) || trim($profile['createdAt']) === '') {
        $profile['createdAt'] = date('c');
    }

    save_profile_overrides($username, $profile);

    $_SESSION['user'] = build_current_user($username, $user);

    json_response([
        'success' => true,
        'profile' => [
            'username' => $username,
            'name' => $name,
            'nip' => $nip,
        ],
    ]);
}

function handle_journal_list(): void
{
    require_login();

    $user = current_user();
    $username = $user['username'] ?? '';
    $role = $user['role'] ?? 'guru';

    $path = storage_path('journal.json');
    $all = read_json_file($path);

    // Data disimpan sebagai map: username -> entries[]
    if (!is_array($all)) {
        $all = [];
    }

    if ($role === 'admin') {
        // Admin boleh lihat semua atau filter by username
        $filter = $_GET['username'] ?? '';
        if (is_string($filter) && trim($filter) !== '') {
            $filter = trim($filter);
            $meta = build_current_user($filter);
            json_response([
                'entries' => $all[$filter] ?? [],
                'username' => $filter,
                'user' => [
                    'username' => $meta['username'] ?? $filter,
                    'name' => $meta['name'] ?? $filter,
                    'nip' => $meta['nip'] ?? '',
                ],
            ]);
        }

        $usernames = array_keys($all);
        $users = [];
        foreach ($usernames as $u) {
            if (!is_string($u) || trim($u) === '') continue;
            $meta = build_current_user($u);
            $users[] = [
                'username' => $meta['username'] ?? $u,
                'name' => $meta['name'] ?? $u,
                'nip' => $meta['nip'] ?? '',
            ];
        }
        usort($users, function ($a, $b) {
            $na = is_array($a) ? (string)($a['name'] ?? '') : '';
            $nb = is_array($b) ? (string)($b['name'] ?? '') : '';
            $cmp = strcmp($na, $nb);
            if ($cmp !== 0) return $cmp;
            $ua = is_array($a) ? (string)($a['username'] ?? '') : '';
            $ub = is_array($b) ? (string)($b['username'] ?? '') : '';
            return strcmp($ua, $ub);
        });

        json_response(['entriesByUser' => $all, 'users' => $users]);
    }

    json_response(['entries' => $all[$username] ?? []]);
}

function handle_journal_upsert(): void
{
    require_login();
    require_method('POST');

    $user = current_user();
    $username = $user['username'] ?? '';
    $role = $user['role'] ?? 'guru';

    $input = get_json_input();
    $entry = $input['entry'] ?? null;
    if (!is_array($entry)) {
        json_response(['error' => 'entry wajib berupa object'], 400);
    }

    $targetUsername = $username;
    if ($role === 'admin' && isset($input['username']) && is_string($input['username']) && trim($input['username']) !== '') {
        $targetUsername = trim($input['username']);
    }

    $id = $entry['id'] ?? '';
    if (!is_string($id) || trim($id) === '') {
        // generate id
        $id = (string) (time() . '_' . bin2hex(random_bytes(6)));
    }

    $normalized = [
        'id' => $id,
        'date' => (string) ($entry['date'] ?? ''),
        'kelas' => (string) ($entry['kelas'] ?? ''),
        'mapel' => (string) ($entry['mapel'] ?? ''),
        'materi' => (string) ($entry['materi'] ?? ''),
        'metode' => (string) ($entry['metode'] ?? ''),
        'asesmen' => (string) ($entry['asesmen'] ?? ''),
        'catatan' => (string) ($entry['catatan'] ?? ''),
        'tindakLanjut' => (string) ($entry['tindakLanjut'] ?? ''),
        'updatedAt' => date('c'),
        'createdAt' => (string) ($entry['createdAt'] ?? date('c')),
    ];

    if (trim($normalized['date']) === '' || trim($normalized['kelas']) === '' || trim($normalized['mapel']) === '' || trim($normalized['materi']) === '') {
        json_response(['error' => 'date, kelas, mapel, materi wajib diisi'], 400);
    }

    $path = storage_path('journal.json');
    $all = read_json_file($path);
    if (!is_array($all)) {
        $all = [];
    }
    if (!isset($all[$targetUsername]) || !is_array($all[$targetUsername])) {
        $all[$targetUsername] = [];
    }

    $entries = $all[$targetUsername];
    $found = false;
    foreach ($entries as $idx => $e) {
        if (is_array($e) && ($e['id'] ?? '') === $id) {
            // preserve createdAt if exists
            $normalized['createdAt'] = (string) ($e['createdAt'] ?? $normalized['createdAt']);
            $entries[$idx] = $normalized;
            $found = true;
            break;
        }
    }
    if (!$found) {
        $entries[] = $normalized;
    }

    // sort newest date desc (then updatedAt desc)
    usort($entries, function ($a, $b) {
        $da = is_array($a) ? ($a['date'] ?? '') : '';
        $db = is_array($b) ? ($b['date'] ?? '') : '';
        if ($da === $db) {
            $ua = is_array($a) ? ($a['updatedAt'] ?? '') : '';
            $ub = is_array($b) ? ($b['updatedAt'] ?? '') : '';
            return strcmp($ub, $ua);
        }
        return strcmp($db, $da);
    });

    $all[$targetUsername] = $entries;
    write_json_file_atomic($path, $all);

    json_response(['success' => true, 'entry' => $normalized, 'username' => $targetUsername]);
}

function handle_journal_delete(): void
{
    require_login();
    require_method('POST');

    $user = current_user();
    $username = $user['username'] ?? '';
    $role = $user['role'] ?? 'guru';

    $input = get_json_input();
    $id = $input['id'] ?? '';
    if (!is_string($id) || trim($id) === '') {
        json_response(['error' => 'id wajib diisi'], 400);
    }

    $targetUsername = $username;
    if ($role === 'admin' && isset($input['username']) && is_string($input['username']) && trim($input['username']) !== '') {
        $targetUsername = trim($input['username']);
    }

    $path = storage_path('journal.json');
    $all = read_json_file($path);
    if (!is_array($all) || !isset($all[$targetUsername]) || !is_array($all[$targetUsername])) {
        json_response(['success' => true]);
    }

    $before = count($all[$targetUsername]);
    $all[$targetUsername] = array_values(array_filter($all[$targetUsername], function ($e) use ($id) {
        return !(is_array($e) && ($e['id'] ?? '') === $id);
    }));

    if ($before !== count($all[$targetUsername])) {
        write_json_file_atomic($path, $all);
    }

    json_response(['success' => true]);
}

function find_user_display_name(string $username): string
{
    $p = get_profile_overrides($username);
    $pn = $p['name'] ?? '';
    if (is_string($pn) && trim($pn) !== '') return trim($pn);

    // data.php defines $USERS
    global $USERS;
    if (isset($USERS) && is_array($USERS)) {
        foreach ($USERS as $u) {
            if (is_array($u) && ($u['username'] ?? '') === $username) {
                $name = $u['name'] ?? '';
                if (is_string($name) && trim($name) !== '') return trim($name);
                break;
            }
        }
    }
    return $username;
}

function handle_journal_export(): void
{
    require_login();
    require_method('GET');

    $user = current_user();
    $username = $user['username'] ?? '';
    $role = $user['role'] ?? 'guru';

    $month = $_GET['month'] ?? '';
    if (!is_string($month) || !preg_match('/^\d{4}-\d{2}$/', $month)) {
        json_response(['error' => 'month wajib format YYYY-MM'], 400);
    }

    $targetUsername = $username;
    if ($role === 'admin' && isset($_GET['username']) && is_string($_GET['username']) && trim($_GET['username']) !== '') {
        $targetUsername = trim($_GET['username']);
    }

    $path = storage_path('journal.json');
    $all = read_json_file($path);
    $entries = [];
    if (is_array($all) && isset($all[$targetUsername]) && is_array($all[$targetUsername])) {
        $entries = $all[$targetUsername];
    }

    // Filter by month (date field: YYYY-MM-DD)
    $entries = array_values(array_filter($entries, function ($e) use ($month) {
        if (!is_array($e)) return false;
        $d = $e['date'] ?? '';
        if (!is_string($d)) return false;
        return str_starts_with($d, $month . '-');
    }));

    usort($entries, function ($a, $b) {
        $da = is_array($a) ? ($a['date'] ?? '') : '';
        $db = is_array($b) ? ($b['date'] ?? '') : '';
        return strcmp($da, $db);
    });

    $displayName = find_user_display_name($targetUsername);
    $safeMonth = str_replace('-', '', $month);
    $safeUser = preg_replace('/[^A-Za-z0-9_\-]/', '_', $targetUsername);
    $safeName = preg_replace('/[^A-Za-z0-9_\-]/', '_', $displayName);
    $safeName = trim((string) $safeName, '_-');
    if ($safeName === '') $safeName = $safeUser;
    $fileName = 'Jurnal_Mengajar_' . $safeName . '_' . $safeUser . '_' . $safeMonth . '.doc';

    $app = get_app_settings();

    // Allow query params to override settings.php (optional)
    $place = $app['place'] ?? '';
    $headTitle = $app['headTitle'] ?? '';
    $headName = $app['headName'] ?? '';
    $headNip = $app['headNip'] ?? '';

    if (isset($_GET['place']) && is_string($_GET['place'])) $place = trim($_GET['place']);
    if (isset($_GET['headTitle']) && is_string($_GET['headTitle'])) $headTitle = trim($_GET['headTitle']);
    if (isset($_GET['headName']) && is_string($_GET['headName'])) $headName = trim($_GET['headName']);
    if (isset($_GET['headNip']) && is_string($_GET['headNip'])) $headNip = trim($_GET['headNip']);

    if ($place === '') $place = '..................';
    if ($headTitle === '') $headTitle = 'Kepala Madrasah';
    if ($headName === '') $headName = '................................';
    if ($headNip === '') $headNip = '...............................';

    $teacherNip = find_user_nip($targetUsername);
    if ($teacherNip === '') $teacherNip = '...............................';

    // Mapel summary for the month
    $mapels = [];
    foreach ($entries as $e) {
        if (!is_array($e)) continue;
        $m = $e['mapel'] ?? '';
        if (is_string($m)) {
            $m = trim($m);
            if ($m !== '') $mapels[$m] = true;
        }
    }
    $mapelSummary = implode(', ', array_keys($mapels));

    // Indonesian month name
    [$yy, $mm] = explode('-', $month);
    $monthNum = (int) $mm;
    $monthNames = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];
    $monthName = $monthNames[$monthNum] ?? $month;
    $signatureDateLine = $place . ', .......... ' . $monthName . ' ' . $yy;

    // Build a Word-compatible HTML document
    header('Content-Type: application/msword; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');

    $esc = function ($v) {
        return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    };

    $rowsHtml = '';
    $no = 1;
    foreach ($entries as $e) {
        $rowsHtml .= '<tr>'
            . '<td class="c">' . $no++ . '</td>'
            . '<td>' . $esc($e['date'] ?? '') . '</td>'
            . '<td>' . $esc($e['kelas'] ?? '') . '</td>'
            . '<td>' . $esc($e['mapel'] ?? '') . '</td>'
            . '<td>' . nl2br($esc($e['materi'] ?? '')) . '</td>'
            . '<td>' . nl2br($esc($e['metode'] ?? '')) . '</td>'
            . '<td>' . nl2br($esc($e['asesmen'] ?? '')) . '</td>'
            . '<td>' . nl2br($esc($e['catatan'] ?? '')) . '</td>'
            . '<td>' . nl2br($esc($e['tindakLanjut'] ?? '')) . '</td>'
            . '</tr>';
    }

    $title = 'JURNAL MENGAJAR - ' . $month . ' - ' . $displayName;
    $html = '<!DOCTYPE html>'
        . '<html><head><meta charset="utf-8" />'
        . '<title>' . $esc($title) . '</title>'
        . '<style>'
        . '@page{size:A4;margin:2.54cm;}'
        . 'body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.15;color:#000;}'
        . 'p{margin:0 0 6pt 0;text-align:justify;text-indent:1.25cm;}'
        . '.h1{font-size:12pt;font-weight:bold;text-transform:uppercase;text-align:center;margin:0 0 12pt 0;}'
        . '.meta{margin:0 0 10pt 0;}'
        . '.meta div{margin:0 0 2pt 0;}'
        . 'table{width:100%;border-collapse:collapse;table-layout:fixed;}'
        . 'th,td{border:1px solid #000;padding:6pt;vertical-align:top;word-wrap:break-word;}'
        . 'th{background:none;text-align:center;font-weight:bold;}'
        . 'td.c{text-align:center;}'
        . '.sig-wrap{margin-top:16pt;}'
        . '.sig-date{margin:0 0 10pt 0;text-align:right;}'
        . '.sig-table{width:100%;border-collapse:collapse;}'
        . '.sig-table td{border:0;padding:0;vertical-align:top;}'
        . '.sig-block{width:48%;}'
        . '.sig-title{margin:0 0 42pt 0;}'
        . '.sig-name{margin:0;font-weight:bold;text-decoration:underline;}'
        . '.sig-nip{margin:4pt 0 0 0;}'
        . '</style>'
        . '</head><body>'
        . '<div class="h1">' . $esc($title) . '</div>'
        . '<div class="meta">'
        . '<div><b>Nama/Username:</b> ' . $esc($displayName) . ' (' . $esc($targetUsername) . ')</div>'
        . '<div><b>Bulan:</b> ' . $esc($month) . '</div>'
        . '<div><b>Mapel:</b> ' . $esc($mapelSummary ?: '-') . '</div>'
        . '<div><b>Jumlah Entri:</b> ' . $esc((string) count($entries)) . '</div>'
        . '</div>'
        . '<table>'
        . '<thead><tr>'
        . '<th style="width:4%">No</th>'
        . '<th style="width:9%">Tanggal</th>'
        . '<th style="width:8%">Kelas</th>'
        . '<th style="width:10%">Mapel</th>'
        . '<th style="width:18%">Materi</th>'
        . '<th style="width:11%">Metode</th>'
        . '<th style="width:10%">Asesmen</th>'
        . '<th style="width:15%">Catatan</th>'
        . '<th style="width:15%">Tindak Lanjut</th>'
        . '</tr></thead>'
        . '<tbody>'
        . ($rowsHtml ?: '<tr><td class="c" colspan="9">Tidak ada entri pada bulan ini.</td></tr>')
        . '</tbody>'
        . '</table>'
        . '<div class="sig-wrap">'
        . '<div class="sig-date">' . $esc($signatureDateLine) . '</div>'
        . '<table class="sig-table">'
        . '<tr>'
        . '<td class="sig-block">'
        . '<p class="sig-title">Mengetahui,<br/><b>' . $esc($headTitle) . '</b></p>'
        . '<p class="sig-name">' . $esc($headName) . '</p>'
        . '<p class="sig-nip">NIP: ' . $esc($headNip) . '</p>'
        . '</td>'
        . '<td></td>'
        . '<td class="sig-block">'
        . '<p class="sig-title">Guru Mapel' . ($mapelSummary ? ' (' . $esc($mapelSummary) . ')' : '') . '</p>'
        . '<p class="sig-name">' . $esc($displayName) . '</p>'
        . '<p class="sig-nip">NIP: ' . $esc($teacherNip) . '</p>'
        . '</td>'
        . '</tr>'
        . '</table>'
        . '</div>'
        . '</body></html>';

    echo $html;
    exit;
}

function handle_nilai_list(): void
{
    require_login();
    require_method('GET');

    $user = current_user();
    $username = $user['username'] ?? '';
    $role = $user['role'] ?? 'guru';

    $all = read_nilai_all();
    if (!is_array($all)) $all = [];

    $packages = [];

    if ($role === 'admin') {
        $filter = $_GET['username'] ?? '';
        if (is_string($filter) && trim($filter) !== '') {
            $filter = trim($filter);
            $list = $all[$filter] ?? [];
            if (!is_array($list)) $list = [];
            foreach ($list as $p) {
                if (!is_array($p)) continue;
                $packages[] = array_merge(['owner' => $filter], summarize_nilai_package($p));
            }
        } else {
            foreach ($all as $owner => $list) {
                if (!is_string($owner) || !is_array($list)) continue;
                foreach ($list as $p) {
                    if (!is_array($p)) continue;
                    $packages[] = array_merge(['owner' => $owner], summarize_nilai_package($p));
                }
            }
        }
    } else {
        $list = $all[$username] ?? [];
        if (!is_array($list)) $list = [];
        foreach ($list as $p) {
            if (!is_array($p)) continue;
            $packages[] = summarize_nilai_package($p);
        }
    }

    // Sort by tanggal desc then mapel
    usort($packages, function ($a, $b) {
        $da = is_array($a) ? ($a['tanggal'] ?? '') : '';
        $db = is_array($b) ? ($b['tanggal'] ?? '') : '';
        $cmp = strcmp($db, $da);
        if ($cmp !== 0) return $cmp;
        $ma = is_array($a) ? ($a['mapel'] ?? '') : '';
        $mb = is_array($b) ? ($b['mapel'] ?? '') : '';
        return strcmp($ma, $mb);
    });

    json_response(['packages' => $packages]);
}

function summarize_nilai_package(array $p): array
{
    $students = $p['students'] ?? [];
    if (!is_array($students)) $students = [];
    $count = 0;
    $sum = 0;
    $countScored = 0;
    foreach ($students as $s) {
        if (!is_array($s)) continue;
        $count++;
        if (isset($s['score']) && $s['score'] !== null && $s['score'] !== '') {
            $countScored++;
            $sum += (float) $s['score'];
        }
    }
    $avg = $countScored > 0 ? round($sum / $countScored, 2) : null;

    return [
        'id' => (string) ($p['id'] ?? ''),
        'mapel' => (string) ($p['mapel'] ?? ''),
        'kelas' => (string) ($p['kelas'] ?? ''),
        'sumber' => (string) ($p['sumber'] ?? ''),
        'kompetensi' => (string) ($p['kompetensi'] ?? ''),
        'tanggal' => (string) ($p['tanggal'] ?? ''),
        'status' => (string) ($p['status'] ?? 'Draft'),
        'studentCount' => $count,
        'average' => $avg,
        'updatedAt' => (string) ($p['updatedAt'] ?? ''),
    ];
}

function handle_nilai_get(): void
{
    require_login();
    require_method('GET');

    $id = $_GET['id'] ?? '';
    if (!is_string($id) || trim($id) === '') {
        json_response(['error' => 'id wajib diisi'], 400);
    }
    $id = trim($id);

    $user = current_user();
    $username = $user['username'] ?? '';
    $role = $user['role'] ?? 'guru';

    $targetUsername = $username;
    if ($role === 'admin' && isset($_GET['username']) && is_string($_GET['username']) && trim($_GET['username']) !== '') {
        $targetUsername = trim($_GET['username']);
    }

    $all = read_nilai_all();
    $list = $all[$targetUsername] ?? [];
    if (!is_array($list)) $list = [];

    foreach ($list as $p) {
        if (is_array($p) && (string) ($p['id'] ?? '') === (string) $id) {
            $pkg = $p;
            if ($role === 'admin') {
                $pkg['owner'] = $targetUsername;
            }
            json_response(['package' => $pkg]);
        }
    }

    json_response(['error' => 'Paket tidak ditemukan'], 404);
}

function handle_nilai_upsert(): void
{
    require_login();
    require_method('POST');

    $user = current_user();
    $username = $user['username'] ?? '';
    if (!is_string($username) || trim($username) === '') {
        json_response(['error' => 'User tidak valid'], 400);
    }
    $username = trim($username);

    $input = get_json_input();
    $pkgIn = $input['package'] ?? null;
    if (!is_array($pkgIn)) {
        json_response(['error' => 'package wajib berupa object'], 400);
    }

    $normalized = normalize_nilai_package($pkgIn);

    $path = nilai_path();
    $all = read_json_file($path);
    if (!is_array($all)) $all = [];
    if (!isset($all[$username]) || !is_array($all[$username])) {
        $all[$username] = [];
    }

    $found = false;
    foreach ($all[$username] as $i => $p) {
        if (is_array($p) && (string) ($p['id'] ?? '') === (string) $normalized['id']) {
            $normalized['createdAt'] = (string) ($p['createdAt'] ?? date('c'));
            $all[$username][$i] = array_merge($p, $normalized);
            $found = true;
            break;
        }
    }
    if (!$found) {
        $normalized['createdAt'] = date('c');
        $all[$username][] = $normalized;
    }

    write_json_file_atomic($path, $all);

    // Return updated summaries for the current user
    $packages = [];
    foreach ($all[$username] as $p) {
        if (!is_array($p)) continue;
        $packages[] = summarize_nilai_package($p);
    }

    usort($packages, function ($a, $b) {
        $da = is_array($a) ? ($a['tanggal'] ?? '') : '';
        $db = is_array($b) ? ($b['tanggal'] ?? '') : '';
        return strcmp($db, $da);
    });

    json_response(['success' => true, 'package' => $normalized, 'packages' => $packages]);
}

function handle_nilai_delete(): void
{
    require_login();
    require_method('POST');

    $user = current_user();
    $username = $user['username'] ?? '';
    $role = $user['role'] ?? 'guru';

    $input = get_json_input();
    $id = $input['id'] ?? '';
    if (!is_string($id) || trim($id) === '') {
        json_response(['error' => 'id wajib diisi'], 400);
    }
    $id = trim($id);

    $targetUsername = $username;
    if ($role === 'admin' && isset($input['username']) && is_string($input['username']) && trim($input['username']) !== '') {
        $targetUsername = trim($input['username']);
    }

    $path = nilai_path();
    $all = read_json_file($path);
    if (!is_array($all) || !isset($all[$targetUsername]) || !is_array($all[$targetUsername])) {
        json_response(['success' => true]);
    }

    $before = count($all[$targetUsername]);
    $all[$targetUsername] = array_values(array_filter($all[$targetUsername], function ($p) use ($id) {
        return !(is_array($p) && (string) ($p['id'] ?? '') === (string) $id);
    }));

    if ($before !== count($all[$targetUsername])) {
        write_json_file_atomic($path, $all);
    }

    json_response(['success' => true]);
}

function handle_nilai_export(): void
{
    require_login();
    require_method('GET');

    $id = $_GET['id'] ?? '';
    if (!is_string($id) || trim($id) === '') {
        json_response(['error' => 'id wajib diisi'], 400);
    }
    $id = trim($id);

    $user = current_user();
    $username = $user['username'] ?? '';
    $role = $user['role'] ?? 'guru';

    $targetUsername = $username;
    if ($role === 'admin' && isset($_GET['username']) && is_string($_GET['username']) && trim($_GET['username']) !== '') {
        $targetUsername = trim($_GET['username']);
    }

    $all = read_nilai_all();
    $list = $all[$targetUsername] ?? [];
    if (!is_array($list)) $list = [];

    $pkg = null;
    foreach ($list as $p) {
        if (is_array($p) && (string) ($p['id'] ?? '') === (string) $id) {
            $pkg = $p;
            break;
        }
    }
    if (!$pkg) {
        json_response(['error' => 'Paket tidak ditemukan'], 404);
    }

    $displayName = find_user_display_name($targetUsername);
    $teacherNip = find_user_nip($targetUsername);
    if ($teacherNip === '') $teacherNip = '...............................';

    $mapel = is_string($pkg['mapel'] ?? null) ? trim((string) $pkg['mapel']) : '';
    $kelas = is_string($pkg['kelas'] ?? null) ? trim((string) $pkg['kelas']) : '';
    $sumber = is_string($pkg['sumber'] ?? null) ? trim((string) $pkg['sumber']) : '';
    $kompetensi = is_string($pkg['kompetensi'] ?? null) ? trim((string) $pkg['kompetensi']) : '';
    $tanggal = is_string($pkg['tanggal'] ?? null) ? trim((string) $pkg['tanggal']) : '';

    $students = $pkg['students'] ?? [];
    if (!is_array($students)) $students = [];

    $countScored = 0;
    $sum = 0;
    foreach ($students as $s) {
        if (!is_array($s)) continue;
        if (isset($s['score']) && $s['score'] !== null && $s['score'] !== '') {
            $countScored++;
            $sum += (float) $s['score'];
        }
    }
    $avg = $countScored > 0 ? round($sum / $countScored, 2) : null;

    $app = get_app_settings();
    $place = $app['place'] ?? '';
    $headTitle = $app['headTitle'] ?? '';
    $headName = $app['headName'] ?? '';
    $headNip = $app['headNip'] ?? '';

    if ($place === '') $place = '..................';
    if ($headTitle === '') $headTitle = 'Kepala Madrasah';
    if ($headName === '') $headName = '................................';
    if ($headNip === '') $headNip = '...............................';

    $signatureDateLine = $place . ', .......... .......... ..........';

    $fileName = 'Rekap_Nilai_'
        . preg_replace('/[^A-Za-z0-9_\-]/', '_', $targetUsername)
        . '_' . preg_replace('/[^0-9]/', '', $tanggal ?: date('Ymd'))
        . '.doc';

    header('Content-Type: application/msword; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');

    $esc = function ($v) {
        return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    };

    $rowsHtml = '';
    $no = 1;
    foreach ($students as $s) {
        if (!is_array($s)) continue;
        $scoreCell = ($s['score'] ?? null);
        if ($scoreCell === null || $scoreCell === '') {
            $scoreCell = '';
        }
        $rowsHtml .= '<tr>'
            . '<td class="c">' . $no++ . '</td>'
            . '<td>' . $esc($s['name'] ?? '') . '</td>'
            . '<td class="c">' . $esc($s['nis'] ?? '') . '</td>'
            . '<td class="c">' . $esc($scoreCell) . '</td>'
            . '<td>' . nl2br($esc($s['note'] ?? '')) . '</td>'
            . '</tr>';
    }

    $title = 'REKAP NILAI';
    $html = '<!DOCTYPE html>'
        . '<html><head><meta charset="utf-8" />'
        . '<title>' . $esc($title) . '</title>'
        . '<style>'
        . '@page{size:A4;margin:2.54cm;}'
        . 'body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.15;color:#000;}'
        . 'p{margin:0 0 6pt 0;text-align:justify;text-indent:1.25cm;}'
        . '.h1{font-size:12pt;font-weight:bold;text-transform:uppercase;text-align:center;margin:0 0 12pt 0;}'
        . '.meta{margin:0 0 10pt 0;}'
        . '.meta div{margin:0 0 2pt 0;}'
        . 'table{width:100%;border-collapse:collapse;table-layout:fixed;}'
        . 'th,td{border:1px solid #000;padding:6pt;vertical-align:top;word-wrap:break-word;}'
        . 'th{background:none;text-align:center;font-weight:bold;}'
        . 'td.c{text-align:center;}'
        . '.sig-wrap{margin-top:16pt;}'
        . '.sig-date{margin:0 0 10pt 0;text-align:right;}'
        . '.sig-table{width:100%;border-collapse:collapse;}'
        . '.sig-table td{border:0;padding:0;vertical-align:top;}'
        . '.sig-block{width:48%;}'
        . '.sig-title{margin:0 0 42pt 0;}'
        . '.sig-name{margin:0;font-weight:bold;text-decoration:underline;}'
        . '.sig-nip{margin:4pt 0 0 0;}'
        . '</style>'
        . '</head><body>'
        . '<div class="h1">' . $esc($title) . '</div>'
        . '<div class="meta">'
        . '<div><b>Guru:</b> ' . $esc($displayName) . ' (' . $esc($targetUsername) . ')</div>'
        . '<div><b>NIP:</b> ' . $esc($teacherNip) . '</div>'
        . '<div><b>Mapel:</b> ' . $esc($mapel ?: '-') . '</div>'
        . '<div><b>Kelas:</b> ' . $esc($kelas ?: '-') . '</div>'
        . '<div><b>Sumber Nilai:</b> ' . $esc($sumber ?: '-') . '</div>'
        . '<div><b>Kompetensi:</b> ' . nl2br($esc($kompetensi ?: '-')) . '</div>'
        . '<div><b>Tanggal:</b> ' . $esc($tanggal ?: '-') . '</div>'
        . '<div><b>Jumlah Siswa:</b> ' . $esc((string) count($students)) . '</div>'
        . '<div><b>Rata-rata (yang terisi):</b> ' . $esc($avg === null ? '-' : (string) $avg) . '</div>'
        . '</div>'
        . '<table>'
        . '<thead><tr>'
        . '<th style="width:5%">No</th>'
        . '<th style="width:35%">Nama</th>'
        . '<th style="width:15%">NIS</th>'
        . '<th style="width:10%">Nilai</th>'
        . '<th style="width:35%">Catatan</th>'
        . '</tr></thead>'
        . '<tbody>'
        . ($rowsHtml ?: '<tr><td class="c" colspan="5">Belum ada data siswa.</td></tr>')
        . '</tbody>'
        . '</table>'
        . '<div class="sig-wrap">'
        . '<div class="sig-date">' . $esc($signatureDateLine) . '</div>'
        . '<table class="sig-table">'
        . '<tr>'
        . '<td class="sig-block">'
        . '<p class="sig-title">Mengetahui,<br/><b>' . $esc($headTitle) . '</b></p>'
        . '<p class="sig-name">' . $esc($headName) . '</p>'
        . '<p class="sig-nip">NIP: ' . $esc($headNip) . '</p>'
        . '</td>'
        . '<td></td>'
        . '<td class="sig-block">'
        . '<p class="sig-title">Guru Mapel' . ($mapel ? ' (' . $esc($mapel) . ')' : '') . '</p>'
        . '<p class="sig-name">' . $esc($displayName) . '</p>'
        . '<p class="sig-nip">NIP: ' . $esc($teacherNip) . '</p>'
        . '</td>'
        . '</tr>'
        . '</table>'
        . '</div>'
        . '</body></html>';

    echo $html;
    exit;
}

function handle_roster_get(): void
{
    require_login();
    require_method('GET');

    $kelas = $_GET['kelas'] ?? '';
    if (!is_string($kelas) || trim($kelas) === '') {
        json_response(['error' => 'kelas wajib diisi'], 400);
    }
    $kelasKey = normalize_kelas_key($kelas);
    if ($kelasKey === '') {
        json_response(['error' => 'kelas tidak valid'], 400);
    }

    $user = current_user();
    $username = $user['username'] ?? '';
    if (!is_string($username) || trim($username) === '') {
        json_response(['error' => 'User tidak valid'], 400);
    }
    $username = trim($username);

    $all = read_json_file(roster_path());
    if (!is_array($all)) $all = [];
    $mine = $all[$username] ?? [];
    if (!is_array($mine)) $mine = [];

    $entry = $mine[$kelasKey] ?? null;
    if (!is_array($entry)) {
        json_response(['kelas' => $kelasKey, 'students' => []]);
    }

    $students = $entry['students'] ?? [];
    if (!is_array($students)) $students = [];

    json_response([
        'kelas' => $kelasKey,
        'students' => $students,
        'updatedAt' => $entry['updatedAt'] ?? '',
    ]);
}

function handle_roster_upsert(): void
{
    require_login();
    require_method('POST');

    $user = current_user();
    $username = $user['username'] ?? '';
    if (!is_string($username) || trim($username) === '') {
        json_response(['error' => 'User tidak valid'], 400);
    }
    $username = trim($username);

    $input = get_json_input();
    $kelas = $input['kelas'] ?? '';
    if (!is_string($kelas) || trim($kelas) === '') {
        json_response(['error' => 'kelas wajib diisi'], 400);
    }
    $kelasKey = normalize_kelas_key($kelas);
    if ($kelasKey === '') {
        json_response(['error' => 'kelas tidak valid'], 400);
    }

    $studentsIn = $input['students'] ?? [];
    if (!is_array($studentsIn)) {
        json_response(['error' => 'students wajib array'], 400);
    }

    $students = [];
    foreach ($studentsIn as $s) {
        if (!is_array($s)) continue;
        $st = normalize_roster_student($s);
        // allow empty rows to be dropped
        $name = trim((string) ($st['name'] ?? ''));
        $nis = trim((string) ($st['nis'] ?? ''));
        if ($name === '' && $nis === '') continue;
        $students[] = $st;
    }

    usort($students, function ($a, $b) {
        $na = is_array($a) ? ($a['name'] ?? '') : '';
        $nb = is_array($b) ? ($b['name'] ?? '') : '';
        $cmp = strcmp($na, $nb);
        if ($cmp !== 0) return $cmp;
        $ia = is_array($a) ? ($a['nis'] ?? '') : '';
        $ib = is_array($b) ? ($b['nis'] ?? '') : '';
        return strcmp($ia, $ib);
    });

    $path = roster_path();
    $all = read_json_file($path);
    if (!is_array($all)) $all = [];
    if (!isset($all[$username]) || !is_array($all[$username])) {
        $all[$username] = [];
    }

    $existing = $all[$username][$kelasKey] ?? null;
    $createdAt = is_array($existing) ? ($existing['createdAt'] ?? '') : '';
    if (!is_string($createdAt) || trim($createdAt) === '') {
        $createdAt = date('c');
    }

    $all[$username][$kelasKey] = [
        'kelas' => $kelasKey,
        'students' => $students,
        'createdAt' => $createdAt,
        'updatedAt' => date('c'),
    ];

    write_json_file_atomic($path, $all);

    json_response([
        'success' => true,
        'kelas' => $kelasKey,
        'students' => $students,
    ]);
}
