// =================================================================
// 0. 定数・設定
// =================================================================
const PRIORITY = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
const PRIORITY_ORDER = { [PRIORITY.HIGH]: 1, [PRIORITY.MEDIUM]: 2, [PRIORITY.LOW]: 3 };
const STATUS_AILMENT_DISPLAY_ORDER = { '即死': 1, 'めまい': 2, '呪い': 3 };

// =================================================================
// 1. 対策・役割定義マップ
// =================================================================

// 敵のギミックへの直接的な対策（ジャマー向け）
const GIMMICKS_COUNTER_MAP = {
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
    ]
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

const findRecommendedMegido = ({ enemy, floorRules = [], ownedMegido, allMegidoMaster, ownedOrbs = new Set(), allOrbsMaster = [] }) => {
    if (!enemy || !enemy.tags) return { success: false, reason: 'NO_ENEMY_DATA' };

    const rawGimmicks = enemy.tags.gimmicks;
    const gimmicks = Array.isArray(rawGimmicks) ? rawGimmicks : (rawGimmicks && typeof rawGimmicks === 'object' ? [rawGimmicks] : []);
    const rawWeaknesses = enemy.tags.weaknesses;
    const weaknesses = Array.isArray(rawWeaknesses) ? rawWeaknesses : (rawWeaknesses && typeof rawWeaknesses === 'object' ? [rawWeaknesses] : []);

    const ownedMegidoDetails = allMegidoMaster.filter(m => ownedMegido.has(m.id));
    const ownedOrbDetails = allOrbsMaster.filter(o => ownedOrbs.has(o.id));

    const recommendations = {
        attackers: [],
        jammers: [],
        supporters: [],
    };

    // --- 戦術分析ロジック ---
    const findStrategies = () => {
        if (typeof ENEMY_ALL_DATA === 'undefined') return;
        const enemyData = ENEMY_ALL_DATA[enemy.name];
        if (!enemyData || !enemyData.party) return;

        // --- HPとトリガーの計算 ---
        let totalHP = enemyData.party.reduce((sum, unit) => sum + (unit ? unit.hp : 0), 0);
        let finalHP = totalHP;
        const hpRule = floorRules.find(rule => rule.includes('HP+'));
        if (hpRule) {
            try {
                const percentage = parseInt(hpRule.match(/(\d+)/)[0]);
                finalHP *= (1 + percentage / 100);
            } catch (e) { /* HPルールのパース失敗 */ }
        }
        finalHP = Math.ceil(finalHP);

        const triggerTags = ['防御-高防御', '防御-ダメージ軽減', '回復-HP回復'];
        const hasTriggerTag = gimmicks.some(g => triggerTags.includes(`${g.category}-${g.subCategory}`));

        // --- エレキ戦術 ---
        if (hasTriggerTag && finalHP <= 70000) {
            const elekiReleaser = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === 'エレキ'));
            if (elekiReleaser) {
                const requiredLevel = Math.ceil(finalHP / 1400);
                const reason = `【エレキ戦術】 防御を無視するエレキダメージが有効です。\n*   **目標エレキレベル:** **${requiredLevel}** （敵HP ${finalHP} ÷ 1400）\n*   **役割:** エレキの付与と解除\n*補足: 雷ダメージを持つメギドと連携してレベルを上昇させてください。`;
                addOrUpdateRecommendation(recommendations.attackers, { megido: elekiReleaser, reason, priority: PRIORITY.HIGH, role: 'attacker' });
            }
        }

        // --- 点穴戦術 ---
        if (hasTriggerTag) {
            const requiredStandardLevel = Math.ceil(Math.sqrt(finalHP / 2));
            const isStandardViable = requiredStandardLevel <= 100;

            const belial = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === '固定砲台'));
            const belialMaxDamage = 130000; // Lv120 cap
            const isBelialViable = belial && finalHP <= belialMaxDamage;

            if (isStandardViable) {
                const accumulator = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === '点穴付与'));
                if (accumulator) {
                    const maxDamage = Math.floor(2 * (requiredStandardLevel * requiredStandardLevel));
                    const reason = `【点穴戦術】 防御を無視する点穴ダメージが有効です。\n*   **目標点穴レベル:** **${requiredStandardLevel}** （敵HP ${finalHP} をワンパンするために必要）\n*   **最大ダメージ:** 約${maxDamage.toLocaleString()}\n*   **役割:** 点穴レベルの付与\n*補足: レベルを溜めた後、単発・単体攻撃を持つメギドで攻撃してください。`;
                    addOrUpdateRecommendation(recommendations.attackers, { megido: accumulator, reason, priority: PRIORITY.HIGH, role: 'attacker' });
                }
                        } else if (isBelialViable) {
                            const reason = `【点穴戦術 - 固定砲台】 敵HPが高いため、ベリアルの固定砲台による連続攻撃が有効です。\n*   **最大総ダメージ:** 約${belialMaxDamage.toLocaleString()}（Lv120から連射時）\n*   **役割:** 点穴の蓄積と、固定砲台による連続攻撃\n*補足: 点穴レベルを最大まで溜めてから「固定砲台」を使用してください。`;
                            addOrUpdateRecommendation(recommendations.attackers, { megido: belial, reason, priority: PRIORITY.HIGH, role: 'attacker' });
                        }
                    }
            
                    // --- ハイドロボム戦術 ---
                    const hBombForger = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === 'ハイドロボム錬'));
                    if (finalDef >= 1000 && hBombForger) {
                        const forgerLevel = 70; // Assume Lv70 for calculation
                        const calcForgedDamage = (bombMult, forgeBonusCount, totalBlasts, def) => {
                            const base = 100 + forgerLevel * 15;
                            const forgeBonus = (bombMult * 193) * forgeBonusCount; // Simplified formula based on user notes
                            const blastBonus = 1 + Math.max(0, totalBlasts - 1) * 0.1;
                            return Math.floor(((base * bombMult) + forgeBonus - def) * blastBonus);
                        };
            
                        // Scenarios based on a 6x bomb being the material
                        const s1Dmg = calcForgedDamage(12, 2, 2, finalDef); // 2x 6-bombs forged
                        const s2Dmg = calcForgedDamage(18, 3, 2, finalDef); // 3x 6-bombs forged
                        const s3Dmg = calcForgedDamage(18, 3, 6, finalDef); // 3x 6-bombs + 4 other bombs
            
                        if (s1Dmg > finalHP || s2Dmg > finalHP || s3Dmg > finalHP) {
                             const reason = `【Hボム錬戦術】 敵の防御力が高いため、Hボムを**錬成**して大ダメージを狙う戦術が有効です。\n*   **役割:** Hボムの錬成と付与\n*   **ダメージ目安** (敵防御 ${finalDef}):\n    *   **12倍** 錬ボム + 起爆1個 (計2): 約 **${s1Dmg.toLocaleString()}** ダメージ\n    *   **18倍** 錬ボム + 起爆1個 (計2): 約 **${s2Dmg.toLocaleString()}** ダメージ\n    *   **18倍** 錬ボム + 他4個 (計6個): 約 **${s3Dmg.toLocaleString()}** ダメージ`;
                            addOrUpdateRecommendation(recommendations.attackers, { megido: hBombForger, reason, priority: PRIORITY.HIGH, role: 'attacker' });
                            return; // Prioritize Forged Bombs
                        }
                    }
                    
                    const hBombHeavyApplier = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === 'ハイドロボム重'));
                    if (hBombHeavyApplier) {
                        const calcStandardDamage = (level, bombMult, blastCount, def) => {
                            const base = 100 + level * 15;
                            const blastBonus = 1 + Math.max(0, blastCount - 1) * 0.1;
                            return Math.floor(((base * bombMult) - def) * blastBonus);
                        };
                        const damage = calcStandardDamage(70, 6, 2, finalDef); // 2x 6x bombs
                        if (damage > 0 && damage * 2 > finalHP * 0.5) { // Recommend if it can do meaningful damage
                            const reason = `【ハイドロボム戦術】 Hボムによるダメージが有効です。\n*   **役割:** Hボム重の付与\n*   **連携:** 複数のボムを付与して**同時爆破ボーナス**を狙ってください。\n*   **予想ダメージ:** Hボム重(6倍)x2を同時爆破で 約 **${(damage * 2).toLocaleString()}** ダメージ`;
                            addOrUpdateRecommendation(recommendations.attackers, { megido: hBombHeavyApplier, reason, priority: PRIORITY.MEDIUM, role: 'attacker' });
                        }
                    }
                };

    // --- 1. アタッカー & ジャマーの推奨 ---
    const findAttackersAndJammers = () => {
        const jammersMap = new Map();
        const enemyTags = [
            ...weaknesses.map(t => ({ ...t, type: 'weakness' })),
            ...gimmicks.map(t => ({ ...t, type: 'gimmick' }))
        ];

        for (const tag of enemyTags) {
            const map = tag.type === 'weakness' ? WEAKNESS_ATTACK_MAP : GIMMICKS_COUNTER_MAP;
            const key = `${tag.category}-${tag.subCategory}`;
            const effectiveCounters = map[key];
            if (!effectiveCounters) continue;

            for (const counter of effectiveCounters) {
                // 所持メギドのチェック
                for (const megido of ownedMegidoDetails) {
                    const foundTag = megido.tags?.find(t => t.category === counter.category && t.subCategory === counter.subCategory);
                    if (foundTag) {
                        const priority = evaluatePriority(counter.priorityRule, foundTag.condition);
                        if (tag.type === 'weakness') {
                            const reason = `【${foundTag.method}】${counter.reason}`;
                            addOrUpdateRecommendation(recommendations.attackers, { megido, reason, priority, role: tag.type });
                        } else { // Jammer
                            const jammerKey = megido.id;
                            let entry = jammersMap.get(jammerKey);
                            if (!entry) {
                                entry = { megido, key: jammerKey, methods: new Set(), counteredGimmicks: new Map(), highestPriority: PRIORITY.LOW };
                            }
                            entry.methods.add(foundTag.method);
                            entry.counteredGimmicks.set(tag.subCategory, counter.reason);
                            if (PRIORITY_ORDER[priority] < PRIORITY_ORDER[entry.highestPriority]) {
                                entry.highestPriority = priority;
                            }
                            jammersMap.set(jammerKey, entry);
                        }
                    }
                }
                // 所持オーブのチェック
                for (const orb of ownedOrbDetails) {
                    const foundTag = orb.tags?.find(t => t.category === counter.category && t.subCategory === counter.subCategory);
                    if (foundTag) {
                        const equippableMegido = ownedMegidoDetails.filter(m => m.style === orb.conditions);
                        for (const megido of equippableMegido) {
                            let priority = evaluatePriority(counter.priorityRule, foundTag.condition);
                            if (tag.type === 'weakness') {
                                let reason = `【${orb.name}の${foundTag.method}】${counter.reason}`;
                                if (orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                                    priority = PRIORITY.LOW;
                                    reason += ' (※入手難易度が高いオーブです)';
                                }
                                addOrUpdateRecommendation(recommendations.attackers, { megido, orb, reason, priority, role: tag.type });
                            } else { // Jammer
                                const jammerKey = `${megido.id}-${orb.id}`;
                                let entry = jammersMap.get(jammerKey);
                                if (!entry) {
                                    entry = { megido, orb, key: jammerKey, methods: new Set(), counteredGimmicks: new Map(), highestPriority: PRIORITY.LOW };
                                }
                                let methodText = `${orb.name}の${foundTag.method}`;
                                if (orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                                    priority = PRIORITY.LOW;
                                }
                                entry.methods.add(methodText);
                                entry.counteredGimmicks.set(tag.subCategory, counter.reason);
                                if (PRIORITY_ORDER[priority] < PRIORITY_ORDER[entry.highestPriority]) {
                                    entry.highestPriority = priority;
                                }
                                jammersMap.set(jammerKey, entry);
                            }
                        }
                    }
                }
            }
        }
        
        const finalJammers = Array.from(jammersMap.values());
        finalJammers.forEach(jammer => {
            const methodStr = Array.from(jammer.methods).join('、');
            let reason = '';

            if (jammer.counteredGimmicks.size > 1) {
                const sortedGimmickNames = Array.from(jammer.counteredGimmicks.keys()).sort((a, b) => (STATUS_AILMENT_DISPLAY_ORDER[a] || 99) - (STATUS_AILMENT_DISPLAY_ORDER[b] || 99));
                const gimmickStr = '「' + sortedGimmickNames.join('」「') + '」';
                reason = `【${methodStr}】で${gimmickStr}をまとめて対策できます。`;
            } else if (jammer.counteredGimmicks.size === 1) {
                const originalReason = Array.from(jammer.counteredGimmicks.values())[0];
                reason = `【${methodStr}】${originalReason}`;
            }

            if (jammer.orb && jammer.orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                reason += ' (※入手難易度が高いオーブです)';
            }

            jammer.reason = reason;
            jammer.priority = jammer.highestPriority;
            jammer.role = 'jammer';
        });
        recommendations.jammers = finalJammers;
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

    findStrategies();
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