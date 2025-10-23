const getSquareTypeName = (type) => {
    const map = { 'battle': '戦闘', 'boss': 'ボス', 'explore': '探索', 'start': 'スタート' };
    return map[type] || type;
};

// =================================================================
// Section 2: Strategy Guide Component
// =================================================================
const StrategyGuide = ({ square, targetedEnemy, bossGuide, recommendations, onOpenCommunityFormations, openPlannerForSquare }) => {
    const { useMemo } = React;
    const { glossaryData } = useAppContext();



    const renderDetailWithTooltip = (text, highlightClass = '') => {
        if (!glossaryData || !text) return <span className={highlightClass}>{text}</span>;
        const allTerms = Object.keys(glossaryData).sort((a, b) => b.length - a.length);
        const regex = new RegExp(`(${allTerms.join('|')})`, 'g');
        const parts = text.split(regex);
        return parts.map((part, index) => {
            if (allTerms.includes(part)) {
                return <GlossaryTooltip key={index} term={part}><span className={highlightClass}>{part}</span></GlossaryTooltip>;
            }
            return <span key={index} className={highlightClass} dangerouslySetInnerHTML={{ __html: part.replace(/<br>/g, '') }} />;
        });
    };

    const renderRecommendationCard = (rec) => {
        const { megido, reason: reasonOrReasons } = rec;
        const reason = Array.isArray(reasonOrReasons) ? reasonOrReasons[0] : reasonOrReasons;

        return (
            <div key={megido.id} className="rec-card" onClick={() => onOpenCommunityFormations(null, null, null, megido.名前)}>
                <div className={`megido-icon-circle ${getStyleClass(megido.スタイル)}`} style={{ backgroundImage: `url(asset/メギド/${megido.名前}.png)` }}></div>
                <div className="rec-card-main">
                    <h5 className="rec-megido-name">{megido.名前}</h5>
                    {reason && reason.method && (
                        <p className="rec-reason">
                            <strong><GlossaryTooltip term={reason.method}>{`【${reason.method}】`}</GlossaryTooltip></strong>
                            {renderDetailWithTooltip(reason.description)}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const strategyPoints = useMemo(() => {
        if (bossGuide) {
            return bossGuide.sections.find(s => s.type === 'strategy')?.points || [];
        }
        return [];
    }, [bossGuide]);

    if (!targetedEnemy) {
        return <div className="placeholder-text">表示する敵を選択してください。</div>;
    }

    return (
        <div className="card">
            <div className="card-header">攻略ガイド</div>
            <div className="strategy-section">
                <h4 className="strategy-subheader">要注意ギミック</h4>
                <div className="strategy-tags">
                    {(targetedEnemy.tags?.gimmicks || []).map((g, i) => 
                        <span key={i} className="strategy-tag threat"><i className="material-symbols-outlined">warning</i>{g.subCategory}</span>
                    )}
                </div>
            </div>
            <div className="strategy-section">
                <h4 className="strategy-subheader">有効な戦術</h4>
                <div className="strategy-tags">
                    {(targetedEnemy.tags?.weaknesses || []).map((w, i) => 
                        <span key={i} className="strategy-tag counter"><i className="material-symbols-outlined">verified_user</i>{w.subCategory}</span>
                    )}
                </div>
            </div>

            {recommendations && (
                <>
                    {recommendations.attackers && recommendations.attackers.length > 0 && (
                        <div className="strategy-section">
                            <h4 className="strategy-subheader">オススメアタッカー</h4>
                            {recommendations.attackers.map(renderRecommendationCard)}
                        </div>
                    )}
                    {recommendations.jammers && recommendations.jammers.length > 0 && (
                        <div className="strategy-section">
                            <h4 className="strategy-subheader">オススメジャマー</h4>
                            {recommendations.jammers.map(renderRecommendationCard)}
                        </div>
                    )}
                    {recommendations.supporters && recommendations.supporters.length > 0 && (
                        <div className="strategy-section">
                            <h4 className="strategy-subheader">オススメサポーター</h4>
                            {recommendations.supporters.map(renderRecommendationCard)}
                        </div>
                    )}
                </>
            )}

            {strategyPoints.map((point, i) => (
                <div key={i} className="strategy-point-group">
                    <p className="strategy-point-text">
                        <span className="material-symbols-outlined">{point.icon || 'check_circle'}</span>
                        {renderDetailWithTooltip(point.text, point.type === 'threat' ? 'text-danger' : 'text-success')}
                    </p>
                </div>
            ))}

            <div className="button-group">
                {square.square.type === 'boss' && (
                    <button onClick={() => openPlannerForSquare(square.floor.floor, square.id)} className="btn btn-primary">
                        <i className="material-symbols-outlined">edit_note</i>
                        攻略計画
                    </button>
                )}
                <button onClick={() => onOpenCommunityFormations(null, targetedEnemy.name)} className="btn btn-secondary">
                    <i className="material-symbols-outlined">public</i>
                    みんなの編成
                </button>
            </div>
        </div>
    );
};

// =================================================================
// Section 3: Selected Formation Viewer
// =================================================================
const SelectedFormationViewer = ({ formation }) => {
    const megidoList = formation?.megidoSlots || formation?.megido; // Robustly check for both properties
    if (!megidoList) return null;

    return (
        <div className="selected-formation-viewer">
            {megidoList.map((megido, index) => {
                const styleClass = megido ? getStyleClass(megido.スタイル) : '';
                const imageUrl = megido ? `url('asset/メギド/${megido.名前}.png')` : 'none';

                return (
                    <div key={index} className="formation-slot">
                        <div 
                            className={`megido-icon-circle ${styleClass}`}
                            style={{ 
                                backgroundImage: imageUrl,
                            }}
                            title={megido ? megido.名前 : '空きスロット'}
                        ></div>
                    </div>
                );
            })}
        </div>
    );
};


// =================================================================
// Main Panel Component
// =================================================================
const PracticeActionPanel = ({
    square, formations, onResolve, megidoConditions, onCreateFormation, planState,
    ownedMegidoIds, megidoDetails, runState, onRecommendationChange, isLocked, lockText,
    onPlanCombatParty, targetedEnemy, bossGuides, onTargetEnemyChange, isResolvable,
    onSaveFormationMemo, onOpenCommunityFormations, recommendations, isGuideMode, openPlannerForSquare
}) => {
    const { useState, useEffect, useMemo, useCallback } = React;
    const [memoText, setMemoText] = useState('');
    const { glossaryData } = useAppContext();

    const getRuleIcon = (ruleText) => {
        if (ruleText.includes('覚醒')) return 'auto_awesome';
        if (ruleText.includes('禁止')) return 'block';
        if (ruleText.includes('ダメージ')) return 'bolt';
        if (ruleText.includes('ラッシュ')) return 'rush'; // Assuming you have these icons
        if (ruleText.includes('カウンター')) return 'counter';
        if (ruleText.includes('バースト')) return 'burst';
        if (ruleText.includes('地形')) return 'landscape';
        return 'gavel'; // Default rule icon
    };

    if (!square) {
        return <div className="placeholder"><p>挑戦するマスをマップから選択してください。</p></div>;
    }

    const getEnemyName = (enemy) => (typeof enemy === 'string' ? enemy : enemy.name);

    const { square: squareData, floor: floorData, id: squareId } = square;
    const { detailPanelTab: activeTab, setDetailPanelTab: onTabChange } = useAppContext();
    const [selectedFormation, setSelectedFormation] = useState(null);
    const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);

    const formation = selectedFormation;
    const rehydratedSelectedFormation = useMemo(() => formation ? rehydrateFormation(formation, megidoDetails) : null, [formation, megidoDetails]);
    const isFormationDisabled = rehydratedSelectedFormation && rehydratedSelectedFormation.megido.some(m => m && megidoConditions[String(m.id)] === '気絶');

    const bossGuide = useMemo(() => {
        if (!bossGuides || !targetedEnemy) return null;
        return bossGuides[targetedEnemy.name] || null;
    }, [bossGuides, targetedEnemy]);

    useEffect(() => {
        if (formation) setMemoText(formation.notes || '');
        else setMemoText('');
    }, [formation]);
    
    const renderRulesWithTooltips = (rule) => {
        if (!glossaryData || !rule) return rule;
        const allTerms = Object.keys(glossaryData);
        const regex = new RegExp(`(${allTerms.join('|')})`, 'g');
        return rule.split(regex).map((part, partIndex) => 
            allTerms.includes(part) ? <GlossaryTooltip key={partIndex} term={part}>{part}</GlossaryTooltip> : part
        );
    };

    const formationList = Object.values(formations);

    return (
        <div className="practice-action-panel">
            <h3 className="panel-title">{`${floorData.floor}F ${getSquareTypeName(squareData.type)}`}</h3>

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
                        {/* Card 1: Mass Info */}
                        <div className="card">
                            <div className="card-header">マス情報</div>
                            <div className="enemy-selector">
                                {squareData.enemies && squareData.enemies.map((enemy, index) => {
                                    const enemyName = getEnemyName(enemy);
                                    const isTargeted = targetedEnemy?.name === enemyName;
                                    const itemStyle = isTargeted ? { backgroundColor: 'rgba(250, 204, 21, 0.1)', borderLeft: '4px solid #FACC15', paddingLeft: '8px' } : {};
                                    return (
                                        <div key={index} className={`enemy-item`} style={itemStyle}>
                                            <div className="enemy-name-wrapper" onClick={() => onTargetEnemyChange(enemyName)}>
                                                {isTargeted && <span className="material-symbols-outlined icon-label" style={{color: '#FACC15'}}>label</span>}
                                                <span className="enemy-name">{enemyName}</span>
                                            </div>
                                            <div className="enemy-actions">
                                                <button onClick={() => onCreateFormation(enemyName, floorData.floor)} className="btn-icon" title="この敵の編成を新規作成">
                                                    <span className="material-symbols-outlined">add_circle</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {squareData.rules && squareData.rules.length > 0 &&
                                <div className="rules-card">
                                    <ul className="rules-list">
                                        {squareData.rules.map((rule, i) => (
                                            <li key={i} className="rule-item">
                                                <span className="material-symbols-outlined">{getRuleIcon(rule)}</span>
                                                <span>{renderRulesWithTooltips(rule)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            }
                        </div>

                        {/* Card 2: Strategy Guide */}
                        <StrategyGuide
                            square={square}
                            targetedEnemy={targetedEnemy}
                            bossGuide={bossGuide}
                            recommendations={recommendations}
                            onOpenCommunityFormations={onOpenCommunityFormations}
                            openPlannerForSquare={openPlannerForSquare}
                        />

                        {/* Card 3: Challenge Party */}
                        <div className="card">
                            <div className="card-header">挑戦パーティ</div>
                            <button onClick={() => setIsFormationModalOpen(true)} className="select-field-btn">
                                {selectedFormation ? selectedFormation.name : <span className="placeholder-text">編成を選択...</span>}
                            </button>
                            
                            {rehydratedSelectedFormation && (
                                <SelectedFormationViewer formation={rehydratedSelectedFormation} />
                            )}

                            {selectedFormation && (
                                <div style={{marginTop: '12px'}}>
                                    <textarea value={memoText} onChange={(e) => setMemoText(e.target.value)} className="input-field" rows="3" placeholder="戦術メモ (例: 1T目にスキルが取れなければリタイア)"></textarea>
                                </div>
                            )}
                        </div>

                        {/* Card 4: Record Result */}
                        <div className="card">
                            <div className="card-header">結果を記録</div>
                            {isFormationDisabled && <p className="text-danger">この編成には気絶状態のメギドが含まれているため、使用できません。</p>}
                            {!isResolvable && !isLocked && <p className="text-warning">このマスはクリア済みのマスに隣接していないため、挑戦結果を記録できません。</p>}
                            <div className="button-group">
                                <button id="win-button" onClick={() => onResolve('win', rehydratedSelectedFormation, square)} disabled={!selectedFormation || isFormationDisabled || !isResolvable} className="btn btn-win">勝利</button>
                                <button onClick={() => onResolve('lose', rehydratedSelectedFormation, square)} disabled={!selectedFormation || isFormationDisabled || !isResolvable} className="btn btn-lose">敗北</button>
                                <button onClick={() => onResolve('retreat', rehydratedSelectedFormation, square)} disabled={!selectedFormation || !isResolvable} className="btn btn-retire">リタイア</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="tab-content-wrapper">
                        <div className="card">
                            <div className="card-header">統計情報</div>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">平均塔破力</span>
                                    <span className="stat-value">- <span className="stat-unit">TP</span></span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">勝率</span>
                                    <span className="stat-value">- <span className="stat-unit">%</span></span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">挑戦回数</span>
                                    <span className="stat-value">- <span className="stat-unit">回</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">使用編成ログ</div>
                            <p className="placeholder-text">（この機能は現在開発中です）</p>
                        </div>
                    </div>
                )}
            </div>

            <FilterableSelectionModal 
                title="編成を選択" 
                isOpen={isFormationModalOpen} 
                onClose={() => setIsFormationModalOpen(false)} 
                onSelect={(item) => { 
                    setSelectedFormation(item); 
                    setIsFormationModalOpen(false); 
                }}
                items={formationList}
                renderItem={(item, onSelect) => {
                    const rehydratedItem = rehydrateFormation(item, megidoDetails);
                    const isInvalid = getFormationInvalidReason(rehydratedItem, megidoDetails, ownedMegidoIds);
                    return (
                        <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn" disabled={isInvalid}>
                            <p style={{fontWeight: 'bold'}}>{item.name}</p>
                            {isInvalid && <small className="text-danger">{isInvalid}</small>}
                        </button>
                    )
                }}
                isFormationSearch={true}
            />
        </div>
    );
};