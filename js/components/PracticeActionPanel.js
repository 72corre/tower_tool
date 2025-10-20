const getSquareTypeName = (type) => {
    const map = {
        'battle': '戦闘',
        'boss': 'ボス',
        'explore': '探索',
        'start': 'スタート'
    };
    return map[type] || type;
};

// おすすめメギド表示用の新しいコンポーネント
const RecommendedMegidoPanel = ({ recommendations, onOpenCommunityFormations }) => {
    const { useState } = React;
    const { glossaryData } = useAppContext();
    const [openCategory, setOpenCategory] = useState(null);

    const toggleCategory = (category) => {
        setOpenCategory(openCategory === category ? null : category);
    };

    const getStyleClass = (style) => {
        if (style === 'ラッシュ') return 'style-rush';
        if (style === 'カウンター') return 'style-counter';
        if (style === 'バースト') return 'style-burst';
        return '';
    };

    const renderDetailWithTooltip = (text) => {
        if (!glossaryData || !text) return text;
        const allTerms = Object.keys(glossaryData);
        allTerms.sort((a, b) => b.length - a.length);
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
        const { megido, orb, reason } = rec;

        const reasonSubCategories = new Set();
        if (typeof reason === 'string') {
            megido.tags.forEach(tag => {
                if (reason.includes(tag.method) && reason.includes(tag.subCategory)) {
                    reasonSubCategories.add(tag.subCategory);
                }
            });
        } else if (typeof reason === 'object' && reason !== null) {
            const textToCheck = [reason.title, reason.description, ...(reason.details || []).map(d => d.value)].join(' ');
            megido.tags.forEach(tag => {
                if (textToCheck.includes(tag.subCategory)) {
                    reasonSubCategories.add(tag.subCategory);
                }
            });
        }

        const otherRoles = megido.tags
            .map(t => t.subCategory)
            .filter(sub => !reasonSubCategories.has(sub))
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 2);

        return (
            <div key={megido.id + (orb ? orb.id : '')} className="rec-card">
                <div className="rec-card-left" onClick={() => onOpenCommunityFormations(null, null, null, megido.名前)} style={{cursor: 'pointer'}}>
                    <img src={`asset/メギド/${megido.名前}.png`} alt={megido.名前} className={`rec-megido-icon ${getStyleClass(megido.スタイル)}`} />
                </div>
                <div className="rec-card-main">
                    <h5 className="rec-megido-name" onClick={() => onOpenCommunityFormations(null, null, null, megido.名前)}>{megido.名前}</h5>
                    {(() => {
                        if (typeof reason === 'string') {
                            return <p className="rec-reason" dangerouslySetInnerHTML={{ __html: reason.replace(/【(.*?)】/g, `<span class="highlight">【$1】</span>`) }}></p>;
                        }
                        if (reason.title) { // For complex strategies with titles
                            return (
                                <div className="rec-reason">
                                    <p style={{margin: 0}}>
                                        <strong><GlossaryTooltip term={reason.title}>{`【${reason.title}】`}</GlossaryTooltip></strong>
                                        <span dangerouslySetInnerHTML={{ __html: reason.description }}></span>
                                    </p>
                                    {reason.details &&
                                        <div style={{marginTop: '0.5rem'}}>
                                            {reason.details.map((detail, i) => (
                                                <div key={i} style={{margin: '0.25rem 0 0'}}>
                                                    <strong>{detail.label}:</strong>
                                                    <span style={{ display: 'block' }}>{renderDetailWithTooltip(detail.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    }
                                    {reason.notes && reason.notes.length > 0 &&
                                        <p style={{margin: '0.5rem 0 0', fontSize: '0.8em', opacity: 0.8}}>補足: {reason.notes.join(' ')}</p>
                                    }
                                </div>
                            );
                        }
                        if (reason.method) { // For simple counters with methods
                            return (
                                <p className="rec-reason">
                                    <strong><GlossaryTooltip term={reason.method}>{`【${reason.method}】`}</GlossaryTooltip></strong>
                                    {renderDetailWithTooltip(reason.description)}
                                </p>
                            );
                        }
                        return null;
                    })()}
                    {otherRoles.length > 0 && (
                        <p className="rec-other-roles">
                            その他の役割:&nbsp;
                            {otherRoles.map((role, index) => (
                                <React.Fragment key={index}>
                                    <span className="highlight">{role}</span>
                                    {index < otherRoles.length - 1 ? ', ' : ''}
                                </React.Fragment>
                            ))}
                        </p>
                    )}
                </div>                <div className="rec-card-right">
                    <button className="rec-add-btn" title="編成に追加（機能は将来実装予定）">+</button>
                </div>
            </div>
        );
    };

    const renderCategory = (title, category, icon) => {
        if (!recommendations[category] || recommendations[category].length === 0) {
            return null;
        }
        const isOpen = openCategory === category;
        return (
            <div className="rec-category">
                <div className="rec-category-header" onClick={() => toggleCategory(category)}>
                    <span>{isOpen ? '▼' : '▶'} {icon} {title} ({recommendations[category].length})</span>
                </div>
                {isOpen && (
                    <div className="rec-category-content">
                        {recommendations[category].map(renderRecommendationCard)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="recommended-megido-panel">
            <style>{`
                .recommended-megido-panel { margin: 12px 0; padding: 12px; background-color: #1f2937; border-radius: 8px; border: 1px solid #374151; }
                .rec-category-header { cursor: pointer; padding: 8px 0; font-weight: bold; color: #d1d5db; }
                .rec-category-content { padding-top: 8px; }
                .rec-card { display: flex; align-items: center; gap: 12px; background-color: #374151; padding: 12px; border-radius: 6px; margin-bottom: 8px; }
                .rec-card-left { flex-shrink: 0; position: relative; }
                .rec-megido-icon { width: 50px; height: 50px; border-radius: 50%; border: 3px solid #4b5563; }
                .style-rush { border-color: var(--rush-color, #e11d48); }
                .style-counter { border-color: var(--counter-color, #f97316); }
                .style-burst { border-color: var(--burst-color, #2563eb); }
                .rec-card-main { flex-grow: 1; }
                .rec-megido-name { margin: 0; font-size: 1rem; color: white; cursor: pointer; }
                .rec-megido-name:hover { text-decoration: underline; }
                .rec-reason { margin: 4px 0; font-size: 0.875rem; color: #d1d5db; }
                .rec-reason .highlight, .rec-other-roles .highlight { color: var(--primary-accent, #70F0E0); font-weight: bold; }
                .rec-other-roles { margin: 4px 0 0; font-size: 0.75rem; color: #9ca3af; }
                .rec-card-right { flex-shrink: 0; }
                .rec-add-btn { width: 30px; height: 30px; border-radius: 50%; background-color: #4b5563; color: white; border: none; font-size: 1.2rem; cursor: pointer; }
                .rec-add-btn:hover { background-color: #6b7280; }
            `}</style>
            <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>おすすめメギド</h5>
            {renderCategory('アタッカー候補', 'attackers', '🗡️')}
            {renderCategory('ジャマー候補', 'jammers', '🌀')}
            {renderCategory('サポーター候補', 'supporters', '🛡️')}
        </div>
    );
};

const PracticeActionPanel = ({
    square, // This is selectedSquare = { floor, square, id }
    formations,
    onResolve,
    megidoConditions,
    onCreateFormation,
    planState,
    ownedMegidoIds,
    megidoDetails,
    runState,
    onRecommendationChange,
    isLocked,
    lockText,
    isPlanMode,
    onPlanCombatParty,
    targetEnemy,
    onTargetEnemyChange,
    isResolvable,
    onSaveFormationMemo,
    onOpenCommunityFormations,
    recommendations,
    isGuideMode,
    openPlannerForSquare
}) => {
    const { useState, useEffect, useMemo, useCallback } = React;
    const [memoText, setMemoText] = useState('');

    const getEnemyName = (enemy) => (typeof enemy === 'string' ? enemy : enemy.name);

    const rehydrateFormation = useCallback((formation) => {
        if (!formation || !formation.megidoSlots) return { ...formation, megido: [] };

        const rehydratedMegido = formation.megidoSlots.map(slot => {
            if (!slot || !slot.megidoId) return null;

            const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(slot.megidoId));
            if (!megidoMaster) return null;

            const orb = slot.orbId ? COMPLETE_ORB_LIST.find(o => String(o.id) === String(slot.orbId)) : null;
            const reishou = (slot.reishouIds || []).map(rId => COMPLETE_REISHOU_LIST.find(r => String(r.id) === String(rId))).filter(Boolean);
            const details = megidoDetails[slot.megidoId] || {};

            return {
                ...megidoMaster,
                orb: orb,
                reishou: reishou,
                level: details.level || 70,
                ougiLevel: details.ougiLevel || 1,
                special_reishou: details.special_reishou || false,
                bond_reishou: details.bond_reishou || 0,
                singularity_level: details.singularity_level || 0,
            };
        });

        return { ...formation, megido: rehydratedMegido };
    }, [megidoDetails]);

    useEffect(() => {
        if (!isPlanMode && !isLocked && !targetEnemy && square.square.enemies && square.square.enemies.length === 1) {
            onTargetEnemyChange(getEnemyName(square.square.enemies[0]));
        }
    }, [square, isPlanMode, isLocked, targetEnemy, onTargetEnemyChange]);

    const [isHovered, setIsHovered] = useState({});

    const ghostButtonBaseStyle = {
        padding: '4px 8px',
        border: '1px solid var(--primary-accent)',
        color: 'var(--primary-accent)',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '12px',
        lineHeight: '1.5'
    };

    const ghostButtonHoverStyle = {
        ...ghostButtonBaseStyle,
        backgroundColor: 'var(--primary-accent)',
        color: 'var(--bg-panel, #2D2D2D)'
    };

    const { square: squareData, floor: floorData, id: squareId } = square;

    const [selectedFormationId, setSelectedFormationId] = useState('');
    const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState({ enemyName: '', slotIndex: 0 });

    useEffect(() => {
        if (!squareData || isPlanMode) return;
        const assignments = planState.assignments || {};
        const fullSquareId = `${floorData.floor}-${squareId}`;
        const firstEnemyName = squareData.enemies?.[0] ? getEnemyName(squareData.enemies[0]) : null;
        const plannedIds = assignments[fullSquareId]?.[firstEnemyName] || [];
        setSelectedFormationId(plannedIds.find(id => id) || '');
    }, [square, planState.assignments, isPlanMode]);

    if (!squareData) {
        return <div className="placeholder"><p>挑戦するマスをマップから選択してください。</p></div>;
    }

    const handleSlotClick = (enemyName, slotIndex) => {
        setModalContext({ enemyName, slotIndex });
        setIsModalOpen(true);
    };

    const handleSelectFormationForPlan = (formation) => {
        const { enemyName, slotIndex } = modalContext;
        const fullSquareId = `${floorData.floor}-${squareId}`;
        onPlanCombatParty(fullSquareId, enemyName, slotIndex, formation.id);
        setIsModalOpen(false);
    };

    const handleRemoveFormationForPlan = (enemyName, slotIndex) => {
        const fullSquareId = `${floorData.floor}-${squareId}`;
        onPlanCombatParty(fullSquareId, enemyName, slotIndex, null);
    };

    const formation = formations[selectedFormationId];
    const rehydratedSelectedFormation = useMemo(() => formation ? rehydrateFormation(formation) : null, [formation, rehydrateFormation]);
    const isFormationDisabled = rehydratedSelectedFormation && rehydratedSelectedFormation.megido.some(m => m && megidoConditions[String(m.id)] === '気絶');

    useEffect(() => {
        if (formation) {
            setMemoText(formation.notes || '');
        } else {
            setMemoText('');
        }
    }, [formation]);

    if (isPlanMode) {
        const assignments = planState.assignments || {};
        const fullSquareId = `${floorData.floor}-${squareId}`;
        const assignmentsForSquare = assignments[fullSquareId] || {};
        const formationList = Object.values(formations);

        return (
            <div style={{ position: 'relative' }}>
                <h3 className="card-header">{floorData.floor}F {getSquareTypeName(squareData.type)}</h3>
                <div className="form-section">
                    {squareData.enemies && squareData.enemies.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {squareData.enemies.map(enemy => {
                                const enemyName = getEnemyName(enemy);
                                return (
                                    <div key={enemyName} className="card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <h4 className="card-header" style={{ border: 'none', padding: 0, margin: 0 }}>{enemyName}</h4>
                                            <button
                                                onClick={() => onCreateFormation(enemyName, floorData.floor)}
                                                style={isHovered[enemyName] ? ghostButtonHoverStyle : ghostButtonBaseStyle}
                                                onMouseEnter={() => setIsHovered(prev => ({...prev, [enemyName]: true}))}
                                                onMouseLeave={() => setIsHovered(prev => ({...prev, [enemyName]: false}))}
                                            >
                                                新規編成作成
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {[0, 1, 2].map(slotIndex => {
                                                const plannedId = assignmentsForSquare[enemyName]?.[slotIndex];
                                                const plannedFormation = plannedId ? formations[plannedId] : null;
                                                return (
                                                    <div key={slotIndex} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <button onClick={() => handleSlotClick(enemyName, slotIndex)} className="plan-megido-slot empty" style={{ flex: 1, textAlign: 'left', paddingLeft: '12px' }}>
                                                            {plannedFormation ? (
                                                                <span style={{color: 'var(--text-main)'}}>{plannedFormation.name}</span>
                                                            ) : (
                                                                <span style={{color: 'var(--text-subtle)'}}>+ 第{slotIndex + 1}編成を選択</span>
                                                            )}
                                                        </button>
                                                        {plannedFormation && (
                                                            <button 
                                                                onClick={() => handleRemoveFormationForPlan(enemyName, slotIndex)} 
                                                                className="btn-close"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p>このマスには敵がいません。</p>}
                </div>
                <FilterableSelectionModal 
                    title="編成を選択" 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSelect={handleSelectFormationForPlan}
                    items={formationList}
                    renderItem={(item, onSelect) => (
                        <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn">
                            <p style={{fontWeight: 'bold'}}>{item.name}</p>
                        </button>
                    )}
                    isFormationSearch={true}
                />
            </div>
        );
    }

    const assignments = planState.assignments || {};
    const fullSquareId = `${floorData.floor}-${squareId}`;
    const plannedFormationIds = [...new Set(Object.values(assignments[fullSquareId] || {}).flat())].filter(Boolean);
    const formationList = Object.values(formations);
    const plannedFormations = plannedFormationIds.map(id => formations[id]).filter(Boolean);
    const otherFormations = formationList.filter(f => !plannedFormationIds.includes(f.id));

    const { glossaryData } = useAppContext(); // glossaryDataをコンテキストから取得

    const renderRulesWithTooltips = (rules) => {
        if (!glossaryData) return rules.join(', ');

        const allTerms = Object.keys(glossaryData);
        const regex = new RegExp(`(${allTerms.join('|')})`, 'g');

        return rules.map((rule, ruleIndex) => (
            <React.Fragment key={ruleIndex}>
                {rule.split(regex).map((part, partIndex) => {
                    if (allTerms.includes(part)) {
                        return (
                            <GlossaryTooltip key={partIndex} term={part}>
                                {part}
                            </GlossaryTooltip>
                        );
                    }
                    return part;
                })}
                {ruleIndex < rules.length - 1 ? ', ' : ''}
            </React.Fragment>
        ));
    };

    return (
        <div style={{ position: 'relative' }}>
            {isLocked && <LockedPanelOverlay text={lockText} />}
            <h3 className="card-header">{floorData.floor}F {getSquareTypeName(squareData.type)}</h3>
            {squareData.type === 'boss' && (
                <div style={{ margin: '12px 0' }}>
                    <button 
                        id="open-boss-planner-button"
                        onClick={() => openPlannerForSquare(floorData.floor, squareId)}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                    >
                        攻略計画を立てる
                    </button>
                </div>
            )}
            <div className="form-section">
                {squareData.enemies && squareData.enemies.map((enemy, index) => {
                    const enemyName = getEnemyName(enemy);
                    const isTargeted = targetEnemy === enemyName;
                    return (
                        <div key={`${enemyName}-${index}`} style={{ marginBottom: '8px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px',
                                backgroundColor: isTargeted ? 'var(--primary-accent-dark)' : 'var(--bg-main)',
                                borderRadius: '4px',
                                border: isTargeted ? '2px solid var(--primary-accent)' : '2px solid transparent',
                                transition: 'all 0.2s ease'
                            }}>
                                <div onClick={() => onTargetEnemyChange(enemyName)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1}}>
                                    {isTargeted && <span style={{color: '#70F0E0', fontWeight: 'bold', fontSize: '20px'}}>&gt;</span>}
                                    <span style={{ fontWeight: 'bold', color: isTargeted ? '#70F0E0' : 'var(--text-main)' }}>{enemyName}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button id={index === 0 ? "create-formation-button" : undefined} onClick={() => onCreateFormation(enemyName, floorData.floor)} className="btn btn-ghost p-1" title="新規編成">
                                        <img src="asset/create.webp" alt="新規編成" style={{width: '24px', height: '24px'}} />
                                    </button>
                                    <button id={index === 0 ? "community-formation-button" : undefined} onClick={() => onOpenCommunityFormations(floorData.floor, enemyName)} className="btn btn-ghost p-1" title="みんなの編成">
                                        <img src="asset/community.webp" alt="みんなの編成" style={{width: '24px', height: '24px'}} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {isGuideMode && recommendations && <RecommendedMegidoPanel recommendations={recommendations} onOpenCommunityFormations={onOpenCommunityFormations} />}
                {squareData.rules && squareData.rules.length > 0 && <p style={{marginTop: '12px'}}><strong>ルール:</strong> {renderRulesWithTooltips(squareData.rules)}</p>}
            </div>
            <div className="form-section">
                <label className="label">挑戦する編成:</label>
                <button onClick={() => setIsFormationModalOpen(true)} className="select-field-btn">
                    {formation ? formation.name : <span style={{color: 'var(--text-subtle)'}}>編成を選択...</span>}
                </button>
            </div>
            {selectedFormationId && formation && (
                <div className="form-section">
                    <label className="label" style={{marginBottom: '8px'}}>編成メモ:</label>
                    <textarea
                        value={memoText}
                        onChange={(e) => setMemoText(e.target.value)}
                        className="textarea-field"
                        rows="4"
                        placeholder="この編成に関するメモ..."
                        style={{width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)'}}
                    ></textarea>
                    <button 
                        onClick={() => onSaveFormationMemo(selectedFormationId, memoText)} 
                        className="btn btn-primary" 
                        style={{marginTop: '8px'}}
                    >
                        メモを保存
                    </button>
                </div>
            )}
            {isFormationDisabled && <p style={{color: 'var(--danger-color)', fontSize: '12px', marginTop: '12px'}}>この編成には気絶状態のメギドが含まれているため、使用できません。</p>}
            {!isResolvable && !isLocked && <p style={{color: 'var(--warning-color)', fontSize: '12px', marginTop: '12px'}}>このマスはクリア済みのマスに隣接していないため、挑戦結果を記録できません。</p>}
            
            <FilterableSelectionModal 
                title="編成を選択" 
                isOpen={isFormationModalOpen} 
                onClose={() => setIsFormationModalOpen(false)} 
                onSelect={(item) => {
                    setSelectedFormationId(item.id);
                    setIsFormationModalOpen(false);
                }}
                items={plannedFormations}
                secondaryItems={otherFormations}
                renderItem={(item, onSelect) => {
                    const rehydratedItem = rehydrateFormation(item);
                    const isInvalid = getFormationInvalidReason(rehydratedItem, megidoDetails, ownedMegidoIds);
                    return (
                        <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn" style={isInvalid ? { color: 'var(--danger-color)' } : {}}>
                            <p style={{fontWeight: 'bold'}}>{item.name}</p>
                        </button>
                    )
                }}
                isFormationSearch={true}
            />
            <div style={{marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px'}}>
                <button id="win-button" onClick={() => onResolve('win', rehydratedSelectedFormation, square)} disabled={!selectedFormationId || isFormationDisabled || !isResolvable} className="btn btn-ghost-win">勝利</button>
                <button onClick={() => onResolve('lose', rehydratedSelectedFormation, square)} disabled={!selectedFormationId || isFormationDisabled || !isResolvable} className="btn btn-ghost-lose">敗北</button>
                <button onClick={() => onResolve('retreat', rehydratedSelectedFormation, square)} disabled={!selectedFormationId || !isResolvable} className="btn btn-ghost-retire">リタイア</button>
            </div>
        </div>
    );
};