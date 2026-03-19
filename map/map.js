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

// デバッグ用：クリックした座標をコンソールに表示
map.on('click', function(e) {
    console.log(`lat: ${e.latlng.lat.toFixed(2)}, lng: ${e.latlng.lng.toFixed(2)}`);
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

    collectibles.push({ 
        ...d, 
        id: `${d.type}-${index}`,
        name: name
    });
});

// 状態管理
let activeTypes = new Set(['landmark', 'nutrient', 'plate', 'main-quest', 'sub-quest', 'manhunt', 'grate', 'floodgate']);
let activeAreas = new Set();
let obtainedPins = new Set(JSON.parse(localStorage.getItem('maneater_obtained_pins') || '[]'));
let showObtained = true;
let batchMode = false;
let batchObtainedPins = new Set();
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
                L.DomEvent.stop(e);
            } else if (routeMode) {
                addToRoute(item.id, marker);
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

    applyFilter();
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

function toggleRouteMode() {
    routeMode = !routeMode;
    document.getElementById('route-mode-btn').classList.toggle('active', routeMode);
    document.getElementById('route-panel').classList.toggle('active', routeMode);
    
    markers.forEach(({ marker }) => {
        if (routeMode) {
            if (marker.getPopup()) {
                marker._tempPopup = marker.getPopup();
                marker.unbindPopup();
            }
        } else if (!batchMode) {
            if (marker._tempPopup) {
                marker.bindPopup(marker._tempPopup, { autoPan: false });
            }
        }
    });

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
}

function renderRoutes() {
    const list = document.getElementById('route-list');
    if (!list) return;
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

function setupEventListeners() {
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

    // 全てのピン状況をリセット
    const resetAllPinsBtn = document.getElementById('reset-all-pins-btn');
    if (resetAllPinsBtn) {
        resetAllPinsBtn.addEventListener('click', () => {
            if (confirm('全てのピンを未取得の状態に戻しますか？\nこの操作は取り消せません。')) {
                obtainedPins.clear();
                saveObtained();
                
                // 表示を更新
                markers.forEach(m => updateMarkerAppearance(m.marker, m.item.id));
                applyFilter();
                updateAreaProgress();
                updatePinCounts();
                alert('全てのピンをリセットしました。');
            }
        });
    }

    const settingsBtn = document.getElementById('toggle-settings-btn');
    const settingsPopover = document.getElementById('settings-popover');
    const showObtainedCheck = document.getElementById('show-obtained-check');

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

    const routeModeBtn = document.getElementById('route-mode-btn');
    if (routeModeBtn) routeModeBtn.addEventListener('click', toggleRouteMode);

    const saveRouteBtn = document.getElementById('save-route-btn');
    if (saveRouteBtn) {
        saveRouteBtn.addEventListener('click', () => {
            const name = document.getElementById('route-name-input').value.trim();
            if (!name) { alert('ルート名を入力してください'); return; }
            if (currentRoutePoints.length < 2) { alert('ピンを2つ以上選択してください'); return; }
            routes.push({ name: name, points: [...currentRoutePoints] });
            localStorage.setItem('maneater_routes', JSON.stringify(routes));
            document.getElementById('route-name-input').value = '';
            currentRoutePoints = [];
            if (currentPolyline) currentPolyline.remove();
            currentPolyline = null;
            renderRoutes();
            alert('ルートを保存しました');
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
        });
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
    const counts = {};
    const currentArea = [...activeAreas][0] || 'all';
    collectibles.forEach(item => {
        if (currentArea === 'all' || item.area === currentArea) {
            counts[item.type] = (counts[item.type] || 0) + 1;
        }
    });
    document.querySelectorAll('.filter-type-btn').forEach(btn => {
        const type = btn.dataset.type;
        const countSpan = btn.querySelector('.pin-count');
        if (countSpan) countSpan.innerText = counts[type] || 0;
    });
}

function updateAreaProgress() {
    document.querySelectorAll('.area-sub').forEach(sub => sub.innerText = `探索度: -%`);
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