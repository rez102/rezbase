const map = L.map('map', {
    crs: L.CRS.Simple,  // ゲームマップ用の座標系
    minZoom: -2,
    maxZoom: 2,
});

// マップ画像のサイズ
const w = 1120;
const h = 1120;

const bounds = [[0, 0], [h, w]];
L.imageOverlay('images/maneater_map.png', bounds).addTo(map);
map.fitBounds(bounds);
// 収集物データ
const collectibles = [
    { type: "landmark", name: "ランドマーク1", lat: 500, lng: 500 },
    { type: "nutrient", name: "栄養箱1", lat: 400, lng: 600 },
    { type: "plate", name: "ナンバープレート1", lat: 300, lng: 700 },
];

// アイコン定義
const icons = {
    landmark: L.icon({ iconUrl: 'images/map/ランドマーク.png', iconSize: [32, 32] }),
    nutrient: L.icon({ iconUrl: 'images/map/栄養箱.png', iconSize: [32, 32] }),
    plate: L.icon({ iconUrl: 'images/map/ナンバープレート.png', iconSize: [32, 32] }),
};

// ピンを置く
collectibles.forEach(item => {
    L.marker([item.lat, item.lng], { icon: icons[item.type] })
        .addTo(map)
        .bindPopup(item.name);
});
map.on('click', (e) => {
    console.log(e.latlng.lat, e.latlng.lng);
});