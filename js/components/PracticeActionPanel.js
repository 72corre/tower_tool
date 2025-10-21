const getSquareTypeName = (type) => {
    const map = { 'battle': '戦闘', 'boss': 'ボス', 'explore': '探索', 'start': 'スタート' };
    return map[type] || type;
};

// =================================================================
// Section 2: Strategy Guide Component
// =================================================================
const StrategyGuide = ({ square, targetedEnemy, bossGuide, recommendations, onOpenCommunityFormations, openPlannerForSquare }) => {
    const { useState, useMemo } = React;
    const { glossaryData } = useAppContext();
    const [isOpen, setIsOpen] = useState(true);

    const renderDetailWithTooltip = (text) => {
        if (!glossaryData || !text) return text;
        const allTerms = Object.keys(glossaryData).sort((a, b) => b.length - a.length);
        const regex = new RegExp(`(${allTerms.join('|')})`, 'g');
        const parts = text.split(regex);
        return parts.map((part, index) => {
            if (allTerms.includes(part)) {
                return <GlossaryTooltip key={index} term={part}>{part}</GlossaryTooltip>;
            }
            return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/<br>/g, '') }} />;
        });
    };

    const renderRecommendationCard = (rec) => {
        const { megido, reason } = rec;
        return (
            <div key={megido.id} className="rec-card" onClick={() => onOpenCommunityFormations(null, null, null, megido.名前)}>
                <img src={`asset/メギド/${megido.名前}.png`} alt={megido.名前} className={`rec-megido-icon ${getStyleClass(megido.スタイル)}`} />
                <div className="rec-card-main">
                    <h5 className="rec-megido-name">{megido.名前}</h5>
                    {reason.method && (
                        <p className="rec-reason">
                            <strong><GlossaryTooltip term={reason.method}>{`【${reason.method}】`}</GlossaryTooltip></strong>
                            {renderDetailWithTooltip(reason.description)}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const allRecs = useMemo(() => [
        ...(recommendations?.attackers || []),
        ...(recommendations?.jammers || []),
        ...(recommendations?.supporters || [])
    ], [recommendations]);

    const strategyPoints = useMemo(() => {
        if (bossGuide) {
            return bossGuide.sections.find(s => s.type === 'strategy')?.points || [];
        }
        const counterGroups = {};
        allRecs.forEach(rec => {
            const key = rec.reason.counter || 'その他';
            if (!counterGroups[key]) {
                counterGroups[key] = [];
            }
            counterGroups[key].push(rec);
        });
        return Object.entries(counterGroups).map(([key, recs]) => ({
            text: `【${key}】による対策`,
            icon: 'help',
            recommendations: recs
        }));
    }, [bossGuide, allRecs]);

    if (!targetedEnemy || (!recommendations && !bossGuide)) {
        return null;
    }

    return (
        <div className="strategy-guide">
            <div className="section-header accordion-header" onClick={() => setIsOpen(!isOpen)}>
                <span className="material-symbols-outlined">school</span>
                <h3 style={{margin: 0, fontSize: '1rem'}}>攻略ガイド</h3>
                <span className="material-symbols-outlined accordion-icon">{isOpen ? 'expand_less' : 'expand_more'}</span>
            </div>
            {isOpen && (
                <div className="accordion-content">
                    <div className="gimmick-section">
                        <h4 className="gimmick-header">要注意ギミック</h4>
                        <div className="gimmick-tags">
                            {(targetedEnemy.tags?.gimmicks || []).map((g, i) => <span key={i} className="gimmick-tag">{g.subCategory}</span>)}
                        </div>
                        <h4 className="gimmick-header">有効な戦術</h4>
                        <div className="gimmick-tags">
                            {(targetedEnemy.tags?.weaknesses || []).map((w, i) => <span key={i} className="gimmick-tag weakness">{w.subCategory}</span>)}
                        </div>
                    </div>

                    {strategyPoints.map((point, i) => {
                        const keywords = (point.text.match(/【(.*?)】/g) || []).map(k => k.slice(1, -1));
                        const relatedRecs = point.recommendations || allRecs.filter(rec =>
                            keywords.some(keyword =>
                                rec.reason.counter === keyword ||
                                rec.reason.targetGimmick?.includes(keyword) ||
                                rec.reason.description?.includes(keyword)
                            )
                        );
                        if (relatedRecs.length === 0) return null;
                        return (
                            <div key={i} className="strategy-point-group">
                                <p className="strategy-point-text">
                                    <span className="material-symbols-outlined">{point.icon || 'check_circle'}</span>
                                    {renderDetailWithTooltip(point.text)}
                                </p>
                                <div className="rec-category-content">
                                    {relatedRecs.map(renderRecommendationCard)}
                                </div>
                            </div>
                        );
                    })}
                    <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                        {square.square.type === 'boss' && (
                            <button onClick={() => openPlannerForSquare(square.floor.floor, square.id)} className="btn btn-primary" style={{width: '100%'}}>
                                <span className="material-symbols-outlined">edit_note</span>
                                攻略計画を立てる
                            </button>
                        )}
                        <button onClick={() => onOpenCommunityFormations(null, targetedEnemy.name)} className="btn btn-secondary" style={{width: '100%'}}>
                            <span className="material-symbols-outlined">public</span>
                            みんなの編成
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// =================================================================
// Section 3: Selected Formation Viewer
// =================================================================
const SelectedFormationViewer = ({ formation }) => {
    if (!formation || !formation.megido) return null;

    return (
        <div className="selected-formation-viewer">
            {formation.megido.map((megido, index) => (
                <div key={index} className="formation-slot">
                    {megido ? (
                        <img 
                            src={`asset/メギド/${megido.名前}.png`} 
                            alt={megido.名前} 
                            className={`formation-megido-icon ${getStyleClass(megido.スタイル)}`}
                            title={megido.名前}
                        />
                    ) : (
                        <div className="formation-megido-icon empty-slot"></div>
                    )}
                </div>
            ))}
        </div>
    );
};


// =================================================================
// Main Panel Component
// =================================================================
const PracticeActionPanel = ({
    square, formations, onResolve, megidoConditions, onCreateFormation, planState,
    ownedMegidoIds, megidoDetails, runState, onRecommendationChange, isLocked, lockText,
    isPlanMode, onPlanCombatParty, targetedEnemy, bossGuides, onTargetEnemyChange, isResolvable,
    onSaveFormationMemo, onOpenCommunityFormations, recommendations, isGuideMode, openPlannerForSquare
}) => {
    const { useState, useEffect, useMemo, useCallback } = React;
    const [memoText, setMemoText] = useState('');
    const { glossaryData } = useAppContext();

    const getEnemyName = (enemy) => (typeof enemy === 'string' ? enemy : enemy.name);

    const { square: squareData, floor: floorData, id: squareId } = square;
    const [selectedFormationId, setSelectedFormationId] = useState('');
    const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);

    const formation = formations[selectedFormationId];
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
    
    useEffect(() => {
        if (!isPlanMode && !isLocked && !targetedEnemy && square.square.enemies && square.square.enemies.length === 1) {
            onTargetEnemyChange(getEnemyName(square.square.enemies[0]));
        }
    }, [square, isPlanMode, isLocked, targetedEnemy, onTargetEnemyChange]);

    if (!squareData) {
        return <div className="placeholder"><p>挑戦するマスをマップから選択してください。</p></div>;
    }
    
    const renderRulesWithTooltips = (rules) => {
        if (!glossaryData || !rules) return rules.join(', ');
        const allTerms = Object.keys(glossaryData);
        const regex = new RegExp(`(${allTerms.join('|')})`, 'g');
        return rules.map((rule, ruleIndex) => (
            <React.Fragment key={ruleIndex}>
                {rule.split(regex).map((part, partIndex) => 
                    allTerms.includes(part) ? <GlossaryTooltip key={partIndex} term={part}>{part}</GlossaryTooltip> : part
                )}
                {ruleIndex < rules.length - 1 ? ', ' : ''}
            </React.Fragment>
        ));
    };

    const formationList = Object.values(formations);

    return (
        <div className="practice-action-panel">
            <style>{`
                .practice-action-panel { display: flex; flex-direction: column; gap: 16px; }
                .panel-section { background-color: var(--bg-main-light, #2d3748); border: 1px solid var(--border-color, #4A5568); border-radius: 8px; }
                .section-header { display: flex; align-items: center; gap: 8px; margin: 0; padding: 8px 12px; background-color: var(--bg-main-dark, #1a202c); border-bottom: 1px solid var(--border-color, #4A5568); border-radius: 8px 8px 0 0; font-size: 1rem; font-weight: 700; color: var(--text-bright, #E2E8F0); }
                .panel-section-content { padding: 12px; }
                .section-header .floor-text { font-size: 1.25rem; color: var(--text-accent, #FBBF24); }
                .section-header .square-type-text { font-size: 1rem; color: var(--text-main, #A0AEC0); }
                .enemy-selector { display: flex; flex-direction: column; gap: 8px; }
                .enemy-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; border-radius: 4px; border: 2px solid transparent; transition: all 0.2s ease; }
                .enemy-item.targeted { border-color: var(--text-accent, #FBBF24); }
                .enemy-name-wrapper { cursor: pointer; display: flex; align-items: center; gap: 8px; flex-grow: 1; }
                .enemy-name { font-size: 1.125rem; font-weight: bold; color: var(--text-main); }
                .enemy-item.targeted .enemy-name { color: var(--text-accent, #FBBF24); }
                .enemy-actions { display: flex; gap: 8px; }
                .square-rules { padding: 12px; margin-top: 12px; background-color: var(--bg-main); border-radius: 4px; font-size: 0.875rem; }
                
                .strategy-guide .accordion-header { cursor: pointer; border-radius: 8px 8px 0 0; }
                .strategy-guide .accordion-icon { margin-left: auto; }
                .strategy-guide .accordion-content { padding: 12px; }
                .gimmick-section { margin-bottom: 12px; }
                .gimmick-header { font-size: 0.8rem; color: var(--text-subtle); text-transform: uppercase; margin: 8px 0 4px; }
                .gimmick-tags { display: flex; flex-wrap: wrap; gap: 6px; }
                .gimmick-tag { background-color: var(--danger-bg, #4A1D1D); color: var(--danger-text, #FEB2B2); padding: 2px 8px; border-radius: 12px; font-size: 0.875rem; font-weight: 500; }
                .gimmick-tag.weakness { background-color: var(--success-bg, #1A4237); color: var(--success-text, #9AE6B4); }
                .strategy-point-group { margin-top: 12px; }
                .strategy-point-text { display: flex; align-items: center; gap: 8px; padding: 8px; background-color: var(--bg-main-dark); border-radius: 4px; margin: 0; font-weight: 500; }
                
                .rec-category-content { padding-top: 8px; display: flex; flex-direction: column; gap: 8px; }
                .rec-card { display: flex; align-items: center; gap: 12px; background-color: var(--bg-main); padding: 8px; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
                .rec-card:hover { background-color: var(--bg-main-dark); }
                .rec-megido-icon { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #4b5563; flex-shrink: 0; }
                .rec-card-main { flex-grow: 1; }
                .rec-megido-name { margin: 0; font-size: 0.9rem; font-weight: 700; color: white; }
                .rec-reason { margin: 2px 0 0; font-size: 0.8rem; color: #d1d5db; }
                .rec-reason strong { color: var(--text-accent, #FBBF24); }
                .style-rush { border-color: var(--rush-color, #e11d48); }
                .style-counter { border-color: var(--counter-color, #f97316); }
                .style-burst { border-color: var(--burst-color, #2563eb); }

                .selected-formation-viewer { display: flex; justify-content: space-around; background-color: var(--bg-main); padding: 8px; border-radius: 4px; margin-top: 8px; }
                .formation-slot { width: 50px; height: 50px; }
                .formation-megido-icon { width: 100%; height: 100%; border-radius: 50%; border: 2px solid #4b5563; }
                .empty-slot { background-color: var(--bg-main-dark); }
                .btn-ghost-win { background-color: var(--success-bg, #1A4237); border: 1px solid var(--success-text, #9AE6B4); color: var(--success-text, #9AE6B4); font-weight: bold; }
                .btn-ghost-win:hover { background-color: var(--success-text, #9AE6B4); color: var(--success-bg, #1A4237); }
                .btn-ghost-win:disabled { background-color: var(--bg-main-dark); border-color: var(--border-color); color: var(--text-subtle); opacity: 0.5; }
                .textarea-field { width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background-color: var(--bg-main); color: var(--text-main); resize: vertical; }
            `}</style>

            {isLocked && <LockedPanelOverlay text={lockText} />}

            {/* Section 1: Target Info */}
            <div className="panel-section">
                <div className="section-header">
                    <span className="floor-text">{floorData.floor}F</span>
                    <span className="square-type-text">{getSquareTypeName(squareData.type)}</span>
                </div>
                <div className="panel-section-content">
                    <div className="enemy-selector">
                        {squareData.enemies && squareData.enemies.map((enemy, index) => {
                            const enemyName = getEnemyName(enemy);
                            const isTargeted = targetedEnemy?.name === enemyName;
                            return (
                                <div key={index} className={`enemy-item ${isTargeted ? 'targeted' : ''}`}>
                                    <div className="enemy-name-wrapper" onClick={() => onTargetEnemyChange(enemyName)}>
                                        {isTargeted && <span className="material-symbols-outlined" style={{color: 'var(--text-accent, #FBBF24)', fontSize: '1.2rem'}}>label</span>}
                                        <span className="enemy-name">{enemyName}</span>
                                    </div>
                                    <div className="enemy-actions">
                                        <button onClick={() => onCreateFormation(enemyName, floorData.floor)} className="btn btn-ghost p-1" title="この敵の編成を新規作成">
                                            <span className="material-symbols-outlined">add_circle</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {squareData.rules && squareData.rules.length > 0 &&
                        <div className="square-rules">
                            <strong>ルール: </strong>{renderRulesWithTooltips(squareData.rules)}
                        </div>
                    }
                </div>
            </div>

            {/* Section 2: Strategy Guide */}
            {isGuideMode && (recommendations || bossGuide) && (
                <div className="panel-section">
                    <StrategyGuide
                        square={square}
                        targetedEnemy={targetedEnemy}
                        bossGuide={bossGuide}
                        recommendations={recommendations}
                        onOpenCommunityFormations={onOpenCommunityFormations}
                        openPlannerForSquare={openPlannerForSquare}
                    />
                </div>
            )}

            {/* Section 3: Challenge Party */}
            <div className="panel-section">
                <div className="section-header">
                    <span className="material-symbols-outlined">groups</span>
                    <h3>挑戦パーティ</h3>
                </div>
                <div className="panel-section-content">
                    <button onClick={() => setIsFormationModalOpen(true)} className="select-field-btn">
                        {formation ? formation.name : <span style={{color: 'var(--text-subtle)'}}>編成を選択...</span>}
                    </button>
                    
                    {rehydratedSelectedFormation && <SelectedFormationViewer formation={rehydratedSelectedFormation} />}

                    {selectedFormationId && formation && (
                        <div style={{marginTop: '12px'}}>
                            <textarea value={memoText} onChange={(e) => setMemoText(e.target.value)} className="textarea-field" rows="3" placeholder="例: 1ターン目にスキルが取れなければリタイア。アスモデウスにターゲットし、2ターン目にオーブを使用。"></textarea>
                            <button onClick={() => onSaveFormationMemo(selectedFormationId, memoText)} className="btn btn-primary" style={{marginTop: '8px', width: '100%'}}>メモを保存</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Section 4: Record Result */}
            <div className="panel-section">
                 <div className="section-header">
                    <span className="material-symbols-outlined">edit</span>
                    <h3>結果を記録</h3>
                </div>
                <div className="panel-section-content">
                    {isFormationDisabled && <p className="warning-text">この編成には気絶状態のメギドが含まれているため、使用できません。</p>}
                    {!isResolvable && !isLocked && <p className="warning-text">このマスはクリア済みのマスに隣接していないため、挑戦結果を記録できません。</p>}
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px'}}>
                        <button id="win-button" onClick={() => onResolve('win', rehydratedSelectedFormation, square)} disabled={!selectedFormationId || isFormationDisabled || !isResolvable} className="btn btn-ghost-win">勝利</button>
                        <button onClick={() => onResolve('lose', rehydratedSelectedFormation, square)} disabled={!selectedFormationId || isFormationDisabled || !isResolvable} className="btn btn-ghost-lose">敗北</button>
                        <button onClick={() => onResolve('retreat', rehydratedSelectedFormation, square)} disabled={!selectedFormationId || !isResolvable} className="btn btn-ghost-retire">リタイア</button>
                    </div>
                </div>
            </div>

            <FilterableSelectionModal 
                title="編成を選択" 
                isOpen={isFormationModalOpen} 
                onClose={() => setIsFormationModalOpen(false)} 
                onSelect={(item) => { setSelectedFormationId(item.id); setIsFormationModalOpen(false); }}
                items={formationList}
                renderItem={(item, onSelect) => {
                    const rehydratedItem = rehydrateFormation(item, megidoDetails);
                    const isInvalid = getFormationInvalidReason(rehydratedItem, megidoDetails, ownedMegidoIds);
                    return (
                        <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn" style={isInvalid ? { opacity: 0.5 } : {}}>
                            <p style={{fontWeight: 'bold'}}>{item.name}</p>
                            {isInvalid && <small style={{color: 'var(--danger-color)'}}>{isInvalid}</small>}
                        </button>
                    )
                }}
                isFormationSearch={true}
            />
        </div>
    );
};