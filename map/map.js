const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 4,
    zoomControl: false,
    doubleClickZoom: false // 連打時のズーム/移動を防止
});

function createImageNode(src, alt = '') {
    const image = document.createElement('img');
    image.src = src || '';
    image.alt = alt;
    return image;
}

function createSvgNode(attributes, paths = [], circles = []) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.entries(attributes).forEach(([key, value]) => {
        svg.setAttribute(key, value);
    });
    paths.forEach((pathData) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        Object.entries(pathData).forEach(([key, value]) => {
            path.setAttribute(key, value);
        });
        svg.appendChild(path);
    });
    circles.forEach((circleData) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        Object.entries(circleData).forEach(([key, value]) => {
            circle.setAttribute(key, value);
        });
        svg.appendChild(circle);
    });
    return svg;
}

// UI コントロール
const customPinControl = L.control({ position: 'topright' });
customPinControl.onAdd = function() {
    const container = L.DomUtil.create('div', 'leaflet-control custom-pin-control');
    const button = L.DomUtil.create('button', 'custom-pin-btn', container);
    button.type = 'button';
    button.title = 'カスタムピン作成';
    button.appendChild(createImageNode('../images/map/新規マップピン.png'));
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(button, 'click', (e) => {
        L.DomEvent.stop(e);
        toggleCustomPinSidebar();
    });
    return container;
};
customPinControl.addTo(map);

const pinBulkControl = L.control({ position: 'topright' });
pinBulkControl.onAdd = function() {
    const container = L.DomUtil.create('div', 'leaflet-control pin-bulk-control');
    const button = L.DomUtil.create('button', 'custom-pin-btn', container);
    button.type = 'button';
    button.title = '標記したマップピン';
    button.appendChild(createImageNode('../images/map/砂時計.png'));
    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(button, 'click', (e) => {
        L.DomEvent.stop(e);
        togglePinBulkSidebar();
    });
    return container;
};
pinBulkControl.addTo(map);

const STORAGE_KEYS = {
    overlay: 'maneater_map_overlay',
    obtainedPins: 'maneater_obtained_pins',
    customPins: 'maneater_custom_pins',
    customPinObtained: 'maneater_custom_pins_obtained',
    pinnedRoutes: 'maneater_pinned_routes',
    myRoutes: 'myRoutes',
    routes: 'maneater_routes',
    preferences: 'maneater_map_preferences',
    tutorialDone: 'maneater_map_tutorial_done_v2',
    routeTutorialDone: 'maneater_route_tutorial_done_v1'
};

const DEFAULT_BASE_TYPES = ['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'manhunt', 'grate', 'floodgate', 'cave'];
const DEFAULT_DLC_TYPES = ['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'time-trial', 'manhunt', 'quest', 'grate', 'floodgate', 'cave'];

const AREA_META = {
    all: { id: 'all', label: '全エリア', shortLabel: '全エリアを表示', source: 'all', order: 0, selectable: true },
    'fawtick-bayou': { id: 'fawtick-bayou', label: 'フォーティック・バイユー', source: 'base', order: 1, selectable: true },
    'dead-horse-lake': { id: 'dead-horse-lake', label: 'デッド・ホース・レイク', source: 'base', order: 2, selectable: true, deepZoom: true },
    'golden-shores': { id: 'golden-shores', label: 'ゴールデン・ショア', source: 'base', order: 3, selectable: true },
    'sapphire-bay': { id: 'sapphire-bay', label: 'サファリア・ベイ', source: 'base', order: 4, selectable: true, deepZoom: true },
    'prosperity-sands': { id: 'prosperity-sands', label: 'プロスピリティー・サンド', source: 'base', order: 5, selectable: true, deepZoom: true },
    'caviar-key': { id: 'caviar-key', label: 'キャビアキー', source: 'base', order: 6, selectable: true, deepZoom: true },
    gulf: { id: 'gulf', label: '湾岸', source: 'base', order: 7, selectable: true },
    'crawfish-bay': { id: 'crawfish-bay', label: 'クローフィッシュ・ベイ', source: 'base', order: 8, selectable: true },
    'plover-island': { id: 'plover-island', label: 'チドリ島', source: 'dlc', order: 9, selectable: true, map: 'dlc', routeLabel: 'チドリ島（DLC）' },
    floodgates: { id: 'floodgates', label: '水門', source: 'shared', order: 90, selectable: false, shared: true },
    caves: { id: 'caves', label: '洞窟', source: 'shared', order: 91, selectable: false, shared: true }
};

const AREA_ALIASES = {
    'フォーティック・バイユー': 'fawtick-bayou',
    'デッド・ホース・レイク': 'dead-horse-lake',
    'ゴールデン・ショア': 'golden-shores',
    'サファリア・ベイ': 'sapphire-bay',
    'プロスピリティー・サンド': 'prosperity-sands',
    'プロスピリティーサンド': 'prosperity-sands',
    'キャビアキー': 'caviar-key',
    '湾岸': 'gulf',
    'クローフィッシュ・ベイ': 'crawfish-bay',
    'チドリ島': 'plover-island',
    '水門': 'floodgates',
    '洞窟': 'caves'
};

const PIN_META = {
    landmark: {
        label: 'ランドマーク',
        shortLabel: 'ランドマーク',
        category: 'collection',
        sources: ['base', 'dlc'],
        order: 1,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/ランドマーク.png', iconSize: [32, 32], iconAnchor: [16, 26], popupAnchor: [0, -20] }
    },
    nutrient: {
        label: '栄養箱',
        shortLabel: '栄養箱',
        category: 'collection',
        sources: ['base', 'dlc'],
        order: 2,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/栄養箱.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    plate: {
        label: 'ナンバープレート',
        shortLabel: 'ナンバー',
        category: 'collection',
        sources: ['base', 'dlc'],
        order: 3,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/ナンバープレート.png', iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -10] }
    },
    'main-quest': {
        label: 'メインクエスト',
        shortLabel: 'メイン',
        category: 'quest',
        sources: ['base', 'dlc'],
        order: 4,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/メインクエスト.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    'sub-quest': {
        label: '狩猟クエスト',
        shortLabel: '狩猟クエスト',
        category: 'quest',
        sources: ['base', 'dlc'],
        order: 5,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/手配.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    'time-trial': {
        label: 'タイムトライアル',
        shortLabel: 'タイムトライアル',
        category: 'quest',
        sources: ['dlc'],
        order: 6,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/タイムトライアル.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    manhunt: {
        label: '復讐クエスト',
        shortLabel: '復讐クエスト',
        category: 'quest',
        sources: ['base', 'dlc'],
        order: 7,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/人間狩り.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    quest: {
        label: 'クエスター',
        shortLabel: 'クエスター',
        category: 'quest',
        sources: ['dlc'],
        order: 8,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/クエスター.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    'infamy-1': {
        label: '悪名ランク1',
        shortLabel: '悪名ランク1',
        category: 'other',
        sources: ['base'],
        order: 9,
        hiddenInBulk: true,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/悪名ランク1.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    grate: {
        label: '鉄格子',
        shortLabel: '鉄格子',
        category: 'other',
        sources: ['base', 'dlc'],
        order: 10,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/鉄格子.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    floodgate: {
        label: '水門',
        shortLabel: '水門',
        category: 'other',
        sources: ['base', 'dlc'],
        order: 11,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/水門.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }
    },
    cave: {
        label: '洞窟',
        shortLabel: '洞窟',
        category: 'other',
        sources: ['base', 'dlc'],
        order: 12,
        customSelectable: true,
        leaflet: { iconUrl: '../images/map/洞窟.png', iconSize: [34, 34], iconAnchor: [17, 20], popupAnchor: [0, -12], className: 'cave-marker-invisible' }
    }
};

const FILTER_SECTION_META = [
    { context: 'main', id: 'collection', types: ['landmark', 'nutrient', 'plate'] },
    { context: 'main', id: 'quest-base', source: 'base', types: ['main-quest', 'sub-quest', 'manhunt'] },
    { context: 'main', id: 'quest-dlc', source: 'dlc', types: ['main-quest', 'sub-quest', 'time-trial', 'manhunt', 'quest'] },
    { context: 'main', id: 'other', types: ['grate', 'floodgate', 'cave'] },
    { context: 'route', id: 'route-collection', types: ['landmark', 'nutrient', 'plate'] },
    { context: 'route', id: 'route-quest-base', source: 'base', types: ['main-quest', 'sub-quest', 'manhunt'] },
    { context: 'route', id: 'route-quest-dlc', source: 'dlc', types: ['main-quest', 'sub-quest', 'time-trial', 'manhunt', 'quest'] },
    { context: 'route', id: 'route-other', types: ['grate', 'floodgate', 'cave'] }
];

const USER_DATA_KEYS = {
    obtainedPins: 'obtainedPins',
    customPins: 'customPins',
    customPinObtained: 'customPinObtained',
    routes: 'routes',
    pinnedRoutes: 'pinnedRoutes',
    preferences: 'preferences'
};

const LIMITS = {
    customPins: 100,
    myRoutes: 50,
    routeName: 50,
    routeDescription: 500,
    customPinTitle: 30,
    customPinDetail: 300
};

function createDefaultRoute() {
    return {
        id: null,
        name: '',
        description: '',
        sections: [{ name: '区間1', pins: [], collapsed: true }]
    };
}

function validateCustomPinInput({ title, detail }) {
    if (customPins.length >= LIMITS.customPins) {
        return 'カスタムピンは100個までです';
    }
    if (!title) {
        return 'ピン名称を入力してください。';
    }
    if (title.length > LIMITS.customPinTitle) {
        return 'カスタムピンタイトルは30文字以内で入力してください';
    }
    if (detail.length > LIMITS.customPinDetail) {
        return 'カスタムピン説明は300文字以内で入力してください';
    }
    return null;
}

function validateRouteInput({ name, description, isNewRoute }) {
    if (!name) {
        return 'ルート名を入力してください';
    }
    if (isNewRoute && myRoutes.length >= LIMITS.myRoutes) {
        return 'ルートは50本まで保存できます';
    }
    if (name.length > LIMITS.routeName) {
        return 'ルート名は50文字以内で入力してください';
    }
    if (description.length > LIMITS.routeDescription) {
        return 'ルート説明は500文字以内で入力してください';
    }
    return null;
}

const w = 1120;
const h = 1120;
const bounds = [[0, 0], [h, w]];

const mapOverlayPaths = {
    base: '../images/maneater_map.png',
    dlc: '../images/dlc_maneater_map.png'
};

function normalizeOverlayMode(mode) {
    return mode === 'dlc' ? 'dlc' : 'base';
}

function normalizeSource(source) {
    return source === 'dlc' ? 'dlc' : 'base';
}

const icons = Object.fromEntries(
    Object.entries(PIN_META).map(([type, meta]) => [type, L.icon(meta.leaflet)])
);

const customPinIcon = L.icon({
    iconUrl: '../images/map/新規マップピン.png',
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -24]
});

const state = {
    overlay: 'base',
    activeAreas: new Set(['all']),
    activeBaseTypes: new Set(DEFAULT_BASE_TYPES),
    activeDlcTypes: new Set(DEFAULT_DLC_TYPES),
    activeSources: new Set(['base', 'dlc']),
    showObtained: true,
    showCustomPins: true,
    obtainedPins: new Set(),
    customPinVisibility: new Set(),
    customPinObtained: new Set(),
    route: {
        view: 'browse',
        current: null,
        activeTab: 'trend'
    },
    sidebar: {
        current: 'main',
        last: 'main'
    }
};

let mapOverlayMode = state.overlay;
let currentSidebar = state.sidebar.current;
let lastSidebar = state.sidebar.last;
let currentRouteView = state.route.view;
let activeRouteTab = state.route.activeTab;
let currentDetailedRoute = state.route.current;
let showObtained = state.showObtained;
let showCustomPins = state.showCustomPins;
let customPinVisibility = state.customPinVisibility;
let customPinObtained = state.customPinObtained;
let activeTypes = state.activeBaseTypes;
let activeDlcTypes = state.activeDlcTypes;
let activeAreas = state.activeAreas;
let activeSources = state.activeSources;
let obtainedPins = state.obtainedPins;

function setOverlay(mode) {
    const normalizedMode = normalizeOverlayMode(mode);
    mapOverlayMode = normalizedMode;
    state.overlay = normalizedMode;
}

function setSidebarCurrent(value) {
    currentSidebar = value;
    state.sidebar.current = value;
    if (isAppReady && !suppressPersistence) savePreferences();
}

function setSidebarLast(value) {
    lastSidebar = value;
    state.sidebar.last = value;
    if (isAppReady && !suppressPersistence) savePreferences();
}

function setRouteView(value) {
    currentRouteView = value;
    state.route.view = value;
    if (isAppReady && !suppressPersistence) savePreferences();
}

function setCurrentRoute(route) {
    currentDetailedRoute = route;
    state.route.current = route;
    if (isAppReady && !suppressPersistence) savePreferences();
}

function setRouteTab(value) {
    activeRouteTab = value;
    state.route.activeTab = value;
    if (isAppReady && !suppressPersistence) savePreferences();
}

function setActiveBaseTypes(nextTypes) {
    activeTypes = nextTypes;
    state.activeBaseTypes = nextTypes;
}

function setActiveDlcTypes(nextTypes) {
    activeDlcTypes = nextTypes;
    state.activeDlcTypes = nextTypes;
}

function setActiveAreas(nextAreas) {
    activeAreas = nextAreas;
    state.activeAreas = nextAreas;
}

function setSources(nextSources) {
    activeSources = new Set(nextSources);
    state.activeSources = activeSources;
}

function setShowObtained(flag) {
    showObtained = !!flag;
    state.showObtained = showObtained;
}

function setShowCustomPins(flag) {
    showCustomPins = !!flag;
    state.showCustomPins = showCustomPins;
}

function setObtainedPinSet(nextObtainedPins) {
    obtainedPins = nextObtainedPins;
    state.obtainedPins = nextObtainedPins;
}

function setCustomPinVisibilitySet(nextVisibility) {
    customPinVisibility = nextVisibility;
    state.customPinVisibility = nextVisibility;
}

function setCustomPinObtainedSet(nextObtained) {
    customPinObtained = nextObtained;
    state.customPinObtained = nextObtained;
}

let currentMapOverlay = L.imageOverlay(mapOverlayPaths[state.overlay], bounds).addTo(map);

map.fitBounds(bounds, { paddingTopLeft: [320, 0] });

// マップ上クリックの補助動作
map.on('click', function(e) {
    if (customPinMode) {
        if (mobileCustomPinPlacementMode) return;
        setCustomPinDraft(e.latlng);
        return;
    }
    const hitCave = collectibles.find(c => c.type === 'cave' && Math.hypot(c.lat - e.latlng.lat, c.lng - e.latlng.lng) <= CAVE_HIT_RADIUS);
    if (hitCave) {
        if (currentRouteView === 'create' && !batchMode) {
            // ルート作成中は通常ピンと同じく追加動作を優先する
            addPinToRoute(hitCave.id);
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
});

// アプリ状態
let rawCollectibles = [];

// ルート状態
let myRoutes = [];
let creatingRoute = createDefaultRoute();
let activeSectionIndex = 0;
let routePinInsertIndex = null;
let openPinActionSectionIndex = null;
let openPinActionIndex = null;
let routeIsModified = false;
let routePolylines = [];
let routePreviewMarkers = [];
let routeDecorators = [];
let focusedRoutePins = null;
let routePinHighlights = [];
let routeHoverLine = null;
let routeHoverDecorator = null;
let expandedRouteDetailSections = new Set();
let activeRouteDetailSectionIndex = -1;
let draggedSectionIndex = null;
let sectionAutoScrollFrame = null;
let sectionAutoScrollDirection = 0;
let sectionAutoScrollContainer = null;

// 洞窟ヒット判定用レイヤー
const caveCircleLayers = [];
const CAVE_HIT_RADIUS = 10; // ピクセル相当として扱う（小さめ）
const CAVE_DISPLAY_RADIUS = 10;

// カスタムピン状態
let customPins = [];
let customPinMarkers = new Map();
let customPinMode = false;
let mobileCustomPinPlacementMode = false;
let customPinDraft = null;
let customPinDraftMarker = null;
let customPinSelectedType = 'landmark';
let batchCustomObtained = new Set();
let customPinById = new Map();
let pinBulkSidebarOpen = false;
let customPinSortMode = 'created';
let tutorialStepIndex = 0;
const tutorialStorageKey = STORAGE_KEYS.tutorialDone;
let routeTutorialStepIndex = 0;
let routeTutorialActive = false;
let routeTutorialShowcaseVisible = false;
let routeTutorialResizeHandler = null;
let routeTutorialResolveStep = null;
const routeTutorialStorageKey = STORAGE_KEYS.routeTutorialDone;
const SAVE_DEBOUNCE_MS = 700;

let authManager = null;
let storageController = null;
let authSubscription = null;
let suppressPersistence = false;
let pendingSaveTimer = null;
let pendingSavePromise = Promise.resolve();
let isAppReady = false;
let currentAuthUser = null;
let latestUserDataSnapshot = null;
let pendingCollectibleIdMigrationSave = false;
let lastQuickViewTypesKey = '';

// トレンドルート定義
const trendRoutes = [
    // 開発用テンプレート
    // {
    //     id: 'trend-dev-001',
    //     name: 'ルート名',
    //     description: '説明',
    //     sections: [
    //         { name: '区間1', pins: ['landmark-0', 'devpin-1'] }
    //     ],
    //     customPins: [
    //         {
    //             id: 'devpin-1',
    //             type: 'landmark',
    //             title: '開発者ピン',
    //             detail: '',
    //             lat: 0,
    //             lng: 0,
    //             map: 'base'
    //         }
    //     ]
    // },
    {
        id: 'trend-any-base-game-standard',
        name: 'Any% Base game Standard',
        description: '',
        sections: [
            { name: 'チュートリアル', pins: ['mainquest-crawfish-bay-02', 'mainquest-crawfish-bay-01'] },
            { name: '洞窟まで', pins: ['mainquest-fawtick-bayou-01', 'landmark-fawtick-bayou-01', 'nutrient-fawtick-bayou-01', 'mainquest-fawtick-bayou-08'] },
            { name: 'フォーティック・バイユー北部', pins: ['cave-caves-01', 'landmark-fawtick-bayou-02', 'nutrient-fawtick-bayou-02', 'mainquest-fawtick-bayou-04', 'nutrient-fawtick-bayou-03', 'nutrient-fawtick-bayou-04', 'landmark-fawtick-bayou-03', 'nutrient-fawtick-bayou-05', 'landmark-fawtick-bayou-04', 'nutrient-fawtick-bayou-06', 'landmark-fawtick-bayou-05', 'nutrient-fawtick-bayou-08', 'landmark-fawtick-bayou-06', 'nutrient-fawtick-bayou-09', 'landmark-fawtick-bayou-07', 'nutrient-fawtick-bayou-10', 'landmark-fawtick-bayou-08', 'landmark-fawtick-bayou-09', 'cave-caves-01'] },
            { name: 'フォーティックバイユー南部', pins: ['cave-caves-01', 'plate-fawtick-bayou-04', 'mainquest-fawtick-bayou-03', 'nutrient-fawtick-bayou-11', 'plate-fawtick-bayou-06', 'landmark-fawtick-bayou-10', 'floodgate-floodgates-03', 'mainquest-caviar-key-05'] },
            { name: 'エピソード3：プロスピリティーサンドの洞窟まで', pins: ['cave-caves-03', 'nutrient-caviar-key-02', 'plate-caviar-key-10', 'nutrient-caviar-key-01', 'grate-caviar-key-02', 'nutrient-caviar-key-04', 'grate-caviar-key-01', 'landmark-prosperity-sands-07', 'landmark-prosperity-sands-06', 'plate-prosperity-sands-03', 'nutrient-prosperity-sands-01', 'mainquest-prosperity-sands-04'] },
            { name: 'ゴールデン・ショアの洞窟まで', pins: ['cave-caves-06', 'landmark-prosperity-sands-02', 'landmark-prosperity-sands-03', 'floodgate-floodgates-02', 'landmark-golden-shores-07', 'nutrient-golden-shores-15', 'plate-golden-shores-09', 'mainquest-golden-shores-05', 'cave-caves-06'] },
            { name: 'プロスピリティーサンドのランドマークめぐり', pins: ['cave-caves-06', 'landmark-prosperity-sands-01', 'landmark-prosperity-sands-04', 'landmark-prosperity-sands-10', 'landmark-prosperity-sands-09', 'landmark-prosperity-sands-08', 'cave-caves-06'] },
            { name: 'デッドホースレイクの水門まで', pins: ['cave-caves-06', 'landmark-prosperity-sands-05', 'floodgate-floodgates-01'] },
            { name: 'デッドホースレイクの洞窟まで', pins: ['floodgate-floodgates-01', 'landmark-dead-horse-lake-09', 'landmark-dead-horse-lake-08', 'nutrient-dead-horse-lake-12', 'landmark-dead-horse-lake-10', 'landmark-dead-horse-lake-03', 'mainquest-dead-horse-lake-07'] },
            { name: 'デッドホースレイク東部', pins: ['cave-caves-04', 'landmark-dead-horse-lake-02', 'nutrient-dead-horse-lake-05', 'nutrient-dead-horse-lake-09', 'mainquest-dead-horse-lake-06', 'grate-dead-horse-lake-02', 'landmark-dead-horse-lake-01', 'nutrient-dead-horse-lake-03', 'mainquest-dead-horse-lake-04', 'cave-caves-04'] },
            { name: 'デッドホースレイク西部', pins: ['cave-caves-04', 'nutrient-dead-horse-lake-06', 'landmark-dead-horse-lake-04', 'landmark-dead-horse-lake-05', 'mainquest-dead-horse-lake-08', '1774438439092', 'grate-dead-horse-lake-07', 'plate-dead-horse-lake-08', 'mainquest-dead-horse-lake-09', 'grate-dead-horse-lake-08', 'landmark-dead-horse-lake-06', 'plate-dead-horse-lake-09', 'landmark-dead-horse-lake-07', 'nutrient-dead-horse-lake-11', 'cave-caves-04'] },
            { name: 'デッドホースレイクの頂点捕食者戦', pins: ['cave-caves-04', 'mainquest-dead-horse-lake-05', 'cave-caves-04'] },
            { name: 'デッドホースレイク終了まで', pins: ['cave-caves-04', 'manhunt-dead-horse-lake-03', '1774438480957', 'nutrient-dead-horse-lake-13', 'mainquest-dead-horse-lake-11', 'mainquest-dead-horse-lake-10'] },
            { name: 'フォーティック・バイユーの洞窟まで', pins: ['mainquest-dead-horse-lake-10', 'cave-caves-01'] },
            { name: 'フォーティック・バイユーその2', pins: ['cave-caves-01', 'mainquest-fawtick-bayou-05', 'nutrient-fawtick-bayou-12', 'mainquest-fawtick-bayou-06', 'mainquest-fawtick-bayou-07'] },
            { name: 'ゴールデン・ショアの洞窟へ', pins: ['mainquest-fawtick-bayou-07', 'cave-caves-05'] },
            { name: 'ゴールデン・ショア', pins: ['cave-caves-05', 'plate-golden-shores-06', 'landmark-golden-shores-06', 'nutrient-golden-shores-13', 'mainquest-golden-shores-10', 'nutrient-golden-shores-08', 'landmark-golden-shores-03', 'grate-golden-shores-01', 'nutrient-golden-shores-06', 'nutrient-golden-shores-04', 'mainquest-golden-shores-09', 'grate-golden-shores-01', 'nutrient-golden-shores-03', 'landmark-golden-shores-01', 'mainquest-golden-shores-07', 'mainquest-golden-shores-06', 'nutrient-golden-shores-07', 'plate-golden-shores-05', 'nutrient-golden-shores-12', 'plate-golden-shores-08', 'mainquest-golden-shores-04', 'cave-caves-05'] },
            { name: 'ゴールデン・ショアの捕食者戦', pins: ['cave-caves-05', 'nutrient-golden-shores-10', 'mainquest-golden-shores-08', 'mainquest-golden-shores-11'] },
            { name: 'サファイアベイの洞窟まで', pins: ['mainquest-golden-shores-11', 'nutrient-golden-shores-17', 'nutrient-sapphire-bay-01', 'nutrient-sapphire-bay-02', 'landmark-sapphire-bay-01', 'landmark-sapphire-bay-03', 'landmark-sapphire-bay-02', 'nutrient-sapphire-bay-05', 'nutrient-sapphire-bay-12', 'mainquest-sapphire-bay-09'] },
            { name: 'サファイアベイ北部', pins: ['cave-caves-07', 'landmark-sapphire-bay-04', 'nutrient-sapphire-bay-08', 'mainquest-sapphire-bay-07', 'mainquest-sapphire-bay-06', 'grate-sapphire-bay-02', 'nutrient-sapphire-bay-06', 'nutrient-sapphire-bay-07', 'cave-caves-07'] },
            { name: 'サファイアベイ南部', pins: ['cave-caves-07', 'plate-sapphire-bay-08', 'landmark-sapphire-bay-06', 'landmark-sapphire-bay-07', 'mainquest-sapphire-bay-12', 'nutrient-sapphire-bay-17', 'nutrient-sapphire-bay-16', 'landmark-sapphire-bay-08', 'mainquest-sapphire-bay-13', 'nutrient-sapphire-bay-19', 'nutrient-sapphire-bay-03', 'mainquest-sapphire-bay-05', 'landmark-sapphire-bay-05', 'mainquest-sapphire-bay-11', 'mainquest-sapphire-bay-08', 'mainquest-sapphire-bay-10'] },
            { name: 'プロスピリティーサンドの洞窟へ', pins: ['mainquest-sapphire-bay-10', 'cave-caves-06'] },
            { name: 'プロスピリティーサンド南部～湾岸西部', pins: ['cave-caves-06', 'nutrient-prosperity-sands-06', 'mainquest-prosperity-sands-06', 'nutrient-prosperity-sands-07', 'nutrient-prosperity-sands-08', 'mainquest-prosperity-sands-07', 'nutrient-prosperity-sands-09', 'grate-gulf-05', 'nutrient-gulf-05', 'nutrient-gulf-04', 'nutrient-gulf-03', 'grate-gulf-07', 'plate-gulf-03', 'grate-gulf-06', 'nutrient-gulf-06', 'cave-caves-06'] },
            { name: 'プロスピリティーサンド西部', pins: ['cave-caves-06', 'mainquest-prosperity-sands-03', 'mainquest-prosperity-sands-02', 'cave-caves-06'] },
            { name: 'プロスピリティーサンド終了まで', pins: ['cave-caves-06', 'grate-prosperity-sands-03', 'plate-prosperity-sands-04', 'nutrient-prosperity-sands-04', 'subquest-prosperity-sands-04', 'nutrient-prosperity-sands-05', 'plate-prosperity-sands-05', 'grate-prosperity-sands-04', 'mainquest-prosperity-sands-05', 'plate-caviar-key-07', 'mainquest-prosperity-sands-09', 'mainquest-prosperity-sands-08'] },
            { name: 'キャビアキーの洞窟へ', pins: ['mainquest-prosperity-sands-08', 'cave-caves-03'] },
            { name: 'キャビアキー前半', pins: ['cave-caves-03', 'landmark-caviar-key-03', 'grate-caviar-key-06', 'nutrient-caviar-key-12', 'nutrient-caviar-key-05', 'grate-caviar-key-06', 'mainquest-caviar-key-07', 'nutrient-caviar-key-06', 'landmark-caviar-key-08', 'plate-caviar-key-04', 'landmark-caviar-key-02', 'plate-caviar-key-01', 'mainquest-caviar-key-04', 'landmark-caviar-key-01', 'cave-caves-03'] },
            { name: 'キャビアキー後半', pins: ['cave-caves-03', 'mainquest-caviar-key-06', 'grate-caviar-key-04', 'nutrient-caviar-key-13', 'nutrient-caviar-key-07', 'plate-caviar-key-06', 'nutrient-caviar-key-08', 'landmark-caviar-key-05', 'mainquest-caviar-key-09', 'mainquest-caviar-key-08', '1774438939681', 'plate-caviar-key-08', 'landmark-caviar-key-06', 'mainquest-caviar-key-10', 'mainquest-gulf-09'] },
            { name: '湾岸中部', pins: ['cave-caves-08', 'landmark-gulf-01', 'nutrient-gulf-02', 'plate-gulf-01', 'plate-gulf-02', 'nutrient-gulf-14', 'landmark-gulf-04', 'plate-gulf-06', 'mainquest-gulf-14', 'mainquest-gulf-15', 'cave-caves-08'] },
            { name: '湾岸東部', pins: ['cave-caves-08', 'nutrient-gulf-01', 'mainquest-gulf-10', 'plate-gulf-08', 'mainquest-gulf-12', 'nutrient-gulf-18', 'landmark-gulf-07', 'grate-caviar-key-10', 'nutrient-gulf-17', 'manhunt-gulf-01', 'landmark-gulf-06', 'nutrient-gulf-19', 'plate-gulf-09', 'nutrient-gulf-20', 'grate-gulf-12', 'mainquest-gulf-13', 'cave-caves-08'] },
            { name: '湾岸の頂点捕食者戦', pins: ['cave-caves-08', 'mainquest-gulf-17', 'cave-caves-08'] },
            { name: 'ラスボス戦', pins: ['cave-caves-08', 'mainquest-gulf-11', 'mainquest-gulf-16'] }
        ],
        customPins: [
            { id: '1774438439092', lat: 876.7642354666698, lng: 459.71767537328384, map: 'base', name: '悪名ランク3まで', type: 'infamy-1', title: '悪名ランク3まで', detail: '', userId: null, obtained: false, createdAt: '2026-03-25T11:33:59.092Z', updatedAt: '2026-03-26T12:26:05.224Z', visibility: true },
            { id: '1774438480957', lat: 818.776900845104, lng: 464.4578063500829, map: 'base', name: '悪名ランク5まで', type: 'infamy-1', title: '悪名ランク5まで', detail: '', userId: null, obtained: false, createdAt: '2026-03-25T11:34:40.957Z', updatedAt: '2026-03-26T12:26:05.224Z', visibility: true },
            { id: '1774438939681', lat: 478.0184747049061, lng: 711.6519533999383, map: 'base', name: '悪名ランク6まで', type: 'infamy-1', title: '悪名ランク6まで', detail: '', userId: null, obtained: false, createdAt: '2026-03-25T11:42:19.681Z', updatedAt: '2026-03-26T12:26:05.224Z', visibility: true }
        ]
    },
    {
        id: 'trend-100-base-game-standard',
        name: '100% Base game Standard',
        description: '',
        sections: [
            { name: '区間1', pins: ['mainquest-crawfish-bay-02', 'mainquest-crawfish-bay-01'] },
            { name: '区間2', pins: ['mainquest-fawtick-bayou-01', 'cave-caves-02', 'landmark-fawtick-bayou-01', 'nutrient-fawtick-bayou-01', 'mainquest-fawtick-bayou-08'] },
            { name: '区間3', pins: ['cave-caves-01', 'landmark-fawtick-bayou-02', 'nutrient-fawtick-bayou-02', 'mainquest-fawtick-bayou-04', 'nutrient-fawtick-bayou-03', 'nutrient-fawtick-bayou-04', 'landmark-fawtick-bayou-03', 'nutrient-fawtick-bayou-05', 'landmark-fawtick-bayou-04', 'nutrient-fawtick-bayou-06', 'landmark-fawtick-bayou-05', 'nutrient-fawtick-bayou-08', 'landmark-fawtick-bayou-06', 'nutrient-fawtick-bayou-09', 'landmark-fawtick-bayou-07', 'nutrient-fawtick-bayou-10', 'landmark-fawtick-bayou-08', 'landmark-fawtick-bayou-09', 'plate-fawtick-bayou-03', 'cave-caves-01'] },
            { name: '区間4', pins: ['cave-caves-01', 'plate-fawtick-bayou-04', 'mainquest-fawtick-bayou-03', 'nutrient-fawtick-bayou-11', 'plate-fawtick-bayou-05', 'plate-fawtick-bayou-06', 'landmark-fawtick-bayou-10', 'floodgate-floodgates-03','landmark-caviar-key-03', 'mainquest-caviar-key-05'] },
            { name: '区間5', pins: ['cave-caves-03', 'nutrient-caviar-key-02', 'plate-caviar-key-10', 'nutrient-caviar-key-01', 'grate-caviar-key-02', 'nutrient-caviar-key-04', 'grate-caviar-key-01', 'landmark-prosperity-sands-07', 'landmark-prosperity-sands-06', 'plate-prosperity-sands-03', 'nutrient-prosperity-sands-01', 'mainquest-prosperity-sands-04'] },
            { name: '区間6', pins: ['cave-caves-06', 'landmark-prosperity-sands-02', 'landmark-prosperity-sands-03', 'floodgate-floodgates-02', 'landmark-golden-shores-07', 'nutrient-golden-shores-15', 'plate-golden-shores-09', 'mainquest-golden-shores-05', 'cave-caves-06'] },
            { name: '区間7', pins: ['cave-caves-06', 'landmark-prosperity-sands-01', 'landmark-prosperity-sands-04', 'landmark-prosperity-sands-10', 'landmark-prosperity-sands-09', 'landmark-prosperity-sands-08', 'cave-caves-06'] },
            { name: '区間8', pins: ['cave-caves-06', 'landmark-prosperity-sands-05', 'floodgate-floodgates-01'] },
            { name: '区間9', pins: ['floodgate-floodgates-01', 'landmark-dead-horse-lake-09', 'landmark-dead-horse-lake-08', 'nutrient-dead-horse-lake-12', 'landmark-dead-horse-lake-10', 'landmark-dead-horse-lake-03', 'mainquest-dead-horse-lake-07'] },
            { name: '区間10', pins: ['cave-caves-04', 'landmark-dead-horse-lake-02', 'plate-dead-horse-lake-05', 'nutrient-dead-horse-lake-05', 'plate-dead-horse-lake-03', 'nutrient-dead-horse-lake-04', 'nutrient-dead-horse-lake-09', 'mainquest-dead-horse-lake-06', 'grate-dead-horse-lake-02', 'landmark-dead-horse-lake-01', 'nutrient-dead-horse-lake-03', 'mainquest-dead-horse-lake-04', 'cave-caves-04'] },
            { name: '区間11', pins: ['cave-caves-04', 'nutrient-dead-horse-lake-06', 'landmark-dead-horse-lake-04', 'landmark-dead-horse-lake-05', 'mainquest-dead-horse-lake-08', 'plate-dead-horse-lake-07', 'nutrient-dead-horse-lake-08', '1774492587495', 'grate-dead-horse-lake-07', 'plate-dead-horse-lake-08', 'mainquest-dead-horse-lake-09', 'grate-dead-horse-lake-08', 'landmark-dead-horse-lake-06', 'manhunt-dead-horse-lake-04', 'nutrient-dead-horse-lake-10', 'plate-dead-horse-lake-09', 'landmark-dead-horse-lake-07', 'nutrient-dead-horse-lake-11', 'manhunt-dead-horse-lake-05', '1774492618514', 'cave-caves-04'] },
            { name: '区間12', pins: ['cave-caves-04', 'mainquest-dead-horse-lake-05', 'cave-caves-04'] },
            { name: '区間13', pins: ['cave-caves-04', 'manhunt-dead-horse-lake-03', '1774438480957', 'nutrient-dead-horse-lake-13', 'mainquest-dead-horse-lake-11', 'mainquest-dead-horse-lake-10', 'subquest-dead-horse-lake-06', 'manhunt-dead-horse-lake-06', 'plate-dead-horse-lake-04'] },
            { name: '区間14', pins: ['plate-dead-horse-lake-04', 'cave-caves-01'] },
            { name: '区間15', pins: ['cave-caves-01', 'mainquest-fawtick-bayou-05', 'plate-fawtick-bayou-01', 'subquest-fawtick-bayou-03', 'nutrient-fawtick-bayou-12', 'mainquest-fawtick-bayou-06', 'plate-fawtick-bayou-07', 'grate-fawtick-bayou-01', 'nutrient-fawtick-bayou-13', 'grate-fawtick-bayou-01', 'mainquest-fawtick-bayou-07', 'subquest-fawtick-bayou-04', 'grate-fawtick-bayou-02', 'plate-fawtick-bayou-08', 'nutrient-fawtick-bayou-14', 'plate-fawtick-bayou-09', 'nutrient-fawtick-bayou-15', 'nutrient-fawtick-bayou-07', 'grate-fawtick-bayou-04', 'plate-fawtick-bayou-02', 'subquest-fawtick-bayou-02', 'nutrient-fawtick-bayou-16', 'grate-fawtick-bayou-06', 'nutrient-fawtick-bayou-17', 'grate-fawtick-bayou-06', 'subquest-fawtick-bayou-01', 'plate-fawtick-bayou-10'] },
            { name: '区間16', pins: ['plate-fawtick-bayou-10', 'cave-caves-05'] },
            { name: '区間17', pins: ['cave-caves-05', 'plate-golden-shores-06', 'landmark-golden-shores-06', 'nutrient-golden-shores-13', 'plate-golden-shores-04', 'mainquest-golden-shores-10', 'landmark-golden-shores-05', 'landmark-golden-shores-04', 'nutrient-golden-shores-08', 'landmark-golden-shores-03', 'grate-golden-shores-01', 'nutrient-golden-shores-06', 'nutrient-golden-shores-04', 'mainquest-golden-shores-09', 'grate-golden-shores-01', 'nutrient-golden-shores-03', 'plate-golden-shores-02', 'nutrient-golden-shores-02', 'nutrient-golden-shores-01', 'landmark-golden-shores-01', 'plate-golden-shores-03', 'mainquest-golden-shores-07', 'manhunt-golden-shores-03', 'plate-golden-shores-01', 'mainquest-golden-shores-06', 'nutrient-golden-shores-05', 'landmark-golden-shores-02', 'nutrient-golden-shores-07', 'manhunt-golden-shores-04', 'plate-golden-shores-05', 'subquest-golden-shores-06', 'nutrient-golden-shores-12', 'grate-golden-shores-09', 'nutrient-golden-shores-11', 'grate-golden-shores-09', 'plate-golden-shores-08', 'mainquest-golden-shores-04', 'cave-caves-05'] },
            { name: '区間18', pins: ['cave-caves-05', 'nutrient-golden-shores-10', 'grate-golden-shores-07', 'nutrient-golden-shores-09', 'grate-golden-shores-06', 'subquest-golden-shores-04', 'mainquest-golden-shores-08', 'mainquest-golden-shores-11', 'grate-golden-shores-02', 'subquest-golden-shores-03', 'cave-caves-05'] },
            { name: '区間19', pins: ['cave-caves-05', 'manhunt-golden-shores-06', 'nutrient-golden-shores-16', 'plate-golden-shores-10', 'nutrient-golden-shores-17', 'manhunt-golden-shores-05', 'subquest-golden-shores-05', 'landmark-golden-shores-08'] },
            { name: '区間20', pins: ['landmark-golden-shores-08', 'nutrient-sapphire-bay-01', 'nutrient-sapphire-bay-02', 'landmark-sapphire-bay-01', 'plate-sapphire-bay-01', 'landmark-sapphire-bay-03', 'landmark-sapphire-bay-02', 'nutrient-sapphire-bay-05', 'nutrient-sapphire-bay-12', 'nutrient-sapphire-bay-11', 'mainquest-sapphire-bay-09'] },
            { name: '区間21', pins: ['cave-caves-07', 'grate-sapphire-bay-03', 'nutrient-sapphire-bay-10', 'nutrient-sapphire-bay-09', 'grate-sapphire-bay-03', 'landmark-sapphire-bay-04', 'plate-sapphire-bay-06', 'nutrient-sapphire-bay-08', 'mainquest-sapphire-bay-07', 'subquest-sapphire-bay-03', 'mainquest-sapphire-bay-06', 'grate-sapphire-bay-02', 'nutrient-sapphire-bay-06', 'nutrient-sapphire-bay-07', 'cave-caves-07'] },
            { name: '区間22', pins: ['cave-caves-07', 'landmark-sapphire-bay-05', 'mainquest-sapphire-bay-11', 'mainquest-sapphire-bay-05', 'plate-sapphire-bay-04', '1774495660352', 'nutrient-sapphire-bay-03', 'nutrient-sapphire-bay-19', 'plate-sapphire-bay-10', 'mainquest-sapphire-bay-13', 'subquest-sapphire-bay-05', 'nutrient-sapphire-bay-18', 'landmark-sapphire-bay-08', 'nutrient-sapphire-bay-16', 'nutrient-sapphire-bay-17', 'subquest-sapphire-bay-06', 'mainquest-sapphire-bay-12', 'nutrient-sapphire-bay-15', 'landmark-sapphire-bay-07', 'manhunt-sapphire-bay-04', '1774495703636', 'plate-sapphire-bay-09', 'landmark-sapphire-bay-06', 'plate-sapphire-bay-08', 'nutrient-sapphire-bay-14', 'manhunt-sapphire-bay-03'] },
            { name: '区間23', pins: ['manhunt-sapphire-bay-03', 'mainquest-sapphire-bay-11', 'grate-sapphire-bay-04', 'plate-sapphire-bay-07', 'nutrient-sapphire-bay-13', 'grate-sapphire-bay-04', 'mainquest-sapphire-bay-08', 'mainquest-sapphire-bay-10'] },
            { name: '区間24', pins: ['mainquest-sapphire-bay-10', 'cave-caves-06'] },
            { name: '区間25', pins: ['cave-caves-06', 'plate-prosperity-sands-01', 'nutrient-prosperity-sands-06', 'plate-prosperity-sands-09', 'grate-prosperity-sands-05', 'nutrient-prosperity-sands-12', 'nutrient-prosperity-sands-11', 'nutrient-prosperity-sands-10', 'grate-gulf-01', 'landmark-gulf-04', 'nutrient-prosperity-sands-07', 'mainquest-prosperity-sands-06', 'nutrient-prosperity-sands-08', 'mainquest-prosperity-sands-07', '1774496908078', 'plate-prosperity-sands-10', 'nutrient-prosperity-sands-09'] },
            { name: '区間26', pins: ['nutrient-prosperity-sands-09', 'grate-gulf-05', 'nutrient-gulf-05', 'nutrient-gulf-04', 'nutrient-gulf-03', 'grate-gulf-07', 'plate-gulf-03', 'grate-gulf-06', 'nutrient-gulf-06'] },
            { name: '区間27', pins: ['nutrient-gulf-06', 'cave-caves-06'] },
            { name: '区間28', pins: ['cave-caves-06', 'manhunt-prosperity-sands-03', 'mainquest-prosperity-sands-03', 'mainquest-prosperity-sands-02', 'grate-prosperity-sands-01', 'nutrient-prosperity-sands-02', 'plate-prosperity-sands-08', 'nutrient-prosperity-sands-03', 'grate-prosperity-sands-02', 'subquest-prosperity-sands-03', 'plate-prosperity-sands-02', 'manhunt-prosperity-sands-06', 'grate-prosperity-sands-03', 'plate-prosperity-sands-04', 'nutrient-prosperity-sands-04', 'subquest-prosperity-sands-04', 'nutrient-prosperity-sands-05', 'plate-prosperity-sands-05', 'grate-prosperity-sands-04', 'manhunt-prosperity-sands-05', 'mainquest-prosperity-sands-05', 'plate-caviar-key-07', 'plate-prosperity-sands-06', 'subquest-prosperity-sands-05', 'mainquest-prosperity-sands-09', 'mainquest-prosperity-sands-08', 'subquest-prosperity-sands-06', 'manhunt-prosperity-sands-04', 'plate-prosperity-sands-07', 'nutrient-caviar-key-10'] },
            { name: '区間29', pins: ['nutrient-caviar-key-10', 'mainquest-gulf-09', 'nutrient-gulf-16', 'landmark-gulf-05', 'mainquest-caviar-key-10', 'landmark-caviar-key-06', 'nutrient-caviar-key-09', 'mainquest-caviar-key-08', '1774497662302', 'plate-caviar-key-08', 'grate-caviar-key-08', 'nutrient-caviar-key-08', 'nutrient-caviar-key-07', 'landmark-caviar-key-04', 'grate-caviar-key-07', 'mainquest-caviar-key-07', 'nutrient-caviar-key-06', 'plate-caviar-key-05', 'landmark-caviar-key-08', 'manhunt-caviar-key-03', 'grate-caviar-key-06', 'nutrient-caviar-key-05', 'nutrient-caviar-key-12'] },
            { name: '区間30', pins: ['nutrient-caviar-key-12', 'cave-caves-02'] },
            { name: '区間31', pins: ['cave-caves-02', 'plate-crawfish-bay-01', 'nutrient-crawfish-bay-03', 'plate-crawfish-bay-03', 'plate-crawfish-bay-02', 'nutrient-crawfish-bay-01', 'nutrient-crawfish-bay-02', 'nutrient-crawfish-bay-04', 'plate-crawfish-bay-04', 'nutrient-crawfish-bay-10', 'plate-crawfish-bay-06', 'nutrient-crawfish-bay-05', 'plate-crawfish-bay-07', 'nutrient-crawfish-bay-09', 'plate-crawfish-bay-10', 'plate-crawfish-bay-09', 'nutrient-crawfish-bay-07', 'plate-crawfish-bay-08', 'grate-crawfish-bay-03', 'nutrient-crawfish-bay-08', 'nutrient-crawfish-bay-06', 'grate-crawfish-bay-02', 'plate-crawfish-bay-05'] },
            { name: '区間32', pins: ['plate-crawfish-bay-05', 'cave-caves-03'] },
            { name: '区間33', pins: ['cave-caves-03', 'subquest-caviar-key-03', 'plate-caviar-key-02', 'subquest-caviar-key-01', 'grate-caviar-key-03', 'nutrient-caviar-key-03', 'grate-caviar-key-03', 'plate-caviar-key-01', 'mainquest-caviar-key-04', 'manhunt-caviar-key-02', 'subquest-caviar-key-02', 'landmark-caviar-key-01', 'manhunt-caviar-key-01', 'landmark-caviar-key-02', 'plate-caviar-key-03', 'plate-caviar-key-04', 'mainquest-caviar-key-06', 'grate-caviar-key-04', 'nutrient-caviar-key-13', 'plate-caviar-key-06', 'grate-caviar-key-09', 'landmark-caviar-key-05', 'mainquest-caviar-key-09', 'cave-caves-08'] },
            { name: '区間34', pins: ['cave-caves-08', 'landmark-gulf-01', 'nutrient-gulf-02', 'plate-gulf-01', 'plate-gulf-02', 'nutrient-gulf-14', 'nutrient-gulf-15', 'plate-gulf-06', 'mainquest-gulf-14', 'mainquest-gulf-15', 'cave-caves-08'] },
            { name: '区間35', pins: ['cave-caves-08', 'nutrient-gulf-01', 'mainquest-gulf-10', 'plate-gulf-08', 'mainquest-gulf-12', 'landmark-gulf-08', 'nutrient-gulf-18', 'landmark-gulf-07', 'landmark-caviar-key-07', 'manhunt-caviar-key-04', 'plate-caviar-key-09', 'nutrient-caviar-key-11', 'subquest-caviar-key-04', 'grate-caviar-key-10', 'nutrient-gulf-17', 'manhunt-gulf-01', 'landmark-gulf-06', 'nutrient-gulf-19', 'plate-gulf-09', 'nutrient-gulf-20', 'grate-gulf-11', 'subquest-gulf-04', 'grate-gulf-10', 'nutrient-gulf-21', 'grate-gulf-13', 'mainquest-gulf-13', 'plate-gulf-10', 'landmark-gulf-09', 'cave-caves-08'] },
            { name: '区間36', pins: ['cave-caves-08', 'subquest-gulf-01', 'mainquest-gulf-17', 'manhunt-gulf-02', 'manhunt-gulf-03', 'plate-gulf-05', 'nutrient-gulf-12', 'grate-gulf-03', 'nutrient-gulf-13', 'plate-gulf-07', 'manhunt-gulf-04', 'subquest-gulf-03', 'grate-gulf-04', 'nutrient-gulf-11', 'grate-gulf-04', 'landmark-gulf-03', 'nutrient-gulf-09', 'plate-gulf-04', 'landmark-gulf-02', 'grate-gulf-08', 'nutrient-gulf-10', 'grate-gulf-08', 'subquest-gulf-02', 'nutrient-gulf-07', 'nutrient-gulf-08', 'cave-caves-08'] },
            { name: '区間37', pins: ['cave-caves-08', 'cave-caves-04'] },
            { name: '区間38', pins: ['cave-caves-04', 'plate-dead-horse-lake-06', 'subquest-dead-horse-lake-04', 'grate-dead-horse-lake-06', 'nutrient-dead-horse-lake-07', 'grate-dead-horse-lake-06', 'plate-dead-horse-lake-10', 'subquest-dead-horse-lake-05', 'grate-dead-horse-lake-07', 'grate-dead-horse-lake-09', 'nutrient-dead-horse-lake-14', 'cave-caves-04'] },
            { name: '区間39', pins: ['cave-caves-04', 'subquest-dead-horse-lake-03', 'plate-dead-horse-lake-01', 'grate-dead-horse-lake-03', 'plate-dead-horse-lake-02', 'nutrient-dead-horse-lake-02', 'grate-dead-horse-lake-04', 'nutrient-dead-horse-lake-01'] },
            { name: '区間40', pins: ['nutrient-dead-horse-lake-01', 'cave-caves-05'] },
            { name: '区間41', pins: ['cave-caves-05', 'grate-golden-shores-03', 'plate-golden-shores-07', 'grate-golden-shores-04', 'nutrient-golden-shores-14'] },
            { name: '区間42', pins: ['nutrient-golden-shores-14', 'cave-caves-07'] },
            { name: '区間43', pins: ['cave-caves-07', 'plate-sapphire-bay-05', 'manhunt-sapphire-bay-05', 'cave-caves-07'] },
            { name: '区間44', pins: ['cave-caves-07', 'subquest-sapphire-bay-04', 'plate-sapphire-bay-02', 'manhunt-sapphire-bay-06', 'plate-sapphire-bay-03', 'grate-sapphire-bay-05', 'nutrient-sapphire-bay-04'] },
            { name: '区間45', pins: ['nutrient-sapphire-bay-04', 'cave-caves-08'] },
            { name: '区間46', pins: ['cave-caves-08', 'mainquest-gulf-11', 'mainquest-gulf-16'] }
        ],
        customPins: [
            { id: '1774492587495', lat: 877.2307925872506, lng: 452.9420016100292, map: 'base', name: '悪名ランク2まで', type: 'infamy-1', title: '悪名ランク2まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-26T02:36:27.495Z', updatedAt: '2026-03-26T16:22:35.730Z', visibility: true },
            { id: '1774492618514', lat: 719.2638691127481, lng: 378.4633129789704, map: 'base', name: '悪名ランク3まで', type: 'infamy-1', title: '悪名ランク3まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-26T02:36:58.514Z', updatedAt: '2026-03-26T16:22:35.730Z', visibility: true },
            { id: '1774438480957', lat: 818.776900845104, lng: 464.4578063500829, map: 'base', name: '悪名ランク5まで', type: 'infamy-1', title: '悪名ランク5まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-25T11:34:40.957Z', updatedAt: '2026-03-26T16:22:35.730Z', visibility: true },
            { id: '1774495660352', lat: 347.5892856843336, lng: 270.77188348622826, map: 'base', name: '悪名ランク6まで', type: 'infamy-1', title: '悪名ランク6まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-26T03:27:40.352Z', updatedAt: '2026-03-26T16:22:35.730Z', visibility: true },
            { id: '1774495703636', lat: 232.52485973039768, lng: 202.6946476524816, map: 'base', name: '悪名ランク7まで', type: 'infamy-1', title: '悪名ランク7まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-26T03:28:23.636Z', updatedAt: '2026-03-26T16:22:35.730Z', visibility: true },
            { id: '1774496908078', lat: 319.77784289804544, lng: 463.71145359778757, map: 'base', name: '悪名ランク8まで', type: 'infamy-1', title: '悪名ランク8まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-26T03:48:28.078Z', updatedAt: '2026-03-26T16:22:35.730Z', visibility: true },
            { id: '1774497662302', lat: 477.768370032357, lng: 717.7035154704303, map: 'base', name: '悪名ランク10まで', type: 'infamy-1', title: '悪名ランク10まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-26T04:01:02.302Z', updatedAt: '2026-03-26T16:22:35.730Z', visibility: true }
        ]
    },
    {
        id: 'trend-100-base-game-dlc-standard',
        name: '100% Base game + DLC Standard',
        description: '',
        sections: [
            { name: '区間1', pins: ['mainquest-crawfish-bay-02', 'mainquest-crawfish-bay-01'] },
            { name: '区間2', pins: ['mainquest-fawtick-bayou-01', 'cave-caves-02', 'landmark-fawtick-bayou-01', 'nutrient-fawtick-bayou-01', 'mainquest-fawtick-bayou-08'] },
            { name: '区間3', pins: ['cave-caves-01', 'landmark-fawtick-bayou-02', 'nutrient-fawtick-bayou-02', 'mainquest-fawtick-bayou-04', 'nutrient-fawtick-bayou-03', 'nutrient-fawtick-bayou-04', 'landmark-fawtick-bayou-03', 'nutrient-fawtick-bayou-05', 'landmark-fawtick-bayou-04', 'nutrient-fawtick-bayou-06', 'landmark-fawtick-bayou-05', 'nutrient-fawtick-bayou-08', 'landmark-fawtick-bayou-06', 'nutrient-fawtick-bayou-09', 'landmark-fawtick-bayou-07', 'nutrient-fawtick-bayou-10', 'landmark-fawtick-bayou-08', 'landmark-fawtick-bayou-09', 'plate-fawtick-bayou-03', 'cave-caves-01'] },
            { name: '区間4', pins: ['cave-caves-01', 'plate-fawtick-bayou-04', 'mainquest-fawtick-bayou-03', 'nutrient-fawtick-bayou-11', 'plate-fawtick-bayou-05', 'plate-fawtick-bayou-06', 'landmark-fawtick-bayou-10', 'floodgate-floodgates-03', 'landmark-caviar-key-03', 'mainquest-caviar-key-05'] },
            { name: '区間5', pins: ['cave-caves-03', 'nutrient-caviar-key-02', 'plate-caviar-key-10', 'nutrient-caviar-key-01', 'grate-caviar-key-02', 'nutrient-caviar-key-04', 'grate-caviar-key-01', 'landmark-prosperity-sands-07', 'landmark-prosperity-sands-06', 'plate-prosperity-sands-03', 'nutrient-prosperity-sands-01', 'mainquest-prosperity-sands-04'] },
            { name: '区間6', pins: ['cave-caves-06', 'landmark-prosperity-sands-02', 'landmark-prosperity-sands-03', 'floodgate-floodgates-02', 'landmark-golden-shores-07', 'nutrient-golden-shores-15', 'plate-golden-shores-09', 'mainquest-golden-shores-05', 'cave-caves-06'] },
            { name: '区間7', pins: ['cave-caves-06', 'landmark-prosperity-sands-01', 'landmark-prosperity-sands-04', 'landmark-prosperity-sands-10', 'landmark-prosperity-sands-09', 'landmark-prosperity-sands-08', 'cave-caves-06'] },
            { name: '区間8', pins: ['cave-caves-06', 'landmark-prosperity-sands-05', 'floodgate-floodgates-01'] },
            { name: '区間9', pins: ['floodgate-floodgates-01', 'landmark-dead-horse-lake-09', 'landmark-dead-horse-lake-08', 'nutrient-dead-horse-lake-12', 'landmark-dead-horse-lake-10', 'landmark-dead-horse-lake-03', 'mainquest-dead-horse-lake-07'] },
            { name: '区間10', pins: ['cave-caves-04', 'landmark-dead-horse-lake-02', 'plate-dead-horse-lake-05', 'nutrient-dead-horse-lake-05', 'plate-dead-horse-lake-03', 'nutrient-dead-horse-lake-04', 'nutrient-dead-horse-lake-09', 'mainquest-dead-horse-lake-06', 'grate-dead-horse-lake-02', 'landmark-dead-horse-lake-01', 'nutrient-dead-horse-lake-03', 'mainquest-dead-horse-lake-04', 'cave-caves-04'] },
            { name: '区間11', pins: ['cave-caves-04', 'nutrient-dead-horse-lake-06', 'landmark-dead-horse-lake-04', 'landmark-dead-horse-lake-05', 'mainquest-dead-horse-lake-08', '1774492587495', 'grate-dead-horse-lake-07', 'plate-dead-horse-lake-08', 'mainquest-dead-horse-lake-09', 'grate-dead-horse-lake-08', 'landmark-dead-horse-lake-06', 'manhunt-dead-horse-lake-04', 'nutrient-dead-horse-lake-10', 'plate-dead-horse-lake-09', 'landmark-dead-horse-lake-07', 'nutrient-dead-horse-lake-11', 'manhunt-dead-horse-lake-05', '1774492618514', 'cave-caves-04'] },
            { name: '区間12', pins: ['cave-caves-04', 'mainquest-dead-horse-lake-05', 'cave-caves-04'] },
            { name: '区間13', pins: ['cave-caves-04', 'manhunt-dead-horse-lake-03', '1774438480957', 'nutrient-dead-horse-lake-13', 'mainquest-dead-horse-lake-11', 'mainquest-dead-horse-lake-10'] },
            { name: '区間14', pins: ['mainquest-dead-horse-lake-10', 'cave-caves-01'] },
            { name: '区間15', pins: ['cave-caves-01', 'mainquest-fawtick-bayou-05', 'plate-fawtick-bayou-01', 'subquest-fawtick-bayou-03', 'nutrient-fawtick-bayou-12', 'mainquest-fawtick-bayou-06', 'plate-fawtick-bayou-07', 'grate-fawtick-bayou-01', 'nutrient-fawtick-bayou-13', 'grate-fawtick-bayou-01', 'mainquest-fawtick-bayou-07', 'subquest-fawtick-bayou-04', 'grate-fawtick-bayou-02', 'plate-fawtick-bayou-08', 'nutrient-fawtick-bayou-14', 'plate-fawtick-bayou-09', 'nutrient-fawtick-bayou-15', 'nutrient-fawtick-bayou-07', 'grate-fawtick-bayou-04', 'plate-fawtick-bayou-02', 'subquest-fawtick-bayou-02', 'nutrient-fawtick-bayou-16', 'grate-fawtick-bayou-06', 'nutrient-fawtick-bayou-17', 'grate-fawtick-bayou-06', 'subquest-fawtick-bayou-01', 'plate-fawtick-bayou-10'] },
            { name: '区間16', pins: ['plate-fawtick-bayou-10', 'cave-caves-05'] },
            { name: '区間17', pins: ['cave-caves-05', 'plate-golden-shores-06', 'landmark-golden-shores-06', 'nutrient-golden-shores-13', 'plate-golden-shores-04', 'mainquest-golden-shores-10', 'landmark-golden-shores-05', 'landmark-golden-shores-04', 'nutrient-golden-shores-08', 'landmark-golden-shores-03', 'grate-golden-shores-01', 'nutrient-golden-shores-06', 'nutrient-golden-shores-04', 'mainquest-golden-shores-09', 'grate-golden-shores-01', 'nutrient-golden-shores-03', 'plate-golden-shores-02', 'nutrient-golden-shores-02', 'nutrient-golden-shores-01', 'landmark-golden-shores-01', 'plate-golden-shores-03', 'mainquest-golden-shores-07', 'mainquest-golden-shores-06', 'nutrient-golden-shores-05', 'landmark-golden-shores-02', 'nutrient-golden-shores-07', 'manhunt-golden-shores-04', 'plate-golden-shores-05', 'subquest-golden-shores-06', 'nutrient-golden-shores-12', 'grate-golden-shores-09', 'nutrient-golden-shores-11', 'grate-golden-shores-09', 'plate-golden-shores-08', 'mainquest-golden-shores-04', 'cave-caves-05'] },
            { name: '区間18', pins: ['cave-caves-05', 'nutrient-golden-shores-10', 'mainquest-golden-shores-08', 'mainquest-golden-shores-11', 'manhunt-golden-shores-05', 'manhunt-golden-shores-06', 'nutrient-golden-shores-16', 'plate-golden-shores-10', 'nutrient-golden-shores-17', 'subquest-golden-shores-05', 'landmark-golden-shores-08'] },
            { name: '区間19', pins: ['landmark-golden-shores-08', 'nutrient-sapphire-bay-01', 'nutrient-sapphire-bay-02', 'landmark-sapphire-bay-01', 'plate-sapphire-bay-01', 'manhunt-sapphire-bay-06', 'landmark-sapphire-bay-03', 'landmark-sapphire-bay-02', 'nutrient-sapphire-bay-05', 'nutrient-sapphire-bay-12', 'nutrient-sapphire-bay-11', 'mainquest-sapphire-bay-09'] },
            { name: '区間20', pins: ['cave-caves-07', 'grate-sapphire-bay-03', 'nutrient-sapphire-bay-10', 'nutrient-sapphire-bay-09', 'grate-sapphire-bay-03', 'landmark-sapphire-bay-04', 'nutrient-sapphire-bay-08', 'mainquest-sapphire-bay-07', 'mainquest-sapphire-bay-06', 'grate-sapphire-bay-02', 'subquest-sapphire-bay-03', 'nutrient-sapphire-bay-06', 'nutrient-sapphire-bay-07', 'cave-caves-07'] },
            { name: '区間21', pins: ['cave-caves-07', 'landmark-sapphire-bay-05', 'mainquest-sapphire-bay-05', 'plate-sapphire-bay-04', 'nutrient-sapphire-bay-03', 'nutrient-sapphire-bay-19', 'plate-sapphire-bay-10', 'mainquest-sapphire-bay-13', 'nutrient-sapphire-bay-18', 'subquest-sapphire-bay-05', 'landmark-sapphire-bay-08', 'nutrient-sapphire-bay-16', 'nutrient-sapphire-bay-17', 'subquest-sapphire-bay-06', 'mainquest-sapphire-bay-12', 'landmark-sapphire-bay-07', 'plate-sapphire-bay-09', 'manhunt-sapphire-bay-04', 'landmark-sapphire-bay-06', 'plate-sapphire-bay-08', 'manhunt-sapphire-bay-03'] },
            { name: '区間22', pins: ['manhunt-sapphire-bay-03', 'mainquest-sapphire-bay-11', 'grate-sapphire-bay-04', 'plate-sapphire-bay-07', 'nutrient-sapphire-bay-13', 'grate-sapphire-bay-04', 'mainquest-sapphire-bay-08', 'mainquest-sapphire-bay-10'] },
            { name: '区間23', pins: ['mainquest-sapphire-bay-10', 'cave-caves-06'] },
            { name: '区間24', pins: ['cave-caves-06', 'plate-prosperity-sands-01', 'nutrient-prosperity-sands-06', 'plate-prosperity-sands-09', 'grate-prosperity-sands-05', 'nutrient-prosperity-sands-12', 'nutrient-prosperity-sands-11', 'nutrient-prosperity-sands-10', 'grate-gulf-01', 'landmark-gulf-04', 'nutrient-prosperity-sands-07', 'mainquest-prosperity-sands-06', 'nutrient-prosperity-sands-08', 'mainquest-prosperity-sands-07', 'plate-prosperity-sands-10', 'nutrient-prosperity-sands-09', 'grate-gulf-05', 'nutrient-gulf-05', 'nutrient-gulf-04', 'nutrient-gulf-03', 'grate-gulf-07', 'nutrient-gulf-06', 'plate-gulf-03', 'grate-gulf-06', 'cave-caves-06'] },
            { name: '区間25', pins: ['cave-caves-06', 'mainquest-prosperity-sands-03', 'mainquest-prosperity-sands-02', 'grate-prosperity-sands-01', 'nutrient-prosperity-sands-02', 'plate-prosperity-sands-08', 'nutrient-prosperity-sands-03', 'grate-prosperity-sands-02', 'manhunt-prosperity-sands-06', 'grate-prosperity-sands-03', 'plate-prosperity-sands-04', 'nutrient-prosperity-sands-04', 'subquest-prosperity-sands-04', 'nutrient-prosperity-sands-05', 'plate-prosperity-sands-05', 'grate-prosperity-sands-04', 'manhunt-prosperity-sands-05', 'mainquest-prosperity-sands-05', 'plate-caviar-key-07', 'plate-prosperity-sands-06', 'subquest-prosperity-sands-05', 'mainquest-prosperity-sands-09', 'mainquest-prosperity-sands-08', 'manhunt-prosperity-sands-04', 'plate-prosperity-sands-07', 'nutrient-caviar-key-10'] },
            { name: '区間26', pins: ['nutrient-caviar-key-10', 'mainquest-gulf-09', 'mainquest-caviar-key-10', 'landmark-caviar-key-06', 'nutrient-caviar-key-09', 'mainquest-caviar-key-08', '1774438939681', 'plate-caviar-key-08', 'grate-caviar-key-08', 'nutrient-caviar-key-08', 'nutrient-caviar-key-07', 'landmark-caviar-key-04', 'grate-caviar-key-07', 'mainquest-caviar-key-07', 'nutrient-caviar-key-06', 'plate-caviar-key-05', 'landmark-caviar-key-08', 'grate-caviar-key-06', 'manhunt-caviar-key-03', 'nutrient-caviar-key-05', 'nutrient-caviar-key-12', 'grate-caviar-key-06'] },
            { name: '区間27', pins: ['grate-caviar-key-06', 'subquest-caviar-key-03', 'cave-caves-08'] },
            { name: '区間28', pins: ['cave-caves-08', 'cave-caves-03'] },
            { name: '区間29', pins: ['cave-caves-03', 'plate-caviar-key-02', 'subquest-caviar-key-01', 'grate-caviar-key-03', 'nutrient-caviar-key-03', 'grate-caviar-key-03', 'landmark-caviar-key-02', 'plate-caviar-key-03', 'plate-caviar-key-01', 'mainquest-caviar-key-04', 'subquest-caviar-key-02', 'landmark-caviar-key-01', 'manhunt-caviar-key-02', 'plate-caviar-key-04', 'mainquest-caviar-key-06', 'grate-caviar-key-04', 'nutrient-caviar-key-13', 'plate-caviar-key-06', 'grate-caviar-key-09', 'landmark-caviar-key-05', 'mainquest-caviar-key-09', 'cave-caves-08'] },
            { name: '区間30', pins: ['cave-caves-08', 'landmark-gulf-01', 'nutrient-gulf-02', 'plate-gulf-01', 'plate-gulf-02', 'nutrient-gulf-14', 'nutrient-gulf-15', 'plate-gulf-06', 'mainquest-gulf-14', 'mainquest-gulf-15', 'cave-caves-08'] },
            { name: '区間31', pins: ['cave-caves-08', 'nutrient-gulf-01', 'mainquest-gulf-10', 'plate-gulf-08', 'mainquest-gulf-12', 'nutrient-gulf-18', 'landmark-gulf-07', 'landmark-caviar-key-07', 'manhunt-caviar-key-04', 'plate-caviar-key-09', 'grate-caviar-key-10', 'nutrient-gulf-17', 'manhunt-gulf-01', 'landmark-gulf-06', 'nutrient-gulf-19', 'plate-gulf-09', 'nutrient-gulf-20', 'grate-gulf-11', 'subquest-gulf-04', 'grate-gulf-10', 'nutrient-gulf-21', 'grate-gulf-13', 'mainquest-gulf-13', 'plate-gulf-10', 'landmark-gulf-09', 'cave-caves-08'] },
            { name: '区間32', pins: ['cave-caves-08', 'mainquest-gulf-17', 'cave-caves-08'] },
            { name: '区間33', pins: ['cave-caves-08', 'mainquest-gulf-11', 'mainquest-gulf-16'] },
            { name: '区間34', pins: ['cave-caves-08', 'mainquest-gulf-05', 'mainquest-gulf-06', 'nutrient-gulf-16', 'landmark-gulf-05', 'mainquest-gulf-07', 'nutrient-caviar-key-11', 'subquest-caviar-key-04', 'mainquest-caviar-key-01', 'landmark-gulf-08', 'mainquest-gulf-08'] },
            { name: '区間35', pins: ['landmark-plover-island-02', 'mainquest-plover-island-16', 'mainquest-plover-island-04'] },
            { name: '区間36', pins: ['cave-plover-island-01', 'nutrient-plover-island-02', 'mainquest-plover-island-08', 'mainquest-plover-island-10', '1774603005698', 'mainquest-plover-island-14', 'mainquest-plover-island-12', 'mainquest-plover-island-13', 'nutrient-plover-island-04', 'mainquest-plover-island-06', 'mainquest-plover-island-01', 'nutrient-plover-island-08', 'grate-plover-island-03', 'nutrient-plover-island-03', 'landmark-plover-island-04', 'nutrient-plover-island-05', '1774603224302'] },
            { name: '区間37', pins: ['cave-caves-08', 'subquest-gulf-01', 'manhunt-gulf-02', '1774687002666', 'cave-caves-08', '1774687047389'] },
            { name: '区間38', pins: ['1774687073277', 'mainquest-plover-island-02', 'nutrient-plover-island-10', 'grate-plover-island-01', 'nutrient-plover-island-09', 'grate-plover-island-01', 'mainquest-plover-island-07', 'plate-plover-island-03', 'plate-plover-island-04', 'mainquest-plover-island-11', 'plate-plover-island-06', 'quest-plover-island-03', 'landmark-plover-island-05', 'plate-plover-island-09', '1774687227858', 'mainquest-plover-island-15', 'landmark-plover-island-06', 'plate-plover-island-10', 'nutrient-plover-island-06', 'grate-plover-island-04', 'nutrient-plover-island-07', 'grate-plover-island-04', 'mainquest-plover-island-09', 'landmark-plover-island-01', 'manhunt-plover-island-01', 'plate-plover-island-05', 'quest-plover-island-01', 'plate-plover-island-01', 'mainquest-plover-island-05', 'cave-plover-island-01'] },
            { name: '区間39', pins: ['cave-plover-island-01', 'manhunt-plover-island-02', 'plate-plover-island-07', 'subquest-plover-island-02', '1774687517302', 'mainquest-plover-island-03', 'timetrial-plover-island-02', 'landmark-plover-island-03', 'nutrient-plover-island-01', '1774687571073', 'plate-plover-island-02', 'timetrial-plover-island-01', '1774687602636', 'plate-plover-island-08', 'quest-plover-island-02', 'subquest-plover-island-01'] },
            { name: '区間40', pins: ['subquest-plover-island-01', 'mainquest-plover-island-17'] },
            { name: '区間41', pins: ['cave-caves-08', 'quest-gulf-01', 'mainquest-gulf-01', 'manhunt-gulf-03', 'plate-gulf-05', 'nutrient-gulf-12', 'grate-gulf-03', 'nutrient-gulf-13', 'grate-gulf-03', 'plate-gulf-07', 'manhunt-gulf-04', 'subquest-gulf-03', 'grate-gulf-04', 'nutrient-gulf-11', 'grate-gulf-04', 'landmark-gulf-03', 'mainquest-gulf-02', 'nutrient-gulf-09', 'plate-gulf-04', 'landmark-gulf-02', 'grate-gulf-08', 'nutrient-gulf-10', 'grate-gulf-08', 'subquest-gulf-02', 'nutrient-gulf-07', 'nutrient-gulf-08'] },
            { name: '区間42', pins: ['nutrient-gulf-08', 'mainquest-sapphire-bay-01', 'subquest-sapphire-bay-01', 'timetrial-sapphire-bay-01', 'nutrient-sapphire-bay-14', 'mainquest-sapphire-bay-02', 'nutrient-sapphire-bay-15', '1774687783113', 'cave-caves-07'] },
            { name: '区間43', pins: ['cave-caves-07', 'quest-sapphire-bay-01', 'subquest-sapphire-bay-04', 'manhunt-sapphire-bay-06', 'mainquest-sapphire-bay-03', 'timetrial-sapphire-bay-02', 'plate-sapphire-bay-02', '1774687915243', 'plate-sapphire-bay-03', 'grate-sapphire-bay-05', 'nutrient-sapphire-bay-04', 'grate-sapphire-bay-05', 'manhunt-sapphire-bay-01', 'cave-caves-07'] },
            { name: '区間44', pins: ['cave-caves-07', 'plate-sapphire-bay-06', 'manhunt-sapphire-bay-02', 'mainquest-sapphire-bay-04', 'manhunt-sapphire-bay-05', 'plate-sapphire-bay-05'] },
            { name: '区間45', pins: ['plate-sapphire-bay-05', 'cave-caves-05'] },
            { name: '区間46', pins: ['cave-caves-05', 'grate-golden-shores-07', 'nutrient-golden-shores-09', 'grate-golden-shores-06', 'mainquest-golden-shores-01', 'subquest-golden-shores-04', 'mainquest-golden-shores-02', 'mainquest-golden-shores-03', 'manhunt-golden-shores-02', 'cave-caves-05'] },
            { name: '区間47', pins: ['cave-caves-05', 'subquest-golden-shores-02', 'timetrial-golden-shores-02', '1774688198210', 'timetrial-golden-shores-01', 'subquest-golden-shores-01', '1774688244619', 'grate-golden-shores-03', 'plate-golden-shores-07', 'grate-golden-shores-04', 'nutrient-golden-shores-14', 'grate-golden-shores-04', 'grate-golden-shores-03', 'manhunt-golden-shores-01', 'grate-golden-shores-02', 'subquest-golden-shores-03', 'grate-golden-shores-02', 'manhunt-golden-shores-03', 'quest-golden-shores-01', 'plate-golden-shores-01'] },
            { name: '区間48', pins: ['plate-golden-shores-01', 'mainquest-dead-horse-lake-01', 'subquest-dead-horse-lake-06', 'mainquest-dead-horse-lake-02', 'mainquest-dead-horse-lake-03', 'subquest-dead-horse-lake-01', 'manhunt-dead-horse-lake-06', 'timetrial-dead-horse-lake-01', 'plate-dead-horse-lake-04', 'manhunt-dead-horse-lake-02', '1774688537850', 'floodgate-floodgates-01'] },
            { name: '区間49', pins: ['floodgate-floodgates-01', 'mainquest-caviar-key-02', 'quest-caviar-key-01', 'manhunt-caviar-key-01', 'mainquest-caviar-key-03', 'manhunt-prosperity-sands-02', 'quest-prosperity-sands-01', 'timetrial-prosperity-sands-01', 'plate-prosperity-sands-02', 'subquest-prosperity-sands-03', 'mainquest-prosperity-sands-01', '1774688641629', 'subquest-prosperity-sands-02', 'timetrial-prosperity-sands-02', '1774688766419', 'subquest-prosperity-sands-06', 'cave-caves-06'] },
            { name: '区間50', pins: ['cave-caves-06', 'manhunt-prosperity-sands-03', 'subquest-prosperity-sands-01', 'manhunt-prosperity-sands-01', 'cave-caves-06'] },
            { name: '区間51', pins: ['cave-caves-06', 'cave-caves-07'] },
            { name: '区間52', pins: ['cave-caves-07', 'subquest-sapphire-bay-02', 'cave-caves-07'] },
            { name: '区間53', pins: ['cave-caves-07', 'cave-caves-04'] },
            { name: '区間54', pins: ['cave-caves-04', 'plate-dead-horse-lake-06', 'timetrial-dead-horse-lake-02', 'grate-dead-horse-lake-06', 'nutrient-dead-horse-lake-07', 'grate-dead-horse-lake-06', 'plate-dead-horse-lake-07', 'nutrient-dead-horse-lake-08', '1774688957863', 'plate-dead-horse-lake-10', 'subquest-dead-horse-lake-05', 'manhunt-dead-horse-lake-01', 'subquest-dead-horse-lake-02', 'grate-dead-horse-lake-07', 'grate-dead-horse-lake-09', 'nutrient-dead-horse-lake-14', 'cave-caves-04'] },
            { name: '区間55', pins: ['cave-caves-04', 'subquest-dead-horse-lake-04', 'subquest-dead-horse-lake-03', 'quest-dead-horse-lake-01', 'plate-dead-horse-lake-01', 'grate-dead-horse-lake-03', 'plate-dead-horse-lake-02', 'nutrient-dead-horse-lake-02', 'grate-dead-horse-lake-04', 'nutrient-dead-horse-lake-01', 'cave-caves-04'] },
            { name: '区間56', pins: ['cave-caves-04', 'cave-caves-01'] },
            { name: '区間57', pins: ['cave-caves-01', 'quest-fawtick-bayou-01', 'cave-caves-01'] },
            { name: '区間58', pins: ['cave-caves-01', 'cave-caves-02'] },
            { name: '区間59', pins: ['cave-caves-02', 'plate-crawfish-bay-01', 'nutrient-crawfish-bay-03', 'plate-crawfish-bay-03', 'plate-crawfish-bay-02', 'nutrient-crawfish-bay-01', 'nutrient-crawfish-bay-02', 'nutrient-crawfish-bay-04', 'plate-crawfish-bay-04', 'nutrient-crawfish-bay-10', 'plate-crawfish-bay-06', 'nutrient-crawfish-bay-05', 'plate-crawfish-bay-07', 'nutrient-crawfish-bay-09', 'plate-crawfish-bay-10', 'plate-crawfish-bay-09', 'nutrient-crawfish-bay-07', 'plate-crawfish-bay-08', 'grate-crawfish-bay-03', 'nutrient-crawfish-bay-08', 'nutrient-crawfish-bay-06', 'grate-crawfish-bay-02', 'plate-crawfish-bay-05', 'cave-caves-02'] },
            { name: '区間60', pins: ['cave-caves-02', 'cave-caves-08', 'mainquest-gulf-03', 'mainquest-gulf-04'] }
        ],
        customPins: [
            { id: '1774492587495', lat: 877.2307925872506, lng: 452.9420016100292, map: 'base', name: '悪名ランク2まで', type: 'infamy-1', title: '悪名ランク2まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-26T02:36:27.495Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774492618514', lat: 719.2638691127481, lng: 378.4633129789704, map: 'base', name: '悪名ランク3まで', type: 'infamy-1', title: '悪名ランク3まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-26T02:36:58.514Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774438480957', lat: 818.776900845104, lng: 464.4578063500829, map: 'base', name: '悪名ランク5まで', type: 'infamy-1', title: '悪名ランク5まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-25T11:34:40.957Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774438939681', lat: 478.0184747049061, lng: 711.6519533999383, map: 'base', name: '悪名ランク6まで', type: 'infamy-1', title: '悪名ランク6まで', detail: '', userId: null, obtained: true, createdAt: '2026-03-25T11:42:19.681Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774603005698', lat: 841.0389381882437, lng: 198.73797028254876, map: 'dlc', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-27T09:16:45.698Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774603224302', lat: 894.9494431588123, lng: 852.2964692751455, map: 'dlc', name: '湾岸の洞窟へ', type: 'cave', title: '湾岸の洞窟へ', detail: '', userId: null, obtained: true, createdAt: '2026-03-27T09:20:24.302Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687002666', lat: 379.2691027402003, lng: 687.199010046795, map: 'base', name: '悪名ランク10まで', type: 'infamy-1', title: '悪名ランク10まで', detail: 'できるならキャビアキーの水族館仲間で戦場を移動していきたい', userId: null, obtained: true, createdAt: '2026-03-28T08:36:42.666Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687047389', lat: 349.52533075686836, lng: 1009.8566846196035, map: 'base', name: 'チドリ島へ', type: 'cave', title: 'チドリ島へ', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:37:27.389Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687073277', lat: 898.9920972225473, lng: 844.8573997662123, map: 'dlc', name: 'チドリ島から', type: 'cave', title: 'チドリ島から', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:37:53.277Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687227858', lat: 211.12225753728217, lng: 565.8887231876761, map: 'dlc', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:40:27.858Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687517302', lat: 351.0663623960932, lng: 897.2343945495047, map: 'dlc', name: 'DLC悪名ランク4+ゲージいっぱいまで', type: 'infamy-1', title: 'DLC悪名ランク4+ゲージいっぱいまで', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:45:17.302Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687571073', lat: 526.0665717411913, lng: 435.83523022134057, map: 'dlc', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:46:11.073Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687602636', lat: 280.11807063532046, lng: 530.8080546502075, map: 'dlc', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:46:42.636Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687783113', lat: 225.0161195725526, lng: 257.4642426695617, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:49:43.113Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774687915243', lat: 338.74230656764536, lng: 286.4559469689, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:51:55.243Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774688198210', lat: 558.5110952901985, lng: 328.93013017632364, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:56:38.210Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774688244619', lat: 592.7734466509855, lng: 202.96510084549226, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T08:57:24.619Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774688537850', lat: 715.5196261029455, lng: 587.439784655542, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T09:02:17.850Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774688641629', lat: 464.8214390147217, lng: 633.6767689872624, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T09:04:01.629Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774688766419', lat: 409.77606346471174, lng: 513.4682474905708, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T09:06:06.419Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true },
            { id: '1774688957863', lat: 809.0211438549068, lng: 433.24041703544253, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: true, createdAt: '2026-03-28T09:09:17.863Z', updatedAt: '2026-03-28T10:23:04.610Z', visibility: true }
        ]
    },
    {
        id: 'trend-100-dlc-only-standard',
        name: '100% DLC Only Standard',
        description: '',
        sections: [
            { name: '区間1', pins: ['cave-caves-08', 'mainquest-gulf-05', 'mainquest-gulf-06', 'mainquest-gulf-07', 'mainquest-caviar-key-01', 'mainquest-gulf-08'] },
            { name: '区間2', pins: ['landmark-plover-island-02', 'mainquest-plover-island-16', 'mainquest-plover-island-04'] },
            { name: '区間3', pins: ['cave-plover-island-01', 'nutrient-plover-island-03', 'nutrient-plover-island-02', 'mainquest-plover-island-08', 'mainquest-plover-island-10', '1774603005698', 'mainquest-plover-island-14', 'mainquest-plover-island-12', 'mainquest-plover-island-13', 'nutrient-plover-island-04', 'mainquest-plover-island-06', 'mainquest-plover-island-01', 'nutrient-plover-island-08'] },
            { name: '区間4', pins: ['nutrient-plover-island-08', 'grate-plover-island-03', 'nutrient-plover-island-03', 'landmark-plover-island-04', 'nutrient-plover-island-05', 'cave-plover-island-01'] },
            { name: '区間5', pins: ['cave-plover-island-01', 'mainquest-plover-island-02', 'nutrient-plover-island-10', 'grate-plover-island-01', 'nutrient-plover-island-09', 'grate-plover-island-01'] },
            { name: '区間6', pins: ['grate-plover-island-01', 'mainquest-plover-island-07', 'plate-plover-island-03', 'plate-plover-island-04', 'mainquest-plover-island-11'] },
            { name: '区間7', pins: ['mainquest-plover-island-11', 'plate-plover-island-06', 'quest-plover-island-03', 'landmark-plover-island-05', 'plate-plover-island-09', '1774687227858', 'mainquest-plover-island-15', 'landmark-plover-island-06', 'plate-plover-island-10', 'nutrient-plover-island-06'] },
            { name: '区間8', pins: ['nutrient-plover-island-06', 'grate-plover-island-04', 'nutrient-plover-island-07', 'grate-plover-island-04', 'mainquest-plover-island-09', 'landmark-plover-island-01', 'manhunt-plover-island-01', 'plate-plover-island-05', 'quest-plover-island-01', 'plate-plover-island-01', 'mainquest-plover-island-05', 'cave-plover-island-01'] },
            { name: '区間9', pins: ['cave-plover-island-01', 'manhunt-plover-island-02', 'plate-plover-island-07', '1774687517302', 'subquest-plover-island-02', 'mainquest-plover-island-03'] },
            { name: '区間10', pins: ['mainquest-plover-island-03', 'timetrial-plover-island-02', 'landmark-plover-island-03', 'nutrient-plover-island-01', '1774687571073', 'plate-plover-island-02'] },
            { name: '区間11', pins: ['plate-plover-island-02', 'timetrial-plover-island-01', '1774687602636', 'plate-plover-island-08', 'quest-plover-island-02', 'subquest-plover-island-01'] },
            { name: '区間12', pins: ['subquest-plover-island-01', 'mainquest-plover-island-17'] },
            { name: '区間13', pins: ['cave-caves-08', 'mainquest-gulf-01', 'quest-gulf-01', 'mainquest-gulf-02', 'mainquest-sapphire-bay-01'] },
            { name: '区間14', pins: ['mainquest-sapphire-bay-01', 'subquest-sapphire-bay-01', 'timetrial-sapphire-bay-01', 'mainquest-sapphire-bay-02', '1774687783113', 'cave-caves-07'] },
            { name: '区間15', pins: ['cave-caves-07', 'quest-sapphire-bay-01', 'mainquest-sapphire-bay-03', 'timetrial-sapphire-bay-02', '1774687915243', 'manhunt-sapphire-bay-01', 'cave-caves-07'] },
            { name: '区間16', pins: ['cave-caves-07', 'manhunt-sapphire-bay-02', 'mainquest-sapphire-bay-04'] },
            { name: '区間17', pins: ['mainquest-sapphire-bay-04', 'cave-caves-05'] },
            { name: '区間18', pins: ['cave-caves-05', 'mainquest-golden-shores-01', 'mainquest-golden-shores-02', 'mainquest-golden-shores-03', 'manhunt-golden-shores-02'] },
            { name: '区間19', pins: ['cave-caves-05', 'subquest-golden-shores-02', 'timetrial-golden-shores-02', '1774688198210', 'timetrial-golden-shores-01'] },
            { name: '区間20', pins: ['timetrial-golden-shores-01', 'subquest-golden-shores-01', '1774688244619', 'manhunt-golden-shores-01', 'quest-golden-shores-01'] },
            { name: '区間21', pins: ['quest-golden-shores-01', 'mainquest-dead-horse-lake-01', 'mainquest-dead-horse-lake-02', 'mainquest-dead-horse-lake-03', 'subquest-dead-horse-lake-01', 'manhunt-dead-horse-lake-02', 'timetrial-dead-horse-lake-01', '1774688537850'] },
            { name: '区間22', pins: ['1774688537850', 'mainquest-caviar-key-02', 'quest-caviar-key-01', 'mainquest-caviar-key-03', 'manhunt-prosperity-sands-02', 'quest-prosperity-sands-01', 'timetrial-prosperity-sands-01'] },
            { name: '区間23', pins: ['timetrial-prosperity-sands-01', 'mainquest-prosperity-sands-01', '1774688641629', 'subquest-prosperity-sands-02', 'timetrial-prosperity-sands-02', '1774688766419', 'cave-caves-06', 'manhunt-prosperity-sands-01', 'subquest-prosperity-sands-01', 'cave-caves-06'] },
            { name: '区間24', pins: ['cave-caves-06', 'cave-caves-04'] },
            { name: '区間25', pins: ['cave-caves-04', 'timetrial-dead-horse-lake-02', '1774688957863', 'manhunt-dead-horse-lake-01', 'subquest-dead-horse-lake-02', 'cave-caves-04'] },
            { name: '区間26', pins: ['cave-caves-04', 'quest-dead-horse-lake-01', 'cave-caves-04'] },
            { name: '区間27', pins: ['cave-caves-04', 'cave-caves-01', 'quest-fawtick-bayou-01', 'cave-caves-01'] },
            { name: '区間28', pins: ['cave-caves-01', 'cave-caves-07'] },
            { name: '区間29', pins: ['cave-caves-07', 'subquest-sapphire-bay-02', 'cave-caves-07'] },
            { name: '区間30', pins: ['cave-caves-07', 'cave-caves-08'] },
            { name: '区間31', pins: ['cave-caves-08', 'mainquest-gulf-03', 'mainquest-gulf-04'] }
        ],
        customPins: [
            { id: '1774603005698', lat: 841.0389381882437, lng: 198.73797028254876, map: 'dlc', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-27T09:16:45.698Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774687227858', lat: 211.12225753728217, lng: 565.8887231876761, map: 'dlc', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T08:40:27.858Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774687517302', lat: 351.0663623960932, lng: 897.2343945495047, map: 'dlc', name: 'DLC悪名ランク4+ゲージいっぱいまで', type: 'infamy-1', title: 'DLC悪名ランク4+ゲージいっぱいまで', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T08:45:17.302Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774687571073', lat: 526.0665717411913, lng: 435.83523022134057, map: 'dlc', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T08:46:11.073Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774687602636', lat: 280.11807063532046, lng: 530.8080546502075, map: 'dlc', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T08:46:42.636Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774687783113', lat: 225.0161195725526, lng: 257.4642426695617, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T08:49:43.113Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774687915243', lat: 338.74230656764536, lng: 286.4559469689, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T08:51:55.243Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774688198210', lat: 558.5110952901985, lng: 328.93013017632364, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T08:56:38.210Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774688244619', lat: 592.7734466509855, lng: 202.96510084549226, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T08:57:24.619Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774688537850', lat: 715.5196261029455, lng: 587.439784655542, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T09:02:17.850Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774688641629', lat: 464.8214390147217, lng: 633.6767689872624, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T09:04:01.629Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774688766419', lat: 409.77606346471174, lng: 513.4682474905708, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T09:06:06.419Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true },
            { id: '1774688957863', lat: 809.0211438549068, lng: 433.24041703544253, map: 'base', name: 'TA終点', type: 'time-trial', title: 'TA終点', detail: '', userId: null, obtained: false, createdAt: '2026-03-28T09:09:17.863Z', updatedAt: '2026-03-28T15:08:21.817Z', visibility: true }
        ]
    },
];

// 収集物データ整形
const collectibles = [];
const collectibleById = new Map();
const collectibleLegacyIdMap = new Map();
const loggedLegacyCollectibleIds = new Set();

function resolveCollectibleReferenceId(pinId, { logLegacyUse = false } = {}) {
    if (!pinId) return pinId;
    const resolvedId = collectibleLegacyIdMap.get(pinId) || pinId;
    if (logLegacyUse && resolvedId !== pinId && !loggedLegacyCollectibleIds.has(pinId)) {
        console.warn('[collectibles] Legacy pin id resolved to fixed id:', pinId, '->', resolvedId);
        loggedLegacyCollectibleIds.add(pinId);
    }
    return resolvedId;
}

function getCollectibleById(pinId, options = {}) {
    const resolvedId = resolveCollectibleReferenceId(pinId, options);
    return collectibleById.get(resolvedId) || null;
}

function migrateStoredPinIdList(pinIds = []) {
    if (!Array.isArray(pinIds)) {
        return { pinIds: [], changed: false };
    }

    let changed = false;
    const migrated = pinIds.map(pinId => {
        const nextPinId = resolveCollectibleReferenceId(pinId, { logLegacyUse: true });
        if (nextPinId !== pinId) changed = true;
        return nextPinId;
    });

    if (!changed) {
        return { pinIds, changed: false };
    }

    return {
        pinIds: [...new Set(migrated)],
        changed: true
    };
}

function migrateStoredRoutes(routes = []) {
    if (!Array.isArray(routes)) {
        return { routes: [], changed: false };
    }

    let changed = false;
    const nextRoutes = routes.map(route => {
        if (!route || !Array.isArray(route.sections)) return route;

        let routeChanged = false;
        const nextSections = route.sections.map(section => {
            if (!section || !Array.isArray(section.pins)) return section;

            let sectionChanged = false;
            const nextPins = section.pins.map(pinId => {
                const nextPinId = resolveCollectibleReferenceId(pinId, { logLegacyUse: true });
                if (nextPinId !== pinId) {
                    sectionChanged = true;
                    changed = true;
                }
                return nextPinId;
            });

            if (!sectionChanged) return section;
            routeChanged = true;
            return {
                ...section,
                pins: nextPins
            };
        });

        if (!routeChanged) return route;
        return {
            ...route,
            sections: nextSections
        };
    });

    return {
        routes: changed ? nextRoutes : routes,
        changed
    };
}

function migrateCollectibleReferencesInUserData(data = {}) {
    let changed = false;
    let nextData = data;

    const obtainedResult = migrateStoredPinIdList(data.obtainedPins);
    if (obtainedResult.changed) {
        nextData = {
            ...nextData,
            obtainedPins: obtainedResult.pinIds
        };
        changed = true;
    }

    const routesResult = migrateStoredRoutes(data.routes);
    if (routesResult.changed) {
        nextData = {
            ...nextData,
            routes: routesResult.routes
        };
        changed = true;
    }

    return {
        data: nextData,
        changed
    };
}

function getPinMeta(type) {
    return PIN_META[type] || { label: type, shortLabel: type, sources: ['base'], order: 999 };
}

function resolveAreaId(areaValue) {
    if (!areaValue) return 'all';
    if (AREA_META[areaValue]) return areaValue;
    return AREA_ALIASES[areaValue] || 'all';
}

function getAreaMeta(areaValue = 'all') {
    const areaId = resolveAreaId(areaValue);
    return AREA_META[areaId] || AREA_META.all;
}

function getSelectableAreas() {
    return Object.values(AREA_META)
        .filter(area => area.selectable && area.id !== 'all')
        .sort((a, b) => a.order - b.order);
}

function isSharedArea(areaId) {
    return !!(AREA_META[areaId] && AREA_META[areaId].shared);
}

function getCurrentAreaId() {
    return [...state.activeAreas][0] || 'all';
}

function ensureValidFilters() {
    if (activeSources.size === 0) {
        setSources(['base', 'dlc']);
    }
    if (activeAreas.size === 0) {
        setActiveAreas(new Set(['all']));
    }
}

function getCustomPinTitle(pin) {
    return pin.title || pin.name || '無題';
}

function getRouteCustomPins(route) {
    return Array.isArray(route && route.customPins) ? route.customPins : [];
}

function getRouteScopedCustomPin(pinId, route) {
    return getRouteCustomPins(route).find(pin => pin && pin.id === pinId) || null;
}

function isPersistedCustomPinVisible(pinId) {
    const pin = customPinById.get(pinId);
    if (!pin) return false;
    const routeFocusOk = !focusedRoutePins || focusedRoutePins.has(pinId);
    const mapOk = !pin.map || pin.map === mapOverlayMode;
    const obtainedOk = showObtained || !customPinObtained.has(pinId);
    return showCustomPins && customPinVisibility.has(pinId) && routeFocusOk && mapOk && obtainedOk;
}

function syncCustomPinRecord(pinId) {
    const pin = customPins.find(item => item.id === pinId);
    if (!pin) return;
    pin.title = getCustomPinTitle(pin);
    pin.name = pin.title;
    pin.detail = pin.detail || '';
    pin.visibility = customPinVisibility.has(pinId);
    pin.obtained = customPinObtained.has(pinId);
    pin.userId = pin.userId ?? null;
    pin.updatedAt = new Date().toISOString();
}

function syncAllCustomPinRecords() {
    customPins.forEach(pin => syncCustomPinRecord(pin.id));
}

function normalizeCollectible(rawItem, index) {
    const areaMeta = getAreaMeta(rawItem.areaId || rawItem.area || 'all');
    const pinMeta = getPinMeta(rawItem.type);
    const source = normalizeSource(rawItem.source || rawItem.map);
    const map = normalizeOverlayMode(
        rawItem.map || areaMeta.map || (source === 'dlc' && areaMeta.source === 'dlc' ? 'dlc' : 'base')
    );
    const fallbackId = rawItem.legacyId || `${rawItem.type}-${index}`;
    let resolvedId = rawItem.id;
    if (!resolvedId) {
        // collectibles.json の固定 id を優先し、旧データだけ互換 fallback を使う
        resolvedId = fallbackId;
        console.warn('[collectibles] Missing fixed id. Fallback id was used:', resolvedId, rawItem);
    }
    return {
        ...rawItem,
        id: resolvedId,
        legacyId: fallbackId,
        name: rawItem.name || pinMeta.label,
        source,
        map,
        areaId: areaMeta.id,
        areaLabel: rawItem.areaLabel || areaMeta.label,
        area: rawItem.areaLabel || areaMeta.label
    };
}

function buildCollectibles(raw) {
    collectibles.length = 0;
    collectibleById.clear();
    collectibleLegacyIdMap.clear();
    raw.forEach((rawCollectible, index) => {
        const normalizedCollectible = normalizeCollectible(rawCollectible, index);
        collectibles.push(normalizedCollectible);

        if (collectibleById.has(normalizedCollectible.id)) {
            console.warn('[collectibles] Duplicate fixed id detected:', normalizedCollectible.id, normalizedCollectible);
        }
        collectibleById.set(normalizedCollectible.id, normalizedCollectible);

        if (normalizedCollectible.legacyId && normalizedCollectible.legacyId !== normalizedCollectible.id) {
            if (collectibleLegacyIdMap.has(normalizedCollectible.legacyId)) {
                console.warn('[collectibles] Duplicate legacy id detected:', normalizedCollectible.legacyId, normalizedCollectible);
            }
            collectibleLegacyIdMap.set(normalizedCollectible.legacyId, normalizedCollectible.id);
        }
    });
}

function getBulkManageablePinTypes() {
    const mapped = Object.entries(PIN_META)
        .filter(([, meta]) => meta.hiddenInBulk !== true)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([type, meta]) => ({ type, label: meta.label }));
    mapped.push({ type: 'custom', label: '新規マップピン' });
    return mapped;
}

let savedActiveTypes = null;
let savedActiveDlcTypes = null;
let batchMode = false;
let batchObtainedPins = new Set();
let pinnedRoutes = new Set();

let routeMode = false;
let currentRoutePoints = [];
let routes = [];
let currentPolyline = null;

const markers = [];

async function loadCollectibles() {
    const response = await fetch('collectibles.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error('collectibles.json の読み込みに失敗しました');
    }
    return await response.json();
}

function syncInitialUiState() {
    const customPinSortButton = document.getElementById('custom-pin-sort-btn');
    if (customPinSortButton) {
        customPinSortButton.innerText = customPinSortMode === 'created' ? '作成順' : '名前順';
    }

    document.querySelectorAll('.route-tab').forEach(routeTabButton => {
        routeTabButton.classList.toggle('active', routeTabButton.dataset.tab === activeRouteTab);
    });
}

function renderInitialMapContent() {
    renderMarkers();
    loadCustomPins();
    renderCustomPins();
    updateCustomPinCount();
    renderRouteList();
    refreshMapDisplay({ syncButtons: true, skipPersistence: true });
}

function finalizeAppInitialization() {
    updateAuthUi();
    isAppReady = true;
    setTimeout(() => {
        initTutorial();
    }, 400);
}

// 初期化
async function init() {
    // 1. 収集物データを読み込む
    try {
        rawCollectibles = await loadCollectibles();
        buildCollectibles(rawCollectibles);
    } catch (err) {
        console.error(err);
    }

    // 2. 保存設定と認証まわりを初期化する
    try {
        await initializePersistence();
    } catch (error) {
        console.error('[initializePersistence]', error);
        showToast('保存設定の初期化に失敗しました', 'error');
    }

    // 3. DOM ベースの初期 UI をそろえる
    renderStaticUi();
    syncInitialUiState();

    // 4. マップ表示とリスト類を初期描画する
    renderInitialMapContent();

    // 5. 入力イベントを有効化する
    setupEventListeners();

    // 6. 認証表示とチュートリアルを仕上げる
    finalizeAppInitialization();
}

// 初期 UI 描画
function createFilterButton(type, source, context) {
    const pinMeta = getPinMeta(type);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-type-btn active';
    button.dataset.type = type;
    button.dataset.filterContext = context;
    if (source) button.dataset.source = source;

    const iconWrap = document.createElement('div');
    iconWrap.className = 'icon-wrap';
    const img = document.createElement('img');
    img.src = pinMeta.leaflet.iconUrl;
    img.alt = pinMeta.label;
    const count = document.createElement('span');
    count.className = context === 'route' ? 'pin-count route-filter-count' : 'pin-count';
    count.innerText = '0';
    iconWrap.append(img, count);

    const label = document.createElement('span');
    label.innerText = pinMeta.shortLabel;

    button.append(iconWrap, label);
    return button;
}

function renderFilterButtons() {
    FILTER_SECTION_META.forEach(section => {
        const sectionGroup = document.querySelector(`[data-section-group="${section.id}"]`);
        if (!sectionGroup) return;
        sectionGroup.innerHTML = '';
        section.types.forEach(type => {
            sectionGroup.appendChild(createFilterButton(type, section.source, section.context));
        });
    });
}

function createAreaCard(areaMeta) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'area-card';
    button.dataset.areaId = areaMeta.id;

    const content = document.createElement('div');
    content.className = 'area-card-content';

    const title = document.createElement('strong');
    title.innerText = areaMeta.routeLabel || areaMeta.label;
    content.appendChild(title);

    if (areaMeta.id === 'all') {
        const desc = document.createElement('span');
        desc.innerText = 'すべてのピンを表示';
        content.appendChild(desc);
    } else {
        if (areaMeta.source === 'dlc') {
            const source = document.createElement('span');
            source.className = 'area-source';
            source.innerText = 'DLC';
            content.appendChild(source);
        }
    }

    button.appendChild(content);
    return button;
}

function renderAreaCards() {
    const container = document.getElementById('area-filters');
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(createAreaCard(AREA_META.all));
    getSelectableAreas().forEach(areaMeta => {
        container.appendChild(createAreaCard(areaMeta));
    });
}

function renderRouteAreaTree() {
    const container = document.getElementById('route-area-tree');
    if (!container) return;
    container.innerHTML = '';

    ['base', 'dlc'].forEach(source => {
        const areas = getSelectableAreas().filter(area => area.source === source);
        if (areas.length === 0) return;

        const group = document.createElement('div');
        group.className = 'tree-group';
        const title = document.createElement('div');
        title.className = 'tree-parent';
        title.innerText = source === 'base' ? 'Base' : 'DLC';
        group.appendChild(title);

        areas.forEach(areaMeta => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'route-area-item';
            button.dataset.areaId = areaMeta.id;
            button.innerText = areaMeta.routeLabel || areaMeta.label;
            group.appendChild(button);
        });

        container.appendChild(group);
    });
}

function renderCustomPinTypeButtons() {
    const container = document.getElementById('custom-pin-icon-grid');
    if (!container) return;
    container.innerHTML = '';
    Object.entries(PIN_META)
        .filter(([, meta]) => meta.customSelectable)
        .sort((a, b) => a[1].order - b[1].order)
        .forEach(([type, meta], index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'custom-pin-icon-btn';
            button.dataset.iconType = type;
            button.title = meta.label;
            if (index === 0) button.classList.add('active');

            const img = document.createElement('img');
            img.src = meta.leaflet.iconUrl;
            img.alt = meta.label;
            button.appendChild(img);
            container.appendChild(button);
        });
}

function renderStaticUi() {
    renderAreaCards();
    renderFilterButtons();
    renderRouteAreaTree();
    renderCustomPinTypeButtons();
}

function renderMarkers() {
    // 再描画前に既存マーカーを外す
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

        // 通常表示用ポップアップ
        const popupContent = buildCollectiblePopup(item, isObtained);
        marker.bindPopup(popupContent, { autoPan: false });

        markers.push({ marker, item });
        updateMarkerAppearance(marker, item.id);
    });

    renderCaveZones();
    applyFilter();
}

function renderCaveZones() {
    // 既存の洞窟判定円を外す
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

    // 実際の表示制御は applyFilter() に集約する
}

function updateMarkerAppearance(marker, id) {
    const el = marker.getElement();
    if (!el) {
        marker.on('add', () => updateMarkerAppearance(marker, id));
        return;
    }

    // バッチ編集中は仮状態を優先する
    const isObtained = batchMode ? batchObtainedPins.has(id) : obtainedPins.has(id);

    if (isObtained) {
        el.classList.add('marker-obtained');
    } else {
        el.classList.remove('marker-obtained');
    }
}

// カスタムピン
function loadCustomPins() {
    try {
        const rawPins = Array.isArray(customPins) ? customPins : [];
        const normalizedPins = rawPins.map(pin => {
            const title = pin.title || pin.name || '無題';
            const createdAt = pin.createdAt || new Date().toISOString();
            return {
                ...pin,
                title,
                name: title,
                detail: pin.detail || '',
                map: normalizeOverlayMode(pin.map),
                createdAt,
                updatedAt: pin.updatedAt || createdAt,
                visibility: pin.visibility !== false,
                obtained: !!pin.obtained,
                userId: pin.userId ?? null
            };
        });
        customPins = normalizedPins;
        const visibleIds = normalizedPins.filter(pin => pin.visibility !== false).map(pin => pin.id);
        const obtainedIds = new Set([
            ...normalizedPins.filter(pin => pin.obtained).map(pin => pin.id),
            ...customPinObtained
        ]);
        setCustomPinVisibilitySet(new Set(visibleIds));
        setCustomPinObtainedSet(obtainedIds);
        syncAllCustomPinRecords();
    } catch (e) {
        customPins = [];
        setCustomPinVisibilitySet(new Set());
    }
}

function saveCustomPins() {
    return queueUserDataSave();
}

function renderCustomPins() {
    customPinMarkers.forEach(marker => marker.remove());
    customPinMarkers.clear();
    customPinById = new Map();
    if (customPins.length > 0 && customPinVisibility.size === 0) {
        setCustomPinVisibilitySet(new Set(customPins.map(pin => pin.id)));
    }
    const previousVisibility = new Set(customPinVisibility);
    setCustomPinVisibilitySet(new Set(
        customPins
            .filter(pin => previousVisibility.size === 0 || previousVisibility.has(pin.id))
            .map(pin => pin.id)
    ));
    customPins.forEach(pin => {
        if (previousVisibility.size !== 0 && !previousVisibility.has(pin.id)) {
            customPinVisibility.add(pin.id);
        }
    });
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
    const popup = buildCustomPinPopup(pin);
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
    refreshMapDisplay();
};

function saveCustomPinObtained() {
    return queueUserDataSave();
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
    syncCustomPinRecord(id);
    saveCustomPins();
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
    refreshMapDisplay({ updateCounts: true });
};

function applyCustomPinVisibility() {
    customPinMarkers.forEach(marker => {
        const id = marker.options && marker.options.customId;
        const pinData = id ? customPinById.get(id) : null;
        const routeFocusOk = !id || !focusedRoutePins || focusedRoutePins.has(id);
        const mapValue = pinData ? pinData.map : (marker.options && marker.options.customMap);
        const mapOk = !mapValue || mapValue === mapOverlayMode;
        const obtainedOk = !id || showObtained || !customPinObtained.has(id);
        const pinVisible = showCustomPins && (!id || customPinVisibility.has(id)) && routeFocusOk && mapOk && obtainedOk;
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

function getRoutePinMeta(pinId, route = null) {
    const collectible = getCollectibleById(pinId);
    if (collectible) {
        return {
            name: collectible.name,
            type: collectible.type,
            iconUrl: (icons[collectible.type] && icons[collectible.type].options && icons[collectible.type].options.iconUrl) || '',
            map: collectible.map,
            latlng: L.latLng(collectible.lat, collectible.lng)
        };
    }
    const routeCustomPin = getRouteScopedCustomPin(pinId, route);
    if (routeCustomPin) {
        return {
            name: getCustomPinTitle(routeCustomPin),
            type: routeCustomPin.type,
            isCustom: true,
            iconUrl: (icons[routeCustomPin.type] && icons[routeCustomPin.type].options && icons[routeCustomPin.type].options.iconUrl)
                || (customPinIcon.options && customPinIcon.options.iconUrl)
                || '',
            map: normalizeOverlayMode(routeCustomPin.map),
            latlng: L.latLng(routeCustomPin.lat, routeCustomPin.lng)
        };
    }
    const cpin = customPins.find(p => p.id === pinId);
    if (cpin) {
        return {
            name: getCustomPinTitle(cpin),
            type: cpin.type,
            isCustom: true,
            iconUrl: (icons[cpin.type] && icons[cpin.type].options && icons[cpin.type].options.iconUrl) || (customPinIcon.options && customPinIcon.options.iconUrl) || '',
            map: cpin.map || mapOverlayMode,
            latlng: L.latLng(cpin.lat, cpin.lng)
        };
    }
    return null;
}

function getRoutePinSummaryType(meta) {
    if (!meta || !meta.type) return null;
    return meta.isCustom ? 'custom' : meta.type;
}

function renderRouteScopedCustomPins(route) {
    routePreviewMarkers.forEach(marker => marker.remove());
    routePreviewMarkers = [];

    const routeCustomPins = getRouteCustomPins(route);
    if (routeCustomPins.length === 0) return;
    const referencedPinIds = new Set();
    if (route && Array.isArray(route.sections)) {
        route.sections.forEach(section => {
            if (!section || !Array.isArray(section.pins)) return;
            section.pins.forEach(pinId => referencedPinIds.add(pinId));
        });
    }

    const uniquePins = new Map();
    routeCustomPins.forEach(pin => {
        if (!pin || !pin.id) return;
        if (referencedPinIds.size > 0 && !referencedPinIds.has(pin.id)) return;
        uniquePins.set(pin.id, pin);
    });

    uniquePins.forEach(pin => {
        const pinMap = normalizeOverlayMode(pin.map);
        if (pinMap !== mapOverlayMode) return;
        if (isPersistedCustomPinVisible(pin.id)) return;

        const marker = L.marker([pin.lat, pin.lng], {
            icon: getCustomPinIcon(pin.type),
            routeCustomId: pin.id,
            customMap: pinMap
        });
        marker.bindPopup(buildRouteScopedCustomPinPopup(pin), { autoPan: false });
        marker.addTo(map);
        routePreviewMarkers.push(marker);
    });
}

function syncActiveRouteScopedCustomPins() {
    if (currentRouteView === 'detail' && currentDetailedRoute) {
        renderRouteScopedCustomPins(currentDetailedRoute);
        return;
    }
    if (currentRouteView === 'create' && creatingRoute) {
        renderRouteScopedCustomPins(creatingRoute);
        return;
    }
    routePreviewMarkers.forEach(marker => marker.remove());
    routePreviewMarkers = [];
}

function renderCustomPinList() {
    const list = document.getElementById('custom-pin-list');
    if (!list) return;
    list.innerHTML = '';
    const sortedPins = [...customPins];
    if (customPinSortMode === 'name') {
        sortedPins.sort((a, b) => getCustomPinTitle(a).localeCompare(getCustomPinTitle(b), 'ja'));
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
        const name = getCustomPinTitle(pin);
        const iconWrap = document.createElement('div');
        iconWrap.className = 'icon-wrap';
        const img = document.createElement('img');
        img.src = iconUrl;
        img.alt = '';
        const obtained = document.createElement('span');
        obtained.className = 'custom-pin-obtained';
        obtained.innerText = '✓';
        iconWrap.append(img, obtained);

        const label = document.createElement('span');
        label.innerText = name;
        btn.append(iconWrap, label);
        btn.addEventListener('click', () => {
            if (customPinVisibility.has(pin.id)) {
                customPinVisibility.delete(pin.id);
            } else {
                customPinVisibility.add(pin.id);
            }
            syncCustomPinRecord(pin.id);
            saveCustomPins();
            btn.classList.toggle('active', customPinVisibility.has(pin.id));
            applyCustomPinVisibility();
            updateSectionMasterToggles();
            refreshMapDisplay({ updateCounts: false });
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
    const pinMeta = getPinMeta(type);
    if (pinMeta.leaflet) {
        const { className, ...leafletMeta } = pinMeta.leaflet;
        return L.icon(leafletMeta);
    }
    return icons[type] || customPinIcon;
}

function isTypeActive(type, source) {
    return source === 'dlc' ? activeDlcTypes.has(type) : activeTypes.has(type);
}

function matchesSelectedArea(item) {
    const currentAreaId = getCurrentAreaId();
    if (activeAreas.size === 0 || currentAreaId === 'all') return true;
    return item.areaId === currentAreaId || isSharedArea(item.areaId);
}

function shouldDisplayCollectible(item, options = {}) {
    const { ignoreObtainedHidden = false } = options;
    if (focusedRoutePins) {
        return focusedRoutePins.has(item.id) && item.map === mapOverlayMode;
    }

    const typeOk = isTypeActive(item.type, item.source);
    const areaOk = matchesSelectedArea(item);
    const sourceOk = activeSources.size === 0 || activeSources.has(item.source);
    const mapOk = item.map === mapOverlayMode;
    const obtainedOk = ignoreObtainedHidden || showObtained || !obtainedPins.has(item.id);
    return typeOk && areaOk && sourceOk && mapOk && obtainedOk;
}

function getVisibleCollectibles(options = {}) {
    return collectibles.filter(item => shouldDisplayCollectible(item, options));
}

function setTypeActiveState(type, source, enabled) {
    const targetSet = source === 'dlc' ? activeDlcTypes : activeTypes;
    if (enabled) {
        targetSet.add(type);
    } else {
        targetSet.delete(type);
    }
}

function toggleTypeFilter(type, source) {
    if (source) {
        setTypeActiveState(type, source, !isTypeActive(type, source));
        return;
    }

    const pinMeta = getPinMeta(type);
    const targetSources = pinMeta.sources || ['base'];
    const allEnabled = targetSources.every(src => isTypeActive(type, src));
    targetSources.forEach(src => setTypeActiveState(type, src, !allEnabled));
}

function syncAreaSelectionUi(areaId = getCurrentAreaId()) {
    const currentMeta = getAreaMeta(areaId);
    const nameEl = document.getElementById('current-area-name');
    const mobileAreaName = document.getElementById('mobile-current-area');
    if (nameEl) nameEl.innerText = currentMeta.shortLabel || (areaId === 'all' ? '全エリアを表示' : currentMeta.label);
    if (mobileAreaName) mobileAreaName.innerText = currentMeta.shortLabel || (areaId === 'all' ? '全エリアを表示' : currentMeta.label);

    document.querySelectorAll('.area-card').forEach(card => {
        card.classList.toggle('active', card.dataset.areaId === areaId);
    });
}

function updateFilterSummary() {
    const summary = document.getElementById('active-filter-summary');
    if (!summary) return;

    const currentAreaMeta = getAreaMeta(getCurrentAreaId());
    const overlayLabel = mapOverlayMode === 'dlc' ? 'DLCマップ' : 'Baseマップ';
    const sourceLabel = activeSources.size === 2
        ? 'Base + DLC'
        : (activeSources.has('dlc') ? 'DLCのみ' : 'Baseのみ');
    const hiddenObtainedLabel = showObtained ? '取得済みも表示' : '取得済みを隠す';
    summary.innerText = `表示条件: ${currentAreaMeta.label} / ${overlayLabel} / ${sourceLabel} / ${hiddenObtainedLabel}`;
}

function collectVisiblePinStats() {
    const baseTotals = {};
    const baseObtainedTotals = {};
    const dlcTotals = {};
    const dlcObtainedTotals = {};

    collectibles.forEach(item => {
        const mapOk = item.map === mapOverlayMode;
        const areaOk = matchesSelectedArea(item);
        const sourceOk = activeSources.size === 0 || activeSources.has(item.source);
        if (!mapOk || !areaOk || !sourceOk) return;

        if (item.source === 'dlc') {
            dlcTotals[item.type] = (dlcTotals[item.type] || 0) + 1;
            if (obtainedPins.has(item.id)) {
                dlcObtainedTotals[item.type] = (dlcObtainedTotals[item.type] || 0) + 1;
            }
            return;
        }

        baseTotals[item.type] = (baseTotals[item.type] || 0) + 1;
        if (obtainedPins.has(item.id)) {
            baseObtainedTotals[item.type] = (baseObtainedTotals[item.type] || 0) + 1;
        }
    });

    return { baseTotals, baseObtainedTotals, dlcTotals, dlcObtainedTotals };
}

function refreshMapDisplay(options = {}) {
    const { syncButtons = false, updateCounts = true, skipPersistence = false } = options;
    ensureValidFilters();
    if (syncButtons) syncFilterButtons();
    applyFilter();
    syncActiveRouteScopedCustomPins();
    if (updateCounts) {
        const visiblePinStats = collectVisiblePinStats();
        updatePinCounts(visiblePinStats);
        updateRouteFilterPanelCounts(visiblePinStats);
        updateFilterSummary();
    }
    updateSectionMasterToggles();
    if (!skipPersistence) {
        savePreferences();
    }
}

function applyFilter() {
    const visibleTypes = new Set();
    markers.forEach(({ marker, item }) => {
        const isVisible = shouldDisplayCollectible(item);

        if (isVisible) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
            visibleTypes.add(item.type);
        } else {
            if (map.hasLayer(marker)) {
                marker.remove();
            }
        }
    });

    // 洞窟判定円も同じ表示条件にそろえる
    caveCircleLayers.forEach(({ circle, item }) => {
        const isVisibleCave = shouldDisplayCollectible(item);

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

    // 関連 UI も最新状態へそろえる
    updateSourceButtonState();
    updateQuickView(visibleTypes);
    applyCustomPinVisibility();
}

// 取得状態
window.toggleObtainedFromPopup = function(id) {
    const resolvedId = resolveCollectibleReferenceId(id, { logLegacyUse: true });
    if (obtainedPins.has(resolvedId)) {
        obtainedPins.delete(resolvedId);
    } else {
        obtainedPins.add(resolvedId);
    }
    saveObtained();
    const target = markers.find(m => m.item.id === resolvedId);
    if (target) {
        updateMarkerAppearance(target.marker, resolvedId);
        const btn = target.marker.getPopup().getElement().querySelector('.obtained-toggle');
        if (btn) {
            btn.classList.toggle('active');
            btn.innerText = obtainedPins.has(resolvedId) ? '✓ 取得済み' : '取得済みにする';
        }
    }
    refreshMapDisplay();
};

function saveObtained() {
    return queueUserDataSave();
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

// ルート一覧・詳細
function toggleRouteSidebar(show = null, showMainOnClose = true) {
    const mainSidebar = document.getElementById('map-sidebar');
    const routeSidebar = document.getElementById('route-sidebar');
    const areaOverlay = document.getElementById('area-overlay');

    if (show === null) {
        show = (currentSidebar !== 'route');
    }

    if (show) {
        setSidebarCurrent('route');
        setSidebarLast('route');
        const leftToggleBtn = document.getElementById('toggle-left-sidebar-btn');
        if (leftToggleBtn) leftToggleBtn.classList.add('hidden');
        const closeLeftBtn = document.getElementById('close-left-sidebar-btn');
        if (closeLeftBtn) closeLeftBtn.classList.remove('hidden');
        mainSidebar.classList.add('hidden');
        routeSidebar.classList.remove('hidden');
        areaOverlay.classList.add('hidden'); // エリア選択オーバーレイは閉じる
        setRouteView('browse');
        setCurrentRoute(null);
        renderRouteList();
        setTimeout(() => initRouteTutorial(), 80);
    } else {
        if (routeTutorialActive) finishRouteTutorial(false);
        if (showMainOnClose) {
            setSidebarCurrent('main');
            setSidebarLast('main');
            mainSidebar.classList.remove('hidden');
            const leftToggleBtn = document.getElementById('toggle-left-sidebar-btn');
            if (leftToggleBtn) leftToggleBtn.classList.add('hidden');
            const closeLeftBtn = document.getElementById('close-left-sidebar-btn');
            if (closeLeftBtn) closeLeftBtn.classList.remove('hidden');
        } else {
            setSidebarCurrent('none');
            mainSidebar.classList.add('hidden');
            const leftToggleBtn = document.getElementById('toggle-left-sidebar-btn');
            if (leftToggleBtn) leftToggleBtn.classList.remove('hidden');
            const closeLeftBtn = document.getElementById('close-left-sidebar-btn');
            if (closeLeftBtn) closeLeftBtn.classList.add('hidden');
        }
        routeSidebar.classList.add('hidden');
        exitCreateMode(); // 作成中なら終了
        backToBrowse(); // 詳細表示は一覧へ戻す
    }
}

function switchRouteTab(tab) {
    setRouteTab(tab);
    document.querySelectorAll('.route-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    renderRouteList();
    savePreferences();
}

function renderRouteList() {
    const list = document.getElementById('route-list');
    const searchVal = document.getElementById('route-search-input').value.toLowerCase();
    const data = (activeRouteTab === 'trend') ? trendRoutes : myRoutes;
    
    list.innerHTML = '';
    const filtered = data.filter(r => r.name.toLowerCase().includes(searchVal));

    if (routeTutorialActive && routeTutorialShowcaseVisible && activeRouteTab === 'trend') {
        const tutorialRoute = getRouteTutorialCardRoute();
        if (tutorialRoute) {
            filtered.unshift(tutorialRoute);
        }
    }

    filtered.sort((a, b) => {
        const pinA = pinnedRoutes.has(a.id) ? 1 : 0;
        const pinB = pinnedRoutes.has(b.id) ? 1 : 0;
        return pinB - pinA;
    });

    if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-msg';
        empty.innerText = 'ルートが見つかりません';
        list.appendChild(empty);
        return;
    }

    filtered.forEach(r => {
        const totalPins = r.sections.reduce((sum, s) => sum + s.pins.length, 0);
        const card = document.createElement('div');
        card.className = `route-card ${r.__isTutorialRoute ? 'route-tutorial-card' : ''}`.trim();
        if (r.__isTutorialRoute) {
            card.dataset.routeTutorialCard = 'true';
        }
        card.addEventListener('click', () => {
            if (r.__isTutorialRoute) {
                handleRouteTutorialCardClick();
                return;
            }
            showRouteDetail(r);
        });

        const thumb = document.createElement('div');
        thumb.className = 'route-thumb';
        const thumbImg = document.createElement('img');
        thumbImg.src = '../images/map/手配.png';
        thumbImg.alt = '';
        thumb.appendChild(thumbImg);

        const info = document.createElement('div');
        info.className = 'route-info';
        const title = document.createElement('div');
        title.className = 'route-title';
        title.innerText = r.name;
        if (r.__isTutorialRoute) {
            const badge = document.createElement('span');
            badge.className = 'route-tutorial-list-badge';
            badge.innerText = 'Tutorial';
            title.appendChild(badge);
        }
        const meta = document.createElement('div');
        meta.className = 'route-meta';
        const totalSpan = document.createElement('span');
        totalSpan.appendChild(createSvgNode(
            { width: '14', height: '14', viewBox: '0 0 24 24', fill: 'currentColor' },
            [{ d: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' }]
        ));
        totalSpan.append(document.createTextNode(`${totalPins}`));
        const descSpan = document.createElement('span');
        descSpan.innerText = r.description || '';
        meta.append(totalSpan, descSpan);
        info.append(title, meta);

        const actions = document.createElement('div');
        actions.className = 'route-actions-wrap';
        actions.style.position = 'absolute';
        actions.style.top = '5px';
        actions.style.right = '5px';
        actions.style.display = 'flex';
        actions.style.gap = '5px';
        actions.style.zIndex = '10';

        if (!r.__isTutorialRoute) {
            const pinButton = document.createElement('button');
            pinButton.type = 'button';
            pinButton.className = `route-pin-btn ${pinnedRoutes.has(r.id) ? 'pinned' : ''}`.trim();
            pinButton.title = '固定';
            pinButton.appendChild(createSvgNode(
                { viewBox: '0 0 24 24', fill: 'currentColor' },
                [{ d: 'M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z' }]
            ));
            pinButton.addEventListener('click', (event) => {
                event.stopPropagation();
                togglePinRoute(r.id);
            });
            actions.appendChild(pinButton);
        }

        if (!r.__isTutorialRoute && activeRouteTab === 'my') {
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'route-delete-btn';
            deleteButton.title = '削除';
            deleteButton.appendChild(createSvgNode(
                { viewBox: '0 0 24 24', fill: 'currentColor' },
                [{ d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' }]
            ));
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteMyRoute(r.id);
            });
            actions.appendChild(deleteButton);
        }

        card.append(thumb, info, actions);
        list.appendChild(card);
    });
}

function togglePinRoute(id) {
    if (pinnedRoutes.has(id)) {
        pinnedRoutes.delete(id);
    } else {
        pinnedRoutes.add(id);
    }
    savePinnedRoutes();
    renderRouteList();
}

function deleteMyRoute(id) {
    if (!confirm('このルートを削除しますか？')) return;
    myRoutes = myRoutes.filter(r => r.id !== id);
    saveMyRoutes();
    renderRouteList();
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
        const activeRoute = currentRouteView === 'create' ? creatingRoute : currentDetailedRoute;
        const meta = getRoutePinMeta(pid, activeRoute);
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

function getRouteDetailAllPins(route) {
    const allRoutePins = new Set();
    if (!route || !Array.isArray(route.sections)) return allRoutePins;

    route.sections.forEach(section => {
        if (!section || !Array.isArray(section.pins)) return;
        section.pins.forEach(pinId => allRoutePins.add(resolveCollectibleReferenceId(pinId)));
    });

    return allRoutePins;
}

function setActiveRouteDetailSection(route, sectionIndex, allRoutePins = getRouteDetailAllPins(route)) {
    if (!route || !Array.isArray(route.sections)) return;

    const nextIndex = activeRouteDetailSectionIndex === sectionIndex ? -1 : sectionIndex;
    activeRouteDetailSectionIndex = nextIndex;

    focusedRoutePins = allRoutePins;
    refreshMapDisplay();

    if (nextIndex === -1) {
        renderRouteOnMap(route, -1, true);
        showRoutePinHighlights([]);
        return;
    }

    const section = route.sections[nextIndex];
    const targetMode = getSectionMapMode(section, route);
    if (targetMode && targetMode !== mapOverlayMode) {
        setMapOverlay(targetMode);
    }

    renderRouteOnMap(route, nextIndex, true);
    showRoutePinHighlights(section.pins);

    const latlngs = [];
    section.pins.forEach(pinId => {
        const meta = getRoutePinMeta(pinId, route);
        if (meta && meta.latlng) latlngs.push(meta.latlng);
    });
    if (latlngs.length > 0) {
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds.pad(0.2), getRouteZoomOptions());
    }
}

function renderRouteDetailSections(route, allRoutePins = getRouteDetailAllPins(route)) {
    const list = document.getElementById('detail-sections-list');
    if (!list) return;

    list.innerHTML = '';

    route.sections.forEach((section, idx) => {
        const card = document.createElement('div');
        const isExpanded = expandedRouteDetailSections.has(idx);
        const isActive = activeRouteDetailSectionIndex === idx;
        card.className = `detail-section-card ${isExpanded ? 'expanded' : ''} ${isActive ? 'active-highlight' : ''}`.trim();

        const counts = {};
        section.pins.forEach(pinId => {
            const meta = getRoutePinMeta(pinId, route);
            const summaryType = getRoutePinSummaryType(meta);
            if (summaryType) counts[summaryType] = (counts[summaryType] || 0) + 1;
        });

        const head = document.createElement('div');
        head.className = 'detail-section-head';
        const dot = document.createElement('span');
        dot.className = 'detail-dot';
        dot.style.background = getSectionColor(idx);
        const name = document.createElement('span');
        name.className = 'detail-name';
        name.innerText = section.name;

        const controls = document.createElement('div');
        controls.className = 'detail-section-controls';

        const expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.className = 'detail-expand-btn';
        expandBtn.title = isExpanded ? '区間を閉じる' : '区間を開く';
        const expandIcon = createSvgNode(
            { width: '14', height: '14', viewBox: '0 0 24 24', fill: 'currentColor' },
            [{ d: 'M7 10l5 5 5-5z' }]
        );
        expandIcon.style.transform = `rotate(${isExpanded ? '0deg' : '-90deg'})`;
        expandIcon.style.transition = 'transform 0.2s';
        expandBtn.appendChild(expandIcon);
        expandBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            if (expandedRouteDetailSections.has(idx)) expandedRouteDetailSections.delete(idx);
            else expandedRouteDetailSections.add(idx);
            renderRouteDetailSections(route, allRoutePins);
        });

        const dropdown = document.createElement('div');
        dropdown.className = 'batch-dropdown';
        const dropdownBtn = document.createElement('button');
        dropdownBtn.type = 'button';
        dropdownBtn.className = 'batch-link';
        dropdownBtn.innerText = '一括表記 ▾';
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'batch-dropdown-content hidden';
        const markAllBtn = document.createElement('button');
        markAllBtn.type = 'button';
        markAllBtn.className = 'batch-action-item';
        markAllBtn.innerText = 'すべてを表記';
        markAllBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            batchMarkSection(section.pins, true, route);
        });
        const unmarkAllBtn = document.createElement('button');
        unmarkAllBtn.type = 'button';
        unmarkAllBtn.className = 'batch-action-item';
        unmarkAllBtn.innerText = 'すべての表記を取り消す';
        unmarkAllBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            batchMarkSection(section.pins, false, route);
        });
        dropdownContent.append(markAllBtn, unmarkAllBtn);
        dropdown.append(dropdownBtn, dropdownContent);

        controls.append(expandBtn, dropdown);
        head.append(dot, name, controls);
        card.appendChild(head);

        const body = document.createElement('div');
        body.className = 'detail-section-body';

        const summary = document.createElement('div');
        summary.className = 'detail-section-summary';
        const entries = Object.entries(counts);
        if (entries.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'detail-section-empty';
            empty.innerText = 'ピンがありません';
            summary.appendChild(empty);
        } else {
            entries.forEach(([type, count]) => {
                const item = document.createElement('div');
                item.className = 'detail-item-count';
                const icon = document.createElement('img');
                icon.src = (icons[type] && icons[type].options && icons[type].options.iconUrl)
                    ? icons[type].options.iconUrl
                    : ((customPinIcon.options && customPinIcon.options.iconUrl) || '');
                icon.alt = '';
                const countText = document.createElement('span');
                countText.innerText = `x${count}`;
                item.append(icon, countText);
                summary.appendChild(item);
            });
        }
        body.appendChild(summary);

        if (isExpanded && section.pins.length > 0) {
            const pinOrderList = document.createElement('div');
            pinOrderList.className = 'detail-pin-order-list';
            section.pins.forEach((pinId, pinIndex) => {
                const meta = getRoutePinMeta(pinId, route);
                const pinRow = document.createElement('div');
                pinRow.className = 'detail-pin-order-item';

                const order = document.createElement('span');
                order.className = 'detail-pin-order-number';
                order.innerText = `${pinIndex + 1}`;

                const icon = document.createElement('img');
                icon.className = 'detail-pin-order-icon';
                icon.src = meta ? meta.iconUrl : '';
                icon.alt = '';

                const pinName = document.createElement('span');
                pinName.className = 'detail-pin-order-name';
                pinName.innerText = meta ? meta.name : '不明なピン';

                pinRow.append(order, icon, pinName);
                pinOrderList.appendChild(pinRow);
            });
            body.appendChild(pinOrderList);
        }

        card.appendChild(body);

        card.addEventListener('click', (event) => {
            if (event.target.closest('.batch-dropdown') || event.target.closest('.detail-expand-btn')) return;
            setActiveRouteDetailSection(route, idx, allRoutePins);
            renderRouteDetailSections(route, allRoutePins);
        });

        dropdownBtn.onclick = (event) => {
            event.stopPropagation();
            document.querySelectorAll('.batch-dropdown-content').forEach(element => {
                if (element !== dropdownContent) element.classList.add('hidden');
            });
            dropdownContent.classList.toggle('hidden');
        };

        list.appendChild(card);
    });
}

// ルート作成・編集
function showRouteDetail(route) {
    setRouteView('detail');
    setCurrentRoute(route);
    expandedRouteDetailSections = new Set();
    activeRouteDetailSectionIndex = -1;

    // ルート閲覧中は全エリア表示に寄せる
    setActiveAreas(new Set(['all']));
    syncAreaSelectionUi('all');
    setSources(['base', 'dlc']);
    updateSourceButtonState();
    refreshMapDisplay();

    document.getElementById('route-browse-view').classList.add('hidden');
    document.getElementById('route-detail-view').classList.remove('hidden');
    document.getElementById('route-browse-header').classList.add('hidden');
    document.getElementById('route-detail-header').classList.remove('hidden');
    document.getElementById('browse-footer').classList.add('hidden');
    const mapActions = document.querySelector('.map-actions');
    if (mapActions) mapActions.classList.add('hidden');
    const routeSidebarEl = document.getElementById('route-sidebar');
    if (routeSidebarEl) routeSidebarEl.classList.toggle('mobile-detail-mode', window.innerWidth <= 900);
    
    // 編集はマイルートのみ
    const editBtn = document.getElementById('edit-route-btn');
    if (editBtn) {
        editBtn.classList.toggle('hidden', activeRouteTab !== 'my');
    }
    
    document.getElementById('detail-route-name').innerText = route.name;
    document.getElementById('detail-desc').innerText = route.description || '紹介文はありません';
    document.getElementById('detail-section-count').innerText = `このルートには ${route.sections.length} 個の区間が含まれています`;

    const allRoutePins = getRouteDetailAllPins(route);
    const allPinIds = [...allRoutePins];
    focusedRoutePins = allRoutePins;
    refreshMapDisplay();

    const summaryCounts = {};
    allPinIds.forEach(pid => {
        const meta = getRoutePinMeta(pid, route);
        const summaryType = getRoutePinSummaryType(meta);
        if (!summaryType) return;
        summaryCounts[summaryType] = (summaryCounts[summaryType] || 0) + 1;
    });
    const summaryItems = document.getElementById('detail-summary-items');
    if (summaryItems) {
        summaryItems.replaceChildren();
        Object.entries(summaryCounts).forEach(([type, count]) => {
            const iconUrl = (icons[type] && icons[type].options && icons[type].options.iconUrl)
                ? icons[type].options.iconUrl
                : '../images/map/新規マップピン.png';
            const item = document.createElement('span');
            item.className = 'detail-summary-item';
            item.appendChild(createImageNode(iconUrl));
            const countStrong = document.createElement('strong');
            countStrong.textContent = `x${count}`;
            item.appendChild(countStrong);
            summaryItems.appendChild(item);
        });
        if (summaryItems.childElementCount === 0) {
            const empty = document.createElement('span');
            empty.className = 'detail-summary-empty';
            empty.textContent = 'ピンなし';
            summaryItems.appendChild(empty);
        }
    }

    const hasInitialSection = Array.isArray(route.sections)
        && route.sections.length > 0
        && route.sections[0]
        && Array.isArray(route.sections[0].pins);

    if (hasInitialSection) {
        setActiveRouteDetailSection(route, 0, allRoutePins);
    } else {
        renderRouteOnMap(route);
        showRoutePinHighlights([]);
    }

    renderRouteDetailSections(route, allRoutePins);

    // 画面外クリックで一括操作メニューを閉じる
    const closeDropdowns = (e) => {
        if (!e.target.closest('.batch-dropdown')) {
            document.querySelectorAll('.batch-dropdown-content').forEach(el => el.classList.add('hidden'));
            document.removeEventListener('click', closeDropdowns);
        }
    };
    document.addEventListener('click', closeDropdowns, { once: true });

    if (!hasInitialSection) {
        return;
    }
}

function batchMarkSection(pinIds, status, route = currentDetailedRoute) {
    pinIds.forEach(id => {
        const routeScopedPin = getRouteScopedCustomPin(id, route);
        if (routeScopedPin && !customPinById.has(id)) {
            return;
        }
        if (customPinById.has(id)) {
            if (status) customPinObtained.add(id);
            else customPinObtained.delete(id);
            syncCustomPinRecord(id);
            return;
        }
        const resolvedId = resolveCollectibleReferenceId(id, { logLegacyUse: true });
        if (status) obtainedPins.add(resolvedId);
        else obtainedPins.delete(resolvedId);
    });
    saveCustomPins();
    saveObtained();
    saveCustomPinObtained();
    // 全体再構築は避けて見た目だけ同期する
    markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
    customPins.forEach(pin => updateCustomPinObtainedAppearance(pin.id));
    renderCustomPinList();
    refreshMapDisplay();
}

function backToBrowse() {
    setRouteView('browse');
    setCurrentRoute(null);
    focusedRoutePins = null; // ルート絞り込みを解除
    expandedRouteDetailSections = new Set();
    activeRouteDetailSectionIndex = -1;
    refreshMapDisplay();
    const routeSidebarEl = document.getElementById('route-sidebar');
    if (routeSidebarEl) routeSidebarEl.classList.remove('mobile-detail-mode');
    
    document.getElementById('route-browse-view').classList.remove('hidden');
    document.getElementById('route-detail-view').classList.add('hidden');
    document.getElementById('route-browse-header').classList.remove('hidden');
    document.getElementById('route-detail-header').classList.add('hidden');
    document.getElementById('browse-footer').classList.remove('hidden');
    clearRouteVisuals();
    syncActiveRouteScopedCustomPins();
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
            maxZoom: 4,
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
        maxZoom: 4,
        animate: true,
        duration: 0.8
    };
}

function enterCreateMode() {
    if (isMobileUi()) {
        alert('スマホ版ではルート作成・編集は現在準備中です。');
        return;
    }
    setRouteView('create');
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

    // 作成中はソース制限を外して全体を見せる
    setSources(['base', 'dlc']);
    updateSourceButtonState();

    savedActiveTypes = new Set(activeTypes);
    savedActiveDlcTypes = new Set(activeDlcTypes);
    setActiveBaseTypes(new Set(DEFAULT_BASE_TYPES));
    setActiveDlcTypes(new Set(DEFAULT_DLC_TYPES));
    setShowCustomPins(true);
    setCustomPinVisibilitySet(new Set(customPins.map(p => p.id)));

    // 作成中はエリア制限も解除する
    setActiveAreas(new Set(['all']));
    syncAreaSelectionUi('all');
    refreshMapDisplay({ syncButtons: true });
    
    document.getElementById('route-name-input').value = '';
    
    // 新規作成は折りたたみ状態から始める
    creatingRoute = createDefaultRoute();
    activeSectionIndex = 0;
    routePinInsertIndex = null;
    clearOpenPinActionMenu();
    routeIsModified = false;
    updateCreationUI();

    clearRouteVisuals();

    // 作成中はポップアップよりピン追加を優先する
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
    refreshMapDisplay();

    creatingRoute = {
        id: currentDetailedRoute.id,
        name: currentDetailedRoute.name,
        description: currentDetailedRoute.description || '',
        sections: JSON.parse(JSON.stringify(currentDetailedRoute.sections)),
        customPins: JSON.parse(JSON.stringify(currentDetailedRoute.customPins || []))
    };

    // 編集開始時も区間一覧は折りたたみでそろえる
    creatingRoute.sections.forEach(section => section.collapsed = true);

    activeSectionIndex = 0;
    routePinInsertIndex = null;
    clearOpenPinActionMenu();

    setRouteView('create');
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
    setActiveBaseTypes(new Set(activeTypes));
    setActiveDlcTypes(new Set(activeDlcTypes));
    refreshMapDisplay({ syncButtons: true });

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
    setRouteView('browse');
    const routeSidebarEl = document.getElementById('route-sidebar');
    if (routeSidebarEl) routeSidebarEl.classList.remove('mobile-detail-mode');
    focusedRoutePins = null;
    if (savedActiveTypes) {
        setActiveBaseTypes(new Set(savedActiveTypes));
        savedActiveTypes = null;
    }
    if (savedActiveDlcTypes) {
        setActiveDlcTypes(new Set(savedActiveDlcTypes));
        savedActiveDlcTypes = null;
    }
    setRouteCreateActionsVisible(false);
    refreshMapDisplay({ syncButtons: true });
    
    document.getElementById('route-browse-view').classList.remove('hidden');
    document.getElementById('route-create-view').classList.add('hidden');
    document.getElementById('route-browse-header').classList.remove('hidden');
    document.getElementById('route-create-header').classList.add('hidden');
    document.getElementById('browse-footer').classList.remove('hidden');
    document.getElementById('creation-footer').classList.add('hidden');
    const mapActions = document.querySelector('.map-actions');
    if (mapActions) mapActions.classList.remove('hidden');
    routePinInsertIndex = null;
    clearOpenPinActionMenu();
    clearRouteVisuals();

    // 通常表示用のポップアップを戻す
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
            const popup = buildCustomPinPopup(pin);
            marker.bindPopup(popup, { autoPan: false });
        }
    });
}

function addSection(options = {}) {
    const { position = 'after-active' } = options;
    let maxNum = 0;
    creatingRoute.sections.forEach(s => {
        const match = s.name.match(/区間(\d+)/);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
    });
    const nextNum = maxNum + 1;
    const insertIndex = position === 'end'
        ? creatingRoute.sections.length
        : Math.min(activeSectionIndex + 1, creatingRoute.sections.length);
    creatingRoute.sections.splice(insertIndex, 0, { name: `区間${nextNum}`, pins: [] });
    activeSectionIndex = insertIndex;
    routePinInsertIndex = null;
    clearOpenPinActionMenu();
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
    routePinInsertIndex = null;
    clearOpenPinActionMenu();
    routeIsModified = true;
    updateCreationUI();

    updateCreationVisuals();
}

function clearSectionDragIndicators() {
    document.querySelectorAll('.section-card').forEach(card => {
        card.classList.remove('drag-over-top', 'drag-over-bottom');
    });
}

function stopSectionAutoScroll() {
    sectionAutoScrollDirection = 0;
    sectionAutoScrollContainer = null;
    if (sectionAutoScrollFrame !== null) {
        cancelAnimationFrame(sectionAutoScrollFrame);
        sectionAutoScrollFrame = null;
    }
}

function startSectionAutoScroll(container, direction) {
    if (!container || direction === 0) {
        stopSectionAutoScroll();
        return;
    }

    sectionAutoScrollContainer = container;
    sectionAutoScrollDirection = direction;

    if (sectionAutoScrollFrame !== null) return;

    const step = () => {
        if (!sectionAutoScrollContainer || sectionAutoScrollDirection === 0) {
            stopSectionAutoScroll();
            return;
        }

        sectionAutoScrollContainer.scrollTop += sectionAutoScrollDirection * 10;
        sectionAutoScrollFrame = requestAnimationFrame(step);
    };

    sectionAutoScrollFrame = requestAnimationFrame(step);
}

function updateSectionAutoScroll(container, clientY) {
    if (!container || draggedSectionIndex === null) {
        stopSectionAutoScroll();
        return;
    }

    const rect = container.getBoundingClientRect();
    const threshold = 48;

    if (clientY <= rect.top + threshold) {
        startSectionAutoScroll(container, -1);
    } else if (clientY >= rect.bottom - threshold) {
        startSectionAutoScroll(container, 1);
    } else {
        stopSectionAutoScroll();
    }
}

function resetSectionDragState() {
    draggedSectionIndex = null;
    stopSectionAutoScroll();
    document.querySelectorAll('.section-card').forEach(card => {
        card.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom');
    });
}

function moveSection(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= creatingRoute.sections.length) return;

    const [movedSection] = creatingRoute.sections.splice(fromIndex, 1);
    const boundedIndex = Math.max(0, Math.min(toIndex, creatingRoute.sections.length));
    creatingRoute.sections.splice(boundedIndex, 0, movedSection);

    if (activeSectionIndex === fromIndex) {
        activeSectionIndex = boundedIndex;
    } else if (fromIndex < activeSectionIndex && boundedIndex >= activeSectionIndex) {
        activeSectionIndex -= 1;
    } else if (fromIndex > activeSectionIndex && boundedIndex <= activeSectionIndex) {
        activeSectionIndex += 1;
    }

    routePinInsertIndex = null;
    clearOpenPinActionMenu();
    routeIsModified = true;
    updateCreationUI();
    updateCreationVisuals();
}

function toggleSectionCollapse(idx) {
    if (creatingRoute.sections[idx]) {
        creatingRoute.sections[idx].collapsed = !creatingRoute.sections[idx].collapsed;
        clearOpenPinActionMenu();
        updateCreationUI();
    }
}

function clearOpenPinActionMenu() {
    openPinActionSectionIndex = null;
    openPinActionIndex = null;
}

function isPinActionMenuOpen(sIdx, pIdx) {
    return openPinActionSectionIndex === sIdx && openPinActionIndex === pIdx;
}

function selectRoutePinInsertPosition(sIdx, insertIndex) {
    activeSectionIndex = sIdx;
    routePinInsertIndex = insertIndex;
    clearOpenPinActionMenu();
    clearRouteHoverPreview();
    updateCreationUI();
}

function createInsertIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'pin-insert-indicator active';
    indicator.innerText = 'ここに追加されます';
    return indicator;
}

function getRoutePinInsertTargetIndex(section) {
    if (!section || !Number.isInteger(routePinInsertIndex)) return null;
    return Math.max(0, Math.min(routePinInsertIndex, section.pins.length));
}

function canInsertRoutePinAt(section, pinId, insertIndex) {
    if (!section || !Array.isArray(section.pins)) return false;
    const boundedIndex = Math.max(0, Math.min(insertIndex, section.pins.length));
    const prevPinId = boundedIndex > 0 ? section.pins[boundedIndex - 1] : null;
    const nextPinId = boundedIndex < section.pins.length ? section.pins[boundedIndex] : null;
    return prevPinId !== pinId && nextPinId !== pinId;
}

function movePinInSection(sIdx, fromIdx, toIdx) {
    const section = creatingRoute.sections[sIdx];
    if (!section || !Array.isArray(section.pins)) return;
    if (fromIdx === toIdx || fromIdx < 0 || fromIdx >= section.pins.length) return;

    const nextPins = [...section.pins];
    const [pinId] = nextPins.splice(fromIdx, 1);
    const boundedIndex = Math.max(0, Math.min(toIdx, nextPins.length));
    if (boundedIndex === fromIdx) return;

    const prevPinId = boundedIndex > 0 ? nextPins[boundedIndex - 1] : null;
    const nextPinId = boundedIndex < nextPins.length ? nextPins[boundedIndex] : null;
    if (prevPinId === pinId || nextPinId === pinId) return;

    nextPins.splice(boundedIndex, 0, pinId);
    section.pins = nextPins;
    activeSectionIndex = sIdx;
    routePinInsertIndex = null;
    clearOpenPinActionMenu();
    routeIsModified = true;
    clearRouteHoverPreview();
    updateCreationUI();
    updateCreationVisuals();
}

function addPinToRoute(pinId) {
    if (currentRouteView !== 'create') return;

    const resolvedPinId = resolveCollectibleReferenceId(pinId);
    const section = creatingRoute.sections[activeSectionIndex];
    if (!section || !Array.isArray(section.pins)) return;

    const insertIndex = getRoutePinInsertTargetIndex(section);
    const targetIndex = insertIndex === null ? section.pins.length : insertIndex;
    if (!canInsertRoutePinAt(section, resolvedPinId, targetIndex)) return;

    section.pins.splice(targetIndex, 0, resolvedPinId);
    routePinInsertIndex = null;
    clearOpenPinActionMenu();
    routeIsModified = true;
    clearRouteHoverPreview();
    updateCreationUI();

    updateCreationVisuals();
}

function removePinFromRoute(sIdx, pIdx) {
    creatingRoute.sections[sIdx].pins.splice(pIdx, 1);
    routePinInsertIndex = null;
    clearOpenPinActionMenu();
    routeIsModified = true;
    clearRouteHoverPreview();
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
    container.ondragover = (event) => {
        updateSectionAutoScroll(container, event.clientY);
    };

    container.ondragleave = (event) => {
        if (!container.contains(event.relatedTarget)) {
            stopSectionAutoScroll();
        }
    };

    container.ondrop = () => {
        stopSectionAutoScroll();
    };

    creatingRoute.sections.forEach((section, sIdx) => {
        const isActive = sIdx === activeSectionIndex;
        const isCollapsed = section.collapsed || false;
        const card = document.createElement('div');
        card.className = `section-card ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`;
        card.addEventListener('click', () => {
            activeSectionIndex = sIdx;
            routePinInsertIndex = null;
            clearOpenPinActionMenu();
            updateCreationUI();
            updateCreationVisuals();
        });

        const header = document.createElement('div');
        header.className = 'section-header';

        const infoRow = document.createElement('div');
        infoRow.className = 'section-info-row';
        infoRow.style.display = 'flex';
        infoRow.style.alignItems = 'center';
        infoRow.style.gap = '8px';

        const dragHandle = document.createElement('button');
        dragHandle.type = 'button';
        dragHandle.className = 'section-drag-handle';
        dragHandle.draggable = true;
        dragHandle.title = 'ドラッグして区間の順番を入れ替える';
        dragHandle.appendChild(createSvgNode(
            { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'currentColor' },
            [],
            [
                { cx: '9', cy: '6', r: '1.5' },
                { cx: '15', cy: '6', r: '1.5' },
                { cx: '9', cy: '12', r: '1.5' },
                { cx: '15', cy: '12', r: '1.5' },
                { cx: '9', cy: '18', r: '1.5' },
                { cx: '15', cy: '18', r: '1.5' }
            ]
        ));
        dragHandle.addEventListener('click', (event) => event.stopPropagation());
        dragHandle.addEventListener('dragstart', (event) => {
            draggedSectionIndex = sIdx;
            clearSectionDragIndicators();
            card.classList.add('dragging');
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(sIdx));
            }
        });
        dragHandle.addEventListener('dragend', () => {
            resetSectionDragState();
        });

        card.addEventListener('dragover', (event) => {
            if (draggedSectionIndex === null || draggedSectionIndex === sIdx) return;
            event.preventDefault();
            updateSectionAutoScroll(container, event.clientY);
            const rect = card.getBoundingClientRect();
            const insertBefore = event.clientY < rect.top + rect.height / 2;
            clearSectionDragIndicators();
            card.classList.add(insertBefore ? 'drag-over-top' : 'drag-over-bottom');
        });

        card.addEventListener('drop', (event) => {
            if (draggedSectionIndex === null || draggedSectionIndex === sIdx) return;
            event.preventDefault();
            const rect = card.getBoundingClientRect();
            const insertBefore = event.clientY < rect.top + rect.height / 2;
            let targetIndex = insertBefore ? sIdx : sIdx + 1;
            if (draggedSectionIndex < targetIndex) {
                targetIndex -= 1;
            }
            moveSection(draggedSectionIndex, targetIndex);
            resetSectionDragState();
        });

        const collapseBtn = document.createElement('button');
        collapseBtn.type = 'button';
        collapseBtn.className = 'collapse-btn';
        const collapseIcon = createSvgNode(
            { width: '14', height: '14', viewBox: '0 0 24 24', fill: 'currentColor' },
            [{ d: 'M7 10l5 5 5-5z' }]
        );
        collapseIcon.style.transform = `rotate(${isCollapsed ? '-90deg' : '0deg'})`;
        collapseIcon.style.transition = 'transform 0.2s';
        collapseBtn.appendChild(collapseIcon);
        collapseBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleSectionCollapse(sIdx);
        });

        const info = document.createElement('div');
        info.className = 'section-info';

        const sectionNameInput = document.createElement('input');
        sectionNameInput.type = 'text';
        sectionNameInput.className = 'section-name-input';
        sectionNameInput.value = section.name;
        sectionNameInput.placeholder = '区間名を入力';
        sectionNameInput.addEventListener('click', (event) => event.stopPropagation());
        sectionNameInput.addEventListener('input', () => {
            creatingRoute.sections[sIdx].name = sectionNameInput.value;
            routeIsModified = true;
            updateCreationVisuals();
        });

        const sectionStats = document.createElement('span');
        sectionStats.className = 'section-stats';
        sectionStats.innerText = `合計${section.pins.length}個のマップピン`;
        info.append(sectionNameInput, sectionStats);
        infoRow.append(dragHandle, collapseBtn, info);
        header.appendChild(infoRow);

        if (creatingRoute.sections.length > 1) {
            const deleteSectionBtn = document.createElement('button');
            deleteSectionBtn.type = 'button';
            deleteSectionBtn.className = 'delete-section-btn';
            deleteSectionBtn.appendChild(createSvgNode(
                { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'currentColor' },
                [{ d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' }]
            ));
            deleteSectionBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                removeSection(sIdx);
            });
            header.appendChild(deleteSectionBtn);
        }

        const pinList = document.createElement('div');
        pinList.className = 'pin-list';

        if (section.pins.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-pin-msg';
            empty.innerText = '追加したいマップピンを地図上で選択してください';
            pinList.appendChild(empty);
        } else {
            section.pins.forEach((pinId, pIdx) => {
                const isActionOpen = isPinActionMenuOpen(sIdx, pIdx);
                const meta = getRoutePinMeta(pinId, creatingRoute);
                const isInsertAbove = activeSectionIndex === sIdx && routePinInsertIndex === pIdx;
                const isInsertBelow = activeSectionIndex === sIdx
                    && pIdx === section.pins.length - 1
                    && routePinInsertIndex === pIdx + 1;
                const pinItem = document.createElement('div');
                pinItem.className = 'pin-item';

                if (isInsertAbove) {
                    pinItem.appendChild(createInsertIndicator());
                }

                const pinMain = document.createElement('div');
                pinMain.className = 'pin-item-main';

                const order = document.createElement('div');
                order.className = 'pin-order';
                order.innerText = `${pIdx + 1}`;

                const icon = document.createElement('img');
                icon.className = 'pin-icon-sm';
                icon.src = meta ? meta.iconUrl : '';
                icon.alt = '';

                const name = document.createElement('span');
                name.className = 'pin-name';
                name.innerText = meta ? meta.name : '不明なピン';

                const menuToggleBtn = document.createElement('button');
                menuToggleBtn.type = 'button';
                menuToggleBtn.className = 'pin-item-menu-toggle';
                menuToggleBtn.innerText = '⋯';
                menuToggleBtn.title = isActionOpen ? '操作メニューを閉じる' : '操作メニューを開く';
                menuToggleBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    activeSectionIndex = sIdx;
                    routePinInsertIndex = null;
                    if (isActionOpen) {
                        clearOpenPinActionMenu();
                    } else {
                        openPinActionSectionIndex = sIdx;
                        openPinActionIndex = pIdx;
                    }
                    updateCreationUI();
                });

                pinMain.append(order, icon, name, menuToggleBtn);
                pinItem.appendChild(pinMain);

                const actions = document.createElement('div');
                actions.className = `pin-item-actions ${isActionOpen ? 'open' : ''}`;

                if (isActionOpen) {
                    const createActionBtn = (label, className, handler, disabled = false) => {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.className = `pin-item-action-btn ${className}`.trim();
                        button.innerText = label;
                        button.disabled = disabled;
                        button.addEventListener('click', (event) => {
                            event.stopPropagation();
                            handler();
                        });
                        return button;
                    };

                    actions.append(
                        createActionBtn('上へ移動', '', () => movePinInSection(sIdx, pIdx, pIdx - 1), pIdx === 0),
                        createActionBtn('下へ移動', '', () => movePinInSection(sIdx, pIdx, pIdx + 1), pIdx === section.pins.length - 1),
                        createActionBtn('削除', 'danger', () => removePinFromRoute(sIdx, pIdx)),
                        createActionBtn('この上に挿入', '', () => selectRoutePinInsertPosition(sIdx, pIdx)),
                        createActionBtn('この下に挿入', '', () => selectRoutePinInsertPosition(sIdx, pIdx + 1))
                    );
                    pinItem.appendChild(actions);
                }

                if (isInsertBelow) {
                    pinItem.appendChild(createInsertIndicator());
                }

                pinList.appendChild(pinItem);
            });
        }

        card.append(header, pinList);
        container.appendChild(card);
    });

    const addCard = document.createElement('button');
    addCard.type = 'button';
    addCard.className = 'section-add-card';
    const addCardLabel = document.createElement('span');
    addCardLabel.textContent = '＋ 区間を追加';
    addCard.appendChild(addCardLabel);
    addCard.addEventListener('click', (event) => {
        event.stopPropagation();
        addSection({ position: 'end' });
    });
    addCard.addEventListener('dragover', (event) => {
        if (draggedSectionIndex === null) return;
        event.preventDefault();
        updateSectionAutoScroll(container, event.clientY);
        clearSectionDragIndicators();
    });
    addCard.addEventListener('drop', (event) => {
        if (draggedSectionIndex === null) return;
        event.preventDefault();
        moveSection(draggedSectionIndex, creatingRoute.sections.length);
        resetSectionDragState();
    });
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
        {
            selector: '.area-switch-btn',
            mobileSelector: '#mobile-filter-open',
            text: 'ここを押すとマップを切り替えて、特定のマップのマップピンをフィルターできるぞ!'
        },
        { selector: '#toggle-settings-btn', text: 'ここを押すと設定を変更できるぞ!' },
        { selector: '#route-mode-btn', text: 'ここを押すとルートモードに切り替わるぞ!' },
        {
            selector: '.leaflet-control.custom-pin-control .custom-pin-btn',
            mobileSelector: '#mobile-custom-pin-open',
            text: 'ここを押すとカスタムピンを追加できるぞ!'
        }
    ];

    const bubble = overlay.querySelector('.tutorial-bubble');
    const textEl = overlay.querySelector('.tutorial-text');
    const spotlight = overlay.querySelector('.tutorial-spotlight');
    const blockers = ensureTutorialBlockers(overlay);
    const nextBtn = document.getElementById('tutorial-next-btn');
    const skipBtn = document.getElementById('tutorial-skip-btn');
    const actions = overlay.querySelector('.tutorial-actions');
    let tutorialResizeHandler = null;

    function applyStep() {
        const step = steps[tutorialStepIndex];
        const mapRect = document.querySelector('.map-container').getBoundingClientRect();
        const isMobileLayout = window.innerWidth <= 768 || mapRect.width <= 768;
        const targetSelector = isMobileLayout && step.mobileSelector ? step.mobileSelector : step.selector;
        const target = document.querySelector(targetSelector);
        if (!target) {
            finishTutorial();
            return;
        }
        const rect = target.getBoundingClientRect();
        const offsetTop = rect.top - mapRect.top;
        const offsetLeft = rect.left - mapRect.left;

        spotlight.style.top = `${offsetTop - 6}px`;
        spotlight.style.left = `${offsetLeft - 6}px`;
        spotlight.style.width = `${rect.width + 12}px`;
        spotlight.style.height = `${rect.height + 12}px`;
        layoutTutorialBlockers(blockers, mapRect, rect);

        textEl.innerText = step.text && step.text.trim().length > 0
            ? step.text
            : 'ここを押すとマップを切り替えて、特定のマップのマップピンをフィルターできるぞ!';

        bubble.classList.toggle('mobile-layout', isMobileLayout);
        actions.classList.toggle('mobile-layout', isMobileLayout);

        if (isMobileLayout) {
            bubble.style.left = '12px';
            bubble.style.right = '12px';
            bubble.style.width = `${Math.max(0, mapRect.width - 24)}px`;
            actions.classList.remove('top-aligned');

            const actionsHeight = actions.offsetHeight || 56;
            const mobileBottomUiOffset = 128;
            const targetBottom = offsetTop + rect.height;
            const shouldPlaceActionsTop = targetBottom >= mapRect.height - (actionsHeight + 32);
            const bottomReserved = shouldPlaceActionsTop ? 16 : actionsHeight + mobileBottomUiOffset;
            const bubbleHeight = bubble.offsetHeight || 0;
            const belowTop = offsetTop + rect.height + 14;
            const aboveTop = offsetTop - bubbleHeight - 14;
            const maxTop = Math.max(12, mapRect.height - bubbleHeight - bottomReserved);
            let bubbleTop = belowTop;

            if (bubbleTop > maxTop) {
                bubbleTop = aboveTop >= 12 ? aboveTop : maxTop;
            }

            bubble.style.top = `${Math.max(12, Math.min(bubbleTop, maxTop))}px`;
            actions.style.top = '';
            actions.style.left = '';
            actions.style.bottom = '';

            if (shouldPlaceActionsTop) {
                actions.classList.add('top-aligned');
            }
        } else {
            bubble.style.right = '';
            bubble.style.width = '';
            actions.style.bottom = '';
            actions.classList.remove('top-aligned');

            const bubbleLeft = Math.min(offsetLeft, mapRect.width - 380);
            const bubbleHeight = bubble.offsetHeight || 0;
            const actionsHeight = actions.offsetHeight || 56;
            const belowTop = offsetTop + rect.height + 14;
            const aboveTop = offsetTop - bubbleHeight - actionsHeight - 22;
            const maxTop = Math.max(12, mapRect.height - bubbleHeight - actionsHeight - 20);
            const bubbleTop = belowTop <= maxTop ? belowTop : Math.max(12, aboveTop);
            bubble.style.top = `${bubbleTop}px`;
            bubble.style.left = `${Math.max(12, bubbleLeft)}px`;
            actions.style.top = `${bubbleTop + bubble.offsetHeight + 8}px`;
            actions.style.left = `${Math.max(12, bubbleLeft)}px`;
        }

        nextBtn.innerText = tutorialStepIndex === steps.length - 1 ? '完了' : '次へ';
    }

    function finishTutorial() {
        overlay.classList.add('hidden');
        overlay.classList.remove('active');
        bubble.classList.remove('mobile-layout');
        actions.classList.remove('mobile-layout');
        actions.classList.remove('top-aligned');
        if (tutorialResizeHandler) {
            window.removeEventListener('resize', tutorialResizeHandler);
            tutorialResizeHandler = null;
        }
        clearTutorialBlockers(blockers);
        localStorage.setItem(tutorialStorageKey, '1');
    }

    nextBtn.onclick = () => {
        tutorialStepIndex += 1;
        if (tutorialStepIndex >= steps.length) {
            finishTutorial();
        } else {
            applyStep();
        }
    };
    skipBtn.onclick = finishTutorial;

    overlay.classList.remove('hidden');
    overlay.classList.add('active');
    tutorialResizeHandler = () => applyStep();
    window.addEventListener('resize', tutorialResizeHandler);
    applyStep();
}

function ensureTutorialBlockers(overlay) {
    const blockers = [];
    for (let i = 0; i < 4; i += 1) {
        let blocker = overlay.querySelector(`[data-tutorial-blocker="${i}"]`);
        if (!blocker) {
            blocker = document.createElement('div');
            blocker.className = 'tutorial-blocker';
            blocker.dataset.tutorialBlocker = `${i}`;
            overlay.appendChild(blocker);
        }
        blockers.push(blocker);
    }
    return blockers;
}

function layoutTutorialBlockers(blockers, containerRect, targetRect) {
    if (!Array.isArray(blockers) || blockers.length !== 4) return;

    const top = Math.max(0, targetRect.top - containerRect.top - 6);
    const left = Math.max(0, targetRect.left - containerRect.left - 6);
    const width = Math.max(0, targetRect.width + 12);
    const height = Math.max(0, targetRect.height + 12);
    const containerWidth = Math.max(0, containerRect.width);
    const containerHeight = Math.max(0, containerRect.height);
    const right = Math.min(containerWidth, left + width);
    const bottom = Math.min(containerHeight, top + height);

    const frames = [
        { top: 0, left: 0, width: containerWidth, height: top },
        { top, left: 0, width: left, height: Math.max(0, bottom - top) },
        { top, left: right, width: Math.max(0, containerWidth - right), height: Math.max(0, bottom - top) },
        { top: bottom, left: 0, width: containerWidth, height: Math.max(0, containerHeight - bottom) }
    ];

    blockers.forEach((blocker, index) => {
        const frame = frames[index];
        blocker.style.top = `${frame.top}px`;
        blocker.style.left = `${frame.left}px`;
        blocker.style.width = `${frame.width}px`;
        blocker.style.height = `${frame.height}px`;
        blocker.classList.toggle('hidden', frame.width <= 0 || frame.height <= 0);
    });
}

function clearTutorialBlockers(blockers) {
    if (!Array.isArray(blockers)) return;
    blockers.forEach(blocker => {
        blocker.style.top = '0px';
        blocker.style.left = '0px';
        blocker.style.width = '0px';
        blocker.style.height = '0px';
        blocker.classList.add('hidden');
    });
}

function getRouteTutorialTargetRoute() {
    if (Array.isArray(trendRoutes) && trendRoutes.length > 0) return trendRoutes[0];
    if (Array.isArray(myRoutes) && myRoutes.length > 0) return myRoutes[0];
    return null;
}

function getRouteTutorialCardRoute() {
    const baseRoute = getRouteTutorialTargetRoute();
    if (!baseRoute) return null;
    return {
        ...baseRoute,
        id: '__route_tutorial_card__',
        name: 'チュートリアル用ルート',
        description: 'このカードを押してルート詳細を開こう',
        __isTutorialRoute: true
    };
}

function prepareRouteTutorialBrowse(tab = 'trend', showTutorialRoute = false) {
    routeTutorialShowcaseVisible = showTutorialRoute;
    backToBrowse();
    if (activeRouteTab !== tab) {
        switchRouteTab(tab);
    } else {
        renderRouteList();
    }
}

function handleRouteTutorialCardClick() {
    const route = getRouteTutorialTargetRoute();
    if (!route) return;
    routeTutorialShowcaseVisible = false;
    showRouteDetail(route);
    if (routeTutorialActive) {
        routeTutorialStepIndex = 2;
        if (typeof routeTutorialResolveStep === 'function') {
            routeTutorialResolveStep();
        }
    }
}

function prepareRouteTutorialSectionStep() {
    const route = getRouteTutorialTargetRoute();
    if (!route) return false;
    routeTutorialShowcaseVisible = false;
    if (currentDetailedRoute !== route || currentRouteView !== 'detail') {
        showRouteDetail(route);
    } else {
        renderRouteDetailSections(route, getRouteDetailAllPins(route));
    }
    return true;
}

function finishRouteTutorial(markSeen = true) {
    if (!routeTutorialActive) return;

    const overlay = document.getElementById('map-tutorial');
    const bubble = overlay ? overlay.querySelector('.tutorial-bubble') : null;
    const actions = overlay ? overlay.querySelector('.tutorial-actions') : null;
    const blockers = overlay ? ensureTutorialBlockers(overlay) : [];

    routeTutorialActive = false;
    routeTutorialStepIndex = 0;
    routeTutorialShowcaseVisible = false;
    routeTutorialResolveStep = null;

    if (routeTutorialResizeHandler) {
        window.removeEventListener('resize', routeTutorialResizeHandler);
        routeTutorialResizeHandler = null;
    }

    if (currentDetailedRoute) {
        renderRouteDetailSections(currentDetailedRoute, getRouteDetailAllPins(currentDetailedRoute));
    }

    if (overlay) {
        overlay.classList.add('hidden');
        overlay.classList.remove('active');
        overlay.classList.remove('tutorial-soft-focus');
    }
    if (bubble) bubble.classList.remove('mobile-layout');
    if (actions) {
        actions.classList.remove('mobile-layout');
        actions.classList.remove('top-aligned');
    }
    clearTutorialBlockers(blockers);

    if (markSeen) {
        localStorage.setItem(routeTutorialStorageKey, '1');
    }
}

function initRouteTutorial() {
    const overlay = document.getElementById('map-tutorial');
    const routeSidebar = document.getElementById('route-sidebar');
    if (!overlay || !routeSidebar || routeSidebar.classList.contains('hidden')) return;
    if (localStorage.getItem(routeTutorialStorageKey)) return;
    if (routeTutorialActive) return;
    if (overlay.classList.contains('active')) return;

    const steps = [
        {
            selector: '.route-tabs',
            prepare: () => prepareRouteTutorialBrowse('trend', false),
            text: 'トレンドルートにはおすすめのルート、マイルートには自分で作ったルートが並ぶぞ!'
        },
        {
            selector: '[data-route-tutorial-card=\"true\"]',
            prepare: () => prepareRouteTutorialBrowse('trend', true),
            text: 'チュートリアル中だけこのルートが表示されるぞ! 実際に押してルート詳細を開いてみよう!',
            advanceOnTargetClick: true,
            lightenBackground: true
        },
        {
            selector: '#detail-sections-list',
            prepare: () => prepareRouteTutorialSectionStep(),
            text: 'ルートを開いたら区間を押してみよう! 押した区間の場所へマップがズームするぞ!',
            lightenBackground: true
        },
        {
            selector: '#start-create-route-btn',
            prepare: () => prepareRouteTutorialBrowse('my', false),
            text: 'ここを押すと新しいルートを作成できるぞ! 自分だけの周回ルートをまとめたい時に使ってくれ!'
        }
    ];

    const bubble = overlay.querySelector('.tutorial-bubble');
    const textEl = overlay.querySelector('.tutorial-text');
    const spotlight = overlay.querySelector('.tutorial-spotlight');
    const blockers = ensureTutorialBlockers(overlay);
    const nextBtn = document.getElementById('tutorial-next-btn');
    const skipBtn = document.getElementById('tutorial-skip-btn');
    const actions = overlay.querySelector('.tutorial-actions');

    function resolveRouteTutorialStep() {
        while (routeTutorialStepIndex < steps.length) {
            const step = steps[routeTutorialStepIndex];
            const prepared = step.prepare ? step.prepare() : true;
            if (prepared === false) {
                routeTutorialStepIndex += 1;
                continue;
            }

            overlay.classList.toggle('tutorial-soft-focus', !!step.lightenBackground);

            const mapRect = document.querySelector('.map-container').getBoundingClientRect();
            const isMobileLayout = window.innerWidth <= 768 || mapRect.width <= 768;
            const target = document.querySelector(step.selector);
            if (!target) {
                routeTutorialStepIndex += 1;
                continue;
            }

            const rect = target.getBoundingClientRect();
            const offsetTop = rect.top - mapRect.top;
            const offsetLeft = rect.left - mapRect.left;

            spotlight.style.top = `${offsetTop - 6}px`;
            spotlight.style.left = `${offsetLeft - 6}px`;
            spotlight.style.width = `${rect.width + 12}px`;
            spotlight.style.height = `${rect.height + 12}px`;
            layoutTutorialBlockers(blockers, mapRect, rect);

            textEl.innerText = step.text;
            bubble.classList.toggle('mobile-layout', isMobileLayout);
            actions.classList.toggle('mobile-layout', isMobileLayout);

            if (isMobileLayout) {
                bubble.style.left = '12px';
                bubble.style.right = '12px';
                bubble.style.width = `${Math.max(0, mapRect.width - 24)}px`;
                actions.classList.remove('top-aligned');

                const actionsHeight = actions.offsetHeight || 56;
                const mobileBottomUiOffset = 128;
                const targetBottom = offsetTop + rect.height;
                const shouldPlaceActionsTop = targetBottom >= mapRect.height - (actionsHeight + 32);
                const bottomReserved = shouldPlaceActionsTop ? 16 : actionsHeight + mobileBottomUiOffset;
                const bubbleHeight = bubble.offsetHeight || 0;
                const belowTop = offsetTop + rect.height + 14;
                const aboveTop = offsetTop - bubbleHeight - 14;
                const maxTop = Math.max(12, mapRect.height - bubbleHeight - bottomReserved);
                let bubbleTop = belowTop;

                if (bubbleTop > maxTop) {
                    bubbleTop = aboveTop >= 12 ? aboveTop : maxTop;
                }

                bubble.style.top = `${Math.max(12, Math.min(bubbleTop, maxTop))}px`;
                actions.style.top = '';
                actions.style.left = '';
                actions.style.bottom = '';

                if (shouldPlaceActionsTop) {
                    actions.classList.add('top-aligned');
                }
            } else {
                bubble.style.right = '';
                bubble.style.width = '';
                actions.style.bottom = '';
                actions.classList.remove('top-aligned');

                const bubbleLeft = Math.min(offsetLeft, mapRect.width - 380);
                const bubbleHeight = bubble.offsetHeight || 0;
                const actionsHeight = actions.offsetHeight || 56;
                const belowTop = offsetTop + rect.height + 14;
                const aboveTop = offsetTop - bubbleHeight - actionsHeight - 22;
                const maxTop = Math.max(12, mapRect.height - bubbleHeight - actionsHeight - 20);
                const bubbleTop = belowTop <= maxTop ? belowTop : Math.max(12, aboveTop);
                bubble.style.top = `${bubbleTop}px`;
                bubble.style.left = `${Math.max(12, bubbleLeft)}px`;
                actions.style.top = `${bubbleTop + bubble.offsetHeight + 8}px`;
                actions.style.left = `${Math.max(12, bubbleLeft)}px`;
            }

            if (step.advanceOnTargetClick) {
                nextBtn.innerText = 'このルートを押す';
            } else {
                nextBtn.innerText = routeTutorialStepIndex === steps.length - 1 ? '完了' : '次へ';
            }
            return true;
        }

        finishRouteTutorial(true);
        return false;
    }

    routeTutorialActive = true;
    routeTutorialStepIndex = 0;
    overlay.classList.remove('hidden');
    overlay.classList.add('active');

    const handleNext = () => {
        const step = steps[routeTutorialStepIndex];
        if (step && step.advanceOnTargetClick) {
            return;
        }
        routeTutorialStepIndex += 1;
        resolveRouteTutorialStep();
    };
    const handleSkip = () => finishRouteTutorial(true);

    nextBtn.onclick = handleNext;
    skipBtn.onclick = handleSkip;

    routeTutorialResizeHandler = () => {
        if (!routeTutorialActive) return;
        resolveRouteTutorialStep();
    };
    window.addEventListener('resize', routeTutorialResizeHandler);
    routeTutorialResolveStep = resolveRouteTutorialStep;

    resolveRouteTutorialStep();
}


function saveMyRoute() {
    const nameInput = document.getElementById('route-name-input');
    const descInput = document.getElementById('route-desc-input');
    const rawName = nameInput ? nameInput.value : '';
    const rawDesc = descInput ? descInput.value : '';
    const name = rawName.trim();
    const desc = rawDesc.trim();

    const routeValidationError = validateRouteInput({
        name,
        description: desc,
        isNewRoute: !creatingRoute.id
    });
    if (routeValidationError) {
        showToast(routeValidationError, 'error');
        return;
    }

    const totalPins = creatingRoute.sections.reduce((sum, s) => sum + s.pins.length, 0);
    if (totalPins < 1) {
        showToast('ピンを少なくとも1つ追加してください', 'error');
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
        // 既存ルートを更新
        const idx = myRoutes.findIndex(r => r.id === creatingRoute.id);
        if (idx !== -1) {
            // UI 専用フラグは保存前に落とす
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
        // 新規ルートを追加
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

    saveMyRoutes();
    routeIsModified = false;
    exitCreateMode();

    renderRouteList();
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
    const normalizedMode = normalizeOverlayMode(mode);
    if (!mapOverlayPaths[normalizedMode]) return;
    if (currentMapOverlay && typeof currentMapOverlay.setUrl === 'function') {
        currentMapOverlay.setUrl(mapOverlayPaths[normalizedMode]);
    } else {
        if (currentMapOverlay) {
            map.removeLayer(currentMapOverlay);
        }
        currentMapOverlay = L.imageOverlay(mapOverlayPaths[normalizedMode], bounds).addTo(map);
    }
    setOverlay(normalizedMode);

    const baseBtn = document.getElementById('map-overlay-base-btn');
    const dlcBtn = document.getElementById('map-overlay-dlc-btn');
    const routeBaseBtn = document.getElementById('route-map-base-btn');
    const routeDlcBtn = document.getElementById('route-map-dlc-btn');
    if (baseBtn) baseBtn.classList.toggle('active', normalizedMode === 'base');
    if (dlcBtn) dlcBtn.classList.toggle('active', normalizedMode === 'dlc');
    if (routeBaseBtn) routeBaseBtn.classList.toggle('active', normalizedMode === 'base');
    if (routeDlcBtn) routeDlcBtn.classList.toggle('active', normalizedMode === 'dlc');

    refreshMapDisplay();

    if (currentRouteView === 'create') {
        updateCreationVisuals();
    }

    savePreferences();
}

function togglePinBulkSidebar(forceOpen = null) {
    const sidebar = document.getElementById('pin-bulk-sidebar');
    if (!sidebar) return;
    const settingsPopover = document.getElementById('settings-popover');
    const settingsBtn = document.getElementById('toggle-settings-btn');
    const isHidden = sidebar.classList.contains('hidden');
    const willOpen = forceOpen === null ? isHidden : forceOpen;
    if (willOpen) {
        // 右側 UI は同時に 1 つだけ開く
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
    const typeList = getBulkManageablePinTypes();

    typeList.forEach(item => {
        const row = document.createElement('div');
        row.className = 'pin-bulk-item';
        const iconUrl = item.type === 'custom'
            ? '../images/map/新規マップピン.png'
            : (icons[item.type]?.options?.iconUrl);
        const info = document.createElement('div');
        info.className = 'pin-bulk-info';
        info.appendChild(createImageNode(iconUrl || ''));
        const label = document.createElement('span');
        label.textContent = item.label;
        info.appendChild(label);

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

    const resolvedTargetPinId = resolveCollectibleReferenceId(targetPinId);
    const insertIndex = getRoutePinInsertTargetIndex(section);
    const targetIndex = insertIndex === null ? section.pins.length : insertIndex;

    let fromPinId = null;
    let toPinId = null;

    if (targetIndex <= 0) {
        fromPinId = resolvedTargetPinId;
        toPinId = section.pins[0];
    } else {
        fromPinId = section.pins[targetIndex - 1];
        toPinId = resolvedTargetPinId;
    }

    if (!fromPinId || !toPinId || fromPinId === toPinId) return;

    const fromMeta = getRoutePinMeta(fromPinId, creatingRoute);
    const toMeta = getRoutePinMeta(toPinId, creatingRoute);
    if (!fromMeta || !toMeta) return;
    clearRouteHoverPreview();
    const previewColor = getSectionColor(activeSectionIndex);
    routeHoverLine = L.polyline([fromMeta.latlng, toMeta.latlng], {
        color: previewColor,
        weight: 2,
        dashArray: '6 6',
        opacity: 0.9
    }).addTo(map);
    if (L.polylineDecorator && L.Symbol && typeof L.Symbol.arrowHead === 'function') {
        routeHoverDecorator = L.polylineDecorator(routeHoverLine, {
            patterns: [
                { offset: '60%', repeat: 0, symbol: L.Symbol.arrowHead({ pixelSize: 10, polygon: true, pathOptions: { color: previewColor, fillColor: previewColor, weight: 1, opacity: 1, fillOpacity: 1 } }) }
            ]
        }).addTo(map);
    }
}

function clearObtainedByType(type) {
    if (type === 'custom') {
        customPinObtained.clear();
        syncAllCustomPinRecords();
        saveCustomPins();
        saveCustomPinObtained();
        customPins.forEach(pin => updateCustomPinObtainedAppearance(pin.id));
        renderCustomPinList();
    } else {
        collectibles.forEach(item => {
            if (item.type === type) obtainedPins.delete(item.id);
        });
        saveObtained();
        markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
    }
    refreshMapDisplay();
}

function zoomToArea(areaId) {
    if (areaId === 'all') {
        map.fitBounds(bounds, { paddingTopLeft: [320, 0], paddingBottomRight: [0, 0], animate: true, duration: 0.8 });
        return;
    }

    const areaMeta = getAreaMeta(areaId);
    const areaPins = markers.filter(m => m.item.areaId === areaId);
    if (areaMeta.source === 'dlc') {
        map.fitBounds(bounds, { paddingTopLeft: [320, 0], paddingBottomRight: [0, 0], animate: true, duration: 0.8 });
        return;
    }
    if (areaPins.length === 0) return;

    const latlngs = areaPins.map(m => m.marker.getLatLng());
    const areaBounds = L.latLngBounds(latlngs);
    const targetMaxZoom = areaMeta.deepZoom ? 2.0 : 1.5;
    map.fitBounds(areaBounds.pad(0.2), {
        paddingTopLeft: [320, 0],
        paddingBottomRight: [100, 100],
        maxZoom: targetMaxZoom,
        animate: true,
        duration: 0.8
    });
}

function selectArea(areaValue) {
    const areaMeta = getAreaMeta(areaValue);
    const areaId = areaMeta.id;

    if (currentRouteView === 'create') {
        if (areaMeta.source === 'dlc') {
            setMapOverlay('dlc');
        } else if (areaId !== 'all') {
            setMapOverlay('base');
        }
        zoomToArea(areaId);
        return;
    }

    const nextAreas = new Set(['all']);
    if (areaId !== 'all') {
        nextAreas.clear();
        nextAreas.add(areaId);
        setMapOverlay(areaMeta.source === 'dlc' ? 'dlc' : 'base');
    }
    setActiveAreas(nextAreas);
    syncAreaSelectionUi(areaId);
    zoomToArea(areaId);
    refreshMapDisplay();
}

function updatePinCounts(stats = collectVisiblePinStats()) {
    document.querySelectorAll('.filter-type-btn[data-filter-context="main"]').forEach(btn => {
        const type = btn.dataset.type;
        const source = btn.dataset.source;
        const countSpan = btn.querySelector('.pin-count');
        if (countSpan) {
            const total = source === 'dlc'
                ? (stats.dlcTotals[type] || 0)
                : source === 'base'
                    ? (stats.baseTotals[type] || 0)
                    : (stats.baseTotals[type] || 0) + (stats.dlcTotals[type] || 0);
            const obtained = source === 'dlc'
                ? (stats.dlcObtainedTotals[type] || 0)
                : source === 'base'
                    ? (stats.baseObtainedTotals[type] || 0)
                    : (stats.baseObtainedTotals[type] || 0) + (stats.dlcObtainedTotals[type] || 0);
            countSpan.innerText = `${obtained}/${total}`;
        }
    });
}

function syncFilterButtons() {
    document.querySelectorAll('.filter-type-btn[data-type]').forEach(btn => {
        const t = btn.dataset.type;
        const source = btn.dataset.source;
        if (!t) return;
        const pinMeta = getPinMeta(t);
        const enabled = source
            ? isTypeActive(t, source)
            : (pinMeta.sources || ['base']).every(src => isTypeActive(t, src));
        btn.classList.toggle('active', enabled);
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

function updateRouteFilterPanelCounts(stats = collectVisiblePinStats()) {
    document.querySelectorAll('#route-filter-panel .filter-type-btn').forEach(btn => {
        const t = btn.dataset.type;
        const source = btn.dataset.source;
        const countSpan = btn.querySelector('.route-filter-count');
        if (!countSpan) return;
        const total = source === 'dlc' ? (stats.dlcTotals[t] || 0) : (stats.baseTotals[t] || 0);
        countSpan.innerText = `${total}`;
    });
}

function updateQuickView(visibleTypes) {
    const container = document.getElementById('route-quickview-list');
    if (!container) return;
    if (currentRouteView !== 'create') {
        if (container.childElementCount > 0) {
            container.innerHTML = '';
        }
        lastQuickViewTypesKey = '';
        return;
    }

    const types = [...visibleTypes];
    const nextQuickViewTypesKey = types.join('|');
    if (lastQuickViewTypesKey === nextQuickViewTypesKey) {
        return;
    }
    lastQuickViewTypesKey = nextQuickViewTypesKey;
    container.innerHTML = '';

    types.forEach(type => {
        const iconUrl = (icons[type] && icons[type].options && icons[type].options.iconUrl) ? icons[type].options.iconUrl : null;
        if (!iconUrl) return;
        const btn = document.createElement('button');
        btn.className = 'quickview-icon';
        btn.dataset.type = type;
        btn.appendChild(createImageNode(iconUrl));
        btn.addEventListener('click', () => {
            toggleTypeFilter(type);
            refreshMapDisplay({ syncButtons: true });
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

init();

