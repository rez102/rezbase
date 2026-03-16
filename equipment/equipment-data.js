const equipmentData = {
  "atomic-teeth": {
    name: "アトミックティース",
    slot: "あご",
    element: "アトミック",
    image: "../images/equipment/アトミックティース.png",
    obtain: "入手条件：DLCメインクエスト「フィレオフィッシュ」をクリア",
    age: "伝説",
    description: "この装備により、クリーチャーに噛みつくたびにアトミックパワーでの攻撃を強化します。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["噛んだ場合：あなたは他の原子進化からのダメージカウントと蓄積可能な+1%のダメージボーナスとダメージ耐性を1カウント得ます。これらのカウントは2秒ごとに+1カウンタずつ減っていき、最大スタックカウントは30です。"] },
      { protein: 18000, mineral: 0, fat: 0, mutagen: 600, passive: null, special: ["噛んだ場合：あなたは他の原子進化からのダメージカウントと蓄積可能な+1%のダメージボーナスとダメージ耐性を2カウント得ます。これらのカウントは2秒ごとに+1カウンタずつ減っていき、最大スタックカウントは30です。"] },
      { protein: 21000, mineral: 0, fat: 0, mutagen: 700, passive: null, special: ["噛んだ場合：あなたは他の原子進化からのダメージカウントと蓄積可能な+1%のダメージボーナスとダメージ耐性を3カウント得ます。これらのカウントは2秒ごとに+1カウンタずつ減っていき、最大スタックカウントは30です。"] },
      { protein: 24000, mineral: 0, fat: 0, mutagen: 750, passive: null, special: ["噛んだ場合：あなたは他の原子進化からのダメージカウントと蓄積可能な+1%のダメージボーナスとダメージ耐性を4カウント得ます。これらのカウントは2秒ごとに+1カウンタずつ減っていき、最大スタックカウントは30です。"] },
      { protein: 28000, mineral: 0, fat: 0, mutagen: 800, passive: null, special: ["噛んだ場合：あなたは他の原子進化からのダメージカウントと蓄積可能な+1%のダメージボーナスとダメージ耐性を5カウント得ます。これらのカウントは2秒ごとに+1カウンタずつ減っていき、最大スタックカウントは30です。"] },
    ]
  },
  "shadow-teeth": {
    name: "シャドウ・ティース",
    slot: "あご",
    element: "シャドウ",
    image: "../images/equipment/シャドウ・ティース.png",
    obtain: "入手条件：デッド・ホース・レイクのランドマーク全収集",
    age: "子供",
    description: "この進化を選択すると、自身が噛んだ獲物の血が流れだし、その過程で自分が回復するようになります。",
    passive: true,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+6% 噛みつきダメージ"], special: ["噛んだ場合：+30体力回復"] },
      { protein: 8000, mineral: 0, fat: 0, mutagen: 0, passive: ["+12% 噛みつきダメージ"], special: ["噛んだ場合：+35体力回復"] },
      { protein: 10000, mineral: 0, fat: 0, mutagen: 0, passive: ["+18% 噛みつきダメージ"], special: ["噛んだ場合：+40体力回復"] },
      { protein: 12000, mineral: 0, fat: 0, mutagen: 175, passive: ["+24% 噛みつきダメージ"], special: ["噛んだ場合：+45体力回復"] },
      { protein: 14000, mineral: 0, fat: 0, mutagen: 350, passive: ["+30% 噛みつきダメージ"], special: ["噛んだ場合：+50体力回復"] },
    ]
  },
  "bioelectric-teeth": {
    name: "バイオエレクトリック・ティース",
    slot: "あご",
    element: "バイオエレクトリック",
    image: "../images/equipment/バイオエレクトリック・ティース.png",
    obtain: "入手条件：悪名ランク1",
    age: "子供",
    description: "この進化を選択すると、噛むたびに電撃を放出するライトニングの歯を手に入れられます。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["噛んだ場合：電気ショックを放出し、2ダメージを与えて2メートル以内にあるもの全てに1気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
      { protein: 0, mineral: 0, fat: 8000, mutagen: 0, passive: null, special: ["噛んだ場合：電気ショックを放出し、4ダメージを与えて2.5メートル以内にあるもの全てに1気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
      { protein: 0, mineral: 0, fat: 10000, mutagen: 0, passive: null, special: ["噛んだ場合：電気ショックを放出し、6ダメージを与えて3メートル以内にあるもの全てに2気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
      { protein: 0, mineral: 0, fat: 12000, mutagen: 175, passive: null, special: ["噛んだ場合：電気ショックを放出し、8ダメージを与えて3.5メートル以内にあるもの全てに2気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
      { protein: 0, mineral: 0, fat: 14000, mutagen: 350, passive: null, special: ["噛んだ場合：電気ショックを放出し、10ダメージを与えて4メートル以内にあるもの全てに3気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
    ]
  },
  "bone-teeth": {
    name: "ボーン・ティース",
    slot: "あご",
    element: "ボーン",
    image: "../images/equipment/ボーン・ティース.png",
    obtain: "入手条件：捕食者バラクーダ討伐",
    age: "子供",
    description: "この進化を選択することで、あなたは鋼鉄をズタズタに引き裂くことができるようになり、ツルツルな獲物も掴むことができるようになります。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+5% 叩きつけダメージ", "+12% ボートへの噛みつきによるダメージボーナス"], special: null },
      { protein: 0, mineral: 8000, fat: 0, mutagen: 0, passive: ["+10% 叩きつけダメージ", "+24% ボートへの噛みつきによるダメージボーナス"], special: null },
      { protein: 0, mineral: 10000, fat: 0, mutagen: 0, passive: ["+15% 叩きつけダメージ", "+36% ボートへの噛みつきによるダメージボーナス"], special: null },
      { protein: 0, mineral: 12000, fat: 0, mutagen: 175, passive: ["+20% 叩きつけダメージ", "+48% ボートへの噛みつきによるダメージボーナス"], special: null },
      { protein: 0, mineral: 14000, fat: 0, mutagen: 350, passive: ["+25% 叩きつけダメージ", "+60% ボートへの噛みつきによるダメージボーナス"], special: null },
    ]
  },
  "atomic-head": {
    name: "アトミックヘッド",
    slot: "あたま",
    element: "アトミック",
    image: "../images/equipment/アトミックヘッド.png",
    obtain: "入手条件：チドリ島のランドマーク全収集",
    age: "伝説",
    description: "この進化により、乗り物に体当たりを行ったときにアトミックブラストを放ちます。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["叩きつけ時：原子エネルギーの爆風を放出してターゲットに50ダメージを与え、3メートル以内のすべてのものを押しやります。また、他の原子進化からのカウントと蓄積することが可能な+1%のダメージとダメージ耐性を1カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。"] },
      { protein: 0, mineral: 0, fat: 18000, mutagen: 600, passive: null, special: ["叩きつけ時：原子エネルギーの爆風を放出してターゲットに60ダメージを与え、4メートル以内のすべてのものを押しやります。また、他の原子進化からのカウントと蓄積することが可能な+1%のダメージとダメージ耐性を2カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。"] },
      { protein: 0, mineral: 0, fat: 21000, mutagen: 700, passive: null, special: ["叩きつけ時：原子エネルギーの爆風を放出してターゲットに65ダメージを与え、5メートル以内のすべてのものを押しやります。また、他の原子進化からのカウントと蓄積可能な+1%のダメージとダメージ耐性を3カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。"] },
      { protein: 0, mineral: 0, fat: 24000, mutagen: 750, passive: null, special: ["叩きつけ時：原子エネルギーの爆風を放出してターゲットに70ダメージを与え、6メートル以内のすべてのものを押しやります。また、他の原子進化からのカウントと蓄積することが可能な+1%のダメージとダメージ耐性を4カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。"] },
      { protein: 0, mineral: 0, fat: 28000, mutagen: 800, passive: null, special: ["叩きつけ時：原子エネルギーの爆風を放出してターゲットに75ダメージを与え、6メートル以内のすべてのものを押しやります。また、他の原子進化からのカウントと蓄積可能な+1%のダメージとダメージ耐性を5カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。"] },
    ]
  },
  "shadow-head": {
    name: "シャドウ・ヘッド",
    slot: "あたま",
    element: "シャドウ",
    image: "../images/equipment/シャドウ・ヘッド.png",
    obtain: "入手条件：キャビアキーのランドマーク全収集",
    age: "長老",
    description: "この進化を選択すると、首の筋肉が強化され、簡単に獲物を振り回し、すごいスピードで突進することができるようになります。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+2% 突進速度", "+5% 叩きつけダメージ"], special: null },
      { protein: 8000, mineral: 0, fat: 0, mutagen: 0, passive: ["+4% 突進速度", "+10% 叩きつけダメージ"], special: null },
      { protein: 10000, mineral: 0, fat: 0, mutagen: 0, passive: ["+6% 突進速度", "+15% 叩きつけダメージ"], special: null },
      { protein: 12000, mineral: 0, fat: 0, mutagen: 175, passive: ["+8% 突進速度", "+20% 叩きつけダメージ"], special: null },
      { protein: 14000, mineral: 0, fat: 0, mutagen: 350, passive: ["+10% 突進速度", "+25% 叩きつけダメージ"], special: null },
    ]
  },
  "bioelectric-head": {
    name: "バイオエレクトリック・ヘッド",
    slot: "あたま",
    element: "バイオエレクトリック",
    image: "../images/equipment/バイオエレクトリック・ヘッド.png",
    obtain: "入手条件：悪名ランク9",
    age: "長老",
    description: "この進化を選択すると、ボートに体当たりを行ったときに電気ショックを放ち、ショート状態にすることができるようになります。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["叩きつけ時：ターゲットのボートは2秒間移動することが出来ません。"] },
      { protein: 0, mineral: 0, fat: 8000, mutagen: 0, passive: null, special: ["叩きつけ時：ターゲットのボートは4秒間移動することが出来ません。"] },
      { protein: 0, mineral: 0, fat: 10000, mutagen: 0, passive: null, special: ["叩きつけ時：ターゲットのボートは6秒間移動することが出来ません。"] },
      { protein: 0, mineral: 0, fat: 12000, mutagen: 175, passive: null, special: ["叩きつけ時：ターゲットのボートは8秒間移動することが出来ません。"] },
      { protein: 0, mineral: 0, fat: 14000, mutagen: 300, passive: null, special: ["叩きつけ時：ターゲットのボートは10秒間移動することが出来ません。"] },
    ]
  },
  "bone-head": {
    name: "ボーン・ヘッド",
    slot: "あたま",
    element: "ボーン",
    image: "../images/equipment/ボーン・ヘッド.png",
    obtain: "入手条件：捕食者のシャチ討伐",
    age: "長老",
    description: "この進化を選択すると、頭部を破壊不能な骨のヘルメットで保護することが出来ます。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+8% 体当たりのダメージ", "+30% 乗員ノックバック耐性", "+20% 乗員ダメージ耐性", "+10% 体当たりの力ボーナス", "+3% ダメージ耐性"], special: null },
      { protein: 0, mineral: 8000, fat: 0, mutagen: 0, passive: ["+16% 体当たりのダメージ", "+35% 乗員ノックバック耐性", "+25% 乗員ダメージ耐性", "+20% 体当たりの力ボーナス", "+6% ダメージ耐性"], special: null },
      { protein: 0, mineral: 10000, fat: 0, mutagen: 0, passive: ["+24% 体当たりのダメージ", "+40% 乗員ノックバック耐性", "+30% 乗員ダメージ耐性", "+30% 体当たりの力ボーナス", "+9% ダメージ耐性"], special: null },
      { protein: 0, mineral: 12000, fat: 0, mutagen: 175, passive: ["+32% 体当たりのダメージ", "+45% 乗員ノックバック耐性", "+35% 乗員ダメージ耐性", "+40% 体当たりの力ボーナス", "+12% ダメージ耐性"], special: null },
      { protein: 0, mineral: 14000, fat: 0, mutagen: 350, passive: ["+40% 体当たりのダメージ", "+50% 乗員ノックバック耐性", "+40% 乗員ダメージ耐性", "+50% 体当たりの力ボーナス", "+15% ダメージ耐性"], special: null },
    ]
  },
  "atomic-body": {
    name: "アトミックボディ",
    slot: "からだ",
    element: "アトミック",
    image: "../images/equipment/アトミックボディ.png",
    obtain: "入手条件：DLCメインクエスト「ドロップシャドウ」クリア",
    age: "伝説",
    description: "発動すると、この進化により、アトミックブラストの能力が得られます。尻尾や歯でクリーチャーにダメージを与えたり捕食したりするとリチャージされます。装備していると放射線障害への耐性。",
    passive: false,
    special: false,
    ability: true,
    abilityDesc: ["アトミックブラスト:アトミックブラストにより、原子エネルギーを集めて爆発させられるようになります。"],
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: null, abilityEffect: ["使用時:この進化がアクティブな間、[噛みつく]を長押しするとターゲットモードになり、原子エネルギーの爆風をチャージすることができます。チャージ時間が長いほど、噛みついて爆風を引き起こす際に与えるダメージが大きくなります。爆風が当たったターゲットに基本ダメージ100を与え、爆発10mの範囲で基本ダメージ50を与えます。"] },
      { protein: 0, mineral: 0, fat: 18000, mutagen: 600, passive: null, special: null, abilityEffect: ["使用時:この進化がアクティブな間、[噛みつく]を長押しするとターゲットモードになり、原子エネルギーの爆風をチャージすることができます。チャージ時間が長いほど、噛みついて爆風を引き起こす際に与えるダメージが大きくなります。爆風が当たったターゲットに基本ダメージ125を与え、爆発10mの範囲で基本ダメージ63を与えます。"] },
      { protein: 0, mineral: 0, fat: 21000, mutagen: 700, passive: null, special: null, abilityEffect: ["使用時:この進化がアクティブな間、[噛みつく]を長押しするとターゲットモードになり、原子エネルギーの爆風をチャージすることができます。チャージ時間が長いほど、噛みついて爆風を引き起こす際に与えるダメージが大きくなります。爆風が当たったターゲットに基本ダメージ150を与え、爆発10mの範囲で基本ダメージ75を与えます。"] },
      { protein: 0, mineral: 0, fat: 24000, mutagen: 750, passive: null, special: null, abilityEffect: ["使用時:この進化がアクティブな間、[噛みつく]を長押しするとターゲットモードになり、原子エネルギーの爆風をチャージすることができます。チャージ時間が長いほど、噛みついて爆風を引き起こす際に与えるダメージが大きくなります。爆風が当たったターゲットに基本ダメージ175を与え、爆発10mの範囲で基本ダメージ83を与えます。"] },
      { protein: 0, mineral: 0, fat: 28000, mutagen: 800, passive: null, special: null, abilityEffect: ["使用時:この進化がアクティブな間、[噛みつく]を長押しするとターゲットモードになり、原子エネルギーの爆風をチャージすることができます。チャージ時間が長いほど、噛みついて爆風を引き起こす際に与えるダメージが大きくなります。爆風が当たったターゲットに基本ダメージ200を与え、爆発10mの範囲で基本ダメージ100を与えます。"] },
    ]
  },
  "shadow-body": {
    name: "シャドウ・ボディ",
    slot: "からだ",
    element: "シャドウ",
    image: "../images/equipment/シャドウ・ボディ.png",
    obtain: "入手条件：サファリアベイのランドマーク全収集",
    age: "大人",
    description: "この進化により、シャドウフォームの能力が得られます。クリーチャーを噛んだり捕食したりするとリチャージされます。[真実クエストのみ]装備しているとシャドウオルカの毒への耐性。",
    passive: false,
    special: false,
    ability: true,
    abilityDesc: ["シャドウフォーム:突進するたびに周りに毒のオーラを放出しながら、シャドウフォームによって周囲の世界の動きが遅くなります。"],
    tiers: [
      {
        protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "シャドウフォーム使用中は、身の回りの物すべての移動する速度を半減します。", "+10% 加速ボーナス", "+10% 最高スピード", "+20% 突進速度", "+10% 水泳スピード", "突進時：", "6メートル以内の全ての生物に2猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。", "+10% 突進速度", "+10% 加速ボーナス"
        ]
      },
      {
        protein: 8000, mineral: 0, fat: 0, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "シャドウフォーム使用中は、身の回りの物すべての移動する速度を半減します。", "+12.5% 加速ボーナス", "+12.5% 最高スピード", "+20% 突進速度", "+12.5% 水泳スピード", "突進時：", "7メートル以内の全ての生物に4猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。", "+12.5% 突進速度", "+12.5% 加速ボーナス"
        ]
      },
      {
        protein: 10000, mineral: 0, fat: 0, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "シャドウフォーム使用中は、身の回りの物すべての移動する速度を半減します。", "+15% 加速ボーナス", "+15% 最高スピード", "+20% 突進速度", "+15% 水泳スピード", "突進時：", "8メートル以内の全ての生物に6猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。", "+15% 突進速度", "+15% 加速ボーナス"
        ]
      },
      {
        protein: 12000, mineral: 0, fat: 0, mutagen: 175, passive: null, special: null, abilityEffect: [
          "使用時：", "シャドウフォーム使用中は、身の回りの物すべての移動する速度を半減します。", "+17.5% 加速ボーナス", "+17.5% 最高スピード", "+20% 突進速度", "+17.5% 水泳スピード", "突進時：", "9メートル以内の全ての生物に8猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。", "+17.5% 突進速度", "+17.5% 加速ボーナス"
        ]
      },
      {
        protein: 14000, mineral: 0, fat: 0, mutagen: 350, passive: null, special: null, abilityEffect: [
          "使用時：", "シャドウフォーム使用中は、身の回りの物すべての移動する速度を半減します。", "+20% 加速ボーナス", "+20% 最高スピード", "+20% 突進速度", "+20% 水泳スピード", "突進時：", "10メートル以内の全ての生物に10猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。", "+20% 突進速度", "+20% 加速ボーナス"
        ]
      },
    ]
  },
  "bioelectric-body": {
    name: "バイオエレクトリック・ボディ",
    slot: "からだ",
    element: "バイオエレクトリック",
    image: "../images/equipment/バイオエレクトリック・ボディ.png",
    obtain: "入手条件：悪名ランク6",
    age: "大人",
    description: "発動すると、この進化により、ライトニングバーストの能力が得られます。クリーチャーにダメージを与えたり捕食したりするとリチャージされます。[真実クエストのみ]装備しているとエレクトリックホオジロザメのバイオエレクトリック気絶への耐性。",
    passive: false,
    special: false,
    ability: true,
    abilityDesc: ["ライトニング・バースト：ライトニングバーストはあなたを稲光オーラで包み、近寄るもの全てを感電死させます。"],
    tiers: [
      {
        protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "+10% 投射物ダメージ耐性", "+10% 電気ダメージ耐性", "突進時：", "稲光に変身し、4ダメージを与えて6メートル以内にあるもの全てに2気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+5% 突進速度", "+5% 最高スピード", "+5% 加速ボーナス", "+5% 水泳スピード"
        ]
      },
      {
        protein: 0, mineral: 0, fat: 8000, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "+15% 投射物ダメージ耐性", "+15% 電気ダメージ耐性", "突進時：", "稲光に変身し、8ダメージを与えて7メートル以内にあるもの全てに3気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+10% 突進速度", "+10% 最高スピード", "+10% 加速ボーナス", "+10% 水泳スピード"
        ]
      },
      {
        protein: 0, mineral: 0, fat: 10000, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "+20% 投射物ダメージ耐性", "+20% 電気ダメージ耐性", "突進時：", "稲光に変身し、12ダメージを与えて8メートル以内にあるもの全てに4気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+15% 突進速度", "+15% 最高スピード", "+15% 加速ボーナス", "+15% 水泳スピード"
        ]
      },
      {
        protein: 0, mineral: 0, fat: 12000, mutagen: 175, passive: null, special: null, abilityEffect: [
          "使用時：", "+25% 投射物ダメージ耐性", "+25% 電気ダメージ耐性", "突進時：", "稲光に変身し、16ダメージを与えて8メートル以内にあるもの全てに5気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+20% 突進速度", "+20% 最高スピード", "+20% 加速ボーナス", "+20% 水泳スピード"
        ]
      },
      {
        protein: 0, mineral: 0, fat: 14000, mutagen: 350, passive: null, special: null, abilityEffect: [
          "使用時：", "+30% 投射物ダメージ耐性", "+30% 電気ダメージ耐性", "突進時：", "稲光に変身し、20ダメージを与えて9メートル以内にあるもの全てに6気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+25% 突進速度", "+25% 最高スピード", "+25% 加速ボーナス", "+25% 水泳スピード"
        ]
      },
    ]
  },
  "bone-body": {
    name: "ボーン・ボディ",
    slot: "からだ",
    element: "ボーン",
    image: "../images/equipment/ボーン・ボディ.png",
    obtain: "入手条件：捕食者のシュモクザメ討伐",
    age: "大人",
    description: "発動すると、この進化により、ボーンクラッシャーの能力が得られます。クリーチャーを噛んだり捕食したりするとリチャージされます。[真実クエストのみ]装備しているとボーンマッコウクジラ気絶攻撃への耐性。",
    passive: false,
    special: false,
    ability: true,
    abilityDesc: ["ボーンクラッシャー：ボーンクラッシャーはあなたを骨の破城槌に変身させ、ボートをガラスのように粉々にすることを可能にします。"],
    tiers: [
      {
        protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "+3 ダメージ軽減", "+20% 体当たりダメージ", "+5% ダメージ耐性", "突進時：", "2メートル以内にあるもの全てに40ダメージを与えます。", "+5% 突進速度", "+5% 最高スピード", "+5% 加速ボーナス", "+10% 体当たりの力ボーナス", "+10% 突撃時に船員を振り落とす確率", "+5% 水泳スピード"
        ]
      },
      {
        protein: 0, mineral: 8000, fat: 0, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "+4 ダメージ軽減", "+40% 体当たりダメージ", "+10% ダメージ耐性", "突進時：", "2メートル以内にあるもの全てに45ダメージを与えます。", "+10% 突進速度", "+10% 最高スピード", "+10% 加速ボーナス", "+20% 体当たりの力ボーナス", "+20% 突撃時に船員を振り落とす確率", "+10% 水泳スピード"
        ]
      },
      {
        protein: 0, mineral: 10000, fat: 0, mutagen: 0, passive: null, special: null, abilityEffect: [
          "使用時：", "+5 ダメージ軽減", "+60% 体当たりダメージ", "+15% ダメージ耐性", "突進時：", "2メートル以内にあるもの全てに50ダメージを与えます。", "+15% 突進速度", "+15% 最高スピード", "+15% 加速ボーナス", "+30% 体当たりの力ボーナス", "+30% 突撃時に船員を振り落とす確率", "+15% 水泳スピード"
        ]
      },
      {
        protein: 0, mineral: 12000, fat: 0, mutagen: 175, passive: null, special: null, abilityEffect: [
          "使用時：", "+6 ダメージ軽減", "+80% 体当たりダメージ", "+20% ダメージ耐性", "突進時：", "2メートル以内にあるもの全てに55ダメージを与えます。", "+20% 突進速度", "+20% 最高スピード", "+20% 加速ボーナス", "+40% 体当たりの力ボーナス", "+40% 突撃時に船員を振り落とす確率", "+20% 水泳スピード"
        ]
      },
      {
        protein: 0, mineral: 14000, fat: 0, mutagen: 350, passive: null, special: null, abilityEffect: [
          "使用時：", "+7 ダメージ軽減", "+100% 体当たりダメージ", "+25% ダメージ耐性", "突進時：", "2メートル以内にあるもの全てに60ダメージを与えます。", "+25% 突進速度", "+25% 最高スピード", "+25% 加速ボーナス", "50% 体当たりの力ボーナス", "50% 突撃時に船員を振り落とす確率", "+25% 水泳スピード"
        ]
      },
    ]
  },
  "tiger-body": {
    name: "タイガー・ボディ",
    slot: "からだ",
    element: "",
    image: "../images/equipment/タイガー・ボディ.png",
    obtain: "入手条件：初めて洞窟に入る",
    age: "赤ちゃん",
    description: "この進化を選択することで、「ヒレのついたゴミ箱」と呼ばれるイタチザメ（タイガーシャーク）のように、ほとんどなんでも消化できるようになります。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+5% 脂肪", "+5% タンパク質", "+5% ミネラル", "+5% 突然変異源"], special: null },
      { protein: 0, mineral: 8000, fat: 0, mutagen: 0, passive: ["+10% 脂肪", "+10% タンパク質", "+10% ミネラル", "+10% 突然変異源"], special: null },
      { protein: 0, mineral: 0, fat: 10000, mutagen: 0, passive: ["+15% 脂肪", "+15% タンパク質", "+15% ミネラル", "+15% 突然変異源"], special: null },
      { protein: 0, mineral: 0, fat: 12000, mutagen: 175, passive: ["+20% 脂肪", "+20% タンパク質", "+20% ミネラル", "+20% 突然変異源"], special: null },
      { protein: 0, mineral: 14000, fat: 0, mutagen: 350, passive: ["+25% 脂肪", "+25% タンパク質", "+25% ミネラル", "+25% 突然変異源"], special: null },
    ]
  },
  "atomic-fin": {
    name: "アトミックフィン",
    slot: "ひれ",
    element: "アトミック",
    image: "../images/equipment/アトミックフィン.png",
    obtain: "入手条件：DLCメインクエスト「エレクトリック・メイヘム」クリア",
    age: "伝説",
    description: "進化により、回避時に自らをアトミックエネルギーの爆発へと変換できます。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["回避時：", "あなたは原子エネルギーに変わり、ターゲットに100ダメージを与えます。他の原子進化からのカウントと蓄積可能な+1%のダメージとダメージ耐性を1カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。", "+50% ダメージ耐性", "+30% 回避スピード"] },
      { protein: 0, mineral: 18000, fat: 0, mutagen: 600, passive: null, special: ["回避時：", "あなたは原子エネルギーに変わり、ターゲットに115ダメージを与えます。他の原子進化からのカウントと蓄積可能な+1%のダメージとダメージ耐性を1カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。", "+50% ダメージ耐性", "+30% 回避スピード"] },
      { protein: 0, mineral: 21000, fat: 0, mutagen: 700, passive: null, special: ["回避時：", "あなたは原子エネルギーに変わり、ターゲットに130ダメージを与えます。他の原子進化からのカウントと蓄積可能な+1%のダメージとダメージ耐性を2カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。", "+50% ダメージ耐性", "+30% 回避スピード"] },
      { protein: 0, mineral: 24000, fat: 0, mutagen: 750, passive: null, special: ["回避時：", "あなたは原子エネルギーに変わり、ターゲットに140ダメージを与えます。他の原子進化からのカウントと蓄積可能な+1%のダメージとダメージ耐性を2カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。", "+50% ダメージ耐性", "+30% 回避スピード"] },
      { protein: 0, mineral: 28000, fat: 0, mutagen: 800, passive: null, special: ["回避時：", "あなたは原子エネルギーに変わり、ターゲットに150ダメージを与えます。他の原子進化からのカウントと蓄積可能な+1%のダメージとダメージ耐性を3カウント得ます。これらのカウントは2秒ごとに1カウントずつ減っていき、最大蓄積カウントは30です。", "+50% ダメージ耐性", "+30% 回避スピード"] },
    ]
  },
  "shadow-fin": {
    name: "シャドウ・フィン",
    slot: "ひれ",
    element: "シャドウ",
    image: "../images/equipment/シャドウ・フィン.png",
    obtain: "入手条件：ゴールデンショアのランドマーク全収集",
    age: "大人",
    description: "この進化を選択すると、回避時、周囲に毒雲を発生させることができます。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["回避時：", "3メートル以内の全ての生物に1猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
      { protein: 8000, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["回避時：", "3.5メートル以内の全ての生物に2猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
      { protein: 10000, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["回避時：", "4メートル以内の全ての生物に3猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
      { protein: 12000, mineral: 0, fat: 0, mutagen: 175, passive: null, special: ["回避時：", "4.5メートル以内の全ての生物に4猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
      { protein: 14000, mineral: 0, fat: 0, mutagen: 350, passive: null, special: ["回避時：", "5メートル以内の全ての生物に5猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
    ]
  },
  "bioelectric-fin": {
    name: "バイオエレクトリック・フィン",
    slot: "ひれ",
    element: "バイオエレクトリック",
    image: "../images/equipment/バイオエレクトリック・フィン.png",
    obtain: "入手条件：悪名ランク5",
    age: "大人",
    description: "この進化を選択すると、回避時にきわめて短い間自らを雷へと変換できるようになります。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["回避時：", "稲光に変身し、4ダメージを与えて3メートル以内にあるもの全てに1気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+100% ダメージ耐性", "+30% 回避スピード"] },
      { protein: 0, mineral: 0, fat: 8000, mutagen: 0, passive: null, special: ["回避時：", "稲光に変身し、8ダメージを与えて3.5メートル以内にあるもの全てに2気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+100% ダメージ耐性", "+40% 回避スピード"] },
      { protein: 0, mineral: 0, fat: 10000, mutagen: 0, passive: null, special: ["回避時：", "稲光に変身し、12ダメージを与えて4メートル以内にあるもの全てに2気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+100% ダメージ耐性", "+50% 回避スピード"] },
      { protein: 0, mineral: 0, fat: 12000, mutagen: 175, passive: null, special: ["回避時：", "稲光に変身し、16ダメージを与えて4.5メートル以内にあるもの全てに3気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+100% ダメージ耐性", "+60% 回避スピード"] },
      { protein: 0, mineral: 0, fat: 14000, mutagen: 350, passive: null, special: ["回避時：", "稲光に変身し、20ダメージを与えて5メートル以内にあるもの全てに3気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。", "+100% ダメージ耐性", "+70% 回避スピード"] },
    ]
  },
  "bone-fin": {
    name: "ボーン・フィン",
    slot: "ひれ",
    element: "ボーン",
    image: "../images/equipment/ボーン・フィン.png",
    obtain: "入手条件：捕食者のアオザメ討伐",
    age: "大人",
    description: "この進化を選択することで、クルクル回転する骨の刃でできた、フードプロセッサーになることができます。",
    passive: true,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+3% ダメージ耐性", "+3% 体当たりダメージ"], special: ["回避時：", "1.00メートル以内にあるもの全てに30ダメージを与えます。", "+10% ダメージ耐性"] },
      { protein: 0, mineral: 8000, fat: 0, mutagen: 0, passive: ["+6% ダメージ耐性", "+6% 体当たりダメージ"], special: ["回避時：", "1.25メートル以内にあるもの全てに35ダメージを与えます。", "+12% ダメージ耐性"] },
      { protein: 0, mineral: 10000, fat: 0, mutagen: 0, passive: ["+9% ダメージ耐性", "+9% 体当たりダメージ"], special: ["回避時：", "1.50メートル以内にあるもの全てに40ダメージを与えます。", "+14% ダメージ耐性"] },
      { protein: 0, mineral: 12000, fat: 0, mutagen: 175, passive: ["+12% ダメージ耐性", "+12% 体当たりダメージ"], special: ["回避時：", "1.75メートル以内にあるもの全てに45ダメージを与えます。", "+16% ダメージ耐性"] },
      { protein: 0, mineral: 14000, fat: 0, mutagen: 350, passive: ["+15% ダメージ耐性", "+15% 体当たりダメージ"], special: ["回避時：", "2.00メートル以内にあるもの全てに50ダメージを与えます。", "+20% ダメージ耐性"] },
    ]
  },
  "atomic-tail": {
    name: "アトミックテール",
    slot: "しっぽ",
    element: "アトミック",
    image: "../images/equipment/アトミックテール.png",
    obtain: "入手条件：DLCメインクエストのボーンマッコウクジラ討伐",
    age: "大人",
    description: "この進化により、テールウィップを行うときに尻尾からアトミックエネルギーの玉を飛ばすことができます。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["テールウィップ時：", "30メートルの範囲内で100ダメージを与える1ボルトの原子エネルギーを放出します。"] },
      { protein: 0, mineral: 18000, fat: 0, mutagen: 600, passive: null, special: ["テールウィップ時：", "30メートルの範囲内で115ダメージを与える1ボルトの原子エネルギーを放出します。"] },
      { protein: 0, mineral: 21000, fat: 0, mutagen: 700, passive: null, special: ["テールウィップ時：", "30メートルの範囲内で130ダメージを与える1ボルトの原子エネルギーを放出します。"] },
      { protein: 0, mineral: 24000, fat: 0, mutagen: 750, passive: null, special: ["テールウィップ時：", "30メートルの範囲内で140ダメージを与える1ボルトの原子エネルギーを放出します。"] },
      { protein: 0, mineral: 28000, fat: 0, mutagen: 800, passive: null, special: ["テールウィップ時：", "30メートルの範囲内で150ダメージを与える1ボルトの原子エネルギーを放出します。"] },
    ]
  },
  "shadow-tail": {
    name: "シャドウ・テール",
    slot: "しっぽ",
    element: "シャドウ",
    image: "../images/equipment/シャドウ・テール.png",
    obtain: "入手条件：プロスピリティーランドのランドマーク全収集",
    age: "大人",
    description: "この進化を選択すると、テールウィップを行うときに尻尾から毒の玉を飛ばすことができるようになります。",
    passive: true,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+10% 最高スピード", "+20% ウィップショット速度", "+20% ウィップショット範囲", "+10% 水泳スピード"], special: ["テールウィップ時：", "30メートルの範囲内で当たったもの全てに25ダメージを与える猛毒投射物を放出します。これが当たると、6メートル以内にいる全ての生物に1猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
      { protein: 8000, mineral: 0, fat: 0, mutagen: 0, passive: ["+12.5% 最高スピード", "+25% ウィップショット速度", "+25% ウィップショット範囲", "+12.5% 水泳スピード"], special: ["テールウィップ時：", "30メートルの範囲内で当たったもの全てに30ダメージを与える猛毒投射物を放出します。これが当たると、7メートル以内にいる全ての生物に2猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
      { protein: 10000, mineral: 0, fat: 0, mutagen: 0, passive: ["+15% 最高スピード", "+30% ウィップショット速度", "+30% ウィップショット範囲", "+15% 水泳スピード"], special: ["テールウィップ時：", "30メートルの範囲内で当たったもの全てに35ダメージを与える猛毒投射物を放出します。これが当たると、8メートル以内にいる全ての生物に3猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
      { protein: 12000, mineral: 0, fat: 0, mutagen: 175, passive: ["+17.5% 最高スピード", "+35% ウィップショット速度", "+35% ウィップショット範囲", "+17.5% 水泳スピード"], special: ["テールウィップ時：", "30メートルの範囲内で当たったもの全てに40ダメージを与える猛毒投射物を放出します。これが当たると、9メートル以内にいる全ての生物に4猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
      { protein: 14000, mineral: 0, fat: 0, mutagen: 350, passive: ["+20% 最高スピード", "+40% ウィップショット速度", "+40% ウィップショット範囲", "+20% 水泳スピード"], special: ["テールウィップ時：", "30メートルの範囲内で当たったもの全てに50ダメージを与える猛毒投射物を放出します。これが当たると、10メートル以内にいる全ての生物に5猛毒カウントを与える猛毒の雲を放出します。生物たちは1カウントごとに1%の速度減少とダメージ耐性減少、そして毎秒2ダメージを受けます。これは最高で30カウントまで蓄積します。カウントは3秒ごとに取り除かれます。"] },
    ]
  },
  "bioelectric-tail": {
    name: "バイオエレクトリック・テール",
    slot: "しっぽ",
    element: "バイオエレクトリック",
    image: "../images/equipment/バイオエレクトリック・テール.png",
    obtain: "入手条件：悪名ランク8",
    age: "大人",
    description: "この進化を選択すると、尻尾から電流を放てるようになります。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["テールウィップ時：", "電流の波を放出し、4ダメージを与えて30メートルの進路上にあるもの全てに1気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
      { protein: 0, mineral: 0, fat: 8000, mutagen: 0, passive: null, special: ["テールウィップ時：", "電流の波を放出し、8ダメージを与えて30メートルの進路上にあるもの全てに2気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
      { protein: 0, mineral: 0, fat: 10000, mutagen: 0, passive: null, special: ["テールウィップ時：", "電流の波を放出し、12ダメージを与えて30メートルの進路上にあるもの全てに2気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
      { protein: 0, mineral: 0, fat: 12000, mutagen: 175, passive: null, special: ["テールウィップ時：", "電流の波を放出し、16ダメージを与えて30メートルの進路上にあるもの全てに3気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
      { protein: 0, mineral: 0, fat: 14000, mutagen: 350, passive: null, special: ["テールウィップ時：", "電流の波を放出し、20ダメージを与えて30メートルの進路上にあるもの全てに3気絶カウントを与えます。ターゲットに10気絶カウントを蓄積すると、ターゲットが気絶します。気絶カウントは3秒ごとに取り除かれます。"] },
    ]
  },
  "bone-tail": {
    name: "ボーン・テール",
    slot: "しっぽ",
    element: "ボーン",
    image: "../images/equipment/ボーン・テール.png",
    obtain: "入手条件：捕食者ホホジロザメ討伐",
    age: "大人",
    description: "この進化を選択することで、尻尾を頭蓋骨をズタズタにするスレッジハンマーにすることができます。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+30% 照射範囲", "+6 テールウィップダメージ", "+50% テールウィップの力", "+3% ダメージ耐性", "+4% 体当たりダメージ"], special: null },
      { protein: 0, mineral: 8000, fat: 0, mutagen: 0, passive: ["+35% 照射範囲", "+12 テールウィップダメージ", "+100% テールウィップの力", "+6% ダメージ耐性", "+8% 体当たりダメージ"], special: null },
      { protein: 0, mineral: 10000, fat: 0, mutagen: 0, passive: ["+40% 照射範囲", "+18 テールウィップダメージ", "+150% テールウィップの力", "+9% ダメージ耐性", "+12% 体当たりダメージ"], special: null },
      { protein: 0, mineral: 12000, fat: 0, mutagen: 175, passive: ["+45% 照射範囲", "+24 テールウィップダメージ", "+200% テールウィップの力", "+12% ダメージ耐性", "+26% 体当たりダメージ"], special: null },
      { protein: 0, mineral: 14000, fat: 0, mutagen: 350, passive: ["+50% 照射範囲", "+30 テールウィップダメージ", "+250% テールウィップの力", "+15% ダメージ耐性", "+20% 体当たりダメージ"], special: null },
    ]
  },
  "advanced-sonor": {
    name: "上級ソナー",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/上級ソナー.png",
    obtain: "入手条件：最初の洞窟に入る",
    age: "",
    description: "この進化を選択すると、ソナー能力のクールダウン時間が減少し、距離と探知能力が上昇します。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+50% ソナー照射範囲", "-10% ソナークールダウン"], special: null },
      { protein: 2000, mineral: 0, fat: 0, mutagen: 0, passive: ["+100% ソナー照射範囲", "-20% ソナークールダウン"], special: null },
      { protein: 8000, mineral: 0, fat: 0, mutagen: 0, passive: ["+150% ソナー照射範囲", "-30% ソナークールダウン"], special: null },
      { protein: 10000, mineral: 0, fat: 0, mutagen: 175, passive: ["+200% ソナー照射範囲", "-40% ソナークールダウン"], special: null },
      { protein: 12000, mineral: 0, fat: 0, mutagen: 350, passive: ["+250% ソナー照射範囲", "-50% ソナークールダウン"], special: null },
    ]
  },
  "hearty": {
    name: "強い心臓",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/強い心臓.png",
    obtain: "入手条件：悪名ランク2",
    age: "",
    description: "この進化を選択すると、体力が増加し、船員からの近接攻撃によって船から落とされにくくなります。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+150 最大体力", "+20 乗員ノックバック耐性"], special: null },
      { protein: 0, mineral: 6000, fat: 0, mutagen: 0, passive: ["+300 最大体力", "+30 乗員ノックバック耐性"], special: null },
      { protein: 0, mineral: 8000, fat: 0, mutagen: 0, passive: ["+400 最大体力", "+40 乗員ノックバック耐性"], special: null },
      { protein: 0, mineral: 10000, fat: 0, mutagen: 175, passive: ["+500 最大体力", "+50 乗員ノックバック耐性"], special: null },
      { protein: 0, mineral: 12000, fat: 0, mutagen: 350, passive: ["+600 最大体力", "+60 乗員ノックバック耐性"], special: null },
    ]
  },
  "protein-degestion": {
    name: "タンパク質消化",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/タンパク質消化.png",
    obtain: "入手条件：フォーテック・バイユーのランドマーク全収集",
    age: "",
    description: "この進化を選択すると、捕食によって得られるタンパク質と体力回復量が増加します。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+10% タンパク質", "+10% 食事による体力"], special: null },
      { protein: 0, mineral: 6000, fat: 0, mutagen: 0, passive: ["+15% タンパク質", "+15% 食事による体力"], special: null },
      { protein: 0, mineral: 8000, fat: 0, mutagen: 0, passive: ["+20% タンパク質", "+20% 食事による体力"], special: null },
      { protein: 0, mineral: 10000, fat: 0, mutagen: 175, passive: ["+25% タンパク質", "+25% 食事による体力"], special: null },
      { protein: 0, mineral: 12000, fat: 0, mutagen: 350, passive: ["+30% タンパク質", "+30% 食事による体力"], special: null },
    ]
  },
  "mineral-degestion": {
    name: "ミネラル消化",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/ミネラル消化.png",
    obtain: "入手条件：悪名ランク3",
    age: "",
    description: "この進化を選択すると、捕食によって得られるミネラルと体力回復量が増加します。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+10% ミネラル", "+10% 食事による体力"], special: null },
      { protein: 0, mineral: 0, fat: 6000, mutagen: 0, passive: ["+15% ミネラル", "+15% 食事による体力"], special: null },
      { protein: 0, mineral: 0, fat: 8000, mutagen: 0, passive: ["+20% ミネラル", "+20% 食事による体力"], special: null },
      { protein: 0, mineral: 0, fat: 10000, mutagen: 175, passive: ["+25% ミネラル", "+25% 食事による体力"], special: null },
      { protein: 0, mineral: 0, fat: 12000, mutagen: 350, passive: ["+30% ミネラル", "+30% 食事による体力"], special: null },
    ]
  },
  "fat-degestion": {
    name: "脂肪消化",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/脂肪消化.png",
    obtain: "入手条件：ストーリークエスト「ピートの逆襲」クリア",
    age: "",
    description: "この進化を選択すると、捕食によって得られる脂肪と体力回復量が増加します。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+10% 脂肪", "+10% 食事による体力"], special: null },
      { protein: 6000, mineral: 0, fat: 0, mutagen: 0, passive: ["+15% 脂肪", "+15% 食事による体力"], special: null },
      { protein: 8000, mineral: 0, fat: 0, mutagen: 0, passive: ["+20% 脂肪", "+20% 食事による体力"], special: null },
      { protein: 10000, mineral: 0, fat: 0, mutagen: 175, passive: ["+25% 脂肪", "+25% 食事による体力"], special: null },
      { protein: 12000, mineral: 0, fat: 0, mutagen: 350, passive: ["+30% 脂肪", "+30% 食事による体力"], special: null },
    ]
  },
  "adrenal-gland": {
    name: "副腎",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/副腎.png",
    obtain: "入手条件：悪名ランク4",
    age: "",
    description: "この進化を選択すると、深刻なダメージを負っているときに移動速度が上昇します。",
    passive: false,
    special: true,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["体力が低い場合（HP25%以下）：", "+10% 最高スピード", "+10% 回避スピード", "+10% 突進速度", "+10% 加速ボーナス", "+10% 水泳スピード"] },
      { protein: 3000, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["体力が低い場合（HP25%以下）：", "+15% 最高スピード", "+15% 回避スピード", "+15% 突進速度", "+15% 加速ボーナス", "+15% 水泳スピード"] },
      { protein: 4000, mineral: 0, fat: 0, mutagen: 0, passive: null, special: ["体力が低い場合（HP25%以下）：", "+20% 最高スピード", "+20% 回避スピード", "+20% 突進速度", "+20% 加速ボーナス", "+20% 水泳スピード"] },
      { protein: 5000, mineral: 0, fat: 0, mutagen: 80, passive: null, special: ["体力が低い場合（HP25%以下）：", "+25% 最高スピード", "+25% 回避スピード", "+25% 突進速度", "+25% 加速ボーナス", "+25% 水泳スピード"] },
      { protein: 6000, mineral: 0, fat: 0, mutagen: 160, passive: null, special: ["体力が低い場合（HP25%以下）：", "+30% 最高スピード", "+30% 回避スピード", "+30% 突進速度", "+30% 加速ボーナス", "+30% 水泳スピード"] },
    ]
  },
  "amphibious": {
    name: "水陸両用",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/水陸両用.png",
    obtain: "入手条件：捕食者アリゲーター討伐",
    age: "",
    description: "この進化を選択すると、陸上でより速く動き、より長く生き残ることができます。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+10% 着陸スピード", "+25% 陸地での生存時間"], special: null },
      { protein: 0, mineral: 0, fat: 3000, mutagen: 0, passive: ["+20% 着陸スピード", "+50% 陸地での生存時間"], special: null },
      { protein: 0, mineral: 0, fat: 4000, mutagen: 0, passive: ["+30% 着陸スピード", "+75% 陸地での生存時間"], special: null },
      { protein: 0, mineral: 0, fat: 5000, mutagen: 80, passive: ["+40% 着陸スピード", "+100% 陸地での生存時間"], special: null },
      { protein: 0, mineral: 0, fat: 6000, mutagen: 160, passive: ["+50% 着陸スピード", "+125% 陸地での生存時間"], special: null },
    ]
  },
  "reinforced-cartilage": {
    name: "強化軟骨組織",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/強化軟骨組織.png",
    obtain: "入手条件：湾岸のランドマーク全収集",
    age: "",
    description: "この進化を選択すると、ダメージに対する抵抗力が高まります。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+3% ダメージ耐性"], special: null },
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+6% ダメージ耐性"], special: null },
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+9% ダメージ耐性"], special: null },
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+12% ダメージ耐性"], special: null },
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+15% ダメージ耐性"], special: null },
    ]
  },
  "mutagen-digesion": {
    name: "突然変異源消化",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/突然変異源消化.png",
    obtain: "入手条件：悪名ランク7",
    age: "",
    description: "この進化を選択すると、捕食によって得られる突然変異源と体力回復量が増加します。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+10% 突然変異源", "+10% 食事による体力"], special: null },
      { protein: 0, mineral: 0, fat: 6000, mutagen: 0, passive: ["+15% 突然変異源", "+15% 食事による体力"], special: null },
      { protein: 0, mineral: 0, fat: 8000, mutagen: 0, passive: ["+20% 突然変異源", "+20% 食事による体力"], special: null },
      { protein: 0, mineral: 0, fat: 10000, mutagen: 175, passive: ["+25% 突然変異源", "+25% 食事による体力"], special: null },
      { protein: 0, mineral: 0, fat: 12000, mutagen: 350, passive: ["+30% 突然変異源", "+30% 食事による体力"], special: null },
    ]
  },
  "subliminal-evastion": {
    name: "サブリミナル回避",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/サブリミナル回避.png",
    obtain: "入手条件：捕食者のマッコウクジラ討伐",
    age: "",
    description: "この進化を選択すると、普段敵対している自分よりもある程度小さな野生動物が中立になります。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["あなたのサイズの50%よりも小さい敵対的な魚は、あなたに対して中立になります。"], special: null },
      { protein: 0, mineral: 0, fat: 3000, mutagen: 0, passive: ["あなたのサイズの60%よりも小さい敵対的な魚は、あなたに対して中立になります。"], special: null },
      { protein: 0, mineral: 0, fat: 4000, mutagen: 0, passive: ["あなたのサイズの70%よりも小さい敵対的な魚は、あなたに対して中立になります。"], special: null },
      { protein: 0, mineral: 0, fat: 5000, mutagen: 80, passive: ["あなたのサイズの80%よりも小さい敵対的な魚は、あなたに対して中立になります。"], special: null },
      { protein: 0, mineral: 0, fat: 6000, mutagen: 160, passive: ["あなたのサイズの90%よりも小さい敵対的な魚は、あなたに対して中立になります。"], special: null },
    ]
  },
  "blutal-muscles": {
    name: "冷酷な筋肉",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/冷酷な筋肉.png",
    obtain: "入手条件：悪名ランク10",
    age: "",
    description: "この進化を選択すると、泳ぎのスピードとテールウィップのダメージが増加します。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+5% 最高スピード", "+5 テールウィップダメージ", "+5% 加速ボーナス", "+5% テールウィップの力", "+5% 水泳スピード"], special: null },
      { protein: 6000, mineral: 0, fat: 0, mutagen: 0, passive: ["+10% 最高スピード", "+10 テールウィップダメージ", "+10% 加速ボーナス", "+10% テールウィップの力", "+10% 水泳スピード"], special: null },
      { protein: 8000, mineral: 0, fat: 0, mutagen: 0, passive: ["+15% 最高スピード", "+15 テールウィップダメージ", "+15% 加速ボーナス", "+15% テールウィップの力", "+15% 水泳スピード"], special: null },
      { protein: 10000, mineral: 0, fat: 0, mutagen: 175, passive: ["+20% 最高スピード", "+20 テールウィップダメージ", "+20% 加速ボーナス", "+20% テールウィップの力", "+20% 水泳スピード"], special: null },
      { protein: 12000, mineral: 0, fat: 0, mutagen: 350, passive: ["+25% 最高スピード", "+25 テールウィップダメージ", "+25% 加速ボーナス", "+25% テールウィップの力", "+25% 水泳スピード"], special: null },
    ]
  },
  "tail-catapult": {
    name: "尻尾投石器",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/尻尾投石器.png",
    obtain: "入手条件：DLC悪名ランク1",
    age: "子供",
    description: "ウィップショット攻撃のダメージ、範囲、力、速度が増加します。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["ウィップショット投射物はさらに+5%のダメージを与えます。", "+100% ウィップショットの速度", "+100% ウィップショットの範囲", "+100% ウィップショットの力"], special: null },
      { protein: 16000, mineral: 0, fat: 0, mutagen: 500, passive: ["ウィップショット投射物はさらに+10%のダメージを与えます。", "+150% ウィップショットの速度", "+150% ウィップショットの範囲", "+150% ウィップショットの力"], special: null },
      { protein: 18000, mineral: 0, fat: 0, mutagen: 550, passive: ["ウィップショット投射物はさらに+15%のダメージを与えます。", "+200% ウィップショットの速度", "+200% ウィップショットの範囲", "+200% ウィップショットの力"], special: null },
      { protein: 20000, mineral: 0, fat: 0, mutagen: 600, passive: ["ウィップショット投射物はさらに+20%のダメージを与えます。", "+250% ウィップショットの速度", "+250% ウィップショットの範囲", "+250% ウィップショットの力"], special: null },
      { protein: 22000, mineral: 0, fat: 0, mutagen: 650, passive: ["ウィップショット投射物はさらに+25%のダメージを与えます。", "+300% ウィップショットの速度", "+300% ウィップショットの範囲", "+300% ウィップショットの力"], special: null },
    ]
  },
  "sonic-burst": {
    name: "音波の炸裂",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/音波の炸裂.png",
    obtain: "入手条件：DLC悪名ランク3",
    age: "子供",
    description: "この進化によりソナーを使うと強力な爆風が放出されるので、付近のクリーチャーやボートにダメージを与えはねつけます。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["ソナーを使うと、あなたは音速の突風を放ち、10メートル範囲内にいるクリーチャーとボートに100ダメージを与え排除します。ターゲットがあなたから遠くにいるとダメージは弱まります。"], special: null },
      { protein: 0, mineral: 0, fat: 16000, mutagen: 500, passive: ["ソナーを使うと、あなたは音速の突風を放ち、15メートル範囲内にいるクリーチャーとボートに115ダメージを与え排除します。ターゲットがあなたから遠くにいるとダメージは弱まります。"], special: null },
      { protein: 0, mineral: 0, fat: 18000, mutagen: 550, passive: ["ソナーを使うと、あなたは音速の突風を放ち、20メートル範囲内にいるクリーチャーとボートに130ダメージを与え排除します。ターゲットがあなたから遠くにいるとダメージは弱まります。"], special: null },
      { protein: 0, mineral: 0, fat: 20000, mutagen: 600, passive: ["ソナーを使うと、あなたは音速の突風を放ち、25メートル範囲内にいるクリーチャーとボートに140ダメージを与え排除します。ターゲットがあなたから遠くにいるとダメージは弱まります。"], special: null },
      { protein: 0, mineral: 0, fat: 22000, mutagen: 650, passive: ["ソナーを使うと、あなたは音速の突風を放ち、30メートル範囲内にいるクリーチャーとボートに150ダメージを与え排除します。ターゲットがあなたから遠くにいるとダメージは弱まります。"], special: null },
    ]
  },
  "healing-factor": {
    name: "回復ファクター",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/回復ファクター.png",
    obtain: "入手条件：DLC悪名ランク2",
    age: "",
    description: "この進化により、毎秒体力がわずかに回復します。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["+12 体力再生"], special: null },
      { protein: 0, mineral: 16000, fat: 0, mutagen: 500, passive: ["+18 体力再生"], special: null },
      { protein: 0, mineral: 18000, fat: 0, mutagen: 550, passive: ["+24 体力再生"], special: null },
      { protein: 0, mineral: 20000, fat: 0, mutagen: 600, passive: ["+30 体力再生"], special: null },
      { protein: 0, mineral: 22000, fat: 0, mutagen: 650, passive: ["+36 体力再生"], special: null },
    ]
  },
  "disorienting-sonor": {
    name: "ソナーの方向感覚を狂わせる",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/ソナーの方向感覚を狂わせる.png",
    obtain: "入手条件：DLC悪名ランク4",
    age: "子供",
    description: "ソナーを使うと付近のクリーチャーの方向感覚を惑わせ、彼らが与えるダメージが少なくなります。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["ソナーを使うと、20メートル範囲内にいるクリーチャーは彼らが与えるダメージに6秒間-15%のペナルティを得ます。"], special: null },
      { protein: 16000, mineral: 0, fat: 0, mutagen: 500, passive: ["ソナーを使うと、30メートル範囲内にいるクリーチャーは彼らが与えるダメージに7秒間-19%のペナルティを得ます。"], special: null },
      { protein: 18000, mineral: 0, fat: 0, mutagen: 550, passive: ["ソナーを使うと、40メートル範囲内にいるクリーチャーは彼らが与えるダメージに8秒間-23%のペナルティを得ます。"], special: null },
      { protein: 20000, mineral: 0, fat: 0, mutagen: 600, passive: ["ソナーを使うと、50メートル範囲内にいるクリーチャーは彼らが与えるダメージに9秒間-27%のペナルティを得ます。"], special: null },
      { protein: 22000, mineral: 0, fat: 0, mutagen: 650, passive: ["ソナーを使うと、60メートル範囲内にいるクリーチャーは彼らが与えるダメージに10秒間-30%のペナルティを得ます。"], special: null },
    ]
  },
  "targetting-sonor": {
    name: "標的のソナー",
    slot: "内蔵",
    element: "",
    image: "../images/equipment/標的のソナー.png",
    obtain: "入手条件：DLC悪名ランク5",
    age: "子供",
    description: "ソナーを使って付近の脅威を正確に狙い、ダメージボーナスを短時間与えます。",
    passive: true,
    special: false,
    tiers: [
      { protein: 0, mineral: 0, fat: 0, mutagen: 0, passive: ["ソナーを使うとソナー音を放出し、6秒間20メートル範囲内にいるクリーチャーや人間へのダメージに+15%のボーナスが与えられます。"], special: null },
      { protein: 16000, mineral: 0, fat: 0, mutagen: 500, passive: ["ソナーを使うとソナー音を放出し、7秒間30メートル範囲内にいるクリーチャーや人間へのダメージに+19%のボーナスが与えられます。"], special: null },
      { protein: 18000, mineral: 0, fat: 0, mutagen: 550, passive: ["ソナーを使うとソナー音を放出し、8秒間40メートル範囲内にいるクリーチャーや人間へのダメージに+23%のボーナスが与えられます。"], special: null },
      { protein: 20000, mineral: 0, fat: 0, mutagen: 600, passive: ["ソナーを使うとソナー音を放出し、9秒間50メートル範囲内にいるクリーチャーや人間へのダメージに+26%のボーナスが与えられます。"], special: null },
      { protein: 22000, mineral: 0, fat: 0, mutagen: 650, passive: ["ソナーを使うとソナー音を放出し、10秒間60メートル範囲内にいるクリーチャーや人間へのダメージに+30%のボーナスが与えられます。"], special: null },
    ]
  },
};
