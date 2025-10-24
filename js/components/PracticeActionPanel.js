const getSquareTypeName = (type) => {
    const map = { 'battle': '戦闘', 'boss': 'ボス', 'explore': '探索', 'start': 'スタート' };
    return map[type] || type;
};

// =================================================================
// Section 2: Strategy Guide Component
// =================================================================

const CollapsibleSection = ({ title, children }) => {
    if (!children || (Array.isArray(children) && children.length === 0)) {
        return null;
    }
    return (
        <details className="collapsible-section">
            <summary className="collapsible-title">{title}</summary>
            <div className="collapsible-content">
                {children}
            </div>
        </details>
    );
};


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
        const { megido, orb, reason: reasonOrReasons } = rec;
        // reasonOrReasons can be an array of reasons (for jammers) or a single object.
        const reasons = Array.isArray(reasonOrReasons) ? reasonOrReasons : [reasonOrReasons];

        return (
            <div key={orb ? `${megido.id}-${orb.id}`: megido.id} className="rec-card" onClick={() => onOpenCommunityFormations(null, null, null, megido.名前)}>
                <div className="rec-card-header">
                    <div className={`megido-icon-circle ${getStyleClass(megido.スタイル)}`} style={{ backgroundImage: `url(asset/メギド/${megido.名前}.png)` }}>
                        {orb && <div className="rec-card-orb-icon" style={{ backgroundImage: `url(${getOrbImageUrl(orb)})`}} title={`オーブ: ${orb.name}`}></div>}
                    </div>
                    <h5 className="rec-megido-name">{megido.名前}</h5>
                </div>
                 <div className="rec-card-body">
                     {reasons.map((reason, i) => (
                        <React.Fragment key={i}>
                            {reason && (reason.method || reason.title) && (
                                <p className="rec-reason">
                                    <strong><GlossaryTooltip term={reason.method || reason.title}>{`【${reason.method || reason.title}】`}</GlossaryTooltip></strong>
                                    {renderDetailWithTooltip(reason.description)}
                                </p>
                            )}
                         </React.Fragment>
                     ))}
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
            <div className="card-header">
                <span className="material-symbols-outlined">tips_and_updates</span>
                攻略ガイド
            </div>
            <div className="strategy-section">
                <h4 className="strategy-subheader">要注意ギミック</h4>
                <div className="strategy-content">
                    <div className="strategy-tags">
                        {(targetedEnemy.tags?.gimmicks || []).map((g, i) => 
                            <span key={i} className="strategy-tag threat"><span className="material-symbols-outlined">warning</span>{g.subCategory}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="strategy-section">
                <h4 className="strategy-subheader">有効な戦術</h4>
                <div className="strategy-content">
                    <div className="strategy-tags">
                        {(targetedEnemy.tags?.weaknesses || []).map((w, i) => 
                            <span key={i} className="strategy-tag counter"><span className="material-symbols-outlined">verified_user</span>{w.subCategory}</span>
                        )}
                    </div>
                 </div>
            </div>
            
            {recommendations && (
                 <div className="strategy-section">
                    <h4 className="strategy-subheader">オススメメギド</h4>
                    <div className="recommendation-wrapper">
                        <CollapsibleSection title="アタッカー">
                            {recommendations.attackers?.map(renderRecommendationCard)}
                        </CollapsibleSection>
                        <CollapsibleSection title="ジャマー">
                            {recommendations.jammers?.map(renderRecommendationCard)}
                        </CollapsibleSection>
                        <CollapsibleSection title="サポーター">
                             {recommendations.supporters?.map(renderRecommendationCard)}
                        </CollapsibleSection>
                    </div>
                </div>
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
                        <span className="material-symbols-outlined">edit_note</span>
                        攻略計画
                    </button>
                )}
                <button onClick={() => onOpenCommunityFormations(null, targetedEnemy.name)} className="btn btn-highlight">
                    <span className="material-symbols-outlined">public</span>
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
    const megidoList = formation?.megido || formation?.megidoSlots; // Prioritize rehydrated `megido` property
    if (!megidoList || megidoList.length === 0) return null;

    return (
        <div className="selected-formation-viewer">
            {megidoList.map((megido, index) => {
                const styleClass = megido ? getStyleClass(megido.スタイル) : '';
                const imageUrl = megido && megido.名前 ? `url('asset/メギド/${megido.名前}.png')` : 'none';

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
    const { glossaryData, showToastMessage } = useAppContext();

    const getRuleIcon = (ruleText) => {
        if (ruleText.includes('覚醒')) return 'auto_awesome';
        if (ruleText.includes('禁止')) return 'block';
        if (ruleText.includes('ダメージ')) return 'bolt';
        if (ruleText.includes('ラッシュ')) return 'local_fire_department'; 
        if (ruleText.includes('カウンター')) return 'shield';
        if (ruleText.includes('バースト')) return 'waves';
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

    const squareLog = useMemo(() => {
        if (!runState || !runState.log) {
            return [];
        }
        return runState.log.filter(entry => entry.squareId === square.id).sort((a, b) => b.timestamp - a.timestamp);
    }, [runState, square.id]);

    const plannedFormationForSquare = useMemo(() => {
        if (!planState || !planState.assignments || !square || !targetedEnemy) return null;
        const squareAssignments = planState.assignments[`${square.floor.floor}-${square.id}`];
        if (!squareAssignments) return null;
        const formation = squareAssignments[targetedEnemy.name];
        if (!formation) return null;
        return rehydrateFormation(formation, megidoDetails);
    }, [planState, square, targetedEnemy, megidoDetails]);

    const formationToSquareMap = useMemo(() => {
        const map = {};
        if (!planState || !planState.assignments) return map;
        for (const squareId in planState.assignments) {
            const assignmentsForSquare = planState.assignments[squareId];
            for (const enemyName in assignmentsForSquare) {
                const formation = assignmentsForSquare[enemyName];
                if (formation && formation.id) {
                    map[formation.id] = squareId.replace(`${square.floor.floor}-`, '');
                }
            }
        }
        return map;
    }, [planState]);

    useEffect(() => {
        if (formation) setMemoText(formation.notes || '');
        else setMemoText('');
    }, [formation]);
    
    const renderRulesWithTooltips = (rule) => {
        if (!glossaryData || !rule) return rule;
        const allTerms = Object.keys(glossaryData).sort((a, b) => b.length - a.length);
        const regex = new RegExp(`(${allTerms.join('|')})`, 'g');
        return rule.split(regex).map((part, partIndex) => 
            allTerms.includes(part) ? <GlossaryTooltip key={partIndex} term={part}>{part}</GlossaryTooltip> : part
        );
    };

    const handlePlanFormation = (formation) => {
        if (!targetedEnemy) {
            showToastMessage('計画を設定する敵を選択してください。');
            return;
        }
        onPlanCombatParty(square.id, targetedEnemy.name, formation);
        showToastMessage(`${formation.name}を${square.floor.floor}F-${square.id}の${targetedEnemy.name}への計画に設定しました。`);
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
                            <div className="card-header">
                                <span className="material-symbols-outlined">info</span>
                                マス情報
                            </div>
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
                            <div className="card-header">
                                <span className="material-symbols-outlined">group</span>
                                挑戦パーティ
                            </div>

                            {plannedFormationForSquare && (
                                <div className="planned-formation-display">
                                    <div className="planned-formation-header">
                                        <span className="material-symbols-outlined">push_pin</span>
                                        <span>計画中の編成: {plannedFormationForSquare.name}</span>
                                    </div>
                                    <SelectedFormationViewer formation={plannedFormationForSquare} />
                                </div>
                            )}

                            <button onClick={() => setIsFormationModalOpen(true)} className="select-field-btn">
                                {selectedFormation ? `選択中: ${selectedFormation.name}` : (plannedFormationForSquare ? '別の編成で挑戦する' : '編成を選択...')}
                            </button>
                            
                            {selectedFormation && (
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
                            <div className="card-header">
                                <span className="material-symbols-outlined">check_circle</span>
                                結果を記録
                            </div>
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
                            <div className="card-header">挑戦の記録</div>
                            {squareLog.length === 0 ? (
                                <p className="placeholder-text">このマスにはまだ挑戦記録がありません。</p>
                            ) : (
                                <div className="log-list">
                                    {squareLog.map(logEntry => {
                                        const rehydratedFormation = rehydrateFormation(logEntry.formation, megidoDetails);
                                        return (
                                            <div key={logEntry.id} className="log-entry-card">
                                                <div className="log-entry-header">
                                                    <span className={`log-result-badge ${logEntry.result}`}>{logEntry.result.toUpperCase()}</span>
                                                    <span className="log-timestamp">{new Date(logEntry.timestamp).toLocaleString()}</span>
                                                </div>
                                                <SelectedFormationViewer formation={rehydratedFormation} />
                                                <button 
                                                    onClick={() => handlePlanFormation(logEntry.formation)}
                                                    className="btn btn-secondary btn-small log-plan-button"
                                                >
                                                    <span className="material-symbols-outlined">edit_note</span>
                                                    この編成で計画する
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
                    const plannedForSquare = formationToSquareMap[item.id];
                    return (
                        <div key={item.id} className="modal-item-container">
                            <button onClick={() => onSelect(item)} className="modal-item-btn" disabled={isInvalid}>
                                <p style={{fontWeight: 'bold'}}>{item.name}</p>
                                {isInvalid && <small className="text-danger">{isInvalid}</small>}
                                {plannedForSquare && 
                                    <span className="planned-badge">{plannedForSquare}で計画中</span>
                                }
                            </button>
                            <button
                                onClick={() => {
                                    handlePlanFormation(item);
                                    setIsFormationModalOpen(false);
                                }}
                                className="btn btn-secondary btn-small"
                                disabled={isInvalid}
                                title="この編成を計画に設定"
                            >
                                <span className="material-symbols-outlined">edit_note</span>
                            </button>
                        </div>
                    )
                }}
                isFormationSearch={true}
            />
        </div>
    );
};