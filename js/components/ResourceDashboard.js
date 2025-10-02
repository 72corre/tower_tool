const ResourceDashboard = () => {
    const { runState, megidoConditions, ownedMegidoIds, planState, formations, mode, megidoDetails, manualRecovery, onManualRecover, planConditions, isMobileView, isFooterCollapsed, handleToggleFooter, COMPLETE_MEGIDO_LIST, TOWER_MAP_DATA, CONDITION_ORDER, getStyleClass, getNextCondition, SIMULATED_CONDITION_SECTIONS } = useAppContext();

    const normalizeStyleKey = (style) => {
        if (!style) return null;
        const s = String(style).toLowerCase();
        if (s === 'r' || s.includes('rush') || s.includes('ラッシュ')) return 'R';
        if (s === 'c' || s.includes('counter') || s.includes('カウンター')) return 'C';
        if (s === 'b' || s.includes('burst') || s.includes('バースト')) return 'B';
        return null;
    };

    const fatiguedMegido = useMemo(() => {
        const fatigued = { R: [], C: [], B: [] };
        if (mode !== 'practice' || !megidoConditions) {
            return fatigued;
        }

        Object.keys(megidoConditions).forEach(id => {
            const cond = megidoConditions[id];
            if (cond && cond !== "絶好調" && ownedMegidoIds?.has(String(id))) {
                const m = COMPLETE_MEGIDO_LIST.find(x => String(x.id) === String(id));
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
    }, [megidoConditions, ownedMegidoIds, mode]);

    const recoveryInfo = useMemo(() => {
        const result = { random: { floor: '---', distance: Infinity }, styled: { floor: '---', style: '---', distance: Infinity, capacity: 0 } };
        if (mode !== 'practice' || typeof TOWER_MAP_DATA === 'undefined' || !runState) return result;
        const currentFloor = runState.highestFloorReached;
        let foundRandom = false, foundStyled = false;
        for (let i = currentFloor - 1; i < TOWER_MAP_DATA.length; i++) {
            if (foundRandom && foundStyled) break;
            const floorData = TOWER_MAP_DATA[i];
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
    }, [runState, mode]);

    if ((mode === 'practice' && !runState) || (mode === 'plan' && !planConditions)) {
        return null; // or a loading indicator
    }

    const styleMap = { "ラッシュ": "R", "カウンター": "C", "バースト": "B" };
    const styleDataMap = { 'R': 'ラッシュ', 'C': 'カウンター', 'B': 'バースト' };

    const renderPracticeMode = () => {
        const closestStyledRecoveryStyle = styleDataMap[recoveryInfo.styled?.style] || recoveryInfo.styled?.style;
        return (
            <>
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <span style={{ marginLeft: '16px' }}>次のランダム回復: <span style={{ fontWeight: 700 }}>{recoveryInfo.random.floor}F</span> (あと{isFinite(recoveryInfo.random.distance) ? recoveryInfo.random.distance : '?'}F)</span>
                    <span style={{ marginLeft: '16px' }}>次のスタイル回復: <span style={{ fontWeight: 700 }}>{recoveryInfo.styled.floor}F ({closestStyledRecoveryStyle})</span> (あと{isFinite(recoveryInfo.styled.distance) ? recoveryInfo.styled.distance : '?'}F)</span>
                </div>
                <div className="fatigue-container" style={{ gridColumn: '1 / -1' }}>
                    {['ラッシュ', 'カウンター', 'バースト'].map(style => {
                        const styleKey = styleMap[style];
                        const isClosestStyle = style === closestStyledRecoveryStyle;
                        const fatiguedList = fatiguedMegido[styleKey] || [];
                        const capacity = isClosestStyle ? recoveryInfo.styled.capacity : 0;
                        const remaining = capacity - fatiguedList.length;
                        let capacityText = '', textColor = 'var(--text-subtle)';
                        if (isClosestStyle) {
                            if (remaining >= 0) {
                                capacityText = `(あと${remaining}体)`;
                                textColor = 'var(--success-color)';
                            } else {
                                capacityText = `(${Math.abs(remaining)}体超過)`;
                                textColor = 'var(--danger-color)';
                            }
                        }

                        return (
                            <div key={style} className="card fatigue-group" style={{ borderColor: isClosestStyle ? 'var(--primary-accent)' : 'var(--border-color-light)' }}>
                                <h4 className={getStyleClass(style)} style={{ fontWeight: 700, textAlign: 'center' }}>
                                    {style} ({fatiguedList.length})
                                    {isClosestStyle && <span style={{ marginLeft: '8px', fontSize: '12px', color: textColor }}>{capacityText} / {capacity}</span>}
                                    {manualRecovery && manualRecovery.style === styleKey && 
                                        <span style={{ display: 'block', fontSize: '12px', color: 'var(--primary-accent)' }}>手動回復: 残り{manualRecovery.points}人</span>
                                    }
                                </h4>
                                <ul className="fatigue-list">
                                    {fatiguedList.map(m => {
                                        const isManualRecoverable = manualRecovery && manualRecovery.style === styleKey;
                                        return (
                                            <li 
                                                key={m.id} 
                                                title={`${m.name} (${m.condition})`}
                                                onClick={() => isManualRecoverable && onManualRecover(m.id)}
                                                style={{ cursor: isManualRecoverable ? 'pointer' : 'default' }}
                                            >
                                                <span className={getStyleClass(style)}>{m.name}</span> <span style={{ color: 'var(--text-subtle)' }}>({m.condition})</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </>
        );
    };

    const renderPlanMode = () => {
        const styleNameMap = { rush: 'ラッシュ', counter: 'カウンター', burst: 'バースト' };
        if (!planConditions || !planConditions.fatigueByGroup || !planConditions.megidoConditionsBySection) return null;

        // isMobileView に応じてスタイルを動的に変更
        const cardPadding = isMobileView ? '4px' : '8px';
        const titleFontSize = isMobileView ? '0.9rem' : '1.1rem';
        const pFontSize = isMobileView ? '10px' : '12px';
        const fatigueListGap = isMobileView ? '2px 4px' : '4px 8px';
        const sectionMarginTop = isMobileView ? '4px' : '8px';

        return (
            <div style={{ display: 'flex', flexDirection: 'row', gap: isMobileView ? '4px' : '8px' }}>
                {Object.keys(SIMULATED_CONDITION_SECTIONS).map(styleKey => (
                    <div key={styleKey} className="card" style={{ padding: cardPadding, marginBottom: '8px', flex: 1 }}>
                        <h4 className={getStyleClass(styleNameMap[styleKey])} style={{ fontWeight: 700, textAlign: 'center', fontSize: titleFontSize, margin: '4px 0' }}>{styleNameMap[styleKey]}</h4>
                        {SIMULATED_CONDITION_SECTIONS[styleKey].map((section, index) => {
                            const groupKey = `${section.start}-${section.end}`;
                            const groupData = planConditions.fatigueByGroup[groupKey] || { used: 0, capacity: section.limit };
                            const sectionMegidoData = planConditions.megidoConditionsBySection[groupKey] || {};
                            const fatiguedMegidoList = Object.values(sectionMegidoData);

                            const usageRate = groupData.capacity > 0 ? (groupData.used / groupData.capacity) * 100 : 0;
                            let barColor = 'var(--success-color)';
                            if (usageRate > 80) barColor = 'var(--danger-color)';
                            else if (usageRate > 50) barColor = 'var(--warning-color)';

                            return (
                                <div key={index} style={{ marginTop: sectionMarginTop, paddingTop: '4px', borderTop: '1px solid var(--border-color)', backgroundColor: (planState.activeFloor >= section.start && planState.activeFloor <= section.end) ? 'rgba(112, 240, 224, 0.1)' : 'transparent', borderRadius: '4px', padding: '4px' }}>
                                    <p style={{ fontSize: pFontSize, fontWeight: 500, margin: '0 0 4px 0' }}>{section.start}F - {section.end}F ({groupData.used}/{groupData.capacity})</p>
                                    <div className="progress-bar"><div className="progress-bar-inner" style={{ width: `${usageRate}%`, backgroundColor: barColor }}></div></div>
                                    <div className="fatigue-list" style={{ display: 'flex', flexWrap: 'wrap', gap: fatigueListGap, marginTop: '4px', fontSize: pFontSize }}>
                                        {fatiguedMegidoList.map(({ megido, fatigue }) => {
                                            return <span key={megido.id}>{megido.名前}({getNextCondition('絶好調', fatigue)})</span>
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`resource-dashboard ${isFooterCollapsed ? 'is-collapsed' : ''}`}>
            <div className="dashboard-header" onClick={handleToggleFooter}>
                <div className="dashboard-summary-info">
                    <span>塔破力: <span style={{ fontWeight: 700, color: 'var(--danger-color)' }}>{runState.towerPower || 30}</span></span>
                    <div className="fatigue-summary">
                        <span>疲労:</span>
                        <span className="summary-style-r">R: {fatiguedMegido.R.length}</span>
                        <span className="summary-style-c">C: {fatiguedMegido.C.length}</span>
                        <span className="summary-style-b">B: {fatiguedMegido.B.length}</span>
                    </div>
                </div>
                <div className="dashboard-toggle">{isFooterCollapsed ? '∨' : '∧'}</div>
            </div>
            {!isFooterCollapsed && (
                <div className="dashboard-content">
                    {mode === 'practice' && renderPracticeMode()}
                    {mode === 'plan' && renderPlanMode()}
                </div>
            )}
        </div>
    );
};





const EXPLORATION_REWARDS = {
    3500: {
        1: { stat: '1%', condition: '5体', power: '-6' },
        2: { stat: '3%', condition: '15体', power: '-8' },
        3: { stat: '5%', condition: '20体', power: '-13' }
    },
    4500: {
        1: { stat: '-', condition: '5体', power: '-6' },
        2: { stat: '-', condition: '15体', power: '-10' },
        3: { stat: '-', condition: '20体', power: '-15' }
    },
    5500: {
        1: { stat: '-', condition: '5体 1段階', power: '-6' },
        2: { stat: '-', condition: '10体 2段階', power: '-11' },
        3: { stat: '-', condition: '15体 2段階', power: '-16' }
    }
};