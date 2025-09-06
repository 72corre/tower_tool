const getAdjustedWeights = (profile) => {
    const weights = {
        lambda_enemy: 1.0,
        lambda_condition: 1.0,
        lambda_risk: 1.0,
    };

    if (!profile || !profile.metrics) return weights;

    if (profile.metrics.combatRatio > 0.6) {
        weights.lambda_condition *= 1.2;
    }
    if (profile.metrics.conditionManagement > 0.5) {
        weights.lambda_condition *= 1.3;
    }
    if (profile.metrics.towerPowerSurplus > 15) {
        weights.lambda_risk *= 0.8;
    }

    return weights;
};

const getRisk = (square, profile, runState, megidoConditions, targetEnemies) => {
    let combinedRisk = 0;
    const weights = getAdjustedWeights(profile);

    // R_enemy: Calculate based on targeted enemy or all enemies
    let enemyRisk = 0;
    const targetedEnemy = targetEnemies[square.id];

    if (square.type === 'battle' || square.type === 'boss') {
        if (targetedEnemy) {
            // Risk is based only on the one targeted enemy.
            // Placeholder: a targeted enemy has a base risk of 10.
            // A more complex implementation would look up the enemy's actual stats.
            enemyRisk = 10;
        } else {
            // Risk is based on all enemies in the square.
            // Placeholder: 5 risk points per enemy.
            enemyRisk = (square.enemies?.length || 0) * 5;
        }
        if (square.type === 'boss') {
            enemyRisk *= 1.5; // Bosses are inherently riskier
        }
    }
    combinedRisk += weights.lambda_enemy * enemyRisk;

    // R_condition: Average condition of all owned megido
    let conditionRisk = 0;
    const ownedIds = Object.keys(megidoConditions);
    if (ownedIds.length > 0) {
        const totalCondition = ownedIds.reduce((sum, id) => {
            const condition = megidoConditions[id] || '絶好調';
            const level = ['絶好調', '好調', '普通', '不調', '絶不調', '気絶'].indexOf(condition);
            return sum + level;
        }, 0);
        const avgConditionLevel = totalCondition / ownedIds.length;
        conditionRisk = avgConditionLevel * 2; // Scale it up
    }
    combinedRisk += weights.lambda_condition * conditionRisk;

    return combinedRisk;
};

const getValue = (square, profile) => {
    let combinedValue = 0;

    combinedValue += 10; 
    if (square.type === 'boss') {
        combinedValue += 50;
    }

    if (square.type === 'explore') {
        if (square.sub_type === 'tower_effect') {
            combinedValue += 15;
        } else if (square.sub_type === 'recovery') {
            combinedValue += 20;
        } else if (square.sub_type === 'tower_power') {
            combinedValue += 10;
        }
    }

    return combinedValue;
};

const calculateDesirability = (square, profile, runState, megidoConditions, targetEnemies) => {
    if (!square) return -Infinity;

    const weights = getAdjustedWeights(profile);
    const value = getValue(square, profile);
    const risk = getRisk(square, profile, runState, megidoConditions, targetEnemies);

    const desirability = value - (weights.lambda_risk * risk);

    return desirability + (Math.random() - 0.5) * 2;
};