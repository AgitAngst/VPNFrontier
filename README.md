# 🛡️ VPN Frontier

**Block-first domain zone blocker for Chrome and Firefox**

[Русский](#-русский) · [English](#-english) · [Installation](#-installation) · [Privacy](#-privacy-policy)

---

## 🇷🇺 Русский

### Что это?

VPN Frontier — расширение для браузера, которое блокирует доступ к российским доменным зонам (.ru, .рф, .su и другим), если ваш IP-адрес находится за пределами России. Работает на уровне браузера — запросы перехватываются **до** соединения с сервером. Данные никуда не уходят.

### Зачем?

Вы находитесь за границей и не хотите случайно заходить на российские сайты. Или хотите контролировать, какие доменные зоны доступны из вашей сети. VPN Frontier решает это автоматически — без ручной настройки прокси или файрвола.

---

### Ключевые возможности

#### 🔒 Архитектура «блокировка по умолчанию»
При установке все российские зоны блокируются мгновенно — ещё до первой проверки IP. Блокировка снимается только после подтверждения реального российского IP-адреса. Никаких окон уязвимости.

#### 🌍 10 сервисов проверки IP на выбор
Выбирайте, каким API доверяете:
- ipapi.co, ipinfo.io, ifconfig.co, ipwho.is, freeipapi.com
- ip-api.com, ipdata.co, ipbase.com, ipgeolocation.io, ip2location.io

Включайте и выключайте каждый независимо. Минимум один должен быть активен. Расширение пробует по порядку и останавливается на первом успешном.

#### ⚡ 6 настраиваемых триггеров проверки
Комбинируйте любые условия — каждое включается/выключается независимо:

| Триггер | Описание |
|---------|----------|
| **Заход на заблокированный сайт** | IP-чек при каждой навигации на .ru и т.д. |
| **Переключение вкладки** | Проверка при смене активной вкладки |
| **По таймеру** | Периодическая проверка (5 / 10 / 15 / 30 / 60 мин) |
| **Запуск браузера** | Проверка при старте Chrome/Firefox |
| **Выход из спящего режима** | Определяет, что ноутбук просыпался |
| **Возврат в окно браузера** | При переключении из другого приложения |

#### 🏳️ Динамическая иконка
На сайтах в зоне .ru иконка расширения превращается в 🇷🇺 флаг России. На остальных сайтах — 🌐 глобус.

#### 🌐 Полная двуязычность
Русский и английский — переключается одной кнопкой RU/EN. Переводится всё: popup, страница блокировки, настройки, уведомления, контекстное меню. Названия стран отображаются на текущем языке с emoji-флагом: 🇳🇱 Нидерланды (NL).

#### 🔊 Звуковое уведомление
При блокировке воспроизводится короткий двухтональный звук. Генерируется через Web Audio API — без файлов. Включается/выключается в настройках.

#### 📊 Статистика блокировок
- Карточки: сегодня / за 7 дней / всего
- Столбчатая диаграмма по дням
- Топ-10 заблокированных доменов
- Кнопка сброса

#### 🧩 Пользовательские зоны и белый список
- **Добавляйте зоны:** `.by`, `.kz`, `.ua` — любые TLD
- **Белый список:** разрешайте отдельные сайты внутри заблокированных зон (например, `translate.yandex.ru`)
- Управление через popup, настройки или контекстное меню (правый клик)

#### 💡 Умное определение VPN
Если обнаружен российский VPN — доступ **не** блокируется, но показывается мягкое предупреждение: «VPN лучше не включать без необходимости». Определяет по ISP/организации: Kaspersky, Browsec, Yandex, Ростелеком, MTS и другие.

#### 📦 Импорт / Экспорт
Все настройки (зоны, белый список, провайдеры, триггеры, язык, история) экспортируются в JSON. Можно перенести на другой компьютер или поделиться конфигурацией.

#### 🔄 Синхронизация
Настройки хранятся в `chrome.storage.sync` — автоматически синхронизируются между устройствами через ваш Google-аккаунт.

#### ⚙️ Полноценная страница настроек
Все настройки доступны не только из popup, но и на отдельной странице — удобной и просторной. Открывается кнопкой ⚙️ или через настройки расширения в браузере.

---

### Встроенные заблокированные зоны

| Зона | Punycode |
|------|----------|
| .ru | ru |
| .рф | xn--p1ai |
| .su | su |
| .рус | xn--p1acf |
| .москва | xn--80adxhks |
| .сайт | xn--80aswg |
| .дети | xn--d1acj3b |
| .онлайн | xn--80asehdb |
| .орг | xn--c1avg |
| .ею | xn--e1a4c |

---

### Как работает страница блокировки?

Когда вы заходите на заблокированный сайт:

1. Запрос перехватывается на уровне сети (`declarativeNetRequest`) — **до** TCP-соединения
2. Открывается страница блокировки с информацией:
   - Заблокированный URL
   - Ваш IP, страна (с флагом), провайдер, причина
   - Предупреждение о VPN
3. Кнопка **«Проверить IP»** — делает свежий запрос к API
4. Если IP российский — появляется кнопка **«Перейти на сайт»**
5. Если нет — звуковое уведомление и сообщение о блокировке

---

## 🇬🇧 English

### What is it?

VPN Frontier is a browser extension that blocks access to Russian domain zones (.ru, .рф, .su, and others) when your IP address is outside Russia. It works at the browser level — requests are intercepted **before** any connection to the server. No data leaves your browser.

### Why?

You're abroad and want to prevent accidental access to Russian websites. Or you want to control which domain zones are accessible from your network. VPN Frontier handles this automatically — no manual proxy or firewall setup needed.

---

### Key Features

#### 🔒 Block-First Architecture
On install, all Russian zones are blocked instantly — before the first IP check. Blocking is lifted only after confirming a real Russian IP address. Zero vulnerability windows.

#### 🌍 10 Selectable IP Check Services
Choose which APIs you trust:
- ipapi.co, ipinfo.io, ifconfig.co, ipwho.is, freeipapi.com
- ip-api.com, ipdata.co, ipbase.com, ipgeolocation.io, ip2location.io

Toggle each independently. At least one must be active. The extension tries them in order and stops at the first success.

#### ⚡ 6 Configurable Check Triggers
Combine any conditions — each toggles independently:

| Trigger | Description |
|---------|-------------|
| **Visit to a blocked site** | IP check on every navigation to .ru etc. |
| **Tab switch** | Check when switching active tabs |
| **Timer** | Periodic check (5 / 10 / 15 / 30 / 60 min) |
| **Browser startup** | Check when Chrome/Firefox starts |
| **Wake from sleep** | Detects laptop waking from sleep |
| **Return to browser** | When switching back from another app |

#### 🏳️ Dynamic Icon
On .ru sites the extension icon becomes 🇷🇺 Russian flag. On other sites — 🌐 globe.

#### 🌐 Full Bilingual Interface
Russian and English — switch with one RU/EN button. Everything translates: popup, block page, settings, notifications, context menu. Country names display in current language with emoji flag: 🇳🇱 Netherlands (NL).

#### 🔊 Sound Notification
A short two-tone sound plays on block. Generated via Web Audio API — no files needed. Toggle on/off in settings.

#### 📊 Block Statistics
- Cards: today / last 7 days / total
- Bar chart by day
- Top 10 blocked domains
- Reset button

#### 🧩 Custom Zones & Whitelist
- **Add zones:** `.by`, `.kz`, `.ua` — any TLD
- **Whitelist:** allow specific sites within blocked zones (e.g., `translate.yandex.ru`)
- Manage via popup, settings page, or context menu (right-click)

#### 💡 Smart VPN Detection
If a Russian VPN is detected — access is **not** blocked, but a soft warning is shown: "Consider turning off your VPN when you don't need it." Detects by ISP/organization: Kaspersky, Browsec, Yandex, Rostelecom, MTS, and others.

#### 📦 Import / Export
All settings (zones, whitelist, providers, triggers, language, history) export to JSON. Transfer to another computer or share your configuration.

#### 🔄 Sync Across Devices
Settings are stored in `chrome.storage.sync` — automatically synced across devices via your Google account.

#### ⚙️ Full Settings Page
All settings available not only from the popup but also on a dedicated full-size page. Opens via ⚙️ button or through browser extension settings.

---

### Built-in Blocked Zones

| Zone | Punycode |
|------|----------|
| .ru | ru |
| .рф | xn--p1ai |
| .su | su |
| .рус | xn--p1acf |
| .москва | xn--80adxhks |
| .сайт | xn--80aswg |
| .дети | xn--d1acj3b |
| .онлайн | xn--80asehdb |
| .орг | xn--c1avg |
| .ею | xn--e1a4c |

---

### How does the block page work?

When you visit a blocked site:

1. The request is intercepted at the network level (`declarativeNetRequest`) — **before** any TCP connection
2. A block page opens with:
   - Blocked URL
   - Your IP, country (with flag), ISP, reason
   - VPN warning
3. **"Check IP"** button — makes a fresh API request
4. If IP is Russian — **"Go to site"** button appears
5. If not — sound notification and block message

---

## 📥 Installation

### Chrome (v120+)

1. Download `vpn-frontier-chrome.zip`
2. Unzip to any folder
3. Open `chrome://extensions/`
4. Enable **Developer mode** (toggle in top-right)
5. Click **Load unpacked**
6. Select the `vpn-frontier` folder
7. Done — the extension icon appears in the toolbar

### Firefox (v128+)

1. Download `vpn-frontier-firefox.zip`
2. Unzip to any folder
3. Open `about:debugging#/runtime/this-firefox`
4. Click **Load Temporary Add-on**
5. Select `manifest.json` from the `vpn-frontier-firefox` folder
6. Done — works until browser restart (for permanent install, publish to AMO)

### Permanent Firefox install

To install permanently in Firefox, you need to publish the extension on [addons.mozilla.org](https://addons.mozilla.org) or sign it via the AMO API. Temporary loading is for development and testing only.

---

## 🏗️ Architecture

```
vpn-frontier/
├── manifest.json          # Extension config (MV3)
├── background.js          # Service worker — IP checks, rules, blocking logic
├── lang.js                # i18n — all strings in RU and EN, country names, flags
├── popup.html / popup.js  # Toolbar popup — status, quick settings
├── options.html / options.js  # Full settings page — stats, providers, zones
├── blocked.html / blocked.js  # Block page — shown on blocked navigation
└── icons/
    ├── globe{16,48,128}.png   # Default icon (globe)
    └── ru{16,48,128}.png      # Russian flag icon (for .ru sites)
```

### Tech Stack

- **Manifest V3** — latest Chrome/Firefox extension standard
- **declarativeNetRequest** — network-level blocking before TCP connection
- **webNavigation** — per-navigation IP checks (Layer 2)
- **chrome.storage.sync** — settings sync across devices
- **chrome.storage.session** — tab-specific blocked URL tracking
- **Web Audio API** — sound notifications without audio files
- **No frameworks, no build step** — pure vanilla JS, works directly

---

## 🔒 Privacy Policy

VPN Frontier does **not** collect, store, or transmit your personal data.

- **IP address** — checked via third-party APIs solely to determine your country. You choose which APIs to use. Results are stored locally.
- **Block history** — stored only on your device in `chrome.storage.local`.
- **Settings** — stored in `chrome.storage.sync` (synced via your Google account, not our servers).
- **No analytics, no tracking, no cookies, no external servers.**

Full privacy policy: [privacy-policy.html](privacy-policy.html)

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push and open a Pull Request

Issues and suggestions are welcome.

---

<p align="center">
  <b>VPN Frontier v6.1.0</b><br>
  Built with focus on privacy, security, and simplicity.
</p>
