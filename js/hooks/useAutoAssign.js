const useAutoAssign = () => {

    const TWO_STEP_RECOVERY_POINTS = [
        { floor: 18, style: 'B', capacity: 20 },
        { floor: 21, style: 'R', capacity: 15 },
        { floor: 21, style: 'C', capacity: 15 },
        { floor: 27, style: 'R', capacity: 15 },
        { floor: 27, style: 'C', capacity: 15 },
        { floor: 28, style: 'B', capacity: 15 },
        { floor: 29, style: 'C', capacity: 15 },
    ];

    const findOptimalExplorationParty = ({
        currentFloor,
        targetExpectation,
        requiredPower,
        ownedMegidoIds,
        megidoConditions,
        megidoDetails,
        planState,
        runState,
        seasonLogs,
        formations,
        includeGoodCondition = false,
        calculatePower,
        recommendation
    }) => {

        // 1. Determine next recovery target & calculate style budget
        let styleBudgets = { R: 99, C: 99, B: 99 };
        if (currentFloor < 29) {
            styleBudgets = { R: 0, C: 0, B: 0 };
            const nextRecoveryPoints = TWO_STEP_RECOVERY_POINTS.filter(p => p.floor > currentFloor);
            if (nextRecoveryPoints.length > 0) {
                const nextFloor = Math.min(...nextRecoveryPoints.map(p => p.floor));
                const targets = nextRecoveryPoints.filter(p => p.floor === nextFloor);
                targets.forEach(target => {
                    const fatiguedCount = Object.keys(megidoConditions).reduce((count, megidoId) => {
                        const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === megidoId);
                        if (!megidoMaster || !ownedMegidoIds.has(megidoId)) return count;
                        const styleKey = (megidoMaster.style || megidoMaster.スタイル).slice(0, 1);
                        if (styleKey === target.style) {
                            if ((megidoConditions[megidoId] || '絶好調') !== '絶好調') {
                                return count + 1;
                            }
                        }
                        return count;
                    }, 0);
                    styleBudgets[target.style] = target.capacity - fatiguedCount;
                });
            }
        }

        // 2. Create candidate pool
        const allowedConditions = ['絶好調'];
        if (includeGoodCondition) allowedConditions.push('好調');

        const plannedMegidoIds = new Set();
        Object.values(planState.assignments || {}).forEach(sq => {
            Object.values(sq).forEach(forms => {
                forms.forEach(formId => {
                    formations[formId]?.megidoSlots.forEach(slot => {
                        if (slot?.megidoId) plannedMegidoIds.add(String(slot.megidoId));
                    });
                });
            });
        });

        const candidatesWithPower = COMPLETE_MEGIDO_LIST
            .filter(megido => {
                const megidoId = String(megido.id);
                return ownedMegidoIds.has(megidoId) && 
                       !plannedMegidoIds.has(megidoId) && 
                       allowedConditions.includes(megidoConditions[megidoId] || '絶好調');
            })
            .map(megido => {
                const condition = megidoConditions[String(megido.id)] || '絶好調';
                const power = calculatePower(megido, condition, recommendation);
                return { ...megido, power };
            });

        // 3. Combination Search
        const expectationMultiplier = { 1: 1, 2: 1.2, 3: 1.4 }[targetExpectation] || 1.4;
        const targetPower = requiredPower * expectationMultiplier;

        const priorityBuckets = { 1: [], 2: [], 3: [] };
        candidatesWithPower.forEach(megido => {
            const styleKey = (megido.style || megido.スタイル).slice(0, 1);
            const budget = styleBudgets[styleKey];
            if (budget >= 3) priorityBuckets[1].push(megido);
            else if (budget > 0) priorityBuckets[2].push(megido);
            else priorityBuckets[3].push(megido);
        });

        for (const key in priorityBuckets) {
            priorityBuckets[key].sort((a, b) => b.power - a.power);
        }
        const allCandidatesSorted = [...priorityBuckets[1], ...priorityBuckets[2], ...priorityBuckets[3]];

        let foundCombinations = [];

        // Parties of 1
        for (const m of allCandidatesSorted) {
            if (m.power >= targetPower) {
                foundCombinations.push({ party: [m], totalPower: m.power, size: 1 });
            }
        }

        // Sort by power to find the ones "just over" the threshold first
        foundCombinations.sort((a, b) => a.totalPower - b.totalPower);
        if (foundCombinations.length >= 5) {
            return { success: true, combinations: foundCombinations.slice(0, 5) };
        }

        // Parties of 2
        if (allCandidatesSorted.length > 1) {
            for (let i = 0; i < allCandidatesSorted.length; i++) {
                for (let j = i + 1; j < allCandidatesSorted.length; j++) {
                    const party = [allCandidatesSorted[i], allCandidatesSorted[j]];
                    const totalPower = party[0].power + party[1].power;
                    if (totalPower >= targetPower) {
                        foundCombinations.push({ party, totalPower, size: 2 });
                    }
                }
            }
        }
        
        foundCombinations.sort((a, b) => (a.size - b.size) || (a.totalPower - b.totalPower));
        if (foundCombinations.length >= 5) {
            return { success: true, combinations: foundCombinations.slice(0, 5) };
        }

        // Parties of 3
        if (allCandidatesSorted.length > 2) {
            for (let i = 0; i < allCandidatesSorted.length; i++) {
                if (foundCombinations.length >= 5) break;
                for (let j = i + 1; j < allCandidatesSorted.length; j++) {
                    if (foundCombinations.length >= 5) break;
                    for (let k = j + 1; k < allCandidatesSorted.length; k++) {
                        const party = [allCandidatesSorted[i], allCandidatesSorted[j], allCandidatesSorted[k]];
                        const totalPower = party[0].power + party[1].power + party[2].power;
                        if (totalPower >= targetPower) {
                            foundCombinations.push({ party, totalPower, size: 3 });
                            if (foundCombinations.length >= 5) break;
                        }
                    }
                }
            }
        }

        if (foundCombinations.length > 0) {
            foundCombinations.sort((a, b) => (a.size - b.size) || (a.totalPower - b.totalPower));
            return { success: true, combinations: foundCombinations.slice(0, 5) };
        }

        return { success: false, reason: 'NO_PARTY_FOUND' };
    };

    return { findOptimalExplorationParty };
};