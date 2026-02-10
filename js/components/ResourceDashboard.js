function ResourceDashboard() {
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
        // 目標階が設定されており、現在の階層から35階の範囲内にある場合のみ計算
        if (target && target >= runState.currentPosition.floor && target <= 35) {
            // 現在の塔破力で目標階に到達できない場合はリタイア不可
            if (target > extendedReachableFloor) {
                retries = 0;
            } else {
                // リタイア回数を1ずつ増やし、塔破力を1ずつ減らしてシミュレーション
                for (let n = 1; n <= runState.towerPower; n++) {
                    // リタイア後の塔破力で到達可能な階層を計算
                    const newReachable = runOptimisticSimulation(runState.towerPower - n);
                    // 到達可能な階層が目標階を下回ったら、その一つ前のリタイア回数が最大許容数
                    if (newReachable < target) {
                        retries = n - 1;
                        break;
                    }
                    // 塔破力が1以下になる場合は、それが限界
                    if (runState.towerPower - n <= 1) {
                         retries = n;
                         break;
                    }
                    // 最後のnまで到達できた場合
                    if (n === runState.towerPower) {
                        retries = n;
                    }
                }
            }
        } else {
            // 目標階が設定されていない場合は計算しない
            retries = '--';
        }

        return { extendedReachableFloor, allowedRetries: retries };

    }, [runState, targetFloor, TOWER_MAP_DATA]);


    const fatiguedMegido = useMemo(() => {
        const fatigued = { R: [], C: [], B: [] };
        console.log("DEBUG fatiguedMegido calculation START");
        console.log("  megidoConditions:", megidoConditions);
        console.log("  ownedMegidoIds:", ownedMegidoIds);
        console.log("  COMPLETE_MEGIDO_LIST (first 5):", COMPLETE_MEGIDO_LIST?.slice(0, 5));
        
        if (!megidoConditions || !COMPLETE_MEGIDO_LIST) {
            console.log("DEBUG: megidoConditions or COMPLETE_MEGIDO_LIST is missing.");
            return fatigued;
        }

        Object.keys(megidoConditions).forEach(id => {
            const cond = megidoConditions[id];
            const hasOwnedMegido = ownedMegidoIds?.has(String(id));
            console.log(`DEBUG: Processing Megido ID: ${id}, Condition: ${cond}, Owned: ${hasOwnedMegido}`);

            if (cond && cond !== "絶好調" && hasOwnedMegido) {
                const idStr = String(id);
                // 修正: baseId ではなく idStr を使って COMPLETE_MEGIDO_LIST を検索
                const m = COMPLETE_MEGIDO_LIST.find(x => String(x.id) === idStr);
                console.log(`  Found Megido (m) using idStr "${idStr}":`, m); // ログも修正
                
                if (m) {
                    const idParts = idStr.split('_'); // スタイル判定のために必要
                    let styleKey = null;

                    if (idParts.length > 1) {
                        const styleSuffix = idParts[1].toUpperCase();
                        if (['R', 'C', 'B'].includes(styleSuffix)) {
                            styleKey = styleSuffix;
                        }
                    }
                    
                    if (!styleKey) {
                        styleKey = normalizeStyleKey(m.style ?? m.スタイル);
                    }
                    console.log(`  Derived StyleKey: ${styleKey}`);

                    if (styleKey) {
                        fatigued[styleKey].push({ id: idStr, name: m.名前 ?? m.name, condition: cond, style: styleKey }); // スタイル情報も追加
                    }
                } else {
                    console.warn(`  WARNING: Megido with ID "${idStr}" found in megidoConditions but not in COMPLETE_MEGIDO_LIST.`);
                }
            }
        });

        const condIndex = c => CONDITION_ORDER.indexOf(c);
        fatigued.R.sort((a, b) => condIndex(b.condition) - condIndex(a.condition));
        fatigued.C.sort((a, b) => condIndex(b.condition) - condIndex(a.condition));
        fatigued.B.sort((a, b) => condIndex(b.condition) - condIndex(a.condition));
        
        console.log("DEBUG fatiguedMegido calculation END, Result:", fatigued);
        return fatigued;
    }, [megidoConditions, ownedMegidoIds, COMPLETE_MEGIDO_LIST, CONDITION_ORDER]);

    const recoveryInfo = useMemo(() => {
        const result = { 
            random: { floor: '---', distance: Infinity }, 
            styled: { 
                R: { floor: '---', distance: Infinity, capacity: 0 }, 
                C: { floor: '---', distance: Infinity, capacity: 0 }, 
                B: { floor: '---', distance: Infinity, capacity: 0 } 
            } 
        };
        if (typeof TOWER_MAP_DATA === 'undefined' || !runState) return result;
        const currentFloor = runState.highestFloorReached;
        
        // 各スタイルとランダム回復について、最初に見つかったものを記録するフラグ
        const found = { R: false, C: false, B: false, RANDOM: false }; 

        for (let i = currentFloor - 1; i < TOWER_MAP_DATA.length; i++) {
            // すべての種類の回復マスが見つかっていればループを抜ける
            if (found.R && found.C && found.B && found.RANDOM) break;

            const floorData = TOWER_MAP_DATA[i];
            if (!floorData) continue;
            const clearedInFloor = runState.cleared[String(i + 1)] || [];

            for (const [squareId, square] of Object.entries(floorData.squares)) {
                if (square.type === 'explore' && square.sub_type === 'recovery' && !clearedInFloor.includes(squareId)) {
                    const distance = floorData.floor - currentFloor;
                    
                    if (square.style === 'RANDOM' && !found.RANDOM) {
                        result.random = { floor: floorData.floor, distance };
                        found.RANDOM = true;
                    } else if (square.style !== 'RANDOM') {
                        const styleKey = square.style.charAt(0); // RUSH -> R, COUNTER -> C, BURST -> B
                        if (['R', 'C', 'B'].includes(styleKey) && !found[styleKey]) {
                            // EXPLORATION_REWARDSが未定義なので、ここも注意が必要。
                            // getRequiredExplorationPower は定義されている前提。
                            const requiredPower = getRequiredExplorationPower({ ...square, floor: floorData });
                            const reward = EXPLORATION_REWARDS[requiredPower]?.[3]?.condition || '0'; 
                            let capacity = parseInt(reward.replace(/[^0-9]/g, '')) || 0;
                            
                            result.styled[styleKey] = { floor: floorData.floor, style: styleKey, distance, capacity };
                            found[styleKey] = true;
                        }
                    }
                }
            }
        }
        console.log("DEBUG: recoveryInfo calculation END, Result:", result);
        return result;
    }, [runState, TOWER_MAP_DATA]);

    const closestStyledRecovery = useMemo(() => {
        let closest = { floor: '---', style: '---', distance: Infinity, capacity: 0 };
        // recoveryInfo.styled の R, C, B の中から最も距離が短いものを探す
        ['R', 'C', 'B'].forEach(styleKey => {
            const currentRecovery = recoveryInfo.styled[styleKey];
            if (currentRecovery.floor !== '---' && currentRecovery.distance < closest.distance) {
                closest = currentRecovery;
            }
        });
        console.log("DEBUG: closestStyledRecovery:", closest);
        return closest;
    }, [recoveryInfo.styled]);

    if (!runState) {
        return null;
    }

    const styleMap = { "ラッシュ": "R", "カウンター": "C", "バースト": "B" };
    const styleDataMap = { 'R': 'ラッシュ', 'C': 'カウンター', 'B': 'バースト' };
    const styleColorMap = { // CSS変数名をJavaScriptで使えるようにマップ
        'R': 'var(--rush-color)',
        'C': 'var(--counter-color)',
        'B': 'var(--burst-color)',
    };
    const warningColor = 'var(--warning-color)';
    const dangerColor = 'var(--danger-color)';


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

    // ヘッダーの疲労状態ゲージ用のデータ計算
    const fatigueGaugeData = useMemo(() => {
        const data = {};
        ['R', 'C', 'B'].forEach(styleKey => {
            const fatiguedCount = fatiguedMegido[styleKey]?.length || 0;
            const styledRecovery = recoveryInfo.styled[styleKey];
            let displayCapacity = styledRecovery.capacity;

            // 回復マスが見つからない場合は、一旦fatiguedCountをそのまま表示
            if (styledRecovery.floor === '---') {
                displayCapacity = fatiguedCount > 0 ? fatiguedCount : 1; // 0除算回避
            } else if (styledRecovery.floor <= 20) {
                displayCapacity = 20;
            } else { // 21階以上
                displayCapacity = 15;
            }
            
            const percentage = displayCapacity > 0 ? (fatiguedCount / displayCapacity) * 100 : 0;
            
            let color = styleColorMap[styleKey]; // スタイルに応じた色

            if (fatiguedCount > displayCapacity) {
                color = dangerColor; // 超過
            } else if (percentage > 80) {
                color = warningColor; // 80%超
            }
            
            data[styleKey] = {
                count: fatiguedCount,
                capacity: displayCapacity,
                percentage: percentage,
                color: color
            };
        });
        return data;
    }, [fatiguedMegido, recoveryInfo.styled, styleColorMap, warningColor, dangerColor]);


    return (
        <div className={`z-30 bg-background-dark/95 ios-blur border-t border-primary/20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex flex-col max-h-[65vh] shrink-0 ${isFooterCollapsed ? '' : 'is-expanded'}`}>
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
                            <span className="text-slate-400">予測リタイヤ許容数</span>
                            <span className="text-primary font-bold">{allowedRetries}回</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary/40" style={{ width: `${getGaugeValue(isNaN(allowedRetriesValue) ? 0 : allowedRetriesValue, 50)}%` }}></div>
                        </div>
                    </div>
                    {/* 疲労状態 */}
                    <div className="flex flex-col gap-0.5">
                        <div className="grid grid-cols-3 gap-1 text-[9px] w-full">
                            {['R', 'C', 'B'].map(styleKey => (
                                <div key={styleKey} className="flex justify-between items-center">
                                    <span className="font-bold" style={{color: styleColorMap[styleKey]}}>{styleKey}</span>
                                    <span className="text-white">{fatigueGaugeData[styleKey].count}<span className="text-slate-500">/{fatigueGaugeData[styleKey].capacity}</span></span>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-3 gap-1 h-1 w-full">
                            {['R', 'C', 'B'].map(styleKey => (
                                <div key={styleKey} className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${fatigueGaugeData[styleKey].percentage}%`, backgroundColor: fatigueGaugeData[styleKey].color }}></div>
                                </div>
                            ))}
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
                                <span className="text-[10px] font-bold text-white">{closestStyledRecovery.floor}F <span className="text-primary/70 text-[8px] ml-0.5">({styleDataMap[closestStyledRecovery.style] || '?'})</span></span>
                            </div>
                            <div className="mt-1 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-primary/30" style={{ width: `${getDistanceGaugeValue(closestStyledRecovery.distance, 10)}%` }}></div>
                            </div>
                        </div>
                    </section>
                    <section className="grid grid-cols-3 gap-2 px-1">
                        {['ラッシュ', 'カウンター', 'バースト'].map(fullStyleName => {
                            const styleKey = fullStyleName === 'ラッシュ' ? 'R' : fullStyleName === 'カウンター' ? 'C' : 'B';
                            const fatiguedList = fatiguedMegido[styleKey] || [];
                            const styledRecovery = recoveryInfo.styled[styleKey]; // 各スタイルごとの回復情報
                            let originalCapacity = styledRecovery.capacity; // 元の回復できるメギド数

                            let displayCapacity = originalCapacity;
                            // ユーザーの要望「階数に応じて回復期待値を固定」を適用
                            if (styledRecovery.floor !== '---') { // 回復マスが見つかっている場合
                                if (styledRecovery.floor <= 20) { // 20階以下の場合
                                    displayCapacity = 20; // 一律20と表示
                                } else { // 21階以上の場合
                                    displayCapacity = 15; // 一律15と表示
                                }
                            }

                            // ここで displayCapacity を使用
                            const capacity = displayCapacity;
                            const isClosestStyle = styledRecovery.floor !== '---';
                            
                            let capacityText = '';
                            if (isClosestStyle) {
                                const remaining = capacity - fatiguedList.length;
                                if (remaining >= 0) {
                                    capacityText = `残${remaining}体`;
                                } else {
                                    capacityText = `${Math.abs(remaining)}体超過`;
                                }
                            }

                            // ゲージの色を決定
                            const percentage = capacity > 0 ? (fatiguedList.length / capacity) * 100 : 0;
                            let gaugeColor = styleColorMap[styleKey];
                            if (fatiguedList.length > capacity) {
                                gaugeColor = dangerColor;
                            } else if (percentage > 80) {
                                gaugeColor = warningColor;
                            }

                            return (
                                <div key={fullStyleName} className={`bg-card-dark/60 rounded-xl border ${isClosestStyle ? 'border-primary/30' : 'border-white/10'} flex flex-col min-h-[160px] overflow-hidden`}>
                                    <div className={`p-2 border-b ${isClosestStyle ? 'border-primary/20 bg-primary/10' : 'border-white/5 bg-white/5'} text-center shrink-0`}>
                                        <span className={`text-[9px] ${isClosestStyle ? 'text-primary' : 'text-slate-400'} font-bold block`}>{fullStyleName}</span>
                                        <span className="text-[10px] font-bold text-white leading-none">{fatiguedList.length} / {capacity > 0 ? capacity : fatiguedList.length}</span>
                                        {isClosestStyle && <span className="text-[7px] text-primary/50 block mt-0.5">{capacityText}</span>}
                                        {manualRecovery && manualRecovery.style === styleKey && 
                                            <span className="text-[7px] text-primary block mt-0.5">手動回復: 残り{manualRecovery.points}人</span>
                                        }
                                        {/* 回復可能数ゲージ */}
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                                            <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: gaugeColor }}></div>
                                        </div>
                                    </div>
                                    <div className="p-1 space-y-1 overflow-y-auto style-box-scroll max-h-[120px]">
                                        {fatiguedList.length > 0 ? fatiguedList.map(m => (
                                            <div key={m.id} className={`flex flex-col gap-0.5 p-1 bg-white/5 rounded text-center border-l-2`}
                                                onClick={() => manualRecovery && manualRecovery.style === styleKey && onManualRecover(m.id)}
                                                style={{ cursor: manualRecovery && manualRecovery.style === styleKey ? 'pointer' : 'default', borderColor: `var(--${styleDataMap[m.style]?.toLowerCase()}-color)`, backgroundColor: `var(--${styleDataMap[m.style]?.toLowerCase()}-color)0F` }}>
                                                <span className="text-[8px] truncate font-medium" style={{ color: `var(--${styleDataMap[m.style]?.toLowerCase()}-color)` }}>{m.name}</span>
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
        </div>
    );
}

window.ResourceDashboard = ResourceDashboard;