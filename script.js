let refreshInterval;
let timeInterval;
let currentMode = 'dep'; // 'dep' für Abfahrt, 'arr' für Ankunft
let showBuses = localStorage.getItem('oebb_show_buses') === 'true'; // Bus-Filter State
let showWienerLinien = localStorage.getItem('oebb_show_wl') === 'true'; // WL-Filter State (default: false)

// Prüfe ob es Wiener Linien sind (U-Bahn, Tram, Busse in Wien)
function isWienerLinien(trainName, destination) {
    const train = trainName.toUpperCase();
    const dest = (destination || '').toUpperCase();
    
    // U-Bahn (U1, U2, U3, U4, U6)
    if (train.startsWith('U') && /^U[1-6]/.test(train)) {
        return true;
    }
    
    // Straßenbahn (Tram)
    if (train.includes('TRAM')) {
        return true;
    }
    
    // Busse in Wien
    if (train.includes('BUS') && dest.includes('WIEN')) {
        return true;
    }
    
    return false;
}

// Zugtyp-Emoji
function getTrainTypeEmoji(trainName) {
    const train = trainName.toUpperCase();
    
    // EC/IC - Schnellzug
    if (train.startsWith('EC ') || train.startsWith('IC ')) {
        return '🚄';
    }
    
    // S-Bahn
    if (train.startsWith('S ') || /^S\d/.test(train)) {
        return '🚉';
    }
    
    // REX - Regional Express
    if (train.startsWith('REX')) {
        return '🚆';
    }
    
    // Kein spezielles Emoji
    return '';
}

// Emoji basierend auf Ziel
function getDestinationEmoji(destination) {
    const dest = (destination || '').toUpperCase();
    
    // Flughafen
    if (dest.includes('FLUGHAFEN') || dest.includes('AIRPORT')) {
        return '✈️';
    }
    
    // Deutschland
    const germanCities = ['BERLIN', 'HAMBURG', 'MÜNCHEN', 'MUNICH', 'FRANKFURT', 'KÖLN', 'DORTMUND', 'PASSAU', 'GERMANY'];
    if (germanCities.some(city => dest.includes(city))) {
        return '🇩🇪';
    }
    
    // Schweiz - nur exakte Matches oder mit Wort-Grenzen
    if (dest.includes('ZÜRICH') || dest.includes('ZURICH')) {
        return '🇨🇭';
    }
    // "BERN" nur wenn nicht Teil von "BERNHARDSTAL" etc.
    if ((dest.includes('BERN ') || dest === 'BERN' || dest.startsWith('BERN,')) && !dest.includes('BERNHARDSTAL')) {
        return '🇨🇭';
    }
    if (dest.includes('BASEL') || dest.includes('GENF') || dest.includes('GENEVA') || dest.includes('LAUSANNE')) {
        return '🇨🇭';
    }
    
    // Italien
    const italianCities = ['ROM', 'ROME', 'VENEDIG', 'VENEZIA', 'VENICE', 'MAILAND', 'MILANO', 'MILAN', 'FLORENZ', 'VERONA'];
    if (italianCities.some(city => dest.includes(city))) {
        return '🇮🇹';
    }
    
    // Ungarn
    const hungarianCities = ['BUDAPEST', 'HUNGARY'];
    if (hungarianCities.some(city => dest.includes(city))) {
        return '🇭🇺';
    }
    
    // Tschechien
    const czechCities = ['PRAG', 'PRAGUE', 'BRNO'];
    if (czechCities.some(city => dest.includes(city))) {
        return '🇨🇿';
    }
    
    // Slowakei
    const slovakCities = ['BRATISLAVA'];
    if (slovakCities.some(city => dest.includes(city))) {
        return '🇸🇰';
    }
    
    // Alpine Regionen
    const alpineDestinations = ['INNSBRUCK', 'SALZBURG', 'KITZBÜHEL', 'ZELL AM SEE', 'BREGENZ', 'FELDKIRCH'];
    if (alpineDestinations.some(place => dest.includes(place))) {
        return '🏔️';
    }
    
    // Kein spezielles Emoji
    return '';
}

// Logo-Erkennungsfunktion
function getOperatorLogo(trainName, destination) {
    const train = trainName.toUpperCase();
    const dest = (destination || '').toUpperCase();
    
    // Westbahn
    if (train.includes('WB') || train.includes('WESTBAHN')) {
        return '<span class="operator-logo westbahn">WESTbahn</span>';
    }
    
    // Deutsche Bahn (DB) - internationale Züge nach Deutschland
    const germanCities = ['BERLIN', 'HAMBURG', 'MÜNCHEN', 'MUNICH', 'FRANKFURT', 'KÖLN', 'DORTMUND', 'PASSAU', 'GERMANY'];
    if (germanCities.some(city => dest.includes(city))) {
        return '<span class="operator-logo db">DB</span>';
    }
    
    // ÖBB - Österreichische Bundesbahnen (Standard für Züge)
    const oebbTypes = ['S ', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'REX', 'R ', 'IC ', 'EC ', 'RJ', 'EN ', 'NJ', 'CJX'];
    if (oebbTypes.some(type => train.startsWith(type))) {
        return '<span class="operator-logo oebb">ÖBB</span>';
    }
    
    // Wiener Linien (U-Bahn, Tram, Bus in Wien)
    if (train.startsWith('U') || train.includes('TRAM') || 
        (train.includes('BUS') && dest.includes('WIEN'))) {
        return '<span class="operator-logo wiener-linien">WL</span>';
    }
    
    // Kein Logo für unbekannte Betreiber oder Busse außerhalb Wiens
    return '';
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    // Letzte Station aus localStorage laden
    const savedStation = localStorage.getItem('oebb_last_station');
    const stationInput = document.getElementById('station');
    if (savedStation && stationInput) {
        stationInput.value = savedStation;
    }
    
    // CSS für Blink-Animation hinzufügen
    if (!document.getElementById('blink-style')) {
        const style = document.createElement('style');
        style.id = 'blink-style';
        style.textContent = `
            @keyframes blink {
                0%, 49% { opacity: 1; }
                50%, 100% { opacity: 0.4; }
            }
            .blink-dot {
                animation: blink 1s infinite;
                font-weight: bold;
                display: inline-block;
            }
            /* Grünes Theme für Ankunft */
            .arrival-mode .container,
            .arrival-mode body {
                background: #004d00 !important;
            }
            .arrival-mode #departures-table tbody tr {
                background: #004d00;
            }
            .arrival-mode #departures-table tbody tr:nth-child(even) {
                background: #006600;
            }
            .arrival-mode #departures-table tbody tr:hover {
                background: rgba(255, 255, 255, 0.15);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Mode Toggle Button
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle) {
        modeToggle.addEventListener('click', toggleMode);
    }
    
    // Bus Toggle Button
    const busToggle = document.getElementById('bus-toggle');
    if (busToggle) {
        busToggle.addEventListener('click', toggleBuses);
        updateBusButtonState(); // Initial state
    }
    
    // Wiener Linien Toggle Button
    const wlToggle = document.getElementById('wl-toggle');
    if (wlToggle) {
        wlToggle.addEventListener('click', toggleWienerLinien);
        updateWLButtonState(); // Initial state
    }
    
    loadDepartures();
    startAutoRefresh();
    updateTime();
    
    // Enter-Taste im Input (stationInput bereits oben deklariert)
    if (stationInput) {
        stationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadDepartures();
            }
        });
    }
    
    // Auto-Complete für Stationen
    let autocompleteTimeout;
    stationInput.addEventListener('input', (e) => {
        clearTimeout(autocompleteTimeout);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            document.getElementById('station-suggestions').innerHTML = '';
            return;
        }
        
        autocompleteTimeout = setTimeout(() => {
            fetch(`autocomplete.php?q=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(stations => {
                    const datalist = document.getElementById('station-suggestions');
                    datalist.innerHTML = '';
                    
                    stations.forEach(station => {
                        const option = document.createElement('option');
                        option.value = station.name;
                        datalist.appendChild(option);
                    });
                })
                .catch(err => console.error('Autocomplete error:', err));
        }, 300);
    });
});

function toggleMode() {
    currentMode = currentMode === 'dep' ? 'arr' : 'dep';
    
    // UI aktualisieren
    const title = document.getElementById('mode-title');
    const subtitle = document.getElementById('mode-subtitle');
    const thExpected = document.getElementById('th-expected');
    const thTrainDe = document.getElementById('th-train-de');
    const thTrainEn = document.getElementById('th-train-en');
    const thDirectionDe = document.getElementById('th-direction-de');
    const thDirectionEn = document.getElementById('th-direction-en');
    const container = document.getElementById('main-container');
    
    if (currentMode === 'arr') {
        // Ankunftsmodus
        title.textContent = 'Ankunft';
        subtitle.textContent = 'Arrival';
        thExpected.innerHTML = '<div class="th-bilingual"><span class="th-de">Aktuell</span><span class="th-en">actual</span></div>';
        thTrainDe.textContent = 'Fahrt';
        thTrainEn.textContent = 'train';
        thDirectionDe.textContent = 'Von';
        thDirectionEn.textContent = 'from';
        container.classList.add('arrival-mode');
        document.body.classList.add('arrival-mode');
    } else {
        // Abfahrtsmodus
        title.textContent = 'Abfahrt';
        subtitle.textContent = 'Departure';
        thExpected.innerHTML = '<div class="th-bilingual"><span class="th-de">Erwartet</span><span class="th-en">estimated</span></div>';
        thTrainDe.textContent = 'Zug';
        thTrainEn.textContent = 'train';
        thDirectionDe.textContent = 'Nach';
        thDirectionEn.textContent = 'to';
        container.classList.remove('arrival-mode');
        document.body.classList.remove('arrival-mode');
    }
    
    loadDepartures();
}

function toggleBuses() {
    showBuses = !showBuses;
    localStorage.setItem('oebb_show_buses', showBuses);
    updateBusButtonState();
    loadDepartures();
}

function updateBusButtonState() {
    const busToggle = document.getElementById('bus-toggle');
    if (busToggle) {
        if (showBuses) {
            busToggle.classList.add('active');
            busToggle.style.opacity = '1';
        } else {
            busToggle.classList.remove('active');
            busToggle.style.opacity = '0.4';
        }
    }
}

function toggleWienerLinien() {
    showWienerLinien = !showWienerLinien;
    localStorage.setItem('oebb_show_wl', showWienerLinien);
    updateWLButtonState();
    loadDepartures();
}

function updateWLButtonState() {
    const wlToggle = document.getElementById('wl-toggle');
    if (wlToggle) {
        if (showWienerLinien) {
            wlToggle.classList.add('active');
            wlToggle.style.opacity = '1';
        } else {
            wlToggle.classList.remove('active');
            wlToggle.style.opacity = '0.4';
        }
    }
}

function updateTime() {
    timeInterval = setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('de-AT', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        document.getElementById('current-time').textContent = timeString;
    }, 1000);
}

function loadDepartures() {
    const station = document.getElementById('station').value.trim();
    
    if (!station) {
        showError('Bitte eine Station eingeben!');
        return;
    }
    
    // Speichere Station in localStorage
    localStorage.setItem('oebb_last_station', station);
    
    // Reset countdown
    countdown = currentMode === 'dep' ? 15 : 15;
    
    // UI Updates
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('departures-container').style.opacity = '0.5';
    
    fetch(`fetch-departures.php?station=${encodeURIComponent(station)}&mode=${currentMode}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
                return;
            }
            
            displayDepartures(data);
        })
        .catch(error => {
            showError('Fehler beim Laden der Daten: ' + error.message);
        })
        .finally(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('departures-container').style.opacity = '1';
        });
}

function displayDepartures(data) {
    const tbody = document.getElementById('departures-body');
    tbody.innerHTML = '';
    
    if (!data.journey || data.journey.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Keine Züge gefunden</td></tr>';
        return;
    }
    
    // Filtere nach Toggles
    let filtered = data.journey;
    
    // Busse filtern (wenn Toggle AUS)
    if (!showBuses) {
        filtered = filtered.filter(dep => !dep.pr.toLowerCase().includes('bus'));
    }
    
    // Wiener Linien filtern (wenn Toggle AUS)
    if (!showWienerLinien) {
        filtered = filtered.filter(dep => !isWienerLinien(dep.pr, dep.lastStop));
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Keine Züge/Busse gefunden</td></tr>';
        return;
    }
    
    const trains = filtered;
    
    // === ANALYSIERE SYSTEMWARNUNGEN ===
    let cancelled = 0;
    let delayed = 0;
    let onTime = 0;
    
    trains.forEach(dep => {
        const isCancelled = dep.rt && typeof dep.rt === 'object' && dep.rt.status === 'Ausfall';
        const isDelayed = dep.rt && typeof dep.rt === 'object' && dep.rt.dlm && dep.rt.dlm > 0;
        
        if (isCancelled) {
            cancelled++;
        } else if (isDelayed) {
            delayed++;
        } else {
            onTime++;
        }
    });
    
    // Generiere Warnung basierend auf Statistiken
    const totalTrains = trains.length;
    const delayedPercent = (delayed / totalTrains) * 100;
    const cancelledPercent = (cancelled / totalTrains) * 100;
    
    let warningText = '';
    let warningBg = '#ffdd00'; // Standard gelb
    
    if (cancelledPercent > 20) {
        warningText = `⚠️ Mehrere Zugausfälle gemeldet (${cancelled}/${totalTrains})`;
        warningBg = '#ff6b00'; // Orange-rot
    } else if (delayedPercent > 50) {
        warningText = `⏱️ Viele Züge mit Verspätung (${delayed}/${totalTrains})`;
        warningBg = '#ffaa00'; // Orange
    } else if (cancelled > 0 || delayed > 0) {
        warningText = `ℹ️ ${cancelled} Ausfällle, ${delayed} Verspätungen - ${onTime}/${totalTrains} pünktlich`;
        warningBg = '#ffdd00'; // Gelb
    } else {
        warningText = `✅ Alle Züge fahren planmäßig (${onTime}/${totalTrains})`;
        warningBg = '#00dd00'; // Grün
    }
    
    // Aktualisiere Footer
    const footer = document.getElementById('footer-notice');
    if (footer) {
        footer.style.background = warningBg;
        footer.innerHTML = '<p>' + warningText + '</p>';
    }
    // === ENDE SYSTEMWARNUNGEN ===
    
    trains.forEach(dep => {
        const row = document.createElement('tr');
        
        // Zeit (geplant) - mit Punkt nach ÖBB-Legende
        const timeCell = document.createElement('td');
        timeCell.className = 'time-col';
        const now = new Date();
        const depTime = new Date();
        const [hours, minutes] = dep.ti.split(':');
        depTime.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const timeDiff = (depTime - now) / 1000 / 60;
        
        // Check ob Ausfall
        const isCancelled = dep.rt && typeof dep.rt === 'object' && dep.rt.status === 'Ausfall';
        
        let dotColor = '';
        if (isCancelled) {
            // Roter Punkt bei Ausfall
            dotColor = '#ff0000';
        } else if (timeDiff >= 3 && timeDiff <= 5) {
            dotColor = '#00ff00';
        } else if (timeDiff >= 0 && timeDiff < 3) {
            dotColor = '#ffdd00';
        } else if (timeDiff < 0 && timeDiff > -2) {
            dotColor = '#ffffff';
        }
        
        if (dotColor) {
            timeCell.innerHTML = '<span class="blink-dot" style="color: ' + dotColor + ' !important;">●</span>' + dep.ti;
        } else {
            timeCell.textContent = dep.ti;
        }
        row.appendChild(timeCell);
        
        // Aktuell/Erwartet - Verspätung oder Ausfall (Ankunft: hier werden Ausfälle gezeigt!)
        const delayTimeCell = document.createElement('td');
        delayTimeCell.className = 'delay-col';
        
        if (dep.rt && typeof dep.rt === 'object') {
            if (dep.rt.status === 'Ausfall') {
                delayTimeCell.innerHTML = '<span class="cancelled">Ausfall</span>';
            } else if (dep.rt.dlt) {
                delayTimeCell.textContent = dep.rt.dlt;
            }
        }
        row.appendChild(delayTimeCell);
        
        // Zug/Fahrt - mit Betreiber-Logo, Zugtyp-Emoji und Ziel-Emoji
        const trainCell = document.createElement('td');
        trainCell.className = 'train-col';
        
        const logo = getOperatorLogo(dep.pr, dep.lastStop);
        const trainTypeEmoji = getTrainTypeEmoji(dep.pr);
        const destEmoji = getDestinationEmoji(dep.lastStop);
        
        if (currentMode === 'dep') {
            // Abfahrtsmodus: Logo + Zugnummer + Zugtyp-Emoji + Ziel-Emoji
            const logoHtml = logo ? logo + ' ' : '';
            const trainEmojiHtml = trainTypeEmoji ? ' ' + trainTypeEmoji : '';
            const destEmojiHtml = destEmoji ? ' ' + destEmoji : '';
            trainCell.innerHTML = logoHtml + dep.pr + trainEmojiHtml + destEmojiHtml;
        } else {
            trainCell.textContent = dep.pr;
        }
        row.appendChild(trainCell);
        
        // Nach/Von - bei Ankunft zeige "Von" (Herkunft), bei Abfahrt "Nach" (Ziel)
        const destCell = document.createElement('td');
        destCell.className = 'destination-col';
        
        if (currentMode === 'arr') {
            // Ankunftsmodus: Zeige Herkunft (st = Startbahnhof)
            destCell.textContent = dep.st || dep.lastStop;
        } else {
            // Abfahrtsmodus: Zeige Ziel
            destCell.textContent = dep.lastStop;
        }
        row.appendChild(destCell);
        
        // Info
        const infoCell = document.createElement('td');
        infoCell.className = 'info-col';
        if (dep.rt && typeof dep.rt === 'object' && dep.rt.dlm && dep.rt.status !== 'Ausfall') {
            infoCell.innerHTML = '<span class="delay-info">+' + dep.rt.dlm + ' min</span>';
        } else if (dep.st && dep.st !== dep.lastStop) {
            infoCell.textContent = 'über ' + dep.st;
        }
        row.appendChild(infoCell);
        
        // Gleis
        const platformCell = document.createElement('td');
        platformCell.className = 'platform-col';
        platformCell.textContent = dep.tr || '-';
        row.appendChild(platformCell);
        
        tbody.appendChild(row);
    });
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('departures-container').style.display = 'none';
}

function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        loadDepartures();
    }, 15000);
}

// Cleanup bei Page Unload
window.addEventListener('beforeunload', () => {
    clearInterval(refreshInterval);
    clearInterval(timeInterval);
});

let countdown = 15;
