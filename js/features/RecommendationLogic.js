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
};

const WEAKNESS_ATTACK_MAP = {
    '攻撃手段-死者特効': [{ category: '攻撃手段', subCategory: '死者特効', reason: 'で大ダメージを与えられます。', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '攻撃手段-獣人特効': [{ category: '攻撃手段', subCategory: '獣人特効', reason: 'で大ダメージを与えられます。', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '攻撃手段-植物特効': [{ category: '攻撃手段', subCategory: '植物特効', reason: 'で大ダメージを与えられます。', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '攻撃手段-防御無視': [{ category: '攻撃手段', subCategory: '防御無視', reason: 'で敵の高防御力を無視してダメージを与えられます。', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '攻撃手段-固定ダメージ': [{ category: '攻撃手段', subCategory: '固定ダメージ', reason: 'で敵の高防御力を無視して固定のダメージを与えられます。', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '特殊状態-点穴': [{ category: '特殊状態', subCategory: '点穴', reason: 'の固定ダメージで防御力を無視できます。', priorityRule: { type: 'fixed', priority: 'high' } }],
    '特殊状態-点穴付与': [{ category: '特殊状態', subCategory: '点穴付与', reason: 'で点穴を溜め、防御力を無視した攻撃が可能です。', priorityRule: { type: 'fixed', priority: 'high' } }],
    '特殊状態-点穴': [{ category: '特殊状態', subCategory: '点穴', reason: 'の固定ダメージで防御力を無視できます。', priorityRule: { type: 'fixed', priority: 'high' } }],
    '特殊状態-点穴付与': [{ category: '特殊状態', subCategory: '点穴付与', reason: 'で点穴を溜め、防御力を無視した攻撃が可能です。', priorityRule: { type: 'fixed', priority: 'high' } }],
    '特殊状態-エレキ': [{ category: '特殊状態', subCategory: 'エレキ', reason: 'で敵の高防御力を無視して固定のダメージを与えられます。', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '耐性-火に弱い': [{ category: '攻撃手段', subCategory: '火ダメージ', reason: 'の火ダメージで弱点を突けます。', priorityRule: { type: 'fixed', priority: 'high' } }],
    '耐性-雷に弱い': [{ category: '攻撃手段', subCategory: '雷ダメージ', reason: 'の雷ダメージで弱点を突けます。', priorityRule: { type: 'fixed', priority: 'high' } }],
};

const THREAT_SUPPORT_MAP = {
    'ギミック-高火力スキル': [
        { category: '強化', subCategory: 'スキルダメージ軽減', reason: 'で敵の高火力スキルから味方を守ります。', priority: PRIORITY.HIGH },
        { category: '強化', subCategory: 'スキルバリア', reason: 'で敵のスキル攻撃を無効化できます。', priority: PRIORITY.HIGH },
        { category: '補助', subCategory: 'かばう', reason: 'で単体高火力スキルから味方を守ります。', priority: PRIORITY.MEDIUM }
    ],
    'ギミック-高火力奥義': [
        { category: '強化', subCategory: 'ダメージ軽減', reason: 'で敵の高火力な奥義から味方を守ります。', priority: PRIORITY.HIGH },
        { category: '強化', subCategory: '無敵', reason: 'で敵の強力な奥義を完全に防ぎます。', priority: PRIORITY.HIGH },
        { category: '補助', subCategory: 'かばう', reason: 'で単体高火力奥義から味方を守ります。', priority: PRIORITY.MEDIUM }
    ],
    'ギミック-全体攻撃': [
        { category: '補助', subCategory: 'HP回復', reason: 'で全体攻撃を受けた後のHPを回復します。', priority: PRIORITY.MEDIUM },
        { category: '強化', subCategory: 'ダメージ軽減', reason: 'で全体攻撃の被ダメージを抑えます。', priority: PRIORITY.MEDIUM },
        { category: '強化', subCategory: '回数バリア', reason: 'で複数回ヒットする全体攻撃を軽減します。', priority: PRIORITY.MEDIUM },
    ],
    'ギミック-連続攻撃': [
        { category: '強化', subCategory: '回数バリア', reason: 'で敵の連続攻撃を無効化します。', priority: PRIORITY.HIGH },
        { category: '補助', subCategory: 'かばう', reason: 'で連続攻撃からアタッカーを守ります。', priority: PRIORITY.HIGH },
    ],
    'ギミック-かばう無効': [
        { category: '補助', subCategory: '執心', reason: 'で「かばう」が効かない敵の攻撃を自身に引きつけます。', priority: PRIORITY.HIGH },
    ],
    '状態異常-毒': [{ category: '補助', subCategory: '状態異常治癒', reason: 'で味方の毒を治療できます。', priority: PRIORITY.MEDIUM }],
    '状態異常-めまい': [{ category: '補助', subCategory: '状態異常治癒', reason: 'で味方のめまいを治療できます。', priority: PRIORITY.MEDIUM }],
    '状態異常-感電': [{ category: '補助', subCategory: '状態異常治癒', reason: 'で味方の感電を治療できます。', priority: PRIORITY.MEDIUM }],
    '状態異常-呪い': [{ category: '補助', subCategory: '状態異常治癒', reason: 'で味方の呪いを治療できます。', priority: PRIORITY.HIGH }],
    '状態異常-即死': [{ category: '補助', subCategory: '蘇生', reason: 'で即死した味方を復活させます。', priority: PRIORITY.HIGH }],
    '弱体-攻撃力低下': [{ category: '補助', subCategory: '弱体解除', reason: 'で味方にかかった攻撃力低下を解除できます。', priority: PRIORITY.MEDIUM }],
    '弱体-防御力低下': [{ category: '補助', subCategory: '弱体解除', reason: 'で味方にかかった防御力低下を解除できます。', priority: PRIORITY.MEDIUM }],
    '弱体-素早さ低下': [{ category: '補助', subCategory: '弱体解除', reason: 'で味方にかかった素早さ低下を解除できます。', priority: PRIORITY.MEDIUM }],
};

const evaluatePriority = (priorityRule, condition) => {
    if (!priorityRule) return PRIORITY.LOW;
    if (priorityRule.type === 'fixed') return priorityRule.priority;
    if (priorityRule.type === 'conditional') {
        const conditionValue = parseInt(condition, 10);
        if (isNaN(conditionValue)) return priorityRule.defaultPriority;
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
    return PRIORITY.LOW;
};

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

const findRecommendedMegido = ({ enemy, floorRules = [], ownedMegido, allMegidoMaster, ownedOrbs = new Set(), allOrbsMaster = [], megidoConditions = {} }) => {
    console.log('[DEBUG] findRecommendedMegido started. enemy.tags:', JSON.stringify(enemy.tags, null, 2));
    if (!enemy || !enemy.tags) return { success: false, reason: 'NO_ENEMY_DATA' };

    const activeOwnedMegido = new Set(Array.from(ownedMegido).filter(id => megidoConditions[id] !== '気絶'));
    if (activeOwnedMegido.size === 0) return { success: false, reason: 'NO_RECOMMENDED_MEGIDO_FOUND' };

    const ownedMegidoDetails = allMegidoMaster.filter(m => activeOwnedMegido.has(m.id));
    const ownedOrbDetails = allOrbsMaster.filter(o => ownedOrbs.has(o.id));

    const recommendations = {
        attackers: [],
        jammers: [],
        supporters: [],
    };

    const addOrUpdateRecommendation = (list, newItem) => {
        const condition = megidoConditions[newItem.megido.id] || '普通';
        let { priority, reason } = { ...newItem };

        switch (condition) {
            case '不調':
                priority = (priority === PRIORITY.HIGH) ? PRIORITY.MEDIUM : PRIORITY.LOW;
                reason += ' <strong class="condition-warning">【不調】能力が低下しているため、本来の性能を発揮できない可能性があります。</strong>';
                break;
            case '絶不調':
                priority = PRIORITY.LOW;
                reason += ' <strong class="condition-warning">【絶不調】能力が大幅に低下しており、推奨度は低いですが、他に選択肢がない場合に。</strong>';
                break;
            case '好調':
            case '絶好調':
                if (newItem.role === 'attacker') {
                    reason += ' <span class="condition-info">【好調以上】攻撃力+25%の恩恵を受けられます。</span>';
                }
                break;
        }

        const updatedItem = { ...newItem, priority, reason };
        const uniqueKey = updatedItem.orb ? `${updatedItem.megido.id}-${updatedItem.orb.id}` : updatedItem.megido.id;
        const existingIndex = list.findIndex(item => (item.orb ? `${item.megido.id}-${item.orb.id}` : item.megido.id) === uniqueKey);

        if (existingIndex === -1) {
            list.push(updatedItem);
        } else {
            if (PRIORITY_ORDER[updatedItem.priority] < PRIORITY_ORDER[list[existingIndex].priority]) {
                list[existingIndex] = updatedItem;
            }
        }
    };

    const rawGimmicks = enemy.tags.gimmicks;
    const gimmicks = Array.isArray(rawGimmicks) ? rawGimmicks : (rawGimmicks && typeof rawGimmicks === 'object' ? [rawGimmicks] : []);
    const rawWeaknesses = enemy.tags.weaknesses;
    const weaknesses = Array.isArray(rawWeaknesses) ? rawWeaknesses : (rawWeaknesses && typeof rawWeaknesses === 'object' ? [rawWeaknesses] : []);

    const findStrategies = () => {
        if (typeof ENEMY_ALL_DATA === 'undefined') return;
        const enemyData = ENEMY_ALL_DATA[enemy.name];
        if (!enemyData || !enemyData.party) return;

        let totalHP = enemyData.party.reduce((sum, unit) => sum + (unit ? unit.hp : 0), 0);
        let mainEnemyDef = 0;
        enemyData.party.forEach(unit => {
            if (unit && unit.leader) mainEnemyDef = unit.def;
        });
        if (mainEnemyDef === 0 && enemyData.party.length > 0) {
            const firstValidEnemy = enemyData.party.find(u => u);
            if(firstValidEnemy) mainEnemyDef = firstValidEnemy.def;
        }

        let finalHP = totalHP;
        let finalDef = mainEnemyDef;
        const hpRule = floorRules.find(rule => rule.includes('HP+'));
        const defRule = floorRules.find(rule => rule.includes('防+'));
        const allStatsRule = floorRules.find(rule => rule.includes('全能力+'));

        [hpRule, defRule, allStatsRule].forEach(rule => {
            if(rule) {
                try {
                    const percentage = parseInt(rule.match(/(\d+)/)[0]);
                    const multiplier = (1 + percentage / 100);
                    if (rule.includes('HP+')) finalHP *= multiplier;
                    if (rule.includes('防+')) finalDef *= multiplier;
                    if (rule.includes('全能力+')) {
                        finalHP *= multiplier;
                        finalDef *= multiplier;
                    }
                } catch (e) {}
            }
        });
        finalHP = Math.ceil(finalHP);
        finalDef = Math.ceil(finalDef);

        const triggerTags = ['防御-高防御', '防御-ダメージ軽減', '回復-HP回復'];
        const hasTriggerTag = gimmicks.some(g => triggerTags.includes(`${g.category}-${g.subCategory}`));

        if (hasTriggerTag && finalHP <= 70000) {
            const elekiReleaser = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === 'エレキ'));
            if (elekiReleaser) {
                const requiredLevel = Math.ceil(finalHP / 1400);
                const reason = {
                    title: 'エレキ戦術',
                    description: '防御を無視するエレキダメージが有効です。',
                    details: [
                        { label: '目標エレキレベル', value: `<strong>${requiredLevel}</strong> （敵HP ${finalHP} ÷ 1400）` },
                        { label: '役割', value: 'エレキの付与と解除' }
                    ],
                    notes: ['雷ダメージを持つメギドと連携してレベルを上昇させてください。']
                };
                addOrUpdateRecommendation(recommendations.attackers, { megido: elekiReleaser, reason, priority: PRIORITY.HIGH, role: 'attacker' });
            }
        }

        if (hasTriggerTag) {
            const requiredStandardLevel = Math.ceil(Math.sqrt(finalHP / 2));
            const isStandardViable = requiredStandardLevel <= 100;
            const belial = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === '固定砲台'));
            const belialMaxDamage = 130000;
            const isBelialViable = belial && finalHP <= belialMaxDamage;

            if (isStandardViable) {
                const accumulator = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === '点穴付与'));
                if (accumulator) {
                    const maxDamage = Math.floor(2 * (requiredStandardLevel * requiredStandardLevel));
                    const reason = {
                        title: '点穴戦術',
                        description: '防御を無視する点穴ダメージが有効です。',
                        details: [
                            { label: '目標点穴レベル', value: `<strong>${requiredStandardLevel}</strong> （敵HP ${finalHP} をワンパンするために必要）` },
                            { label: '最大ダメージ', value: `約${maxDamage.toLocaleString()}` },
                            { label: '役割', value: '点穴レベルの付与' }
                        ],
                        notes: ['レベルを溜めた後、単発・単体攻撃を持つメギドで攻撃してください。']
                    };
                    addOrUpdateRecommendation(recommendations.attackers, { megido: accumulator, reason, priority: PRIORITY.HIGH, role: 'attacker' });
                }
            } else if (isBelialViable) {
                const reason = {
                    title: '点穴戦術 - 固定砲台',
                    description: '敵HPが高いため、ベリアルの固定砲台による連続攻撃が有効です。',
                    details: [
                        { label: '最大総ダメージ', value: `約${belialMaxDamage.toLocaleString()}（Lv120から連射時）` },
                        { label: '役割', value: '点穴の蓄積と、固定砲台による連続攻撃' }
                    ],
                    notes: ['点穴レベルを最大まで溜めてから「固定砲台」を使用してください。']
                };
                addOrUpdateRecommendation(recommendations.attackers, { megido: belial, reason, priority: PRIORITY.HIGH, role: 'attacker' });
            }
        }

        const hBombForger = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === 'ハイドロボム錬'));
        if (finalDef >= 1000 && hBombForger) {
            const enemyCount = enemyData.party.filter(u => u).length;
            const findRequiredMultiplier = (targetHP, numBlasts, enemyDef, forgerLevel = 70) => {
                for (let multiplier = 6; multiplier <= 50; multiplier += 6) {
                    const bombsUsed = multiplier / 6;
                    const forgeBonus = (bombsUsed + 1) * forgerLevel * 2.5;
                    const base = 100 + forgerLevel * 15;
                    const blastBonus = 1 + Math.max(0, numBlasts - 1) * 0.1;
                    const damage = Math.floor(((base + forgeBonus) * multiplier - enemyDef) * blastBonus);
                    if (damage >= targetHP) return multiplier;
                }
                return null;
            };

            let reason = '';
            let priority = PRIORITY.LOW;
            let multipliersText = '';
            let blastCounts = [];
            let introText = '';

            if (enemyCount > 1) {
                blastCounts = [2, 5, 10];
                priority = PRIORITY.HIGH;
                introText = `敵が複数体いるため、多数のHボムを付与して同時爆破ボーナスを狙う戦術が非常に有効です。`;
            } else { // enemyCount <= 1
                blastCounts = [2, 3];
                priority = PRIORITY.MEDIUM;
                introText = `敵が単体のため付与できるHボムは3つまでですが、高防御の敵に有効です。`;
            }

            const requiredMultipliers = blastCounts.map(count => ({
                count,
                multiplier: findRequiredMultiplier(finalHP, count, finalDef)
            }));

            requiredMultipliers.forEach(item => {
                if (item.multiplier) {
                    multipliersText += `<li>同時爆破 <strong>${item.count}個</strong> の場合: <strong>約 ${item.multiplier} 倍</strong> の錬ボムが必要</li>`;
                }
            });

            if (multipliersText) {
                const reason = {
                    title: 'Hボム錬戦術',
                    description: `${introText}敵HP <strong>${finalHP.toLocaleString()}</strong> を突破するために必要な錬ボムの倍率目安です。`,
                    details: [
                        { label: '役割', value: 'Hボムの錬成と付与' },
                        { label: '必要倍率の目安', value: `<ul style="margin: 0; padding-left: 1.5rem; font-size: 0.9em;">${multipliersText}</ul>` }
                    ],
                    notes: []
                };
                addOrUpdateRecommendation(recommendations.attackers, { megido: hBombForger, reason, priority, role: 'attacker' });
                return;
            }
        }

        const hBombHeavyApplier = ownedMegidoDetails.find(m => m.tags?.some(t => t.subCategory === 'ハイドロボム重'));
        if (hBombHeavyApplier) {
            const enemyCount = enemyData.party.filter(u => u).length;
            const calcStandardDamage = (level, bombMult, blastCount, def) => {
                const base = 100 + level * 15;
                const blastBonus = 1 + Math.max(0, blastCount - 1) * 0.1;
                return Math.floor(((base * bombMult) - def) * blastBonus);
            };

            const damage2Blasts = calcStandardDamage(70, 6, 2, finalDef);
            const damage3Blasts = calcStandardDamage(70, 6, 3, finalDef);
            const damage5Blasts = calcStandardDamage(70, 6, 5, finalDef);

            let reason = '';
            let priority = PRIORITY.LOW;

            if (enemyCount > 1) {
                if (damage2Blasts > 0 && damage2Blasts * 2 > finalHP * 0.25) {
                    priority = PRIORITY.MEDIUM;
                    reason = `<strong>【ハイドロボム戦術】</strong> 敵が複数体いるため、Hボム重の同時爆破が有効です。<div style="margin-top: 0.5rem;"><p style="margin: 0;"><strong>役割:</strong> Hボム重の付与</p><p style="margin: 0.5rem 0 0;"><strong>連携:</strong> 複数のボムを付与して同時爆破ボーナスを狙ってください。</p><p style="margin: 0.5rem 0 0;"><strong>予想ダメージ(目安):</strong><br>・Hボム重(6倍)x2 同時爆破: 約 <strong>${(damage2Blasts * 2).toLocaleString()}</strong><br>・Hボム重(6倍)x5 同時爆破: 約 <strong>${(damage5Blasts * 5).toLocaleString()}</strong></p></div>`;
                }
            } else { // enemyCount <= 1
                if (damage2Blasts > 0 && damage2Blasts * 2 > finalHP * 0.25) {
                    priority = PRIORITY.LOW;
                    reason = `<strong>【ハイドロボム戦術】</strong> Hボムによるダメージが有効です。敵が単体のため最大3つまで付与できます。<div style="margin-top: 0.5rem;"><p style="margin: 0;"><strong>役割:</strong> Hボム重の付与</p><p style="margin: 0.5rem 0 0;"><strong>予想ダメージ(目安):</strong><br>・Hボム重(6倍)x2 同時爆破: 約 <strong>${(damage2Blasts * 2).toLocaleString()}</strong><br>・Hボム重(6倍)x3 同時爆破: 約 <strong>${(damage3Blasts * 3).toLocaleString()}</strong></p></div>`;
                }
            }

            if (reason) {
                const reasonObject = {
                    title: 'ハイドロボム戦術',
                    description: priority === PRIORITY.MEDIUM 
                        ? '敵が複数体いるため、Hボム重の同時爆破が有効です。'
                        : 'Hボムによるダメージが有効です。敵が単体のため最大3つまで付与できます。',
                    details: [
                        { label: '役割', value: 'Hボム重の付与' },
                        {
                            label: '予想ダメージ(目安)',
                            value: priority === PRIORITY.MEDIUM
                                ? `・Hボム重(6倍)x2 同時爆破: 約 <strong>${(damage2Blasts * 2).toLocaleString()}</strong><br>・Hボム重(6倍)x5 同時爆破: 約 <strong>${(damage5Blasts * 5).toLocaleString()}</strong>`
                                : `・Hボム重(6倍)x2 同時爆破: 約 <strong>${(damage2Blasts * 2).toLocaleString()}</strong><br>・Hボム重(6倍)x3 同時爆破: 約 <strong>${(damage3Blasts * 3).toLocaleString()}</strong>`
                        }
                    ],
                    notes: []
                };
                addOrUpdateRecommendation(recommendations.attackers, { megido: hBombHeavyApplier, reason: reasonObject, priority, role: 'attacker' });
            }
        }
    };

    const findAttackersAndJammers = () => {
        const jammersMap = new Map();
        const enemyTags = [ ...weaknesses.map(t => ({ ...t, type: 'weakness' })), ...gimmicks.map(t => ({ ...t, type: 'gimmick' })) ];
        for (const tag of enemyTags) {
            const map = tag.type === 'weakness' ? WEAKNESS_ATTACK_MAP : GIMMICKS_COUNTER_MAP;
            const key = `${tag.category}-${tag.subCategory}`;
            const effectiveCounters = map[key];
            if (!effectiveCounters) continue;
            for (const counter of effectiveCounters) {
                for (const megido of ownedMegidoDetails) {
                    const foundTag = megido.tags?.find(t => {
                        if (!t || !t.category || !t.subCategory) return false;
                        return t.category.trim() === counter.category.trim() && t.subCategory.trim() === counter.subCategory.trim();
                    });
                    if (foundTag) {
                        const priority = evaluatePriority(counter.priorityRule, foundTag.condition);
                        const reason = { method: foundTag.method, description: counter.reason };
                        if (tag.type === 'weakness') {
                            addOrUpdateRecommendation(recommendations.attackers, { megido, reason, priority, role: tag.type });
                        } else {
                            const jammerKey = megido.id;
                            let entry = jammersMap.get(jammerKey);
                            if (!entry) entry = { megido, key: jammerKey, methods: new Set(), counteredGimmicks: new Map(), highestPriority: PRIORITY.LOW };
                            entry.methods.add(foundTag.method);
                            entry.counteredGimmicks.set(tag.subCategory, counter.reason);
                            if (PRIORITY_ORDER[priority] < PRIORITY_ORDER[entry.highestPriority]) entry.highestPriority = priority;
                            jammersMap.set(jammerKey, entry);
                        }
                    }
                }
                for (const orb of ownedOrbDetails) {
                    const foundTag = orb.tags?.find(t => t.category.trim() === counter.category.trim() && t.subCategory.trim() === counter.subCategory.trim());
                    if (foundTag) {
                        const equippableMegido = ownedMegidoDetails.filter(m => m.style === orb.conditions);
                        for (const megido of equippableMegido) {
                            let priority = evaluatePriority(counter.priorityRule, foundTag.condition);
                            let description = counter.reason;
                            if (orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                                priority = PRIORITY.LOW;
                                description += ' (※入手難易度が高いオーブです)';
                            }
                            const reason = { method: `${orb.name}の${foundTag.method}`, description };
                            if (tag.type === 'weakness') {
                                addOrUpdateRecommendation(recommendations.attackers, { megido, orb, reason, priority, role: tag.type });
                            } else {
                                const jammerKey = `${megido.id}-${orb.id}`;
                                let entry = jammersMap.get(jammerKey);
                                if (!entry) entry = { megido, orb, key: jammerKey, methods: new Set(), counteredGimmicks: new Map(), highestPriority: PRIORITY.LOW };
                                entry.methods.add(`${orb.name}の${foundTag.method}`);
                                entry.counteredGimmicks.set(tag.subCategory, counter.reason);
                                if (PRIORITY_ORDER[priority] < PRIORITY_ORDER[entry.highestPriority]) entry.highestPriority = priority;
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
            let reason;
            if (jammer.counteredGimmicks.size > 1) {
                const sortedGimmickNames = Array.from(jammer.counteredGimmicks.keys()).sort((a, b) => (STATUS_AILMENT_DISPLAY_ORDER[a] || 99) - (STATUS_AILMENT_DISPLAY_ORDER[b] || 99));
                const gimmickStr = '「' + sortedGimmickNames.join('」「') + '」';
                reason = { method: methodStr, description: `で${gimmickStr}をまとめて対策できます。` };
            } else if (jammer.counteredGimmicks.size === 1) {
                const originalReason = Array.from(jammer.counteredGimmicks.values())[0];
                reason = { method: methodStr, description: originalReason };
            }
            if (reason && jammer.orb && jammer.orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                reason.description += ' (※入手難易度が高いオーブです)';
            }
            
            if (reason) {
                addOrUpdateRecommendation(recommendations.jammers, { 
                    megido: jammer.megido, 
                    orb: jammer.orb, 
                    reason, 
                    priority: jammer.highestPriority, 
                    role: 'jammer' 
                });
            }
        });

        // **絶好調シナジー：状態異常耐性**
        const statusAilmentGimmicks = gimmicks.filter(g => g.category === '状態異常').map(g => g.subCategory);
        if (statusAilmentGimmicks.length > 0) {
            for (const megido of ownedMegidoDetails) {
                if (megidoConditions[megido.id] === '絶好調') {
                    for (const ailment of statusAilmentGimmicks) {
                        const resistanceTag = megido.tags?.find(t => t.category === '耐性' && t.subCategory === `${ailment}耐性`);
                        const immunityTag = megido.tags?.find(t => t.category === '耐性' && t.subCategory === `${ailment}無効`);
                        if (resistanceTag && !immunityTag) {
                            const baseResistance = parseInt(resistanceTag.condition, 10) || 0;
                            if (baseResistance > 0 && baseResistance < 100 && (baseResistance + 50) >= 100) {
                                const reason = {
                                    title: '絶好調シナジー',
                                    description: `特性の<strong>${ailment}耐性(${baseResistance}%)</strong>とコンディション効果(耐性+50%)が合わさり、<strong>「${ailment}」を完全に無効化できます。</strong>`
                                };
                                addOrUpdateRecommendation(recommendations.jammers, { megido, reason, priority: PRIORITY.HIGH, role: 'jammer' });
                            }
                        }
                    }
                }
            }
        }
    };

    const findSupporters = () => {
        const allThreats = [...gimmicks, ...weaknesses];

        for (const threat of allThreats) {
            const key = `${threat.category}-${threat.subCategory}`;
            const supportCounters = THREAT_SUPPORT_MAP[key];
            if (!supportCounters) continue;

            for (const counter of supportCounters) {
                if (counter.subCategory === 'かばう' && gimmicks.some(g => g.subCategory === 'かばう無効')) {
                    continue;
                }

                for (const megido of ownedMegidoDetails) {
                    const foundTag = megido.tags?.find(t => t.category.trim() === counter.category.trim() && t.subCategory.trim() === counter.subCategory.trim());
                    if (foundTag) {
                        const reason = { method: foundTag.method, description: counter.reason };
                        addOrUpdateRecommendation(recommendations.supporters, { megido, reason, priority: counter.priority, role: 'supporter' });
                    }
                }
                for (const orb of ownedOrbDetails) {
                    const foundTag = orb.tags?.find(t => t.category.trim() === counter.category.trim() && t.subCategory.trim() === counter.subCategory.trim());
                    if (foundTag) {
                        const equippableMegido = ownedMegidoDetails.filter(m => m.style === orb.conditions);
                        for (const megido of equippableMegido) {
                            let description = counter.reason;
                            let priority = counter.priority;
                            if (orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                                priority = PRIORITY.LOW;
                                description += ' (※入手難易度が高いオーブです)';
                            }
                            const reason = { method: `${orb.name}の${foundTag.method}`, description };
                            addOrUpdateRecommendation(recommendations.supporters, { megido, orb, reason, priority, role: 'supporter' });
                        }
                    }
                }
            }
        }

        // **絶好調シナジー：HP依存特性**
        for (const megido of ownedMegidoDetails) {
            if (megidoConditions[megido.id] === '絶好調') {
                const damageBlockTag = megido.tags?.find(t => t.subCategory === 'ダメージブロック');
                if (damageBlockTag) {
                    const reason = {
                        title: '絶好調シナジー',
                        description: `HP+15%の恩恵により、特性<strong>（${damageBlockTag.condition || '最大HP割合'}以下のダメージを無効化）</strong>がさらに活かされ、敵の攻撃を無効化しやすくなります。`
                    };
                    addOrUpdateRecommendation(recommendations.supporters, { megido, reason, priority: PRIORITY.MEDIUM, role: 'supporter' });
                }
            }
        }
    };

    findStrategies();
    findAttackersAndJammers();
    findSupporters();

    const MAX_RECOMMENDATIONS_PER_ROLE = 5;
    const finalRecommendations = {
        attackers: recommendations.attackers
            .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
            .slice(0, MAX_RECOMMENDATIONS_PER_ROLE),
        jammers: recommendations.jammers
            .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
            .slice(0, MAX_RECOMMENDATIONS_PER_ROLE),
        supporters: recommendations.supporters
            .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
            .slice(0, MAX_RECOMMENDATIONS_PER_ROLE),
    };

    const totalRecommendations = finalRecommendations.attackers.length + finalRecommendations.jammers.length + finalRecommendations.supporters.length;
    console.log('[DEBUG] Final recommendations:', JSON.stringify(finalRecommendations, null, 2));
    if (totalRecommendations === 0) return { success: false, reason: 'NO_RECOMMENDED_MEGIDO_FOUND' };

    return { success: true, recommendations: finalRecommendations };
};