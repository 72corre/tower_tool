const ExplorationActionPanel = ({ square, ownedMegidoIds, megidoDetails, megidoConditions, onResolve, recommendation, onRecommendationChange, explorationAssignments, onPlanExplorationParty, planState, memos, onSaveMemo, showToastMessage, isLocked, lockText, runState, formations, seasonLogs, isResolvable, manualPower, onOpenManualPowerInput, onSetManualPower }) => {
    const { useState, useEffect, useMemo, useCallback } = React;
    const { findOptimalExplorationParty } = useAutoAssign();
    const { detailPanelTab: activeTab, setDetailPanelTab: onTabChange } = useAppContext();
    const [modalState, setModalState] = useState({ isOpen: false, slotIndex: null, recType: null });
    const [memo, setMemo] = useState('');
    const [targetExpectation, setTargetExpectation] = useState(3);
    const [autoAssignResult, setAutoAssignResult] = useState({ isOpen: false, result: null });
    const [practiceParty, setPracticeParty] = useState([null, null, null]);

    const handleAutoAssign = (retryOptions = {}) => {
        const { lowerExpectation = false, includeGoodCondition = false } = retryOptions;

        let currentTargetExpectation = targetExpectation;
        if (lowerExpectation && currentTargetExpectation > 1) {
            currentTargetExpectation -= 1;
            setTargetExpectation(currentTargetExpectation);
        }

        const result = findOptimalExplorationParty({
            currentFloor: square.floor.floor,
            targetExpectation: currentTargetExpectation,
            requiredPower,
            ownedMegidoIds,
            megidoConditions,
            megidoDetails,
            planState,
            runState,
            seasonLogs,
            formations,
            includeGoodCondition,
            calculatePower,
            recommendation
        });

        setAutoAssignResult({ isOpen: true, result });
    };

    const handleSelectParty = (party) => {
        const newParty = [null, null, null];
        party.forEach((megido, index) => {
            newParty[index] = megido;
        });
        setPracticeParty(newParty);
    };

    const handleCloseAutoAssignModal = () => {
        setAutoAssignResult({ isOpen: false, result: null });
    };

    const getTitle = (sq) => {
        if (!sq) return '探索';
        const subType = sq.sub_type;
        const style = sq.style || '';
        const styleText = style === 'RANDOM' ? 'ランダム' : style;

        switch (subType) {
            case 'recovery': return `コンディション回復（${styleText}）`;
            case 'tower_power': return '踏破力回復';
            case 'status_buff': return `ランダムバフ（${styleText}）`;
            case 'attack_buff': return `攻撃バフ（${styleText}）`;
            case 'defense_buff': return `防御バフ（${styleText}）`;
            case 'hp_buff': return `HPバフ（${styleText}）`;
            default: return '探索';
        }
    };

    useEffect(() => {
        if (square && memos) {
            const memoKey = `${square.floor.floor}-${square.id}`;
            setMemo(memos[memoKey] || '');
        }
        setPracticeParty([null, null, null]);
    }, [square, memos]);

    const handleSaveMemoClick = () => {
        if (onSaveMemo) {
            onSaveMemo(square, memo);
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

    const { totalPower, requiredPower, expectationLevel, result } = useMemo(() => {
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
    }, [practiceParty, megidoConditions, square, calculatePower, recommendation]);

    const displayPower = manualPower ?? totalPower;

    const availablePracticeMegido = useMemo(() => {
        if (!planState || !square || typeof COMPLETE_MEGIDO_LIST === 'undefined') return [];
        const selectedIds = new Set(practiceParty.filter(m => m).map(m => m.id));
        return COMPLETE_MEGIDO_LIST.filter(m => {
            const megidoId = String(m.id);
            return ownedMegidoIds.has(megidoId) && 
                   (megidoConditions[megidoId] || '絶好調') !== '気絶' && 
                   !selectedIds.has(megidoId);
        });
    }, [practiceParty, ownedMegidoIds, megidoConditions, planState, square]);

    const handlePracticeMegidoSelect = (megido) => {
        const newParty = [...practiceParty];
        newParty[modalState.slotIndex] = megido;
        setPracticeParty(newParty);
        setModalState({ isOpen: false, slotIndex: null });
    };

    const getFormattedReward = (rewards, subType) => {
        if (!rewards) return '-';
        switch (subType) {
            case 'tower_power': return `塔破力回復: ${rewards.power}`;
            case 'recovery': return `コンディション回復: ${rewards.condition}`;
            case 'attack_buff':
            case 'defense_buff':
            case 'hp_buff':
            case 'status_buff': return `ステ強化: ${rewards.stat}`;
            default: return `ステ強化: ${rewards.stat || '-'} / C回復: ${rewards.condition} / 塔破力: ${rewards.power}`;
        }
    };

    const getRewardColor = (level) => {
        if (level === 1) return '#22c55e'; // green-500
        if (level === 2) return '#3b82f6'; // blue-500
        if (level === 3) return '#ef4444'; // red-500
        return '#9ca3af'; // gray-400
    };



    const isReady = practiceParty.some(m => m !== null);

    const renderGoalColumn = (level, power, rewards) => {
        const rewardText = getFormattedReward(rewards, square.square.sub_type);
        return (
            <div style={{textAlign: 'center'}}>
                <p style={{margin: 0, fontSize: '12px', color: '#AAA'}}>期待度{level}</p>
                <p style={{margin: 0, fontSize: '20px', fontWeight: '700', color: getRewardColor(level)}}>{power}</p>
                <p style={{margin: 0, fontSize: '12px', color: getRewardColor(level)}}>{rewardText}</p>
            </div>
        );
    };

    return (
        <div className="exploration-action-panel">
            <h3 className="panel-title">{`${square.floor.floor}F ${getTitle(square.square)}`}</h3>
            
            <div className="sticky-tabs">
                <div className="tabs">
                    <button className={`tab-button ${activeTab === 'info' ? 'active' : ''}`} onClick={() => onTabChange('info')}>
                        <span className="material-symbols-outlined">edit_note</span>
                        情報・記録
                    </button>
                    <button className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => onTabChange('logs')}>
                        <span className="material-symbols-outlined">history</span>
                        過去の記録
                    </button>
                </div>
            </div>

            <div className="panel-content">
                {isLocked && <LockedPanelOverlay text={lockText} />}

                {activeTab === 'info' && (
                    <div className="tab-content-wrapper">
                        {/* 1. Goal Table */}
                        <div className="card">
                            <div className="card-header">探索目標</div>
                            <div style={{display: 'flex', justifyContent: 'space-around', padding: '1rem'}}>
                                {renderGoalColumn(3, Math.floor(requiredPower * 1.4), EXPLORATION_REWARDS[requiredPower]?.[3] || {}) }
                                {renderGoalColumn(2, requiredPower, EXPLORATION_REWARDS[requiredPower]?.[2] || {}) }
                                {renderGoalColumn(1, `< ${requiredPower}`, EXPLORATION_REWARDS[requiredPower]?.[1] || {}) }
                            </div>
                        </div>

                        {/* 2. Prepare */}
                        <div className="card">
                            <div className="card-header">探索準備</div>
                            <label className="label">ゲーム内に表示されているオススメのスタイル・クラス</label>
                            <select value={recommendation || ''} onChange={e => onRecommendationChange(square.id, e.target.value)} className="select-field">
                                <option value="">なし</option>
                                {RECOMMENDATION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>

                        {/* 3. Auto Assign */}
                        <div className="card card-accented">
                            <div className="card-header">おまかせ探索</div>
                             <div style={{display: 'flex', alignItems: 'flex-end', gap: '1rem'}}>
                                <div style={{flex: 1}}>
                                    <label className="label">目標期待度</label>
                                    <select value={targetExpectation} onChange={e => setTargetExpectation(Number(e.target.value))} className="select-field">
                                        <option value={3}>3</option>
                                        <option value={2}>2</option>
                                        <option value={1}>1</option>
                                    </select>
                                </div>
                                <button onClick={() => handleAutoAssign()} className="btn btn-primary" style={{flex: 2}}>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    探索パーティを自動編成
                                </button>
                            </div>
                        </div>

                        {/* 4. Tweak Area */}
                        <div className="card">
                            <div className="card-header">探索パーティ選択 (1〜3名)</div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px'}}>
                                {practiceParty.map((megido, index) => {
                                    if (!megido) {
                                        return <button key={index} className="btn megido-slot-empty" style={{height: '96px'}} onClick={() => setModalState({ isOpen: true, slotIndex: index })}>+</button>;
                                    }
                                    const condition = megidoConditions[megido.id] || '絶好調';
                                    return (
                                    <div key={index} className="card" style={{height: '96px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px', textAlign: 'center'}}>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                                            <span className={`flex-grow text-center ${getStyleClass(megido.スタイル)}`} style={{fontWeight: 700}} onClick={() => setModalState({ isOpen: true, slotIndex: index })}>{megido.名前}</span>
                                            <button onClick={(e) => { e.stopPropagation(); setPracticeParty(p => { const newP = [...p]; newP[index] = null; return newP; }); }} className="btn-icon text-danger">×</button>
                                        </div>
                                        <span style={{color: 'var(--text-subtle)', fontSize: '12px'}}>{condition}</span>
                                        <span style={{fontWeight: 500}}>{calculatePower(megido, condition, recommendation)}</span>
                                    </div>
                                )})}
                            </div>
                        </div>

                        {/* 5. Reconfirm Goal */}
                        <div className="card">
                            <div className="card-header">最終確認</div>
                            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'center', textAlign: 'center'}}>
                                 <div className="stat-item">
                                    <span className="stat-label">合計探索力</span>
                                    <span className="stat-value" style={{color: displayPower >= requiredPower ? 'var(--primary-accent)' : 'var(--danger-color)'}}>{displayPower}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">期待度</span>
                                    <span className="stat-value" style={{color: getRewardColor(expectationLevel)}}>{expectationLevel}</span>
                                </div>
                            </div>
                            <div style={{fontSize: '12px', textAlign: 'center', padding: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '8px', background: 'var(--bg-main)', borderRadius: '0 0 6px 6px'}}>
                                <p style={{margin: 0, fontWeight: 700}}>予測報酬</p>
                                <p style={{margin: 0, color: getRewardColor(expectationLevel)}}>{getFormattedReward(result, square.square.sub_type)}</p>
                            </div>
                        </div>

                        {/* 6. Execution Area */}
                        <div className="card">
                             <div className="card-header">記録</div>
                            <button 
                                id="resolve-square-button" 
                                onClick={() => onResolve('explore', { party: practiceParty.filter(m => m), totalPower: displayPower, requiredPower, expectationLevel, result }, square)} 
                                disabled={!isReady || !isResolvable} 
                                className="btn btn-primary" style={{width: '100%'}}
                            >
                                {isReady ? '探索実行' : '探索メギドを選択してください'}
                            </button>
                        </div>
                    </div>
                 )}

                {activeTab === 'logs' && (
                    <div className="tab-content-wrapper">
                        <div className="card">
                            <div className="card-header">統計情報</div>
                             <p className="placeholder-text">（この機能は現在開発中です）</p>
                        </div>
                        <div className="card">
                            <div className="card-header">探索履歴</div>
                            <p className="placeholder-text">（この機能は現在開発中です）</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AutoAssignResultModal
                isOpen={autoAssignResult.isOpen}
                onClose={handleCloseAutoAssignModal}
                result={autoAssignResult.result}
                onSelectParty={handleSelectParty}
                onRetry={handleAutoAssign}
            />
            <FilterableSelectionModal 
                title="探索メギド選択"
                isOpen={modalState.isOpen}
                onClose={() => setModalState({isOpen: false})}
                items={availablePracticeMegido}
                onSelect={handlePracticeMegidoSelect}
                showFilters={true}
                renderItem={(item, onSelect) => (
                    <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn">
                        <p className={`${getStyleClass(item.スタイル)}`} style={{fontWeight: 700, fontSize: '16px'}}>
                            {item.名前}
                        </p>
                        <p style={{fontSize: '14px', color: 'var(--text-subtle)'}}>{`探索力: ${calculatePower(item, (megidoConditions[item.id] || '絶好調'), recommendation)} (${megidoConditions[item.id] || '絶好調'})`}</p>
                    </button>
                )}
            />
        </div>
    );
};