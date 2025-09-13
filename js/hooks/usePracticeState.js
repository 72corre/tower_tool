const usePracticeState = ({
    megidoDetails,
    ownedMegidoIds,
    showToastMessage,
    unlockAchievement,
    logAction,
    floorRefs,
    setSelectedSquare,
    setModalState,
    setRecoveryModalState,
    setChoiceModalState,
    setStatusBuffModalState,
    updateGuidance,
    floorClearCounts,
    setFloorClearCounts,
    winStreak,
    setWinStreak,
    setActiveTab,
    isLoading
}) => {
    const { useState, useEffect, useCallback } = React;

    const [megidoConditions, setMegidoConditions] = useState({});
    const [runState, setRunState] = useState({
        cleared: {},
        highestFloorReached: 1,
        history: [],
        towerPower: 30,
        recommendations: {},
        explorationFatigue: [],
        floorEntryPower: { '1': 30 },
        powerRecoveredOnFloor: {},
        totalPowerRecovered: 0
    });
    const [manualRecovery, setManualRecovery] = useState(null);
    const [historyStack, setHistoryStack] = useState([]);

    const CONDITION_LEVELS = ['絶好調', '好調', '普通', '不調', '絶不調', '気絶'];
    const CONDITION_ORDER = ['気絶', '絶不調', '不調', '普通', '好調', '絶好調'];

    const updateMegidoConditions = useCallback((megidoIds, change) => {
        setMegidoConditions(prevConditions => {
            const newConditions = { ...prevConditions };
            const messages = [];
            megidoIds.forEach(id => {
                if (!id) return;
                const megidoData = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(id));
                if (!megidoData) return;

                const oldCondition = newConditions[id] || '絶好調';
                const oldIndex = CONDITION_LEVELS.indexOf(oldCondition);
                const newIndex = Math.max(0, Math.min(CONDITION_LEVELS.length - 1, oldIndex + change));
                const newCondition = CONDITION_LEVELS[newIndex];

                if (oldCondition !== newCondition) {
                    newConditions[id] = newCondition;
                    const changeAmount = Math.abs(oldIndex - newIndex);
                    const changeText = change > 0 ? `${changeAmount}段階低下` : `${changeAmount}段階回復`;
                    messages.push(`${megidoData.名前}: ${oldCondition}→${newCondition} (${changeText})`);
                }
            });

            if (messages.length > 0) {
                showToastMessage(messages.join('\n'));
            }

            return messages.length > 0 ? newConditions : prevConditions;
        });
    }, [showToastMessage]);

    const handleConditionRecovery = useCallback((style, capacity, floor) => {
        const recoveryAmount = floor <= 20 ? -1 : -2;
        const targetStyleKey = style.slice(0, 1);

        const fatiguedMegido = Object.keys(megidoConditions)
            .map(id => {
                const m = COMPLETE_MEGIDO_LIST.find(x => String(x.id) === String(id));
                const cond = megidoConditions[id];
                if (m && cond !== '絶好調' && ownedMegidoIds.has(id)) {
                    const megidoStyle = m.style ?? m.スタイル;
                    if (megidoStyle) {
                        const styleKey = megidoStyle.includes('ラッシュ') ? 'R' : megidoStyle.includes('カウンター') ? 'C' : 'B';
                        if (styleKey === targetStyleKey) {
                            return { id, name: m.名前, condition: cond, style: styleKey };
                        }
                    }
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => CONDITION_ORDER.indexOf(b.condition) - CONDITION_ORDER.indexOf(a.condition));

        if (fatiguedMegido.length <= capacity) {
            const idsToRecover = fatiguedMegido.map(m => m.id);
            updateMegidoConditions(idsToRecover, recoveryAmount);
            showToastMessage(`${style}の疲労メギド${idsToRecover.length}体を回復しました。`);
        } else {
            let remainingCapacity = capacity;
            const recoveredIds = new Set();
            const conditionGroups = CONDITION_LEVELS.slice(1).reverse();

            for (const cond of conditionGroups) {
                if (remainingCapacity <= 0) break;
                const group = fatiguedMegido.filter(m => m.condition === cond);
                if (group.length > 0 && group.length <= remainingCapacity) {
                    const idsInGroup = group.map(m => m.id);
                    updateMegidoConditions(idsInGroup, recoveryAmount);
                    idsInGroup.forEach(id => recoveredIds.add(id));
                    remainingCapacity -= group.length;
                } else if (group.length > 0 && group.length > remainingCapacity) {
                    setManualRecovery({ style: targetStyleKey, points: remainingCapacity, recoveryAmount: recoveryAmount });
                    showToastMessage(`${recoveredIds.size}体を自動回復しました。残り${remainingCapacity}人分は手動で選択してください。`);
                    return;
                }
            }
            if (recoveredIds.size > 0) {
                showToastMessage(`${recoveredIds.size}体を自動回復しました。`);
            }
        }
    }, [megidoConditions, ownedMegidoIds, showToastMessage, updateMegidoConditions]);

    const handleResolveSquare = useCallback((result, data, square) => {
        setHistoryStack(prev => [...prev, { runState, megidoConditions }]);
        let newRunState = { ...runState };
        const isBoss = square.square.type === 'boss';
        const hasBeenAttempted = newRunState.history.some(h => h.squareId === square.id && h.type === 'battle');
        const cost = isBoss && !hasBeenAttempted ? 0 : 1;
        if (newRunState.towerPower < cost) {
            showToastMessage('塔破力が足りません。');
            return;
        }
        newRunState.towerPower -= cost;
        switch (result) {
            case 'explore': {
                logAction('EXPLORE', { sub_type: square.square.sub_type });
                const megidoIds = data.party.map(m => m.id);
                updateMegidoConditions(megidoIds, 2);
                newRunState.explorationFatigue = [...new Set([...newRunState.explorationFatigue, ...megidoIds])];
                
                const floorNum = String(square.floor.floor);
                const oldClearedFloor = newRunState.cleared[floorNum] || [];
                newRunState.cleared = {
                    ...newRunState.cleared,
                    [floorNum]: [...oldClearedFloor, square.id]
                };

                newRunState.history = [...newRunState.history, {
                    type: 'explore',
                    squareId: square.id,
                    floor: floorNum,
                    megido: megidoIds,
                    totalPower: data.totalPower,
                    requiredPower: data.requiredPower,
                    expectationLevel: data.expectationLevel,
                    timestamp: new Date().toISOString()
                }];
                showToastMessage('探索完了');
                break;
            }
            case 'win': {
                setWinStreak(s => s + 1);
                const megidoIds = data.megido.filter(m => m).map(m => m.id);
                const isLowCondition = megidoIds.some(id => (CONDITION_LEVELS.indexOf(megidoConditions[id] || '絶好調') >= 3));
                logAction('COMBAT_RESULT', { result: 'win', isLowCondition });

                updateMegidoConditions(megidoIds, 1);
                const floorNum = String(square.floor.floor);
                const oldClearedFloor = newRunState.cleared[floorNum] || [];
                newRunState.cleared = {
                    ...newRunState.cleared,
                    [floorNum]: [...oldClearedFloor, square.id]
                };
                newRunState.history = [...newRunState.history, {
                    type: 'battle',
                    result: 'win',
                    squareId: square.id,
                    floor: floorNum,
                    formationId: data.id,
                    timestamp: new Date().toISOString()
                }];
                showToastMessage('勝利！');
                if (square.square.type === 'boss') {
                    const newCounts = { ...floorClearCounts };
                    newCounts[floorNum] = (newCounts[floorNum] || 0) + 1;
                    setFloorClearCounts(newCounts);
                    logAction('BOSS_DEFEAT', { floor: square.floor.floor, towerPower: newRunState.towerPower });

                    const currentFloor = parseInt(floorNum, 10);
                    const entryPower = runState.floorEntryPower[currentFloor] || 30;
                    const recoveredOnFloor = runState.powerRecoveredOnFloor[currentFloor] || 0;
                    const consumedOnFloor = entryPower - newRunState.towerPower + recoveredOnFloor;

                    const statsKey = 'towerPowerStats';
                    const savedStatsRaw = localStorage.getItem(statsKey);
                    const savedStats = savedStatsRaw ? JSON.parse(savedStatsRaw) : { runs: [], floorAverages: {} };

                    const floorStats = savedStats.floorAverages[currentFloor] || { totalConsumed: 0, count: 0 };
                    floorStats.totalConsumed += consumedOnFloor;
                    floorStats.count += 1;
                    savedStats.floorAverages[currentFloor] = floorStats;

                    if (currentFloor === 35) {
                        const totalConsumedInRun = 30 - newRunState.towerPower + (newRunState.totalPowerRecovered || 0);
                        savedStats.runs.push({ totalConsumed: totalConsumedInRun });
                    }

                    localStorage.setItem(statsKey, JSON.stringify(savedStats));

                    const nextFloorNum = Number(floorNum) + 1;
                    if (nextFloorNum <= 35) {
                        const nextFloorData = TOWER_MAP_DATA.find(f => f.floor === nextFloorNum);
                        if (nextFloorData) {
                            const nextFloorStartSquare = Object.keys(nextFloorData.squares).find(key => nextFloorData.squares[key].type === 'start');
                            if (nextFloorStartSquare) {
                                const oldClearedNextFloor = newRunState.cleared[nextFloorNum] || [];
                                newRunState.cleared = {
                                    ...newRunState.cleared,
                                    [nextFloorNum]: [...oldClearedNextFloor, nextFloorStartSquare]
                                };
                                newRunState.highestFloorReached = nextFloorNum;
                                newRunState.currentPosition = { floor: nextFloorNum, squareId: nextFloorStartSquare };
                                newRunState.floorEntryPower = {
                                    ...newRunState.floorEntryPower,
                                    [nextFloorNum]: newRunState.towerPower
                                };
                                if (floorRefs.current[nextFloorNum]) {
                                    setTimeout(() => {
                                        floorRefs.current[nextFloorNum].scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 'lose': {
                const megidoIds = data.megido.filter(m => m).map(m => m.id);
                const isLowCondition = megidoIds.some(id => (CONDITION_LEVELS.indexOf(megidoConditions[id] || '絶好調') >= 3));
                logAction('COMBAT_RESULT', { result: 'lose', isLowCondition });

                updateMegidoConditions(megidoIds, 2);
                newRunState.history = [...newRunState.history, {
                    type: 'battle',
                    result: 'lose',
                    squareId: square.id,
                    floor: String(square.floor.floor),
                    formationId: data.id,
                    timestamp: new Date().toISOString()
                }];
                showToastMessage('敗北...');
                break;
            }
            case 'retreat': {
                setWinStreak(0);
                const megidoIds = data.megido.filter(m => m).map(m => m.id);
                const isLowCondition = megidoIds.some(id => (CONDITION_LEVELS.indexOf(megidoConditions[id] || '絶好調') >= 3));
                logAction('COMBAT_RESULT', { result: 'retreat', isLowCondition });

                newRunState.history = [...newRunState.history, {
                    type: 'battle',
                    result: 'retreat',
                    squareId: square.id,
                    floor: String(square.floor.floor),
                    formationId: data.id,
                    timestamp: new Date().toISOString()
                }];
                showToastMessage('戦闘を棄権しました。');
                break;
            }
            default:
                break;
        }
        
        setRunState(newRunState);
        localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify(newRunState));

        if (result === 'explore') {
            const squareSubType = square.square.sub_type;
            const squareStyle = square.square.style;

            if (squareSubType === 'tower_power') { 
                setModalState({ isOpen: true, title: '塔破力回復', message: '回復した塔破力の値を入力してください。', onConfirm: (amountStr) => { 
                    const amount = parseInt(amountStr, 10);
                    if (!isNaN(amount) && amount > 0) { 
                        setRunState(prev => { 
                            const currentFloor = prev.currentPosition.floor;
                            const newState = { 
                                ...prev, 
                                towerPower: prev.towerPower + amount,
                                totalPowerRecovered: (prev.totalPowerRecovered || 0) + amount,
                                powerRecoveredOnFloor: {
                                    ...prev.powerRecoveredOnFloor,
                                    [currentFloor]: (prev.powerRecoveredOnFloor?.[currentFloor] || 0) + amount
                                }
                            }; 
                            localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify(newState)); 
                            return newState; 
                        }); 
                        showToastMessage(`塔破力が${amount}回復しました。`); 
                    } 
                    setModalState(prev => ({ ...prev, isOpen: false })); 
                } });
            } else if (squareSubType === 'recovery') {
                if (squareStyle === 'RANDOM') {
                    setRecoveryModalState({
                        isOpen: true,
                        title: 'ランダムコンディション回復',
                        message: 'ゲーム内で指定された回復スタイルを選択し、回復可能な人数を入力してください。',
                        onConfirm: (styleKey, capacity) => {
                            if (styleKey && !isNaN(capacity) && capacity > 0) {
                                const fullStyleName = styleKey === 'R' ? 'RUSH' : styleKey === 'C' ? 'COUNTER' : 'BURST';
                                handleConditionRecovery(fullStyleName, capacity, square.floor.floor);
                            }
                            setRecoveryModalState({ isOpen: false });
                        }
                    });
                } else {
                    setModalState({
                        isOpen: true,
                        title: 'コンディション回復',
                        message: '回復可能な人数を入力してください。',
                        onConfirm: (capacity) => {
                            if (!isNaN(capacity) && capacity > 0) {
                                handleConditionRecovery(square.square.style, capacity, square.floor.floor);
                            }
                            setModalState(prev => ({ ...prev, isOpen: false }));
                        }
                    });
                }
            } else if (['status_buff', 'attack_buff', 'defense_buff', 'hp_buff'].includes(squareSubType)) {
                setStatusBuffModalState({
                    isOpen: true,
                    expectationLevel: data.expectationLevel,
                    onConfirm: ({ buffType, buffValue, towerPowerRecovery }) => {
                        // 1. Record the buff in history
                        setRunState(prev => {
                            const lastHistoryIndex = prev.history.length - 1;
                            if (lastHistoryIndex < 0) return prev;
                            
                            const newHistory = [...prev.history];
                            newHistory[lastHistoryIndex] = {
                                ...newHistory[lastHistoryIndex],
                                exploreResult: {
                                    type: buffType,
                                    value: buffValue
                                }
                            };
                            const newState = { ...prev, history: newHistory };
                            localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify(newState));
                            return newState;
                        });
                        const buffLabelMap = { 'attack_buff': '攻撃力アップ', 'defense_buff': '防御力アップ', 'hp_buff': 'HPアップ' };
                        showToastMessage(`${buffLabelMap[buffType]} (+${buffValue}%) を記録しました。`);

                        // 2. If there's tower power to recover, recover it (allows 0)
                        if (towerPowerRecovery >= 0) {
                            setRunState(prev => {
                                if (towerPowerRecovery === 0) return prev; // No change, no state update
                                const currentFloor = prev.currentPosition.floor;
                                const newState = {
                                    ...prev,
                                    towerPower: prev.towerPower + towerPowerRecovery,
                                    totalPowerRecovered: (prev.totalPowerRecovered || 0) + towerPowerRecovery,
                                    powerRecoveredOnFloor: {
                                        ...prev.powerRecoveredOnFloor,
                                        [currentFloor]: (prev.powerRecoveredOnFloor?.[currentFloor] || 0) + towerPowerRecovery
                                    }
                                };
                                localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify(newState));
                                return newState;
                            });
                            if (towerPowerRecovery > 0) {
                               showToastMessage(`塔破力が${towerPowerRecovery}回復しました。`);
                            }
                        }
                    }
                });
            }
        }

        setSelectedSquare(null);
        localStorage.removeItem('ui_selectedSquareKey');
    }, [runState, megidoConditions, showToastMessage, logAction, updateMegidoConditions, setWinStreak, floorClearCounts, setFloorClearCounts, setSelectedSquare, setModalState, setRecoveryModalState, updateGuidance, handleConditionRecovery, floorRefs]);

    const handleUndo = useCallback(() => {
        if (historyStack.length === 0) {
            showToastMessage('アンドゥできる操作がありません。');
            return;
        }

        const lastState = historyStack[historyStack.length - 1];
        setRunState(lastState.runState);
        setMegidoConditions(lastState.megidoConditions);
        setHistoryStack(prev => prev.slice(0, -1));
        showToastMessage('直前の操作をアンドゥしました。');

    }, [historyStack, showToastMessage]);

    const handleManualRecovery = useCallback((megidoId) => {
        if (!manualRecovery) return;

        const megido = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(megidoId));
        if (!megido) return;

        const megidoStyle = megido.style ?? megido.スタイル;
        if (!megidoStyle) return;
        
        const megidoStyleKey = megidoStyle.includes('ラッシュ') ? 'R' : megidoStyle.includes('カウンター') ? 'C' : 'B';

        if (megidoStyleKey === manualRecovery.style) {
            updateMegidoConditions([megidoId], manualRecovery.recoveryAmount);
            const newPoints = manualRecovery.points - 1;
            if (newPoints > 0) {
                setManualRecovery({ ...manualRecovery, points: newPoints });
            } else {
                setManualRecovery(null);
                showToastMessage('手動回復を完了しました。');
            }
        }
    }, [manualRecovery, updateMegidoConditions, showToastMessage]);

    const handleResetRun = useCallback((isInitialBoot = false) => {
        const confirmReset = isInitialBoot ? true : window.confirm('本当に今回の挑戦をリセットしますか？\nコンディション、実践モードの進捗が初期化されます。');
        if (confirmReset) {
            unlockAchievement('RESET_RUN');
            setHistoryStack([]);
            const newRecommendations = {};
            if (typeof TOWER_MAP_DATA !== 'undefined') {
                TOWER_MAP_DATA.forEach(floor => {
                    Object.entries(floor.squares).forEach(([squareId, square]) => {
                        if (square.type === 'explore') {
                            newRecommendations[squareId] = RECOMMENDATION_TYPES[Math.floor(Math.random() * RECOMMENDATION_TYPES.length)];
                        }
                    });
                });
            }
            const initialRunState = { cleared: { '1': ['f1-s'] }, highestFloorReached: 1, history: [], towerPower: 30, recommendations: newRecommendations, currentPosition: { floor: 1, squareId: 'f1-s' }, explorationFatigue: [], floorEntryPower: { '1': 30 }, powerRecoveredOnFloor: {}, totalPowerRecovered: 0 };
            setRunState(initialRunState);
            localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify(initialRunState));
            const initialConditions = {};
            if (typeof COMPLETE_MEGIDO_LIST !== 'undefined') {
                Object.keys(megidoDetails).forEach(id => {
                    if(megidoDetails[id]?.owned) initialConditions[id] = '絶好調';
                });
            }
            setMegidoConditions(initialConditions);
            localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録_conditions`, JSON.stringify(initialConditions));
            setSelectedSquare(null);
            localStorage.removeItem('ui_selectedSquareKey');
            if (!isInitialBoot) {
                setActiveTab('ownership');
                showToastMessage('挑戦状況をリセットしました。');
            }
        }
    }, [unlockAchievement, megidoDetails, setSelectedSquare, showToastMessage, setActiveTab]);

    useEffect(() => {
        if (isLoading) return;
        const date = new Date();
        const conditionsSeasonKey = `${date.getFullYear()}年${date.getMonth() + 1}月シーズンの記録_conditions`;
        const savedConditions = localStorage.getItem(conditionsSeasonKey);
        if (savedConditions) {
            setMegidoConditions(JSON.parse(savedConditions));
        } else {
            const initialConditions = {};
            Object.keys(megidoDetails).forEach(id => {
                if(megidoDetails[id]?.owned) initialConditions[id] = '絶好調';
            });
            setMegidoConditions(initialConditions);
        }
        
        const seasonKey = `${date.getFullYear()}年${date.getMonth() + 1}月シーズンの記録`;
        const savedRun = localStorage.getItem(seasonKey);
        if (savedRun) {
            const parsedRun = JSON.parse(savedRun);
            if (!parsedRun.towerPower) parsedRun.towerPower = 30;
            if (!parsedRun.recommendations) parsedRun.recommendations = {};
            if (!parsedRun.currentPosition) parsedRun.currentPosition = { floor: 1, squareId: 'f1-s' };
            if (!parsedRun.explorationFatigue) parsedRun.explorationFatigue = [];
            if (!parsedRun.floorEntryPower) parsedRun.floorEntryPower = { '1': 30 };
            if (!parsedRun.powerRecoveredOnFloor) parsedRun.powerRecoveredOnFloor = {};
            if (!parsedRun.totalPowerRecovered) parsedRun.totalPowerRecovered = 0;
            setRunState(parsedRun);
        } else {
            handleResetRun(true);
        }
    }, [isLoading, megidoDetails]);

    useEffect(() => {
        if (Object.keys(megidoConditions).length > 0) {
            const date = new Date();
            const seasonKey = `${date.getFullYear()}年${date.getMonth() + 1}月シーズンの記録_conditions`;
            localStorage.setItem(seasonKey, JSON.stringify(megidoConditions));
        }
    }, [megidoConditions]);

    return {
        runState,
        setRunState,
        megidoConditions,
        setMegidoConditions,
        manualRecovery,
        setManualRecovery,
        handleResolveSquare,
        handleResetRun,
        handleManualRecovery,
        handleConditionRecovery,
        handleUndo
    };
};
