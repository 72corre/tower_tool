// =================================================================
// 1. 対策マップを定義（ロジックの外で管理するとメンテナンスしやすい）
// =================================================================
const counterMap = {
    // 敵のギミック (category と type でキーを作成)
    '状態異常-即死': [
        // このギミックに有効な対策を優先度順に定義
        { category: '耐性', subCategory: '即死', priority: 'high', reason: 'で「即死」を直接無効化できます。' },
        { category: '耐性', subCategory: '全状態異常耐性', priority: 'high', reason: 'で「即死」を含む状態異常を無効化できます。' },
        { category: '強化', subCategory: '状態異常無効', priority: 'medium', reason: 'で「即死」を含む状態異常を予防できます。' },
        { category: '強化', subCategory: '自動蘇生', priority: 'low', reason: 'で「即死」した後に「自動創生」可能ですが、タイミングがシビアです。' },
    ],
    '防御-高防御': [
        { category: 'ダメージ', subCategory: '固定', priority: 'high', reason: 'で敵の防御力を無視してダメージを与えられます。' },
        { category: 'ダメージ', subCategory: '防御無視', priority: 'high', reason: 'で敵の高い防御力を無視できます。' }
    ],
    // ... 他のギミックと対策をここに追加
};


const findRecommendedMegido = ({ enemy, ownedMegido, allMegidoMaster }) => {
    if (!enemy || !enemy.tags) {
        return { success: false, reason: 'NO_ENEMY_TAGS' };
    }

    const { gimmicks = [], weaknesses = [] } = enemy.tags;
    const recommended = {
        attackers: [],
        jammers: [], // jammerはgimmick対策として統合するなど役割を再定義
        supporters: [],
    };

    const ownedMegidoDetails = allMegidoMaster.filter(m => ownedMegido.has(m.id));

    // =================================================================
    // 2. 新しいロジック
    // =================================================================

    // 敵のギミックごとに対策メギドを探す
    for (const gimmick of gimmicks) {
        const gimmickKey = `${gimmick.category}-${gimmick.type}`;
        const effectiveCounters = counterMap[gimmickKey];

        if (!effectiveCounters) continue; // 対策マップに定義がないギミックはスキップ

        // 所持メギドが有効な対策を持っているかチェック
        for (const megido of ownedMegidoDetails) {
            if (!megido.tags) continue;

            for (const counter of effectiveCounters) {
                // メギドが持つタグの中に、有効な対策と合致するものがあるか探す
                const foundTag = megido.tags.find(tag => 
                    tag.category === counter.category && 
                    tag.subCategory === counter.subCategory
                );

                if (foundTag) {
                    recommended.jammers.push({
                        megido,
                        reason: `ギミック「${gimmick.type}」を${foundTag.method}${counter.reason}`,
                        priority: counter.priority, // 対策マップから優先度を設定
                        methods: [foundTag.method]   // メギドのタグから対策手段を設定
                    });
                    // 一つのメギドが同じギミックに複数の対策を持つ場合もあるが、
                    // ここでは最初に見つかった一番優先度の高い対策を推奨する
                    break; 
                }
            }
        }
    }

    // (弱点やサポーターのロジックも同様に構造化して実装)
    
    // 重複を削除しつつ、最も優先度の高い理由を採用する
    const uniqueMegido = new Map();
    [...recommended.attackers, ...recommended.jammers, ...recommended.supporters].forEach(item => {
        if (!uniqueMegido.has(item.megido.id)) {
            uniqueMegido.set(item.megido.id, item);
        } else {
            // 既に登録されているメギドより優先度が高ければ上書きする (high:1 < low:3)
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            if (priorityOrder[item.priority] < priorityOrder[uniqueMegido.get(item.megido.id).priority]) {
                uniqueMegido.set(item.megido.id, item);
            }
        }
    });

    // 役割ごとに再分配（ここでは仮に全てjammersに入れる）
    const finalRecommendations = {
        attackers: [],
        jammers: Array.from(uniqueMegido.values()),
        supporters: []
    }


    if (finalRecommendations.jammers.length === 0) { // 判定を簡略化
        return { success: false, reason: 'NO_RECOMMENDED_MEGIDO_FOUND' };
    }

    return { success: true, recommendations: finalRecommendations };
};