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
    if (square.sub_type === 'status_buff') return 3500;
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
    if (s.includes('ラッシュ') || s.includes('rush')) return 'text-rush';
    if (s.includes('カウンター') || s.includes('counter')) return 'text-counter';
    if (s.includes('バースト') || s.includes('burst')) return 'text-burst';
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