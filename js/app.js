const { useState, useEffect, useMemo, useRef, useCallback } = React;
window.AppContext = React.createContext();
const useAppContext = () => React.useContext(AppContext);

const RightPanelContent = () => {
    const {
        activeTab, selectedSquare, runState, towerConnections, 
        handleCreateFormationFromEnemy, 
        megidoDetails, handleMegidoDetailChangeWrapper, handleCheckDistributedMegido,
        isMobileView, setModalState, bossSquadIds, editingFormation, handleSaveFormation,
        handleCancelFormationEdit, ownedMegidoIds, initialTagTarget, previousScreen,
        showToastMessage, onTargetSelect, formations, handleDeleteFormation, handleCopyFormation,
        setInitialTagTarget, setPreviousScreen, onCancel, isQriousLoaded, isHtml5QrLoaded,
        onImport, idMaps, setEditingFormation, handleOpenCommunityFormations, handlePostFormation,
        isPosting, bossFormationId, handleSetBossFormation, isGuideMode, onGenerateShareImage,
        generatedImageData, showShareModal, setShowShareModal, tweetUrl, handleResolveSquare,
        megidoConditions, planState, onRecommendationChange, handlePlanCombatParty,
        targetedEnemy, bossGuides, handleTargetEnemyChange, handleSaveFormationMemo,
        openPlannerForSquare, recommendations, memos, onSaveMemo, seasonLogs, isResolvable,
        manualExplorationPowers, onOpenManualPowerInput, onSetManualPower, onPlanExplorationParty,
        formationAssignments,
        autoExploreExcludedIds, handleToggleAutoExploreExclusion,
        unlockAchievement, handleIncrementAutoAssignUse
    } = useAppContext();

            return (<>

            <div className="tab-content" style={{marginTop: '0.5rem', height: '100%'}}>

                <div style={{ display: activeTab === 'details' ? 'block' : 'none', height: '100%' }}>

                    {!selectedSquare && <div className="placeholder" style={{height: '100%'}}>マスを選択してください</div>}

                    {selectedSquare && (() => {

                        const floorNum = selectedSquare.floor.floor;

                        const clearedSquaresOnFloor = runState.cleared[floorNum] || [];

                        const isCleared = clearedSquaresOnFloor.includes(selectedSquare.id);

                        const isPastFloor = floorNum < runState.highestFloorReached;

                        

                        let isResolvable = false;

                        if (!isCleared) {

                            const connectionsForFloor = towerConnections[floorNum];

                            const fullCurrentSquareId = selectedSquare.id;

    

                            if (connectionsForFloor && connectionsForFloor[fullCurrentSquareId]) {

                                const neighbors = connectionsForFloor[fullCurrentSquareId];

                                isResolvable = neighbors.some(neighborId => clearedSquaresOnFloor.includes(neighborId));

                            }

                        }

    

                        let isLocked = false;

                        let lockText = '';

                        

                            if (isPastFloor) {

                                isLocked = true;

                                lockText = '階移動済み';

                            } else if (isCleared && selectedSquare.square.type !== 'start') {

                                isLocked = true;

                                lockText = '解放済み';

                            }

                        
    

                        if (selectedSquare.square.type === 'start') {

                            return <StartSquarePanel square={selectedSquare} isLocked={isLocked} lockText={lockText} onCreateFormation={handleCreateFormationFromEnemy} />; 

                        } else if (selectedSquare.square.type === 'explore') {

                            return <ExplorationActionPanel 

                                key={selectedSquare.id}

                                square={selectedSquare}

                                ownedMegidoIds={ownedMegidoIds}

                                megidoDetails={megidoDetails}

                                megidoConditions={megidoConditions}

                                onResolve={handleResolveSquare}

                                recommendation={runState.recommendations[selectedSquare.id]}

                                onRecommendationChange={onRecommendationChange}

                                explorationAssignments={planState.explorationAssignments}

                                onPlanExplorationParty={onPlanExplorationParty}

                                planState={planState}

                                memos={memos}

                                onSaveMemo={onSaveMemo}

                                showToastMessage={showToastMessage}

                                isLocked={isLocked}

                                lockText={lockText}

                                runState={runState}

                                formations={formations}

                                seasonLogs={seasonLogs}

                                isResolvable={isResolvable}

                                setModalState={setModalState}

                                towerConnections={towerConnections}

                                manualPower={manualExplorationPowers[selectedSquare.id]}

                                onOpenManualPowerInput={onOpenManualPowerInput}

                                onSetManualPower={onSetManualPower}

                                autoExploreExcludedIds={autoExploreExcludedIds}

                                                                onToggleAutoExploreExclusion={handleToggleAutoExploreExclusion}

                                                                                                unlockAchievement={unlockAchievement}

                                                                                                handleIncrementAutoAssignUse={handleIncrementAutoAssignUse}

                                                                                            />;

                        } else {

                            return <PracticeActionPanel 

                                key={selectedSquare.id}

                                square={selectedSquare}

                                formations={formations}

                                onResolve={handleResolveSquare}

                                megidoConditions={megidoConditions}

                                onCreateFormation={handleCreateFormationFromEnemy}

                                planState={planState}

                                ownedMegidoIds={ownedMegidoIds}

                                megidoDetails={megidoDetails}

                                runState={runState}

                                onRecommendationChange={onRecommendationChange}

                                isLocked={isLocked}

                                lockText={lockText}

                                onPlanCombatParty={handlePlanCombatParty}

                                targetedEnemy={targetedEnemy}

                                bossGuides={bossGuides}

                                onTargetEnemyChange={(enemyName) => handleTargetEnemyChange(selectedSquare.id, enemyName)}

                                isResolvable={isResolvable}

                                onSaveFormationMemo={handleSaveFormationMemo}
                                seasonLogs={seasonLogs}

                                onOpenCommunityFormations={handleOpenCommunityFormations}

                                recommendations={recommendations}

                                isGuideMode={isGuideMode}

                                openPlannerForSquare={openPlannerForSquare}

                            />;

                        }

                    })()
                }
            </div>
            <div style={{ display: activeTab === 'ownership' ? 'block' : 'none', height: '100%' }}>
                <OwnershipManager 
                    megidoDetails={megidoDetails} 
                    onDetailChange={handleMegidoDetailChangeWrapper}
                    onCheckDistributed={handleCheckDistributedMegido}
                    setModalState={setModalState}
                    bossSquadIds={bossSquadIds}
                />
            </div>
            <div style={{ display: activeTab === 'formation' ? 'block' : 'none', height: '100%' }}>
                <div style={{ display: editingFormation ? 'block' : 'none', height: '100%' }}>
                    {editingFormation && <FormationEditor
                        formation={editingFormation}
                        onSave={handleSaveFormation}
                        onCancel={handleCancelFormationEdit}
                        ownedMegidoIds={ownedMegidoIds}
                        megidoDetails={megidoDetails}
                        initialTagTarget={initialTagTarget}
                        previousScreen={previousScreen}
                        showToastMessage={showToastMessage}
                        onTargetSelect={onTargetSelect}
                    />}
                </div>
                <div style={{ display: !editingFormation ? 'block' : 'none', height: '100%' }}>
                    {!editingFormation && <FormationManager
                        formations={formations} 
                        onSave={handleSaveFormation} 
                        onDelete={handleDeleteFormation} 
                        onCopy={handleCopyFormation} 
                        ownedMegidoIds={ownedMegidoIds} 
                        megidoDetails={megidoDetails}
                        initialTagTarget={initialTagTarget}
                        setInitialTagTarget={setInitialTagTarget}
                        showToastMessage={showToastMessage}
                        setPreviousScreen={setPreviousScreen}
                        previousScreen={previousScreen}
                        onTargetSelect={onTargetSelect}
                        onCancel={onCancel}
                        isQriousLoaded={isQriousLoaded}
                        isHtml5QrLoaded={isHtml5QrLoaded}
                        onImport={onImport}
                        idMaps={idMaps}
                        editingFormation={editingFormation}
                        onEditingFormationChange={setEditingFormation}
                        onOpenCommunityFormations={handleOpenCommunityFormations}
                        handlePostFormation={handlePostFormation} 
                        isPosting={isPosting}
                        onGenerateShareImage={onGenerateShareImage}
                        generatedImageData={generatedImageData}
                        showShareModal={showShareModal}
                        setShowShareModal={setShowShareModal}
                        tweetUrl={tweetUrl}
                        formationAssignments={formationAssignments}
                    />}
                </div>
            </div>
        </div>
    </>);
};

const MapContent = () => {
    const { 
        TOWER_MAP_DATA, floorRefs, handleSquareClick, activePreviewId, setActivePreviewId,
        getSquareStyle, getSquareColorClass, getSquareColorRgbVarName, memos, planState,
        targetFloor, selectedSquare, runState, guidance, highlightedSquares, showFloorGuide
    } = useAppContext();

    return (
        <React.Fragment>
            {typeof TOWER_MAP_DATA !== 'undefined' && TOWER_MAP_DATA.map(floor => (
                <div ref={el => floorRefs.current[floor.floor] = el} key={floor.floor} style={{ scrollSnapAlign: 'start' }}>
                    <FloorGrid
                        key={floor.floor}
                        floorData={floor}
                        handleSquareClick={handleSquareClick}
                        activePreviewId={activePreviewId}
                        setActivePreviewId={setActivePreviewId}
                        getSquareStyle={getSquareStyle}
                        getSquareColorClass={getSquareColorClass}
                        getSquareColorRgbVarName={getSquareColorRgbVarName}
                        memos={memos}
                        activeFloor={planState.activeFloor}
                        targetFloor={targetFloor}
                        selectedSquare={selectedSquare}
                        runState={runState}
                        planState={planState}
                        guidance={guidance}
                        highlightedSquares={highlightedSquares}
                        showFloorGuide={showFloorGuide}
                    />
                </div>
            ))}
        </React.Fragment>
    );
};

const ShareModal = ({ isOpen, onClose, imageData, tweetUrl }) => {
    if (!isOpen) return null;

    return (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200}}>
            <div className="card" style={{textAlign: 'center', padding: '20px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto'}}>
                <h3 style={{marginTop: 0}}>生成された共有画像</h3>
                <img src={imageData} style={{maxWidth: '100%', height: 'auto', border: '1px solid #ccc'}} />
                <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px'}}>
                    <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">ツイート</a>
                    <button onClick={onClose} className="btn btn-secondary">閉じる</button>
                </div>
            </div>
        </div>
    );
};

const LogSummary = ({ selectedLog }) => {
    if (!selectedLog) {
        return <div className="placeholder">ログを選択してください</div>;
    }

    const { runState, megidoConditions, planState } = selectedLog;

    const totalBattles = runState.history.filter(h => h.type === 'battle').length;
    const wins = runState.history.filter(h => h.type === 'battle' && h.result === 'win').length;
    const losses = runState.history.filter(h => h.type === 'battle' && h.result === 'lose').length;
    const retreats = runState.history.filter(h => h.type === 'battle' && h.result === 'retreat').length;
    const explorations = runState.history.filter(h => h.type === 'explore').length;

    const SummaryCard = ({ title, children }) => (
        <div className="card" style={{ marginBottom: '1rem' }}>
            <h4 className="card-header">{title}</h4>
            <div style={{ padding: '1rem' }}>{children}</div>
        </div>
    );

    const StatItem = ({ label, value }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
            <span>{label}</span>
            <span style={{ fontWeight: 'bold' }}>{value}</span>
        </div>
    );

    return (
        <div style={{ padding: '1rem' }}>
            <SummaryCard title="総合結果">
                <StatItem label="到達階層" value={`${runState.highestFloorReached}F`} />
                <StatItem label="最終塔破力" value={runState.towerPower} />
                <StatItem label="総回復塔破力" value={runState.totalPowerRecovered || 0} />
            </SummaryCard>
            <SummaryCard title="戦闘記録">
                <StatItem label="総戦闘回数" value={totalBattles} />
                <StatItem label="勝利" value={wins} />
                <StatItem label="敗北" value={losses} />
                <StatItem label="リタイア" value={retreats} />
            </SummaryCard>
            <SummaryCard title="探索記録">
                <StatItem label="総探索回数" value={explorations} />
            </SummaryCard>
        </div>
    );
};

const LogActionModal = ({ isOpen, onClose, squareKey, selectedLog, towerData }) => {
    if (!isOpen || !selectedLog || !squareKey) return null;

    const [floorNum, ...idParts] = squareKey.split('-');
    const squareId = idParts.join('-');
    
    const history = selectedLog.runState.history.filter(h => 
        String(h.floor) === floorNum && h.squareId === squareId
    );

    const floorData = towerData.find(f => String(f.floor) === floorNum);
    const squareData = floorData?.squares[squareId];

    const getActionText = (action) => {
        switch (action.type) {
            case 'battle':
                return `戦闘: ${action.result === 'win' ? '勝利' : action.result === 'lose' ? '敗北' : 'リタイア'}`;
            case 'explore':
                return `探索`;
            default:
                return '不明なアクション';
        }
    };

    return (
        <div className="mobile-modal-overlay" onClick={onClose}>
            <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()} style={{display: 'flex', flexDirection: 'column', maxHeight: '85vh', padding: 0}}>
                <div style={{ flexShrink: 0, padding: '1rem' }}>
                    <h3 style={{marginTop: 0, textAlign: 'center'}}>{floorNum}F - {squareData?.type}マス</h3>
                </div>
                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0 1rem' }}>
                    {history.length > 0 ? (
                        history.map((action, index) => (
                            <div key={index} className="card" style={{marginBottom: '0.5rem', padding: '0.75rem'}}>
                                <p style={{margin: 0, fontWeight: 'bold'}}>{getActionText(action)}</p>
                                <p style={{margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-subtle)'}}>
                                    {new Date(action.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p style={{textAlign: 'center', color: 'var(--text-subtle)'}}>このマスでのアクション履歴はありません。</p>
                    )}
                </div>
                <div style={{ flexShrink: 0, padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border-color-light)' }}>
                </div>
            </div>
        </div>
    );
};

const TowerTool = () => {
    const [currentUser, setCurrentUser] = useState(null);

    // 認証状態の監視
    useEffect(() => {
        const unsubscribe = onAuthChange(user => {
            setCurrentUser(user);
        });
        return () => unsubscribe(); // クリーンアップ
    }, []);

    const handleSignIn = async (provider) => {
        const user = await signInWithProvider(provider);
        if (user) {
            showToastMessage(`${user.displayName}としてログインしました。`);
        }
    };

    const handleSignOut = async () => {
        await signOutUser();
        showToastMessage('ログアウトしました。');
    };

    const [showSettings, setShowSettings] = useState(false);
    const [showProfileGenerator, setShowProfileGenerator] = useState(false);
    const [allAchievements, setAllAchievements] = useState(ACHIEVEMENTS);



    const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
        const saved = localStorage.getItem('unlockedAchievements');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [winStreak, setWinStreak] = useState(() => {
        const saved = localStorage.getItem('winStreak');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [floorClearCounts, setFloorClearCounts] = useState(() => {
        const saved = localStorage.getItem('floorClearCounts');
        return saved ? JSON.parse(saved) : {};
    });
    const [themeToggleCount, setThemeToggleCount] = useState(() => {
        const saved = localStorage.getItem('themeToggleCount');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [dataManagementCount, setDataManagementCount] = useState(() => {
        const saved = localStorage.getItem('dataManagementCount');
        return saved ? parseInt(saved, 10) : 0;
    });
    const [autoAssignUseCount, setAutoAssignUseCount] = useState(() => parseInt(localStorage.getItem('autoAssignUseCount') || '0'));
    const [mapSearchCount, setMapSearchCount] = useState(() => parseInt(localStorage.getItem('mapSearchCount') || '0'));
    const [aboutPageOpenCount, setAboutPageOpenCount] = useState(() => parseInt(localStorage.getItem('aboutPageOpenCount') || '0'));
    const [loginData, setLoginData] = useState(() => {
        const saved = localStorage.getItem('loginData');
        return saved ? JSON.parse(saved) : { firstLogin: Date.now(), lastLogin: null, consecutiveDays: 0 };
    });

    useEffect(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const lastLogin = loginData.lastLogin ? new Date(loginData.lastLogin).setHours(0, 0, 0, 0) : null;

        let newConsecutiveDays = loginData.consecutiveDays;
        if (lastLogin === null || lastLogin === today) {
            // First login of the day or first ever login
            if (lastLogin === null) {
                newConsecutiveDays = 1;
            }
        } else if (today - lastLogin === 86400000) {
            // Consecutive day
            newConsecutiveDays++;
        } else {
            // Missed a day
            newConsecutiveDays = 1;
        }

        const newLoginData = { ...loginData, lastLogin: Date.now(), consecutiveDays: newConsecutiveDays };
        setLoginData(newLoginData);
        localStorage.setItem('loginData', JSON.stringify(newLoginData));
    }, []); // Runs once on app load
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('ui_activeTab');
        const allowedTabs = ['details', 'ownership', 'formation', 'summary', 'all_summary'];
        return (savedTab && allowedTabs.includes(savedTab)) ? savedTab : 'details';
    });
    const [selectedSquare, setSelectedSquare] = useState(null);
    
    const [memos, setMemos] = useState(() => {
        const saved = localStorage.getItem('memos');
        return saved ? JSON.parse(saved) : {};
    });
    const [seasonLogs, setSeasonLogs] = useState(() => {
        const saved = localStorage.getItem('seasonLogs');
        return saved ? JSON.parse(saved) : [];
    });

    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedLogSquare, setSelectedLogSquare] = useState(null);
    const [logActionModal, setLogActionModal] = useState({ isOpen: false, squareKey: null });

    const [practiceView, setPracticeView] = useState('action');
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [recoveryModalState, setRecoveryModalState] = useState({ isOpen: false });
    const [choiceModalState, setChoiceModalState] = useState({ isOpen: false });
    const [statusBuffModalState, setStatusBuffModalState] = useState({ isOpen: false });
    const [infoModalState, setInfoModalState] = useState({ isOpen: false });
    const [guideStep, setGuideStep] = useState(() => localStorage.getItem('guideStep') || null);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [achievementToast, setAchievementToast] = useState(null);
    const [targetFloor, setTargetFloor] = useState(() => {
        const saved = localStorage.getItem('ui_targetFloor');
        return saved ? parseInt(saved, 10) : 35;
    });

    useEffect(() => {
        localStorage.setItem('ui_targetFloor', targetFloor);
    }, [targetFloor]);
    const [displayedEnemy, setDisplayedEnemy] = useState(null);
    const [eventToast, setEventToast] = useState(null);
    const [eventQueue, setEventQueue] = useState([]);
    const [shouldShowBetaModal, setShouldShowBetaModal] = useState(false);
    const [isBirthdayButtonHovered, setIsBirthdayButtonHovered] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [guidance, setGuidance] = useState({ recommended: null, candidates: {} });
    const [partyConditionRisk, setPartyConditionRisk] = useState(0);
    const [isRecoveryRecommended, setIsRecoveryRecommended] = useState(false);
    const [isRouteObvious, setIsRouteObvious] = useState(false);
    const [detailPanelTab, setDetailPanelTab] = useState('info'); // State for inner tabs

    useEffect(() => {
        // When the selected square changes, always reset the inner tab to the default
        setDetailPanelTab('info');
    }, [selectedSquare]);
    const [targetEnemies, setTargetEnemies] = useState(() => {
        const saved = localStorage.getItem('targetEnemies');
        return saved ? JSON.parse(saved) : {};
    });

    const [showBetaModal, setShowBetaModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showGuideIntroModal, setShowGuideIntroModal] = useState(false);
    const [isFooterCollapsed, setIsFooterCollapsed] = useState(() => {
        const saved = localStorage.getItem('isFooterCollapsed');
        return saved ? JSON.parse(saved) : true; // Default to collapsed
    });
    const [isMapSearchModalOpen, setIsMapSearchModalOpen] = useState(false);
    const [activePreviewId, setActivePreviewId] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isFirstEverLaunch, setIsFirstEverLaunch] = useState(false);
    const [introQueue, setIntroQueue] = useState([]);
    const [spotlight, setSpotlight] = useState({ selector: null, text: null });
    const [autoExploreExcludedIds, setAutoExploreExcludedIds] = useState(() => new Set(JSON.parse(localStorage.getItem('autoExploreExcludedIds') || '[]')));

    const handleToggleAutoExploreExclusion = (megidoId) => {
        setAutoExploreExcludedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(megidoId)) {
                newSet.delete(megidoId);
            } else {
                newSet.add(megidoId);
            }
            localStorage.setItem('autoExploreExcludedIds', JSON.stringify(Array.from(newSet)));
            return newSet;
        });
    };

    const floorRefs = useRef({});
    const prevFloorRef = useRef();

    const [completedGuideSteps, setCompletedGuideSteps] = useState(() => new Set(JSON.parse(localStorage.getItem('completedGuideSteps')) || []));

    const [megidoList, setMegidoList] = useState(null);
    const [bossGuides, setBossGuides] = useState(null);
    const [floorMessages, setFloorMessages] = useState(null);
    const [highlightedSquares, setHighlightedSquares] = useState(null);
    const [floorGuideModalState, setFloorGuideModalState] = useState({ isOpen: false, floorNum: null });
    const [bossPlannerState, setBossPlannerState] = useState({ isOpen: false, boss: null, recommendations: null, floorNum: null });
    const [glossaryData, setGlossaryData] = useState(null);
    const [shownBossGuides, setShownBossGuides] = useState(() => {
        const saved = localStorage.getItem('shownBossGuides');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        localStorage.setItem('shownBossGuides', JSON.stringify(Array.from(shownBossGuides)));
    }, [shownBossGuides]);

    useEffect(() => {
        Promise.all([
            fetch('data/megido.json').then(res => res.json()),
            fetch('data/orbs.json').then(res => res.json()),
            fetch('data/reishou.json').then(res => res.json()),
            fetch('data/birthday.json').then(res => res.json()),
            fetch('data/tower.json').then(res => res.json()),
            fetch('data/boss_guides.json').then(res => res.json()),
            fetch('data/floor_messages.json').then(res => res.json()),
            fetch('data/glossary.json').then(res => res.json()),
            fetch(`js/enemy_all_data.js?v=${Date.now()}`).then(res => res.text())
        ]).then(([megidoData, orbsData, reishouData, birthdayData, towerData, guidesData, messagesData, glossaryData, enemyText]) => {
            window.COMPLETE_MEGIDO_LIST = megidoData;
            setMegidoList(megidoData);
            setBossGuides(guidesData);
            setFloorMessages(messagesData);
            setGlossaryData(glossaryData);

            window.COMPLETE_ORB_LIST = orbsData;
            window.COMPLETE_REISHOU_LIST = reishouData;
            window.MEGIDO_BIRTHDAY_DATA = birthdayData;
            window.TOWER_MAP_DATA = towerData;

            const enemyObjectString = enemyText.substring(enemyText.indexOf('{'));
            window.ENEMY_ALL_DATA = new Function(`return ${enemyObjectString}`)();

            setAllAchievements(ACHIEVEMENTS);

            setIsLoading(false);
        }).catch(error => {
            console.error('Error loading master data:', error);
        });
    }, []);



    const handleOpenMapSearch = () => {
        setMapSearchCount(c => c + 1);
        setIsMapSearchModalOpen(true);
    };
    const handleCloseMapSearch = () => setIsMapSearchModalOpen(false);

    
    

    const isMobileSize = useMediaQuery('(max-width: 768px)');
    const isTabletSize = useMediaQuery('(min-width: 769px) and (max-width: 1180px)');
    const [viewMode, setViewMode] = useState('mobile');
    const isMobileView = viewMode === 'mobile' || (viewMode === 'auto' && isMobileSize);
    const isTabletView = viewMode === 'tablet' || (viewMode === 'auto' && isTabletSize);

    useEffect(() => {
        document.body.classList.toggle('mobile-view', isMobileView);
        document.body.classList.toggle('tablet-view', isTabletView && !isMobileView);
    }, [isMobileView, isTabletView]);

    const handleToggleFooter = () => {
        const newCollapsedState = !isFooterCollapsed;
        setIsFooterCollapsed(newCollapsedState);
        localStorage.setItem('isFooterCollapsed', JSON.stringify(newCollapsedState));
    };

    const handleTutorialComplete = () => {
        setShowTutorial(false);
        setIntroQueue(q => q.filter(item => item !== 'tutorial'));
        setChoiceModalState({
            isOpen: true,
            title: 'ガイドモードを開始しますか？',
            message: '続けて、あなたの戦力に合わせた攻略目標を提示する「ガイダンスモード」を開始しますか？\nこのモードは、より具体的な次のステップを示し、あなたの攻略をサポートします。',
            options: [
                { label: 'はい、開始する', value: 'yes', className: 'btn-primary' },
                { label: 'いいえ、結構です', value: 'no', className: 'btn-secondary' },
            ],
            onConfirm: (value) => {
                if (value === 'yes') {
                    setIsGuideMode(true);
                    setGuideStep('WELCOME_MODAL'); // Explicitly start the guide
                    showToastMessage('ガイダンスモードを開始しました。');
                }
                setChoiceModalState({ isOpen: false });
            }
        });
    };

    const openPlannerForSquare = (floorNum, squareId, onCloseCallback) => {
        const floorData = TOWER_MAP_DATA.find(f => f.floor === floorNum);
        if (!floorData) return;
        const squareData = floorData.squares[squareId];
        if (!squareData || !squareData.enemies || squareData.enemies.length === 0) {
            showToastMessage('指定されたマスの敵情報が見つかりません。');
            return;
        }

        const enemyObject = normalizeEnemy(squareData.enemies[0]);
        if (bossGuides && bossGuides[enemyObject.name]) {
            enemyObject.guide = bossGuides[enemyObject.name];
        }

        setBossPlannerState({
            isOpen: true,
            boss: enemyObject,
            floorNum: floorNum,
            onCloseCallback: onCloseCallback
        });
    };

    const openBossPlannerForFloor = (bossFloor, onCloseCallback) => {
        const floorData = TOWER_MAP_DATA.find(f => f.floor === bossFloor);
        if (!floorData) return;
        const bossSquareId = Object.keys(floorData.squares).find(id => floorData.squares[id].type === 'boss');
        if (bossSquareId) {
            openPlannerForSquare(bossFloor, bossSquareId, onCloseCallback);
        } else {
            showToastMessage(`${bossFloor}階にボスが見つかりません。`);
        }
    };

    const askForInitialBossPlans = () => {
        const showModal = (planned = new Set()) => {
            setChoiceModalState({
                isOpen: true,
                title: 'ボス攻略計画',
                message: '最初のボス戦に備え、事前に計画を立てましょう。',
                options: [
                    { label: '1階のボス', value: '1', disabled: planned.has('1') },
                    { label: '5階のボス', value: '5', disabled: planned.has('5') },
                    { label: '完了', value: 'done' },
                ],
                onConfirm: (value) => {
                    if (value === 'done') {
                        setChoiceModalState({ isOpen: false });
                        setGuideStep('POST_PLANNING_NEXT_STEP');
                    } else {
                        setChoiceModalState({ isOpen: false });
                        const floor = parseInt(value, 10);
                        const reOpen = () => showModal(planned.add(value));
                        openBossPlannerForFloor(floor, reOpen);
                    }
                },
                onClose: () => setChoiceModalState({ isOpen: false })
            });
        };
        showModal();
    };

    const onSuggestTargetFloor = (suggestedFloor) => {
        setChoiceModalState({
            isOpen: true,
            title: '目標階を設定しますか？',
            message: `あなたの戦力から、目標として ${suggestedFloor} 階の攻略をおすすめします。この階を目標に設定しますか？`,
            options: [
                { label: 'はい、設定する', value: 'yes', className: 'btn-primary' },
                { label: 'いいえ、やめておく', value: 'no', className: 'btn-secondary' },
            ],
            onConfirm: (value) => {
                setChoiceModalState({ isOpen: false });
                if (value === 'yes') {
                    handleTargetFloorChange(suggestedFloor);
                    showToastMessage(`目標を ${suggestedFloor} 階に設定しました。`);
                    // The guide will continue from here, handled by GuidanceManager
                }
            }
        });
    };

    useEffect(() => {
        const isFirstLaunch = !localStorage.getItem('hasLaunched');
        if (isFirstLaunch) {
            setIsFirstEverLaunch(true);
            localStorage.setItem('hasLaunched', 'true');
            setActiveTab('ownership');
            setIsFooterCollapsed(true);
        }
    }, []);

    const showToastMessage = useCallback((message) => {
        setToastMessage(message); setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, []);

    const unlockAchievement = (achievementId) => {
        if (typeof ACHIEVEMENTS === 'undefined') return;
        if (!unlockedAchievements.has(achievementId)) {
            const newUnlocked = new Set(unlockedAchievements);
            newUnlocked.add(achievementId);
            setUnlockedAchievements(newUnlocked);
            const achievement = ACHIEVEMENTS[achievementId];
            showAchievementToast(achievement);
        }
    };

    const logAction = (action, details) => {
        // Placeholder for analytics or logging
        console.log("Action:", action, details);
    };

    const handleSelectLog = (log) => {
        setSelectedLog(log);
        if (log) {
            localStorage.setItem('ui_selectedLogName', log.name);
        } else {
            localStorage.removeItem('ui_selectedLogName');
        }
    };

    const handleSquareClick = (floorData, square, squareId, index) => {
        const squareInfo = { floor: floorData, square: square, id: squareId };
        const squareKey = `${floorData.floor}-${squareId}`;
        localStorage.setItem('ui_selectedSquareKey', squareKey);

        setSelectedSquare(squareInfo);
        setActiveTab('details');
    };

    const { 
        megidoDetails, 
        setMegidoDetails, 
        handleMegidoDetailChange, 
        handleMegidoDetailChangeWrapper, 
        handleCheckDistributedMegido 
    } = useMegido({ showToastMessage });

    const ownedMegidoIds = useMemo(() => 
        new Set(Object.keys(megidoDetails).filter(id => megidoDetails[id] && megidoDetails[id].owned)),
        [megidoDetails]
    );

    const profileData = useMemo(() => {
        const maxFloor = Object.keys(floorClearCounts).reduce((max, floor) => Math.max(max, parseInt(floor)), 0);
        const clearCount = floorClearCounts['35'] || 0;
        return {
            ownedMegidoCount: ownedMegidoIds.size,
            maxFloor,
            clearCount
        };
    }, [ownedMegidoIds, floorClearCounts]);

    const unlockedAchievementsList = useMemo(() => {
        if (!allAchievements) return [];
        return Array.from(unlockedAchievements).map(id => allAchievements[id]).filter(Boolean);
    }, [unlockedAchievements, allAchievements]);

    const [bossFormationId, setBossFormationId] = useState(() => localStorage.getItem('bossFormationId') || null);
    const [bossSquadIds, setBossSquadIds] = useState(() => {
        const saved = localStorage.getItem('bossSquadIds');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        if (bossFormationId) {
            localStorage.setItem('bossFormationId', bossFormationId);
        } else {
            localStorage.removeItem('bossFormationId');
        }
        localStorage.setItem('bossSquadIds', JSON.stringify(Array.from(bossSquadIds)));
    }, [bossFormationId, bossSquadIds]);

    const handleSetBossFormation = useCallback((formationId) => {
        if (!isGuideMode) return;

        if (bossFormationId === formationId) {
            setBossFormationId(null);
            setBossSquadIds(new Set());
            showToastMessage('ボス攻略編成の指定を解除しました。');
        } else {
            const formation = formations[formationId];
            if (formation) {
                const newSquadIds = new Set(
                    formation.megidoSlots
                        .map(slot => slot?.megidoId)
                        .filter(Boolean)
                );
                setBossFormationId(formationId);
                setBossSquadIds(newSquadIds);
                showToastMessage(`「${formation.name}」をボス攻略編成に指定しました。`);
            }
        }
    }, [isGuideMode, bossFormationId, formations, showToastMessage]);

    const [manualExplorationPowers, setManualExplorationPowers] = useState({});

    const handleSetManualPower = useCallback((squareId, power) => {
        setManualExplorationPowers(prev => ({
            ...prev,
            [squareId]: power
        }));
    }, []);

    const handleOpenManualPowerInput = useCallback((squareId, currentPower) => {
        setModalState({
            isOpen: true,
            title: '探索力の手動入力',
            message: '霊宝などを考慮した合計探索力の値を入力してください。',
            inputValue: currentPower || '',
            onConfirm: (value) => {
                const newPower = parseInt(value, 10);
                if (!isNaN(newPower) && newPower >= 0) {
                    handleSetManualPower(squareId, newPower);
                    showToastMessage(`探索力を ${newPower} に設定しました。`);
                } else if (value === null || value === '') {
                    handleSetManualPower(squareId, null);
                    showToastMessage('手動入力をリセットしました。');
                } else {
                    showToastMessage('無効な値です。数値を入力してください。', 'error');
                }
                setModalState(s => ({ ...s, isOpen: false }));
            }
        });
    }, [handleSetManualPower, showToastMessage]);

    const { 
        runState, 
        setRunState,
        megidoConditions, 
        setMegidoConditions,
        manualRecovery, 
        setManualRecovery, 
        handleResolveSquare, 
        handleResetRun, 
        handleManualRecovery, 
        handleConditionRecovery, 
        handleUndo,
        handleOpenRecoveryModal 
    } = usePracticeState({
        megidoDetails,
        ownedMegidoIds,
        showToastMessage,
        unlockAchievement,
        logAction,
        floorRefs,
        setSelectedSquare,
        setModalState,
        setRecoveryModalState,
        setChoiceModalState,
        setStatusBuffModalState,
        floorClearCounts,
        setFloorClearCounts,
        winStreak,
        setWinStreak,
        setActiveTab,
        isLoading,
        floorMessages,
        setHighlightedSquares
    });

    const { 
        planState, 
        setPlanState,
        planConditions, 
        onPlanExplorationParty, 
        handlePlanCombatParty 
    } = usePlanState({
        formations,
        megidoDetails,
        showToastMessage
    });

    const idMaps = useMemo(() => {
        if (isLoading || typeof COMPLETE_MEGIDO_LIST === 'undefined' || typeof ENEMY_ALL_DATA === 'undefined' || typeof COMPLETE_ORB_LIST === 'undefined' || typeof COMPLETE_REISHOU_LIST === 'undefined') {
            return null;
        }
        const megidoMaps = generateMegidoMappings();
        const enemyMaps = generateEnemyMappings();
        const orbMaps = generateOrbMappings();
        const reishouMaps = generateReishouMappings();
        return {
            megido: megidoMaps,
            enemy: enemyMaps,
            orb: orbMaps,
            reishou: reishouMaps
        };
    }, [isLoading]);

    const { 
        formations, 
        setFormations, 
        editingFormation, 
        setEditingFormation, 
        initialTagTarget, 
        setInitialTagTarget, 
        previousScreen, 
        setPreviousScreen, 
        handleSaveFormation, 
        handleSaveFormationMemo, 
        handleDeleteFormation, 
        handleCopyFormation, 
        handleCreateFormationFromEnemy, 
        handleGenerateShareImage, 
        generatedImageData, 
        showShareModal, 
        setShowShareModal, 
        tweetUrl, 
        setTweetUrl
    } = useFormations({
        showToastMessage,
        idMaps,
        setDisplayedEnemy,
        setActiveTab,
        setPracticeView,
        handleMegidoDetailChange,
        megidoDetails,
        unlockAchievement
    });

    const handleCreateFormationFromSelection = useCallback((selectedIds, tagTarget) => {
        if (!selectedIds || selectedIds.length === 0) return;

        const newFormation = {
            id: `f${Date.now()}`,
            name: tagTarget?.enemyName ? `${tagTarget.enemyName} 対策編成` : '新規編成',
            megidoSlots: selectedIds.slice(0, 5).map(megidoId => ({
                megidoId,
                orbId: null,
                reishouIds: []
            })),
            tags: [],
            notes: '',
            enemyName: tagTarget?.enemyName || null,
            floors: tagTarget?.floors || []
        };

        // 足りないスロットをnullで埋める
        while (newFormation.megidoSlots.length < 5) {
            newFormation.megidoSlots.push(null);
        }

        setEditingFormation(newFormation);
        if (!isGuideMode) { // ガイドモード中はタブを切り替えない
            setActiveTab('formation');
        }
        showToastMessage('選択したメギドで編成ドラフトを作成しました。');
    }, [setEditingFormation, setActiveTab, showToastMessage, isGuideMode]);

    const { 
        communityFormationsState,
        handleOpenCommunityFormations,
        handleCloseCommunityFormations,
        handleCopyCommunityFormation,
        handlePostFormation,
        handleDeleteCommunityFormation,
        isPosting,
    } = useCommunityFormations({ formations, setFormations, showToastMessage, megidoDetails, idMaps, currentUser, unlockAchievement });

    const handleImportFormation = () => {
        if (!idMaps) {
            showToastMessage('IDマッピングが準備できていません。');
            return;
        }
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        const html5QrCode = new Html5Qrcode("qr-reader-div", { verbose: true });

        const parsePartyData = (qrString, startPointer) => {
            let pointer = startPointer;
            const megidoSlots = [];
            for (let i = 0; i < 5; i++) {
                const megidoQRID = qrString.substring(pointer, pointer += 3);
                if (megidoQRID === '999') {
                    megidoSlots.push(null);
                    pointer += 21; // Skip the rest of the empty slot
                    continue;
                }
                const ougiLevel = parseInt(qrString.substring(pointer, pointer += 2), 10);
                const singularityLevel = parseInt(qrString.substring(pointer, pointer += 1), 10);
                const levelChar = qrString.substring(pointer, pointer += 1);
                const reishouQRIDs = [];
                for(let j=0; j<4; j++) {
                    reishouQRIDs.push(qrString.substring(pointer, pointer += 3));
                }
                const specialReishou = qrString.substring(pointer, pointer += 1) === '1';
                const bondReishou = parseInt(qrString.substring(pointer, pointer += 1), 10);
                const orbQRID = qrString.substring(pointer, pointer += 3);

                const megidoId = idMaps.megido.newToOriginal.get(String(megidoQRID));
                if (!megidoId) {
                    megidoSlots.push(null);
                    continue;
                };

                const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId);
                if (!megidoMaster) {
                    megidoSlots.push(null);
                    continue;
                };

                const levelMap = {'0': 70, '1': 72, '2': 74, '3': 76, '4': 80};
                const level = levelMap[levelChar] || 70;
                
                const orbId = idMaps.orb.newToOriginal.get(orbQRID);
                const orbMaster = orbId ? COMPLETE_ORB_LIST.find(o => o.id === orbId) : null;

                const reishouIds = reishouQRIDs
                    .map(rqid => (rqid === '999') ? null : idMaps.reishou.newToOriginal.get(rqid))
                    .filter(Boolean);

                megidoSlots.push({
                    megidoId: megidoId,
                    orbId: orbId,
                    reishouIds: reishouIds,
                    megidoName: megidoMaster.名前,
                    megidoStyle: megidoMaster.スタイル || megidoMaster.style,
                    leaderSkill: megidoMaster.LS,
                    orbName: orbMaster ? orbMaster.name : '',
                });

                handleMegidoDetailChange(megidoId, 'level', level);
                handleMegidoDetailChange(megidoId, 'ougiLevel', ougiLevel || 1);
                handleMegidoDetailChange(megidoId, 'special_reishou', specialReishou);
                handleMegidoDetailChange(megidoId, 'bond_reishou', bondReishou || 0);
                if (megidoMaster.Singularity) {
                    handleMegidoDetailChange(megidoId, 'singularity_level', singularityLevel || 0);
                }
            }
            return megidoSlots;
        };

        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const formationName = file.name.replace(/\.[^/.]+$/, "");

            html5QrCode.scanFile(file) 
                .then(decodedText => {
                    try {
                        let pointer = 0;
                        let enemyQRID = '';
                        let floors = [];
                        let megidoSlots = [];

                        if (decodedText.startsWith('2') && decodedText.length > 125) { // V2 format check
                            pointer = 1; // Skip version '2'
                            enemyQRID = decodedText.substring(pointer, pointer += 3);
                            const floorCount = parseInt(decodedText.substring(pointer, pointer += 1), 10);
                            for (let i = 0; i < floorCount; i++) {
                                floors.push(parseInt(decodedText.substring(pointer, pointer += 2), 10));
                            }
                            megidoSlots = parsePartyData(decodedText, pointer);
                        } else {
                            // V1 Format
                            if (decodedText.length < 100) { // Basic length check
                                throw new Error('無効なQRコード形式です。');
                            }
                            enemyQRID = decodedText.substring(pointer, pointer += 3);
                            const floor = parseInt(decodedText.substring(pointer, pointer += 2), 10);
                            if (!isNaN(floor)) floors.push(floor);
                            megidoSlots = parsePartyData(decodedText, pointer);
                        }

                        const enemyName = idMaps.enemy.newToOriginal.get(enemyQRID);
                        const newFormation = {
                            id: `f${Date.now()}`,
                            name: formationName,
                            megidoSlots: megidoSlots,
                            tags: [],
                            notes: '',
                            enemyName: enemyName || null,
                            floors: floors.length > 0 ? floors : null,
                            floor: floors.length > 0 ? floors[0] : null
                        };

                        const newTags = new Map();
                        (newFormation.megidoSlots || []).forEach(slot => {
                            if (slot && slot.megidoName) {
                                newTags.set(slot.megidoName, { text: slot.megidoName, category: 'megido' });
                            }
                        });
                        if (newFormation.enemyName) {
                            newTags.set(newFormation.enemyName, { text: newFormation.enemyName, category: 'enemy' });
                        }
                        (newFormation.floors || []).forEach(floor => {
                            const tagText = `${floor}F`;
                            newTags.set(tagText, { text: tagText, category: 'floor' });
                        });
                        newFormation.tags = Array.from(newTags.values());
                        
                        const newFormations = { ...formations, [newFormation.id]: newFormation };
                        setFormations(newFormations);
                        localStorage.setItem('formations', JSON.stringify(newFormations));
                        unlockAchievement('CROSS_DIMENSIONAL_FORMATION');
                        showToastMessage('編成をインポートしました。');
                    } catch (error) {
                        console.error("QRコードの解析または編成の復元に失敗しました:", error);
                        showToastMessage('QRコードの読み取りに失敗しました。');
                    }
                })
                .catch(err => {
                    console.error(`QRコードのスキャンに失敗しました。${err}`);
                    showToastMessage('QRコードのスキャンに失敗しました。');
                });
        };
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    };

    // --- UI State Persistence ---
    useEffect(() => { localStorage.setItem('ui_activeTab', activeTab); }, [activeTab]);

    const [isQriousLoaded, setIsQriousLoaded] = useState(false);
    const [isHtml5QrLoaded, setIsHtml5QrLoaded] = useState(false);

    const formationAssignments = useMemo(() => {
        const assignments = {};
        if (!planState.assignments) return assignments;

        for (const fullSquareId in planState.assignments) {
            const [floor, ...squareIdParts] = fullSquareId.split('-');
            const squareId = squareIdParts.join('-');
            const enemyAssignments = planState.assignments[fullSquareId];
            for (const enemyName in enemyAssignments) {
                const slots = enemyAssignments[enemyName];
                slots.forEach((formationId, slotIndex) => {
                    if (formationId) {
                        if (!assignments[formationId]) {
                            assignments[formationId] = [];
                        }
                        assignments[formationId].push({ floor, squareId, enemyName, slotIndex });
                    }
                });
            }
        }
        return assignments;
    }, [planState]);

    useEffect(() => {
        // QRious (for export) check
        if (window.QRious) {
            setIsQriousLoaded(true);
        } else {
            const interval = setInterval(() => {
                if (window.QRious) {
                    setIsQriousLoaded(true);
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, []);

    const handleOpenSettings = () => setShowSettings(true);
    const handleCloseSettings = () => setShowSettings(false);

    const checkAllAchievements = useCallback(() => {
        if (!allAchievements) return;

        const userData = {
            formations,
            ownedMegidoIds,
            winStreak,
            floorClearCounts,
            themeToggleCount,
            dataManagementCount,
            autoAssignUseCount,
            mapSearchCount,
            aboutPageOpenCount,
            planState,
            megidoList,
            towerMapData: window.TOWER_MAP_DATA,
            loginData
        };

        const newUnlocked = new Set(unlockedAchievements);
        let changed = false;

        for (const ach of Object.values(allAchievements)) {
            if (ach.condition && !newUnlocked.has(ach.id)) {
                if (ach.condition(userData)) {
                    newUnlocked.add(ach.id);
                    showAchievementToast(ach);
                    changed = true;
                }
            }
        }

        if (changed) {
            setUnlockedAchievements(newUnlocked);
        }
    }, [formations, ownedMegidoIds, unlockedAchievements, winStreak, floorClearCounts, themeToggleCount, dataManagementCount, planState, allAchievements]);

    useEffect(() => {
        checkAllAchievements();
    }, [formations, ownedMegidoIds, winStreak, floorClearCounts, themeToggleCount, dataManagementCount, planState]);

    // Special check for APP_START on initial load
    useEffect(() => {
        unlockAchievement('APP_START');
    }, []);

    useEffect(() => {
        localStorage.setItem('unlockedAchievements', JSON.stringify(Array.from(unlockedAchievements)));
    }, [unlockedAchievements]);

    useEffect(() => { localStorage.setItem('winStreak', winStreak); }, [winStreak]);
    useEffect(() => { localStorage.setItem('floorClearCounts', JSON.stringify(floorClearCounts)); }, [floorClearCounts]);
    useEffect(() => { localStorage.setItem('themeToggleCount', themeToggleCount); }, [themeToggleCount]);
    useEffect(() => { localStorage.setItem('dataManagementCount', dataManagementCount); }, [dataManagementCount]);
    useEffect(() => { localStorage.setItem('autoAssignUseCount', autoAssignUseCount); }, [autoAssignUseCount]);
    useEffect(() => { localStorage.setItem('mapSearchCount', mapSearchCount); }, [mapSearchCount]);
    useEffect(() => { localStorage.setItem('aboutPageOpenCount', aboutPageOpenCount); }, [aboutPageOpenCount]);

    const handleIncrementAutoAssignUse = () => setAutoAssignUseCount(c => c + 1);
    const handleIncrementAboutPageOpen = () => setAboutPageOpenCount(c => c + 1);

    useEffect(() => {
        localStorage.setItem('completedGuideSteps', JSON.stringify(Array.from(completedGuideSteps)));
    }, [completedGuideSteps]);

    useEffect(() => {
        let voidTimeout;
        const resetVoidTimeout = () => {
            clearTimeout(voidTimeout);
            voidTimeout = setTimeout(() => {
                unlockAchievement('STARING_INTO_THE_VOID');
            }, 180000); // 3 minutes
        };

        window.addEventListener('mousemove', resetVoidTimeout);
        window.addEventListener('mousedown', resetVoidTimeout);
        window.addEventListener('keydown', resetVoidTimeout);

        resetVoidTimeout(); // Initial setup

        return () => {
            clearTimeout(voidTimeout);
            window.removeEventListener('mousemove', resetVoidTimeout);
            window.removeEventListener('mousedown', resetVoidTimeout);
            window.removeEventListener('keydown', resetVoidTimeout);
        };
    }, [unlockAchievement]);

    useEffect(() => {
        const clickTimestamps = [];
        const clickHandler = () => {
            const now = Date.now();
            clickTimestamps.push(now);
            // Remove clicks older than 1 second
            while (clickTimestamps.length > 0 && now - clickTimestamps[0] > 1000) {
                clickTimestamps.shift();
            }
            if (clickTimestamps.length >= 10) {
                unlockAchievement('BUTTON_MASHER');
                window.removeEventListener('click', clickHandler);
            }
        };

        window.addEventListener('click', clickHandler);

        return () => {
            window.removeEventListener('click', clickHandler);
        };
    }, [unlockAchievement]);



    const handleExportData = () => {
        unlockAchievement('BE_PREPARED');
        setDataManagementCount(c => c + 1);

        const dataToExport = {
            megidoDetails,
            formations,
            planState,
            memos,
            seasonLogs,
            runState,
            megidoConditions,
            targetEnemies,
            unlockedAchievements: Array.from(unlockedAchievements),
            theme: document.body.className,
            winStreak,
            floorClearCounts,
            themeToggleCount,
            dataManagementCount: dataManagementCount + 1
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tower-tool-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToastMessage('全データをエクスポートしました。');
    };

    const handleImportData = () => {
        unlockAchievement('BEYOND_TIME');
        setDataManagementCount(c => c + 1);
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (window.confirm('現在のデータをインポートしたデータで上書きします。よろしいですか？')) {
                        setDataManagementCount(c => c + 1);
                        // A more robust solution would validate each key
                        if(data.megidoDetails) setMegidoDetails(data.megidoDetails);
                        if(data.formations) setFormations(data.formations);
                        if(data.planState) setPlanState(data.planState);
                        if(data.memos) setMemos(data.memos);
                        if(data.seasonLogs) setSeasonLogs(data.seasonLogs);
                        if(data.runState) setRunState(data.runState);
                        if(data.megidoConditions) setMegidoConditions(data.megidoConditions);
                        if(data.targetEnemies) setTargetEnemies(data.targetEnemies);
                        if(data.unlockedAchievements) setUnlockedAchievements(new Set(data.unlockedAchievements));
                        if(data.theme) document.body.className = data.theme;
                        if(data.winStreak) setWinStreak(data.winStreak);
                        if(data.floorClearCounts) setFloorClearCounts(data.floorClearCounts);
                        if(data.themeToggleCount) setThemeToggleCount(data.themeToggleCount);
                        if(data.dataManagementCount) setDataManagementCount(data.dataManagementCount);

                        // Save to localStorage
                        localStorage.setItem('megidoDetails', JSON.stringify(data.megidoDetails || {}));
                        localStorage.setItem('formations', JSON.stringify(data.formations || []));
                        localStorage.setItem('planState', JSON.stringify(data.planState || { assignments: {}, activeFloor: 1, explorationAssignments: {} }));
                        localStorage.setItem('memos', JSON.stringify(data.memos || {}));
                        localStorage.setItem('seasonLogs', JSON.stringify(data.seasonLogs || []));
                        const date = new Date();
                        localStorage.setItem(`${date.getFullYear()}年${date.getMonth() + 1}月シーズンの記録`, JSON.stringify(data.runState || {}));
                        localStorage.setItem(`${date.getFullYear()}年${date.getMonth() + 1}月シーズンの記録_conditions`, JSON.stringify(data.megidoConditions || {}));
                        localStorage.setItem('targetEnemies', JSON.stringify(data.targetEnemies || {}));
                        localStorage.setItem('unlockedAchievements', JSON.stringify(data.unlockedAchievements || []));
                        localStorage.setItem('theme', data.theme || '');
                        localStorage.setItem('winStreak', data.winStreak || 0);
                        localStorage.setItem('floorClearCounts', JSON.stringify(data.floorClearCounts || {}));
                        localStorage.setItem('themeToggleCount', data.themeToggleCount || 0);
                        localStorage.setItem('dataManagementCount', data.dataManagementCount || 0);

                        showToastMessage('データのインポートが完了しました。ページをリロードします。');
                        setTimeout(() => window.location.reload(), 1500);
                    }
                } catch (error) {
                    showToastMessage('ファイルの読み込みに失敗しました。');
                    console.error("Import failed:", error);
                }
            };
            reader.readAsText(file);
        };
        fileInput.click();
    };

    const handleResetAllData = () => {
        const confirmationCode = String(Math.floor(1000 + Math.random() * 9000));
        const userInput = prompt(`すべてのデータをリセットします。この操作は元に戻せません。
確認のため、以下の4桁の数字を入力してください： ${confirmationCode}`);

        if (userInput === confirmationCode) {
            alert('データが正常にリセットされました。ページをリロードします。');
            localStorage.clear();
            window.location.reload();
        } else if (userInput !== null) { // User clicked OK but the code was wrong
            alert('確認コードが一致しません。データのリセットはキャンセルされました。');
        }
        // If userInput is null, the user clicked Cancel, so we do nothing.
    };

    const handleToggleTheme = () => {
        unlockAchievement('WELCOME_TO_THE_DARK_SIDE');
        setThemeToggleCount(c => c + 1);
        const newTheme = document.body.className === 'light-mode' ? '' : 'light-mode';
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
    };

    const handleViewModeChange = (newMode) => {
        setViewMode(newMode);
    };

    // Also need to load the theme on boot
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.className = savedTheme;
        }
    }, []);



    useEffect(() => {
        const interval = setInterval(() => {
            if (window.Html5Qrcode) {
                setIsHtml5QrLoaded(true);
                clearInterval(interval);
            }
        }, 100);
        const timeout = setTimeout(() => {
            clearInterval(interval);
        }, 10000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        }
    }, []);
    
    useEffect(() => {
        if (isLoading) return;

        // Restore selected square & log on initial load
        const savedSquareKey = localStorage.getItem('ui_selectedSquareKey');
        if (savedSquareKey && typeof TOWER_MAP_DATA !== 'undefined') {
            const [floorNumStr, ...idParts] = savedSquareKey.split('-');
            const floorNum = parseInt(floorNumStr.replace('f',''));
            const squareId = idParts.join('-');
            const floorData = TOWER_MAP_DATA.find(f => f.floor === floorNum);
            if (floorData && floorData.squares[squareId]) {
                setSelectedSquare({ floor: floorData, square: floorData.squares[squareId], id: squareId });
            }
        }

        const savedLogName = localStorage.getItem('ui_selectedLogName');
        if (savedLogName) {
            const logToSelect = seasonLogs.find(l => l.name === savedLogName);
            if (logToSelect) {
                setSelectedLog(logToSelect);
            }
        }
    }, [isLoading, seasonLogs]);

    useEffect(() => {
        if (isLoading || typeof MEGIDO_BIRTHDAY_DATA === 'undefined') return;

        const localDate = new Date();
        const today = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
        const currentYear = localDate.getFullYear();
        const month = localDate.getMonth() + 1;
        const day = localDate.getDate();

        if (month === 7 && day === 2) {
            unlockAchievement('MEGIDO_DAY');
        }
        if (month === 4 && day === 1) {
            unlockAchievement('APRIL_FOOLS');
        }

        let todaysEvents = [];

        for (const event of MEGIDO_BIRTHDAY_DATA) {
            const [month, day] = event.date.replace('月', '-').replace('日', '').split('-').map(Number);
            const eventDate = new Date(Date.UTC(currentYear, month - 1, day));
            let eventToShow = null;

            if (event.countdown) {
                const countdownDate = new Date(eventDate);
                countdownDate.setDate(eventDate.getDate() - event.countdown);
                if (countdownDate.getTime() === today.getTime()) {
                const storageKey = `seen_event_${currentYear}_${event.name}_countdown`;
                if (!localStorage.getItem(storageKey)) {
                    let text = '';
                    let anniversaryString = '';
                    //周年記念イベント（start_yearを持つ）かどうかで処理を分岐
                    if (event.start_year) {
                        const year = currentYear + (today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day) ? 1 : 0);
                        let anniversaryYear = year - event.start_year;
                        anniversaryString = anniversaryYear === 9 ? '７＋２周年' : `${anniversaryYear}周年`;
                        text = event.countdown_text_template.replace('X周年', anniversaryString);
                    } else {
                        text = event.countdown_text;
                    }
                    eventToShow = { ...event, isCountdown: true, text: text, storageKey, anniversaryString };
                }
                }
            }

            if (!eventToShow && eventDate.getTime() === today.getTime()) {
                const storageKey = `seen_event_${currentYear}_${event.name || event.base_name}`;
                if (!localStorage.getItem(storageKey)) {
                    let text = '';
                    let anniversaryString = '';
                    if (event.start_year) { //周年記念イベント（start_yearを持つ）かどうかで判定
                        let anniversaryYear = currentYear - event.start_year;
                        anniversaryString = anniversaryYear === 9 ? '７＋２周年' : `${anniversaryYear}周年`;
                        text = event.day_of_text_template.replace('X周年', anniversaryString);
                    } else if (event.type === 'birthday') {
                        text = `${event.date}は${event.base_name}${event.unit_name ? `（${event.unit_name}）` : ''}の${event.born_type}日です！`;
                    } else {
                        text = event.day_of_text;
                    }
                    eventToShow = { ...event, isCountdown: false, text: text, storageKey, anniversaryString };
                }
            }

            if (eventToShow) {
                todaysEvents.push(eventToShow);
            }
        }

        // If there are multiple events, pick one randomly to show.
        if (todaysEvents.length > 1) {
            const randomIndex = Math.floor(Math.random() * todaysEvents.length);
            todaysEvents = [todaysEvents[randomIndex]];
        }

        setEventQueue(todaysEvents);

        // Check for beta modal
        const betaModalShown = localStorage.getItem('betaModalShown');
        if (!betaModalShown) {
            const betaStartDate = new Date('2025-09-09');
            const betaEndDate = new Date('2025-09-17');
            betaStartDate.setHours(0, 0, 0, 0);
            betaEndDate.setHours(0, 0, 0, 0);

            if (today >= betaStartDate && today < betaEndDate) {
                setShouldShowBetaModal(true);
            }
        }
    }, [isLoading]);

    useEffect(() => {
        if (eventQueue.length > 0) {
            setEventToast(eventQueue[0]);
        } else {
            setEventToast(null); // Clear toast when queue is empty
            if (shouldShowBetaModal) {
                unlockAchievement('BETA_TESTER');
                setShowBetaModal(true);
                setShouldShowBetaModal(false); // Prevent re-showing
            } else {
                const updateModalShown = localStorage.getItem('updateModalShown_20251007_ui_unify');
                if (!updateModalShown) {
                    setShowUpdateModal(true);
                }
            }
        }
    }, [eventQueue, shouldShowBetaModal]);

    // --- Intro Modal Queue Logic ---
    // 1. Build the queue on initial load
    useEffect(() => {
        if (isLoading || introQueue.length > 0) return;

        const queue = [];
        const betaModalShown = localStorage.getItem('betaModalShown');
        const updateModalShown = localStorage.getItem('updateModalShown_20251007_ui_unify');

        const today = new Date();
        const betaStartDate = new Date('2025-09-09');
        const betaEndDate = new Date('2025-09-17');
        betaStartDate.setHours(0, 0, 0, 0);
        betaEndDate.setHours(0, 0, 0, 0);

        if (!betaModalShown && (today >= betaStartDate && today < betaEndDate)) {
            queue.push('beta');
        }

        if (!updateModalShown) {
            queue.push('update');
        }

        if (isFirstEverLaunch) {
            queue.push('tutorial');
        }
        
        if (queue.length > 0) {
            setIntroQueue(queue);
        }
    }, [isLoading, isFirstEverLaunch]);

    // 2. Process the queue
    useEffect(() => {
        if (introQueue.length === 0) return;
        if (showBetaModal || showUpdateModal || showTutorial || eventToast) return; // A modal is already showing

        const nextItem = introQueue[0];
        if (nextItem === 'beta') {
            setShowBetaModal(true);
        } else if (nextItem === 'update') {
            setShowUpdateModal(true);
        } else if (nextItem === 'tutorial') {
            setShowTutorial(true);
        }
    }, [introQueue, showBetaModal, showUpdateModal, showTutorial, eventToast]);

    const handleCloseEventToast = () => {
        if (dontShowAgain && eventToast) {
            localStorage.setItem(eventToast.storageKey, 'true');
        }
        setDontShowAgain(false);
        setEventQueue(queue => queue.slice(1));
    };



    useEffect(() => {
        if (!isGuideMode || !runState.currentPosition || typeof TOWER_MAP_DATA === 'undefined' || !targetFloor) return;

        // The trigger floor is the floor the user has *just arrived at*.
        // We check if this floor is a trigger for planning the *next* boss.
        // Floor 1 is handled separately after setting the target floor.
        const planningMap = { 6: 10, 11: 15, 16: 20 };
        const triggerFloor = runState.currentPosition.floor;

        if (planningMap.hasOwnProperty(triggerFloor)) {
            const targetBossFloor = planningMap[triggerFloor];

            // Don't plan for bosses beyond the user's self-set target floor
            if (targetBossFloor > targetFloor) {
                return;
            }

            // Don't show the prompt if it has already been shown for this boss
            if (shownBossGuides.has(targetBossFloor)) {
                return;
            }
            
            // Mark this boss floor as guided for this session to prevent re-showing
            setShownBossGuides(prev => new Set(prev).add(targetBossFloor));

            // Show a modal to ask the user if they want to plan
            setChoiceModalState({
                isOpen: true,
                title: 'ボス攻略計画',
                message: `次のボス（${targetBossFloor}階）の攻略計画を立てますか？`,
                options: [
                    { label: 'はい、計画を立てる', value: 'yes', className: 'btn-primary' },
                    { label: 'いいえ、後で', value: 'no', className: 'btn-secondary' },
                ],
                onConfirm: (value) => {
                    setChoiceModalState({ isOpen: false });
                    if (value === 'yes') {
                        openBossPlannerForFloor(targetBossFloor);
                    }
                }
            });
        }
    }, [runState.currentPosition, isGuideMode, targetFloor, shownBossGuides, normalizeEnemy]);




    useEffect(() => {
        if (!ownedMegidoIds || ownedMegidoIds.size === 0) {
            setPartyConditionRisk(0);
            return;
        }

        let totalConditionIndex = 0;
        ownedMegidoIds.forEach(id => {
            const condition = megidoConditions[id] || '絶好調';
            totalConditionIndex += CONDITION_LEVELS.indexOf(condition);
        });

        const averageIndex = totalConditionIndex / ownedMegidoIds.size;

        let riskLevel = 0;
        if (averageIndex >= 3) { 
            riskLevel = 3;
        } else if (averageIndex >= 2) {
            riskLevel = 2;
        } else if (averageIndex >= 1) {
            riskLevel = 1;
        }
        setPartyConditionRisk(riskLevel);

    }, [megidoConditions, ownedMegidoIds]);

    const handleSaveLog = () => {
        const date = new Date();
        const defaultLogName = `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_シーズンの記録`;
        const logName = prompt("このログの名前を入力してください:", defaultLogName);
        if (logName) {
            unlockAchievement('FIRST_SEASON');
            const newLog = { name: logName, date: new Date().toISOString(), runState: runState, megidoConditions: megidoConditions, targetEnemies: targetEnemies, planState: planState };
            const newLogs = [...seasonLogs, newLog];
            setSeasonLogs(newLogs);
            localStorage.setItem('seasonLogs', JSON.stringify(newLogs));
            showToastMessage("現在の挑戦をログに保存しました。");
        }
    };

    const handleDeleteLog = (logNameToDelete) => {
        if (window.confirm(`本当にログ「${logNameToDelete}」を削除しますか？この操作は元に戻せません。`)) {
            const newLogs = seasonLogs.filter(log => log.name !== logNameToDelete);
            setSeasonLogs(newLogs);
            localStorage.setItem('seasonLogs', JSON.stringify(newLogs));
            if (selectedLog && selectedLog.name === logNameToDelete) {
                handleSelectLog(null);
            }
            showToastMessage("ログを削除しました。");
        }
    };

    const showAchievementToast = (achievement) => {
        setAchievementToast(achievement);
        setTimeout(() => {
            setAchievementToast(null);
        }, 4500);
    };

    const showAchievementToastById = (achievementId) => {
        if (typeof ACHIEVEMENTS === 'undefined' || !ACHIEVEMENTS[achievementId]) return;
        const achievement = ACHIEVEMENTS[achievementId];
        showAchievementToast(achievement);
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setDisplayedEnemy(null);
    };

    const showFloorGuide = (floorData) => {
        setFloorGuideModalState({ isOpen: true, floorNum: floorData.floor });
    };

    const onCancel = () => {
        setSelectedSquare(null);
        localStorage.removeItem('ui_selectedSquareKey');
    };

    const handleScrollToFloor = (floorNum) => {
        if (floorRefs.current[floorNum]) {
            floorRefs.current[floorNum].scrollIntoView({ behavior: 'smooth', block: 'start' });
            showToastMessage(`${floorNum}階へ移動しました。`);
        }
    };

    const getSquareStyle = useCallback((square, floorData, squareId) => {
        let classes = '';
        if (selectedSquare && selectedSquare.floor.floor === floorData.floor && selectedSquare.id === squareId) {
            classes += ' node-state-selected';
        }
        const clearedSquaresOnFloor = runState.cleared[floorData.floor] || [];
        const isCleared = clearedSquaresOnFloor.includes(squareId);

        if (isCleared && square.type !== 'start') {
            classes += ' node-cleared';
        }
        
        const fullSquareId = `${floorData.floor}-${squareId}`;
        const isBattlePlanned = planState.assignments[fullSquareId] && Object.values(planState.assignments[fullSquareId]).some(slots => slots.some(id => id));
        const isExplorePlanned = planState.explorationAssignments[squareId] && Object.values(planState.explorationAssignments[squareId]).some(party => party.some(id => id));

        if (isBattlePlanned || isExplorePlanned) {
            classes += ' node-planned';
        }
        
        if (!isCleared) {
            const isOnCurrentFloor = runState.currentPosition?.floor === floorData.floor;
            if (isOnCurrentFloor) {
                const connectionsForFloor = towerConnections[floorData.floor];
                let isResolvable = false;
                if (connectionsForFloor) {
                    const neighbors = connectionsForFloor[squareId] || [];
                    isResolvable = neighbors.some(neighborId => clearedSquaresOnFloor.includes(neighborId));
                }

                if (isResolvable) {
                    classes += ' node-resolvable';
                } else {
                    classes += ' node-accessible';
                }
            } else {
                classes += ' node-inaccessible';
            }
        }
        return classes;
    }, [selectedSquare, runState, planState, guidance, towerConnections]);

    const getSquareColorClass = useCallback((square) => {
        if (square.type === 'start') return 'node-color-start';
        if (square.type === 'boss') return 'node-color-boss';
        if (square.type === 'battle') return 'node-color-battle';
        
        if (square.type === 'explore') {
            if (square.style && square.style !== 'RANDOM') {
                return `node-color-recovery-${square.style.slice(0, 1)}`;
            }
            if (square.style === 'RANDOM') {
                return 'node-color-recovery-RANDOM';
            }
            if (square.sub_type === 'tower_power') {
                return 'node-color-tower-power';
            }
            return 'node-color-random';
        }
        
        return '';
    }, []);

    const getSquareColorRgbVarName = useCallback((square) => {
        if (square.type === 'start') return '--node-color-start-rgb';
        if (square.type === 'boss') return '--node-color-boss-rgb';
        if (square.type === 'battle') return '--node-color-battle-rgb';
        
        if (square.type === 'explore') {
            if (square.style && square.style !== 'RANDOM') {
                return `--node-color-recovery-${square.style.slice(0, 1).toLowerCase()}-rgb`;
            }
            if (square.style === 'RANDOM') {
                return '--node-color-random-rgb';
            }
            if (square.sub_type === 'tower_power') {
                return '--node-color-tower-power-rgb';
            }
            return '--node-color-random-rgb';
        }
        
        return '--text-main'; // Default fallback
    }, []);

    const onTargetSelect = (target, screen) => {
        if (target || screen) {
            console.log('Target selected:', target, screen);
        }
    };

    const normalizeEnemy = useCallback((enemyData) => {
        if (!enemyData) return null;

        const name = typeof enemyData === 'string' ? enemyData : enemyData.name;
        let finalTags = null;
        let finalClass = null;

        // 優先度1: enemyData (tower.json 由来) に tags があればそれを使う
        if (typeof enemyData === 'object' && enemyData.tags && (enemyData.tags.gimmicks?.length || enemyData.tags.weaknesses?.length)) {
            finalTags = enemyData.tags;
        }

        // 情報を補完するために ENEMY_ALL_DATA を見る
        const partyData = window.ENEMY_ALL_DATA?.[name];
        if (partyData) {
            const leader = partyData.party?.find(member => member && member.leader);
            if (leader) {
                finalClass = leader.class; // class は leader から取得
                // 優先度2: leader に tags があればそれを使う (finalTagsがまだない場合)
                if (!finalTags && leader.tags) {
                    finalTags = leader.tags;
                }
            }
            // 優先度3: partyData のトップレベルに tags があればそれを使う (finalTagsがまだない場合)
            if (!finalTags && partyData.tags) {
                finalTags = partyData.tags;
            }
        }

        return {
            name: name,
            class: finalClass,
            tags: finalTags || { gimmicks: [], weaknesses: [] } // 最終的に tags がなければ空を返す
        };
    }, []);

    const [isGuideMode, setIsGuideMode] = useState(() => localStorage.getItem('isGuideMode') === 'true');
    const [hasSeenGuideIntro, setHasSeenGuideIntro] = useState(() => localStorage.getItem('hasSeenGuideIntro') === 'true');
    const [targetedEnemy, setTargetedEnemy] = useState(null);

    useEffect(() => {
        if (selectedSquare && selectedSquare.square.enemies && selectedSquare.square.enemies.length > 0) {
            const defaultEnemyData = selectedSquare.square.enemies[0];
            const newTarget = normalizeEnemy(defaultEnemyData);
            setTargetedEnemy(newTarget);
        } else {
            setTargetedEnemy(null);
        }
    }, [selectedSquare, normalizeEnemy]);

    const bossGuide = useMemo(() => {
        if (!bossGuides || !targetedEnemy) return null;
        return bossGuides[targetedEnemy.name] || null;
    }, [bossGuides, targetedEnemy]);

    const recommendations = useMemo(() => {
        if (!megidoList || !targetedEnemy || !selectedSquare || !window.COMPLETE_ORB_LIST) return null; 
        if ((selectedSquare.square.type === 'battle' || selectedSquare.square.type === 'boss') && ownedMegidoIds.size > 0) {
            const enemy = targetedEnemy;
            if (enemy && typeof enemy !== 'string' && enemy.tags) {
                const allOrbIds = new Set(window.COMPLETE_ORB_LIST.map(o => o.id));
                const result = findRecommendedMegido({
                    enemy: enemy,
                    floorRules: selectedSquare.square.rules || [],
                    ownedMegido: ownedMegidoIds,
                    allMegidoMaster: megidoList,
                    ownedOrbs: allOrbIds, // すべてのオーブを所持していると仮定
                    allOrbsMaster: window.COMPLETE_ORB_LIST || [],
                    megidoConditions: megidoConditions || {}
                });
                if (result.success) {
                    return result.recommendations;
                }
            }
        }
        return null;
    }, [targetedEnemy, ownedMegidoIds, megidoList, megidoConditions, selectedSquare]);

    console.log("DEBUG: app.js data calculation", { targetedEnemy, bossGuide, recommendations });

    const handleTargetFloorChange = (floor) => {
        if (floor <= 20 && !isGuideMode) {
            setChoiceModalState({
                isOpen: true,
                title: 'ガイドモードを利用しますか？',
                message: '目標階20階以下では、「ガイドモード」が利用できます。有効にしますか？',
                options: [
                    { label: 'はい、有効にする', value: 'yes', className: 'btn-primary' },
                    { label: 'いいえ、利用しない', value: 'no', className: 'btn-secondary' },
                ],
                onConfirm: (value) => {
                    if (value === 'yes') {
                        setIsGuideMode(true);
                        showToastMessage('ガイドモードを有効にしました。');
                    }
                    setTargetFloor(floor);
                    setChoiceModalState({ isOpen: false });
                }
            });
        } else {
            if (floor >= 21 && isGuideMode) {
                setIsGuideMode(false);
                showToastMessage('ガイドモードを終了しました。');
            }
            setTargetFloor(floor);
        }
    };

    useEffect(() => {
        localStorage.setItem('isGuideMode', isGuideMode);
        if (isGuideMode && !hasSeenGuideIntro) {
            setShowGuideIntroModal(true);
        }
    }, [isGuideMode, hasSeenGuideIntro]);

    const onRecommendationChange = (squareId, recommendation) => {
        const newRecs = { ...runState.recommendations, [squareId]: recommendation };
        setRunState({ ...runState, recommendations: newRecs });
        localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify({ ...runState, recommendations: newRecs }));
        showToastMessage('おすすめタイプを変更しました。');
    };

    const handleTargetEnemyChange = (squareId, enemyName) => {
        const newTargetEnemies = { ...targetEnemies };
        let newTargetObject = null;

        if (newTargetEnemies[squareId] === enemyName) {
            delete newTargetEnemies[squareId];
            if (selectedSquare && selectedSquare.square.enemies && selectedSquare.square.enemies.length > 0) {
                newTargetObject = normalizeEnemy(selectedSquare.square.enemies[0]);
            }
        } else {
            newTargetEnemies[squareId] = enemyName;
            if (selectedSquare && selectedSquare.square.enemies) {
                const newTargetData = selectedSquare.square.enemies.find(e => (e.name || e) === enemyName);
                if (newTargetData) {
                    newTargetObject = normalizeEnemy(newTargetData);
                }
            }
        }
        setTargetEnemies(newTargetEnemies);
        setTargetedEnemy(newTargetObject);

        localStorage.setItem('targetEnemies', JSON.stringify(newTargetEnemies));
        showToastMessage('ターゲットを変更しました。');
    };

    const onSaveMemo = (square, memo) => {
        const memoKey = `${square.floor.floor}-${square.id}`;
        const newMemos = { ...memos, [memoKey]: memo };
        setMemos(newMemos);
        localStorage.setItem('memos', JSON.stringify(newMemos));
        showToastMessage('メモを保存しました。');
    };

    

    const generateEventTweetUrl = (event) => {
        let text = '';
        if (event.type === 'birthday') {
            text = `今日は${event.base_name}${event.unit_name ? `（${event.unit_name}）` : ''}の${event.born_type}日です！おメギド！！ #メギド72`;
        } else if (event.start_year) {
            if (event.isCountdown && event.countdown_tweet_text_template) {
                text = event.countdown_tweet_text_template.replace('X周年', event.anniversaryString);
            } else {
                text = event.tweet_text_template.replace('X周年', event.anniversaryString);
            }
        } else {
            if (event.isCountdown && event.countdown_tweet_text) {
                text = event.countdown_tweet_text;
            } else {
                text = event.tweet_text;
            }
        }
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    };

    const eventModalOverlayStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 1000
    };

    const eventModalContentStyle = {
        background: 'var(--bg-panel)', padding: '2rem', borderRadius: '8px', 
        textAlign: 'center', border: '1px solid var(--primary-accent)', 
        boxShadow: '0 5px 25px rgba(0,0,0,0.5)'
    };

    const eventButtonStyle = {
        normal: {
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '10px 16px',
            border: '1px solid var(--primary-accent)',
            color: 'var(--primary-accent)',
            backgroundColor: 'transparent',
            borderRadius: '6px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
        },
        hover: {
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '10px 16px',
            border: '1px solid var(--primary-accent)',
            color: 'var(--bg-main)',
            backgroundColor: 'var(--primary-accent)',
            borderRadius: '6px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer'
        }
    };

    const towerConnections = useMemo(() => {
        if (isLoading || typeof connections === 'undefined') {
            return {};
        }
        const allConnections = {};

        // Initialize all possible nodes to avoid key errors later
        for (const squareId in connections) {
            const floorNum = parseInt(squareId.split('-')[0].replace('f', ''));
            if (!allConnections[floorNum]) {
                allConnections[floorNum] = {};
            }
            if (!allConnections[floorNum][squareId]) {
                allConnections[floorNum][squareId] = [];
            }
            connections[squareId].forEach(neighborId => {
                if (!allConnections[floorNum][neighborId]) {
                    allConnections[floorNum][neighborId] = [];
                }
            });
        }

        for (const startNode in connections) {
            const floorNum = parseInt(startNode.split('-')[0].replace('f', ''));
            connections[startNode].forEach(endNode => {
                // Add forward connection (start -> end)
                if (!allConnections[floorNum][startNode].includes(endNode)) {
                    allConnections[floorNum][startNode].push(endNode);
                }
                // Add backward connection (end -> start)
                if (!allConnections[floorNum][endNode].includes(startNode)) {
                    allConnections[floorNum][endNode].push(startNode);
                }
            });
        }
        return allConnections;
    }, [isLoading]);

        const handleCancelFormationEdit = useCallback(() => {
            setEditingFormation(null);
            setInitialTagTarget(null); // Clear target on cancel
            setActiveTab(previousScreen === 'action' || previousScreen === 'combat_plan' ? 'details' : 'formation');
        }, [previousScreen, setActiveTab, setEditingFormation, setInitialTagTarget]);
    
        if (isLoading) {
            return <div>Loading...</div>;
        }
    const contextValue = {
        recommendations,

        guideStep, setGuideStep,
        isGuideMode,
        bossPlannerState, openPlannerForSquare, openBossPlannerForFloor,
        currentUser, handleSignIn, handleSignOut,
        showSettings, setShowSettings, handleOpenSettings, handleCloseSettings,
        unlockedAchievements, setUnlockedAchievements, winStreak, setWinStreak, floorClearCounts, setFloorClearCounts, themeToggleCount, setThemeToggleCount, dataManagementCount, setDataManagementCount,
        isLoading, setIsLoading, activeTab, setActiveTab, selectedSquare, setSelectedSquare,
        memos, setMemos, seasonLogs, setSeasonLogs, selectedLog, setSelectedLog, selectedLogSquare, setSelectedLogSquare, logActionModal, setLogActionModal,
        practiceView, setPracticeView, modalState, setModalState, recoveryModalState, setRecoveryModalState, choiceModalState, setChoiceModalState, statusBuffModalState, setStatusBuffModalState,
        toastMessage, setToastMessage, showToast, setShowToast, achievementToast, setAchievementToast, targetFloor, setTargetFloor, displayedEnemy, setDisplayedEnemy,
        eventToast, setEventToast, eventQueue, setEventQueue, shouldShowBetaModal, setShouldShowBetaModal, isBirthdayButtonHovered, setIsBirthdayButtonHovered, dontShowAgain, setDontShowAgain,
        guidance, setGuidance, partyConditionRisk, setPartyConditionRisk, isRecoveryRecommended, setIsRecoveryRecommended, isRouteObvious, setIsRouteObvious,
        detailPanelTab, setDetailPanelTab, // Add inner tab state to context
        highlightedSquares, setHighlightedSquares,
        spotlight, setSpotlight,
        isGuideMode, completedGuideSteps, setCompletedGuideSteps, // Add this line
        targetEnemies, setTargetEnemies, targetedEnemy, setTargetedEnemy, viewMode, setViewMode, showBetaModal, setShowBetaModal, showUpdateModal, setShowUpdateModal, isFooterCollapsed, setIsFooterCollapsed,
        isMapSearchModalOpen, setIsMapSearchModalOpen, handleOpenMapSearch, handleCloseMapSearch,
        activePreviewId, setActivePreviewId,
        isMobileView, isTabletView, floorRefs, handleToggleFooter, showToastMessage, unlockAchievement, logAction, handleSelectLog, handleSquareClick,
        megidoDetails, setMegidoDetails, handleMegidoDetailChange, handleMegidoDetailChangeWrapper, handleCheckDistributedMegido, ownedMegidoIds,
        manualExplorationPowers, setManualExplorationPowers, handleSetManualPower, handleOpenManualPowerInput,
        runState, setRunState, megidoConditions, setMegidoConditions, manualRecovery, setManualRecovery, handleResolveSquare, handleResetRun, onManualRecover: handleManualRecovery, handleConditionRecovery, handleUndo,
        planState, setPlanState, planConditions, onPlanExplorationParty, handlePlanCombatParty,
        formationAssignments,
        idMaps, formations, setFormations, editingFormation, setEditingFormation, initialTagTarget, setInitialTagTarget, previousScreen, setPreviousScreen, handleSaveFormation, handleSaveFormationMemo, handleDeleteFormation, handleCopyFormation, handleCreateFormationFromEnemy, handleGenerateShareImage, generatedImageData, showShareModal, setShowShareModal, tweetUrl, setTweetUrl,
        communityFormationsState, handleOpenCommunityFormations, handleCloseCommunityFormations, handleCopyCommunityFormation, handlePostFormation, handleDeleteCommunityFormation, isPosting,
        handleCreateFormationFromSelection, // Add this line
        autoExploreExcludedIds, handleToggleAutoExploreExclusion, // Add this line
        handleIncrementAutoAssignUse,
        handleImportFormation, isQriousLoaded, isHtml5QrLoaded, checkAllAchievements, handleExportData, handleImportData, handleResetAllData, handleToggleTheme, handleViewModeChange,
        handleTabClick, onCancel, getSquareStyle, getSquareColorClass, getSquareColorRgbVarName, onTargetSelect, handleTargetFloorChange, onRecommendationChange, handleTargetEnemyChange, onSaveMemo, handleScrollToFloor, showFloorGuide,
        handleSaveLog, handleResetRun, handleUndo, handleOpenRecoveryModal,
        generateEventTweetUrl, handleCloseEventToast, towerConnections, handleCancelFormationEdit,
        COMPLETE_MEGIDO_LIST: megidoList,
        glossaryData, // Add glossaryData to the context
        getStyleClass, getNextCondition, SIMULATED_CONDITION_SECTIONS, // Add utility functions
                    TOWER_MAP_DATA: window.TOWER_MAP_DATA,
                    towerConnections, // Add other master data to context
        COMPLETE_ORB_LIST: window.COMPLETE_ORB_LIST,
        COMPLETE_REISHOU_LIST: window.COMPLETE_REISHOU_LIST,
        MEGIDO_BIRTHDAY_DATA: window.MEGIDO_BIRTHDAY_DATA,
        ENEMY_ALL_DATA: window.ENEMY_ALL_DATA,
        CONDITION_ORDER: (typeof CONDITION_ORDER !== 'undefined') ? CONDITION_ORDER : [],
        CONDITION_LEVELS: (typeof CONDITION_LEVELS !== 'undefined') ? CONDITION_LEVELS : []
    };

    console.log("DEBUG: Passing to context provider", { targetedEnemy: contextValue.targetedEnemy });

    const getAnimationDuration = (risk) => {
        if (risk === 1) return 5;
        if (risk === 2) return 3;
        if (risk === 3) return 1.5;
        return 0; // No animation for risk 0
    };

    const animationDuration = getAnimationDuration(partyConditionRisk);

    const footerStyle = {
        textAlign: 'center', 
        padding: '1rem', 
        borderTop: '1px solid #ccc',
        ...(animationDuration > 0 && { '--animation-duration': `${animationDuration}s` })
    };

    return (
        <window.AppContext.Provider value={contextValue}>
            <ShareModal 
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                imageData={generatedImageData}
                tweetUrl={tweetUrl}
            />

            <Header />
            {floorGuideModalState.isOpen && (
                <FloorGuideModal
                    floorNum={floorGuideModalState.floorNum}
                    floorMessages={floorMessages}
                    onClose={() => setFloorGuideModalState({ isOpen: false, floorNum: null })}
                />
            )}

            <GuidanceManager
                isGuideMode={isGuideMode}
                guideStep={guideStep}
                setGuideStep={setGuideStep}
                ownedMegidoIds={ownedMegidoIds}
            />
                        {!isMobileView && (
                <nav className="desktop-nav">
                    <div className="desktop-nav-tabs">
                        <button id="tab-button-details" onClick={() => handleTabClick('details')} className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}><span className="material-symbols-outlined">explore</span>マス詳細</button>
                        <button id="tab-button-ownership" onClick={() => handleTabClick('ownership')} className={`tab-button ${activeTab === 'ownership' ? 'active' : ''}`}><span className="material-symbols-outlined">group</span>所持メギド管理</button>
                        <button id="tab-button-formation" onClick={() => handleTabClick('formation')} className={`tab-button ${activeTab === 'formation' ? 'active' : ''}`}><span className="material-symbols-outlined">groups</span>編成管理</button>
                    </div>
                    <div className="desktop-nav-actions">
                        <button onClick={handleSaveLog} className="btn btn-ghost record">記録</button>
                        <button onClick={handleUndo} className="btn btn-ghost undo">アンドゥ</button>
                        <button onClick={() => handleResetRun(false)} className="btn btn-ghost retire">リタイア</button>
                    </div>
                </nav>
            )}
            <div className="main-content relative hex-grid">
                <InfoModal
                    isOpen={infoModalState.isOpen}
                    title={infoModalState.title}
                    onConfirm={infoModalState.onConfirm}
                >
                    {infoModalState.children}
                </InfoModal>

                {isMobileView ? (
                    <div className="mobile-view-container">
                        <div style={{ display: activeTab === 'summary' || activeTab === 'all_summary' ? 'block' : 'none', height: '100%', padding: '1rem' }}>
                            <RightPanelContent />
                        </div>
                        <div style={{ display: activeTab === 'details' ? 'block' : 'none', height: '100%' }}>
                            <div className="left-panel" style={{ width: '100%', overflowY: 'auto', scrollSnapType: 'y mandatory' }} >
                                <MapContent />
                            </div>
                        </div>
                        <div style={{ display: activeTab === 'ownership' ? 'block' : 'none', height: '100%' }}>
                            <OwnershipManager megidoDetails={megidoDetails} onDetailChange={handleMegidoDetailChangeWrapper} onCheckDistributed={handleCheckDistributedMegido} isMobileView={isMobileView} setModalState={setModalState} bossSquadIds={bossSquadIds} />
                        </div>
                        <div style={{ display: activeTab === 'formation' ? 'block' : 'none', height: '100%' }}>
                            {editingFormation ? (
                                <FormationEditor
                                    formation={editingFormation}
                                    onSave={handleSaveFormation}
                                    onCancel={handleCancelFormationEdit}
                                    ownedMegidoIds={ownedMegidoIds}
                                    megidoDetails={megidoDetails}
                                    initialTagTarget={initialTagTarget}
                                    previousScreen={previousScreen}
                                    showToastMessage={showToastMessage}
                                    onTargetSelect={onTargetSelect}
                                />
                            ) : (
                                                                                                <FormationManager 
                                                                                                    formations={formations} 
                                                                                                    onSave={handleSaveFormation} 
                                                                                                    onDelete={handleDeleteFormation} 
                                                                                                    onCopy={handleCopyFormation} 
                                                                                                    ownedMegidoIds={ownedMegidoIds} 
                                                                                                    megidoDetails={megidoDetails}
                                                                                                    initialTagTarget={initialTagTarget}
                                                                                                    setInitialTagTarget={setInitialTagTarget}
                                                                                                    showToastMessage={showToastMessage}
                                                                                                    setPreviousScreen={setPreviousScreen}
                                                                                                    previousScreen={previousScreen}
                                                                                                    onTargetSelect={onTargetSelect}
                                                                                                    onCancel={onCancel}
                                                                                                    isQriousLoaded={isQriousLoaded}
                                                                                                    isHtml5QrLoaded={isHtml5QrLoaded}
                                                                                                    onImport={handleImportFormation}
                                                                                                    idMaps={idMaps}
                                                                                                    editingFormation={editingFormation}
                                                                                                    onEditingFormationChange={setEditingFormation}
                                                                                                    onOpenCommunityFormations={handleOpenCommunityFormations}
                                                                                                    handlePostFormation={handlePostFormation} 
                                                                                                    isPosting={isPosting}
                                                                                                    bossFormationId={bossFormationId}
                                                                                                    onSetBossFormation={handleSetBossFormation}
                                                                                                    isGuideMode={isGuideMode}
                                                                                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="desktop-grid-container">
                        <div className="left-panel" style={{ scrollSnapType: 'y mandatory' }}>
                            <MapContent />
                        </div>
                        <div className="right-panel">
                            <div className={`details-container ${isRouteObvious ? 'desaturate-panel' : ''}`}>
                                <RightPanelContent />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {!isMobileView && (
                <div className="desktop-dashboard-footer">
                    {mode === 'plan' ? 
                        <PlanModeDashboard planConditions={planConditions} planState={planState} isMobileView={isMobileView} /> :
                        <ResourceDashboard />
                    }
                </div>
            )}
            <footer className={`${animationDuration > 0 ? 'footer-glow' : ''} ${isRecoveryRecommended ? 'footer-recovery-glow' : ''}`} style={footerStyle}>
                <p>星間の塔 攻略支援ツール</p>
            </footer>
            <InputModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
            />
            <RecoveryModal
                isOpen={recoveryModalState.isOpen}
                onClose={() => setRecoveryModalState({ isOpen: false })}
                onConfirm={recoveryModalState.onConfirm}
                title={recoveryModalState.title}
                message={recoveryModalState.message}
            />
            <ChoiceModal
                isOpen={choiceModalState.isOpen}
                onClose={() => setChoiceModalState({ isOpen: false })}
                onConfirm={choiceModalState.onConfirm}
                title={choiceModalState.title}
                message={choiceModalState.message}
                options={choiceModalState.options}
            />
            <StatusBuffModal
                isOpen={statusBuffModalState.isOpen}
                onClose={() => setStatusBuffModalState({ isOpen: false })}
                onConfirm={statusBuffModalState.onConfirm}
                expectationLevel={statusBuffModalState.expectationLevel}
            />
            <InfoModal
                isOpen={showUpdateModal}
                onClose={() => {
                    setShowUpdateModal(false);
                    localStorage.setItem('updateModalShown_20251007_ui_unify', 'true');
                    setIntroQueue(q => q.filter(item => item !== 'update'));
                }}
                title="アップデートのお知らせ"
            >
                <p>いつもご利用いただきありがとうございます。</p>
                <p>今回のアップデートでは、ガイドモードの機能を追加しました。</p>
                <ul style={{listStyle: 'inside', paddingLeft: '1rem'}}>
                    <li>一部の単語についてガイド用のメッセージが表示されるようになりました</li>
                    <li>ボスエネミーについて、攻略情報を表示できるようにしました</li>
                    <li>その他、軽微な不具合の修正を行いました。</li>
                </ul>
                <p>今後とも、星間の塔 攻略支援ツールをよろしくお願いいたします。</p>
            </InfoModal>
            <LogActionModal 
                isOpen={logActionModal.isOpen}
                onClose={() => setLogActionModal({ isOpen: false, squareKey: null })}
                squareKey={logActionModal.squareKey}
                selectedLog={selectedLog}
                towerData={TOWER_MAP_DATA}
            />
            <BossPlannerWizard
                isOpen={bossPlannerState.isOpen}
                onClose={() => {
                    const callback = bossPlannerState.onCloseCallback;
                    setBossPlannerState({ isOpen: false, boss: null, onCloseCallback: null });
                    if (callback) {
                        callback();
                    }
                }}
                boss={bossPlannerState.boss}
                guideText={bossPlannerState.boss && bossGuides ? (bossGuides[bossPlannerState.boss.name]?.text || 'このボスへの特別なガイド情報はありません。') : ''}
            />
            {showToast && <div className="toast-simple">{toastMessage}</div>}
            {achievementToast && (
                <div className="toast-container">
                    <div className="toast-content">
                        <div className="toast-icon">
                            <img src="asset/achievement.webp" alt="Achievement Icon" />
                        </div>
                        <div className="toast-text">
                            <div className="toast-title">実績を解除しました！</div>
                            <div className="toast-subtitle">{achievementToast.name}</div>
                        </div>
                    </div>
                </div>
            )}
            <Settings
                show={showSettings}
                onClose={handleCloseSettings}
                unlockedAchievements={unlockedAchievements}
                achievementsData={allAchievements}
                onExportData={handleExportData}
                onImportData={handleImportData}
                onResetAllData={handleResetAllData}
                onToggleTheme={handleToggleTheme}
                isMobileView={isMobileView}
                isTabletView={isTabletView}
                onUnlockAchievement={unlockAchievement}
                onOpenProfileGenerator={() => setShowProfileGenerator(true)}
                onIncrementAboutPageOpen={handleIncrementAboutPageOpen}
            />
            <ProfileCardGenerator
                isOpen={showProfileGenerator}
                onClose={() => setShowProfileGenerator(false)}
                profileData={profileData}
                megidoList={megidoList || []}
                achievements={unlockedAchievementsList}
            />
            {showTutorial && (
                <Tutorial
                    onComplete={handleTutorialComplete}
                    onClose={() => setShowTutorial(false) }
                    setActiveTab={setActiveTab}
                />
            )}
            <MapSearchModal
                isOpen={isMapSearchModalOpen}
                onClose={handleCloseMapSearch}
                towerData={typeof TOWER_MAP_DATA !== 'undefined' ? TOWER_MAP_DATA : []}
                megidoData={megidoList || []}
                enemyData={typeof ENEMY_ALL_DATA !== 'undefined' ? ENEMY_ALL_DATA : []}
                formations={formations}
                planState={planState}
                runState={runState}
                megidoDetails={megidoDetails}
                idMaps={idMaps}
                onSelectSquare={handleSquareClick}
                onGenerateShareImage={handleGenerateShareImage}
            />

            {showShareModal && generatedImageData && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200}} onClick={() => setShowShareModal(false)}>
                    <div className="card" style={{textAlign: 'center', padding: '20px', maxWidth: '90vw', maxHeight: '90vh'}} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0}}>共有用画像</h3>
                        <img src={generatedImageData} style={{maxWidth: '100%', maxHeight: 'calc(90vh - 150px)', margin: 'auto'}} />
                        <div style={{display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px'}}>
                            <a href={generatedImageData} download={`tower-formation-${Date.now()}.png`} className="btn btn-primary">ダウンロード</a>
                            <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">ツイート</a>
                            <button onClick={() => setShowShareModal(false)} className="btn btn-ghost">閉じる</button>
                        </div>
                    </div>
                </div>
            )}

            {communityFormationsState.isOpen && (
                <CommunityFormations
                    onClose={handleCloseCommunityFormations}
                    onCopyFormation={handleCopyCommunityFormation}
                    onDeleteFormation={handleDeleteCommunityFormation}
                    currentUser={currentUser}
                    ownedMegidoIds={ownedMegidoIds}
                    showToastMessage={showToastMessage}
                    initialFloor={communityFormationsState.floor}
                    initialEnemy={communityFormationsState.enemy}
                    initialHighlightId={communityFormationsState.highlightId}
                    initialMegidoName={communityFormationsState.initialFilter} // ★ この行を追加
                    userFormations={formations} // ユーザーの編成一覧
                    runHistory={runState.history} // 勝利履歴
                                        megidoDetails={megidoDetails} // メギド詳細データ
                    idMaps={idMaps}
                />
            )}
            {isMobileView && selectedSquare && (
                <div className="mobile-panel-overlay" onClick={() => onCancel()}>
                    <div className="mobile-panel-content" onClick={(e) => e.stopPropagation()}>
                        <RightPanelContent />
                    </div>
                </div>
            )}
            {isMobileView && (
                <div className="resource-dashboard-footer">
                    <ResourceDashboard 
                        runState={runState}
                        megidoConditions={megidoConditions}
                        ownedMegidoIds={ownedMegidoIds}
                        planState={planState}
                        formations={formations}
                        megidoDetails={megidoDetails}
                        manualRecovery={manualRecovery}
                        onManualRecover={handleManualRecovery}
                        isMobileView={isMobileView}
                        isCollapsed={isFooterCollapsed}
                        onToggleCollapse={handleToggleFooter}
                        planConditions={planConditions}
                    />
                </div>
            )}
        </window.AppContext.Provider>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(<TowerTool />);