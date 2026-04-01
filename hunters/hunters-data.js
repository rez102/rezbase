const huntersData = {
    "rank-01": {
        rank: 1,
        name: "バイユー・ウィリー",
        role: "沼地の惨劇...バイユー・ウィリー！",
        badge: "H1",
        summary: "このブーツはサメを踏み潰すために作られ、これらはまさにその用途に使われるのさ。",
        loadout: "ジェットスキー",
        reward: [
            { label: "タンパク質", amount: "× 350", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 350", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 350", image: "../images/ミネラル.png" },
            { label: "バイオエレクトリック・ティース", image: "../images/equipment/バイオエレクトリック・ティース.png" }
        ],
        overview: "ワニ狩りが簡単になりすぎたため、バイユー・ウィリーはもっと大きな獲物を追い始めました。今、彼は新しいブーツを作るためにサメを探しています。バイユーにとってこの男は切っても切り離せない存在です。"
    },
    "rank-02": {
        rank: 2,
        name: "ボビー・ボジャングルス",
        role: "バーテンダーキラー...ボビー・ボジャングルス！",
        badge: "H2",
        summary: "サメの味は保証します！",
        loadout: "スキフ",
        reward: [
            { label: "タンパク質", amount: "× 700", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 700", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 700", image: "../images/ミネラル.png" },
            { label: "強い心臓", image: "../images/equipment/強い心臓.png" }
        ],
        overview: "サメワニチリを使ってクワッド郡チリ料理大会で5冠制したボビーは料理のため、更なる肉を探し求めています。"
    },
    "rank-03": {
        rank: 3,
        name: "プーキー・ポール",
        role: "獰猛な小エビ漁師...プーキー・ポール！",
        badge: "H3",
        summary: "あのサメは死ぬ！俺が殺すからな！",
        loadout: "エアボート",
        reward: [
            { label: "タンパク質", amount: "× 1000", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 1000", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 1000", image: "../images/ミネラル.png" },
            { label: "ミネラル消化", image: "../images/equipment/ミネラル消化.png" }
        ],
        overview: "ムーンシャイン爆発事件の原因となった飲酒および職務怠慢によって、沿岸警備隊から追い出されたプーキー・ポールは、サメに対する暴力行為によって汚名返上を狙っています。"
    },
    "rank-04": {
        rank: 4,
        name: "キャンディーマン・カーチス",
        role: "釣りの天才...キャンディーマン カーチス！",
        badge: "H4",
        summary: "サメのナイスな死にざまをカメラに収めたらすぐ戻るさ！",
        loadout: "スキーボート",
        reward: [
            { label: "タンパク質", amount: "× 1350", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 1350", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 1350", image: "../images/ミネラル.png" },
            { label: "副腎", image: "../images/equipment/副腎.png" }
        ],
        overview: "結果が出せなかったボートレースのシーズンの後、そこから抜け出すためにキャンディーマンは操縦手としてのスキルを別の場所で生かすことにした。注目を集めるために自暴自棄になった彼は最後の手段としてシャークハンターVSマン・イーターへの出演を決断する。"
    },
    "rank-05": {
        rank: 5,
        name: "タイラー・ディクソン少尉",
        role: "インディアナの腕利き...タイラー・ディクソン少尉！",
        badge: "H5",
        summary: "午後のお昼寝の前にサメを始末できないと、すごく不機嫌になる自信があるよ。",
        loadout: "アメリカ湾岸警備隊の小型ボート",
        reward: [
            { label: "タンパク質", amount: "× 1700", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 1700", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 1700", image: "../images/ミネラル.png" },
            { label: "バイオエレクトリック・フィン", image: "../images/equipment/バイオエレクトリック・フィン.png" }
        ],
        overview: "沿岸警備隊少尉のディクソンは、限りない怠惰によってキャリアを進歩させることはありません。その上彼はマン・イーターを捕まえたら何週間か怠けていられるなどと考えています。"
    },
    "rank-06": {
        rank: 6,
        name: "ブッチャーボーイ・ブレイディ",
        role: "トウモロコシの巨像...ブッチャーボーイ・ブレイディ！",
        badge: "H6",
        summary: "俺がサメを見失うなんてことはない！サメが逃げたのなら、お前のせいってことだ！",
        loadout: "漁船",
        reward: [
            { label: "タンパク質", amount: "× 2000", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 2000", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 2000", image: "../images/ミネラル.png" },
            { label: "バイオエレクトリック・ボディ", image: "../images/equipment/バイオエレクトリック・ボディ.png" }
        ],
        overview: "地元のサメ狩りサークルで、スケイリー・ピートのライバルであるブッチャーボーイ・ブレイディは、常にケイジャンコンテストに参加しようとしています。"
    },
    "rank-07": {
        rank: 7,
        name: "シャノン・シムズ大尉",
        role: "浜辺の鬼...シャノン シムズ大尉！",
        badge: "H7",
        summary: "皆、気を張っていろ。民間人などに、この獲物を渡すものか。",
        loadout: "アメリカ湾岸警備隊の小型のボート",
        reward: [
            { label: "タンパク質", amount: "× 2350", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 2350", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 2350", image: "../images/ミネラル.png" },
            { label: "突然変異源消化", image: "../images/equipment/突然変異源消化.png" }
        ],
        overview: "冗談の通じない沿岸警備隊のシャノン・シムズ大尉は、彼女のキャリアの進歩…地域経済のため…いや、人々のためにサメを狩るべく立ち上がりました。"
    },
    "rank-08": {
        rank: 8,
        name: "ママ・メイベル",
        role: "数百万ドルの脅威...ママ・メイベル！",
        badge: "H8",
        summary: "あのサメはほかの魚と同様に海に沈めてやるわ。...それが私たちのやり方よ。",
        loadout: "ヨット",
        reward: [
            { label: "タンパク質", amount: "× 2700", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 2700", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 2700", image: "../images/ミネラル.png" },
            { label: "バイオエレクトリック・テール", image: "../images/equipment/バイオエレクトリック・テール.png" }
        ],
        overview: "犯罪組織アントリーニファミリーの幹部である彼女は、進行中のサメ問題が組織の利益に痛手を与えている問題にかたをつけることにしました。"
    },
    "rank-09": {
        rank: 9,
        name: "パーシー・メトカーフ中佐",
        role: "凶暴な海兵...パーシー・メトカーフ中佐！",
        badge: "H9",
        summary: "科学の力の前でサメの化け物は何ができるかを見てみようじゃないか！",
        loadout: "USCGコマンドボート",
        reward: [
            { label: "タンパク質", amount: "× 3000", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 3000", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 3000", image: "../images/ミネラル.png" },
            { label: "バイオエレクトリック・ヘッド", image: "../images/equipment/バイオエレクトリック・ヘッド.png" }
        ],
        overview: "ホルジヌ特殊計画のシール・スクィールプロジェクトで開発された最新の対サメ武装を手にしたパーシー中佐はサメ被害を取り除き、「興味深い」残骸を修復するためにこのエリアへと派遣されました。"
    },
    "rank-10": {
        rank: 10,
        name: "ロバート・ブラントレット大佐",
        role: "艦隊随一の野獣...ロバート・ブラントレット大佐！",
        badge: "H10",
        summary: "インスマスの戦いで生き延びた私がサメなんかに負けるわけがない。",
        loadout: "USCGコマンドボート",
        reward: [
            { label: "タンパク質", amount: "× 3350", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 3350", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 3350", image: "../images/ミネラル.png" },
            { label: "冷酷な筋肉", image: "../images/equipment/冷酷な筋肉.png" }
        ],
        overview: "誰にも捕獲できないサメを捕獲するために定年退職の後に帰ってきたブラントレット大佐の職歴のほとんどは機密扱いされているが、その多くには未確認生物との遭遇や海の怪獣との闘いの噂が付きまとっている。"
    },
    "rank-11": {
        rank: 11,
        name: "T.J.曹長 トフラー",
        role: "世代を越えた筋金入りの悪魔崇拝者...T.J.トフラー！",
        badge: "DH1",
        summary: "「ヘリコプターとサッカーは、エビとカニカマみたいに相性がいい！」",
        loadout: "シーホーク",
        reward: [
            { label: "タンパク質", amount: "× 3700", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 3700", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 3700", image: "../images/ミネラル.png" },
            { label: "尻尾投石器", image: "../images/equipment/尻尾投石器.png" }
        ],
        overview: "ウェスト・セントラルフロリダ大学にて、フットボールでオールカンファレンスのタイトエンドとして活躍したラリー「T.J.」トフラーは、大学を卒業した後、アメリカ海軍に入隊しました。フットボールとヘリコプターをこよなく愛する彼は、いつかこの2つを組み合わせて、「大西洋ヘリサッカーリーグ」を結成したいと考えています。ある晩、仲間のランディとビールを飲みながら考えたアイデアです。"
    },
    "rank-12": {
        rank: 12,
        name: "ロン中尉 ハネウェル",
        role: "ヨーク・ライト・メーソンの13世...ロン・ハネウェル！",
        badge: "DH2",
        summary: "「この口ひげは“無精ひげ”じゃない。眉用はさみと専用の保湿液でちゃんと手入れしてるんだ！」",
        loadout: "海軍迎撃艦",
        reward: [
            { label: "タンパク質", amount: "× 4050", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 4050", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 4050", image: "../images/ミネラル.png" },
            { label: "回復ファクター", image: "../images/equipment/回復ファクター.png" }
        ],
        overview: "ロン・ハネウェル中尉は、「熱帯の稲妻」のスター、アックス・ドーガンのサインを手に入れるために殺到した、ファンの集団に巻き込まれて片目を失ってしまいました。その後の彼は、ドーガンが演じたキャラクター、テレンス・T.「ライトニング」ハーパーのように、未来のハイテク・ボートを操縦するようになったのです。"
    },
    "rank-13": {
        rank: 13,
        name: "ジョスリン司令官 ST. デニス",
        role: "大ドルイドの高司祭...ジョスリンST. デニス！",
        badge: "DH3",
        summary: "「ハワイを希望したのに、こんなクソみたいな場所に配置されるなんて。やっぱり商船隊に入るべきだった...」",
        loadout: "シーホーク",
        reward: [
            { label: "タンパク質", amount: "× 4400", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 4400", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 4400", image: "../images/ミネラル.png" },
            { label: "音波の炸裂", image: "../images/equipment/音波の炸裂.png" }
        ],
        overview: "ハイチからの移民の子供である、ジョスリンST. デニスの両親は故郷ポルトープランスを離れましたが、まさか自分たちの一人娘が、より危険な街であるポート・クロヴィスに住むことになるとは想像もしていませんでした。"
    },
    "rank-14": {
        rank: 14,
        name: "ヴィック船長 マンドレイク",
        role: "4次元のインセクトイドシェイプシフター...ヴィク・マンドレイク！",
        badge: "DH4",
        summary: "「この世界には2つのタイプしかない。それは、ハンターと...ハンティング用品店の店員だったっけ？ 2番目は何だったか忘れた」",
        loadout: "湾岸戦闘艦",
        reward: [
            { label: "タンパク質", amount: "× 4750", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 4750", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 4750", image: "../images/ミネラル.png" },
            { label: "ソナーの方向感覚を狂わせる", image: "../images/equipment/ソナーの方向感覚を狂わせる.png" }
        ],
        overview: "ヴィック・マンドレイク船長は最近、民間軍事会社であるブラック・ダイアモンドとの契約を検討していました。これまで海軍が与えてくれた「人間を殺す機会」の少なさに失望していたからです。"
    },
    "rank-15": {
        rank: 15,
        name: "バルバラ提督 テラノヴァ",
        role: "姦淫の母にして忌むべき者...バルバラ・テラノヴァ！",
        badge: "DH5",
        summary: "「これは町の土産物屋で20ドルで買った帽子だよ」",
        loadout: "湾岸戦闘艦",
        reward: [
            { label: "タンパク質", amount: "× 5100", image: "../images/タンパク質.png" },
            { label: "脂肪", amount: "× 5100", image: "../images/脂肪.png" },
            { label: "ミネラル", amount: "× 5100", image: "../images/ミネラル.png" },
            { label: "標的のソナー", image: "../images/equipment/標的のソナー.png" }
        ],
        overview: "真面目なバルバラ・テラノヴァ提督は、人間的な面を見せたいとき、「女性は私を求めるが、サメは私を恐れる」と書かれたユーモラスな野球帽をかぶります。とはいえ、海洋生物学者は地元のサメたちが実際に彼女をどれほど恐れているのか正式に調査したことはありません。"
    }
};
