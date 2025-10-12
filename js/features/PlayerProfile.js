const PROFILE_KEY = 'towerPlayerProfile';

const defaultProfile = () => ({
    // Raw counts
    totalActions: 0,
    combatActions: 0,
    exploreActions: {
        total: 0,
        tower_effect: 0,
        tower_power: 0,
        recovery: 0,
    },
    retreats: 0,
    defeats: 0,
    lowConditionCombats: 0,
    bossDefeats: [], // Stores { floor, remainingTowerPower }

    // Playstyle snapshot (calculated when needed)
    metrics: {
        combatRatio: 0,
        explorationBias: {},
        retreatRate: 0,
        defeatRate: 0,
        conditionManagement: 0,
        towerPowerSurplus: 0,
    }
});

const getProfile = () => {
    try {
        const saved = localStorage.getItem(PROFILE_KEY);
        if (saved) {
            const profile = JSON.parse(saved);
            const defaultProf = defaultProfile();
            if (!profile.exploreActions) profile.exploreActions = defaultProf.exploreActions;
            if (!profile.bossDefeats) profile.bossDefeats = defaultProf.bossDefeats;
            return profile;
        }
    } catch (e) {
        console.error("Failed to load player profile", e);
    }
    return defaultProfile();
};

const saveProfile = (profile) => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
        console.error("Failed to save player profile", e);
    }
};

const logAction = (actionType, data = {}) => {
    const profile = getProfile();

    switch (actionType) {
        case 'EXPLORE':
            profile.totalActions++;
            profile.exploreActions.total++;
            if (data.sub_type && profile.exploreActions.hasOwnProperty(data.sub_type)) {
                profile.exploreActions[data.sub_type]++;
            }
            break;

        case 'COMBAT_RESULT':
            profile.totalActions++;
            profile.combatActions++;
            if (data.isLowCondition) {
                profile.lowConditionCombats++;
            }
            if (data.result === 'lose') {
                profile.defeats++;
            } else if (data.result === 'retreat') {
                profile.retreats++;
            }
            break;

        case 'BOSS_DEFEAT':
            // This is not a main action, just data collection
            if (data.floor && data.towerPower) {
                profile.bossDefeats.push({ floor: data.floor, towerPower: data.towerPower });
            }
            break;
    }

    saveProfile(profile);
};

const calculateMetrics = (profile) => {
    const newMetrics = {};
    const p = profile || getProfile(); // Use provided profile or load new one

    newMetrics.combatRatio = p.totalActions > 0 ? p.combatActions / p.totalActions : 0;
    
    newMetrics.explorationBias = {};
    if (p.exploreActions.total > 0) {
        for (const key in p.exploreActions) {
            if (key !== 'total') {
                newMetrics.explorationBias[key] = p.exploreActions[key] / p.exploreActions.total;
            }
        }
    }

    newMetrics.retreatRate = p.combatActions > 0 ? p.retreats / p.combatActions : 0;
    newMetrics.defeatRate = p.combatActions > 0 ? p.defeats / p.combatActions : 0;
    
    newMetrics.conditionManagement = p.combatActions > 0 ? p.lowConditionCombats / p.combatActions : 0;

    if (p.bossDefeats.length > 0) {
        const totalSurplus = p.bossDefeats.reduce((sum, entry) => sum + entry.towerPower, 0);
        newMetrics.towerPowerSurplus = totalSurplus / p.bossDefeats.length;
    } else {
        newMetrics.towerPowerSurplus = 0;
    }
    
    p.metrics = newMetrics;
    saveProfile(p);
    return p;
};