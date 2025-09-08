const getSquareTypeName = (type) => {
    const map = {
        'battle': '戦闘',
        'boss': 'ボス',
        'explore': '探索',
        'start': 'スタート'
    };
    return map[type] || type;
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
    onSaveFormationMemo
}) => {
    const { useState, useEffect } = React;
    const [memoText, setMemoText] = useState('');

    useEffect(() => {
        if (!isPlanMode && !isLocked && !targetEnemy && square.square.enemies && square.square.enemies.length === 1) {
            onTargetEnemyChange(square.square.enemies[0]);
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

    // Destructure for easier access and to avoid confusion
    const { square: squareData, floor: floorData, id: squareId } = square;

    // --- State for both modes ---
    const [selectedFormationId, setSelectedFormationId] = useState('');
    const [isFormationModalOpen, setIsFormationModalOpen] = useState(false);

    // --- State for Plan Mode Modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState({ enemyName: '', slotIndex: 0 });

    // --- Effect to update selected formation when square changes ---
    useEffect(() => {
        if (!squareData || isPlanMode) return;
        const assignments = planState.assignments || {};
        const fullSquareId = `${floorData.floor}-${squareId}`;
        const firstEnemy = squareData.enemies?.[0];
        const plannedIds = assignments[fullSquareId]?.[firstEnemy] || [];
        setSelectedFormationId(plannedIds.find(id => id) || '');
    }, [square, planState.assignments, isPlanMode]);

    if (!squareData) {
        return <div className="placeholder"><p>挑戦するマスをマップから選択してください。</p></div>;
    }

    // --- Event Handlers for Plan Mode ---
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

    // --- Common Render Logic ---
    const formation = formations.find(f => f.id === selectedFormationId);
    const isFormationDisabled = formation && formation.megido.some(m => m && (megidoConditions[String(m.id)] === '気絶' || megidoConditions[String(m.id)] === '絶不調'));

    useEffect(() => {
        if (formation) {
            setMemoText(formation.notes || '');
        } else {
            setMemoText('');
        }
    }, [formation]);

    // --- RENDER FOR PLAN MODE ---
    if (isPlanMode) {
        const assignments = planState.assignments || {};
        const fullSquareId = `${floorData.floor}-${squareId}`;
        const assignmentsForSquare = assignments[fullSquareId] || {};

        return (
            <div style={{ position: 'relative' }}>
                <h3 className="card-header">{floorData.floor}F {getSquareTypeName(squareData.type)}</h3>
                <div className="form-section">
                    {squareData.enemies && squareData.enemies.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {squareData.enemies.map(enemy => (
                                <div key={enemy} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h4 className="card-header" style={{ border: 'none', padding: 0, margin: 0 }}>{enemy}</h4>
                                        <button
                                            onClick={() => onCreateFormation(enemy, floorData.floor)}
                                            style={isHovered[enemy] ? ghostButtonHoverStyle : ghostButtonBaseStyle}
                                            onMouseEnter={() => setIsHovered(prev => ({...prev, [enemy]: true}))}
                                            onMouseLeave={() => setIsHovered(prev => ({...prev, [enemy]: false}))}
                                        >
                                            新規編成作成
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {[0, 1, 2].map(slotIndex => {
                                            const plannedId = assignmentsForSquare[enemy]?.[slotIndex];
                                            const plannedFormation = plannedId ? formations.find(f => f.id === plannedId) : null;
                                            return (
                                                <div key={slotIndex} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <button onClick={() => handleSlotClick(enemy, slotIndex)} className="plan-megido-slot empty" style={{ flex: 1, textAlign: 'left', paddingLeft: '12px' }}>
                                                        {plannedFormation ? (
                                                            <span style={{color: 'var(--text-main)'}}>{plannedFormation.name}</span>
                                                        ) : (
                                                            <span style={{color: 'var(--text-subtle)'}}>+ 第{slotIndex + 1}編成を選択</span>
                                                        )}
                                                    </button>
                                                    {plannedFormation && (
                                                        <button 
                                                            onClick={() => handleRemoveFormationForPlan(enemy, slotIndex)} 
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
                            ))}
                        </div>
                    ) : <p>このマスには敵がいません。</p>}
                </div>
                <FilterableSelectionModal 
                    title="編成を選択" 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSelect={handleSelectFormationForPlan}
                    items={formations}
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

    // --- RENDER FOR PRACTICE MODE ---
    const assignments = planState.assignments || {};
    const fullSquareId = `${floorData.floor}-${squareId}`;
    const plannedFormationIds = [...new Set(Object.values(assignments[fullSquareId] || {}).flat())].filter(Boolean);
    const plannedFormations = plannedFormationIds.map(id => formations.find(f => f.id === id)).filter(Boolean);
    const otherFormations = formations.filter(f => !plannedFormationIds.includes(f.id));

    return (
        <div style={{ position: 'relative' }}>
            {isLocked && <LockedPanelOverlay text={lockText} />}
            <h3 className="card-header">{floorData.floor}F {getSquareTypeName(squareData.type)}</h3>
            <div className="form-section">
                {squareData.enemies && squareData.enemies.map(enemy => {
                    const isTargeted = targetEnemy === enemy;
                    return (
                        <div key={enemy} style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '8px', 
                            backgroundColor: isTargeted ? 'var(--primary-accent-dark)' : 'var(--bg-main)', 
                            borderRadius: '4px', 
                            marginBottom: '8px',
                            border: isTargeted ? '2px solid var(--primary-accent)' : '2px solid transparent',
                            transition: 'all 0.2s ease'
                        }}>
                            <span style={{ fontWeight: 'bold', color: isTargeted ? 'var(--bg-main)' : 'var(--text-main)' }}>{enemy}</span>
                            <div>
                                <button onClick={() => onTargetEnemyChange(enemy)} className="btn btn-secondary btn-small">{isTargeted ? 'ターゲット中' : 'ターゲット'}</button>
                                <button onClick={() => onCreateFormation(enemy, floorData.floor)} className="btn btn-primary btn-small" style={{marginLeft: '8px'}}>新規編成作成</button>
                            </div>
                        </div>
                    )
                })}
                {squareData.rules && squareData.rules.length > 0 && <p style={{marginTop: '12px'}}><strong>ルール:</strong> {squareData.rules.join(', ')}</p>}
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
            {isFormationDisabled && <p style={{color: 'var(--danger-color)', fontSize: '12px', marginTop: '12px'}}>この編成には絶不調または気絶状態のメギドが含まれているため、使用できません。</p>}
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
                    const isInvalid = isFormationInvalid(item, megidoDetails, ownedMegidoIds);
                    return (
                        <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn" style={isInvalid ? { color: 'var(--danger-color)' } : {}}>
                            <p style={{fontWeight: 'bold'}}>{item.name}</p>
                        </button>
                    )
                }}
                isFormationSearch={true}
            />
            <div style={{marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px'}}>
                <button onClick={() => onResolve('win', formation, square)} disabled={!selectedFormationId || isFormationDisabled || !isResolvable} className="btn btn-ghost-win">勝利</button>
                <button onClick={() => onResolve('lose', formation, square)} disabled={!selectedFormationId || isFormationDisabled || !isResolvable} className="btn btn-ghost-lose">敗北</button>
                <button onClick={() => onResolve('retreat', formation, square)} disabled={!selectedFormationId || !isResolvable} className="btn btn-ghost-retire">リタイア</button>
            </div>
        </div>
    );
};