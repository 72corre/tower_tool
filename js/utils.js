const calculateStats = (baseMegido, level) => {
    if (!baseMegido) return { HP: 0, ATK: 0, DEF: 0, SPD: 0 };
    const baseStats = { 
        HP: Number(baseMegido.HP), ATK: Number(baseMegido.ATK), 
        DEF: Number(baseMegido.DEF), SPD: Number(baseMegido.SPD) 
    };
    if (level <= 70) return baseStats;
    
    const bonus = LEVEL_BONUSES[level];
    if (!bonus) return baseStats;

    return {
        HP: baseStats.HP + bonus.hp,
        ATK: baseStats.ATK + bonus.atk,
        DEF: baseStats.DEF + bonus.def,
        SPD: baseStats.SPD + bonus.spd
    };
};

const getRequiredExplorationPower = (square) => {
    if (!square || !square.floor) return 3500;
    if (['status_buff', 'attack_buff', 'hp_buff', 'defense_buff'].includes(square.sub_type)) {
        return 3500;
    }
    const floor = square.floor.floor;
    if (floor >= 21) return 5500;
    if (floor >= 11) return 4500;
    return 3500;
};

const getBaseMegidoName = (name) => name ? name.replace(/[RBC]$/, '') : '';

const KNOWN_RULES = ["全能力+20%（幻獣）","なし","防+50%（幻獣）","早+50%（幻獣）","攻+50%（幻獣）","全能力+50%（幻獣）","スキル強化","アタック強化","戦闘開始時、覚醒ゲージ+99","チャージ強化","全フォトン強化","毎ターン終了時、覚醒+10","劣化フォトン発生","毎ターン終了時、HP30%回復（幻獣）","チャージ無し","毎ターン終了時、覚醒+1（幻獣）","ペインフォトン発生","毎ターン終了時、1回バリア（幻獣）","特殊フォトン発生","HP+80%","進化度・レベル制限：⭐︎2.5/Lv23","全能力+50%（敵）","HP不可視","素早さ100%低下","被ダメージ20%上昇（メギド）","HP+80%(幻獣)","全能力+20%(幻獣)"];

const getTagInfo = (tag) => {
    if (/\d+F$/.test(tag)) return { category: 'floor' };
    if (KNOWN_RULES.includes(tag)) return { category: 'rule' };
    const megido = window.COMPLETE_MEGIDO_LIST && window.COMPLETE_MEGIDO_LIST.find(m => m.名前 === tag);
    if (megido) return { category: 'megido', style: megido.スタイル };
    if (window.ENEMY_ALL_DATA && window.ENEMY_ALL_DATA[tag]) return { category: 'enemy' };
    return { category: 'custom' };
};

const getFormationInvalidReason = (formation, megidoDetails, ownedMegidoIds) => {
    if (!formation || !formation.megido) return null;

    for (const megido of formation.megido) {
        if (!megido) continue;

        if (!ownedMegidoIds.has(String(megido.id))) {
            return `${megido.名前}を所持していません。`;
        }

        const ownedDetails = megidoDetails[megido.id];
        if (!ownedDetails) continue;

        if ((megido.level || 70) > (ownedDetails.level || 70)) {
            return `${megido.名前}のレベルが足りません。(要求: ${megido.level} / 所持: ${ownedDetails.level || 70})`;
        }

        if (megido.special_reishou && !ownedDetails.special_reishou) {
            return `${megido.名前}の専用霊宝を所持していません。`;
        }

        if ((megido.bond_reishou || 0) > (ownedDetails.bond_reishou || 0)) {
            return `${megido.名前}の絆霊宝のTierが足りません。`;
        }

        const megidoData = COMPLETE_MEGIDO_LIST.find(m => m.id === megido.id);
        if (megidoData && megidoData.Singularity) {
            if ((megido.singularity_level || 0) > (ownedDetails.singularity_level || 0)) {
                return `${megido.名前}の特異点レベルが足りません。`;
            }
        }
    }

    return null;
};

const CONDITION_ORDER = ['絶好調', '好調', '普通', '不調', '絶不調', '気絶'];

const getStyleClass = (style) => {
    if (!style) return '';
    const s = String(style).toLowerCase();
    if (s.includes('ラッシュ') || s.includes('rush')|| s.includes('R')) return 'rush-text';
    if (s.includes('カウンター') || s.includes('counter')|| s.includes('C')) return 'counter-text';
    if (s.includes('バースト') || s.includes('burst')|| s.includes('B')) return 'burst-text';
    return '';
};

const getNextCondition = (current, change) => {
    const currentIndex = CONDITION_ORDER.indexOf(current);
    if (currentIndex === -1) return current;
    const newIndex = Math.min(CONDITION_ORDER.length - 1, Math.max(0, currentIndex + change));
    return CONDITION_ORDER[newIndex];
};

const calculateShortestPath = (floorData, connections) => {
    if (!floorData || !floorData.squares || !connections) return -1;
    const startNode = Object.keys(floorData.squares).find(id => floorData.squares[id].type === 'start');
    const bossNode = Object.keys(floorData.squares).find(id => floorData.squares[id].type === 'boss');

    if (!startNode || !bossNode) return -1;
    if (startNode === bossNode) return 0;

    const queue = [[startNode, 0]]; // [node, distance]
    const visited = new Set([startNode]);

    while (queue.length > 0) {
        const [currentNode, distance] = queue.shift();

        const neighbors = connections[currentNode] || [];
        for (const neighbor of neighbors) {
            if (neighbor === bossNode) {
                return distance + 1;
            }
            
            if (floorData.squares[neighbor] && !visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push([neighbor, distance + 1]);
            }
        }
    }

    return -1; // Path not found
};

const encodeFormationToQrString = (formation, megidoDetails, idMaps) => {
    if (!formation || !idMaps) return '';

    const enemyId = formation.enemyName ? (idMaps.enemy.originalToNew.get(formation.enemyName) || '000') : '000';

    const floorsRaw = formation.floors || formation.floor || [];
    const floors = (Array.isArray(floorsRaw) ? floorsRaw : floorsRaw.toString().split(',')).map(f => String(f).trim()).filter(f => f && !isNaN(f));

    let header = '';
    if (floors.length > 1) {
        const floorList = floors.map(f => f.toString().padStart(2, '0')).join('');
        header = `2${enemyId}${floors.length}${floorList}`;
    } else {
        const floor = floors.length > 0 ? floors[0].toString().padStart(2, '0') : '00';
        header = `${enemyId}${floor}`;
    }

    let partyData = '';
    for (let i = 0; i < 5; i++) {
        const megidoSlot = formation.megidoSlots[i];
        if (megidoSlot && megidoSlot.megidoId) {
            const megidoId = megidoSlot.megidoId;
            const details = megidoDetails[megidoId] || {};

            partyData += idMaps.megido.originalToNew.get(String(megidoId)) || '999';
            partyData += (details.ougiLevel || 1).toString().padStart(2, '0');
            
            const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId);
            const singularityLevel = megidoMaster && megidoMaster.Singularity ? (details.singularity_level || 0).toString() : '0';
            partyData += singularityLevel;

            const level = details.level || 70;
            let levelChar = '0';
            if (level >= 80) levelChar = '4';
            else if (level >= 76) levelChar = '3';
            else if (level >= 74) levelChar = '2';
            else if (level >= 72) levelChar = '1';
            partyData += levelChar;

            const reishouIds = (megidoSlot.reishouIds || []).map(rId => idMaps.reishou.originalToNew.get(rId) || '999').slice(0, 4);
            while (reishouIds.length < 4) {
                reishouIds.push('999');
            }
            partyData += reishouIds.join('');

            partyData += details.special_reishou ? '1' : '0';
            partyData += (details.bond_reishou || 0).toString();

            const orbId = megidoSlot.orbId ? (idMaps.orb.originalToNew.get(String(megidoSlot.orbId)) || '999') : '999';
            partyData += orbId;
        } else {
            partyData += '999010099999999999900999';
        }
    }
    
    const finalQrString = header + partyData;
    return finalQrString;
};

const rehydrateFormation = (formation, megidoDetails) => {
    if (!formation) return null;
    if (formation.megido) return formation;
    if (!formation.megidoSlots) return { ...formation, megido: [] };

    const rehydratedMegido = formation.megidoSlots.map(slot => {
        if (!slot || !slot.megidoId) return null;

        const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(slot.megidoId));
        if (!megidoMaster) return null;

        const orb = slot.orbId ? COMPLETE_ORB_LIST.find(o => String(o.id) === String(slot.orbId)) : null;
        const reishou = (slot.reishouIds || []).map(rId => COMPLETE_REISHOU_LIST.find(r => String(r.id) === String(rId))).filter(Boolean);
        const details = megidoDetails[slot.megidoId] || {};

        return {
            ...megidoMaster,
            orb: orb,
            reishou: reishou,
            level: details.level || 70,
            ougiLevel: details.ougiLevel || 1,
            special_reishou: details.special_reishou || false,
            bond_reishou: details.bond_reishou || 0,
            singularity_level: details.singularity_level || 0,
        };
    });

    return { ...formation, megido: rehydratedMegido };
};

const getMegido = (megidoId) => {
    if (!megidoId) return null;
    return COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(megidoId));
};

const getOrb = (orbId) => {
    if (!orbId) return null;
    return COMPLETE_ORB_LIST.find(o => String(o.id) === String(orbId));
};

const hiraganaToKatakana = (str) => {
  if (!str) return '';
  return str.replace(/[\u3040-\u309f]/g, (match) => {
    const charCode = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(charCode);
  });
};

const katakanaToHiragana = (str) => {
  if (!str) return '';
  return str.replace(/[\u30a0-\u30ff]/g, (match) => {
    const charCode = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(charCode);
  });
};