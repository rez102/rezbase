const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomControl: false,
    doubleClickZoom: false // 連打時のズーム/移動を防止
});

// ズームコントロールは非表示

// カスタムピン作成ボタン
const customPinControl = L.control({ position: 'topright' });
customPinControl.onAdd = function() {
    const container = L.DomUtil.create('div', 'leaflet-control custom-pin-control');
    const btn = L.DomUtil.create('button', 'custom-pin-btn', container);
    btn.type = 'button';
    btn.title = 'カスタムピン作成';
    btn.innerHTML = '<img src="../images/map/新規マップピン.png" alt="">';
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(btn, 'click', (e) => {
        L.DomEvent.stop(e);
        toggleCustomPinSidebar();
    });
    return container;
};
customPinControl.addTo(map);

// ピン一括管理ボタン
const pinBulkControl = L.control({ position: 'topright' });
pinBulkControl.onAdd = function() {
    const container = L.DomUtil.create('div', 'leaflet-control pin-bulk-control');
    const btn = L.DomUtil.create('button', 'custom-pin-btn', container);
    btn.type = 'button';
    btn.title = '標記したマップピン';
    btn.innerHTML = '<img src="../images/map/砂時計.png" alt="">';
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(btn, 'click', (e) => {
        L.DomEvent.stop(e);
        togglePinBulkSidebar();
    });
    return container;
};
pinBulkControl.addTo(map);

const w = 1120;
const h = 1120;
const bounds = [[0, 0], [h, w]];

const mapOverlayPaths = {
    base: '../images/maneater_map.png',
    dlc: '../images/dlc_maneater_map.png'
};

let mapOverlayMode = localStorage.getItem('maneater_map_overlay') || 'base';
let currentMapOverlay = L.imageOverlay(mapOverlayPaths[mapOverlayMode], bounds).addTo(map);

map.fitBounds(bounds, { paddingTopLeft: [320, 0] });

// デバッグ用：クリックした座標と洞窟当たり判定を表示
map.on('click', function(e) {
    if (customPinMode) {
        if (mobileCustomPinPlacementMode) return;
        setCustomPinDraft(e.latlng);
        return;
    }
    const hitCave = collectibles.find(c => c.type === 'cave' && Math.hypot(c.lat - e.latlng.lat, c.lng - e.latlng.lng) <= CAVE_HIT_RADIUS);
    if (hitCave) {
        console.log(`[洞窟ヒット] ${hitCave.area} (${hitCave.id})`);

        if (currentRouteView === 'create' && !batchMode) {
            // ルート作成モードでは詳細ポップアップは出さない（他のピンと同じ動作）
            addPinToRoute(hitCave.id);
            console.log(`ルート作成中：洞窟ピンを追加 ${hitCave.id}`);
            return;
        }

        L.popup({ closeButton: false, autoClose: true })
            .setLatLng([hitCave.lat, hitCave.lng])
            .setContent(`<strong>洞窟</strong><br>座標: ${hitCave.lat.toFixed(2)}, ${hitCave.lng.toFixed(2)}<br>（クリックでピン追加）`)
            .openOn(map);
    }

    if (currentRouteView === 'create') {
        return;
    }

    console.log(`lat: ${e.latlng.lat.toFixed(2)}, lng: ${e.latlng.lng.toFixed(2)}`);
});

// アイコン定義
const icons = {
    landmark: L.icon({ iconUrl: '../images/map/ランドマーク.png', iconSize: [32, 32], iconAnchor: [16, 26], popupAnchor: [0, -20] }),
    nutrient: L.icon({ iconUrl: '../images/map/栄養箱.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    plate: L.icon({ iconUrl: '../images/map/ナンバープレート.png', iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -10] }),
    'main-quest': L.icon({ iconUrl: '../images/map/メインクエスト.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    'sub-quest': L.icon({ iconUrl: '../images/map/手配.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    'time-trial': L.icon({ iconUrl: '../images/map/タイムトライアル.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    manhunt: L.icon({ iconUrl: '../images/map/人間狩り.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    quest: L.icon({ iconUrl: '../images/map/クエスター.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    'infamy-1': L.icon({ iconUrl: '../images/map/悪名ランク1.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    grate: L.icon({ iconUrl: '../images/map/鉄格子.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    floodgate: L.icon({ iconUrl: '../images/map/水門.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    cave: L.icon({ iconUrl: '../images/map/洞窟.png', iconSize: [34, 34], iconAnchor: [17, 20], popupAnchor: [0, -12], className: 'cave-marker-invisible' }),
};

const customPinIcon = L.icon({
    iconUrl: '../images/map/新規マップピン.png',
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -24]
});

// 収集物データ
let rawCollectibles = [];

// --- ルートシステムの状態管理 ---
let currentSidebar = 'main'; // 'main' or 'route'
let lastSidebar = 'main';
let currentRouteView = 'browse'; // 'browse' or 'create'
let activeRouteTab = 'trend'; // 'trend' or 'my'
let myRoutes = JSON.parse(localStorage.getItem('myRoutes') || '[]');
let currentDetailedRoute = null; // 現在詳細表示しているルート
let creatingRoute = {
    id: null,
    name: '',
    description: '',
    sections: [{ name: '区間1', pins: [] }] // 初期状態で1つ区間を持つ
};
let activeSectionIndex = 0;
let routeIsModified = false;
let routePolylines = [];
let routePreviewMarkers = [];
let routeDecorators = [];
let focusedRoutePins = null;
let routePinHighlights = [];
let routeHoverLine = null;
let routeHoverDecorator = null;

// 洞窟ゾーン（当たり判定用）
const caveCircleLayers = [];
const CAVE_HIT_RADIUS = 10; // ピクセル相当として扱う（小さめ）
const CAVE_DISPLAY_RADIUS = 10;

// --- カスタムピン ---
let customPins = [];
let customPinMarkers = new Map();
let customPinMode = false;
let mobileCustomPinPlacementMode = false;
let customPinDraft = null;
let customPinDraftMarker = null;
let customPinSelectedType = 'landmark';
let showCustomPins = true;
let customPinVisibility = new Set();
let customPinObtained = new Set(JSON.parse(localStorage.getItem('maneater_custom_pins_obtained') || '[]'));
let batchCustomObtained = new Set();
let customPinById = new Map();
let pinBulkSidebarOpen = false;
let customPinSortMode = 'created';
let tutorialStepIndex = 0;
const tutorialStorageKey = 'maneater_map_tutorial_done_v2';

// トレンドルート（作者作成）のサンプルデータ
const trendRoutes = [
    {
        id: 'trend-1',
        name: 'フォーティック・バイユー全回収',
        description: 'バイユーの全ての収集物を効率よく回収するルートです。',
        sections: [
            { name: '西側エリア', pins: ['landmark-0', 'landmark-1'] },
            { name: '東側エリア', pins: ['plate-0'] }
        ]
    }
];

// ID 割り当てと統合
const collectibles = [];

function buildCollectibles(raw) {
    collectibles.length = 0;
    raw.forEach((d, index) => {
        let name = d.type;
        if (d.type === 'landmark') name = 'ランドマーク';
        else if (d.type === 'nutrient') name = '栄養箱';
        else if (d.type === 'plate') name = 'ナンバープレート';
        else if (d.type === 'main-quest') name = 'メインクエスト';
        else if (d.type === 'sub-quest') name = '狩猟クエスト';
        else if (d.type === 'time-trial') name = 'タイムトライアル';
        else if (d.type === 'manhunt') name = '復讐クエスト';
        else if (d.type === 'quest') name = 'クエスター';
        else if (d.type === 'grate') name = '鉄格子';
        else if (d.type === 'floodgate') name = '水門';
        else if (d.type === 'cave') name = '洞窟';

        collectibles.push({ 
            ...d, 
            id: `${d.type}-${index}`,
            name: name,
            source: d.source || 'base', // base or dlc
            map: d.map || 'base' // base or dlc overlay association
        });
    });
}

// 状態管理
let activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'manhunt', 'grate', 'floodgate', 'cave']);
let activeDlcTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'time-trial', 'manhunt', 'quest', 'grate', 'floodgate', 'cave']);
let activeAreas = new Set();
let savedActiveTypes = null;
let savedActiveDlcTypes = null;
let activeSources = new Set(['base', 'dlc']); // Base game / DLC の識別用
let obtainedPins = new Set(JSON.parse(localStorage.getItem('maneater_obtained_pins') || '[]'));
let showObtained = true;
let batchMode = false;
let batchObtainedPins = new Set();
let pinnedRoutes = new Set(JSON.parse(localStorage.getItem('maneater_pinned_routes') || '[]'));

let routeMode = false;
let currentRoutePoints = [];
let routes = JSON.parse(localStorage.getItem('maneater_routes') || '[]');
let currentPolyline = null;

const markers = [];

async function loadCollectibles() {
    const res = await fetch('collectibles.json', { cache: 'no-store' });
    if (!res.ok) {
        throw new Error('collectibles.json の読み込みに失敗しました');
    }
    return await res.json();
}

// 初期化
async function init() {
    try {
        rawCollectibles = await loadCollectibles();
        buildCollectibles(rawCollectibles);
    } catch (err) {
        console.error(err);
    }
    renderMarkers();
    loadCustomPins();
    renderCustomPins();
    updateCustomPinCount();
    setupEventListeners();
    setTimeout(() => {
        initTutorial();
    }, 400);
}

function renderMarkers() {
    // 既存のマーカーを削除
    markers.forEach(m => m.marker.remove());
    markers.length = 0;

    collectibles.forEach(item => {
        const isObtained = obtainedPins.has(item.id);
        
        const marker = L.marker([item.lat, item.lng], { 
            icon: icons[item.type],
            id: item.id // カスタムプロパティ
        });

        marker.on('click', (e) => {
            if (batchMode) {
                toggleBatchSelection(item.id, marker);
                L.DomEvent.stop(e);
            } else if (currentRouteView === 'create') {
                addPinToRoute(item.id);
                L.DomEvent.stop(e);
            }
        });
        marker.on('mouseover', () => {
            if (currentRouteView === 'create' && !batchMode) {
                showRouteHoverPreview(item.id);
            }
        });
        marker.on('mouseout', () => {
            if (currentRouteView === 'create' && !batchMode) {
                clearRouteHoverPreview();
            }
        });

        // ポップアップ内容
        const popupContent = document.createElement('div');
        popupContent.className = 'custom-popup';
        popupContent.innerHTML = `
            <div style="font-weight:bold; margin-bottom:5px;">${item.name}</div>
            <div style="font-size:0.8rem; color:#aaa; margin-bottom:10px;">${item.area}</div>
            <div class="popup-buttons">
                <button class="popup-btn obtained-toggle ${isObtained ? 'active' : ''}" onclick="toggleObtainedFromPopup('${item.id}')">
                    ${isObtained ? '✓ 取得済み' : '取得済みにする'}
                </button>
                <button class="popup-btn" onclick="startBatchFromPopup()">一括表記</button>
            </div>
        `;
        marker.bindPopup(popupContent, { autoPan: false });

        markers.push({ marker, item });
        updateMarkerAppearance(marker, item.id);
    });

    renderCaveZones();
    applyFilter();
}

function renderCaveZones() {
    // 既存の洞窟円をいったん消去
    caveCircleLayers.forEach(entry => entry.circle.remove());
    caveCircleLayers.length = 0;

    collectibles
        .filter(item => item.type === 'cave')
        .forEach(item => {
            const circle = L.circle([item.lat, item.lng], {
                radius: CAVE_DISPLAY_RADIUS,
                color: '#ff8f00',
                fillColor: 'rgba(255, 143, 0, 0.25)',
                weight: 2,
                fillOpacity: 0.25,
                interactive: false
            });
            caveCircleLayers.push({ circle, item });
        });

    // 表示切り替えは applyFilter() に任せる
}

function updateMarkerAppearance(marker, id) {
    const el = marker.getElement();
    if (!el) {
        marker.on('add', () => updateMarkerAppearance(marker, id));
        return;
    }

    // バッチモード中は一時的な状態を使用
    const isObtained = batchMode ? batchObtainedPins.has(id) : obtainedPins.has(id);

    if (isObtained) {
        el.classList.add('marker-obtained');
    } else {
        el.classList.remove('marker-obtained');
    }
}

// --- カスタムピン ---
function loadCustomPins() {
    try {
        const stored = JSON.parse(localStorage.getItem('maneater_custom_pins') || '[]');
        customPins = Array.isArray(stored) ? stored : [];
        customPins = customPins.map(pin => ({
            ...pin,
            map: pin.map || 'base'
        }));
    } catch (e) {
        customPins = [];
    }
}

function saveCustomPins() {
    localStorage.setItem('maneater_custom_pins', JSON.stringify(customPins));
}

function renderCustomPins() {
    customPinMarkers.forEach(marker => marker.remove());
    customPinMarkers.clear();
    customPinById = new Map();
    customPinVisibility = new Set(customPins.map(p => p.id));
    customPins.forEach(pin => {
        customPinById.set(pin.id, pin);
        addCustomPinMarker(pin);
    });
    if (currentRouteView === 'create') {
        customPinMarkers.forEach(marker => {
            if (marker.getPopup()) {
                marker._tempPopup = marker.getPopup();
                marker.unbindPopup();
            }
        });
    }
    applyCustomPinVisibility();
    renderCustomPinList();
}

function addCustomPinMarker(pin) {
    const icon = getCustomPinIcon(pin.type);
    const marker = L.marker([pin.lat, pin.lng], { icon, customId: pin.id, customMap: pin.map });
    marker.on('click', (e) => {
        if (batchMode) {
            toggleCustomPinBatchSelection(pin.id, marker);
            L.DomEvent.stop(e);
        } else if (currentRouteView === 'create') {
            if (marker.getPopup()) marker.unbindPopup();
            addPinToRoute(pin.id);
            L.DomEvent.stop(e);
            return;
        }
    });
    marker.on('mouseover', () => {
        if (currentRouteView === 'create' && !batchMode) {
            showRouteHoverPreview(pin.id);
        }
    });
    marker.on('mouseout', () => {
        if (currentRouteView === 'create' && !batchMode) {
            clearRouteHoverPreview();
        }
    });
    const popup = document.createElement('div');
    popup.className = 'custom-popup';
    popup.innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px;">${pin.name || 'カスタムピン'}</div>
        ${pin.detail ? `<div style="font-size:0.85rem; color:#ddd; margin-bottom:6px;">${pin.detail}</div>` : ''}
        <div class="popup-buttons">
            <button class="popup-btn obtained-toggle ${customPinObtained.has(pin.id) ? 'active' : ''}" onclick="toggleCustomPinObtained('${pin.id}')">
                ${customPinObtained.has(pin.id) ? '✓ 取得済み' : '取得済みにする'}
            </button>
            <button class="popup-btn" onclick="deleteCustomPin('${pin.id}')">削除</button>
        </div>
    `;
    if (currentRouteView !== 'create') {
        marker.bindPopup(popup, { autoPan: false });
    }
    marker.addTo(map);
    customPinMarkers.set(pin.id, marker);
    updateCustomPinObtainedAppearance(pin.id);
}

window.deleteCustomPin = function(id) {
    const marker = customPinMarkers.get(id);
    if (marker) marker.remove();
    customPinMarkers.delete(id);
    customPins = customPins.filter(p => p.id !== id);
    customPinVisibility.delete(id);
    customPinObtained.delete(id);
    saveCustomPins();
    saveCustomPinObtained();
    updateCustomPinCount();
    renderCustomPinList();
};

function saveCustomPinObtained() {
    localStorage.setItem('maneater_custom_pins_obtained', JSON.stringify([...customPinObtained]));
}

function updateCustomPinObtainedAppearance(id) {
    const marker = customPinMarkers.get(id);
    if (!marker) return;
    const el = marker.getElement();
    if (!el) {
        marker.on('add', () => updateCustomPinObtainedAppearance(id));
        return;
    }
    const obtained = batchMode ? batchCustomObtained.has(id) : customPinObtained.has(id);
    if (obtained) {
        el.classList.add('marker-obtained');
    } else {
        el.classList.remove('marker-obtained');
    }
}

function toggleCustomPinBatchSelection(id, marker) {
    if (batchCustomObtained.has(id)) {
        batchCustomObtained.delete(id);
    } else {
        batchCustomObtained.add(id);
    }
    updateCustomPinObtainedAppearance(id);
    updateBatchCount();
}

window.toggleCustomPinObtained = function(id) {
    if (customPinObtained.has(id)) {
        customPinObtained.delete(id);
    } else {
        customPinObtained.add(id);
    }
    saveCustomPinObtained();
    updateCustomPinObtainedAppearance(id);
    renderCustomPinList();
    const marker = customPinMarkers.get(id);
    if (marker && marker.getPopup()) {
        const btn = marker.getPopup().getElement().querySelector('.obtained-toggle');
        if (btn) {
            btn.classList.toggle('active');
            btn.innerText = customPinObtained.has(id) ? '✓ 取得済み' : '取得済みにする';
        }
    }
};

function applyCustomPinVisibility() {
    customPinMarkers.forEach(marker => {
        const id = marker.options && marker.options.customId;
        const pinData = id ? customPinById.get(id) : null;
        const mapValue = pinData ? pinData.map : (marker.options && marker.options.customMap);
        const mapOk = !mapValue || mapValue === mapOverlayMode;
        const pinVisible = showCustomPins && (!id || customPinVisibility.has(id)) && mapOk;
        if (pinVisible) {
            if (!map.hasLayer(marker)) marker.addTo(map);
        } else if (map.hasLayer(marker)) {
            marker.remove();
        }
    });
}

function updateCustomPinCount() {
    const titleEl = document.getElementById('custom-pin-section-title');
    if (titleEl) titleEl.innerText = `新規マップピン (${customPins.length})`;
}

function getRoutePinMeta(pinId) {
    const mData = markers.find(m => m.item.id === pinId);
    if (mData && mData.item) {
        return {
            name: mData.item.name,
            type: mData.item.type,
            iconUrl: (icons[mData.item.type] && icons[mData.item.type].options && icons[mData.item.type].options.iconUrl) || '',
            map: mData.item.map,
            latlng: mData.marker.getLatLng()
        };
    }
    const cpin = customPins.find(p => p.id === pinId);
    if (cpin) {
        return {
            name: cpin.name && cpin.name.trim().length > 0 ? cpin.name : '無題',
            type: cpin.type,
            iconUrl: (icons[cpin.type] && icons[cpin.type].options && icons[cpin.type].options.iconUrl) || (customPinIcon.options && customPinIcon.options.iconUrl) || '',
            map: cpin.map || mapOverlayMode,
            latlng: L.latLng(cpin.lat, cpin.lng)
        };
    }
    return null;
}

function renderCustomPinList() {
    const list = document.getElementById('custom-pin-list');
    if (!list) return;
    list.innerHTML = '';
    const sortedPins = [...customPins];
    if (customPinSortMode === 'name') {
        sortedPins.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'));
    }
    sortedPins.forEach(pin => {
        const btn = document.createElement('button');
        btn.className = 'filter-type-btn custom-pin-item';
        btn.dataset.customPinId = pin.id;
        btn.classList.toggle('active', customPinVisibility.has(pin.id));
        btn.classList.toggle('obtained', customPinObtained.has(pin.id));
        const iconUrl = (icons[pin.type] && icons[pin.type].options && icons[pin.type].options.iconUrl)
            ? icons[pin.type].options.iconUrl
            : '../images/map/新規マップピン.png';
        const name = pin.name && pin.name.trim().length > 0 ? pin.name : '無題';
        btn.innerHTML = `
            <div class="icon-wrap">
                <img src="${iconUrl}" alt="">
                <span class="custom-pin-obtained">✓</span>
            </div>
            <span>${name}</span>
        `;
        btn.addEventListener('click', () => {
            if (customPinVisibility.has(pin.id)) {
                customPinVisibility.delete(pin.id);
            } else {
                customPinVisibility.add(pin.id);
            }
            btn.classList.toggle('active', customPinVisibility.has(pin.id));
            applyCustomPinVisibility();
            updateSectionMasterToggles();
        });
        list.appendChild(btn);
    });
}

function toggleCustomPinSidebar(forceOpen = null) {
    const sidebar = document.getElementById('custom-pin-sidebar');
    if (!sidebar) return;
    const settingsPopover = document.getElementById('settings-popover');
    const settingsBtn = document.getElementById('toggle-settings-btn');
    const mobilePlaceLayer = document.getElementById('mobile-pin-place-layer');
    const isHidden = sidebar.classList.contains('hidden');
    const willOpen = forceOpen === null ? isHidden : forceOpen;
    const isMobile = window.innerWidth <= 900;

    const openMobilePlacementLayer = () => {
        if (!mobilePlaceLayer) return;
        mobilePlaceLayer.classList.remove('hidden');
        mobileCustomPinPlacementMode = true;
        customPinMode = true;
    };

    const closeMobilePlacementLayer = () => {
        if (!mobilePlaceLayer) return;
        mobilePlaceLayer.classList.add('hidden');
        mobileCustomPinPlacementMode = false;
    };

    if (willOpen) {
        // スマホはまず座標位置を選択してから詳細入力へ
        if (isMobile && !customPinDraft) {
            openMobilePlacementLayer();
            return;
        }
        // 他の右サイドバーを閉じる
        togglePinBulkSidebar(false);
        if (settingsPopover) settingsPopover.classList.add('hidden');
        if (settingsBtn) settingsBtn.classList.remove('active');
        sidebar.classList.remove('hidden');
        requestAnimationFrame(() => sidebar.classList.add('active'));
        if (isMobile) {
            customPinMode = false;
            mobileCustomPinPlacementMode = false;
            const mapEl = document.getElementById('map');
            if (mapEl) mapEl.style.cursor = '';
            setCustomPinIconSelection(customPinSelectedType);
        } else {
            enterCustomPinMode();
        }
    } else {
        sidebar.classList.remove('active');
        exitCustomPinMode();
        closeMobilePlacementLayer();
        setTimeout(() => {
            sidebar.classList.add('hidden');
        }, 250);
    }
}

function enterCustomPinMode() {
    customPinMode = true;
    mobileCustomPinPlacementMode = false;
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.cursor = 'crosshair';
    setCustomPinIconSelection(customPinSelectedType);
}

function exitCustomPinMode() {
    customPinMode = false;
    mobileCustomPinPlacementMode = false;
    customPinDraft = null;
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.cursor = '';
    if (customPinDraftMarker) {
        customPinDraftMarker.remove();
        customPinDraftMarker = null;
    }
    const nameInput = document.getElementById('custom-pin-name');
    if (nameInput) nameInput.value = '';
    const detailInput = document.getElementById('custom-pin-detail');
    if (detailInput) detailInput.value = '';
    const detailCount = document.getElementById('custom-pin-detail-count');
    if (detailCount) detailCount.innerText = '0';
    updateCustomPinCoords(null);
}

function updateCustomPinCoords(latlng) {
    const latEl = document.getElementById('custom-pin-lat');
    const lngEl = document.getElementById('custom-pin-lng');
    if (!latEl || !lngEl) return;
    if (!latlng) {
        latEl.innerText = '-';
        lngEl.innerText = '-';
        return;
    }
    latEl.innerText = latlng.lat.toFixed(2);
    lngEl.innerText = latlng.lng.toFixed(2);
}

function setCustomPinDraft(latlng) {
    customPinDraft = { lat: latlng.lat, lng: latlng.lng };
    updateCustomPinCoords(customPinDraft);
    if (customPinDraftMarker) {
        customPinDraftMarker.setLatLng([customPinDraft.lat, customPinDraft.lng]);
    } else {
        customPinDraftMarker = L.marker([customPinDraft.lat, customPinDraft.lng], {
            icon: getCustomPinIcon(customPinSelectedType),
            opacity: 0.7
        }).addTo(map);
    }
}

function setCustomPinIconSelection(type) {
    customPinSelectedType = type;
    document.querySelectorAll('.custom-pin-icon-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.iconType === type);
    });
    if (customPinDraftMarker) {
        customPinDraftMarker.setIcon(getCustomPinIcon(type));
    }
}

function getCustomPinIcon(type) {
    if (type === 'cave') {
        return L.icon({ iconUrl: '../images/map/洞窟.png', iconSize: [34, 34], iconAnchor: [17, 20], popupAnchor: [0, -12] });
    }
    return icons[type] || customPinIcon;
}


function applyFilter() {
    let visibleCount = 0;
    const visibleTypes = new Set();
    markers.forEach(({ marker, item }) => {
        let isVisible = false;

        if (focusedRoutePins) {
            const mapOk = item.map === mapOverlayMode;
            isVisible = focusedRoutePins.has(item.id) && mapOk;
        } else {
            const typeOk = item.source === 'dlc' ? activeDlcTypes.has(item.type) : activeTypes.has(item.type);
            const areaOk = activeAreas.size === 0 ||
                activeAreas.has(item.area) ||
                (item.type === 'cave' && item.area === '洞窟') ||
                (item.type === 'floodgate' && item.area === '水門');
            const sourceOk = activeSources.size === 0 || activeSources.has(item.source);
            const mapOk = item.map === mapOverlayMode;
            const obtainedOk = showObtained || !obtainedPins.has(item.id);
            isVisible = typeOk && areaOk && sourceOk && mapOk && obtainedOk;
        }

        if (isVisible) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
            visibleCount++;
            visibleTypes.add(item.type);
        } else {
            if (map.hasLayer(marker)) {
                marker.remove();
            }
        }
    });

    // 洞窟当たり判定円の表示制御
    caveCircleLayers.forEach(({ circle, item }) => {
        const typeOk = item.source === 'dlc' ? activeDlcTypes.has(item.type) : activeTypes.has(item.type);
        const areaOk = activeAreas.size === 0 ||
            activeAreas.has(item.area) ||
            (item.type === 'cave' && item.area === '洞窟') ||
            (item.type === 'floodgate' && item.area === '水門');
        const sourceOk = activeSources.size === 0 || activeSources.has(item.source);
        const mapOk = item.map === mapOverlayMode;
        const obtainedOk = showObtained || !obtainedPins.has(item.id);
        const isVisibleCave = typeOk && areaOk && sourceOk && mapOk && obtainedOk;

        if (isVisibleCave) {
            if (!map.hasLayer(circle)) {
                circle.addTo(map);
            }
        } else {
            if (map.hasLayer(circle)) {
                circle.remove();
            }
        }
    });

    // ソースボタン状態を視覚更新
    updateSourceButtonState();
    updateQuickView(visibleTypes);
    updateRouteFilterPanelCounts();
    applyCustomPinVisibility();
}

// 取得済み切り替え
window.toggleObtainedFromPopup = function(id) {
    if (obtainedPins.has(id)) {
        obtainedPins.delete(id);
    } else {
        obtainedPins.add(id);
    }
    saveObtained();
    const target = markers.find(m => m.item.id === id);
    if (target) {
        updateMarkerAppearance(target.marker, id);
        const btn = target.marker.getPopup().getElement().querySelector('.obtained-toggle');
        if (btn) {
            btn.classList.toggle('active');
            btn.innerText = obtainedPins.has(id) ? '✓ 取得済み' : '取得済みにする';
        }
    }
    applyFilter();
    updateAreaProgress();
    updatePinCounts();
};

function saveObtained() {
    localStorage.setItem('maneater_obtained_pins', JSON.stringify([...obtainedPins]));
}

window.startBatchFromPopup = function() {
    map.closePopup();
    setBatchMode(true);
};

function setBatchMode(active) {
    batchMode = active;
    if (active) {
        batchObtainedPins = new Set(obtainedPins);
        batchCustomObtained = new Set(customPinObtained);
    } else {
        batchObtainedPins.clear();
        batchCustomObtained.clear();
    }
    
    document.getElementById('batch-controls').classList.toggle('hidden', !active);
    document.getElementById('map-sidebar').classList.toggle('hidden', active);
    document.querySelector('.map-actions').classList.toggle('hidden', active);
    
    markers.forEach(({ marker }) => {
        if (active) {
            if (marker.getPopup()) {
                marker._tempPopup = marker.getPopup();
                marker.unbindPopup();
            }
        } else {
            if (marker._tempPopup) {
                marker.bindPopup(marker._tempPopup, { autoPan: false });
            }
        }
    });

    customPinMarkers.forEach(marker => {
        if (active) {
            if (marker.getPopup()) {
                marker._tempPopup = marker.getPopup();
                marker.unbindPopup();
            }
        } else {
            if (marker._tempPopup) {
                marker.bindPopup(marker._tempPopup, { autoPan: false });
            }
        }
    });

    updateBatchCount();
    markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
    customPins.forEach(pin => updateCustomPinObtainedAppearance(pin.id));
}

function toggleBatchSelection(id, marker) {
    if (batchObtainedPins.has(id)) {
        batchObtainedPins.delete(id);
    } else {
        batchObtainedPins.add(id);
    }
    updateMarkerAppearance(marker, id);
    updateBatchCount();
}

function updateBatchCount() {
    let changed = 0;
    batchObtainedPins.forEach(id => {
        if (!obtainedPins.has(id)) changed++;
    });
    obtainedPins.forEach(id => {
        if (!batchObtainedPins.has(id)) changed++;
    });
    batchCustomObtained.forEach(id => {
        if (!customPinObtained.has(id)) changed++;
    });
    customPinObtained.forEach(id => {
        if (!batchCustomObtained.has(id)) changed++;
    });
    document.getElementById('selected-count').innerText = changed;
}

// --- ルートサイドバーの基本操作 ---
function toggleRouteSidebar(show = null, showMainOnClose = true) {
    const mainSidebar = document.getElementById('map-sidebar');
    const routeSidebar = document.getElementById('route-sidebar');
    const areaOverlay = document.getElementById('area-overlay');

    if (show === null) {
        show = (currentSidebar !== 'route');
    }

    if (show) {
        currentSidebar = 'route';
        lastSidebar = 'route';
        const leftToggleBtn = document.getElementById('toggle-left-sidebar-btn');
        if (leftToggleBtn) leftToggleBtn.classList.add('hidden');
        const closeLeftBtn = document.getElementById('close-left-sidebar-btn');
        if (closeLeftBtn) closeLeftBtn.classList.remove('hidden');
        mainSidebar.classList.add('hidden');
        routeSidebar.classList.remove('hidden');
        areaOverlay.classList.add('hidden'); // エリア選択が出ていれば隠す
        currentRouteView = 'browse';
        currentDetailedRoute = null;
        renderRouteList();
    } else {
        if (showMainOnClose) {
            currentSidebar = 'main';
            lastSidebar = 'main';
            mainSidebar.classList.remove('hidden');
            const leftToggleBtn = document.getElementById('toggle-left-sidebar-btn');
            if (leftToggleBtn) leftToggleBtn.classList.add('hidden');
            const closeLeftBtn = document.getElementById('close-left-sidebar-btn');
            if (closeLeftBtn) closeLeftBtn.classList.remove('hidden');
        } else {
            currentSidebar = 'none';
            mainSidebar.classList.add('hidden');
            const leftToggleBtn = document.getElementById('toggle-left-sidebar-btn');
            if (leftToggleBtn) leftToggleBtn.classList.remove('hidden');
            const closeLeftBtn = document.getElementById('close-left-sidebar-btn');
            if (closeLeftBtn) closeLeftBtn.classList.add('hidden');
        }
        routeSidebar.classList.add('hidden');
        exitCreateMode(); // 作成中なら抜ける
        backToBrowse(); // 詳細表示リセット（指摘のバグ修正）
    }
}

function switchRouteTab(tab) {
    activeRouteTab = tab;
    document.querySelectorAll('.route-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    renderRouteList();
}

function renderRouteList() {
    const list = document.getElementById('route-list');
    const searchVal = document.getElementById('route-search-input').value.toLowerCase();
    const data = (activeRouteTab === 'trend') ? trendRoutes : myRoutes;
    
    list.innerHTML = '';
    const filtered = data.filter(r => r.name.toLowerCase().includes(searchVal));

    filtered.sort((a, b) => {
        const pinA = pinnedRoutes.has(a.id) ? 1 : 0;
        const pinB = pinnedRoutes.has(b.id) ? 1 : 0;
        return pinB - pinA;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-msg">ルートが見つかりません</div>';
        return;
    }

    filtered.forEach(r => {
        const totalPins = r.sections.reduce((sum, s) => sum + s.pins.length, 0);
        const card = document.createElement('div');
        card.className = 'route-card';
        card.innerHTML = `
            <div class="route-thumb">
                <img src="../images/map/手配.png" alt="">
            </div>
            <div class="route-info">
                <div class="route-title">${r.name}</div>
                <div class="route-meta">
                    <span><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>${totalPins}</span>
                    <span>${r.description || ''}</span>
                </div>
            </div>
            <div class="route-actions-wrap" style="position: absolute; top: 5px; right: 5px; display: flex; gap: 5px; z-index: 10;">
                <button class="route-pin-btn ${pinnedRoutes.has(r.id) ? 'pinned' : ''}" onclick="event.stopPropagation(); window.togglePinRoute('${r.id}')" title="固定">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>
                </button>
                ${activeRouteTab === 'my' ? `
                    <button class="route-delete-btn" onclick="event.stopPropagation(); deleteMyRoute('${r.id}')" title="削除">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                    </button>
                ` : ''}
            </div>
        `;
        card.onclick = () => showRouteDetail(r);
        list.appendChild(card);
    });
}

window.togglePinRoute = function(id) {
    if (pinnedRoutes.has(id)) {
        pinnedRoutes.delete(id);
    } else {
        pinnedRoutes.add(id);
    }
    localStorage.setItem('maneater_pinned_routes', JSON.stringify([...pinnedRoutes]));
    renderRouteList();
};

function deleteMyRoute(id) {
    if (!confirm('このルートを削除しますか？')) return;
    myRoutes = myRoutes.filter(r => r.id !== id);
    localStorage.setItem('myRoutes', JSON.stringify(myRoutes));
    renderRouteList();
}

function renderRouteOnMap(route, highlightIndex = -1, disableAutoZoom = false) {
    if (!route || !route.sections) return;
    console.log("[renderRoute] Start rendering. Sections:", route.sections.length);
    clearRouteVisuals();
    
    for (let i = 0; i < route.sections.length; i++) {
        if (highlightIndex !== -1 && highlightIndex !== i) continue;

        const section = route.sections[i];
        const sectionMapMode = getSectionMapMode(section);
        if (sectionMapMode && sectionMapMode !== mapOverlayMode) {
            continue;
        }
        const color = getSectionColor(i);
        const pts = [];

        if (section.pins && Array.isArray(section.pins)) {
            section.pins.forEach(pid => {
                const meta = getRoutePinMeta(pid);
                if (meta && meta.latlng) {
                    const latlng = meta.latlng;
                    if (pts.length === 0 || !pts[pts.length - 1].equals(latlng)) {
                        pts.push(latlng);
                    }
                }
            });
        }

        console.log("[renderRoute] Section", i, ": Points=", pts.length);

        if (pts.length >= 2) {
            try {
                const poly = L.polyline(pts, { color: color, weight: 4, opacity: 0.8 }).addTo(map);
                routePolylines.push(poly);

                if (L.polylineDecorator && L.Symbol && typeof L.Symbol.arrowHead === 'function') {
                    const decorator = L.polylineDecorator(poly, {
                        patterns: [
                            { offset: '30%', repeat: '120px', symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: true, pathOptions: { color: color, fillColor: color, weight: 1, opacity: 1, fillOpacity: 1 } }) }
                        ]
                    }).addTo(map);
                    routeDecorators.push(decorator);
                } else {
                    console.warn('[renderRoute] polyline decorator is not available. experienced arrow display is disabled.');
                }
            } catch (err) {
                console.error("[renderRoute] Error drawing section", i, err);
            }
        }
    }

    if (routePolylines.length > 0 && !disableAutoZoom) {
        const group = new L.featureGroup(routePolylines);
        map.fitBounds(group.getBounds().pad(0.2), getRouteZoomOptions());
    }
}

function getSectionMapMode(section) {
    if (!section || !section.pins || !Array.isArray(section.pins)) return mapOverlayMode;
    for (const pid of section.pins) {
        const meta = getRoutePinMeta(pid);
        if (meta && meta.map) return meta.map;
    }
    return 'base';
}

// --- ルート表示ロジック ---
function showRoutePreview(route) {
    if (!route || !route.sections) {
        console.error("[Preview] Invalid route data:", route);
        return;
    }
    console.log(`[Preview] Start rendering route. Sections: ${route.sections.length}`);
    clearRouteVisuals();

    for (let i = 0; i < route.sections.length; i++) {
        const section = route.sections[i];
        const sectionMapMode = getSectionMapMode(section);
        if (sectionMapMode && sectionMapMode !== mapOverlayMode) {
            continue;
        }
        const sectionPoints = [];
        const color = getSectionColor(i);
        
        if (section.pins && Array.isArray(section.pins)) {
            section.pins.forEach(pinId => {
                const meta = getRoutePinMeta(pinId);
                if (meta && meta.latlng) {
                    const latlng = meta.latlng;
                    // 連続する同一座標を排除（矢印描画ライブラリのエラー防止）
                    if (sectionPoints.length === 0 || !sectionPoints[sectionPoints.length - 1].equals(latlng)) {
                        sectionPoints.push(latlng);
                    }
                }
            });
        }

        console.log(`[Preview] Section ${i} (${section.name}): Points=${sectionPoints.length}, Color=${color}, PinsCount=${section.pins ? section.pins.length : 0}`);

        if (sectionPoints.length >= 2) {
            try {
                const polyline = L.polyline(sectionPoints, { color: color, weight: 4, opacity: 0.8 }).addTo(map);
                routePolylines.push(polyline);
                
                // 矢印（デコレータ）の追加
                if (L.polylineDecorator && L.Symbol && typeof L.Symbol.arrowHead === 'function') {
                    const decorator = L.polylineDecorator(polyline, {
                        patterns: [
                            { offset: '30%', repeat: '120px', symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: true, pathOptions: { color: color, fillColor: color, weight: 1, opacity: 1, fillOpacity: 1 } }) }
                        ]
                    }).addTo(map);
                    routeDecorators.push(decorator);
                } else {
                    console.warn('[Preview] polyline decorator is not available. arrow display suppressed.');
                }
            } catch (err) {
                console.error(`[Preview] CRITICAL ERROR drawing section ${i}:`, err);
            }
        } else {
            console.log(`[Preview] Section ${i} skipped: not enough points to draw a line.`);
        }
    }
}

function clearRouteVisuals() {
    routePolylines.forEach(p => p.remove());
    routePreviewMarkers.forEach(m => m.remove());
    routeDecorators.forEach(d => d.remove());
    routePinHighlights.forEach(c => c.remove());
    routePolylines = [];
    routePreviewMarkers = [];
    routeDecorators = [];
    routePinHighlights = [];
}

function showRoutePinHighlights(pinIds) {
    routePinHighlights.forEach(c => c.remove());
    routePinHighlights = [];
    if (!pinIds || pinIds.length === 0) return;

    pinIds.forEach(pid => {
        const meta = getRoutePinMeta(pid);
        if (!meta) return;
        if (meta.map !== mapOverlayMode) return;
        const circle = L.circleMarker(meta.latlng, {
            radius: 14,
            color: '#ffd37a',
            weight: 2,
            fillColor: 'rgba(255, 211, 122, 0.15)',
            fillOpacity: 0.4,
            interactive: false
        }).addTo(map);
        routePinHighlights.push(circle);
    });
}

// --- ルート作成モード ---
function showRouteDetail(route) {
    currentRouteView = 'detail';
    currentDetailedRoute = route;

    // ルート閲覧中はエリア制限を解除して正しく表示
    activeAreas.clear();
    const nameEl = document.getElementById('current-area-name');
    const mobileNameEl = document.getElementById('mobile-current-area');
    if (nameEl) nameEl.innerText = '全エリアを表示';
    if (mobileNameEl) mobileNameEl.innerText = '全エリアを表示';
    document.querySelectorAll('.area-card').forEach(card => card.classList.toggle('active', card.dataset.area === 'all'));
    applyFilter();
    activeSources = new Set(['base', 'dlc']);
    updateSourceButtonState();
    applyFilter();
    updateRouteFilterPanelCounts();

    document.getElementById('route-browse-view').classList.add('hidden');
    document.getElementById('route-detail-view').classList.remove('hidden');
    document.getElementById('route-browse-header').classList.add('hidden');
    document.getElementById('route-detail-header').classList.remove('hidden');
    document.getElementById('browse-footer').classList.add('hidden');
    const mapActions = document.querySelector('.map-actions');
    if (mapActions) mapActions.classList.add('hidden');
    const routeSidebarEl = document.getElementById('route-sidebar');
    if (routeSidebarEl) routeSidebarEl.classList.toggle('mobile-detail-mode', window.innerWidth <= 900);
    
    // マイルートの場合のみ編集ボタンを表示
    const editBtn = document.getElementById('edit-route-btn');
    if (editBtn) {
        editBtn.classList.toggle('hidden', activeRouteTab !== 'my');
    }
    
    document.getElementById('detail-route-name').innerText = route.name;
    document.getElementById('detail-desc').innerText = route.description || '紹介文はありません';
    document.getElementById('detail-section-count').innerText = `このルートには ${route.sections.length} 個の区間が含まれています`;

    const list = document.getElementById('detail-sections-list');
    list.innerHTML = '';

    const allRoutePins = new Set();
    route.sections.forEach(s => s.pins.forEach(pid => allRoutePins.add(pid)));
    const allPinIds = [...allRoutePins];
    focusedRoutePins = allRoutePins;
    applyFilter();
    updateRouteFilterPanelCounts();

    const summaryCounts = {};
    allPinIds.forEach(pid => {
        const meta = getRoutePinMeta(pid);
        if (!meta || !meta.type) return;
        summaryCounts[meta.type] = (summaryCounts[meta.type] || 0) + 1;
    });
    const summaryItems = document.getElementById('detail-summary-items');
    if (summaryItems) {
        const summaryHtml = Object.entries(summaryCounts).map(([type, count]) => {
            const iconUrl = (icons[type] && icons[type].options && icons[type].options.iconUrl)
                ? icons[type].options.iconUrl
                : '../images/map/新規マップピン.png';
            return `<span class="detail-summary-item"><img src="${iconUrl}" alt=""><strong>x${count}</strong></span>`;
        }).join('');
        summaryItems.innerHTML = summaryHtml || '<span class="detail-summary-empty">ピンなし</span>';
    }

    route.sections.forEach((section, idx) => {
        const card = document.createElement('div');
        card.className = 'detail-section-card';
        
        // ピンの種類別にカウント
        const counts = {};
        section.pins.forEach(pid => {
            const data = markers.find(m => m.item.id === pid);
            if (data) counts[data.item.type] = (counts[data.item.type] || 0) + 1;
        });

        let itemsHtml = Object.entries(counts).map(([type, count]) => {
            const iconUrl = (icons[type] && icons[type].options && icons[type].options.iconUrl) ? icons[type].options.iconUrl : '../images/map/洞窟.png';
            return `<div class="detail-item-count"><img src="${iconUrl}"> <span>x${count}</span></div>`;
        }).join('');

        card.innerHTML = `
            <div class="detail-section-head">
                <span class="detail-dot" style="background:${getSectionColor(idx)}"></span>
                <span class="detail-name">${section.name}</span>
                <div class="batch-dropdown">
                    <button class="batch-link">一括表記 ▾</button>
                    <div class="batch-dropdown-content hidden">
                        <button class="batch-action-item" onclick="event.stopPropagation(); batchMarkSection(${JSON.stringify(section.pins).replace(/"/g, "'")}, true)">すべてを表記</button>
                        <button class="batch-action-item" onclick="event.stopPropagation(); batchMarkSection(${JSON.stringify(section.pins).replace(/"/g, "'")}, false)">すべての表記を取り消す</button>
                    </div>
                </div>
            </div>
            <div class="detail-section-body">
                ${itemsHtml || '<span style="color:#666; font-size:0.8rem;">ピンがありません</span>'}
            </div>
        `;

        card.onclick = (e) => {
            if (e.target.closest('.batch-dropdown')) return;
            
            const wasActive = card.classList.contains('active-highlight');
            document.querySelectorAll('.detail-section-card').forEach(c => {
                c.classList.remove('active-highlight');
                c.style.backgroundColor = ''; // CSSがない場合のフォールバック用リセット
            });

            // ルート内の全ピンのみ表示
            focusedRoutePins = allRoutePins;
            applyFilter();
            
            if (wasActive) {
                // Toggled off: 全ての線を表示し、ズームはそのまま
                renderRouteOnMap(route, -1, true);
                showRoutePinHighlights([]);
            } else {
                // Toggled on: 選択区間の線だけを表示
                card.classList.add('active-highlight');
                card.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // 簡易ハイライト
                const targetMode = getSectionMapMode(section);
                if (targetMode && targetMode !== mapOverlayMode) {
                    setMapOverlay(targetMode);
                }
                renderRouteOnMap(route, idx, true);
                showRoutePinHighlights(section.pins);

                // 該当区間へズーム
                const latlngs = [];
                section.pins.forEach(pid => {
                    const meta = getRoutePinMeta(pid);
                    if (meta && meta.latlng) latlngs.push(meta.latlng);
                });
                if (latlngs.length > 0) {
                    const bounds = L.latLngBounds(latlngs);
                    map.fitBounds(bounds.pad(0.2), getRouteZoomOptions());
                }
            }
        };

        // ドロップダウンの切り替え
        const dropdownBtn = card.querySelector('.batch-link');
        const dropdownContent = card.querySelector('.batch-dropdown-content');
        dropdownBtn.onclick = (e) => {
            e.stopPropagation();
            // 他の開いているドロップダウンを閉じる
            document.querySelectorAll('.batch-dropdown-content').forEach(el => {
                if (el !== dropdownContent) el.classList.add('hidden');
            });
            dropdownContent.classList.toggle('hidden');
        };

        list.appendChild(card);
    });

    // 画面外クリックでドロップダウンを閉じる
    const closeDropdowns = (e) => {
        if (!e.target.closest('.batch-dropdown')) {
            document.querySelectorAll('.batch-dropdown-content').forEach(el => el.classList.add('hidden'));
            document.removeEventListener('click', closeDropdowns);
        }
    };
    document.addEventListener('click', closeDropdowns, { once: true });

    // ビジュアル表示（ライン描画）
    renderRouteOnMap(route);
    showRoutePinHighlights([]);
}

function batchMarkSection(pinIds, status) {
    pinIds.forEach(id => {
        if (status) obtainedPins.add(id);
        else obtainedPins.delete(id);
    });
    saveObtained();
    // 全体を再描画せず、外観のみ更新
    markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
    applyFilter();
    updateAreaProgress();
    updatePinCounts();
}

function backToBrowse() {
    currentRouteView = 'browse';
    currentDetailedRoute = null;
    focusedRoutePins = null; // フォーカス解除
    applyFilter();
    const routeSidebarEl = document.getElementById('route-sidebar');
    if (routeSidebarEl) routeSidebarEl.classList.remove('mobile-detail-mode');
    
    document.getElementById('route-browse-view').classList.remove('hidden');
    document.getElementById('route-detail-view').classList.add('hidden');
    document.getElementById('route-browse-header').classList.remove('hidden');
    document.getElementById('route-detail-header').classList.add('hidden');
    document.getElementById('browse-footer').classList.remove('hidden');
    clearRouteVisuals();
}

function getSectionColor(idx) {
    const colors = ['#ffd37a', '#7affd3', '#d37aff', '#ff7ab4', '#b4ff7a'];
    return colors[idx % colors.length];
}

function isMobileUi() {
    return window.innerWidth <= 900;
}

function getRouteZoomOptions() {
    if (!isMobileUi()) {
        return {
            paddingTopLeft: [320, 0],
            paddingBottomRight: [50, 50],
            animate: true,
            duration: 0.8
        };
    }

    const routeSidebarEl = document.getElementById('route-sidebar');
    const sheetHeight = routeSidebarEl && !routeSidebarEl.classList.contains('hidden')
        ? routeSidebarEl.offsetHeight
        : 0;
    const bottomPad = Math.max(60, Math.min(380, sheetHeight + 20));

    return {
        paddingTopLeft: [16, 12],
        paddingBottomRight: [16, bottomPad],
        animate: true,
        duration: 0.8
    };
}

function enterCreateMode() {
    if (isMobileUi()) {
        alert('スマホ版ではルート作成・編集は現在準備中です。');
        return;
    }
    currentRouteView = 'create';
    const routeSidebarEl = document.getElementById('route-sidebar');
    if (routeSidebarEl) routeSidebarEl.classList.remove('mobile-detail-mode');
    document.getElementById('route-browse-view').classList.add('hidden');
    document.getElementById('route-create-view').classList.remove('hidden');
    document.getElementById('route-browse-header').classList.add('hidden');
    document.getElementById('route-create-header').classList.remove('hidden');
    document.getElementById('browse-footer').classList.add('hidden');
    document.getElementById('creation-footer').classList.remove('hidden');
    setRouteCreateActionsVisible(true);
    const mapActions = document.querySelector('.map-actions');
    if (mapActions) mapActions.classList.add('hidden');

    // ルート作成中はソース制限も解除
    activeSources = new Set(['base', 'dlc']);
    updateSourceButtonState();

    savedActiveTypes = new Set(activeTypes);
    savedActiveDlcTypes = new Set(activeDlcTypes);
    activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'manhunt', 'grate', 'floodgate', 'cave']);
    activeDlcTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'time-trial', 'manhunt', 'quest', 'grate', 'floodgate', 'cave']);
    showCustomPins = true;
    customPinVisibility = new Set(customPins.map(p => p.id));

    // ルート作成中はエリア制限を解除して全ピン表示
    activeAreas.clear();
    const nameEl = document.getElementById('current-area-name');
    const mobileNameEl = document.getElementById('mobile-current-area');
    if (nameEl) nameEl.innerText = '全エリアを表示';
    if (mobileNameEl) mobileNameEl.innerText = '全エリアを表示';
    document.querySelectorAll('.area-card').forEach(card => card.classList.toggle('active', card.dataset.area === 'all'));

    syncFilterButtons();
    applyFilter();
    
    document.getElementById('route-name-input').value = '';
    
    // 初期化（新規作成時は区間を折りたたみ状態でスタート）
    creatingRoute = {
        id: null,
        name: '',
        description: '',
        sections: [{ name: '区間1', pins: [], collapsed: true }]
    };
    activeSectionIndex = 0;
    routeIsModified = false;
    updateCreationUI();

    clearRouteVisuals();

    // マーカーのクリック挙動を作成用に変更
    markers.forEach(({ marker }) => {
        if (marker.getPopup()) {
            marker._tempPopup = marker.getPopup();
            marker.unbindPopup();
        }
    });

    customPinMarkers.forEach(marker => {
        if (marker.getPopup()) {
            marker._tempPopup = marker.getPopup();
            marker.unbindPopup();
        }
    });

    map.closePopup();
}

function startEditingRoute() {
    if (isMobileUi()) {
        alert('スマホ版ではルート作成・編集は現在準備中です。');
        return;
    }
    if (!currentDetailedRoute) return;

    focusedRoutePins = null;
    applyFilter();

    creatingRoute = {
        id: currentDetailedRoute.id,
        name: currentDetailedRoute.name,
        description: currentDetailedRoute.description || '',
        sections: JSON.parse(JSON.stringify(currentDetailedRoute.sections)),
        customPins: JSON.parse(JSON.stringify(currentDetailedRoute.customPins || []))
    };

    // 編集モード開始時も全て折りたたみ状態にする（直前の状態維持ではなく固定挙動）
    creatingRoute.sections.forEach(section => section.collapsed = true);

    activeSectionIndex = 0;

    currentRouteView = 'create';
    const routeSidebarEl = document.getElementById('route-sidebar');
    if (routeSidebarEl) routeSidebarEl.classList.remove('mobile-detail-mode');
    document.getElementById('route-detail-view').classList.add('hidden');
    document.getElementById('route-detail-header').classList.add('hidden');
    document.getElementById('route-create-view').classList.remove('hidden');
    document.getElementById('route-create-header').classList.remove('hidden');
    document.getElementById('creation-footer').classList.remove('hidden');
    setRouteCreateActionsVisible(true);

    savedActiveTypes = new Set(activeTypes);
    savedActiveDlcTypes = new Set(activeDlcTypes);
    activeTypes = new Set(activeTypes);
    activeDlcTypes = new Set(activeDlcTypes);
    syncFilterButtons();
    applyFilter();

    updateCreationUI();
    updateCreationVisuals();

    markers.forEach(({ marker }) => {
        if (marker.getPopup()) {
            marker._tempPopup = marker.getPopup();
            marker.unbindPopup();
        }
    });
}

function exitCreateMode() {
    currentRouteView = 'browse';
    const routeSidebarEl = document.getElementById('route-sidebar');
    if (routeSidebarEl) routeSidebarEl.classList.remove('mobile-detail-mode');
    focusedRoutePins = null;
    if (savedActiveTypes) {
        activeTypes = new Set(savedActiveTypes);
        savedActiveTypes = null;
    }
    if (savedActiveDlcTypes) {
        activeDlcTypes = new Set(savedActiveDlcTypes);
        savedActiveDlcTypes = null;
    }
    syncFilterButtons();
    setRouteCreateActionsVisible(false);
    applyFilter();
    
    document.getElementById('route-browse-view').classList.remove('hidden');
    document.getElementById('route-create-view').classList.add('hidden');
    document.getElementById('route-browse-header').classList.remove('hidden');
    document.getElementById('route-create-header').classList.add('hidden');
    document.getElementById('browse-footer').classList.remove('hidden');
    document.getElementById('creation-footer').classList.add('hidden');
    const mapActions = document.querySelector('.map-actions');
    if (mapActions) mapActions.classList.remove('hidden');
    clearRouteVisuals();

    // マーカーのクリック挙動を戻す
    markers.forEach(({ marker }) => {
        if (marker._tempPopup) {
            marker.bindPopup(marker._tempPopup, { autoPan: false });
        }
    });

    customPinMarkers.forEach(marker => {
        const id = marker.options && marker.options.customId;
        const pin = id ? customPinById.get(id) : null;
        if (!pin) return;
        if (marker._tempPopup) {
            marker.bindPopup(marker._tempPopup, { autoPan: false });
        } else if (!marker.getPopup()) {
            const popup = document.createElement('div');
            popup.className = 'custom-popup';
            popup.innerHTML = `
                <div style="font-weight:bold; margin-bottom:5px;">${pin.name || 'カスタムピン'}</div>
                ${pin.detail ? `<div style="font-size:0.85rem; color:#ddd; margin-bottom:6px;">${pin.detail}</div>` : ''}
                <div class="popup-buttons">
                    <button class="popup-btn obtained-toggle ${customPinObtained.has(pin.id) ? 'active' : ''}" onclick="toggleCustomPinObtained('${pin.id}')">
                        ${customPinObtained.has(pin.id) ? '✓ 取得済み' : '取得済みにする'}
                    </button>
                    <button class="popup-btn" onclick="deleteCustomPin('${pin.id}')">削除</button>
                </div>
            `;
            marker.bindPopup(popup, { autoPan: false });
        }
    });
}

function addSection() {
    let maxNum = 0;
    creatingRoute.sections.forEach(s => {
        const match = s.name.match(/区間(\d+)/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    });
    const nextNum = maxNum + 1;
    creatingRoute.sections.push({ name: `区間${nextNum}`, pins: [] });
    activeSectionIndex = creatingRoute.sections.length - 1;
    routeIsModified = true;
    updateCreationUI();

    updateCreationVisuals();
}

function removeSection(idx) {
    if (creatingRoute.sections.length <= 1) return;

    const sectionName = creatingRoute.sections[idx]?.name || `区間${idx + 1}`;
    const confirmed = confirm(`「${sectionName}」を丸ごと削除しますか？\nこの操作は元に戻せません。`);
    if (!confirmed) return;

    creatingRoute.sections.splice(idx, 1);
    if (activeSectionIndex >= creatingRoute.sections.length) {
        activeSectionIndex = creatingRoute.sections.length - 1;
    }
    routeIsModified = true;
    updateCreationUI();

    updateCreationVisuals();
}

function toggleSectionCollapse(idx) {
    if (creatingRoute.sections[idx]) {
        creatingRoute.sections[idx].collapsed = !creatingRoute.sections[idx].collapsed;
        updateCreationUI();
    }
}

function addPinToRoute(pinId) {
    if (currentRouteView !== 'create') return;
    
    const section = creatingRoute.sections[activeSectionIndex];
    // 同じ区間に連続して同じピンは入れない
    if (section.pins[section.pins.length - 1] === pinId) return;
    
    section.pins.push(pinId);
    routeIsModified = true;
    clearRouteHoverPreview();
    updateCreationUI();

    updateCreationVisuals();
}

function removePinFromRoute(sIdx, pIdx) {
    creatingRoute.sections[sIdx].pins.splice(pIdx, 1);
    routeIsModified = true;
    updateCreationUI();
    updateCreationVisuals();
}

function updateCreationUI() {
    const container = document.getElementById('sections-container');
    const nameInput = document.getElementById('route-name-input');
    const descInput = document.getElementById('route-desc-input');
    const charCount = document.getElementById('current-char-count');
    
    clearRouteHoverPreview();
    if (document.activeElement !== nameInput) {
        nameInput.value = creatingRoute.name;
    }
    if (document.activeElement !== descInput) {
        descInput.value = creatingRoute.description;
    }
    charCount.innerText = creatingRoute.description.length;

    const scrollPos = container.scrollTop; // Preserve scroll position
    container.innerHTML = '';
    creatingRoute.sections.forEach((section, sIdx) => {
        const isActive = sIdx === activeSectionIndex;
        const isCollapsed = section.collapsed || false;
        const card = document.createElement('div');
        card.className = `section-card ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`;
        card.onclick = () => { activeSectionIndex = sIdx; updateCreationUI(); };

        let pinsHtml = '';
        if (section.pins.length === 0) {
            pinsHtml = '<div class="empty-pin-msg">マップからマップピンを選んでください</div>';
        } else {
            section.pins.forEach((pinId, pIdx) => {
                const meta = getRoutePinMeta(pinId);
                const name = meta ? meta.name : '不明なピン';
                const icon = meta ? meta.iconUrl : '';
                
                pinsHtml += `
                    <div class="pin-item">
                        <div class="pin-order">${pIdx + 1}</div>
                        <img src="${icon}" class="pin-icon-sm">
                        <span class="pin-name">${name}</span>
                        <button class="delete-pin-btn" onclick="event.stopPropagation(); removePinFromRoute(${sIdx}, ${pIdx})">×</button>
                    </div>
                `;
            });
        }

        card.innerHTML = `
            <div class="section-header">
                <div class="section-info-row" style="display:flex; align-items:center; gap:8px;">
                    <button class="collapse-btn" onclick="event.stopPropagation(); toggleSectionCollapse(${sIdx})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="transform: rotate(${isCollapsed ? '-90deg' : '0deg'}); transition: transform 0.2s;"><path d="M7 10l5 5 5-5z"/></svg>
                    </button>
                    <div class="section-info">
                        <input type="text" class="section-name-input" value="${section.name}" 
                               onclick="event.stopPropagation()" 
                               oninput="creatingRoute.sections[${sIdx}].name = this.value; updateCreationVisuals();"
                               placeholder="区間名を入力">
                        <span class="section-stats">合計${section.pins.length}個のマップピン</span>
                    </div>
                </div>
                ${creatingRoute.sections.length > 1 ? `<button class="delete-section-btn" onclick="event.stopPropagation(); removeSection(${sIdx})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>` : ''}
            </div>
            <div class="pin-list">
                ${pinsHtml}
            </div>
        `;
        container.appendChild(card);
    });

    const addCard = document.createElement('button');
    addCard.type = 'button';
    addCard.className = 'section-add-card';
    addCard.innerHTML = '<span>＋ 区間を追加</span>';
    addCard.onclick = (e) => {
        e.stopPropagation();
        addSection();
    };
    container.appendChild(addCard);

    container.scrollTop = scrollPos;
}

function updateCreationVisuals() {
    clearRouteVisuals();
    showRoutePreview(creatingRoute);
}

function initTutorial() {
    const overlay = document.getElementById('map-tutorial');
    if (!overlay) return;
    if (localStorage.getItem(tutorialStorageKey)) return;

    const steps = [
        { selector: '.area-switch-btn', text: 'ここを押すとマップを切り替えて、特定のマップのマップピンをフィルターできるぞ!' },
        { selector: '#toggle-settings-btn', text: 'ここを押すと設定を変更できるぞ!' },
        { selector: '#route-mode-btn', text: 'ここを押すとルートモードに切り替わるぞ!' },
        { selector: '.leaflet-control.custom-pin-control .custom-pin-btn', text: 'ここを押すとカスタムピンを追加できるぞ!' }
    ];

    const bubble = overlay.querySelector('.tutorial-bubble');
    const textEl = overlay.querySelector('.tutorial-text');
    const spotlight = overlay.querySelector('.tutorial-spotlight');
    const nextBtn = document.getElementById('tutorial-next-btn');
    const skipBtn = document.getElementById('tutorial-skip-btn');

    function applyStep() {
        const step = steps[tutorialStepIndex];
        const target = document.querySelector(step.selector);
        if (!target) {
            finishTutorial();
            return;
        }
        const mapRect = document.querySelector('.map-container').getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        const offsetTop = rect.top - mapRect.top;
        const offsetLeft = rect.left - mapRect.left;

        spotlight.style.top = `${offsetTop - 6}px`;
        spotlight.style.left = `${offsetLeft - 6}px`;
        spotlight.style.width = `${rect.width + 12}px`;
        spotlight.style.height = `${rect.height + 12}px`;

        const bubbleTop = offsetTop + rect.height + 14;
        const bubbleLeft = Math.min(offsetLeft, mapRect.width - 380);
        bubble.style.top = `${bubbleTop}px`;
        bubble.style.left = `${Math.max(12, bubbleLeft)}px`;

        const actions = overlay.querySelector('.tutorial-actions');
        actions.style.top = `${bubbleTop + bubble.offsetHeight + 8}px`;
        actions.style.left = `${Math.max(12, bubbleLeft)}px`;


        textEl.innerText = step.text && step.text.trim().length > 0
            ? step.text
            : 'ここを押すとマップを切り替えて、特定のマップのマップピンをフィルターできるぞ!';

        nextBtn.innerText = tutorialStepIndex === steps.length - 1 ? '完了' : '次へ';
    }

    function finishTutorial() {
        overlay.classList.add('hidden');
        overlay.classList.remove('active');
        localStorage.setItem(tutorialStorageKey, '1');
    }

    nextBtn.addEventListener('click', () => {
        tutorialStepIndex += 1;
        if (tutorialStepIndex >= steps.length) {
            finishTutorial();
        } else {
            applyStep();
        }
    });
    skipBtn.addEventListener('click', finishTutorial);

    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    applyStep();
}


function saveMyRoute() {
    const name = document.getElementById('route-name-input').value.trim();
    const desc = document.getElementById('route-desc-input').value.trim();
    
    if (!name) {
        alert('ルート名を入力してください');
        return;
    }

    const totalPins = creatingRoute.sections.reduce((sum, s) => sum + s.pins.length, 0);
    if (totalPins < 1) {
        alert('ピンを少なくとも1つ追加してください');
        return;
    }

    const customPinsById = new Map(customPins.map(pin => [pin.id, pin]));
    const usedCustomPinIds = new Set();
    creatingRoute.sections.forEach(section => {
        section.pins.forEach(pinId => {
            if (customPinsById.has(pinId)) {
                usedCustomPinIds.add(pinId);
            }
        });
    });
    const usedCustomPins = [...usedCustomPinIds].map(id => customPinsById.get(id));

    if (creatingRoute.id) {
        // 既存ルートの更新
        const idx = myRoutes.findIndex(r => r.id === creatingRoute.id);
        if (idx !== -1) {
            // 保存前に折り畳まれてるフラグなどを消したクリーンな状態で保存
            const cleanSections = creatingRoute.sections.map(s => {
                const { collapsed, ...rest } = s;
                return rest;
            });
            myRoutes[idx] = {
                id: creatingRoute.id,
                name: name,
                description: desc,
                sections: cleanSections,
                customPins: usedCustomPins
            };
        }
    } else {
        // 新規作成
        const cleanSections = creatingRoute.sections.map(s => {
            const { collapsed, ...rest } = s;
            return rest;
        });
        const newRoute = {
            id: 'my-' + Date.now(),
            name: name,
            description: desc,
            sections: cleanSections,
            customPins: usedCustomPins
        };
        myRoutes.push(newRoute);
    }

    localStorage.setItem('myRoutes', JSON.stringify(myRoutes));
    routeIsModified = false;
    exitCreateMode();

    renderRouteList();
}

function promptUnsavedChanges(onConfirm) {
    if (currentRouteView !== 'create' || !routeIsModified) {
        onConfirm();
        return;
    }
    
    const modal = document.getElementById('route-exit-alert-modal');
    if (!modal) {
        onConfirm();
        return;
    }
    modal.classList.remove('hidden');

    const okBtn = document.getElementById('alert-ok-btn');
    const cancelBtn = document.getElementById('alert-cancel-btn');

    const newOk = okBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newOk.addEventListener('click', () => {
        modal.classList.add('hidden');
        onConfirm();
    });

    newCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

function confirmLeaveIfUnsaved(targetHref) {
    if (currentRouteView !== 'create' || !routeIsModified) {
        window.location.href = targetHref;
        return;
    }
    promptUnsavedChanges(() => {
        window.location.href = targetHref;
    });
}

function setupEventListeners() {
    // --- 既存のフィルター系 ---
    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            if (target.dataset.custom === 'true') {
                showCustomPins = !showCustomPins;
                target.classList.toggle('active', showCustomPins);
                applyCustomPinVisibility();
                return;
            }
            const t = target.dataset.type;
            const source = target.dataset.source;
            if (source === 'dlc') {
                if (activeDlcTypes.has(t)) {
                    activeDlcTypes.delete(t);
                } else {
                    activeDlcTypes.add(t);
                }
            } else {
                if (activeTypes.has(t)) {
                    activeTypes.delete(t);
                } else {
                    activeTypes.add(t);
                }
            }
            syncFilterButtons();
            applyFilter();
        });
    });

    // --- セクション一括トグル ---
    document.querySelectorAll('.section-master-toggle').forEach(master => {
        master.addEventListener('change', () => {
            const section = master.dataset.section;
            if (section === 'custom-pins') {
                showCustomPins = master.checked;
                customPinVisibility = master.checked ? new Set(customPins.map(p => p.id)) : new Set();
                renderCustomPinList();
                applyCustomPinVisibility();
                return;
            }
            const group = document.querySelector(`[data-section-group="${section}"]`);
            if (!group) return;
            const buttons = [...group.querySelectorAll('.filter-type-btn')];
            buttons.forEach(btn => {
                const t = btn.dataset.type;
                const source = btn.dataset.source;
                if (master.checked) {
                    if (source === 'dlc') activeDlcTypes.add(t);
                    else activeTypes.add(t);
                } else {
                    if (source === 'dlc') activeDlcTypes.delete(t);
                    else activeTypes.delete(t);
                }
            });
            syncFilterButtons();
            applyFilter();
            updatePinCounts();
        });
    });

    // --- カスタムピン ---
    const customPinSaveBtn = document.getElementById('custom-pin-save-btn');
    const customPinCancelBtn = document.getElementById('custom-pin-cancel-btn');
    const customPinCloseBtn = document.getElementById('custom-pin-close-btn');
    const mobilePinPlaceOkBtn = document.getElementById('mobile-pin-place-ok');
    const mobilePinPlaceCloseBtn = document.getElementById('mobile-pin-place-close');
    const mobilePinPlaceLayer = document.getElementById('mobile-pin-place-layer');

    if (customPinSaveBtn) {
        customPinSaveBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('custom-pin-name');
            const name = nameInput ? nameInput.value.trim() : '';
            if (!customPinDraft) {
                alert('マップ上をクリックして座標を選んでください。');
                return;
            }
            if (!name) {
                alert('ピン名称を入力してください。');
                return;
            }
            const newPin = {
                id: Date.now().toString(),
                name,
                lat: customPinDraft.lat,
                lng: customPinDraft.lng,
                type: customPinSelectedType,
                map: mapOverlayMode,
                detail: (() => {
                    const detailInput = document.getElementById('custom-pin-detail');
                    return detailInput ? detailInput.value.trim() : '';
                })()
            };
            customPins.push(newPin);
            customPinById.set(newPin.id, newPin);
            customPinVisibility.add(newPin.id);
            saveCustomPins();
            if (customPinDraftMarker) {
                customPinDraftMarker.remove();
                customPinDraftMarker = null;
            }
            addCustomPinMarker(newPin);
            updateCustomPinCount();
            renderCustomPinList();
            toggleCustomPinSidebar(false);
        });
    }

    if (customPinCancelBtn) {
        customPinCancelBtn.addEventListener('click', () => {
            toggleCustomPinSidebar(false);
        });
    }

    if (customPinCloseBtn) {
        customPinCloseBtn.addEventListener('click', () => {
            toggleCustomPinSidebar(false);
        });
    }

    if (mobilePinPlaceOkBtn) {
        mobilePinPlaceOkBtn.addEventListener('click', () => {
            const center = map.getCenter();
            setCustomPinDraft(center);
            mobileCustomPinPlacementMode = false;
            customPinMode = false;
            if (mobilePinPlaceLayer) mobilePinPlaceLayer.classList.add('hidden');
            toggleCustomPinSidebar(true);
        });
    }

    if (mobilePinPlaceCloseBtn) {
        mobilePinPlaceCloseBtn.addEventListener('click', () => {
            mobileCustomPinPlacementMode = false;
            customPinMode = false;
            customPinDraft = null;
            if (mobilePinPlaceLayer) mobilePinPlaceLayer.classList.add('hidden');
        });
    }

    const pinBulkCloseBtn = document.getElementById('pin-bulk-close-btn');
    if (pinBulkCloseBtn) {
        pinBulkCloseBtn.addEventListener('click', () => {
            togglePinBulkSidebar(false);
        });
    }

    document.querySelectorAll('.custom-pin-icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.iconType;
            if (type) setCustomPinIconSelection(type);
        });
    });


    const customPinDetailInput = document.getElementById('custom-pin-detail');
    if (customPinDetailInput) {
        customPinDetailInput.addEventListener('input', () => {
            const count = document.getElementById('custom-pin-detail-count');
            if (count) count.innerText = customPinDetailInput.value.length;
        });
    }

    const areaHeaderBtn = document.getElementById('area-header-btn');
    const areaOverlay = document.getElementById('area-overlay');
    const closeAreaBtn = document.getElementById('close-area-overlay');

    if (areaHeaderBtn) {
        areaHeaderBtn.addEventListener('click', () => {
            updateAreaProgress();
            areaOverlay.classList.remove('hidden');
        });
    }

    if (closeAreaBtn) {
        closeAreaBtn.addEventListener('click', () => {
            areaOverlay.classList.add('hidden');
            if (window.innerWidth <= 900) {
                closeMobileFilterPanel();
            }
        });
    }

    document.querySelectorAll('.area-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const area = btn.dataset.area;
            selectArea(area);
            areaOverlay.classList.add('hidden');
            if (window.innerWidth <= 900) {
                closeMobileFilterPanel();
            }
        });
    });

    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'manhunt', 'grate', 'floodgate', 'cave']);
            activeDlcTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'time-trial', 'manhunt', 'quest', 'grate', 'floodgate', 'cave']);
            showCustomPins = true;
            customPinVisibility = new Set(customPins.map(p => p.id));
            activeSources = new Set(['base', 'dlc']);
            selectArea('all');
            syncFilterButtons();
            applyFilter();
            updateRouteFilterPanelCounts();
            updateSourceButtonState();
        });
    }

    const resetAllPinsBtn = document.getElementById('reset-all-pins-btn');
    if (resetAllPinsBtn) {
        resetAllPinsBtn.addEventListener('click', () => {
            if (confirm('全てのピンを未取得の状態に戻しますか？\nこの操作は取り消せません。')) {
                obtainedPins.clear();
                saveObtained();
                markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
                applyFilter();
                updateAreaProgress();
                updatePinCounts();
                alert('全てのピンをリセットしました。');
            }
        });
    }

    // --- ルートサイドバー操作 ---
    const routeIconBtn = document.getElementById('route-mode-btn');
    if (routeIconBtn) {
        routeIconBtn.addEventListener('click', () => {
            if (currentSidebar === 'route' && currentRouteView === 'create') {
                // ルート作成中にもう一度ボタン押下：マップサイドバー（ピンON/OFF）に戻す
                promptUnsavedChanges(() => toggleRouteSidebar(false, true));
            } else if (currentSidebar === 'route') {
                // ルート閲覧モードから戻る: ルートサイドバー閉じ、メイン表示
                toggleRouteSidebar(false, true);
            } else {
                toggleRouteSidebar(true);
            }
        });
    }

    const closeRouteSidebarBtn = document.getElementById('close-route-sidebar-btn');
    if (closeRouteSidebarBtn) {
        closeRouteSidebarBtn.addEventListener('click', () => {
            promptUnsavedChanges(() => toggleRouteSidebar(false));
        });
    }

    document.querySelectorAll('.route-tab').forEach(btn => {
        btn.addEventListener('click', () => switchRouteTab(btn.dataset.tab));
    });

    const backBtn = document.getElementById('back-to-browse-btn');
    if (backBtn) {
        backBtn.addEventListener('click', backToBrowse);
    }
    
    const backFromCreateBtn = document.getElementById('back-from-create-btn');
    if (backFromCreateBtn) {
        backFromCreateBtn.addEventListener('click', () => {
            promptUnsavedChanges(() => exitCreateMode());
        });
    }

    // --- ルート作成用 右側パネル ---
    const routeFilterBtn = document.getElementById('route-filter-btn');
    const routeAreaBtn = document.getElementById('route-area-btn');
    const routeFilterPanel = document.getElementById('route-filter-panel');
    const routeAreaPanel = document.getElementById('route-area-panel');
    const quickviewToggle = document.getElementById('route-quickview-toggle');
    const quickviewWrap = document.getElementById('route-quickview');
    const quickviewAllBtn = document.getElementById('route-quickview-all');

    if (routeFilterBtn && routeFilterPanel) {
        routeFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = routeFilterPanel.classList.contains('hidden');
            closeRouteCreatePanels();
            if (willOpen) {
                routeFilterPanel.classList.remove('hidden');
                routeFilterPanel.classList.add('active');
                routeFilterBtn.classList.add('active');
                updateRouteFilterPanelCounts();
            }
        });
    }

    if (routeAreaBtn && routeAreaPanel) {
        routeAreaBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = routeAreaPanel.classList.contains('hidden');
            closeRouteCreatePanels();
            if (willOpen) {
                routeAreaPanel.classList.remove('hidden');
                routeAreaPanel.classList.add('active');
                routeAreaBtn.classList.add('active');
            }
        });
    }

    document.querySelectorAll('.route-area-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const area = btn.dataset.area;
            if (area) selectArea(area);
            closeRouteCreatePanels();
        });
    });

    if (quickviewToggle && quickviewWrap) {
        quickviewToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            quickviewWrap.classList.toggle('collapsed');
        });
    }

    if (quickviewAllBtn) {
        quickviewAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'manhunt', 'grate', 'floodgate', 'cave']);
            activeDlcTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'time-trial', 'manhunt', 'quest', 'grate', 'floodgate', 'cave']);
            syncFilterButtons();
            applyFilter();
            updateRouteFilterPanelCounts();
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#route-create-actions')) {
            closeRouteCreatePanels();
        }
    });

    // --- ナビゲーション離脱時の警告 ---
    document.querySelectorAll('.sidebar a[href]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href) return;
            if (currentRouteView === 'create' && routeIsModified) {
                e.preventDefault();
                confirmLeaveIfUnsaved(href);
            }
        });
    });

    const routeSearchInput = document.getElementById('route-search-input');
    if (routeSearchInput) {
        routeSearchInput.addEventListener('input', () => renderRouteList());
    }

    const startCreateBtn = document.getElementById('start-create-route-btn');
    if (startCreateBtn) {
        startCreateBtn.addEventListener('click', () => enterCreateMode());
    }

    const editRouteBtn = document.getElementById('edit-route-btn');
    if (editRouteBtn) {
        editRouteBtn.addEventListener('click', () => startEditingRoute());
    }

    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', () => addSection());
    }

    const saveRouteBtn = document.getElementById('save-route-btn');
    if (saveRouteBtn) {
        saveRouteBtn.addEventListener('click', () => saveMyRoute());
    }

    const routeNameInput = document.getElementById('route-name-input');
    if (routeNameInput) {
        routeNameInput.addEventListener('input', () => {
            creatingRoute.name = routeNameInput.value;
            routeIsModified = true;
        });
    }

    const routeDescInput = document.getElementById('route-desc-input');
    if (routeDescInput) {
        routeDescInput.addEventListener('input', () => {
            creatingRoute.description = routeDescInput.value;
            routeIsModified = true;
            document.getElementById('current-char-count').innerText = routeDescInput.value.length;
        });
    }

    // --- その他設定・一括 ---
    const settingsBtn = document.getElementById('toggle-settings-btn');
    const settingsPopover = document.getElementById('settings-popover');
    const settingsPopoverCloseBtn = document.getElementById('settings-popover-close');
    const showObtainedCheck = document.getElementById('show-obtained-check');
    const showBaseCheck = document.getElementById('show-base-check');
    const showDlcCheck = document.getElementById('show-dlc-check');
    const showBaseOnlyBtn = document.getElementById('show-base-only-btn');
    const showDlcOnlyBtn = document.getElementById('show-dlc-only-btn');
    const showAllSourcesBtn = document.getElementById('show-all-sources-btn');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            settingsPopover.classList.toggle('hidden');
            settingsBtn.classList.toggle('active');
            e.stopPropagation();
        });
    }

    if (settingsPopoverCloseBtn) {
        settingsPopoverCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (settingsPopover) settingsPopover.classList.add('hidden');
            if (settingsBtn) settingsBtn.classList.remove('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (settingsPopover && !settingsPopover.contains(e.target) && e.target !== settingsBtn) {
            settingsPopover.classList.add('hidden');
            if (settingsBtn) settingsBtn.classList.remove('active');
        }
    });

    if (showObtainedCheck) {
        showObtainedCheck.checked = showObtained;
        showObtainedCheck.addEventListener('change', () => {
            showObtained = showObtainedCheck.checked;
            applyFilter();
            updateRouteFilterPanelCounts();
        });
    }

    if (showBaseCheck) {
        showBaseCheck.checked = activeSources.has('base');
        showBaseCheck.addEventListener('change', () => {
            if (showBaseCheck.checked) activeSources.add('base');
            else activeSources.delete('base');
            applyFilter();
            updateSourceButtonState();
            updateRouteFilterPanelCounts();
        });
    }

    if (showDlcCheck) {
        showDlcCheck.checked = activeSources.has('dlc');
        showDlcCheck.addEventListener('change', () => {
            if (showDlcCheck.checked) activeSources.add('dlc');
            else activeSources.delete('dlc');
            applyFilter();
            updateSourceButtonState();
            updateRouteFilterPanelCounts();
        });
    }

    if (showBaseOnlyBtn) {
        showBaseOnlyBtn.addEventListener('click', () => {
            activeSources = new Set(['base']);
            if (showBaseCheck) showBaseCheck.checked = true;
            if (showDlcCheck) showDlcCheck.checked = false;
            applyFilter();
            updateSourceButtonState();
            updateRouteFilterPanelCounts();
        });
    }

    if (showDlcOnlyBtn) {
        showDlcOnlyBtn.addEventListener('click', () => {
            activeSources = new Set(['dlc']);
            if (showBaseCheck) showBaseCheck.checked = false;
            if (showDlcCheck) showDlcCheck.checked = true;
            applyFilter();
            updateSourceButtonState();
            updateRouteFilterPanelCounts();
        });
    }

    if (showAllSourcesBtn) {
        showAllSourcesBtn.addEventListener('click', () => {
            activeSources = new Set(['base', 'dlc']);
            if (showBaseCheck) showBaseCheck.checked = true;
            if (showDlcCheck) showDlcCheck.checked = true;
            applyFilter();
            updateSourceButtonState();
            updateRouteFilterPanelCounts();
        });
    }

    const mapOverlayBaseBtn = document.getElementById('map-overlay-base-btn');
    const mapOverlayDlcBtn = document.getElementById('map-overlay-dlc-btn');
    const routeMapBaseBtn = document.getElementById('route-map-base-btn');
    const routeMapDlcBtn = document.getElementById('route-map-dlc-btn');
    if (mapOverlayBaseBtn) {
        mapOverlayBaseBtn.addEventListener('click', () => {
            activeAreas.clear();
            const nameEl = document.getElementById('current-area-name');
            const mobileNameEl = document.getElementById('mobile-current-area');
            if (nameEl) nameEl.innerText = '全エリアを表示';
            if (mobileNameEl) mobileNameEl.innerText = '全エリアを表示';
            document.querySelectorAll('.area-card').forEach(card => card.classList.toggle('active', card.dataset.area === 'all'));
            setMapOverlay('base');
        });
    }

    const detailUnmarkAllBtn = document.getElementById('detail-unmark-all-btn');
    if (detailUnmarkAllBtn) {
        detailUnmarkAllBtn.addEventListener('click', () => {
            if (!currentDetailedRoute) return;
            const pinIds = [];
            currentDetailedRoute.sections.forEach(section => {
                if (section && Array.isArray(section.pins)) pinIds.push(...section.pins);
            });
            if (pinIds.length === 0) return;
            batchMarkSection(pinIds, false);
        });
    }

    const detailMarkAllBtn = document.getElementById('detail-mark-all-btn');
    if (detailMarkAllBtn) {
        detailMarkAllBtn.addEventListener('click', () => {
            if (!currentDetailedRoute) return;
            const pinIds = [];
            currentDetailedRoute.sections.forEach(section => {
                if (section && Array.isArray(section.pins)) pinIds.push(...section.pins);
            });
            if (pinIds.length === 0) return;
            batchMarkSection(pinIds, true);
        });
    }
    if (mapOverlayDlcBtn) {
        mapOverlayDlcBtn.addEventListener('click', () => {
            activeAreas.clear();
            activeAreas.add('チドリ島');
            const nameEl = document.getElementById('current-area-name');
            const mobileNameEl = document.getElementById('mobile-current-area');
            if (nameEl) nameEl.innerText = 'チドリ島';
            if (mobileNameEl) mobileNameEl.innerText = 'チドリ島';
            document.querySelectorAll('.area-card').forEach(card => card.classList.toggle('active', card.dataset.area === 'チドリ島'));
            setMapOverlay('dlc');
        });
    }
    if (routeMapBaseBtn) {
        routeMapBaseBtn.addEventListener('click', () => {
            setMapOverlay('base');
        });
    }
    if (routeMapDlcBtn) {
        routeMapDlcBtn.addEventListener('click', () => {
            setMapOverlay('dlc');
        });
    }

    // 初期状態の反映
    setMapOverlay(mapOverlayMode);

    const batchCancelBtn = document.getElementById('batch-cancel-btn');
    if (batchCancelBtn) batchCancelBtn.addEventListener('click', () => setBatchMode(false));
    
    const batchOkBtn = document.getElementById('batch-ok-btn');
    if (batchOkBtn) {
        batchOkBtn.addEventListener('click', () => {
            obtainedPins = new Set(batchObtainedPins);
            saveObtained();
            customPinObtained = new Set(batchCustomObtained);
            saveCustomPinObtained();
            setBatchMode(false);
            applyFilter();
            updateAreaProgress();
            updatePinCounts();
            renderCustomPinList();
        });
    }

    const leftToggleBtn = document.getElementById('toggle-left-sidebar-btn');
    const closeLeftBtn = document.getElementById('close-left-sidebar-btn');
    if (leftToggleBtn) {
        leftToggleBtn.addEventListener('click', () => {
            const mainSidebar = document.getElementById('map-sidebar');
            const routeSidebar = document.getElementById('route-sidebar');
            leftToggleBtn.classList.add('hidden');
            if (closeLeftBtn) closeLeftBtn.classList.remove('hidden');
            if (lastSidebar === 'route') {
                currentSidebar = 'route';
                routeSidebar.classList.remove('hidden');
                mainSidebar.classList.add('hidden');
            } else {
                currentSidebar = 'main';
                mainSidebar.classList.remove('hidden');
                routeSidebar.classList.add('hidden');
            }
        });
    }
    if (closeLeftBtn) {
        closeLeftBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const mainSidebar = document.getElementById('map-sidebar');
            const routeSidebar = document.getElementById('route-sidebar');
            if (currentSidebar === 'route') {
                lastSidebar = 'route';
                routeSidebar.classList.add('hidden');
            } else {
                lastSidebar = 'main';
                mainSidebar.classList.add('hidden');
            }
            currentSidebar = 'none';
            if (leftToggleBtn) leftToggleBtn.classList.remove('hidden');
            closeLeftBtn.classList.add('hidden');
        });
    }

    const mobileAreaSwitch = document.getElementById('mobile-area-switch');
    const mobileAreaName = document.getElementById('mobile-current-area');
    const areaHeaderBtn2 = document.getElementById('area-header-btn');
    const mobileFilterOpen = document.getElementById('mobile-filter-open');
    const mobileFilterClose = document.getElementById('mobile-filter-close');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    const openMobileFilterPanel = () => {
        document.body.classList.add('mobile-filter-open');
        if (sidebarBackdrop && document.body.classList.contains('sidebar-collapsed')) {
            sidebarBackdrop.classList.remove('hidden');
        }
    };
    const closeMobileFilterPanel = () => {
        document.body.classList.remove('mobile-filter-open');
        if (sidebarBackdrop && document.body.classList.contains('sidebar-collapsed')) {
            sidebarBackdrop.classList.add('hidden');
        }
    };

    if (mobileAreaSwitch && areaHeaderBtn2) {
        mobileAreaSwitch.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                // スマホでは全画面パネルを開いてからエリア選択オーバーレイを表示
                openMobileFilterPanel();
                if (areaOverlay) {
                    updateAreaProgress();
                    areaOverlay.classList.remove('hidden');
                }
                return;
            }
            areaHeaderBtn2.click();
        });
    }

    if (mobileAreaName) {
        const desktopAreaName = document.getElementById('current-area-name');
        if (desktopAreaName) mobileAreaName.innerText = desktopAreaName.innerText;
    }

    if (mobileFilterOpen) {
        mobileFilterOpen.addEventListener('click', () => {
            if (document.body.classList.contains('mobile-filter-open')) {
                closeMobileFilterPanel();
            } else {
                openMobileFilterPanel();
            }
        });
    }

    if (mobileFilterClose) {
        mobileFilterClose.addEventListener('click', () => {
            closeMobileFilterPanel();
        });
    }

    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', () => {
            closeMobileFilterPanel();
        });
    }

    document.addEventListener('click', (e) => {
        if (!document.body.classList.contains('mobile-filter-open')) return;
        const sidebar = document.getElementById('map-sidebar');
        const clickedMobileAreaBar = !!e.target.closest('#mobile-area-bar');
        const clickedMobileFilterBar = !!e.target.closest('#mobile-filter-bar');
        if (
            sidebar &&
            !sidebar.contains(e.target) &&
            e.target !== mobileFilterOpen &&
            !clickedMobileAreaBar &&
            !clickedMobileFilterBar
        ) {
            closeMobileFilterPanel();
        }
    });

    const mainSidebar = document.querySelector('.sidebar');
    const mainOpenBtn = document.getElementById('main-sidebar-open');
    const mainCloseBtn = document.getElementById('main-sidebar-close');
    const mainCloseInner = document.querySelector('.main-sidebar-close-inner');
    const mainBackdrop = document.getElementById('sidebar-backdrop');
    const applySidebarMode = () => {
        if (window.innerWidth <= 900) {
            document.body.classList.add('sidebar-collapsed');
            if (mainSidebar) mainSidebar.classList.add('collapsed');
            if (mainBackdrop) mainBackdrop.classList.add('hidden');
        } else {
            document.body.classList.remove('sidebar-collapsed');
            document.body.classList.remove('mobile-filter-open');
            if (mainSidebar) mainSidebar.classList.remove('collapsed');
            if (mainBackdrop) mainBackdrop.classList.add('hidden');
        }
    };
    applySidebarMode();
    window.addEventListener('resize', applySidebarMode);
    const openMainSidebar = () => {
        document.body.classList.remove('sidebar-collapsed');
        if (mainSidebar) mainSidebar.classList.remove('collapsed');
        if (mainBackdrop) mainBackdrop.classList.remove('hidden');
    };
    const closeMainSidebar = () => {
        document.body.classList.add('sidebar-collapsed');
        document.body.classList.remove('mobile-filter-open');
        if (mainSidebar) mainSidebar.classList.add('collapsed');
        if (mainBackdrop) mainBackdrop.classList.add('hidden');
    };
    if (mainOpenBtn) mainOpenBtn.addEventListener('click', openMainSidebar);
    if (mainCloseBtn) mainCloseBtn.addEventListener('click', closeMainSidebar);
    if (mainCloseInner) {
        mainCloseInner.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeMainSidebar();
        });
    }
    if (mainBackdrop) {
        mainBackdrop.addEventListener('click', closeMainSidebar);
    }

    const customPinSortBtn = document.getElementById('custom-pin-sort-btn');
    if (customPinSortBtn) {
        customPinSortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            customPinSortMode = customPinSortMode === 'created' ? 'name' : 'created';
            customPinSortBtn.innerText = customPinSortMode === 'created' ? '作成順' : '名前順';
            renderCustomPinList();
        });
    }

    // --- ページ離脱（閉じる/リロード）時の警告 ---
    window.addEventListener('beforeunload', (e) => {
        if (currentRouteView === 'create' && routeIsModified) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

function updateSourceButtonState() {
    const showBaseOnlyBtn = document.getElementById('show-base-only-btn');
    const showDlcOnlyBtn = document.getElementById('show-dlc-only-btn');
    const showAllSourcesBtn = document.getElementById('show-all-sources-btn');

    if (showBaseOnlyBtn) {
        showBaseOnlyBtn.classList.toggle('active', activeSources.size === 1 && activeSources.has('base'));
    }
    if (showDlcOnlyBtn) {
        showDlcOnlyBtn.classList.toggle('active', activeSources.size === 1 && activeSources.has('dlc'));
    }
    if (showAllSourcesBtn) {
        showAllSourcesBtn.classList.toggle('active', activeSources.size === 2 && activeSources.has('base') && activeSources.has('dlc'));
    }
}

function setMapOverlay(mode) {
    if (!mapOverlayPaths[mode]) return;
    if (currentMapOverlay) {
        map.removeLayer(currentMapOverlay);
    }
    currentMapOverlay = L.imageOverlay(mapOverlayPaths[mode], bounds).addTo(map);
    mapOverlayMode = mode;
    localStorage.setItem('maneater_map_overlay', mode);

    const baseBtn = document.getElementById('map-overlay-base-btn');
    const dlcBtn = document.getElementById('map-overlay-dlc-btn');
    const routeBaseBtn = document.getElementById('route-map-base-btn');
    const routeDlcBtn = document.getElementById('route-map-dlc-btn');
    if (baseBtn) baseBtn.classList.toggle('active', mode === 'base');
    if (dlcBtn) dlcBtn.classList.toggle('active', mode === 'dlc');
    if (routeBaseBtn) routeBaseBtn.classList.toggle('active', mode === 'base');
    if (routeDlcBtn) routeDlcBtn.classList.toggle('active', mode === 'dlc');

    applyFilter();
    updateRouteFilterPanelCounts();
    updatePinCounts();
    updateRouteFilterPanelCounts();

    if (currentRouteView === 'create') {
        updateCreationVisuals();
    }
}

function togglePinBulkSidebar(forceOpen = null) {
    const sidebar = document.getElementById('pin-bulk-sidebar');
    if (!sidebar) return;
    const settingsPopover = document.getElementById('settings-popover');
    const settingsBtn = document.getElementById('toggle-settings-btn');
    const isHidden = sidebar.classList.contains('hidden');
    const willOpen = forceOpen === null ? isHidden : forceOpen;
    if (willOpen) {
        // 他の右サイドバーを閉じる
        toggleCustomPinSidebar(false);
        if (settingsPopover) settingsPopover.classList.add('hidden');
        if (settingsBtn) settingsBtn.classList.remove('active');
        sidebar.classList.remove('hidden');
        requestAnimationFrame(() => sidebar.classList.add('active'));
        pinBulkSidebarOpen = true;
        renderPinBulkList();
    } else {
        sidebar.classList.remove('active');
        pinBulkSidebarOpen = false;
        setTimeout(() => {
            sidebar.classList.add('hidden');
        }, 250);
    }
}

function renderPinBulkList() {
    const list = document.getElementById('pin-bulk-list');
    if (!list) return;
    list.innerHTML = '';
    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '10px';
    const typeList = [
        { type: 'landmark', label: 'ランドマーク' },
        { type: 'nutrient', label: '栄養箱' },
        { type: 'plate', label: 'ナンバープレート' },
        { type: 'main-quest', label: 'メインクエスト' },
        { type: 'sub-quest', label: '狩猟クエスト' },
        { type: 'time-trial', label: 'タイムトライアル' },
        { type: 'manhunt', label: '復讐クエスト' },
        { type: 'quest', label: 'クエスター' },
        { type: 'grate', label: '鉄格子' },
        { type: 'floodgate', label: '水門' },
        { type: 'cave', label: '洞窟' },
        { type: 'custom', label: '新規マップピン' }
    ];

    typeList.forEach(item => {
        const row = document.createElement('div');
        row.className = 'pin-bulk-item';
        const iconUrl = item.type === 'custom'
            ? '../images/map/新規マップピン.png'
            : (icons[item.type]?.options?.iconUrl);
        const info = document.createElement('div');
        info.className = 'pin-bulk-info';
        info.innerHTML = `<img src="${iconUrl || ''}" alt=""><span>${item.label}</span>`;

        const btn = document.createElement('button');
        btn.className = 'pin-bulk-more';
        btn.title = 'このピンの取得済みを解除';
        btn.innerText = '…';

        const popover = document.createElement('div');
        popover.className = 'pin-bulk-popover';
        const note = document.createElement('div');
        note.className = 'pin-bulk-note';
        note.innerText = 'この種類の取得済みを全て解除';
        const popoverBtn = document.createElement('button');
        popoverBtn.innerText = '取得済みを解除';
        popover.appendChild(note);
        popover.appendChild(popoverBtn);

        row.appendChild(info);
        row.appendChild(btn);
        row.appendChild(popover);
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.pin-bulk-popover').forEach(el => {
                if (el !== popover) el.style.display = 'none';
            });
            popover.style.display = popover.style.display === 'none' ? 'block' : 'none';
        });
        popoverBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.style.display = 'none';
            clearObtainedByType(item.type);
        });
        list.appendChild(row);
    });

    if (list.children.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-pin-msg';
        empty.innerText = '解除できるピンがありません';
        list.appendChild(empty);
    }
}

function clearRouteHoverPreview() {
    if (routeHoverLine) {
        routeHoverLine.remove();
        routeHoverLine = null;
    }
    if (routeHoverDecorator) {
        routeHoverDecorator.remove();
        routeHoverDecorator = null;
    }
}

function showRouteHoverPreview(targetPinId) {
    const section = creatingRoute.sections[activeSectionIndex];
    if (!section || !section.pins || section.pins.length === 0) return;
    const lastPinId = section.pins[section.pins.length - 1];
    if (lastPinId === targetPinId) return;
    const fromMeta = getRoutePinMeta(lastPinId);
    const toMeta = getRoutePinMeta(targetPinId);
    if (!fromMeta || !toMeta) return;
    clearRouteHoverPreview();
    routeHoverLine = L.polyline([fromMeta.latlng, toMeta.latlng], {
        color: '#ffd37a',
        weight: 2,
        dashArray: '6 6',
        opacity: 0.9
    }).addTo(map);
    if (L.polylineDecorator && L.Symbol && typeof L.Symbol.arrowHead === 'function') {
        routeHoverDecorator = L.polylineDecorator(routeHoverLine, {
            patterns: [
                { offset: '60%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: true, pathOptions: { color: '#ffd37a', fillColor: '#ffd37a', weight: 1, opacity: 1, fillOpacity: 1 } }) }
            ]
        }).addTo(map);
    }
}

function clearObtainedByType(type) {
    if (type === 'custom') {
        customPinObtained.clear();
        saveCustomPinObtained();
        customPins.forEach(pin => updateCustomPinObtainedAppearance(pin.id));
        renderCustomPinList();
    } else {
        collectibles.forEach(item => {
            if (item.type === type) obtainedPins.delete(item.id);
        });
        saveObtained();
        markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
        updatePinCounts();
    }
    applyFilter();
    updateRouteFilterPanelCounts();
}


function selectArea(area) {
    if (currentRouteView === 'create') {
        // ルート作成中はフィルタリングせず、ズームのみ行う
        if (area === 'all') {
            map.fitBounds(bounds, { paddingTopLeft: [320, 0], paddingBottomRight: [0, 0], animate: true, duration: 0.8 });
            return;
        }

        if (area === 'チドリ島') {
            setMapOverlay('dlc');
            map.fitBounds(bounds, { paddingTopLeft: [320, 0], paddingBottomRight: [0, 0], animate: true, duration: 0.8 });
            return;
        }

        setMapOverlay('base');
        const areaPins = markers.filter(m => m.item.area === area);
        if (areaPins.length > 0) {
            const latlngs = areaPins.map(m => m.marker.getLatLng());
            const areaBounds = L.latLngBounds(latlngs);
            const deepZoomAreas = ['デッド・ホース・レイク', 'サファリア・ベイ', 'プロスピリティー・サンド', 'キャビアキー'];
            const targetMaxZoom = deepZoomAreas.includes(area) ? 2.0 : 1.5;
            map.fitBounds(areaBounds.pad(0.2), { paddingTopLeft: [320, 0], paddingBottomRight: [100, 100], maxZoom: targetMaxZoom, animate: true, duration: 0.8 });
        }
        return;
    }

    activeAreas.clear();
    const nameEl = document.getElementById('current-area-name');
    const mobileAreaName = document.getElementById('mobile-current-area');
    document.querySelectorAll('.area-card').forEach(card => card.classList.remove('active'));

    if (area === 'all') {
        nameEl.innerText = "全エリアを表示";
        if (mobileAreaName) mobileAreaName.innerText = "全エリアを表示";
        map.fitBounds(bounds, { paddingTopLeft: [320, 0], paddingBottomRight: [0, 0], animate: true, duration: 0.8 });
    } else {
        activeAreas.add(area);
        nameEl.innerText = area;
        if (mobileAreaName) mobileAreaName.innerText = area;

        const selectedCard = document.querySelector(`.area-card[data-area="${area}"]`);
        if (selectedCard) selectedCard.classList.add('active');

        if (area === 'チドリ島') {
            setMapOverlay('dlc');
            // チドリ島は DLC 用マップなので、全体を表示（過度なズーム防止）
            map.fitBounds(bounds, { paddingTopLeft: [320, 0], paddingBottomRight: [0, 0], animate: true, duration: 0.8 });
        } else {
            setMapOverlay('base');

            const areaPins = markers.filter(m => m.item.area === area);
            if (areaPins.length > 0) {
                const latlngs = areaPins.map(m => m.marker.getLatLng());
                const areaBounds = L.latLngBounds(latlngs);
                const deepZoomAreas = ['デッド・ホース・レイク', 'サファリア・ベイ', 'プロスピリティー・サンド', 'キャビアキー'];
                const targetMaxZoom = deepZoomAreas.includes(area) ? 2.0 : 1.5;
                map.fitBounds(areaBounds.pad(0.2), { paddingTopLeft: [320, 0], paddingBottomRight: [100, 100], maxZoom: targetMaxZoom, animate: true, duration: 0.8 });
            }
        }
    }
    updateAreaProgress();
    updatePinCounts();
    applyFilter();
}

function updatePinCounts() {
    const totalCounts = {};
    const obtainedCounts = {};
    const totalCountsDlc = {};
    const obtainedCountsDlc = {};
    const currentArea = [...activeAreas][0] || 'all';
    
    collectibles.forEach(item => {
        const mapOk = item.map === mapOverlayMode;
        if (!mapOk) return;
        const areaOk = currentArea === 'all' ||
            item.area === currentArea ||
            (item.type === 'cave' && item.area === '洞窟') ||
            (item.type === 'floodgate' && item.area === '水門');
        if (areaOk) {
            if (item.source === 'dlc') {
                totalCountsDlc[item.type] = (totalCountsDlc[item.type] || 0) + 1;
                if (obtainedPins.has(item.id)) {
                    obtainedCountsDlc[item.type] = (obtainedCountsDlc[item.type] || 0) + 1;
                }
            } else {
                totalCounts[item.type] = (totalCounts[item.type] || 0) + 1;
                if (obtainedPins.has(item.id)) {
                    obtainedCounts[item.type] = (obtainedCounts[item.type] || 0) + 1;
                }
            }
        }
    });

    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        const type = btn.dataset.type;
        const source = btn.dataset.source;
        const countSpan = btn.querySelector('.pin-count');
        if (btn.dataset.custom === 'true') {
            if (countSpan) countSpan.innerText = `${customPins.length}`;
            return;
        }
        if (countSpan) {
            const total = source === 'dlc'
                ? (totalCountsDlc[type] || 0)
                : (totalCounts[type] || 0) + (totalCountsDlc[type] || 0);
            const obtained = source === 'dlc'
                ? (obtainedCountsDlc[type] || 0)
                : (obtainedCounts[type] || 0) + (obtainedCountsDlc[type] || 0);
            countSpan.innerText = `${obtained}/${total}`;
        }
    });
}

function syncFilterButtons() {
    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        if (btn.dataset.custom === 'true') {
            btn.classList.toggle('active', showCustomPins);
            return;
        }
        const t = btn.dataset.type;
        const source = btn.dataset.source;
        if (!t) return;
        if (source === 'dlc') {
            btn.classList.toggle('active', activeDlcTypes.has(t));
        } else {
            btn.classList.toggle('active', activeTypes.has(t));
        }
    });
    updateSectionMasterToggles();
}

function updateSectionMasterToggles() {
    document.querySelectorAll('.section-master-toggle').forEach(master => {
        const section = master.dataset.section;
        if (section === 'custom-pins') {
            const allOn = showCustomPins && customPinVisibility.size === customPins.length;
            master.checked = allOn;
            return;
        }
        const group = document.querySelector(`[data-section-group="${section}"]`);
        if (!group) return;
        const buttons = [...group.querySelectorAll('.filter-type-btn')];
        if (buttons.length === 0) return;
        const allOff = buttons.every(btn => !btn.classList.contains('active'));
        master.checked = !allOff;
    });
}

function updateRouteFilterPanelCounts() {
    const totalCounts = {};
    const obtainedCounts = {};
    const totalCountsDlc = {};
    const obtainedCountsDlc = {};
    const currentArea = [...activeAreas][0] || 'all';

    collectibles.forEach(item => {
        const mapOk = item.map === mapOverlayMode;
        const areaOk = currentArea === 'all' ||
            item.area === currentArea ||
            (item.type === 'cave' && item.area === '洞窟') ||
            (item.type === 'floodgate' && item.area === '水門');
        const sourceOk = activeSources.size === 0 || activeSources.has(item.source);
        if (!mapOk || !areaOk || !sourceOk) return;

        if (item.source === 'dlc') {
            totalCountsDlc[item.type] = (totalCountsDlc[item.type] || 0) + 1;
            if (obtainedPins.has(item.id)) {
                obtainedCountsDlc[item.type] = (obtainedCountsDlc[item.type] || 0) + 1;
            }
        } else {
            totalCounts[item.type] = (totalCounts[item.type] || 0) + 1;
            if (obtainedPins.has(item.id)) {
                obtainedCounts[item.type] = (obtainedCounts[item.type] || 0) + 1;
            }
        }
    });

    document.querySelectorAll('#route-filter-panel .filter-type-btn').forEach(btn => {
        const t = btn.dataset.type;
        const source = btn.dataset.source;
        const countSpan = btn.querySelector('.route-filter-count');
        if (!countSpan) return;
        const total = source === 'dlc' ? (totalCountsDlc[t] || 0) : (totalCounts[t] || 0);
        countSpan.innerText = `${total}`;
    });
}

function updateQuickView(visibleTypes) {
    const container = document.getElementById('route-quickview-list');
    if (!container) return;
    if (currentRouteView !== 'create') {
        container.innerHTML = '';
        return;
    }

    const types = [...visibleTypes];
    container.innerHTML = '';

    types.forEach(type => {
        const iconUrl = (icons[type] && icons[type].options && icons[type].options.iconUrl) ? icons[type].options.iconUrl : null;
        if (!iconUrl) return;
        const btn = document.createElement('button');
        btn.className = 'quickview-icon';
        btn.dataset.type = type;
        btn.innerHTML = `<img src="${iconUrl}" alt="">`;
        btn.addEventListener('click', () => {
            if (activeTypes.has(type)) activeTypes.delete(type);
            else activeTypes.add(type);
            syncFilterButtons();
            applyFilter();
            updateRouteFilterPanelCounts();
        });
        container.appendChild(btn);
    });
}

function closeRouteCreatePanels() {
    const filterPanel = document.getElementById('route-filter-panel');
    const areaPanel = document.getElementById('route-area-panel');
    const filterBtn = document.getElementById('route-filter-btn');
    const areaBtn = document.getElementById('route-area-btn');

    if (filterPanel) {
        filterPanel.classList.remove('active');
        filterPanel.classList.add('hidden');
    }
    if (areaPanel) {
        areaPanel.classList.remove('active');
        areaPanel.classList.add('hidden');
    }
    if (filterBtn) filterBtn.classList.remove('active');
    if (areaBtn) areaBtn.classList.remove('active');
}

function setRouteCreateActionsVisible(visible) {
    const actions = document.getElementById('route-create-actions');
    if (actions) actions.classList.toggle('hidden', !visible);
    if (!visible) {
        closeRouteCreatePanels();
        const quickview = document.getElementById('route-quickview');
        if (quickview) quickview.classList.remove('collapsed');
    }
}

function updateAreaProgress() {
    // 探索度の割合計算は未実装だから、明示的に「未実装」と表示する
    document.querySelectorAll('.area-sub').forEach(sub => sub.innerText = `探索度: -%（未実装）`);
    const percentEl = document.getElementById('area-progress-percent');
    const fillEl = document.getElementById('area-progress-fill');
    if (percentEl) percentEl.innerText = '-';
    if (fillEl) fillEl.style.width = `0%`;
}

setTimeout(() => {
    updateAreaProgress();
    updatePinCounts();
}, 500);
init();

