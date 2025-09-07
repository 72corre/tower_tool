const ExplorationActionPanel = ({ square, ownedMegidoIds, megidoDetails, megidoConditions, onResolve, isPlanMode = false, recommendation, onRecommendationChange, explorationAssignments, onPlanExplorationParty, planState, memos, onSaveMemo, showToastMessage, isLocked, lockText, runState, formations, seasonLogs, isResolvable }) => {
    const { useState, useEffect, useMemo, useCallback } = React;
    const [modalState, setModalState] = useState({ isOpen: false, slotIndex: null, recType: null });
    const [memo, setMemo] = useState('');

    const getTitle = (sq) => {
        if (!sq) return '探索';
        const subType = sq.sub_type;
        const style = sq.style || '';
        const styleText = style === 'RANDOM' ? 'ランダム' : style;

        switch (subType) {
            case 'recovery':
                return `コンディション回復（${styleText}）`;
            case 'tower_power':
                return '踏破力回復';
            case 'status_buff':
                return `ランダムバフ（${styleText}）`;
            case 'attack_buff':
                return `攻撃バフ（${styleText}）`;
            case 'defense_buff':
                return `防御バフ（${styleText}）`;
            case 'hp_buff':
                return `HPバフ（${styleText}）`;
            default:
                return '探索';
        }
    };

    useEffect(() => {
        if (square && memos) {
            const memoKey = `${square.floor.floor}-${square.id}`;
            setMemo(memos[memoKey] || '');
        }
    }, [square, memos]);

    const handleSaveMemoClick = () => {
        if (onSaveMemo) {
            onSaveMemo(square, memo);
            showToastMessage("メモを保存しました。");
        }
    };

    const calculatePower = useCallback((megido, condition, rec) => {
        if (!megido) return 0;
        const baseMegido = (typeof COMPLETE_MEGIDO_LIST !== 'undefined' ? COMPLETE_MEGIDO_LIST : []).find(m => String(m.id) === String(megido.id));
        if (!baseMegido) return 0;
        const details = megidoDetails[megido.id] || { ougiLevel: 3 };
        const conditionBonuses = { "絶好調": 1.3, "好調": 1.1, "普通": 1, "不調": 0.8, "絶不調": 0.5, "気絶": 0 };
        const ougiBonus = 1 + (details.ougiLevel || 3) * 0.05;
        const conditionBonus = conditionBonuses[condition] || 1;
        let recommendationBonus = 1.0;
        if (rec && (rec === baseMegido.スタイル || rec === baseMegido.クラス)) {
            recommendationBonus = 1.8;
        }
        const power = (baseMegido.ATK * baseMegido.SPD / 1000 + baseMegido.HP * baseMegido.DEF / 10000) * ougiBonus * conditionBonus * recommendationBonus;
        return Math.floor(power);
    }, [megidoDetails]);

    const getInitialPracticeParty = () => {
        if (!planState || !recommendation) return [null, null, null];
        const plannedPartyIds = planState.explorationAssignments?.[square.id]?.[recommendation];
        if (!plannedPartyIds) return [null, null, null];
        const plannedParty = plannedPartyIds.map(id => {
            if (!id) return null;
            return (typeof COMPLETE_MEGIDO_LIST !== 'undefined' ? COMPLETE_MEGIDO_LIST : []).find(m => String(m.id) === String(id)) || null;
        });
        return plannedParty.length === 3 ? plannedParty : [null, null, null];
    };
    const [practiceParty, setPracticeParty] = useState(getInitialPracticeParty);

    const { totalPower, requiredPower, expectationLevel, result } = useMemo(() => {
        if (isPlanMode) return {};
        const reqPower = getRequiredExplorationPower({ ...square.square, floor: square.floor });
        const totPower = practiceParty.reduce((sum, megido) => {
            if (!megido) return sum;
            const condition = megidoConditions[megido.id] || '絶好調';
            return sum + calculatePower(megido, condition, recommendation);
        }, 0);
        let expLevel = 1;
        if (totPower >= reqPower * 1.4) expLevel = 3;
        else if (totPower >= reqPower) expLevel = 2;
        const res = EXPLORATION_REWARDS[reqPower]?.[expLevel] || { stat: 'N/A', condition: 'N/A', power: 'N/A' };
        return { totalPower: totPower, requiredPower: reqPower, expectationLevel: expLevel, result: res };
    }, [practiceParty, megidoConditions, square, calculatePower, isPlanMode, recommendation]);

    const availablePracticeMegido = useMemo(() => {
        if (isPlanMode) return [];
        const selectedIds = practiceParty.filter(m => m).map(m => m.id);
        const plannedPartyIds = planState.explorationAssignments?.[square.id]?.[recommendation] || [];

        return (typeof COMPLETE_MEGIDO_LIST !== 'undefined' ? COMPLETE_MEGIDO_LIST : []).filter(m => 
            ownedMegidoIds.has(String(m.id)) && 
            (megidoConditions[String(m.id)] || '絶好調') !== '気絶' && 
            !selectedIds.includes(m.id)
        ).sort((a, b) => {
            const aIsPlanned = plannedPartyIds.includes(String(a.id));
            const bIsPlanned = plannedPartyIds.includes(String(b.id));
        
            if (aIsPlanned && !bIsPlanned) return -1;
            if (!aIsPlanned && bIsPlanned) return 1;
            
            return a.名前.localeCompare(b.名前);
        });
    }, [practiceParty, ownedMegidoIds, megidoConditions, isPlanMode, planState, square, recommendation]);

    const handlePracticeMegidoSelect = (megido) => {
        const newParty = [...practiceParty];
        newParty[modalState.slotIndex] = megido;
        setPracticeParty(newParty);
        setModalState({ isOpen: false, slotIndex: null, recType: null });
    };
    
    const handlePlanMegidoSelect = (megido) => {
        const { recType, slotIndex } = modalState;
        const currentPartyIds = planState.explorationAssignments?.[square.id]?.[recType] || [null, null, null];
        const newPartyIds = [...currentPartyIds];
        newPartyIds[slotIndex] = megido.id;
        onPlanExplorationParty(square.id, recType, newPartyIds);
        setModalState({ isOpen: false, slotIndex: null, recType: null });
    };

    const handlePlanMegidoRemove = (recType, slotIndex) => {
        const currentPartyIds = planState.explorationAssignments?.[square.id]?.[recType] || [null, null, null];
        const newPartyIds = [...currentPartyIds];
        newPartyIds[slotIndex] = null;
        onPlanExplorationParty(square.id, recType, newPartyIds);
    };

    const availablePlanMegido = useMemo(() => {
        if (!isPlanMode) return [];
        const { recType } = modalState;
        const plannedPartyIds = planState.explorationAssignments?.[square.id]?.[recType] || [];
        return (typeof COMPLETE_MEGIDO_LIST !== 'undefined' ? COMPLETE_MEGIDO_LIST : []).filter(m => 
            ownedMegidoIds.has(String(m.id)) && !plannedPartyIds.includes(m.id)
        );
    }, [modalState.recType, ownedMegidoIds, planState.explorationAssignments, square.id]);

    if (isPlanMode) {
        return (
            <div style={{ position: 'relative' }}>
                {isLocked && <LockedPanelOverlay text={lockText} />}
                <h3 className="card-header">{getTitle(square.square)}</h3>
                <FilterableSelectionModal 
                    title="探索メギド選択"
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({isOpen: false})}
                    items={availablePlanMegido}
                    onSelect={handlePlanMegidoSelect}
                    showFilters={true}
                    renderItem={(item, onSelect) => (
                        <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn">
                            <p className={`${getStyleClass(item.スタイル)}`} style={{fontWeight: 700, fontSize: '16px'}}>
                                {item.名前}
                            </p>
                        </button>
                    )}
                />
                <h4 className="card-header">探索パーティ計画</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {RECOMMENDATION_TYPES.map(recType => {
                        const plannedPartyIds = planState.explorationAssignments?.[square.id]?.[recType] || [null, null, null];
                        const plannedParty = plannedPartyIds.map(id => id ? (typeof COMPLETE_MEGIDO_LIST !== 'undefined' ? COMPLETE_MEGIDO_LIST : []).find(m => m.id === id) : null);
                        return (
                            <div key={recType} className="card">
                                <h5 style={{fontWeight: 500, marginBottom: '8px'}}>{recType}</h5>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px'}}>
                                    {plannedParty.map((megido, index) => {
                                        if (!megido) {
                                            return (
                                                <div
                                                    key={index}
                                                    className="plan-megido-slot empty"
                                                    onClick={() => setModalState({ isOpen: true, slotIndex: index, recType: recType })}
                                                >
                                                    <span style={{ color: 'var(--text-subtle)', fontSize: '24px' }}>+</span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div
                                                key={index}
                                                className="plan-megido-slot filled"
                                                onClick={() => handlePlanMegidoRemove(recType, index)}
                                            >
                                                <span className={`flex-grow ${getStyleClass(megido.スタイル)}`} style={{ fontSize: '12px', fontWeight: 700 }}>
                                                    {megido.名前}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {(() => {
                                    const reqPower = getRequiredExplorationPower({ ...square.square, floor: square.floor });
                                    const totPower = plannedParty.reduce((sum, megido) => {
                                        if (!megido) return sum;
                                        return sum + calculatePower(megido, '絶好調', recType);
                                    }, 0);
                                    let expLevel = 1;
                                    if (totPower >= reqPower * 1.4) expLevel = 3;
                                    else if (totPower >= reqPower) expLevel = 2;
                                    const res = EXPLORATION_REWARDS[reqPower]?.[expLevel] || { stat: 'N/A', condition: 'N/A', power: 'N/A' };
                                    
                                    return (
                                        <div style={{marginTop: '12px', padding: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', fontSize: '12px', textAlign: 'center'}}>
                                            <div style={{display: 'flex', justifyContent: 'space-around'}}><span>計: <span style={{fontWeight: 700}}>{totPower}</span></span><span>推奨: <span style={{fontWeight: 700}}>{reqPower}</span></span><span>期待度: <span style={{fontWeight: 700, color: 'var(--info-color)'}}>{expLevel}</span></span></div>
                                            <div style={{marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)'}}>予測: {res.stat}, {res.condition}, {res.power}</div>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
                <div className="form-section" style={{marginTop: '16px'}}>
                    <label className="label">このマスへのメモ</label>
                    <textarea value={memo} onChange={e => setMemo(e.target.value)} className="input-field" rows="3" placeholder="探索マスへのメモを記入..." />
                    <button onClick={handleSaveMemoClick} className="btn btn-primary" style={{marginTop: '12px'}}>メモを保存</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            {isLocked && <LockedPanelOverlay text={lockText} />}
            <h3 className="card-header">{getTitle(square.square)}</h3>
            <FilterableSelectionModal 
                title="探索メギド選択"
                isOpen={modalState.isOpen}
                onClose={() => setModalState({isOpen: false})}
                items={availablePracticeMegido}
                onSelect={handlePracticeMegidoSelect}
                showFilters={true}
                renderItem={(item, onSelect) => {
                    const megidoId = String(item.id);
                    const currentFloor = square.floor.floor;

                    let reasonForCurrent = '';
                    let reasonForFuture = '';

                    const megidoData = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === megidoId);
                    const style = megidoData?.スタイル;
                    const styleKey = style?.includes('ラッシュ') ? 'rush' : style?.includes('カウンター') ? 'counter' : 'burst';

                    let currentSection = null;
                    if (styleKey && typeof SIMULATED_CONDITION_SECTIONS !== 'undefined' && SIMULATED_CONDITION_SECTIONS[styleKey]) {
                        currentSection = SIMULATED_CONDITION_SECTIONS[styleKey].find(s => currentFloor >= s.start && currentFloor <= s.end);
                    }

                    const allPlans = [planState, ...seasonLogs.slice(-3).map(l => l.planState)].filter(Boolean);
                    const allHistories = [runState.history, ...seasonLogs.slice(-3).map(l => l.runState?.history)].flat().filter(Boolean);
                    const clearedOnCurrentFloor = runState.cleared?.[currentFloor] || [];

                    for (const plan of allPlans) {
                        if (reasonForCurrent && reasonForFuture) break;
                        for (const fullSquareId in plan.assignments || {}) {
                            const floor = parseInt(fullSquareId.split('-')[0], 10);
                            const squareId = fullSquareId.substring(fullSquareId.indexOf('-') + 1);
                            const isFutureFloorInScope = currentSection ? (floor > currentFloor && floor <= currentSection.end) : (floor > currentFloor);

                            const isPlannedInSquare = Object.values(plan.assignments[fullSquareId]).some(slots =>
                                slots.some(formId =>
                                    formations.find(f => f.id === formId)?.megido.some(m => m && String(m.id) === megidoId)
                                )
                            );

                            if (isPlannedInSquare) {
                                if (floor === currentFloor && !clearedOnCurrentFloor.includes(squareId) && !reasonForCurrent) {
                                    reasonForCurrent = '[この階で計画済] ';
                                } else if (isFutureFloorInScope && !reasonForFuture) {
                                    reasonForFuture = '[今後の階で計画済] ';
                                }
                            }
                        }
                    }

                    allHistories.forEach(h => {
                        if (h.type !== 'battle') return;
                        const floor = parseInt(h.floor, 10);
                        const isFutureFloorInScope = currentSection ? (floor > currentFloor && floor <= currentSection.end) : (floor > currentFloor);
                        const isUsed = formations.find(f => f.id === h.formationId)?.megido.some(m => m && String(m.id) === megidoId);
                        
                        if (isUsed) {
                            if (floor === currentFloor && !reasonForCurrent) {
                                    reasonForCurrent = '[この階で使用したことがあります] ';
                                } else if (isFutureFloorInScope && !reasonForFuture) {
                                    reasonForFuture = '[今後の階で使用したことがあります] ';
                                }
                            }
                        });

                    const restrictionReason = (reasonForCurrent + reasonForFuture).trim();
                    const isRestricted = restrictionReason.length > 0;

                    const isRecommended = recommendation && (item.スタイル === recommendation || item.クラス === recommendation);
                    const power = calculatePower(item, '絶好調', recommendation);
                    const condition = megidoConditions[item.id] || '絶好調';

                    const buttonStyle = { position: 'relative' };
                    const overlayStyle = {
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(255, 0, 0, 0.2)',
                        borderRadius: '6px',
                        pointerEvents: 'none'
                    };

                    return (
                        <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn" style={buttonStyle}>
                            {isRestricted && <div style={overlayStyle}></div>}
                            <p className={`${getStyleClass(item.スタイル)}`} style={{fontWeight: 700, fontSize: '16px'}}>
                                {item.名前} {isRecommended && <span style={{color: 'var(--warning-color)'}}>★</span>}
                            </p>
                            <p style={{fontSize: '14px', color: 'var(--text-subtle)'}}>探索力: {power} ({condition})</p>
                            {isRestricted && (
                                <div style={{ fontSize: '12px', color: 'var(--warning-color)', marginTop: '4px' }}>
                                    {restrictionReason}
                                </div>
                            )}
                        </button>
                    );
                }}
            />
            <div className="form-section">
                <label className="label">おすすめ:</label>
                <select value={recommendation || ''} onChange={e => onRecommendationChange(square.id, e.target.value)} className="select-field">
                    <option value="">なし</option>
                    {RECOMMENDATION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <h4 className="label">探索パーティ選択 (1〜3体)</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px'}}>
                {practiceParty.map((megido, index) => {
                    if (!megido) {
                         return <div key={index} className="card" style={{height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} onClick={() => setModalState({ isOpen: true, slotIndex: index })}><span style={{color: 'var(--text-subtle)', fontSize: '24px'}}>+</span></div>;
                    }
                    const condition = megidoConditions[megido.id] || '絶好調';
                    return (
                    <div key={index} className="card" style={{height: '96px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                            <span className={`flex-grow text-center ${getStyleClass(megido.スタイル)}`} style={{fontWeight: 700}} onClick={() => setModalState({ isOpen: true, slotIndex: index })}>{megido.名前}</span>
                            <button onClick={(e) => { e.stopPropagation(); setPracticeParty(p => { const newP = [...p]; newP[index] = null; return newP; }); }} style={{color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer'}}>×</button>
                        </div>
                        <span style={{color: 'var(--text-subtle)', fontSize: '12px'}}>{condition}</span>
                        <span style={{fontWeight: 500}}>{calculatePower(megido, condition, recommendation)}</span>
                    </div>
                )})}
            </div>

            <div className="card" style={{marginTop: '16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center'}}>
                    <div><p style={{fontSize: '12px', color: 'var(--text-subtle)'}}>合計探索力</p><p style={{fontSize: '24px', fontWeight: 700}}>{totalPower}</p></div>
                    <div><p style={{fontSize: '12px', color: 'var(--text-subtle)'}}>推奨探索力</p><p style={{fontSize: '24px', fontWeight: 700}}>{requiredPower}</p></div>
                    <div><p style={{fontSize: '12px', color: 'var(--text-subtle)'}}>期待度</p><p style={{fontSize: '24px', fontWeight: 700, color: 'var(--info-color)'}}>{expectationLevel}</p></div>
                </div>
                <div style={{fontSize: '12px', textAlign: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)'}}>
                    <p style={{fontWeight: 700}}>予測報酬</p>
                    <p>ステ強化: {result.stat || '-'} / コンディション回復: {result.condition} / 塔破力回復: {result.power}</p>
                </div>
            </div>
            {!isResolvable && !isLocked && <p style={{color: 'var(--warning-color)', fontSize: '12px', marginTop: '12px'}}>このマスはクリア済みのマスに隣接していないため、挑戦結果を記録できません。</p>}
            <div style={{marginTop: '16px'}}>
                <button onClick={() => onResolve('explore', { party: practiceParty.filter(m => m), totalPower, requiredPower, expectationLevel }, square)} disabled={!practiceParty.some(m => m !== null) || !isResolvable} className="btn btn-primary" style={{width: '100%'}}>探索実行</button>
            </div>
        </div>
    );
};