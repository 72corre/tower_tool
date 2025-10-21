// =================================================================
// 0. 定数・設定
// =================================================================
const PRIORITY = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
const PRIORITY_ORDER = { [PRIORITY.HIGH]: 1, [PRIORITY.MEDIUM]: 2, [PRIORITY.LOW]: 3 };
const STATUS_AILMENT_DISPLAY_ORDER = { '即死': 1, 'めまい': 2, '呪い': 3 };

// =================================================================
// 1. 対策・役割定義マップ
// =================================================================

const GIMMICKS_COUNTER_MAP = {
    '状態異常-毒': [
        { category: '耐性', subCategory: '毒無効', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-めまい': [
        { category: '耐性', subCategory: 'めまい無効', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-感電': [
        { category: '妨害', subCategory: '感電', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '感電無効', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-呪い': [
        { category: '耐性', subCategory: '呪い無効', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '状態異常-即死': [
        { category: '耐性', subCategory: '即死無効', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '耐性', subCategory: '全状態異常耐性', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '強化', subCategory: '状態異常無効', priorityRule: { type: 'fixed', priority: 'medium' } },
        { category: '強化', subCategory: '自動蘇生', priorityRule: { type: 'fixed', priority: 'low' } },
    ],
    '防御-高防御': [
        { category: '攻撃手段', subCategory: '固定ダメージ', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '攻撃手段', subCategory: '防御無視', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '特殊状態', subCategory: '点穴', priorityRule: { type: 'fixed', priority: 'medium' } },
        { category: '特殊状態', subCategory: '点穴付与', priorityRule: { type: 'fixed', priority: 'medium' } },
    ],
    '防御-ダメージ軽減': [
        { category: '攻撃手段', subCategory: '固定ダメージ', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '攻撃手段', subCategory: '防御無視', priorityRule: { type: 'fixed', priority: 'high' } },
        { category: '特殊状態', subCategory: '点穴', priorityRule: { type: 'fixed', priority: 'medium' } },
        { category: '特殊状態', subCategory: '点穴付与', priorityRule: { type: 'fixed', priority: 'medium' } },
    ]
};

const GIMMICK_REASON_TEMPLATES = {
    '高火力スキル': '敵の強力なスキル攻撃に対処するため',
    '高火力奥義': '敵の強力な奥義に対処するため',
    '全体攻撃': 'パーティ全体が受けるダメージを軽減するため',
    '連続攻撃': '複数回ヒットする攻撃を無効化、または軽減するため',
    'かばう無効': '「かばう」を無視する攻撃からアタッカー等を守るため',
    '状態異常-毒': '「毒」による継続ダメージを防ぐため',
    '状態異常-めまい': '「めまい」による行動不能を防ぐため',
    '状態異常-感電': '「感電」によるスキルフォトン破壊を防ぐため',
    '状態異常-呪い': '「呪い」による回復量低下や即死を防ぐため',
    '状態異常-即死': '「即死」効果を防ぐため',
    '弱体-攻撃力低下': '攻撃力低下の弱体を解除し、火力を維持するため',
    '弱体-防御力低下': '防御力低下の弱体を解除し、被ダメージを抑えるため',
    '弱体-素早さ低下': '素早さ低下の弱体を解除し、行動順を確保するため',
    '防御-高防御': '敵の高い防御力を無視してダメージを与えるため',
    '耐性-火に弱い': '弱点である火ダメージで効率的にダメージを与えるため',
    '耐性-雷に弱い': '弱点である雷ダメージで効率的にダメージを与えるため',
    '攻撃手段-死者特効': '死者系の敵に特効ダメージを与えるため',
    '攻撃手段-獣人特効': '獣人系の敵に特効ダメージを与えるため',
    '攻撃手段-植物特効': '植物系の敵に特効ダメージを与えるため',
    '攻撃手段-防御無視': '敵の高い防御力を無視してダメージを与えるため',
    '攻撃手段-固定ダメージ': '敵の防御力に関わらず固定ダメージを与えるため',
    '特殊状態-点穴': '防御力を無視する点穴ダメージで攻撃するため',
    '特殊状態-点穴付与': '点穴を溜めて大ダメージを狙うため',
    '特殊状態-エレキ': 'エレキ状態にして雷ダメージを増加させるため',
};

const WEAKNESS_ATTACK_MAP = {
    '攻撃手段-死者特効': [{ category: '攻撃手段', subCategory: '死者特効', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '攻撃手段-獣人特効': [{ category: '攻撃手段', subCategory: '獣人特効', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '攻撃手段-植物特効': [{ category: '攻撃手段', subCategory: '植物特効', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '攻撃手段-防御無視': [{ category: '攻撃手段', subCategory: '防御無視', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '攻撃手段-固定ダメージ': [{ category: '攻撃手段', subCategory: '固定ダメージ', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '特殊状態-点穴': [{ category: '特殊状態', subCategory: '点穴', priorityRule: { type: 'fixed', priority: 'high' } }],
    '特殊状態-点穴付与': [{ category: '特殊状態', subCategory: '点穴付与', priorityRule: { type: 'fixed', priority: 'high' } }],
    '特殊状態-エレキ': [{ category: '特殊状態', subCategory: 'エレキ', priorityRule: { type: 'conditional', rules: [ { operator: '>=', value: 100, priority: 'high' }, { operator: '>=', value: 50, priority: 'medium' } ], defaultPriority: 'low' } }],
    '耐性-火に弱い': [{ category: '攻撃手段', subCategory: '火ダメージ', priorityRule: { type: 'fixed', priority: 'high' } }],
    '耐性-雷に弱い': [{ category: '攻撃手段', subCategory: '雷ダメージ', priorityRule: { type: 'fixed', priority: 'high' } }],
};

const THREAT_SUPPORT_MAP = {
    'ギミック-高火力スキル': [
        { category: '強化', subCategory: 'スキルダメージ軽減', priority: PRIORITY.HIGH },
        { category: '強化', subCategory: 'スキルバリア', priority: PRIORITY.HIGH },
        { category: '補助', subCategory: 'かばう', priority: PRIORITY.MEDIUM }
    ],
    'ギミック-高火力奥義': [
        { category: '強化', subCategory: 'ダメージ軽減', priority: PRIORITY.HIGH },
        { category: '強化', subCategory: '無敵', priority: PRIORITY.HIGH },
        { category: '補助', subCategory: 'かばう', priority: PRIORITY.MEDIUM }
    ],
    'ギミック-全体攻撃': [
        { category: '補助', subCategory: 'HP回復', priority: PRIORITY.MEDIUM },
        { category: '強化', subCategory: 'ダメージ軽減', priority: PRIORITY.MEDIUM },
        { category: '強化', subCategory: '回数バリア', priority: PRIORITY.MEDIUM },
    ],
    'ギミック-連続攻撃': [
        { category: '強化', subCategory: '回数バリア', priority: PRIORITY.HIGH },
        { category: '補助', subCategory: 'かばう', priority: PRIORITY.HIGH },
    ],
    'ギミック-かばう無効': [
        { category: '補助', subCategory: '執心', priority: PRIORITY.HIGH },
    ],
    '状態異常-毒': [{ category: '補助', subCategory: '状態異常治癒', priority: PRIORITY.MEDIUM }],
    '状態異常-めまい': [{ category: '補助', subCategory: '状態異常治癒', priority: PRIORITY.MEDIUM }],
    '状態異常-感電': [{ category: '補助', subCategory: '状態異常治癒', priority: PRIORITY.MEDIUM }],
    '状態異常-呪い': [{ category: '補助', subCategory: '状態異常治癒', priority: PRIORITY.HIGH }],
    '状態異常-即死': [{ category: '補助', subCategory: '蘇生', priority: PRIORITY.HIGH }],
    '弱体-攻撃力低下': [{ category: '補助', subCategory: '弱体解除', priority: PRIORITY.MEDIUM }],
    '弱体-防御力低下': [{ category: '補助', subCategory: '弱体解除', priority: PRIORITY.MEDIUM }],
    '弱体-素早さ低下': [{ category: '補助', subCategory: '弱体解除', priority: PRIORITY.MEDIUM }],
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

const findRecommendedMegido = ({ enemy, floorRules = [], ownedMegido, allMegidoMaster, ownedOrbs = new Set(), allOrbsMaster = [], megidoConditions = {} }) => {
    if (!enemy || !enemy.tags) return { success: false, reason: 'NO_ENEMY_DATA' };

    const activeOwnedMegido = new Set(Array.from(ownedMegido).filter(id => megidoConditions[id] !== '気絶'));
    if (activeOwnedMegido.size === 0) return { success: false, reason: 'NO_RECOMMENDED_MEGIDO_FOUND' };

    const ownedMegidoDetails = allMegidoMaster.filter(m => activeOwnedMegido.has(m.id));
    const ownedOrbDetails = allOrbsMaster.filter(o => ownedOrbs.has(o.id));

    const recommendations = { attackers: [], jammers: [], supporters: [] };

    const addOrUpdateRecommendation = (list, newItem) => {
        const condition = megidoConditions[newItem.megido.id] || '普通';
        let { priority, reason } = { ...newItem };

        let conditionDescription = '';
        switch (condition) {
            case '不調':
                priority = (priority === PRIORITY.HIGH) ? PRIORITY.MEDIUM : PRIORITY.LOW;
                conditionDescription = ' <strong class="condition-warning">【不調】能力が低下しているため、本来の性能を発揮できない可能性があります。</strong>';
                break;
            case '絶不調':
                priority = PRIORITY.LOW;
                conditionDescription = ' <strong class="condition-warning">【絶不調】能力が大幅に低下しており、推奨度は低いですが、他に選択肢がない場合に。</strong>';
                break;
            case '好調':
            case '絶好調':
                if (newItem.role === 'attacker') {
                    conditionDescription = ' <span class="condition-info">【好調以上】攻撃力+25%の恩恵を受けられます。</span>';
                }
                break;
        }
        if (reason.description) {
            reason.description += conditionDescription;
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

    const WEAKNESS_TO_GIMMICK_MAP = {
        '点穴': 'ダメージ軽減／高防御',
        '点穴付与': 'ダメージ軽減／高防御',
        '防御無視': 'ダメージ軽減／高防御',
        '固定ダメージ': 'ダメージ軽減／高防御'
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
                    const foundTag = megido.tags?.find(t => t.category.trim() === counter.category.trim() && t.subCategory.trim() === counter.subCategory.trim());
                    if (foundTag) {
                        const priority = evaluatePriority(counter.priorityRule, foundTag.condition);
                        
                        let realTargetGimmick = tag.subCategory;
                        if (tag.type === 'weakness' && WEAKNESS_TO_GIMMICK_MAP[tag.subCategory]) {
                            realTargetGimmick = WEAKNESS_TO_GIMMICK_MAP[tag.subCategory];
                        }
    
                        const description = GIMMICK_REASON_TEMPLATES[key] || `敵の「${realTargetGimmick}」への対策です。`;
                        const reason = { method: foundTag.method, counter: counter.subCategory, targetGimmick: realTargetGimmick, description };
                        // ギミック対策でも、攻撃的な役割はアタッカーに分類する
                        if (counter.category === '攻撃手段' || counter.subCategory === '点穴' || counter.subCategory === '点穴付与') {
                            addOrUpdateRecommendation(recommendations.attackers, { megido, reason, priority, role: 'attacker' });
                        } else if (tag.type === 'weakness') {
                            addOrUpdateRecommendation(recommendations.attackers, { megido, reason, priority, role: tag.type });
                        } else {
                            const jammerKey = megido.id;
                            let entry = jammersMap.get(jammerKey);
                            if (!entry) entry = { megido, key: jammerKey, reasons: [], highestPriority: PRIORITY.LOW };
                            entry.reasons.push(reason);
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
                            let orbNote = '';
                            if (orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                                priority = PRIORITY.LOW;
                                orbNote = ' (※入手難易度が高いオーブです)';
                            }
                            const description = GIMMICK_REASON_TEMPLATES[`${tag.category}-${tag.subCategory}`] || `敵の「${tag.subCategory}」への対策です。`;
                            const reason = { method: `${orb.name}の${foundTag.method}`, counter: counter.subCategory, targetGimmick: tag.subCategory, note: orbNote, description };

                            if (counter.category === '攻撃手段' || counter.subCategory === '点穴' || counter.subCategory === '点穴付与') {
                                addOrUpdateRecommendation(recommendations.attackers, { megido, orb, reason, priority, role: 'attacker' });
                            } else if (tag.type === 'weakness') {
                                addOrUpdateRecommendation(recommendations.attackers, { megido, orb, reason, priority, role: tag.type });
                            } else {
                                const jammerKey = `${megido.id}-${orb.id}`;
                                let entry = jammersMap.get(jammerKey);
                                if (!entry) entry = { megido, orb, key: jammerKey, reasons: [], highestPriority: PRIORITY.LOW };
                                entry.reasons.push(reason);
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
            addOrUpdateRecommendation(recommendations.jammers, { 
                megido: jammer.megido, 
                orb: jammer.orb, 
                reason: jammer.reasons, 
                priority: jammer.highestPriority, 
                role: 'jammer' 
            });
        });

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
                                    description: `特性の<strong>${ailment}耐性(${baseResistance}%)</strong>とコンディション効果(耐性+50%)が合わさり、<strong>「${ailment}」を完全に無効化できます。</strong>`,
                                    targetGimmick: ailment
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
                        const description = GIMMICK_REASON_TEMPLATES[`${threat.category}-${threat.subCategory}`] || `敵の「${threat.subCategory}」への対策です。`;
                        const reason = { method: foundTag.method, counter: counter.subCategory, targetGimmick: threat.subCategory, description };
                        addOrUpdateRecommendation(recommendations.supporters, { megido, reason, priority: counter.priority, role: 'supporter' });
                    }
                }
                for (const orb of ownedOrbDetails) {
                    const foundTag = orb.tags?.find(t => t.category.trim() === counter.category.trim() && t.subCategory.trim() === counter.subCategory.trim());
                    if (foundTag) {
                        const equippableMegido = ownedMegidoDetails.filter(m => m.style === orb.conditions);
                        for (const megido of equippableMegido) {
                            let priority = counter.priority;
                            let orbNote = '';
                            if (orb.tags?.some(t => t.subCategory === 'オーブキャスト不可')) {
                                priority = PRIORITY.LOW;
                                orbNote = ' (※入手難易度が高いオーブです)';
                            }
                            const description = GIMMICK_REASON_TEMPLATES[`${threat.category}-${threat.subCategory}`] || `敵の「${threat.subCategory}」への対策です。`;
                            const reason = { method: `${orb.name}の${foundTag.method}`, counter: counter.subCategory, targetGimmick: threat.subCategory, note: orbNote, description };
                            addOrUpdateRecommendation(recommendations.supporters, { megido, orb, reason, priority, role: 'supporter' });
                        }
                    }
                }
            }
        }

        for (const megido of ownedMegidoDetails) {
            if (megidoConditions[megido.id] === '絶好調') {
                const damageBlockTag = megido.tags?.find(t => t.subCategory === 'ダメージブロック');
                if (damageBlockTag) {
                    const reason = {
                        title: '絶好調シナジー',
                        description: `HP+15%の恩恵により、特性<strong>（${damageBlockTag.condition || '最大HP割合'}以下のダメージを無効化）</strong>がさらに活かされ、敵の攻撃を無効化しやすくなります。`,
                        targetGimmick: '被ダメージ軽減'
                    };
                    addOrUpdateRecommendation(recommendations.supporters, { megido, reason, priority: PRIORITY.MEDIUM, role: 'supporter' });
                }
            }
        }
    };

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
    if (totalRecommendations === 0) return { success: false, reason: 'NO_RECOMMENDED_MEGIDO_FOUND' };

    return { success: true, recommendations: finalRecommendations };
};
