const ResourceDashboard = () => {
    const { runState, megidoConditions, ownedMegidoIds, planState, formations, megidoDetails, manualRecovery, onManualRecover, planConditions, isMobileView, isFooterCollapsed, handleToggleFooter, COMPLETE_MEGIDO_LIST, TOWER_MAP_DATA, CONDITION_ORDER, getStyleClass, getNextCondition, SIMULATED_CONDITION_SECTIONS, targetFloor, handleOpenRecoveryModal } = useAppContext();
    const { useMemo } = React;

    const normalizeStyleKey = (style) => {
        if (!style) return null;
        const s = String(style).trim().toLowerCase();
        const rushKeys = ['r', 'rush', 'ラッシュ'];
        const counterKeys = ['c', 'counter', 'カウンター'];
        const burstKeys = ['b', 'burst', 'バースト'];

        if (rushKeys.includes(s)) return 'R';
        if (counterKeys.includes(s)) return 'C';
        if (burstKeys.includes(s)) return 'B';

        // Fallback for partial matches, just in case
        if (s.includes('rush') || s.includes('ラッシュ')) return 'R';
        if (s.includes('counter') || s.includes('カウンター')) return 'C';
        if (s.includes('burst') || s.includes('バースト')) return 'B';
        
        return null;
    };

    const { extendedReachableFloor, allowedRetries } = useMemo(() => {
        if (!runState?.currentPosition || !TOWER_MAP_DATA || typeof AVERAGE_POWER_CONSUMPTION === 'undefined') {
            return { extendedReachableFloor: '--', allowedRetries: '--' };
        }

        const RECOVERY_FLOORS = new Set([3, 8, 13, 14, 15, 20, 23, 25, 26]);
        const getRecoveryAmount = (floor) => {
            if (floor <= 10) return 12;
            if (floor <= 20) return 14;
            if (floor <= 35) return 15;
            return 0;
        };
        const savedStatsRaw = localStorage.getItem('towerPowerStats');
        const savedStats = savedStatsRaw ? JSON.parse(savedStatsRaw) : { floorAverages: {} };

        const runOptimisticSimulation = (initialPower) => {
            let power = initialPower;
            let searchStartFloor = runState.currentPosition.floor;
            let maxReachable = searchStartFloor > 0 ? searchStartFloor - 1 : 0;
            const usedRecoveryFloors = new Set();

            for (let i = 0; i < 15; i++) { // Loop breaker to prevent infinite loops
                let currentMax = 0;
                let tempPower = power;
                let tempFloor = searchStartFloor;
                
                while(tempFloor <= 35) {
                    let cost = AVERAGE_POWER_CONSUMPTION[tempFloor] || 8;
                    const floorStats = savedStats.floorAverages[tempFloor];
                    if (floorStats && floorStats.count > 0) { cost = floorStats.totalConsumed / floorStats.count; }

                    if (tempPower >= cost) {
                        tempPower -= cost;
                        currentMax = tempFloor;
                    } else {
                        break;
                    }
                    tempFloor++;
                }
                maxReachable = currentMax;

                let recovered = false;
                for (let f = searchStartFloor; f <= maxReachable; f++) {
                    if (RECOVERY_FLOORS.has(f) && !usedRecoveryFloors.has(f)) {
                        power += getRecoveryAmount(f);
                        usedRecoveryFloors.add(f);
                        searchStartFloor = f + 1;
                        recovered = true;
                        break;
                    }
                }
                if (!recovered) break;
            }
            return maxReachable;
        };

        const extendedReachableFloor = runOptimisticSimulation(runState.towerPower);

        let retries = 0;
        const target = parseInt(targetFloor, 10);
        if (target && target >= runState.currentPosition.floor && target <= 35) {
            if (target > extendedReachableFloor) {
                retries = 0;
            } else {
                for (let n = 0; n < runState.towerPower; n++) {
                    const newReachable = runOptimisticSimulation(runState.towerPower - n);
                    if (newReachable < target) {
                        retries = n > 0 ? n - 1 : 0;
                        break;
                    }
                    if (runState.towerPower - n <= 1) {
                        retries = n;
                        break;
                    }
                }
            }
        } else {
            retries = '--';
        }

        return { extendedReachableFloor, allowedRetries: retries };

    }, [runState, targetFloor, TOWER_MAP_DATA]);


    const fatiguedMegido = useMemo(() => {
        const fatigued = { R: [], C: [], B: [] };
        if (!megidoConditions || !COMPLETE_MEGIDO_LIST) {
            return fatigued;
        }

        Object.keys(megidoConditions).forEach(id => {
            const cond = megidoConditions[id];
            if (cond && cond !== "絶好調" && ownedMegidoIds?.has(String(id))) {
                const baseId = String(id).split('_')[0]; // Extract base ID
                const m = COMPLETE_MEGIDO_LIST.find(x => String(x.id) === String(baseId));
                if (m) {
                    const styleKey = normalizeStyleKey(m.style ?? m.スタイル);
                    if (styleKey) {
                        fatigued[styleKey].push({ id: m.id, name: m.名前 ?? m.name, condition: cond });
                    }
                }
            }
        });

        const condIndex = c => CONDITION_ORDER.indexOf(c);
        fatigued.R.sort((a, b) => condIndex(b.condition) - condIndex(a.condition));
        fatigued.C.sort((a, b) => condIndex(b.condition) - condIndex(a.condition));
        fatigued.B.sort((a, b) => condIndex(b.condition) - condIndex(a.condition));
        
        return fatigued;
    }, [megidoConditions, ownedMegidoIds, COMPLETE_MEGIDO_LIST, CONDITION_ORDER]);

    const recoveryInfo = useMemo(() => {
        const result = { random: { floor: '---', distance: Infinity }, styled: { floor: '---', style: '---', distance: Infinity, capacity: 0 } };
        if (typeof TOWER_MAP_DATA === 'undefined' || !runState) return result;
        const currentFloor = runState.highestFloorReached;
        let foundRandom = false, foundStyled = false;
        for (let i = currentFloor - 1; i < TOWER_MAP_DATA.length; i++) {
            if (foundRandom && foundStyled) break;
            const floorData = TOWER_MAP_DATA[i];
            if (!floorData) continue;
            const clearedInFloor = runState.cleared[String(i + 1)] || [];
            for (const [squareId, square] of Object.entries(floorData.squares)) {
                if (square.type === 'explore' && square.sub_type === 'recovery' && !clearedInFloor.includes(squareId)) {
                    const distance = floorData.floor - currentFloor;
                    if (square.style === 'RANDOM' && !foundRandom) {
                        result.random = { floor: floorData.floor, distance };
                        foundRandom = true;
                    } else if (square.style !== 'RANDOM' && !foundStyled) {
                        const requiredPower = getRequiredExplorationPower({ ...square, floor: floorData });
                        const reward = EXPLORATION_REWARDS[requiredPower]?.[3]?.condition || '0';
                        const capacity = parseInt(reward.replace(/[^0-9]/g, '')) || 0;
                        result.styled = { floor: floorData.floor, style: square.style, distance, capacity };
                        foundStyled = true;
                    }
                }
            }
        }
        return result;
    }, [runState, TOWER_MAP_DATA]);

    if (!runState) {
        return null;
    }

    const styleMap = { "ラッシュ": "R", "カウンター": "C", "バースト": "B" };
    const styleDataMap = { 'R': 'ラッシュ', 'C': 'カウンター', 'B': 'バースト' };

    const getConditionStatusClass = (condition) => {
        switch(condition) {
            case '絶好調': return 'status-6';
            case '好調': return 'status-5';
            case '普通': return 'status-4';
            case '不調': return 'status-3';
            case '絶不調': return 'status-2';
            case '気絶': return 'status-1';
            default: return '';
        }
    };
    
    const getGaugeValue = (value, max) => Math.max(0, Math.min(100, (value / max) * 100));
    const getDistanceGaugeValue = (distance, max) => Math.max(0, Math.min(100, (1 - (distance / max)) * 100));
    
    const extendedReachableFloorValue = parseInt(extendedReachableFloor, 10);
    const allowedRetriesValue = parseInt(allowedRetries, 10);

    return (
        <footer className={`z-30 bg-background-dark/95 ios-blur border-t border-primary/20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col max-h-[65vh] shrink-0 ${isFooterCollapsed ? '' : 'is-expanded'}`}>
            <div onClick={handleToggleFooter} className="px-4 py-2 bg-card-dark/40 flex items-center justify-between gap-2 border-b border-white/5 cursor-pointer active:bg-white/5">
                <div className="grid grid-cols-2 flex-1 gap-x-3 gap-y-1">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-400">塔破力</span>
                            <span className="text-primary font-bold">{runState.towerPower || 0}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${getGaugeValue(runState.towerPower || 0, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-400">予測</span>
                            <span className="text-primary font-bold">{extendedReachableFloor}F</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/60" style={{ width: `${getGaugeValue(isNaN(extendedReachableFloorValue) ? 0 : extendedReachableFloorValue, 35)}%` }}></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-400">リタイア可</span>
                            <span className="text-primary font-bold">{allowedRetries}回</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/40" style={{ width: `${getGaugeValue(isNaN(allowedRetriesValue) ? 0 : allowedRetriesValue, 50)}%` }}></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono">
                        <span className="text-slate-500">疲労状態</span>
                        <div className="flex gap-2 font-bold">
                            <span style={{color: 'var(--rush-color)'}}>R:{fatiguedMegido.R.length}</span>
                            <span style={{color: 'var(--counter-color)'}}>C:{fatiguedMegido.C.length}</span>
                            <span style={{color: 'var(--burst-color)'}}>B:{fatiguedMegido.B.length}</span>
                        </div>
                    </div>
                </div>
                <div className="ml-1 p-1 flex flex-col items-center">
                    <span className="material-symbols-outlined text-primary text-[24px]">{isFooterCollapsed ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</span>
                    <span className="text-[6px] text-primary/60 font-bold uppercase">{isFooterCollapsed ? 'OPEN' : 'CLOSE'}</span>
                </div>
            </div>
            {!isFooterCollapsed && (
                <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
                    <section className="grid grid-cols-2 gap-2 px-2">
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-400">次のランダム回復</span>
                                <span className="text-[10px] font-bold text-white">{recoveryInfo.random.floor}F <span className="text-primary/70 text-[8px] ml-0.5">(あと{isFinite(recoveryInfo.random.distance) ? recoveryInfo.random.distance : '?'}F)</span></span>
                            </div>
                            <div className="mt-1 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-primary shadow-[0_0_8px_#70f0df]" style={{ width: `${getDistanceGaugeValue(recoveryInfo.random.distance, 10)}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] text-slate-400">次のスタイル回復</span>
                                <span className="text-[10px] font-bold text-white">{recoveryInfo.styled.floor}F <span className="text-primary/70 text-[8px] ml-0.5">({styleDataMap[recoveryInfo.styled?.style] || '?'})</span></span>
                            </div>
                            <div className="mt-1 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/30" style={{ width: `${getDistanceGaugeValue(recoveryInfo.styled.distance, 10)}%` }}></div>
                            </div>
                        </div>
                    </section>
                    <section className="grid grid-cols-3 gap-2 px-1">
                        {['ラッシュ', 'カウンター', 'バースト'].map(style => {
                            const styleKey = style.charAt(0);
                            const fatiguedList = fatiguedMegido[styleKey] || [];
                            const isClosestStyle = styleKey === (recoveryInfo.styled?.style || '').charAt(0);
                            const capacity = isClosestStyle ? recoveryInfo.styled.capacity : 0;
                            const remaining = capacity - fatiguedList.length;
                            let capacityText = '';
                            if (isClosestStyle) {
                                if (remaining >= 0) {
                                    capacityText = `残${remaining}体`;
                                } else {
                                    capacityText = `${Math.abs(remaining)}体超過`;
                                }
                            }

                            return (
                                <div key={style} className={`bg-card-dark/60 rounded-xl border ${isClosestStyle ? 'border-primary/30' : 'border-white/10'} flex flex-col min-h-[160px] overflow-hidden`}>
                                    <div className={`p-2 border-b ${isClosestStyle ? 'border-primary/20 bg-primary/10' : 'border-white/5 bg-white/5'} text-center shrink-0`}>
                                        <span className={`text-[9px] ${isClosestStyle ? 'text-primary' : 'text-slate-400'} font-bold block`}>{style}</span>
                                        <span className="text-[10px] font-bold text-white leading-none">{fatiguedList.length} / {capacity > 0 ? capacity : fatiguedList.length}</span>
                                        {isClosestStyle && <span className="text-[7px] text-primary/50 block mt-0.5">{capacityText}</span>}
                                        {manualRecovery && manualRecovery.style === styleKey && 
                                            <span className="text-[7px] text-primary block mt-0.5">手動回復: 残り{manualRecovery.points}人</span>
                                        }
                                    </div>
                                    <div className="p-1 space-y-1 overflow-y-auto style-box-scroll max-h-[120px]">
                                        {fatiguedList.length > 0 ? fatiguedList.map(m => (
                                            <div key={m.id} className={`flex flex-col gap-0.5 p-1 bg-white/5 rounded text-center border-l-2 border-${getConditionStatusClass(m.condition)}`}
                                                onClick={() => manualRecovery && manualRecovery.style === styleKey && onManualRecover(m.id)}
                                                style={{ cursor: manualRecovery && manualRecovery.style === styleKey ? 'pointer' : 'default' }}>
                                                <span className="text-[8px] truncate font-medium">{m.name}</span>
                                                <span className={`text-[7px] px-1 py-0 bg-${getConditionStatusClass(m.condition)}/20 text-${getConditionStatusClass(m.condition)} rounded-sm font-bold`}>{m.condition}</span>
                                            </div>
                                        )) : (
                                            <p className="text-slate-500 text-[8px] text-center p-2">該当なし</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                </div>
            )}
        </footer>
    );
};