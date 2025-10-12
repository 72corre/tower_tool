// =================================================================
// 0. 定数・設定
// =================================================================
const PRIORITY = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
const PRIORITY_ORDER = { [PRIORITY.HIGH]: 1, [PRIORITY.MEDIUM]: 2, [PRIORITY.LOW]: 3 };

// =================================================================
// 1. 対策・役割定義マップ
// =================================================================

// 敵のギミックへの直接的な対策（ジャマー向け）
const GIMMICK_COUNTER_MAP = {
    '状態異常-毒': [
        { category: '耐性', subCategory: '毒無効', reason: 'で「毒」を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', reason: 'で「毒」を含む状態異常を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', reason: 'で「毒」を含む状態異常を予防できます。', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-めまい': [
        { category: '耐性', subCategory: 'めまい無効', reason: 'で「めまい」を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', reason: 'で「めまい」を含む状態異常を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', reason: 'で「めまい」を含む状態異常を予防できます。', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-感電': [
        { category: '耐性', subCategory: '感電無効', reason: 'で「感電」を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', reason: 'で「感電」を含む状態異常を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', reason: 'で「感電」を含む状態異常を予防できます。', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-呪い': [
        { category: '耐性', subCategory: '呪い無効', reason: 'で「呪い」を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', reason: 'で「呪い」を含む状態異常を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', reason: 'で「呪い」を含む状態異常を予防できます。', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-即死': [
        { category: '耐性', subCategory: '即死無効', reason: 'で「即死」を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', reason: 'で「即死」を含む状態異常を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', reason: 'で「即死」を含む状態異常を予防できます。', priorityRule: { type: 'fixed', priority: 'medium' } },
        { category: '強化', subCategory: '自動蘇生', reason: 'で「即死」しても復帰可能です。', priorityRule: { type: 'fixed', priority: 'low' } },
    ],
    '防御-高防御': [
        { category: '攻撃手段', subCategory: '固定ダメージ', reason: 'で敵の防御力を無視してダメージを与えられます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '攻撃手段', subCategory: '防御無視', reason: 'で敵の高い防御力を無視できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '特殊状態', subCategory: '点穴', reason: 'の固定ダメージで防御力を無視できます。', priorityRule: { type: 'fixed', priority: 'medium' } },
        { category: '特殊状態', subCategory: '点穴付与', reason: 'の固定ダメージで防御力を無視できます。', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-毒': [
        { category: '耐性', subCategory: '毒無効', reason: 'で「毒」を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', reason: 'で「毒」を含む状態異常を無効化できます。', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', reason: 'で「毒」を含む状態異常を予防できます。', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    // ... 他のギミック対策
};

// 敵の弱点を突く攻撃手段（アタッカー向け）
const WEAKNESS_ATTACK_MAP = {
    '攻撃手段-死者特効': [{
        category: '攻撃手段', subCategory: '死者特効', reason: 'で大ダメージを与えられます。',
        priorityRule: {
            type: 'conditional',
            rules: [
                { operator: '>=', value: 100, priority: 'high' },
                { operator: '>=', value: 50, priority: 'medium' }
            ],
            defaultPriority: 'low'
        }
    }],
    '攻撃手段-獣人特効': [{
        category: '攻撃手段', subCategory: '獣人特効', reason: 'で大ダメージを与えられます。',
        priorityRule: {
            type: 'conditional',
            rules: [
                { operator: '>=', value: 100, priority: 'high' },
                { operator: '>=', value: 50, priority: 'medium' }
            ],
            defaultPriority: 'low'
        }
    }],
    '攻撃手段-植物特効': [{
        category: '攻撃手段', subCategory: '植物特効', reason: 'で大ダメージを与えられます。',
        priorityRule: {
            type: 'conditional',
            rules: [
                { operator: '>=', value: 100, priority: 'high' },
                { operator: '>=', value: 50, priority: 'medium' }
            ],
            defaultPriority: 'low'
        }
    }],
    '攻撃手段-防御無視': [{
        category: '攻撃手段', subCategory: '防御無視', reason: 'で敵の高防御力を無視してダメージを与えられます。',
        priorityRule: {
            type: 'conditional',
            rules: [
                { operator: '>=', value: 100, priority: 'high' },
                { operator: '>=', value: 50, priority: 'medium' }
            ],
            defaultPriority: 'low'
        }
    }],
    '攻撃手段-固定ダメージ': [{
        category: '攻撃手段', subCategory: '固定ダメージ', reason: 'で敵の高防御力を無視して固定のダメージを与えられます。',
        priorityRule: {
            type: 'conditional',
            rules: [
                { operator: '>=', value: 100, priority: 'high' },
                { operator: '>=', value: 50, priority: 'medium' }
            ],
            defaultPriority: 'low'
        }
    }],
    '特殊状態-エレキ': [{
        category: '特殊状態', subCategory: 'エレキ', reason: 'で敵の高防御力を無視して固定のダメージを与えられます。',
        priorityRule: {
            type: 'conditional',
            rules: [
                { operator: '>=', value: 100, priority: 'high' },
                { operator: '>=', value: 50, priority: 'medium' }
            ],
            defaultPriority: 'low'
        }
    }],
    '耐性-火に弱い': [{ category: '攻撃手段', subCategory: '火ダメージ', reason: 'の火ダメージで弱点を突けます。', priorityRule: { type: 'fixed', priority: 'high' } }],
    '耐性-雷に弱い': [{ category: '攻撃手段', subCategory: '雷ダメージ', reason: 'の雷ダメージで弱点を突けます。', priorityRule: { type: 'fixed', priority: 'high' } }],
    // ... 他の弱点と攻撃手段
};

// サポーターの役割を定義するタグ
const SUPPORTER_ROLE_TAGS = [
    'HP回復', '蘇生', '状態異常治癒', '弱体解除', // 回復系
    'かばう', '執心', // タンク系
    'ダメージ軽減', '回数バリア', 'アタックバリア', 'スキルバリア', '無敵', // 防御強化系
    '攻撃力上昇', 'アタック強化', 'スキル強化', 'チャージ強化', // 攻撃強化系
    'フォトン追加', '覚醒ゲージ増加', // リソース支援系
];

// 特定の敵ギミックに応じてサポーターの優先度を調整するマップ
const SUPPORT_PRIORITY_MAP = {
    'ギミック-かばう無効': [
        { category: '補助', subCategory: '執心', adjustment: PRIORITY.HIGH, reason: '「かばう」が無効なため、「執心」によるターゲット変更が有効です。' },
        { category: '強化', subCategory: 'かばう', adjustment: 'ignore', reason: '「かばう」が無効化されます。' }
    ],
    'ギミック-高火力スキル': [ // ※敵側に { type: '高火力スキル' } のようなタグが必要
        { category: '強化', subCategory: 'スキルダメージ軽減', adjustment: PRIORITY.HIGH, reason: '敵の高火力スキルダメージを軽減できます。' },
        { category: '強化', subCategory: 'スキルバリア', adjustment: PRIORITY.HIGH, reason: '敵のスキル攻撃を無効化できます。' }
    ],
    // ... 他の優先度調整ルール
};


// =================================================================
// 2. ヘルパー関数
// =================================================================

/**
 * 優先度ルールとタグのcondition値に基づいて優先度を評価する
 * @param {object} priorityRule - 優先度決定ルールのオブジェクト
 * @param {string | number} condition - タグのcondition値
 * @returns {string} 'high', 'medium', 'low' のいずれか
 */
const evaluatePriority = (priorityRule, condition) => {
    if (!priorityRule) return PRIORITY.LOW;

    if (priorityRule.type === 'fixed') {
        return priorityRule.priority;
    }

    if (priorityRule.type === 'conditional') {
        const conditionValue = parseInt(condition, 10);
        if (isNaN(conditionValue)) {
            return priorityRule.defaultPriority;
        }

        for (const rule of priorityRule.rules) {
            switch (rule.operator) {
                case '>=': if (conditionValue >= rule.value) return rule.priority; break;
                case '<=': if (conditionValue <= rule.value) return rule.priority; break;
                case '>': if (conditionValue > rule.value) return rule.priority; break;
                case '<': if (conditionValue < rule.value) return rule.priority; break;
                case '==': if (conditionValue == rule.value) return rule.priority; break;
            }
        }
        return priorityRule.defaultPriority;
    }

    return PRIORITY.LOW; // 不明なルールタイプ
};

/**
 * 推奨リストにユニークな推奨情報を追加/更新する
 * @param {Array} list - 追加対象のリスト (e.g., recommendations.attackers)
 * @param {object} newItem - 追加する新しい推奨情報
 */
const addOrUpdateRecommendation = (list, newItem) => {
    const uniqueKey = newItem.orb ? `${newItem.megido.id}-${newItem.orb.id}` : newItem.megido.id;
    const existingIndex = list.findIndex(item => (item.orb ? `${item.megido.id}-${item.orb.id}` : item.megido.id) === uniqueKey);

    if (existingIndex === -1) {
        list.push(newItem);
    } else {
        if (PRIORITY_ORDER[newItem.priority] < PRIORITY_ORDER[list[existingIndex].priority]) {
            list[existingIndex] = newItem;
        }
    }
};


// =================================================================
// 3. メインロジック
// =================================================================

const findRecommendedMegido = ({ enemy, ownedMegido, allMegidoMaster, ownedOrbs = new Set(), allOrbsMaster = [] }) => {
    if (!enemy || !enemy.tags) return { success: false, reason: 'NO_ENEMY_DATA' };

    const { gimmicks = [], weaknesses = [] } = enemy.tags;
    const ownedMegidoDetails = allMegidoMaster.filter(m => ownedMegido.has(m.id));
    const ownedOrbDetails = allOrbsMaster.filter(o => ownedOrbs.has(o.id));

    const recommendations = {
        attackers: [],
        jammers: [],
        supporters: [],
    };

    // --- 1. アタッカー & ジャマーの推奨 ---
    const findAttackersAndJammers = () => {
        const enemyTags = [
            ...weaknesses.map(t => ({ ...t, type: 'weakness' })),
            ...gimmicks.map(t => ({ ...t, type: 'gimmick' }))
        ];

        for (const tag of enemyTags) {
            const map = tag.type === 'weakness' ? WEAKNESS_ATTACK_MAP : GIMMICK_COUNTER_MAP;
            const key = `${tag.category}-${tag.subCategory}`;
            const effectiveCounters = map[key];
            if (!effectiveCounters) continue;

            for (const counter of effectiveCounters) {
                // 所持メギドのチェック
                for (const megido of ownedMegidoDetails) {
                    const foundTag = megido.tags?.find(t => t.category === counter.category && t.subCategory === counter.subCategory);
                    if (foundTag) {
                        const priority = evaluatePriority(counter.priorityRule, foundTag.condition);
                        const reason = `【${foundTag.method}】${counter.reason}`;
                        const list = tag.type === 'weakness' ? recommendations.attackers : recommendations.jammers;
                        addOrUpdateRecommendation(list, { megido, reason, priority, role: tag.type });
                    }
                }
                // 所持オーブのチェック
                for (const orb of ownedOrbDetails) {
                    const foundTag = orb.tags?.find(t => t.category === counter.category && t.subCategory === counter.subCategory);
                    if (foundTag) {
                        const equippableMegido = ownedMegidoDetails.filter(m => m.style === orb.conditions);
                        for (const megido of equippableMegido) {
                            let priority = evaluatePriority(counter.priorityRule, foundTag.condition);
                            let reason = `【${orb.name}の${foundTag.method}】${counter.reason}`;
                            const list = tag.type === 'weakness' ? recommendations.attackers : recommendations.jammers;

                            if (orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                                priority = PRIORITY.LOW;
                                reason += ' (※入手難易度が高いオーブです)';
                            }

                            addOrUpdateRecommendation(list, { megido, orb, reason, priority, role: tag.type });
                        }
                    }
                }
            }
        }
    };

    // --- 2. サポーターの推奨 ---
    const findSupporters = () => {
        // 2-1. 候補のリストアップ
        for (const megido of ownedMegidoDetails) {
            const foundTag = megido.tags?.find(t => SUPPORTER_ROLE_TAGS.includes(t.subCategory));
            if (foundTag) {
                const reason = `【${foundTag.method}】で「${foundTag.subCategory}」の支援ができます。`;
                addOrUpdateRecommendation(recommendations.supporters, { megido, reason, priority: PRIORITY.LOW, role: 'supporter' });
            }
        }
        for (const orb of ownedOrbDetails) {
            const foundTag = orb.tags?.find(t => SUPPORTER_ROLE_TAGS.includes(t.subCategory));
            if (foundTag) {
                const equippableMegido = ownedMegidoDetails.filter(m => m.style === orb.conditions);
                for (const megido of equippableMegido) {
                    let priority = PRIORITY.LOW;
                    let reason = `【${orb.name}の${foundTag.method}】で「${foundTag.subCategory}」の支援ができます。`;

                    if (orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                        priority = PRIORITY.LOW;
                        reason += ' (※入手難易度が高いオーブです)';
                    }

                    addOrUpdateRecommendation(recommendations.supporters, { megido, orb, reason, priority, role: 'supporter' });
                }
            }
        }

        // 2-2. 敵ギミックに応じた優先度調整
        for (const gimmick of gimmicks) {
            const key = `ギミック-${gimmick.subCategory}`;
            const priorityRules = SUPPORT_PRIORITY_MAP[key];
            if (!priorityRules) continue;

            for (const rule of priorityRules) {
                const updatedList = [];
                for (const supporter of recommendations.supporters) {
                    const target = supporter.orb || supporter.megido;
                    const foundTag = target.tags?.find(t => t.category === rule.category && t.subCategory === rule.subCategory);

                    if (foundTag) {
                        if (rule.adjustment === 'ignore') {
                            continue; 
                        }
                        supporter.priority = rule.adjustment;
                        supporter.reason = `【${foundTag.method}】${rule.reason}`;
                    }
                    updatedList.push(supporter);
                }
                recommendations.supporters = updatedList;
            }
        }
    };

    findAttackersAndJammers();
    findSupporters();

    // --- 4. 最終結果の整形 ---
    const finalRecommendations = {
        attackers: recommendations.attackers.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
        jammers: recommendations.jammers.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
        supporters: recommendations.supporters.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    };

    const totalRecommendations = finalRecommendations.attackers.length + finalRecommendations.jammers.length + finalRecommendations.supporters.length;
    if (totalRecommendations === 0) {
        return { success: false, reason: 'NO_RECOMMENDED_MEGIDO_FOUND' };
    }

    return { success: true, recommendations: finalRecommendations };
};