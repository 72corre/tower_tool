const ENEMY_ALL_DATA = {
  "死をあやす者": {
    QRid:'001',
    "party": [
      null,
      null,
      {
        "name": "死をあやす者",
        "style": "バースト",
        "class": "スナイパー", 
        "gauge": 5,
        "trait": "冥府への誘い: HP50%以下のとき、デバフ継続ターン+1",
        "tags": ["死者", "大幻獣"],
        "hp": 34580,
        "atk": 1311,
        "def": 593,
        "spd": 720,
        "skills": {
          "skill": "地獄の子守歌: 敵単体に攻撃力1.8倍+めまい/呪い(3T)",
          "awakened": "断末魔: 敵全体に攻撃力0.8倍+攻防-65%(2T)",
          "ultimate": "冥界の産声: ランダム単体即死(100%)"
        },
        "leader": true
      },
      null,
      null
    ],
    "locations": [
      {
       "floor": 1,
       "theme": "なし",
       "square_id": "f1-b1",
        "square_type": "battle",
        "rules": ["ルール: 全能力+20%（幻獣）"]
      }
    ]
  },
  "ベインチェイサー": {
    QRid:'002',
    "party": [
      null,
      null,
      {
        "name": "ベインチェイサー",
        "style": "カウンター",
        "class": "ファイター", 
        "gauge": 5,
        "trait": "終わりなき苦痛: HPが50%を下回ったとき、敵を状態異常にした際のターンが1ターン増加",
        "hp": 24218,
        "atk": 1200,
        "def": 1677,
        "spd": 433,
        "skills": {
          "skill": "毒の華： 敵全体に攻撃力0.8倍のダメージ。さらに65%の確率で、2ターンの間、毒状態。",
          "awakened": "毒蠍の爪： 敵単体に攻撃力1.05倍倍の2連続ダメージ。80%の確率で、フォトンを1つ破壊。",
          "ultimate": "ヴェノムバスター： 敵単体に攻撃力1.8倍のダメージ。敵が毒状態の場合、ダメージが3.75倍。"
        },
        "leader": true
      },
      null,
      null
    ],
    "locations": [
      {
        "floor": 1,
        "theme": "なし",
        "square_id": "f1-b2",
        "square_type": "battle",
        "rules": ["ルール: 全能力+20%（幻獣）"]
      }
    ]
  },
  "Ωアバドン": {
    QRid:'003',
    "party": [
      null,
      null,
      {
        "name": "Ωアバドン",
        "style": "バースト",
        "class": "ファイター", 
        "gauge": 8,
        "trait": "滅殺モード： 自身のHPが50%以下のときフォトン容量が+2され、毎ターン終了時覚醒ゲージが+2される。通常攻撃が10連撃。 ",
        "tags": ["龍","神"],
        "hp": 149562,
        "atk": 3011,
        "def":761,
        "spd":486 , 
        "skills": {
          "skill": "オメガスラッシュ： 敵横一列に攻撃力0.5倍のダメージ。さらに、対象に積まれているフォトンを上から2つ破壊する。",
          "awakened": "えぐりだし： 敵単体に攻撃力1.75倍の2連続ダメージ。さらに与えたダメージの100%を吸収する",
          "ultimate": "滅殺： 敵全体に攻撃力2.25倍の防御無視ダメージ。さらに対象の覚醒ゲージを0にし、煉獄の炎状態にする(永続)"
        },
        "leader": true
      },
      null,
      null
    ],
    "locations": [
      {
        "floor": 1,
         "theme": "なし",
         "square_id": "f1-o",
         "square_type": "boss",
         "rules": ["なし"]
      },
      {
        "floor": 30,
        "theme": "HP引き継ぎ禁止",
        "square_id": "f2-b1",
        "square_type": "battle",
        "rules": ["ルール: 全能力+20%（幻獣）"]
      },
    ]
  },
  "赤月の残党兵長": {
    QRid:'004',
    "party": [
      {
        "name": "赤月の残党槍兵A",
        "style": "ラッシュ",
        "class": "トルーパー", 
        "gauge": 3,
        "trait": "赤月の兵士：　HPが30%以下のとき、自身の全ステータスが1.2倍になる ",
        "tags": ["獣人"],
        "hp": 9215,
        "atk":1137 ,
        "def":672 ,
        "spd":349 ,
        "skills": {
          "skill": "二連突き：　敵単体に攻撃力0.7倍の2連続ダメージ",
          "awakened": "雑草魂：　自身のHPを20%回復する さらに2ターンの間、自身の攻撃力を30%上昇する",
          "ultimate": "渾身一槍：　敵単体に攻撃力1.2倍のダメージ さらに50%の確率で、積まれているフォトンを1つ破壊する"
        }
      },
	    null,
      {
        "name": "赤月の残党兵長",
        "style": "ラッシュ",
        "class": "ファイター", 
        "gauge": 3,
        "trait": "赤月の兵士：　HPが30%以下のとき、自身の全ステータスが1.2倍になる ",
        "tags": ["獣人"],
        "hp": 15496,
        "atk":2207 ,
        "def":473,
        "spd":352 ,
        "leader" : true,
        "skills": {
          "skill": "二連斧撃：　敵単体に攻撃力0.9倍の2連続ダメージ",
          "awakened": "雑草魂：　自身のHPを20％回復する さらに2ターンの間、自身の攻撃力を30%上昇する",
          "ultimate": "四連斧撃：　敵単体に攻撃力0.75倍の2連続ダメージ この行動を2回行う"
        }
      },
	    null,
	    {
        "name": "赤月の残党槍兵B",
        "style": "ラッシュ",
        "class": "トルーパー", 
        "gauge": 3,
        "trait": "赤月の兵士：　HPが30%以下のとき、自身の全ステータスが1.2倍になる ",
        "tags": ["獣人"],
        "hp": 9215,
        "atk":1137 ,
        "def":672 ,
        "spd":349 ,
        "skills": {
          "skill": "二連突き：　敵単体に攻撃力0.7倍の2連続ダメージ",
          "awakened": "雑草魂：　自身のHPを20%回復する さらに2ターンの間、自身の攻撃力を30%上昇する",
          "ultimate": "渾身一槍：　敵単体に攻撃力1.2倍のダメージ さらに50%の確率で、積まれているフォトンを1つ破壊する"
        }
       } 
    ],
    "locations": [
        {
          "floor":2,
          "theme": "なし",
          "square_id": "f2-b1",
          "square_type": "battle",
          "rules": ["防+50%（幻獣）"]
        },
	      {
          "floor":3 ,
          "theme": "なし",
          "square_id": "f3-b2",
          "square_type": "battle",
          "rules": ["早+50%（幻獣）"]
        },
	      {
          "floor":5 ,
          "theme": "なし",
          "square_id": "f5-b1",
          "square_type": "battle",
          "rules": ["全能力+50%（幻獣）"]
        }
    ]
  },
  "ネイロード": {
    QRid:'005',
    "party": [
      null,
      null,
      {
        "name": "ネイロード",
        "style": "バースト",
        "class": "トルーパー", 
        "gauge":6 ,
        "trait": "遺跡の守護者： HPが30%以下のとき、地形の持続ターンが+2される ",
        "tags": ["龍","飛行"],
        "hp":27714 ,
        "atk":1906 ,
        "def":716 ,
        "spd":538 ,
        "skills": {
          "skill": "ライトニングレイ： 敵横一列に攻撃力1.2倍の雷ダメージ。さらに50%の確率で、2ターンの間、敵を感電状態にする",
          "awakened": "ライトニングイリュージョン： 2ターンの間、敵全体を感電状態にする",
          "ultimate": "ライトニングブレス： 敵全体に攻撃力2倍の雷ダメージ。2ターンの間、帯電の地形効果で0.5倍の継続ダメージを与え、確率で感電させる"
        },
        "leader": true
      },
      null,
      null
    ],
    "locations": [
      {
        "floor": 2,
        "theme": "なし",
        "square_id": "f2-b2",
        "square_type": "battle",
        "rules": ["防+50%（幻獣）"]
      },
      {
        "floor": 4,
        "theme": "なし",
        "square_id": "f4-b2",
        "square_type": "battle",
        "rules": ["攻+50%（幻獣）"]
      },
      {
        "floor": 5,
        "theme": "なし",
        "square_id": "f5-b2",
        "square_type": "battle",
        "rules": ["全能力+50%（幻獣）"]
      }
    ]
  },
  "デクリオンオーク": {
    QRid:'006',
    "party": [
      {
        "name": "デクリオンオーク",
        "style": "カウンター",
        "class": "ファイター", 
        "gauge":5 ,
        "trait": "赤月の兵士: HPが30%以下のとき、自身の全ステータスが1.2倍になる ",
        "tags": ["獣人"],
        "hp": 10423,
        "atk":2224 ,
        "def":391 ,
        "spd":355 ,
        "skills": {
          "skill": "豪連撃: 敵単体に攻撃力0.8倍の2連続ダメージ さらに30%の確率で、2ターンの間、めまい状態にする",
          "awakened": "豪連閃: 敵横一列に攻撃力1倍の2連続ダメージ さらに30%の確率で、2ターンの間、めまい状態にする",
          "ultimate": "勇往邁進: 自身にアタックフォトンを2つ追加する"
        },
      },
	null,
      {
        "name": "ウェリテスオーク",
        "style": "カウンター",
        "class": "スナイパー", 
        "gauge": 4,
        "trait": "赤月の兵士: HPが30%以下のとき、自身の全ステータスが1.2倍になる	",
        "tags": ["獣人"],
        "hp": 8264,
        "atk": 1734,
        "def": 387,
        "spd": 572,
        "skills": {
          "skill": "援護投擲: 2ターンの間、味方のアタックに対して自身が追撃する状態になる",
          "awakened": "イレイズストーン: 敵単体に攻撃力1倍のダメージ さらに敵にかかっている強化を解除する",
          "ultimate": "ジャイロストーン: 敵単体に攻撃力1倍の防御無視ダメージ さらに75%の確率で、2ターンの間、めまい状態にする"
        },
        "leader": true
      },
	null,
      {	
        "name": "エクイテスオーク",
        "style": "カウンター",
        "class": "トルーパー", 
        "gauge": 4,
        "trait": "赤月の兵士: HPが30%以下のとき、自身の全ステータスが1.2倍になる",
        "tags": ["獣人"],
        "hp":10330 ,
        "atk": 1261,
        "def": 678,
        "spd":352 ,
        "skills": {
          "skill": "鉄床戦術: 2ターンの間、全ての単体攻撃を受け持ち、さらに味方単体にアタックフォトンを1つ追加する",
          "awakened": "ファランクス: 2ターンの間、味方のアタックに対して自身が追撃する状態になる",
          "ultimate": "戦友鼓舞: 味方単体のHPを20%回復させる さらに2ターンの間、アタックを強化する"
        },
      }
    ],
    "locations": [
      {
        "floor": 2,
        "theme": "なし",
        "square_id": "f2-b2",
        "square_type": "battle",
        "rules": ["防+50%（幻獣）"]
      },
      {
        "floor": 4,
        "theme": "なし",
        "square_id": "f4-b2",
        "square_type": "battle",
        "rules": ["攻+50%（幻獣）"]
      },
      {
        "floor": 5,
        "theme": "なし",
        "square_id": "f5-b2",
        "square_type": "battle",
        "rules": ["全能力+50%（幻獣）"]
      }
    ]
  },
  "アシュトレト": {
    QRid:'007',
    "party": [
      {
        "name": "鼻先の目",
        "style": "カウンター",
        "class": "ファイター",
        "gauge": 4,
        "trait": "反撃の牙: ダメージを受けたとき、20%の確率で敵単体に攻撃力1.3倍のダメージを与え、30%の確率で2ターンの間、めまい状態にする",
        "tags": ["爬虫類", "大幻獣"],
        "hp": 35525,
        "atk": 1882,
        "def": 5070,
        "spd": 300,
        "skills": {
          "skill": "テイルハザード: 敵横一列に攻撃力1倍のダメージ+30%の確率でフォトン破壊",
          "awakened": "ヴェノムテイル: 後列の敵横一列に攻撃力2.25倍+80%の確率で毒(2T)",
          "ultimate": "フリーズブレス: 敵全体に攻撃力2〜2.75倍+50〜80%の確率で凍結(1T)【攻撃を2回受けるたびにスキルLv上昇】"
        }
      },
      {
        "name": "目",
        "style": "カウンター",
        "class": "ファイター",
        "gauge": 4,
        "trait": "反撃の牙: ダメージを受けたとき、20%の確率で敵単体に攻撃力1.3倍のダメージを与え、30%の確率で2ターンの間、めまい状態にする",
        "tags": ["爬虫類", "大幻獣"],
        "hp": 20825,
        "atk": 1421,
        "def": 5070,
        "spd": 450,
        "skills": {
          "skill": "マッスルアップ: 味方単体の攻撃力を2T50%上昇",
          "awakened": "リセットロア: 敵全体の強化解除",
          "ultimate": "スキルライズ: 味方全体のスキルフォトンを強化(2〜5T)【攻撃を2回受けるたびにスキルLv上昇】"
        }
      },
      {
        "name": "輝竜アシュトレト",
        "style": "カウンター",
        "class": "ファイター",
        "gauge": 4,
        "leader": true,
        "trait": "反撃の牙: ダメージを受けたとき、20%の確率で敵単体に攻撃力1.3倍のダメージを与え、30%の確率で2ターンの間、めまい状態にする",
        "tags": ["爬虫類", "大幻獣"],
        "hp": 18375,
        "atk": 1267,
        "def": 5070,
        "spd": 570,
        "skills": {
          "skill": "ガードアップ: 味方単体の防御力を2T50%上昇",
          "awakened": "スキルリリーブ: 味方単体へのスキルフォトンダメージを2T80%軽減",
          "ultimate": "オールブロッカー: 味方全体への最大HPの5〜20%以下のダメージを無効化(2T)【攻撃を2回受けるたびにスキルLv上昇】"
        }
      },
      {
        "name": "本体コア",
        "style": "カウンター",
        "class": "ファイター",
        "gauge": 4,
        "trait": "反撃の牙: ダメージを受けたとき、20%の確率で敵単体に攻撃力1.3倍のダメージを与え、30%の確率で2ターンの間、めまい状態にする",
        "tags": ["爬虫類", "大幻獣"],
        "hp": 15925,
        "atk": 1498,
        "def": 5070,
        "spd": 510,
        "skills": {
          "skill": "アタックリリーブ: 味方単体へのアタックフォトンダメージを2T80%軽減",
          "awakened": "フォトンゲイン: 味方全体のフォトン量+1(3T)",
          "ultimate": "スキルゲイン: 味方全体にスキルフォトン+1"
        }
      },
      {
        "name": "翼の結合部コア",
        "style": "カウンター",
        "class": "ファイター",
        "gauge": 3,
        "trait": "反撃の牙: ダメージを受けたとき、20%の確率で敵単体に攻撃力1.3倍のダメージを与え、30%の確率で2ターンの間、めまい状態にする",
        "tags": ["爬虫類", "大幻獣"],
        "hp": 13475,
        "atk": 1344,
        "def": 5070,
        "spd": 600,
        "skills": {
          "skill": "シングルヒール: 味方単体のHPを30%回復",
          "awakened": "ターンヒール: 味方単体のHPを毎ターン25%回復(2T)",
          "ultimate": "ラインヒール: 味方横一列のHPを45〜60%回復【攻撃を2回受けるたびにスキルLv上昇】"
        }
      }
    ],
    "locations": [
      {
        "floor": 2,
       "theme": "なし",
       "square_id": "f2-b1",
       "square_type": "battle",
       "rules": ["ルール: 防+50%（幻獣）"]
      },
      {
        "floor": 3,
       "theme": "なし",
       "square_id": "f3-b2",
       "square_type": "battle",
       "rules": ["ルール: 早+50%（幻獣）"]
      },
      {
        "floor": 5,
       "theme": "なし",
       "square_id": "f5-b1",
       "square_type": "battle",
       "rules": ["全能力+50%（幻獣）"]
      }
    ]
  },
  "タイラントワイズ": {
    QRid:'008',
    "party": [
      {
        "name": "エノイルA",
        "style": "バースト",
        "class": "スナイパー", 
        "gauge": 5,
        "trait": "水の精霊: 自身のアタックが雷ダメージになり、毎ターン終了時、HPが10%回復する",
        "tags": ["海洋生物"],
        "hp": 7506,
        "atk": 1699,
        "def": 391,
        "spd": 434,
        "skills": {
         	 "skill": "ソニックノイズ: 敵単体に攻撃力1倍のダメージ さらに50%の確率で、2ターンの間、混乱状態にする",
         	 "awakened": "スクリューテイル: 敵横一列に攻撃力0.5倍の3連続ダメージ",
         	 "ultimate": "ストリームショット:敵単体に攻撃力1.7倍のダメージ さらに2ターンの間、敵が積めるフォトンの量を－1する "
		    },
	    },
      null,
      {
        "name": "タイラントワイズ",
        "style": "バースト",
        "class": "スナイパー", 
        "gauge": 6,
        "trait": "賢者の知恵: スキル使用時、50%の確率で2ターンの間、積めるフォトン量を＋1する",
        "tags": ["海洋生物"],
        "hp": 18394,
        "atk": 1741,
        "def": 649,
        "spd": 398,
        "skills": {
          "skill": "ミスティックフォース: 1ターンの間、後列を優先して味方単体の効果範囲を全体化する",
          "awakened": "アクアピュロボルス: 敵単体に攻撃力2倍のダメージ さらに2ターンの間、敵が積めるフォトンの量を－1する",
          "ultimate": "アクアグランス:敵単体に攻撃力3倍のダメージ 2ターンの間、滞水の地形効果で0.25倍の継続ダメージを与え、雷に弱くする "
        },
        "leader": true
      },
      null,
      {
        "name": "エノイルA",
        "style": "バースト",
        "class": "スナイパー", 
        "gauge": 5,
        "trait": "水の精霊: 自身のアタックが雷ダメージになり、毎ターン終了時、HPが10%回復する",
        "tags": ["海洋生物"],
        "hp": 7506,
        "atk": 1699,
        "def": 391,
        "spd": 434,
        "skills": {
          "skill": "ソニックノイズ: 敵単体に攻撃力1倍のダメージ さらに50%の確率で、2ターンの間、混乱状態にする",
          "awakened": "スクリューテイル: 敵横一列に攻撃力0.5倍の3連続ダメージ",
          "ultimate": "ストリームショット:敵単体に攻撃力1.7倍のダメージ さらに2ターンの間、敵が積めるフォトンの量を－1する "
		      },
	    }
    ],
    "locations": [
      {
       "floor": 3,
       "theme": "なし",
       "square_id": "f3-b1",
        "square_type": "battle",
        "rules": ["ルール: 早+50%（幻獣）"]
      },
      {
        "floor": 4,
        "theme": "なし",
        "square_id": "f4-b2",
         "square_type": "battle",
         "rules": ["ルール: 攻+50%（幻獣）"]
       }
    ]
  },
  "トリニティブル": {
    QRid:'009',
    "party": [
      {	
        "name": "ウォーロックA",
        "style": "ラッシュ",
        "class": "スナイパー", 
        "gauge": 3,
        "trait": "なし",
        "tags": ["獣人"],
        "hp": 6702,
        "atk": 1564,
        "def": 436,
        "spd": 480,
        "skills": {
          "skill": "フリーズロッド:敵単体に攻撃力1.2倍のダメージ。さらに30%の確率で2ターンの間、敵を凍結状態にする",
          "awakened": "アイスシールド: 2ターンの間、味方単体の防御力を30%上昇させる",
          "ultimate": "アイシクルマジック: 敵全体に攻撃力0.8倍のダメージ。さらに30%の確率で2ターンの間、敵を凍結状態にする"
        },
      },
      null,
      {		
        "name": "トリニティブル",
        "style": "ラッシュ",
        "class": "ファイター", 
        "gauge": 3,
        "trait": "猪突猛進: 戦闘中、徐々に素早さが上昇する(最大値50%)",
        "tags": ["獣"],
        "hp": 17055,
        "atk": 1906,
        "def": 434,
        "spd": 489,
        "skills": {
          "skill": "トリニティアサルト: 敵単体に攻撃力0.8倍の3連続ダメージ",
          "awakened": "トリニティロア: 2ターンの間、自身のすべてのステータスを30%上昇する",
          "ultimate": "アサルトラッシュ: 敵単体に攻撃力0.7倍の6連続ダメージ"
        },
        "leader": true
      },
      null,
       {	
        "name": "ウォーロックA",
        "style": "ラッシュ",
        "class": "スナイパー", 
        "gauge": 3,
        "trait": "なし",
        "tags": ["獣人"],
        "hp": 6702,
        "atk": 1564,
        "def": 436,
        "spd": 480,
        "skills": {
          "skill": "フリーズロッド:敵単体に攻撃力1.2倍のダメージ。さらに30%の確率で2ターンの間、敵を凍結状態にする",
          "awakened": "アイスシールド: 2ターンの間、味方単体の防御力を30%上昇させる",
          "ultimate": "アイシクルマジック: 敵全体に攻撃力0.8倍のダメージ。さらに30%の確率で2ターンの間、敵を凍結状態にする"
        },
      }
    ],
    "locations": [
      {
        "floor": 3,
        "theme": "なし",
        "square_id": "f3-b1",
         "square_type": "battle",
         "rules": ["ルール: 早+50%（幻獣）"]
      },
      {
         "floor": 4,
         "theme": "なし",
         "square_id": "f4-b2",
          "square_type": "battle",
          "rules": ["ルール: 攻+50%（幻獣）"]
      }
    ]
  },
  "ドラゴニュート": { "QRid": "010",  "party": [null,null,null,null,null],"locations": [null]},
  "ゴウケツ": { "QRid": "011" ,  "party": [null,null,null,null,null],"locations": [null]},
  "クイックシルバー": { "QRid": "012" ,  "party": [null,null,null,null,null],"locations": [null]},
  "バラム": { "QRid": "013" ,  "party": [null,null,null,null,null],"locations": [null]},
  "アスモデウス": { "QRid": "014" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ディジースプー": { "QRid": "015" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ガガゼゼガ": { "QRid": "016" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ケツアルコアトル": { "QRid": "017" ,  "party": [null,null,null,null,null],"locations": [null]},
  "スカルワイバーン": { "QRid": "018" ,  "party": [null,null,null,null,null],"locations": [null]},
  "プロトアバドン": { "QRid": "019" ,  "party": [null,null,null,null,null],"locations": [null]},
  "黒い犬": { "QRid": "020" ,  "party": [null,null,null,null,null],"locations": [null]},
  "追放執行人": { "QRid": "021" ,  "party": [null,null,null,null,null],"locations": [null]},
  "魔眼賽ドゥーム": { "QRid": "022" ,  "party": [null,null,null,null,null],"locations": [null]},
  "氷龍帝オロチ": { "QRid": "023" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ミツクビ": { "QRid": "024" ,  "party": [null,null,null,null,null],"locations": [null]},
  "次元獣アナーケン": { "QRid": "025" ,  "party": [null,null,null,null,null],"locations": [null]},
  "大王吾妻": { "QRid": "026" ,  "party": [null,null,null,null,null],"locations": [null]},
  "カイル": { "QRid": "027" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ソウルクリエイト": { "QRid": "028" ,  "party": [null,null,null,null,null],"locations": [null]},
  "地龍アテルラナ": { "QRid": "029" ,  "party": [null,null,null,null,null],"locations": [null]},
  "魔業蟲": { "QRid": "030" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ソウルマローダー": { "QRid": "031" ,  "party": [null,null,null,null,null],"locations": [null]},
  "マグニファイ": { "QRid": "032" ,  "party": [null,null,null,null,null],"locations": [null]},
  "アドラメレク": { "QRid": "033" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ヤクトフレッサー": { "QRid": "034" ,  "party": [null,null,null,null,null],"locations": [null]},
  "愛玩幻獣アイニャ": { "QRid": "035" ,  "party": [null,null,null,null,null],"locations": [null]},
  "地龍帝スムドゥス": { "QRid": "036" ,  "party": [null,null,null,null,null],"locations": [null]},
  "サルガタナス": { "QRid": "037" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ウェパル": { "QRid": "038" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ベルフェゴール": { "QRid": "039" ,  "party": [null,null,null,null,null],"locations": [null]},
  "リヴァイアサン": { "QRid": "040" ,  "party": [null,null,null,null,null],"locations": [null]},
  "デメタス": { "QRid": "041" ,  "party": [null,null,null,null,null],"locations": [null]},
  "オーク哨戒部隊長": { "QRid": "042" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ウゴロモチ": { "QRid": "043" ,  "party": [null,null,null,null,null],"locations": [null]},
  "クロッキュ": { "QRid": "044" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ウィチセ": { "QRid": "045" ,  "party": [null,null,null,null,null],"locations": [null]},
  "死霊埋葬人": { "QRid": "046" ,  "party": [null,null,null,null,null],"locations": [null]},
  "次元獣イカロエン": { "QRid": "047",  "party": [null,null,null,null,null],"locations": [null] },
  "アビスハンター": { "QRid": "048" ,  "party": [null,null,null,null,null],"locations": [null]},
  "大樹ユグドラシル": { "QRid": "049" ,  "party": [null,null,null,null,null],"locations": [null]},
  "レイガンベレット": { "QRid": "050" ,  "party": [null,null,null,null,null],"locations": [null]},
  "アッキピテル": { "QRid": "051" ,  "party": [null,null,null,null,null],"locations": [null]},
  "成り損ない": { "QRid": "052" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ゴウギ": { "QRid": "053" ,  "party": [null,null,null,null,null],"locations": [null]},
  "魔喰機・無限": { "QRid": "054" ,  "party": [null,null,null,null,null],"locations": [null]},
  "セーバーグランド": { "QRid": "055" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ホルン": { "QRid": "056" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ブタゴラス": { "QRid": "057" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ドカグイ": { "QRid": "058" ,  "party": [null,null,null,null,null],"locations": [null]},
  "バルガリオ": { "QRid": "059" ,  "party": [null,null,null,null,null],"locations": [null]},
  "イコア": { "QRid": "060" ,  "party": [null,null,null,null,null],"locations": [null]},
  "朧の闇": { "QRid": "061" ,  "party": [null,null,null,null,null],"locations": [null]},
  "メイドゥーム": { "QRid": "062" ,  "party": [null,null,null,null,null],"locations": [null]},
  "雷獄華ケラヴノス": { "QRid": "063" ,  "party": [null,null,null,null,null],"locations": [null]},
  "変貌貝姫リリィ": { "QRid": "064" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ファロオース": { "QRid": "065" ,  "party": [null,null,null,null,null],"locations": [null]},
  "タイガンニール": { "QRid": "066" ,  "party": [null,null,null,null,null],"locations": [null]},
  "禁獄獣ネメアー": { "QRid": "067" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ベイグラント": { "QRid": "068" ,  "party": [null,null,null,null,null],"locations": [null]},
  "グリードベア": { "QRid": "069" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ドン・ザブンブン": { "QRid": "070" ,  "party": [null,null,null,null,null],"locations": [null]},
  "シナナイン": { "QRid": "071",  "party": [null,null,null,null,null],"locations": [null]},
  "ヌメローン": { "QRid": "072" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ケーダシン": { "QRid": "073",  "party": [null,null,null,null,null],"locations": [null] },
  "マセタン": { "QRid": "074" ,  "party": [null,null,null,null,null],"locations": [null]},
  "バリバリアン": { "QRid": "075" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ケチャ・ラジャ": { "QRid": "076" ,  "party": [null,null,null,null,null],"locations": [null]},
  "炎帝ムスペル": { "QRid": "077" ,  "party": [null,null,null,null,null],"locations": [null]},
  "恐幻蜘蛛": { "QRid": "078" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ネイザーウィッチ": { "QRid": "079" ,  "party": [null,null,null,null,null],"locations": [null]},
  "執行者ラミアン": { "QRid": "080" ,  "party": [null,null,null,null,null],"locations": [null]},
  "グランアビス": { "QRid": "081" ,  "party": [null,null,null,null,null],"locations": [null]},
  "グジグランズ": { "QRid": "082" ,  "party": [null,null,null,null,null],"locations": [null]},
  "守護竜ネイロード（ 31階 ）": { "QRid": "083" ,  "party": [null,null,null,null,null],"locations": [null]},
  "輝竜アシュトレト（ 31階 ）": { "QRid": "084" ,  "party": [null,null,null,null,null],"locations": [null]},
  "火のザウラク（ 31階 ）": { "QRid": "085" ,  "party": [null,null,null,null,null],"locations": [null]},
  "水のクルサ（ 31階 ）": { "QRid": "086" ,  "party": [null,null,null,null,null],"locations": [null]},
  "雷のアザー（ 31階 ）": { "QRid": "087" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ディヴァガル（ 31階 ）": { "QRid": "088" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ギガンテス（ 31階 ）": { "QRid": "089" ,  "party": [null,null,null,null,null],"locations": [null]},
  "水樹ガオケレナ（ 31階 ）": { "QRid": "090" ,  "party": [null,null,null,null,null],"locations": [null]},
  "死を育む者（ 31階 ）": { "QRid": "091" ,  "party": [null,null,null,null,null],"locations": [null]},
  "マモン": { "QRid": "092" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ディヴァガル": { "QRid": "093" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ギガンテス": { "QRid": "094" ,  "party": [null,null,null,null,null],"locations": [null]},
  "水樹ガオケレナ": { "QRid": "095" ,  "party": [null,null,null,null,null],"locations": [null]},
  "死を育む者": { "QRid": "096" ,  "party": [null,null,null,null,null],"locations": [null]},
  "アフロンタレング": { "QRid": "097" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ノラモデウス": { "QRid": "098" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ドラギナッツオ": { "QRid": "099" ,  "party": [null,null,null,null,null],"locations": [null]},
  "魂なき黒き半身": { "QRid": "100" ,  "party": [null,null,null,null,null],"locations": [null]},
  "アムドゥスキアス": { "QRid": "101" ,  "party": [null,null,null,null,null],"locations": [null]},
  "ロクス": { "QRid": "102" ,  "party": [null,null,null,null,null],"locations": [null]},
  "契りのドゥーエ": { "QRid": "103" ,  "party": [null,null,null,null,null],"locations": [null]},
};