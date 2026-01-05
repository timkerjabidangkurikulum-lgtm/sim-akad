<?php

// Simple image proxy to bypass browser CORS when converting remote images to data URLs.
// Security: allow only http/https, block localhost/private IPs, enforce size + content-type.

declare(strict_types=1);

$url = isset($_GET['url']) ? trim((string)$_GET['url']) : '';
if ($url === '') {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Missing url";
    exit;
}

$parts = parse_url($url);
if (!is_array($parts) || !isset($parts['scheme'], $parts['host'])) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Invalid url";
    exit;
}

$scheme = strtolower((string)$parts['scheme']);
if ($scheme !== 'http' && $scheme !== 'https') {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Only http/https allowed";
    exit;
}

$host = strtolower((string)$parts['host']);
if ($host === 'localhost' || $host === '127.0.0.1' || $host === '::1') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Forbidden host";
    exit;
}

function ipv4_is_blocked(string $ip): bool
{
    $n = ip2long($ip);
    if ($n === false) return true;
    // Block: loopback, private, link-local, unspecified, CGNAT
    $blocked = [
        ['127.0.0.0', '127.255.255.255'],
        ['10.0.0.0', '10.255.255.255'],
        ['172.16.0.0', '172.31.255.255'],
        ['192.168.0.0', '192.168.255.255'],
        ['169.254.0.0', '169.254.255.255'],
        ['0.0.0.0', '0.255.255.255'],
        ['100.64.0.0', '100.127.255.255'],
    ];

    foreach ($blocked as $range) {
        $start = ip2long($range[0]);
        $end = ip2long($range[1]);
        if ($start !== false && $end !== false && $n >= $start && $n <= $end) {
            return true;
        }
    }
    return false;
}

function ipv6_is_blocked(string $ip): bool
{
    // Block loopback + unique local + link-local.
    $v = strtolower($ip);
    if ($v === '::1') return true;
    if (strpos($v, 'fc') === 0 || strpos($v, 'fd') === 0) return true; // ULA
    if (strpos($v, 'fe80:') === 0) return true; // link-local
    return false;
}

$ips = [];
if (function_exists('dns_get_record')) {
    $recordsA = @dns_get_record($host, DNS_A);
    if (is_array($recordsA)) {
        foreach ($recordsA as $r) {
            if (isset($r['ip']) && is_string($r['ip'])) $ips[] = $r['ip'];
        }
    }
    if (defined('DNS_AAAA')) {
        $recordsAAAA = @dns_get_record($host, DNS_AAAA);
        if (is_array($recordsAAAA)) {
            foreach ($recordsAAAA as $r) {
                if (isset($r['ipv6']) && is_string($r['ipv6'])) $ips[] = $r['ipv6'];
            }
        }
    }
}

if (count($ips) === 0) {
    $ipv4 = gethostbyname($host);
    if (is_string($ipv4) && $ipv4 !== $host) {
        $ips[] = $ipv4;
    }
}

if (count($ips) === 0) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Forbidden host";
    exit;
}

foreach ($ips as $ip) {
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        if (ipv4_is_blocked($ip)) {
            http_response_code(403);
            header('Content-Type: text/plain; charset=utf-8');
            echo "Forbidden host";
            exit;
        }
    } elseif (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        if (ipv6_is_blocked($ip)) {
            http_response_code(403);
            header('Content-Type: text/plain; charset=utf-8');
            echo "Forbidden host";
            exit;
        }
    }
}

$maxBytes = 5 * 1024 * 1024; // 5 MB

$headers = [
    'User-Agent: SIM_AKAD Image Proxy',
    'Accept: image/*',
];

$ch = curl_init($url);
if ($ch === false) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo "cURL init failed";
    exit;
}

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$data = curl_exec($ch);
$errNo = curl_errno($ch);
$http = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$downloadSize = (int)curl_getinfo($ch, CURLINFO_SIZE_DOWNLOAD_T);

curl_close($ch);

if ($errNo !== 0 || $data === false) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Failed to fetch image";
    exit;
}

if ($http < 200 || $http >= 300) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Upstream returned HTTP $http";
    exit;
}

// Some servers return content-type with charset; keep only mime.
$mime = strtolower(trim(explode(';', $contentType)[0] ?? ''));
if ($mime === '') {
    $mime = 'application/octet-stream';
}

if (strpos($mime, 'image/') !== 0) {
    http_response_code(415);
    header('Content-Type: text/plain; charset=utf-8');
    echo "URL is not an image";
    exit;
}

$len = strlen($data);
if (($downloadSize > 0 && $downloadSize > $maxBytes) || $len > $maxBytes) {
    http_response_code(413);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Image too large";
    exit;
}

header('Access-Control-Allow-Origin: *');
header('Content-Type: ' . $mime);
header('Cache-Control: public, max-age=3600');

echo $data;
