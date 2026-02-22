<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ÖBB Abfahrtstafel - Wiener Neustadt</title>
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#0033aa">
    
    <!-- iOS Support -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="ÖBB Monitor">
    <link rel="apple-touch-icon" href="icon-192.png">
    
    <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>">
    
    <!-- Service Worker Registration -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(reg => console.log('[PWA] Service Worker registered:', reg.scope))
                    .catch(err => console.log('[PWA] Service Worker registration failed:', err));
            });
        }
    </script>
</head>
<body>
    <div class="container" id="main-container">
        <header>
            <div class="header-left">
                <button id="mode-toggle" class="mode-toggle-btn" title="Abfahrt/Ankunft umschalten">
                    <span class="toggle-icon">☰</span>
                </button>
                <div class="header-title">
                    <div class="title-row">
                        <h1 id="mode-title">Abfahrt</h1>
                        <img src="qr-code.png" alt="QR-Code" class="header-qr" title="Scan für https://craith.cloud/oebb/">
                    </div>
                    <span class="header-subtitle" id="mode-subtitle">Departure</span>
                </div>
                <div class="station-selector">
                    <input type="text" id="station" value="Wiener Neustadt" placeholder="Station eingeben..." list="station-suggestions" autocomplete="off">
                    <datalist id="station-suggestions"></datalist>
                    <button onclick="loadDepartures()">↻</button>
                    <button id="bus-toggle" class="bus-toggle-btn" title="Busse ein/ausblenden">
                        🚌
                    </button>
                    <button id="wl-toggle" class="wl-toggle-btn" title="Wiener Linien ein/ausblenden">
                        WL
                    </button>
                </div>
            </div>
            <div class="header-right">
                <div class="current-time" id="current-time">--:--:--</div>
                <div class="oebb-logo">ÖBB</div>
            </div>
        </header>

        <div id="loading" class="loading" style="display: none;">
            <p>Lade Daten...</p>
        </div>

        <div id="error" class="error" style="display: none;"></div>

        <div id="departures-container">
            <table id="departures-table">
                <thead>
                    <tr>
                        <th>
                            <div class="th-bilingual">
                                <span class="th-de">Zeit</span>
                                <span class="th-en">time</span>
                            </div>
                        </th>
                        <th id="th-expected">
                            <div class="th-bilingual">
                                <span class="th-de">Erwartet</span>
                                <span class="th-en">estimated</span>
                            </div>
                        </th>
                        <th>
                            <div class="th-bilingual">
                                <span class="th-de" id="th-train-de">Zug</span>
                                <span class="th-en" id="th-train-en">train</span>
                            </div>
                        </th>
                        <th>
                            <div class="th-bilingual">
                                <span class="th-de" id="th-direction-de">Nach</span>
                                <span class="th-en" id="th-direction-en">to</span>
                            </div>
                        </th>
                        <th>
                            <div class="th-bilingual">
                                <span class="th-de">Info</span>
                                <span class="th-en">info</span>
                            </div>
                        </th>
                        <th style="text-align: right;">
                            <div class="th-bilingual">
                                <span class="th-de">Bahnsteig</span>
                                <span class="th-en">platform</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody id="departures-body">
                    <!-- Wird via JavaScript gefüllt -->
                </tbody>
            </table>
        </div>

        <footer id="footer-notice">
            <p>Aufgrund der derzeitigen Schneefälle kann es österreichweit zu Verspätungen und Zugausfällen kommen.</p>
        </footer>
    </div>

    <script src="script.js?v=<?php echo time(); ?>"></script>
</body>
</html>
