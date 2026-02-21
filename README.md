# 🚂 ÖBB Fahrplan Monitor

> **Echtzeit-Abfahrtsmonitor für österreichische Bahnhöfe als Progressive Web App**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-ready-blue.svg)](https://craith.cloud/oebb)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/RaithChr)

**Live Demo:** [craith.cloud/oebb](https://craith.cloud/oebb)

---

## 📸 Screenshots

### Abfahrtsmodus (Blau)
![Abfahrtstafel](docs/screenshot-departure.png)
*Echtzeit-Abfahrten mit Betreiber-Logos, Zugtyp-Emojis und Ziel-Flags*

### Ankunftsmodus (Grün)
![Ankunftstafel](docs/screenshot-arrival.png)
*Ankunftsübersicht mit Herkunftsinformationen*

---

## ✨ Features

### 🚂 Kern-Funktionen
- ✅ **Echtzeit-Daten** direkt von der ÖBB HAFAS API
- ✅ **Abfahrt ↔ Ankunft** umschaltbar mit einem Klick (☰ Button)
- ✅ **Bus-Filter** (🚌 Button) - Busse ein/ausblenden nach Bedarf
- ✅ **Auto-Refresh** alle 15 Sekunden für aktuelle Daten
- ✅ **Station-Suche** mit Autocomplete für alle österreichischen Bahnhöfe
- ✅ **Letzte Station merken** - wird automatisch beim nächsten Start geladen

### 🎨 Design & UX
- ✅ **ÖBB-Original-Design** - Blau (#0033aa) für Abfahrt, Grün (#004d00) für Ankunft
- ✅ **Zebra-Striping** für bessere Lesbarkeit
- ✅ **Responsive** - optimiert für Mobile & Desktop
- ✅ **Blinkende Status-Punkte** nach ÖBB-Legende:
  - 🟢 **Grün:** 3-5 Minuten bis Abfahrt
  - 🟡 **Gelb:** 0-2 Minuten (gleich geht's los!)
  - ⚪ **Weiß:** Bereit zum Einsteigen
  - 🔴 **Rot:** Zug fällt aus

### 🏢 Multi-Operator Support
Automatische Erkennung und farbcodierte Logos für:
- 🔴 **ÖBB** (Rot) - S-Bahn, REX, IC, EC, RJ, Nightjet
- 🟢 **Westbahn** (Grün)
- 🔴 **DB** (Deutsche Bahn) - bei internationalen Zügen
- 🔵 **Wiener Linien** (Blau) - U-Bahn, Straßenbahn, Busse

### 🚄 Smarte Emojis

**Zugtyp-Kennzeichnung:**
- 🚄 EuroCity / InterCity (Fernverkehr)
- 🚉 S-Bahn (Nahverkehr)
- 🚆 REX (Regional Express)

**Internationale Ziele:**
- ✈️ Flughäfen (Wien, Salzburg, etc.)
- 🇩🇪 Deutschland (Berlin, München, Frankfurt, ...)
- 🇨🇭 Schweiz (Zürich, Bern, Basel, Genf)
- 🇮🇹 Italien (Rom, Venedig, Mailand, Florenz)
- 🇭🇺 Ungarn (Budapest)
- 🇨🇿 Tschechien (Prag, Brno)
- 🇸🇰 Slowakei (Bratislava)
- 🏔️ Alpine Regionen (Innsbruck, Salzburg, Kitzbühel)

### 📱 Progressive Web App (PWA)
- ✅ **Installierbar** als native App auf Android & iOS
- ✅ **Offline-Support** - letzte Daten werden gecacht
- ✅ **Fullscreen-Modus** - keine Browser-UI beim Start
- ✅ **App-Icon** mit OE3LCR Branding
- ✅ **Service Worker** für schnelle Ladezeiten

---

## 🚀 Installation

### Voraussetzungen
- PHP 7.4 oder höher
- Apache oder nginx Webserver
- HTTPS (für PWA-Funktionalität)

### Setup

1. **Repository klonen:**
```bash
git clone https://github.com/RaithChr/oebb-fahrplan-monitor.git
cd oebb-fahrplan-monitor
```

2. **Auf Webserver deployen:**
```bash
# Beispiel für Apache
sudo cp -r * /var/www/html/oebb/
sudo chown -R www-data:www-data /var/www/html/oebb/
```

3. **Webserver konfigurieren:**
```apache
# Apache .htaccess
AddDefaultCharset UTF-8
```

4. **Fertig!** Öffne im Browser:
```
https://deine-domain.de/oebb/
```

### Als PWA installieren

**Android (Chrome/Edge):**
1. Öffne die Seite im Browser
2. Menü (⋮) → **"App installieren"**
3. Bestätigen → Fertig!

**iOS (Safari):**
1. Öffne die Seite in Safari
2. Teilen-Button (□↑) → **"Zum Home-Bildschirm"**
3. "Hinzufügen" → Fertig!

---

## 🔧 Technische Details

### Stack
- **Frontend:** Vanilla JavaScript (kein Framework)
- **Backend:** PHP 7.4+ (API Proxy)
- **API:** ÖBB HAFAS (kein API-Key erforderlich)
- **PWA:** Service Worker + manifest.json

### Architektur
```
┌─────────────────┐
│   Browser/PWA   │
└────────┬────────┘
         │
    ┌────▼────┐
    │ script.js│ ← UI Logic, Live-Updates
    └────┬────┘
         │
┌────────▼────────────┐
│ fetch-departures.php│ ← PHP Proxy
└────────┬────────────┘
         │
┌────────▼─────────┐
│ ÖBB HAFAS API    │ ← Echtzeit-Daten
└──────────────────┘
```

### Browser-Kompatibilität
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (macOS & iOS)
- ✅ Firefox
- ✅ Opera

### Performance
- **Initial Load:** ~50 KB (mit Icons)
- **Cached Load:** <10 KB (Service Worker)
- **API Response:** ~1-2 Sekunden
- **Auto-Refresh:** 15 Sekunden Intervall

---

## 📂 Projektstruktur

```
oebb-fahrplan-monitor/
├── index.php              # Hauptseite + PWA Meta-Tags
├── fetch-departures.php   # ÖBB API Proxy (Abfahrt/Ankunft)
├── autocomplete.php       # Stationssuche
├── script.js              # Frontend-Logik (15 KB)
├── style.css              # Styling (8 KB)
├── manifest.json          # PWA Manifest
├── sw.js                  # Service Worker
├── icon-192.png           # App-Icon (192x192)
├── icon-512.png           # App-Icon (512x512)
├── LICENSE                # MIT Lizenz
└── README.md              # Diese Datei
```

---

## 🔌 API

Das Projekt nutzt die **öffentliche ÖBB HAFAS API** ohne Authentifizierung:

- **Abfahrten/Ankünfte:** `fahrplan.oebb.at/bin/stboard.exe/dn`
- **Stationssuche:** `fahrplan.oebb.at/bin/ajax-getstop.exe/dn`
- **Kein API-Key erforderlich**
- **Rate Limit:** Keine bekannten Einschränkungen

---

## 🛡️ Sicherheit

- ✅ **Input-Validierung** auf allen User-Inputs
- ✅ **XSS-Schutz** via `html_entity_decode()`
- ✅ **Keine Credentials** im Code
- ✅ **HTTPS required** für PWA-Features
- ✅ **Content Security Policy** ready

---

## 🤝 Contributing

Contributions sind willkommen! Bitte beachte:

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Pushe zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Details.

---

## 📜 Lizenz

Dieses Projekt ist unter der **MIT-Lizenz** lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

---

## 💖 Support

Wenn dir dieses Projekt gefällt, unterstütze mich gerne:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/christianraith)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-blue?style=for-the-badge&logo=paypal)](https://paypal.me/christianraith151)

---

## 👤 Autor

**Christian Raith (OE3LCR)**

- 📍 QTH: JN87ct (Wien, Österreich)
- 🐙 GitHub: [@RaithChr](https://github.com/RaithChr)
- 📧 Email: raith.mobile@gmail.com
- 📡 Callsign: OE3LCR

---

## 🙏 Danksagungen

- **ÖBB** für die öffentliche HAFAS API
- **Open Source Community** für Tools & Inspiration
- **Ham Radio Community** für Feedback & Support

---

## 🗓️ Changelog

### v1.0.0 (2026-02-21)
- ✨ Initial Release
- 🚂 Echtzeit-Abfahrten & Ankünfte
- 📱 PWA-Funktionalität
- 🏢 Multi-Operator Support
- 🎯 Smarte Emojis für Zugtypen & Ziele
- 🔄 Auto-Refresh & Bus-Filter

---

⭐ **Wenn dir dieses Projekt gefällt, gib ihm einen Stern auf GitHub!** ⭐

**Made with ❤️ in Austria 🇦🇹**
