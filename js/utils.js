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
    if (square.sub_type === 'status_buff' || 'attack_buff' || 'hp_buff' || 'defense_buff')  return 3500;
    const floor = square.floor.floor;
    if (floor >= 21) return 5500;
    if (floor >= 11) return 4500;
    return 3500;
};

const getBaseMegidoName = (name) => name ? name.replace(/[RBC]$/, '') : '';

const isFormationInvalid = (formation, megidoDetails, ownedMegidoIds) => {
    if (!formation || !formation.megido) return false;

    for (const megido of formation.megido) {
        if (!megido) continue;

        // 1. Check if owned
        if (!ownedMegidoIds.has(String(megido.id))) {
            return true; // Invalid if not owned
        }

        const ownedDetails = megidoDetails[megido.id];
        if (!ownedDetails) continue; // Should not happen if owned, but as a safeguard

        // 2. Check level
        if ((megido.level || 70) > (ownedDetails.level || 70)) {
            return true; // Invalid if required level is higher
        }

        // 3. Check special reishou
        if (megido.special_reishou && !ownedDetails.special_reishou) {
            return true; // Invalid if special reishou is required but not owned
        }

        // 4. Check bond reishou
        if ((megido.bond_reishou || 0) > (ownedDetails.bond_reishou || 0)) {
            return true; // Invalid if required bond reishou tier is higher
        }

        // 5. Check singularity level
        const megidoData = COMPLETE_MEGIDO_LIST.find(m => m.id === megido.id);
        if (megidoData && megidoData.Singularity) {
            if ((megido.singularity_level || 0) > (ownedDetails.singularity_level || 0)) {
                return true; // Invalid if required singularity level is higher
            }
        }
    }

    return false; // Formation is valid
};

const CONDITION_ORDER = ['絶好調', '好調', '普通', '不調', '絶不調', '気絶'];

const getStyleClass = (style) => {
    if (!style) return '';
    const s = String(style).toLowerCase();
    if (s.includes('ラッシュ') || s.includes('rush')|| s.includes('R')) return 'text-rush';
    if (s.includes('カウンター') || s.includes('counter')|| s.includes('C')) return 'text-counter';
    if (s.includes('バースト') || s.includes('burst')|| s.includes('B')) return 'text-burst';
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
    console.log('--- Encoding Formation Start ---');
    console.log('Input Formation:', JSON.parse(JSON.stringify(formation)));
    console.log('Inspecting megidoSlots:', JSON.stringify(formation.megidoSlots, null, 2)); // ★ 詳細ログを追加
    console.log('Megido Details:', JSON.parse(JSON.stringify(megidoDetails)));

    if (!formation || !idMaps) return '';

    let qrString = '';

    const enemyId = formation.enemyName ? (idMaps.enemy.originalToNew.get(formation.enemyName) || '000') : '000';
    const floor = formation.floor ? formation.floor.toString().padStart(2, '0') : '00';

    qrString += enemyId;
    qrString += floor;

    for (let i = 0; i < 5; i++) {
        const megidoSlot = formation.megidoSlots[i];
        if (megidoSlot && megidoSlot.megidoId) {
            const megidoId = megidoSlot.megidoId;
            // 投稿時は、その編成に保存されている情報ではなく、ユーザーが所持している最新のメギド情報を参照する
            const details = megidoDetails[megidoId] || {};

            qrString += idMaps.megido.originalToNew.get(String(megidoId)) || '999';
            qrString += (details.ougiLevel || 1).toString().padStart(2, '0');
            
            const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId);
            const singularityLevel = megidoMaster && megidoMaster.Singularity ? (details.singularity_level || 0).toString() : '0';
            qrString += singularityLevel;

            const level = details.level || 70;
            let levelChar = '0';
            if (level >= 80) levelChar = '4';
            else if (level >= 76) levelChar = '3';
            else if (level >= 74) levelChar = '2';
            else if (level >= 72) levelChar = '1';
            qrString += levelChar;

            const reishouIds = (megidoSlot.reishouIds || []).map(rId => idMaps.reishou.originalToNew.get(rId) || '999').slice(0, 4);
            while (reishouIds.length < 4) {
                reishouIds.push('999');
            }
            qrString += reishouIds.join('');

            qrString += details.special_reishou ? '1' : '0';
            qrString += (details.bond_reishou || 0).toString();

            const orbId = megidoSlot.orbId ? (idMaps.orb.originalToNew.get(String(megidoSlot.orbId)) || '999') : '999';
            qrString += orbId;
        } else {
            qrString += '999010099999999999900999'; // Empty slot data
        }
    }
    console.log('Output QR String:', qrString);
    console.log('QR String Length:', qrString.length);
    console.log('--- Encoding Formation End ---');
    return qrString;
};

const rehydrateFormation = (formation, megidoDetails) => {
    if (!formation) return null;
    // If formation already has a hydrated 'megido' array, just return it.
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
