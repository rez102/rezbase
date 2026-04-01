# Maneater Wiki

オープンワールド・アクションRPG『Maneater (マンイーター)』の非公式攻略情報のまとめサイトです。
サメの進化（装備）データ、ハンター情報、収集物の場所を確認できるインタラクティブマップなどの機能を提供しています。

## 主な機能

- **進化（装備）データベース**:
  - 全装備のステータス、入手条件、必要年齢を掲載。
  - ティア（強化段階）ごとの変化をスライダーでシミュレーション可能。
  - 数値の自動強調表示による高い視認性。
- **インタラクティブマップ**:
  - Leaflet.jsを使用した高機能なエリアマップ。
  - 栄養箱、ランドマーク、ナンバープレートなどの収集アイテムをフィルタリング表示。
- **ハンターデータベース**:
  - 通常ハンターとDLCハンターの詳細を掲載。
  - ハンター画像、セリフ、船名、報酬を確認可能。
- **最新の更新履歴**:
  - サイトのアップデート情報を随時更新。
- **深海風デザイン**:
  - マンイーターの世界観をイメージした、深海グラデーションとバイオルミネセンス（生物発光）風のUI。

## 使用技術

- **Core**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Library**: [Leaflet.js](https://leafletjs.com/) (マップ機能)
- **Typography**: [Google Fonts](https://fonts.google.com/) (Outfit, Roboto, etc.)
- **Theme**: Deep-sea & Bioluminescent Aesthetic

## フォルダ構成

```text
.
├── index.html              # トップページ（ロゴ）
├── maneater.html           # 装備一覧ページ
├── style.css               # トップページ用スタイル
├── fonts.css               # 共通フォント・デザイン定義
├── equipment/              # 装備関連
│   ├── equipment.html      # 詳細ページ
│   ├── equipment-detail.js # 詳細ロジック
│   ├── equipment-data.js   # 装備データベース
│   └── equipment.css       # 装備ページ用スタイル
├── hunters/                # ハンター関連
│   ├── hunters.html        # ハンター一覧ページ
│   ├── hunter.html         # ハンター詳細ページ
│   ├── hunters-data.js     # ハンターデータ
│   ├── hunters-list.js     # 一覧描画ロジック
│   ├── hunter-detail.js    # 詳細描画ロジック
│   ├── hunter-layout.js    # レイアウト制御
│   └── hunters.css         # ハンターページ用スタイル
├── map/                    # マップ関連
│   ├── map.html            # マップページ
│   ├── map.js              # マップロジック・データ
│   └── map.css             # マップページ用スタイル
├── history/                # 更新履歴関連
│   ├── history.html        # 更新履歴ページ
│   ├── history.js          # 履歴データ
│   └── history.css         # 履歴ページ用スタイル
└── images/                 # 画像アセット（装備・ハンター・マップ・UI）
```

## ライセンス

このプロジェクトは個人のファン活動として作成されています。
ゲーム内の画像権利は各メーカー・権利者に帰属します。
