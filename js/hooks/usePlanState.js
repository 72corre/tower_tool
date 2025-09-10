const usePlanState = ({ formations, megidoDetails, mode, showToastMessage }) => {
    const { useState, useEffect } = React;

    const [planState, setPlanState] = useState(() => {
        const saved = localStorage.getItem('planState');
        const defaultState = { assignments: {}, activeFloor: 1, explorationAssignments: {} };
        if (!saved) return defaultState;
        const parsed = JSON.parse(saved);
        if (!parsed.explorationAssignments) parsed.explorationAssignments = {};
        return parsed;
    });

    const [planConditions, setPlanConditions] = useState({ fatigueByGroup: {}, megidoConditionsBySection: {} });

    useEffect(() => {
        if (mode !== 'plan') return;

        const fatigueByGroup = {};
        const megidoConditionsBySection = {};
        Object.entries(SIMULATED_CONDITION_SECTIONS).forEach(([style, sections]) => {
            sections.forEach(section => {
                const groupKey = `${section.start}-${section.end}`;
                fatigueByGroup[groupKey] = { used: 0, capacity: section.limit, style: style };
                megidoConditionsBySection[groupKey] = {};
            });
        });

        const megidoUsage = {};
        for (const [fullSquareId, enemyAssignments] of Object.entries(planState.assignments || {})) {
            const parts = fullSquareId.split('-');
            const floor = parseInt(parts[0], 10);
            const squareId = parts.slice(1).join('-');
            for (const formationSlots of Object.values(enemyAssignments)) {
                for (const formationId of formationSlots) {
                    if (!formationId) continue;
                    const formation = formations.find(f => f.id === formationId);
                    if (formation && formation.megido) {
                        formation.megido.forEach(m => {
                            if (m && m.id) {
                                const id = String(m.id);
                                if (!megidoUsage[id]) megidoUsage[id] = [];
                                if (!megidoUsage[id].some(u => u.squareId === squareId && u.type === 'combat')) {
                                    megidoUsage[id].push({ floor, squareId, type: 'combat' });
                                }
                            }
                        });
                    }
                }
            }
        }
        for (const [squareId, explorationParties] of Object.entries(planState.explorationAssignments || {})) {
            const floor = parseInt(squareId.split('-')[0].replace('f', ''));
            for (const party of Object.values(explorationParties)) {
                if (party && Array.isArray(party)) {
                    party.forEach(megidoId => {
                        if (megidoId) {
                            const id = String(megidoId);
                            if (!megidoUsage[id]) megidoUsage[id] = [];
                            if (!megidoUsage[id].some(u => u.squareId === squareId && u.type === 'explore')) {
                                megidoUsage[id].push({ floor, squareId, type: 'explore' });
                            }
                        }
                    });
                }
            }
        }


        const finalFatigueState = {};
        const ownedMegido = Object.keys(megidoDetails).filter(id => megidoDetails[id]?.owned);
        ownedMegido.forEach(id => finalFatigueState[id] = 0);

        const styleOrder = ['rush', 'counter', 'burst'];
        const styleKeyMap = { 'ラッシュ': 'rush', 'カウンター': 'counter', 'バースト': 'burst' };

        styleOrder.forEach(style => {
            const sections = SIMULATED_CONDITION_SECTIONS[style];
            if (!sections) return;

            for (const section of sections) {
                const groupKey = `${section.start}-${section.end}`;
                const megidoUsedInThisSection = new Set();

                // Apply recovery at the START of the section
                const recoveryAmount = section.start >= 21 ? 2 : 1;
                const extraRecovery = (style === 'burst' && section.start === 19) ? 2 : 0;
                ownedMegido.forEach(id => {
                    const megidoInfo = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === id);
                    const megidoStyle = megidoInfo ? (megidoInfo.style ?? megidoInfo.スタイル) : null;
                    if (megidoInfo && megidoStyle && styleKeyMap[megidoStyle] === style) {
                        finalFatigueState[id] = Math.max(0, finalFatigueState[id] - recoveryAmount - extraRecovery);
                    }
                });

                // Calculate fatigue for this section
                for (let floor = section.start; floor <= section.end; floor++) {
                    for (const megidoId in megidoUsage) {
                        const megidoInfo = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === megidoId);
                        const megidoStyle = megidoInfo ? (megidoInfo.style ?? megidoInfo.スタイル) : null;
                        if (!megidoStyle || styleKeyMap[megidoStyle] !== style) continue;

                        const usagesOnThisFloor = megidoUsage[megidoId].filter(u => u.floor === floor);
                        if (usagesOnThisFloor.length > 0) {
                            megidoUsedInThisSection.add(megidoId);
                            usagesOnThisFloor.forEach(usage => {
                                const conditionDrop = usage.type === 'explore' ? 2 : 1;
                                finalFatigueState[megidoId] += conditionDrop;
                            });
                        }
                    }
                }

                // Update display data for this section to show all fatigued megido of the correct style
                fatigueByGroup[groupKey].used = megidoUsedInThisSection.size;
                ownedMegido.forEach(megidoId => {
                    const megidoInfo = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === megidoId);
                    const megidoStyle = megidoInfo ? (megidoInfo.style ?? megidoInfo.スタイル) : null;
                    if (megidoInfo && megidoStyle && styleKeyMap[megidoStyle] === style) {
                        // Only show if not in peak condition
                        if (finalFatigueState[megidoId] > 0) {
                            megidoConditionsBySection[groupKey][megidoId] = {
                                fatigue: finalFatigueState[megidoId],
                                megido: megidoInfo
                            };
                        }
                    }
                });
            }
        });

        setPlanConditions({ fatigueByGroup, megidoConditionsBySection });
    }, [planState, formations, megidoDetails, mode]);

    const onPlanExplorationParty = (squareId, recType, party) => {
        const newPlanState = {
            ...planState,
            explorationAssignments: {
                ...planState.explorationAssignments,
                [squareId]: {
                    ...(planState.explorationAssignments[squareId] || {}),
                    [recType]: party
                }
            }
        };
        setPlanState(newPlanState);
        localStorage.setItem('planState', JSON.stringify(newPlanState));
        showToastMessage('探索計画を更新しました。');
    };

    const handlePlanCombatParty = (squareId, enemyName, slotIndex, formationId) => {
        const currentAssignments = planState.assignments || {};
        const newAssignmentsForSquare = { ...(currentAssignments[squareId] || {}) };
        const newSlotsForEnemy = [...(newAssignmentsForSquare[enemyName] || Array(3).fill(null))];

        // Remove duplicates if a formation is being assigned (not removed)
        if (formationId) {
            const existingIndex = newSlotsForEnemy.indexOf(formationId);
            // If it exists in a DIFFERENT slot, remove it from the old slot
            if (existingIndex > -1 && existingIndex !== slotIndex) {
                newSlotsForEnemy[existingIndex] = null;
            }
        }
        newSlotsForEnemy[slotIndex] = formationId;

        const newPlanState = {
            ...planState,
            assignments: {
                ...currentAssignments,
                [squareId]: {
                    ...newAssignmentsForSquare,
                    [enemyName]: newSlotsForEnemy
                }
            }
        };
        setPlanState(newPlanState);
        localStorage.setItem('planState', JSON.stringify(newPlanState));
        showToastMessage('戦闘計画を更新しました。');
    };

    return {
        planState,
        setPlanState,
        planConditions,
        onPlanExplorationParty,
        handlePlanCombatParty
    };
};