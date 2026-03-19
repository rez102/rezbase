const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomControl: false // 手動で右側に配置するなど調整可能
});

// ズームコントロールを右上に配置
L.control.zoom({ position: 'topright' }).addTo(map);

const w = 1120;
const h = 1120;
const bounds = [[0, 0], [h, w]];
L.imageOverlay('../images/maneater_map.png', bounds).addTo(map);
map.fitBounds(bounds);

// アイコン定義
const icons = {
    landmark: L.icon({ iconUrl: '../images/map/ランドマーク.png', iconSize: [32, 32], iconAnchor: [16, 26], popupAnchor: [0, -20] }),
    nutrient: L.icon({ iconUrl: '../images/map/栄養箱.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    plate: L.icon({ iconUrl: '../images/map/ナンバープレート.png', iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -10] }),
    'main-quest': L.icon({ iconUrl: '../images/map/メインクエスト.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    'sub-quest': L.icon({ iconUrl: '../images/map/手配.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    grate: L.icon({ iconUrl: '../images/map/人間狩り.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
};

// 収集物データ（ID付与とサンプルデータ追加）
const collectiblesData = [
    { type: "landmark", area: "フォーティック・バイユー", lat: 677.25, lng: 922.3, name: "バイユーの看板" },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 682.26, lng: 898.26, name: "栄養箱" },
    { type: "landmark", area: "フォーティック・バイユー", lat: 728.99, lng: 900.01, name: "沈没船" },
    { type: "main-quest", area: "フォーティック・バイユー", lat: 710, lng: 880, name: "チュートリアル" },
    { type: "sub-quest", area: "フォーティック・バイユー", lat: 740, lng: 860, name: "ワニの討伐" },
    { type: "grate", area: "フォーティック・バイユー", lat: 780, lng: 800, name: "鉄格子の扉" },
    // ... 既存のデータも ID つきで管理されるように以下で処理 ...
];

// 既存の collectibles データを流用しつつ ID を付与
const rawCollectibles = [
    { type: "landmark", area: "フォーティック・バイユー", lat: 677.25, lng: 922.3 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 682.26, lng: 898.26 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 728.99, lng: 900.01 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 754.23, lng: 909.25 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 759.48, lng: 855.28 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 777.47, lng: 852.03 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 788.22, lng: 868.77 },
    { type: "plate", area: "フォーティック・バイユー", lat: 791.47, lng: 788.31 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 779.72, lng: 771.32 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 789.72, lng: 762.32 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 802.71, lng: 733.08 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 815.21, lng: 734.33 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 820.7, lng: 749.83 },
    { type: "plate", area: "フォーティック・バイユー", lat: 810.21, lng: 752.08 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 818.45, lng: 781.81 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 851.69, lng: 803.8 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 835.95, lng: 831.54 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 840.94, lng: 840.79 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 837.95, lng: 864.52 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 855.44, lng: 865.02 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 880.68, lng: 889.26 },
    { type: "plate", area: "フォーティック・バイユー", lat: 895.92, lng: 903.01 },
    { type: "plate", area: "フォーティック・バイユー", lat: 706.31, lng: 877.72 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 686.32, lng: 829.74 },
    { type: "plate", area: "フォーティック・バイユー", lat: 733.05, lng: 850.98 },
    { type: "plate", area: "フォーティック・バイユー", lat: 721.06, lng: 784.51 },
    { type: "landmark", area: "フォーティック・バイユー", lat: 703.32, lng: 764.52 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 812.02, lng: 886.96 },
    { type: "plate", area: "フォーティック・バイユー", lat: 827.26, lng: 928.69 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 844, lng: 916.95 },
    { type: "plate", area: "フォーティック・バイユー", lat: 879.99, lng: 754.52 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 880.49, lng: 743.78 },
    { type: "plate", area: "フォーティック・バイユー", lat: 851.75, lng: 733.03 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 861.25, lng: 750.28 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 755.54, lng: 745.28 },
    { type: "nutrient", area: "フォーティック・バイユー", lat: 762.04, lng: 793.01 },
    { type: "plate", area: "フォーティック・バイユー", lat: 730.55, lng: 746.28 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 749.52, lng: 658.21 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 738.78, lng: 642.97 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 717.54, lng: 656.46 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 738.53, lng: 615.98 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 780.76, lng: 615.48 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 784.26, lng: 617.23 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 823.49, lng: 614.97 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 830.74, lng: 646.72 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 706.01, lng: 483.28 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 792.54, lng: 560.73 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 813.53, lng: 563.48 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 820.28, lng: 569.97 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 806.54, lng: 516.25 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 830.53, lng: 526.49 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 842.52, lng: 500.51 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 872.01, lng: 482.51 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 900.25, lng: 496.76 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 918.24, lng: 486.51 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 898.25, lng: 455.78 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 883, lng: 437.29 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 839.77, lng: 637.03 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 823.28, lng: 388.56 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 806.8, lng: 362.47 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 821.29, lng: 344.73 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 777.56, lng: 355.23 },
    { type: "plate", area: "デッド・ホース・レイク", lat: 792.25, lng: 419.97 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 707.79, lng: 376.97 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 699.05, lng: 371.72 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 657.81, lng: 451.69 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 691.05, lng: 490.17 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 733.29, lng: 481.22 },
    { type: "landmark", area: "デッド・ホース・レイク", lat: 759.03, lng: 490.96 },
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 769.28, lng: 474.97 },
    { type: "plate", area: "ゴールデン・ショア", lat: 721.79, lng: 282.47 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 696.55, lng: 221.47 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 680.8, lng: 196.23 },
    { type: "plate", area: "ゴールデン・ショア", lat: 677.8, lng: 212.97 },
    { type: "landmark", area: "ゴールデン・ショア", lat: 669.81, lng: 242.21 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 665.56, lng: 227.96 },
    { type: "plate", area: "ゴールデン・ショア", lat: 671.56, lng: 254.2 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 656.06, lng: 212.47 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 656.06, lng: 297.18 },
    { type: "landmark", area: "ゴールデン・ショア", lat: 644.32, lng: 294.43 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 637.32, lng: 236.71 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 644.57, lng: 323.92 },
    { type: "landmark", area: "ゴールデン・ショア", lat: 629.57, lng: 221.22 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 633.07, lng: 214.22 },
    { type: "landmark", area: "ゴールデン・ショア", lat: 616.58, lng: 217.47 },
    { type: "landmark", area: "ゴールデン・ショア", lat: 623.58, lng: 192.98 },
    { type: "plate", area: "ゴールデン・ショア", lat: 609.58, lng: 240.21 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 616.58, lng: 280.94 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 614.58, lng: 312.68 },
    { type: "plate", area: "ゴールデン・ショア", lat: 624.08, lng: 342.41 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 638.79, lng: 367.46 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 610.55, lng: 358.46 },
    { type: "plate", area: "ゴールデン・ショア", lat: 603.05, lng: 287 },
    { type: "landmark", area: "ゴールデン・ショア", lat: 590.06, lng: 271.5 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 598.06, lng: 253.76 },
    { type: "plate", area: "ゴールデン・ショア", lat: 575.31, lng: 170.31 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 574.56, lng: 159.31 },
    { type: "plate", area: "ゴールデン・ショア", lat: 589.3, lng: 377.71 },
    { type: "landmark", area: "ゴールデン・ショア", lat: 585.31, lng: 409.45 },
    { type: "plate", area: "ゴールデン・ショア", lat: 569.55, lng: 315.7 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 556.3, lng: 340.19 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 543.50, lng: 305.55 },
    { type: "plate", area: "ゴールデン・ショア", lat: 540.56, lng: 274.72 },
    { type: "nutrient", area: "ゴールデン・ショア", lat: 547.55, lng: 260.48 },
    { type: "landmark", area: "ゴールデン・ショア", lat: 497.08, lng: 237.49 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 486.29, lng: 262.21 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 468.8, lng: 263.21 },
    { type: "landmark", area: "サファリア・ベイ", lat: 458.81, lng: 269.95 },
    { type: "plate", area: "サファリア・ベイ", lat: 448.56, lng: 244.46 },
    { type: "plate", area: "サファリア・ベイ", lat: 413.56, lng: 261.46 },
    { type: "landmark", area: "サファリア・ベイ", lat: 385.3, lng: 280.72 },
    { type: "landmark", area: "サファリア・ベイ", lat: 400.3, lng: 326.69 },
    { type: "plate", area: "サファリア・ベイ", lat: 365.56, lng: 321.2 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 352.82, lng: 288.71 },
    { type: "plate", area: "サファリア・ベイ", lat: 347.82, lng: 286.71 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 375.81, lng: 362.18 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 402.00, lng: 242.27 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 404.04, lng: 138.22 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 420.03, lng: 141.97 },
    { type: "plate", area: "サファリア・ベイ", lat: 400.79, lng: 169.96 },
    { type: "landmark", area: "サファリア・ベイ", lat: 336.32, lng: 157.46 },
    { type: "plate", area: "サファリア・ベイ", lat: 327.07, lng: 148.47 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 326.82, lng: 134.72 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 335.32, lng: 148.97 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 330.57, lng: 162.71 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 341.06, lng: 205.2 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 360.05, lng: 225.94 },
    { type: "landmark", area: "サファリア・ベイ", lat: 322.07, lng: 232.68 },
    { type: "plate", area: "サファリア・ベイ", lat: 303.83, lng: 248.68 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 293.83, lng: 244.93 },
    { type: "plate", area: "サファリア・ベイ", lat: 274.34, lng: 222.44 },
    { type: "landmark", area: "サファリア・ベイ", lat: 260.85, lng: 231.18 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 263.54, lng: 254.30 },
    { type: "plate", area: "サファリア・ベイ", lat: 238.8, lng: 182 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 213.32, lng: 153.01 },
    { type: "landmark", area: "サファリア・ベイ", lat: 204.82, lng: 205.74 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 198.57, lng: 248.72 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 174.55, lng: 237.51 },
    { type: "landmark", area: "サファリア・ベイ", lat: 211.03, lng: 292.73 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 241.02, lng: 313.21 },
    { type: "plate", area: "サファリア・ベイ", lat: 291.26, lng: 355.94 },
    { type: "nutrient", area: "サファリア・ベイ", lat: 297, lng: 313.71 },
];

// ID 割り当てと統合
const collectibles = [];
let idCounter = 0;

// サンプルの新しいタイプを追加
[
    { type: "main-quest", area: "フォーティック・バイユー", lat: 710, lng: 880, name: "チュートリアル" },
    { type: "sub-quest", area: "デッド・ホース・レイク", lat: 740, lng: 600, name: "ワニの討伐" },
    { type: "grate", area: "ゴールデン・ショア", lat: 600, lng: 300, name: "封鎖された運河" },
].forEach(d => {
    collectibles.push({ ...d, id: `extra-${idCounter++}` });
});

rawCollectibles.forEach((d, index) => {
    collectibles.push({ 
        ...d, 
        id: `${d.type}-${index}`,
        name: d.type === 'landmark' ? 'ランドマーク' : d.type === 'nutrient' ? '栄養箱' : 'ナンバープレート'
    });
});

// 状態管理
let activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'grate']);
let activeAreas = new Set();
let obtainedPins = new Set(JSON.parse(localStorage.getItem('maneater_obtained_pins') || '[]'));
let showObtained = true;
let batchMode = false;
let selectedPinsBatch = new Set();
let routeMode = false;
let currentRoutePoints = [];
let routes = JSON.parse(localStorage.getItem('maneater_routes') || '[]');
let currentPolyline = null;

const markers = [];

// 初期化
function init() {
    renderMarkers();
    renderRoutes();
    setupEventListeners();
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
                L.DomEvent.stopPropagation(e);
            } else if (routeMode) {
                addToRoute(item.id, marker);
                L.DomEvent.stopPropagation(e);
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
        marker.bindPopup(popupContent);

        markers.push({ marker, item });
        updateMarkerAppearance(marker, item.id);
    });

    applyFilter();
}

function updateMarkerAppearance(marker, id) {
    const el = marker.getElement();
    if (!el) {
        marker.on('add', () => updateMarkerAppearance(marker, id));
        return;
    }

    if (obtainedPins.has(id)) {
        el.classList.add('marker-obtained');
    } else {
        el.classList.remove('marker-obtained');
    }

    if (selectedPinsBatch.has(id)) {
        el.classList.add('marker-selected');
    } else {
        el.classList.remove('marker-selected');
    }
}

function applyFilter() {
    let visibleCount = 0;
    markers.forEach(({ marker, item }) => {
        const typeOk = activeTypes.has(item.type);
        const areaOk = activeAreas.size === 0 || activeAreas.has(item.area);
        const obtainedOk = showObtained || !obtainedPins.has(item.id);

        if (typeOk && areaOk && obtainedOk) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
            visibleCount++;
        } else {
            if (map.hasLayer(marker)) {
                marker.remove();
            }
        }
    });
    console.log(`Apply Filter: showObtained=${showObtained}, visibleCount=${visibleCount}`);
}

// 取得済み切り替え（ポップアップから呼ばれる用）
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
        // ポップアップ内のボタン表示も更新
        const btn = target.marker.getPopup().getElement().querySelector('.obtained-toggle');
        if (btn) {
            btn.classList.toggle('active');
            btn.innerText = obtainedPins.has(id) ? '✓ 取得済み' : '取得済みにする';
        }
    }
    applyFilter();
};

function saveObtained() {
    localStorage.setItem('maneater_obtained_pins', JSON.stringify([...obtainedPins]));
}

// バッチモード
window.startBatchFromPopup = function() {
    map.closePopup();
    setBatchMode(true);
};

function setBatchMode(active) {
    batchMode = active;
    selectedPinsBatch.clear();
    document.getElementById('batch-controls').classList.toggle('hidden', !active);
    document.getElementById('map-sidebar').classList.toggle('hidden', active);
    document.querySelector('.map-actions').classList.toggle('hidden', active);
    updateBatchCount();
    
    // 全マーカーの外見更新
    markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
}

function toggleBatchSelection(id, marker) {
    if (selectedPinsBatch.has(id)) {
        selectedPinsBatch.delete(id);
    } else {
        selectedPinsBatch.add(id);
    }
    updateMarkerAppearance(marker, id);
    updateBatchCount();
}

function updateBatchCount() {
    document.getElementById('selected-count').innerText = selectedPinsBatch.size;
}

// ルート作成
function toggleRouteMode() {
    routeMode = !routeMode;
    document.getElementById('route-mode-btn').classList.toggle('active', routeMode);
    document.getElementById('route-panel').classList.toggle('active', routeMode);
    
    if (!routeMode) {
        if (currentPolyline) {
            currentPolyline.remove();
            currentPolyline = null;
        }
        currentRoutePoints = [];
    }
}

function addToRoute(id, marker) {
    const latlng = marker.getLatLng();
    currentRoutePoints.push(latlng);
    
    if (currentPolyline) {
        currentPolyline.setLatLngs(currentRoutePoints);
    } else {
        currentPolyline = L.polyline(currentRoutePoints, { color: '#00ffff', weight: 4, dashArray: '10, 10' }).addTo(map);
    }

    // 簡易的に最後の地点で保存ダイアログ（本来はサイドバーでやるべき）
    if (currentRoutePoints.length >= 2) {
        // 保存の案内などを出しても良い
    }
}

function renderRoutes() {
    const list = document.getElementById('route-list');
    if (routes.length === 0) {
        list.innerHTML = '<div class="empty-msg">保存されたルートはありません</div>';
        return;
    }
    list.innerHTML = '';
    routes.forEach(r => {
        const div = document.createElement('div');
        div.className = 'route-card';
        div.innerHTML = `
            <div class="route-info">
                <strong>${r.name}</strong>
                <span>${r.points.length} ピン</span>
            </div>
        `;
        div.onclick = () => showRoute(r);
        list.appendChild(div);
    });
}

function showRoute(r) {
    if (currentPolyline) currentPolyline.remove();
    currentPolyline = L.polyline(r.points, { color: '#00ffff', weight: 4 }).addTo(map);
    map.fitBounds(currentPolyline.getBounds());
}

// イベントリスナー
function setupEventListeners() {
    // フィルター（タイプ）
    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const t = btn.dataset.type;
            if (activeTypes.has(t)) {
                activeTypes.delete(t);
                btn.classList.remove('active');
            } else {
                activeTypes.add(t);
                btn.classList.add('active');
            }
            applyFilter();
        });
    });

    // フィルター（エリア）
    document.querySelectorAll('.filter-area-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const a = btn.dataset.area;
            if (activeAreas.has(a)) {
                activeAreas.delete(a);
                btn.classList.remove('active');
            } else {
                activeAreas.add(a);
                btn.classList.add('active');
            }
            applyFilter();
        });
    });

    // リセット
    document.getElementById('reset-filters-btn').addEventListener('click', () => {
        activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'grate']);
        activeAreas.clear();
        document.querySelectorAll('.filter-type-btn, .filter-area-btn').forEach(btn => {
            if (btn.classList.contains('filter-type-btn')) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        applyFilter();
    });

    // 表示トグル
    document.getElementById('toggle-obtained-btn').addEventListener('click', (e) => {
        showObtained = !showObtained;
        e.currentTarget.classList.toggle('active', !showObtained);
        applyFilter();
    });

    // ルートモード
    document.getElementById('route-mode-btn').addEventListener('click', toggleRouteMode);

    // ルート保存
    document.getElementById('save-route-btn').addEventListener('click', () => {
        const name = document.getElementById('route-name-input').value.trim();
        if (!name) {
            alert('ルート名を入力してください');
            return;
        }
        if (currentRoutePoints.length < 2) {
            alert('ピンを2つ以上選択してください');
            return;
        }
        
        routes.push({
            name: name,
            points: [...currentRoutePoints]
        });
        localStorage.setItem('maneater_routes', JSON.stringify(routes));
        
        document.getElementById('route-name-input').value = '';
        currentRoutePoints = [];
        if (currentPolyline) currentPolyline.remove();
        currentPolyline = null;
        
        renderRoutes();
        alert('ルートを保存しました');
    });

    // バッチ OK/キャンセル
    document.getElementById('batch-cancel-btn').addEventListener('click', () => setBatchMode(false));
    document.getElementById('batch-ok-btn').addEventListener('click', () => {
        selectedPinsBatch.forEach(id => obtainedPins.add(id));
        saveObtained();
        setBatchMode(false);
        applyFilter();
    });
}

// 実行
init();