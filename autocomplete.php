<?php
header('Content-Type: application/json; charset=utf-8');

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (strlen($query) < 2) {
    echo json_encode([]);
    exit;
}

// ÖBB Autocomplete API
$url = 'https://fahrplan.oebb.at/bin/ajax-getstop.exe/dn?getstop=1&REQ0JourneyStopsS0A=1&REQ0JourneyStopsB=20&REQ0JourneyStopsS0G=' . urlencode($query);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');

$response = curl_exec($ch);
curl_close($ch);

if (empty($response)) {
    echo json_encode([]);
    exit;
}

// ÖBB API gibt ISO-8859-1 zurück, konvertiere zu UTF-8
if ($response) {
    $converted = @iconv('ISO-8859-1', 'UTF-8//IGNORE', $response);
    if ($converted !== false) {
        $response = $converted;
    }
    // Falls Konvertierung fehlschlägt, nutze Original
}

// Parse response (remove "SLs.sls=" prefix)
$jsonData = preg_replace('/^SLs\.sls=/', '', $response);

// Decode HTML entities
$jsonData = html_entity_decode($jsonData, ENT_QUOTES | ENT_HTML5, 'UTF-8');

// Versuche JSON zu parsen, auch wenn es truncated ist
$data = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE || !isset($data['suggestions'])) {
    // Fallback: Versuche manuell die suggestions zu extrahieren
    if (preg_match('/"suggestions":\s*\[(.*?)\]/s', $jsonData, $matches)) {
        // Extrahiere value-Felder
        preg_match_all('/"value":"([^"]+)"/', $matches[1], $valueMatches);
        $suggestions = array_map(function($v) { return ['name' => $v]; }, $valueMatches[1]);
        echo json_encode($suggestions, JSON_UNESCAPED_UNICODE);
        exit;
    }
    // Debug: Log the error
    error_log("Autocomplete error for query: $query, json_error: " . json_last_error_msg());
    echo json_encode([]);
    exit;
}

// Extrahiere nur die Stationsnamen
$stations = array_map(function($s) {
    return ['name' => $s['value']];
}, array_slice($data['suggestions'], 0, 10));

echo json_encode($stations, JSON_UNESCAPED_UNICODE);
?>
