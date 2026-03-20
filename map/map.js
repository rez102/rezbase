const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomControl: false,
    doubleClickZoom: false // 連打時のズーム/移動を防止
});

// ズームコントロールを右上に配置
L.control.zoom({ position: 'topright' }).addTo(map);

const w = 1120;
const h = 1120;
const bounds = [[0, 0], [h, w]];
L.imageOverlay('../images/maneater_map.png', bounds).addTo(map);
map.fitBounds(bounds, { paddingTopLeft: [320, 0] });

// デバッグ用：クリックした座標と洞窟当たり判定を表示
map.on('click', function(e) {
    console.log(`lat: ${e.latlng.lat.toFixed(2)}, lng: ${e.latlng.lng.toFixed(2)}`);

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
});

// アイコン定義
const icons = {
    landmark: L.icon({ iconUrl: '../images/map/ランドマーク.png', iconSize: [32, 32], iconAnchor: [16, 26], popupAnchor: [0, -20] }),
    nutrient: L.icon({ iconUrl: '../images/map/栄養箱.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    plate: L.icon({ iconUrl: '../images/map/ナンバープレート.png', iconSize: [38, 38], iconAnchor: [19, 19], popupAnchor: [0, -10] }),
    'main-quest': L.icon({ iconUrl: '../images/map/メインクエスト.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    'sub-quest': L.icon({ iconUrl: '../images/map/手配.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    manhunt: L.icon({ iconUrl: '../images/map/人間狩り.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    grate: L.icon({ iconUrl: '../images/map/鉄格子.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    floodgate: L.icon({ iconUrl: '../images/map/水門.png', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -10] }),
    cave: L.icon({ iconUrl: '../images/map/洞窟.png', iconSize: [34, 34], iconAnchor: [17, 20], popupAnchor: [0, -12], className: 'cave-marker-invisible' }),
};

// 収集物データ
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
    { type: "nutrient", area: "デッド・ホース・レイク", lat: 844.77, lng: 408.53 },
    { type: "floodgate", area: "デッド・ホース・レイク", lat: 714.75, lng: 582.79 },
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
    { type: "landmark", area: "プロスピリティー・サンド", lat: 489.01, lng: 526.21 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 484.26, lng: 512.96 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 527.24, lng: 471.73 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 507, lng: 445.24 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 484.76, lng: 480.48 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 535.99, lng: 562.94 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 552.01, lng: 475.78 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 573.22, lng: 501.22 },
    { type: "floodgate", area: "プロスピリティー・サンド", lat: 548.27, lng: 423.54 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 573.97, lng: 522.46 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 606.96, lng: 536.95 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 602.21, lng: 563.69 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 595.96, lng: 564.69 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 622.7, lng: 576.93 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 562.23, lng: 561.94 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 574.22, lng: 587.18 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 538.72, lng: 609.46 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 514.71, lng: 610.21 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 464.95, lng: 639.7 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 452.19, lng: 571.23 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 435.94, lng: 622.95 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 564.52, lng: 488.28 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 429.19, lng: 495.51 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 375.42, lng: 522 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 377.42, lng: 553.49 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 349.42, lng: 540.99 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 328.91, lng: 514.25 },
    { type: "landmark", area: "プロスピリティー・サンド", lat: 320.41, lng: 489.51 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 306.65, lng: 471.52 },
    { type: "plate", area: "プロスピリティー・サンド", lat: 323.91, lng: 432.04 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 352.7, lng: 591.45 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 355.45, lng: 582.46 },
    { type: "nutrient", area: "プロスピリティー・サンド", lat: 383.96, lng: 584.46 },
    { type: "landmark", area: "キャビアキー", lat: 703.75, lng: 614.71 },
    { type: "plate", area: "キャビアキー", lat: 660.74, lng: 635.2 },
    { type: "nutrient", area: "キャビアキー", lat: 668.24, lng: 665.44 },
    { type: "nutrient", area: "キャビアキー", lat: 651.49, lng: 703.92 },
    { type: "plate", area: "キャビアキー", lat: 636.98, lng: 681.18 },
    { type: "nutrient", area: "キャビアキー", lat: 624.73, lng: 659.19 },
    { type: "nutrient", area: "キャビアキー", lat: 637.71, lng: 612.22 },
    { type: "landmark", area: "キャビアキー", lat: 603.45, lng: 642.45 },
    { type: "plate", area: "キャビアキー", lat: 586.21, lng: 661.21 },
    { type: "landmark", area: "キャビアキー", lat: 628.72, lng: 756.17 },
    { type: "plate", area: "キャビアキー", lat: 595.46, lng: 705.44 },
    { type: "nutrient", area: "キャビアキー", lat: 601.21, lng: 738.93 },
    { type: "plate", area: "キャビアキー", lat: 576.2, lng: 762.91 },
    { type: "nutrient", area: "キャビアキー", lat: 557.45, lng: 794.9 },
    { type: "landmark", area: "キャビアキー", lat: 523.94, lng: 725.93 },
    { type: "nutrient", area: "キャビアキー", lat: 525.44, lng: 695.7 },
    { type: "plate", area: "キャビアキー", lat: 517.44, lng: 695.45 },
    { type: "plate", area: "キャビアキー", lat: 524.69, lng: 650.97 },
    { type: "nutrient", area: "キャビアキー", lat: 486.97, lng: 695.96 },
    { type: "landmark", area: "キャビアキー", lat: 474.22, lng: 700.2 },
    { type: "nutrient", area: "キャビアキー", lat: 470.22, lng: 745.18 },
    { type: "plate", area: "キャビアキー", lat: 440.46, lng: 721.94 },
    { type: "nutrient", area: "キャビアキー", lat: 427.7, lng: 656.72 },
    { type: "landmark", area: "キャビアキー", lat: 464.72, lng: 780.18 },
    { type: "nutrient", area: "キャビアキー", lat: 515.22, lng: 839.96 },
    { type: "plate", area: "キャビアキー", lat: 507.97, lng: 901.68 },
    { type: "landmark", area: "キャビアキー", lat: 517.72, lng: 936.42 },
    { type: "landmark", area: "キャビアキー", lat: 563.50, lng: 738.54 },
    { type: "nutrient", area: "キャビアキー", lat: 588.01, lng: 738.56 },
    { type: "nutrient", area: "キャビアキー", lat: 548.77, lng: 693.55 },
    { type: "plate", area: "キャビアキー", lat: 670.51, lng: 686.28 },
    { type: "floodgate", area: "キャビアキー", lat: 670.76, lng: 736.81 },
    { type: "nutrient", area: "湾岸", lat: 371.43, lng: 751.52 },
    { type: "landmark", area: "湾岸", lat: 385.46, lng: 681.25 },
    { type: "nutrient", area: "湾岸", lat: 376.96, lng: 665.25 },
    { type: "plate", area: "湾岸", lat: 367.71, lng: 681.259 },
    { type: "plate", area: "湾岸", lat: 346.45, lng: 665.5 },
    { type: "nutrient", area: "湾岸", lat: 250.44, lng: 422.99 },
    { type: "nutrient", area: "湾岸", lat: 266.7, lng: 424.74 },
    { type: "nutrient", area: "湾岸", lat: 263.7, lng: 457.25 },
    { type: "nutrient", area: "湾岸", lat: 219.89, lng: 379.99 },
    { type: "plate", area: "湾岸", lat: 191.38, lng: 371.99 },
    { type: "nutrient", area: "湾岸", lat: 163.37, lng: 384.99 },
    { type: "nutrient", area: "湾岸", lat: 183.38, lng: 406.49 },
    { type: "plate", area: "湾岸", lat: 199.38, lng: 455 },
    { type: "nutrient", area: "湾岸", lat: 221.39, lng: 475.5 },
    { type: "nutrient", area: "湾岸", lat: 168.88, lng: 471.5 },
    { type: "landmark", area: "湾岸", lat: 192.38, lng: 483.5 },
    { type: "nutrient", area: "湾岸", lat: 207.89, lng: 500.5 },
    { type: "nutrient", area: "湾岸", lat: 266.4, lng: 515 },
    { type: "nutrient", area: "湾岸", lat: 252.9, lng: 531.01 },
    { type: "landmark", area: "湾岸", lat: 227.39, lng: 517 },
    { type: "plate", area: "湾岸", lat: 272.41, lng: 537.01 },
    { type: "plate", area: "湾岸", lat: 267.9, lng: 575.51 },
    { type: "plate", area: "湾岸", lat: 213.89, lng: 560.51 },
    { type: "landmark", area: "湾岸", lat: 311.92, lng: 582.51 },
    { type: "nutrient", area: "湾岸", lat: 305.9, lng: 611.51 },
    { type: "nutrient", area: "湾岸", lat: 256.89, lng: 605.01 },
    { type: "landmark", area: "湾岸", lat: 432.22, lng: 840.75 },
    { type: "nutrient", area: "湾岸", lat: 434.72, lng: 824.5 },
    { type: "nutrient", area: "湾岸", lat: 473.98, lng: 912.5 },
    { type: "landmark", area: "湾岸", lat: 469.48, lng: 918.51 },
    { type: "landmark", area: "湾岸", lat: 424.50, lng: 902.51 },
    { type: "nutrient", area: "湾岸", lat: 416.28, lng: 878.29 },
    { type: "plate", area: "湾岸", lat: 378.95, lng: 857.01 },
    { type: "nutrient", area: "湾岸", lat: 460.45, lng: 945.51 },
    { type: "landmark", area: "湾岸", lat: 382.43, lng: 949.51 },
    { type: "plate", area: "湾岸", lat: 437.445, lng: 963.01 },
    { type: "nutrient", area: "湾岸", lat: 437.44, lng: 977.51 },
    { type: "landmark", area: "湾岸", lat: 502.46, lng: 1055.02 },
    { type: "nutrient", area: "湾岸", lat: 490.96, lng: 1044.02 },
    { type: "plate", area: "湾岸", lat: 471.95, lng: 1086.52 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 707.73, lng: 963.25 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 768.49, lng: 969 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 755.74, lng: 993 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 738.73, lng: 1010.25 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 728.73, lng: 993.75 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 718.48, lng: 987.5 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 694.22, lng: 983.25 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 686.97, lng: 994 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 677.47, lng: 1029.26 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 653.96, lng: 985.75 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 654.71, lng: 1005 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 644.96, lng: 1026.76 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 681.97, lng: 1051.26 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 620.21, lng: 1037 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 643.46, lng: 1063.01 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 611.45, lng: 1060.76 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 591.45, lng: 1016.25 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 592.95, lng: 986.75 },
    { type: "plate", area: "クローフィッシュ・ベイ", lat: 575.94, lng: 971.75 },
    { type: "nutrient", area: "クローフィッシュ・ベイ", lat: 667.26, lng: 980.04 },

    // === Quests & Grates ===
    // Fortick Bayou
    { type: "main-quest", area: "フォーティック・バイユー", lat: 703.02, lng: 932.13 },
    { type: "main-quest", area: "フォーティック・バイユー", lat: 694.52, lng: 919.88 },
    { type: "main-quest", area: "フォーティック・バイユー", lat: 688.27, lng: 839.12 },
    { type: "main-quest", area: "フォーティック・バイユー", lat: 744.12, lng: 888.13 },
    { type: "main-quest", area: "フォーティック・バイユー", lat: 782.02, lng: 789.5 },
    { type: "main-quest", area: "フォーティック・バイユー", lat: 821.4, lng: 924.25 },
    { type: "main-quest", area: "フォーティック・バイユー", lat: 820.89, lng: 870.88 },
    { type: "sub-quest", area: "フォーティック・バイユー", lat: 723.55, lng: 760.25 },
    { type: "sub-quest", area: "フォーティック・バイユー", lat: 823.75, lng: 736.75 },
    { type: "sub-quest", area: "フォーティック・バイユー", lat: 779.79, lng: 836.01 },
    { type: "sub-quest", area: "フォーティック・バイユー", lat: 830.02, lng: 852.76 },
    { type: "grate", area: "フォーティック・バイユー", lat: 849.78, lng: 909.26 },
    { type: "grate", area: "フォーティック・バイユー", lat: 846.98, lng: 763.98 },
    { type: "grate", area: "フォーティック・バイユー", lat: 838.48, lng: 733.73 },
    { type: "grate", area: "フォーティック・バイユー", lat: 819.49, lng: 763.48 },
    { type: "grate", area: "フォーティック・バイユー", lat: 788.5, lng: 719.72 },
    { type: "grate", area: "フォーティック・バイユー", lat: 759.76, lng: 784.73 },

    // Dead Horse Lake
    { type: "main-quest", area: "デッド・ホース・レイク", lat: 788.79, lng: 610.75 },
    { type: "main-quest", area: "デッド・ホース・レイク", lat: 769.54, lng: 660.75 },
    { type: "main-quest", area: "デッド・ホース・レイク", lat: 821.52, lng: 654 },
    { type: "main-quest", area: "デッド・ホース・レイク", lat: 805.78, lng: 531.76 },
    { type: "main-quest", area: "デッド・ホース・レイク", lat: 895.01, lng: 460.51 },
    { type: "main-quest", area: "デッド・ホース・レイク", lat: 831.54, lng: 385 },
    { type: "main-quest", area: "デッド・ホース・レイク", lat: 731.33, lng: 452.26 },
    { type: "main-quest", area: "デッド・ホース・レイク", lat: 730.08, lng: 465.51 },
    { type: "sub-quest", area: "デッド・ホース・レイク", lat: 760.05, lng: 613.01 },
    { type: "sub-quest", area: "デッド・ホース・レイク", lat: 858.28, lng: 507.51 },
    { type: "sub-quest", area: "デッド・ホース・レイク", lat: 817.29, lng: 434.51 },
    { type: "sub-quest", area: "デッド・ホース・レイク", lat: 733.54, lng: 423.76 },
    { type: "manhunt", area: "デッド・ホース・レイク", lat: 830, lng: 478.51 },
    { type: "manhunt", area: "デッド・ホース・レイク", lat: 815.51, lng: 352.5 },
    { type: "manhunt", area: "デッド・ホース・レイク", lat: 708.28, lng: 371.25 },
    { type: "manhunt", area: "デッド・ホース・レイク", lat: 656.02, lng: 450 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 800.03, lng: 666.26 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 795.54, lng: 661.01 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 732.79, lng: 656.01 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 720.3, lng: 646.26 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 753.03, lng: 612.51 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 900.47, lng: 480.5 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 815.79, lng: 425.26 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 812.54, lng: 370.75 },
    { type: "grate", area: "デッド・ホース・レイク", lat: 832.78, lng: 382.75 },

    // Golden Shore
    { type: "main-quest", area: "ゴールデン・ショア", lat: 606.06, lng: 393.26 },
    { type: "main-quest", area: "ゴールデン・ショア", lat: 604.29, lng: 327.01 },
    { type: "main-quest", area: "ゴールデン・ショア", lat: 687.5, lng: 311.51 },
    { type: "main-quest", area: "ゴールデン・ショア", lat: 669.51, lng: 264.25 },
    { type: "main-quest", area: "ゴールデン・ショア", lat: 650.02, lng: 269 },
    { type: "main-quest", area: "ゴールデン・ショア", lat: 651.39, lng: 213.5 },
    { type: "main-quest", area: "ゴールデン・ショア", lat: 575.67, lng: 214.25 },
    { type: "main-quest", area: "ゴールデン・ショア", lat: 647.54, lng: 260.76 },
    { type: "sub-quest", area: "ゴールデン・ショア", lat: 688.52, lng: 214.26 },
    { type: "sub-quest", area: "ゴールデン・ショア", lat: 600.79, lng: 257.51 },
    { type: "sub-quest", area: "ゴールデン・ショア", lat: 545.84, lng: 233.76 },
    { type: "sub-quest", area: "ゴールデン・ショア", lat: 611.56, lng: 347.01 },
    { type: "manhunt", area: "ゴールデン・ショア", lat: 702.01, lng: 262.26 },
    { type: "manhunt", area: "ゴールデン・ショア", lat: 644.53, lng: 341.26 },
    { type: "manhunt", area: "ゴールデン・ショア", lat: 579.56, lng: 264.5 },
    { type: "manhunt", area: "ゴールデン・ショア", lat: 559.82, lng: 313.25 },
    { type: "grate", area: "ゴールデン・ショア", lat: 641.05, lng: 218.01 },
    { type: "grate", area: "ゴールデン・ショア", lat: 682.28, lng: 222.26 },
    { type: "grate", area: "ゴールデン・ショア", lat: 598.04, lng: 198.26 },
    { type: "grate", area: "ゴールデン・ショア", lat: 604.79, lng: 164.26 },
    { type: "grate", area: "ゴールデン・ショア", lat: 627.03, lng: 249.01 },
    { type: "grate", area: "ゴールデン・ショア", lat: 616.04, lng: 271.76 },
    { type: "grate", area: "ゴールデン・ショア", lat: 617.79, lng: 293.01 },
    { type: "grate", area: "ゴールデン・ショア", lat: 637.28, lng: 350.76 },
    { type: "grate", area: "ゴールデン・ショア", lat: 616.04, lng: 368.26 },

    // Safaria Bay
    { type: "main-quest", area: "サファリア・ベイ", lat: 345.79, lng: 281.01 },
    { type: "main-quest", area: "サファリア・ベイ", lat: 410.52, lng: 88.01 },
    { type: "main-quest", area: "サファリア・ベイ", lat: 327.54, lng: 113.26 },
    { type: "main-quest", area: "サファリア・ベイ", lat: 357.07, lng: 180.51 },
    { type: "main-quest", area: "サファリア・ベイ", lat: 318.09, lng: 193.01 },
    { type: "main-quest", area: "サファリア・ベイ", lat: 272.61, lng: 156.51 },
    { type: "main-quest", area: "サファリア・ベイ", lat: 337.58, lng: 250.52 },
    { type: "main-quest", area: "サファリア・ベイ", lat: 179.1, lng: 208.51 },
    { type: "main-quest", area: "サファリア・ベイ", lat: 276.56, lng: 364.02 },
    { type: "sub-quest", area: "サファリア・ベイ", lat: 380.01, lng: 116.51 },
    { type: "sub-quest", area: "サファリア・ベイ", lat: 382.01, lng: 226.02 },
    { type: "sub-quest", area: "サファリア・ベイ", lat: 225.58, lng: 322.52 },
    { type: "sub-quest", area: "サファリア・ベイ", lat: 123.12, lng: 274.52 },
    { type: "manhunt", area: "サファリア・ベイ", lat: 289.08, lng: 246.01 },
    { type: "manhunt", area: "サファリア・ベイ", lat: 233.6, lng: 219.51 },
    { type: "manhunt", area: "サファリア・ベイ", lat: 398.07, lng: 155.51 },
    { type: "manhunt", area: "サファリア・ベイ", lat: 432.56, lng: 274.52 },
    { type: "grate", area: "サファリア・ベイ", lat: 405.57, lng: 178 },
    { type: "grate", area: "サファリア・ベイ", lat: 390.29, lng: 109.51 },
    { type: "grate", area: "サファリア・ベイ", lat: 356.8, lng: 155.26 },
    { type: "grate", area: "サファリア・ベイ", lat: 324.07, lng: 257.76 },
    { type: "grate", area: "サファリア・ベイ", lat: 362.38, lng: 342.75 },

    // Prosperity Sands
    { type: "main-quest", area: "プロスピリティー・サンド", lat: 524.5, lng: 447.26 },
    { type: "main-quest", area: "プロスピリティー・サンド", lat: 476.53, lng: 477.26 },
    { type: "main-quest", area: "プロスピリティー・サンド", lat: 504.01, lng: 520.26 },
    { type: "main-quest", area: "プロスピリティー・サンド", lat: 522.53, lng: 631.26 },
    { type: "main-quest", area: "プロスピリティー・サンド", lat: 351.22, lng: 533.04 },
    { type: "main-quest", area: "プロスピリティー・サンド", lat: 338.22, lng: 473.08 },
    { type: "main-quest", area: "プロスピリティー・サンド", lat: 417.52, lng: 587.76 },
    { type: "main-quest", area: "プロスピリティー・サンド", lat: 418.77, lng: 572.01 },
    { type: "sub-quest", area: "プロスピリティー・サンド", lat: 592.78, lng: 527.01 },
    { type: "sub-quest", area: "プロスピリティー・サンド", lat: 565.52, lng: 607.51 },
    { type: "sub-quest", area: "プロスピリティー・サンド", lat: 441.83, lng: 629.01 },
    { type: "sub-quest", area: "プロスピリティー・サンド", lat: 407.59, lng: 528 },
    { type: "manhunt", area: "プロスピリティー・サンド", lat: 524.51, lng: 509.01 },
    { type: "manhunt", area: "プロスピリティー・サンド", lat: 444.05, lng: 571.02 },
    { type: "manhunt", area: "プロスピリティー・サンド", lat: 532.5, lng: 614.01 },
    { type: "manhunt", area: "プロスピリティー・サンド", lat: 597.77, lng: 562.76 },
    { type: "grate", area: "プロスピリティー・サンド", lat: 530.54, lng: 466.01 },
    { type: "grate", area: "プロスピリティー・サンド", lat: 551.53, lng: 534.01 },
    { type: "grate", area: "プロスピリティー・サンド", lat: 569.28, lng: 560.01 },
    { type: "grate", area: "プロスピリティー・サンド", lat: 514.3, lng: 616.26 },
    { type: "grate", area: "プロスピリティー・サンド", lat: 378.29, lng: 564.76 },

    // Caviar Key
    { type: "main-quest", area: "キャビアキー", lat: 667.52, lng: 644.01 },
    { type: "main-quest", area: "キャビアキー", lat: 620.29, lng: 733.26 },
    { type: "main-quest", area: "キャビアキー", lat: 586.06, lng: 706.26 },
    { type: "main-quest", area: "キャビアキー", lat: 552.53, lng: 782.76 },
    { type: "main-quest", area: "キャビアキー", lat: 478.29, lng: 703.26 },
    { type: "main-quest", area: "キャビアキー", lat: 467.55, lng: 710.01 },
    { type: "main-quest", area: "キャビアキー", lat: 453.78, lng: 797.01 },
    { type: "sub-quest", area: "キャビアキー", lat: 641.03, lng: 671.01 },
    { type: "sub-quest", area: "キャビアキー", lat: 686.28, lng: 621.26 },
    { type: "sub-quest", area: "キャビアキー", lat: 633.26, lng: 737.01 },
    { type: "sub-quest", area: "キャビアキー", lat: 509.09, lng: 823.12 },
    { type: "manhunt", area: "キャビアキー", lat: 642.53, lng: 613.5 },
    { type: "manhunt", area: "キャビアキー", lat: 679.02, lng: 672.01 },
    { type: "manhunt", area: "キャビアキー", lat: 603.53, lng: 743.76 },
    { type: "manhunt", area: "キャビアキー", lat: 514.31, lng: 901.26 },
    { type: "grate", area: "キャビアキー", lat: 642.78, lng: 596.26 },
    { type: "grate", area: "キャビアキー", lat: 634.53, lng: 623.51 },
    { type: "grate", area: "キャビアキー", lat: 633.03, lng: 665.26 },
    { type: "grate", area: "キャビアキー", lat: 579.81, lng: 703.76 },
    { type: "grate", area: "キャビアキー", lat: 528.33, lng: 668.51 },
    { type: "grate", area: "キャビアキー", lat: 593.8, lng: 743.76 },
    { type: "grate", area: "キャビアキー", lat: 538.07, lng: 770.51 },
    { type: "grate", area: "キャビアキー", lat: 478.79, lng: 723.76 },
    { type: "grate", area: "キャビアキー", lat: 463.05, lng: 689.25 },
    { type: "grate", area: "キャビアキー", lat: 472.04, lng: 898.51 },

    // Gulf
    { type: "main-quest", area: "湾岸", lat: 389.04, lng: 735.5 },
    { type: "main-quest", area: "湾岸", lat: 379.07, lng: 764.01 },
    { type: "main-quest", area: "湾岸", lat: 356.08, lng: 783.51 },
    { type: "main-quest", area: "湾岸", lat: 390.57, lng: 880.52 },
    { type: "main-quest", area: "湾岸", lat: 427.55, lng: 1071.53 },
    { type: "main-quest", area: "湾岸", lat: 258.57, lng: 570.02 },
    { type: "main-quest", area: "湾岸", lat: 228.09, lng: 632.02 },
    { type: "main-quest", area: "湾岸", lat: 235.59, lng: 637.02 },
    { type: "main-quest", area: "湾岸", lat: 342.04, lng: 657.52 },
    { type: "sub-quest", area: "湾岸", lat: 371.03, lng: 729.03 },
    { type: "sub-quest", area: "湾岸", lat: 149.48, lng: 405.42 },
    { type: "sub-quest", area: "湾岸", lat: 215.95, lng: 528.92 },
    { type: "sub-quest", area: "湾岸", lat: 454.54, lng: 967.4 },
    { type: "manhunt", area: "湾岸", lat: 472.53, lng: 920.39 },
    { type: "manhunt", area: "湾岸", lat: 369.59, lng: 691.01 },
    { type: "manhunt", area: "湾岸", lat: 297.12, lng: 558.5 },
    { type: "manhunt", area: "湾岸", lat: 186.67, lng: 548.5 },
    { type: "grate", area: "湾岸", lat: 319.50, lng: 582.07 },
    { type: "grate", area: "湾岸", lat: 339.53, lng: 616.01 },
    { type: "grate", area: "湾岸", lat: 247.09, lng: 538.51 },
    { type: "grate", area: "湾岸", lat: 207.1, lng: 514.51 },
    { type: "grate", area: "湾岸", lat: 255.08, lng: 471.51 },
    { type: "grate", area: "湾岸", lat: 210.05, lng: 371.51 },
    { type: "grate", area: "湾岸", lat: 224.04, lng: 393.01 },
    { type: "grate", area: "湾岸", lat: 181.56, lng: 460.02 },
    { type: "grate", area: "湾岸", lat: 476.56, lng: 962.51 },
    { type: "grate", area: "湾岸", lat: 487.06, lng: 1013.01 },
    { type: "grate", area: "湾岸", lat: 443.08, lng: 989.01 },
    { type: "grate", area: "湾岸", lat: 444.77, lng: 1013.07 },
    { type: "grate", area: "湾岸", lat: 433.58, lng: 1045.01 },

    // Crawfish Bay
    { type: "grate", area: "クローフィッシュ・ベイ", lat: 720.03, lng: 946.76 },
    { type: "grate", area: "クローフィッシュ・ベイ", lat: 688.3, lng: 1019.51 },
    { type: "grate", area: "クローフィッシュ・ベイ", lat: 638.07, lng: 1046.01 },
    { type: "grate", area: "クローフィッシュ・ベイ", lat: 585.81, lng: 1018.01 },
    { type: "main-quest", area: "クローフィッシュ・ベイ", lat: 721.04, lng: 959.51 },
    { type: "main-quest", area: "クローフィッシュ・ベイ", lat: 732.03, lng: 979.51 },
    { type: "main-quest", area: "フォーティック・バイユー", lat: 714.77, lng: 897.53 },

    // 洞窟ピン（追加リクエスト）
    { type: "cave", area: "洞窟", lat: 714.04, lng: 902.05 },
    { type: "cave", area: "洞窟", lat: 698.80, lng: 969.81 },
    { type: "cave", area: "洞窟", lat: 624.77, lng: 730.05 },
    { type: "cave", area: "洞窟", lat: 801.01, lng: 534.79 },
    { type: "cave", area: "洞窟", lat: 596.27, lng: 326.04 },
    { type: "cave", area: "洞窟", lat: 501.27, lng: 527.79 },
    { type: "cave", area: "洞窟", lat: 316.77, lng: 198.29 },
    { type: "cave", area: "洞窟", lat: 393.04, lng: 743.78 },
];

// --- ルートシステムの状態管理 ---
let currentSidebar = 'main'; // 'main' or 'route'
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

// 洞窟ゾーン（当たり判定用）
const caveCircleLayers = [];
const CAVE_HIT_RADIUS = 10; // ピクセル相当として扱う（小さめ）
const CAVE_DISPLAY_RADIUS = 10;

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

rawCollectibles.forEach((d, index) => {
    let name = d.type;
    if (d.type === 'landmark') name = 'ランドマーク';
    else if (d.type === 'nutrient') name = '栄養箱';
    else if (d.type === 'plate') name = 'ナンバープレート';
    else if (d.type === 'main-quest') name = 'メインクエスト';
    else if (d.type === 'sub-quest') name = '狩猟クエスト';
    else if (d.type === 'manhunt') name = '復讐クエスト';
    else if (d.type === 'grate') name = '鉄格子';
    else if (d.type === 'floodgate') name = '水門';
    else if (d.type === 'cave') name = '洞窟';

    collectibles.push({ 
        ...d, 
        id: `${d.type}-${index}`,
        name: name,
        source: d.source || 'base' // base or dlc
    });
});

// 状態管理
let activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'manhunt', 'grate', 'floodgate', 'cave']);
let activeAreas = new Set();
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

// 初期化
function init() {
    renderMarkers();
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
                L.DomEvent.stop(e);
            } else if (currentRouteView === 'create') {
                addPinToRoute(item.id);
                L.DomEvent.stop(e);
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

function applyFilter() {
    let visibleCount = 0;
    markers.forEach(({ marker, item }) => {
        let isVisible = false;

        if (focusedRoutePins) {
            isVisible = focusedRoutePins.has(item.id);
        } else {
            const typeOk = activeTypes.has(item.type);
            const areaOk = activeAreas.size === 0 || activeAreas.has(item.area);
            const sourceOk = activeSources.size === 0 || activeSources.has(item.source);
            const obtainedOk = showObtained || !obtainedPins.has(item.id);
            isVisible = typeOk && areaOk && sourceOk && obtainedOk;
        }

        if (isVisible) {
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

    // 洞窟当たり判定円の表示制御
    caveCircleLayers.forEach(({ circle, item }) => {
        const typeOk = activeTypes.has(item.type);
        const areaOk = activeAreas.size === 0 || activeAreas.has(item.area);
        const sourceOk = activeSources.size === 0 || activeSources.has(item.source);
        const obtainedOk = showObtained || !obtainedPins.has(item.id);
        const isVisibleCave = typeOk && areaOk && sourceOk && obtainedOk;

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
    } else {
        batchObtainedPins.clear();
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

    updateBatchCount();
    markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
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
    document.getElementById('selected-count').innerText = changed;
}

// --- ルートサイドバーの基本操作 ---
function toggleRouteSidebar(show = null) {
    const mainSidebar = document.getElementById('map-sidebar');
    const routeSidebar = document.getElementById('route-sidebar');
    const areaOverlay = document.getElementById('area-overlay');
    
    if (show === null) {
        currentSidebar = (currentSidebar === 'main') ? 'route' : 'main';
    } else {
        currentSidebar = show ? 'route' : 'main';
    }

    if (currentSidebar === 'route') {
        mainSidebar.classList.add('hidden');
        routeSidebar.classList.remove('hidden');
        areaOverlay.classList.add('hidden'); // エリア選択が出ていれば隠す
        renderRouteList();
    } else {
        mainSidebar.classList.remove('hidden');
        routeSidebar.classList.add('hidden');
        exitCreateMode(); // 作成中なら抜ける
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
        const color = getSectionColor(i);
        const pts = [];

        if (section.pins && Array.isArray(section.pins)) {
            section.pins.forEach(pid => {
                const data = markers.find(m => m.item.id === pid);
                if (data && data.marker) {
                    const latlng = data.marker.getLatLng();
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

                const decorator = L.polylineDecorator(poly, {
                    patterns: [
                        { offset: '10%', repeat: 60, symbol: L.Symbol.arrowHead({ pixelSize: 15, polygon: true, pathOptions: { stroke: false, fill: true, color: color, fillOpacity: 1 } }) }
                    ]
                }).addTo(map);
                routeDecorators.push(decorator);
            } catch (err) {
                console.error("[renderRoute] Error drawing section", i, err);
            }
        }
    }

    if (routePolylines.length > 0 && !disableAutoZoom) {
        const group = new L.featureGroup(routePolylines);
        map.fitBounds(group.getBounds().pad(0.2), { paddingTopLeft: [320, 0], paddingBottomRight: [50, 50], animate: true, duration: 0.8 });
    }
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
        const sectionPoints = [];
        const color = getSectionColor(i);
        
        if (section.pins && Array.isArray(section.pins)) {
            section.pins.forEach(pinId => {
                const data = markers.find(m => m.item.id === pinId);
                if (data && data.marker) {
                    const latlng = data.marker.getLatLng();
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
                const decorator = L.polylineDecorator(polyline, {
                    patterns: [
                        { offset: '10%', repeat: 60, symbol: L.Symbol.arrowHead({ pixelSize: 15, polygon: true, pathOptions: { stroke: false, fill: true, color: color, fillOpacity: 1 } }) }
                    ]
                }).addTo(map);
                routeDecorators.push(decorator);
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
    routePolylines = [];
    routePreviewMarkers = [];
    routeDecorators = [];
}

// --- ルート作成モード ---
function showRouteDetail(route) {
    currentRouteView = 'detail';
    currentDetailedRoute = route;

    document.getElementById('route-browse-view').classList.add('hidden');
    document.getElementById('route-detail-view').classList.remove('hidden');
    document.getElementById('route-browse-header').classList.add('hidden');
    document.getElementById('route-detail-header').classList.remove('hidden');
    document.getElementById('browse-footer').classList.add('hidden');
    
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
            } else {
                // Toggled on: 選択区間の線だけを表示
                card.classList.add('active-highlight');
                card.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; // 簡易ハイライト
                renderRouteOnMap(route, idx, true);

                // 該当区間へズーム
                const latlngs = [];
                section.pins.forEach(pid => {
                    const mData = markers.find(m => m.item.id === pid);
                    if (mData) latlngs.push(mData.marker.getLatLng());
                });
                if (latlngs.length > 0) {
                    const bounds = L.latLngBounds(latlngs);
                    map.fitBounds(bounds.pad(0.2), { paddingTopLeft: [320, 0], paddingBottomRight: [50, 50], animate: true, duration: 0.8 });
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

function enterCreateMode() {
    currentRouteView = 'create';
    document.getElementById('route-browse-view').classList.add('hidden');
    document.getElementById('route-create-view').classList.remove('hidden');
    document.getElementById('route-browse-header').classList.add('hidden');
    document.getElementById('route-create-header').classList.remove('hidden');
    document.getElementById('browse-footer').classList.add('hidden');
    document.getElementById('creation-footer').classList.remove('hidden');
    
    document.getElementById('route-name-input').value = '';
    
    // 初期化
    creatingRoute = {
        id: null,
        name: '',
        description: '',
        sections: [{ name: '区間1', pins: [] }]
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
}

function startEditingRoute() {
    if (!currentDetailedRoute) return;

    focusedRoutePins = null;
    applyFilter();

    creatingRoute = {
        id: currentDetailedRoute.id,
        name: currentDetailedRoute.name,
        description: currentDetailedRoute.description || '',
        sections: JSON.parse(JSON.stringify(currentDetailedRoute.sections))
    };
    activeSectionIndex = 0;

    currentRouteView = 'create';
    document.getElementById('route-detail-view').classList.add('hidden');
    document.getElementById('route-detail-header').classList.add('hidden');
    document.getElementById('route-create-view').classList.remove('hidden');
    document.getElementById('route-create-header').classList.remove('hidden');
    document.getElementById('creation-footer').classList.remove('hidden');

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
    focusedRoutePins = null;
    applyFilter();
    
    document.getElementById('route-browse-view').classList.remove('hidden');
    document.getElementById('route-create-view').classList.add('hidden');
    document.getElementById('route-browse-header').classList.remove('hidden');
    document.getElementById('route-create-header').classList.add('hidden');
    document.getElementById('browse-footer').classList.remove('hidden');
    document.getElementById('creation-footer').classList.add('hidden');
    clearRouteVisuals();

    // マーカーのクリック挙動を戻す
    markers.forEach(({ marker }) => {
        if (marker._tempPopup) {
            marker.bindPopup(marker._tempPopup, { autoPan: false });
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
                const mData = markers.find(m => m.item.id === pinId);
                const name = mData ? mData.item.name : '不明なピン';
                const icon = mData ? (icons[mData.item.type].options.iconUrl || '../images/map/洞窟.png') : '';
                
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

    container.scrollTop = scrollPos;
}

function updateCreationVisuals() {
    clearRouteVisuals();
    showRoutePreview(creatingRoute);
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
                sections: cleanSections
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
            sections: cleanSections
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

function setupEventListeners() {
    // --- 既存のフィルター系 ---
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
        });
    }

    document.querySelectorAll('.area-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const area = btn.dataset.area;
            selectArea(area);
            areaOverlay.classList.add('hidden');
        });
    });

    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'manhunt', 'grate', 'floodgate']);
            selectArea('all');
            document.querySelectorAll('.filter-type-btn').forEach(btn => {
                btn.classList.add('active');
            });
            applyFilter();
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
                promptUnsavedChanges(() => toggleRouteSidebar());
            } else {
                toggleRouteSidebar();
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
        });
    }

    if (showBaseCheck) {
        showBaseCheck.checked = activeSources.has('base');
        showBaseCheck.addEventListener('change', () => {
            if (showBaseCheck.checked) activeSources.add('base');
            else activeSources.delete('base');
            applyFilter();
            updateSourceButtonState();
        });
    }

    if (showDlcCheck) {
        showDlcCheck.checked = activeSources.has('dlc');
        showDlcCheck.addEventListener('change', () => {
            if (showDlcCheck.checked) activeSources.add('dlc');
            else activeSources.delete('dlc');
            applyFilter();
            updateSourceButtonState();
        });
    }

    if (showBaseOnlyBtn) {
        showBaseOnlyBtn.addEventListener('click', () => {
            activeSources = new Set(['base']);
            if (showBaseCheck) showBaseCheck.checked = true;
            if (showDlcCheck) showDlcCheck.checked = false;
            applyFilter();
            updateSourceButtonState();
        });
    }

    if (showDlcOnlyBtn) {
        showDlcOnlyBtn.addEventListener('click', () => {
            activeSources = new Set(['dlc']);
            if (showBaseCheck) showBaseCheck.checked = false;
            if (showDlcCheck) showDlcCheck.checked = true;
            applyFilter();
            updateSourceButtonState();
        });
    }

    if (showAllSourcesBtn) {
        showAllSourcesBtn.addEventListener('click', () => {
            activeSources = new Set(['base', 'dlc']);
            if (showBaseCheck) showBaseCheck.checked = true;
            if (showDlcCheck) showDlcCheck.checked = true;
            applyFilter();
            updateSourceButtonState();
        });
    }


    const batchCancelBtn = document.getElementById('batch-cancel-btn');
    if (batchCancelBtn) batchCancelBtn.addEventListener('click', () => setBatchMode(false));
    
    const batchOkBtn = document.getElementById('batch-ok-btn');
    if (batchOkBtn) {
        batchOkBtn.addEventListener('click', () => {
            obtainedPins = new Set(batchObtainedPins);
            saveObtained();
            setBatchMode(false);
            applyFilter();
            updateAreaProgress();
            updatePinCounts();
        });
    }
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

function selectArea(area) {
    activeAreas.clear();
    const nameEl = document.getElementById('current-area-name');
    document.querySelectorAll('.area-card').forEach(card => card.classList.remove('active'));

    if (area === 'all') {
        nameEl.innerText = "全エリアを表示";
        map.fitBounds(bounds, { paddingTopLeft: [320, 0], paddingBottomRight: [0, 0], animate: true, duration: 0.8 });
    } else {
        activeAreas.add(area);
        nameEl.innerText = area;
        const selectedCard = document.querySelector(`.area-card[data-area="${area}"]`);
        if (selectedCard) selectedCard.classList.add('active');

        const areaPins = markers.filter(m => m.item.area === area);
        if (areaPins.length > 0) {
            const latlngs = areaPins.map(m => m.marker.getLatLng());
            const areaBounds = L.latLngBounds(latlngs);
            const deepZoomAreas = ['デッド・ホース・レイク', 'サファリア・ベイ', 'プロスピリティー・サンド', 'キャビアキー'];
            const targetMaxZoom = deepZoomAreas.includes(area) ? 2.0 : 1.5;
            map.fitBounds(areaBounds.pad(0.2), { paddingTopLeft: [320, 0], paddingBottomRight: [100, 100], maxZoom: targetMaxZoom, animate: true, duration: 0.8 });
        }
    }
    updateAreaProgress();
    updatePinCounts();
    applyFilter();
}

function updatePinCounts() {
    const totalCounts = {};
    const obtainedCounts = {};
    const currentArea = [...activeAreas][0] || 'all';
    
    collectibles.forEach(item => {
        if (currentArea === 'all' || item.area === currentArea) {
            totalCounts[item.type] = (totalCounts[item.type] || 0) + 1;
            if (obtainedPins.has(item.id)) {
                obtainedCounts[item.type] = (obtainedCounts[item.type] || 0) + 1;
            }
        }
    });

    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        const type = btn.dataset.type;
        const countSpan = btn.querySelector('.pin-count');
        if (countSpan) {
            const total = totalCounts[type] || 0;
            const obtained = obtainedCounts[type] || 0;
            countSpan.innerText = `${obtained}/${total}`;
        }
    });
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