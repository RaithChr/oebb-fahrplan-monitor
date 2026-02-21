<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Station aus GET-Parameter
$station = isset($_GET['station']) ? trim($_GET['station']) : 'Wiener Neustadt';
$mode = isset($_GET['mode']) ? trim($_GET['mode']) : 'dep'; // dep oder arr

if (empty($station)) {
    echo json_encode(['error' => 'Keine Station angegeben'], JSON_UNESCAPED_UNICODE);
    exit;
}

// ÖBB HAFAS API URL
$url = 'https://fahrplan.oebb.at/bin/stboard.exe/dn?' . http_build_query([
    'input' => $station,
    'boardType' => $mode, // dep für Abfahrt, arr für Ankunft
    'start' => 'yes',
    'productsFilter' => '1111111111111111', // Alle Verkehrsmittel (Filter via JS)
    'maxJourneys' => '100',
    'selectDate' => 'today',
    'L' => 'vs_scotty.vs_liveticker',
    'outputMode' => 'tickerDataOnly',
    'time' => 'now'
]);

// Curl Request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; OeBB-Monitor/1.0)');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || empty($response)) {
    echo json_encode(['error' => 'Fehler beim Laden der Daten von ÖBB'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Parse response
$jsonData = preg_replace('/^journeysObj\s*=\s*/', '', $response);
$jsonData = html_entity_decode($jsonData, ENT_QUOTES | ENT_HTML5, 'UTF-8');
$data = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'Fehler beim Parsen der ÖBB-Daten'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Return clean JSON
echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
