const { useState, useEffect, useMemo, useRef, useCallback } = React;

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
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('ui_activeTab');
        const allowedTabs = ['details', 'ownership', 'formation', 'summary', 'all_summary'];
        return (savedTab && allowedTabs.includes(savedTab)) ? savedTab : 'details';
    });
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [mode, setMode] = useState(() => localStorage.getItem('ui_mode') || 'practice');
    
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
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [achievementToast, setAchievementToast] = useState(null);
    const [targetFloor, setTargetFloor] = useState(35);
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
    const [targetEnemies, setTargetEnemies] = useState(() => {
        const saved = localStorage.getItem('targetEnemies');
        return saved ? JSON.parse(saved) : {};
    });
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'auto');
    const [showBetaModal, setShowBetaModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isFooterCollapsed, setIsFooterCollapsed] = useState(() => {
        const saved = localStorage.getItem('isFooterCollapsed');
        return saved ? JSON.parse(saved) : true; // Default to collapsed
    });
    
    

    const isMobileSize = useMediaQuery('(max-width: 768px)');
    const isTabletSize = useMediaQuery('(min-width: 769px) and (max-width: 1180px)');
    const isMobileView = viewMode === 'mobile' || (viewMode === 'auto' && isMobileSize);
    const isTabletView = viewMode === 'tablet' || (viewMode === 'auto' && isTabletSize);

    const floorRefs = useRef({});

    useEffect(() => {
        document.body.classList.toggle('mobile-view', isMobileView);
        document.body.classList.toggle('tablet-view', isTabletView && !isMobileView);
    }, [isMobileView, isTabletView]);

    const handleToggleFooter = () => {
        const newCollapsedState = !isFooterCollapsed;
        setIsFooterCollapsed(newCollapsedState);
        localStorage.setItem('isFooterCollapsed', JSON.stringify(newCollapsedState));
    };

    useEffect(() => {
        const isFirstLaunch = !localStorage.getItem('hasLaunched');
        if (isFirstLaunch) {
            localStorage.setItem('hasLaunched', 'true');
            setMode('plan');
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

        if (mode === 'log') {
            if (!selectedLog) {
                showToastMessage('先に閲覧したいログを選択してください。');
                return;
            }
            setLogActionModal({ isOpen: true, squareKey: squareKey });
        } else {
            setSelectedSquare(squareInfo);
            setActiveTab('details');
        }
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
        handleUndo 
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
        updateGuidance,
        floorClearCounts,
        setFloorClearCounts,
        winStreak,
        setWinStreak,
        setActiveTab,
        isLoading
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
        mode,
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
        handleCreateFormationFromEnemy 
    } = useFormations({
        showToastMessage,
        idMaps,
        setDisplayedEnemy,
        setActiveTab,
        setPracticeView,
        mode,
        handleMegidoDetailChange
    });

    const { 
        communityFormationsState,
        handleOpenCommunityFormations,
        handleCloseCommunityFormations,
        handleCopyCommunityFormation,
        handlePostFormation,
        handleDeleteCommunityFormation,
        isPosting,
    } = useCommunityFormations({ formations, setFormations, showToastMessage, megidoDetails, idMaps, currentUser });

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
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const formationName = file.name.replace(/\.[^/.]+$/, "");
            html5QrCode.scanFile(file)
                .then(decodedText => {
                    try {
                        if (!/^[0-9]+$/.test(decodedText) || decodedText.length < 100) {
                            throw new Error('無効なQRコード形式です。');
                        }
                        let pointer = 0;
                        const enemyQRID = decodedText.substring(pointer, pointer += 3);
                        const floor = parseInt(decodedText.substring(pointer, pointer += 2), 10);
                        
                        const megidoSlots = [];

                        for (let i = 0; i < 5; i++) {
                            const megidoQRID = decodedText.substring(pointer, pointer += 3);
                            if (megidoQRID === '999') {
                                megidoSlots.push(null);
                                pointer += 21; // Skip the rest of the empty slot
                                continue;
                            }
                            const ougiLevel = parseInt(decodedText.substring(pointer, pointer += 2), 10);
                            const singularityLevel = parseInt(decodedText.substring(pointer, pointer += 1), 10);
                            const levelChar = decodedText.substring(pointer, pointer += 1);
                            const reishouQRIDs = [];
                            for(let j=0; j<4; j++) {
                                reishouQRIDs.push(decodedText.substring(pointer, pointer += 3));
                            }
                            const specialReishou = decodedText.substring(pointer, pointer += 1) === '1';
                            const bondReishou = parseInt(decodedText.substring(pointer, pointer += 1), 10);
                            const orbQRID = decodedText.substring(pointer, pointer += 3);

                            console.log("megidoQRID:", megidoQRID);
                            const megidoId = idMaps.megido.newToOriginal.get(String(megidoQRID));
                            console.log("megidoId:", megidoId);
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

                            // Update global details
                            handleMegidoDetailChange(megidoId, 'level', level);
                            handleMegidoDetailChange(megidoId, 'ougiLevel', ougiLevel || 1);
                            handleMegidoDetailChange(megidoId, 'special_reishou', specialReishou);
                            handleMegidoDetailChange(megidoId, 'bond_reishou', bondReishou || 0);
                            if (megidoMaster.Singularity) {
                                handleMegidoDetailChange(megidoId, 'singularity_level', singularityLevel || 0);
                            }
                        }
                        const enemyName = idMaps.enemy.newToOriginal.get(enemyQRID);
                        const newFormation = {
                            id: `f${Date.now()}`,
                            name: formationName,
                            megidoSlots: megidoSlots,
                            tags: [],
                            notes: '',
                            enemyName: enemyName || null,
                            floor: floor || null
                        };
                        
                        const newFormations = { ...formations, [newFormation.id]: newFormation };
                        setFormations(newFormations);
                        localStorage.setItem('formations', JSON.stringify(newFormations));
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
    useEffect(() => { localStorage.setItem('ui_mode', mode); }, [mode]);
    useEffect(() => { localStorage.setItem('ui_activeTab', activeTab); }, [activeTab]);

    const [isQriousLoaded, setIsQriousLoaded] = useState(false);
    const [isHtml5QrLoaded, setIsHtml5QrLoaded] = useState(false);

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
        if (typeof ACHIEVEMENTS === 'undefined') return;

        const userData = {
            formations,
            ownedMegidoIds,
            winStreak,
            floorClearCounts,
            themeToggleCount,
            dataManagementCount,
            planState
        };

        const newUnlocked = new Set(unlockedAchievements);
        let changed = false;

        for (const ach of Object.values(ACHIEVEMENTS)) {
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
    }, [formations, ownedMegidoIds, unlockedAchievements, winStreak, floorClearCounts, themeToggleCount, dataManagementCount, planState]);

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

    const handleExportData = () => {
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
        setThemeToggleCount(c => c + 1);
        const newTheme = document.body.className === 'light-mode' ? '' : 'light-mode';
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
    };

    // Also need to load the theme on boot
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.className = savedTheme;
        }
    }, []);

    const handleViewModeChange = (newMode) => {
        setViewMode(newMode);
        localStorage.setItem('viewMode', newMode);
    };

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
        const dataCheckInterval = setInterval(() => {
            if (typeof COMPLETE_MEGIDO_LIST !== 'undefined' &&
                typeof ENEMY_ALL_DATA !== 'undefined' &&
                typeof COMPLETE_ORB_LIST !== 'undefined' &&
                typeof COMPLETE_REISHOU_LIST !== 'undefined' &&
                typeof TOWER_MAP_DATA !== 'undefined' &&
                typeof MEGIDO_BIRTHDAY_DATA !== 'undefined') {
                setIsLoading(false);
                clearInterval(dataCheckInterval);
            }
        }, 100);
        return () => clearInterval(dataCheckInterval);
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();
        let todaysEvents = [];

        for (const event of MEGIDO_BIRTHDAY_DATA) {
            const [month, day] = event.date.replace('月', '-').replace('日', '').split('-').map(Number);
            const eventDate = new Date(currentYear, month - 1, day);
            let eventToShow = null;

            if (event.countdown) {
                const countdownDate = new Date(eventDate);
                countdownDate.setDate(eventDate.getDate() - event.countdown);
                if (countdownDate.getTime() === today.getTime()) {
                    const storageKey = `seen_event_${currentYear}_${event.name}_countdown`;
                    if (!localStorage.getItem(storageKey)) {
                        let text = event.countdown_text;
                        let anniversaryString = '';
                        if (event.type === 'anniversary') {
                            const year = currentYear + (today.getMonth() > month - 1 || (today.getMonth() === month - 1 && today.getDate() >= day) ? 1 : 0);
                            let anniversaryYear = year - event.start_year;
                            anniversaryString = anniversaryYear === 9 ? '７＋２周年' : `${anniversaryYear}周年`;
                            text = event.countdown_text_template.replace('X周年', anniversaryString);
                        }
                        eventToShow = { ...event, isCountdown: true, text: text, storageKey, anniversaryString };
                    }
                }
            }

            if (!eventToShow && eventDate.getTime() === today.getTime()) {
                const storageKey = `seen_event_${currentYear}_${event.name || event.base_name}`;
                if (!localStorage.getItem(storageKey)) {
                    let text = event.day_of_text;
                    let anniversaryString = '';
                    if (event.type === 'anniversary') {
                        let anniversaryYear = currentYear - event.start_year;
                        anniversaryString = anniversaryYear === 9 ? '７＋２周年' : `${anniversaryYear}周年`;
                        text = event.day_of_text_template.replace('X周年', anniversaryString);
                    } else if (event.type === 'birthday') {
                        text = `${event.date}は${event.base_name}${event.unit_name ? `（${event.unit_name}）` : ''}の${event.born_type}日です！`;
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
                const updateModalShown = localStorage.getItem('updateModalShown_20250911_final');
                if (!updateModalShown) {
                    setShowUpdateModal(true);
                }
            }
        }
    }, [eventQueue, shouldShowBetaModal]);

    const handleCloseEventToast = () => {
        if (dontShowAgain && eventToast) {
            localStorage.setItem(eventToast.storageKey, 'true');
        }
        setDontShowAgain(false);
        setEventQueue(queue => queue.slice(1));
    };

    const updateGuidance = useCallback(() => {
        if (typeof TOWER_MAP_DATA === 'undefined' || !runState.currentPosition) return;

        const profile = calculateMetrics(getProfile());
        const accessibleSquares = {};
        
        const currentFloorData = TOWER_MAP_DATA.find(f => f.floor === runState.currentPosition.floor);
        if (!currentFloorData) return;

        const clearedOnThisFloor = runState.cleared[currentFloorData.floor] || [];

        Object.keys(currentFloorData.squares).forEach(squareId => {
            if (!clearedOnThisFloor.includes(squareId)) {
                accessibleSquares[squareId] = { ...currentFloorData.squares[squareId], id: squareId };
            }
        });

        const candidates = {};
        let bestSquareId = null;
        let secondBestDesirability = -Infinity;
        let maxDesirability = -Infinity;

        for (const squareId in accessibleSquares) {
            const square = accessibleSquares[squareId];
            const desirability = calculateDesirability(square, profile, runState, megidoConditions, targetEnemies);
            candidates[squareId] = desirability;
            if (desirability > maxDesirability) {
                secondBestDesirability = maxDesirability;
                maxDesirability = desirability;
                bestSquareId = squareId;
            } else if (desirability > secondBestDesirability) {
                secondBestDesirability = desirability;
            }
        }

        if (bestSquareId && accessibleSquares[bestSquareId]?.sub_type === 'recovery') {
            setIsRecoveryRecommended(true);
        } else {
            setIsRecoveryRecommended(false);
        }

        const desirabilityGap = maxDesirability - secondBestDesirability;
        if (isFinite(desirabilityGap) && secondBestDesirability !== -Infinity && (maxDesirability / secondBestDesirability) > 1.5) {
            setIsRouteObvious(true);
        } else {
            setIsRouteObvious(false);
        }

        setGuidance({ recommended: bestSquareId, candidates });
    }, [runState, megidoConditions, targetEnemies]);

    useEffect(() => {
        if (!isLoading) {
            updateGuidance();
        }
    }, [runState, isLoading, megidoConditions, targetEnemies]);

    const CONDITION_LEVELS = ['絶好調', '好調', '普通', '不調', '絶不調', '気絶'];

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

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setDisplayedEnemy(null);
        if (mode === 'log' && newMode !== 'log') {
            handleSelectLog(null);
            setSelectedLogSquare(null);
        }
        setSelectedSquare(null);
        localStorage.removeItem('ui_selectedSquareKey');
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setDisplayedEnemy(null);
    };

    const onCancel = () => {
        setSelectedSquare(null);
        localStorage.removeItem('ui_selectedSquareKey');
    };

    const getSquareStyle = useCallback((square, floorData, squareId) => {
        let classes = '';
        if (selectedSquare && selectedSquare.floor.floor === floorData.floor && selectedSquare.id === squareId) {
            classes += ' node-state-selected';
        }
        const clearedSquaresOnFloor = runState.cleared[floorData.floor] || [];
        const isCleared = clearedSquaresOnFloor.includes(squareId);
        // Add node-cleared class ONLY if it's not a start square
        if (isCleared && mode === 'practice' && square.type !== 'start') {
            classes += ' node-cleared';
        }
        if (mode === 'plan') {
            const fullSquareId = `${floorData.floor}-${squareId}`;
            const isBattlePlanned = planState.assignments[fullSquareId] && Object.values(planState.assignments[fullSquareId]).some(slots => slots.some(id => id));
            const isExplorePlanned = planState.explorationAssignments[squareId] && Object.values(planState.explorationAssignments[squareId]).some(party => party.some(id => id));
    
            if (isBattlePlanned || isExplorePlanned) {
                classes += ' node-planned';
            }
        }
        if (mode === 'practice' && !isCleared) {
            const isOnCurrentFloor = runState.currentPosition?.floor === floorData.floor;
            if (isOnCurrentFloor) {
                classes += ' node-accessible';
                if (guidance.recommended === squareId) {
                    classes += ' node-recommended';
                } else if (guidance.candidates.hasOwnProperty(squareId)) {
                    classes += ' node-candidate';
                }
            } else {
                classes += ' node-inaccessible';
            }
        }
        return classes;
    }, [selectedSquare, runState, mode, planState, guidance]);

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
        console.log('Target selected:', target, screen);
    };

    const handleTargetFloorChange = (floor) => {
        setTargetFloor(floor);
    };

    const onRecommendationChange = (squareId, recommendation) => {
        const newRecs = { ...runState.recommendations, [squareId]: recommendation };
        setRunState({ ...runState, recommendations: newRecs });
        localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify({ ...runState, recommendations: newRecs }));
        showToastMessage('おすすめタイプを変更しました。');
    };

    const handleTargetEnemyChange = (squareId, enemyName) => {
        const newTargetEnemies = { ...targetEnemies };
        // If the same enemy is clicked again, untarget it.
        if (newTargetEnemies[squareId] === enemyName) {
            delete newTargetEnemies[squareId];
        } else {
            newTargetEnemies[squareId] = enemyName;
        }
        setTargetEnemies(newTargetEnemies);
        localStorage.setItem('targetEnemies', JSON.stringify(newTargetEnemies));
        showToastMessage('ターゲットを変更しました。');
        setTimeout(updateGuidance, 100);
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
        } else if (event.type === 'anniversary') {
            text = event.tweet_text_template.replace('X周年', event.anniversaryString);
        } else {
            text = event.tweet_text;
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

    const RightPanelContent = () => {
        return (<>
            {mode === 'log' ? (
                <LogViewer 
                    logs={seasonLogs}
                    selectedLog={selectedLog}
                    onSelectLog={handleSelectLog}
                    onDeleteLog={handleDeleteLog}
                    selectedLogSquare={selectedLogSquare}
                    onSelectLogSquare={setSelectedLogSquare}
                    megidoDetails={megidoDetails}
                    idMaps={idMaps}
                    formations={formations}
                    targetEnemies={targetEnemies}
                    towerConnections={towerConnections}
                    isMobileView={isMobileView}
                    activeTab={activeTab}
                />
            ) : (
                <div className="tab-content" style={{marginTop: '1rem', height: '100%'}}>
                    <div style={{ display: activeTab === 'details' ? 'block' : 'none', height: '100%' }}>
                        {!selectedSquare && <div className="placeholder" style={{height: '100%'}}>マスを選択してください</div>}
                        {selectedSquare && (() => {
                            const floorNum = selectedSquare.floor.floor;
                            const clearedSquaresOnFloor = runState.cleared[floorNum] || [];
                            const isCleared = clearedSquaresOnFloor.includes(selectedSquare.id);
                            const isPastFloor = floorNum < runState.highestFloorReached;
                            
                            let isResolvable = false;
                            if (mode === 'practice' && !isCleared) {
                                const connectionsForFloor = towerConnections[floorNum];
                                const fullCurrentSquareId = selectedSquare.id; // Use the id directly

                                if (connectionsForFloor && connectionsForFloor[fullCurrentSquareId]) {
                                    const neighbors = connectionsForFloor[fullCurrentSquareId];
                                    isResolvable = neighbors.some(neighborId => clearedSquaresOnFloor.includes(neighborId));
                                }
                            }

                            let isLocked = false;
                            let lockText = '';
                            if (mode === 'practice') {
                                if (isPastFloor) {
                                    isLocked = true;
                                    lockText = '階移動済み';
                                } else if (isCleared && selectedSquare.square.type !== 'start') {
                                    isLocked = true;
                                    lockText = '解放済み';
                                }
                            }

                            if (selectedSquare.square.type === 'start') {
                                return <StartSquarePanel square={selectedSquare} isLocked={isLocked} lockText={lockText} onCreateFormation={handleCreateFormationFromEnemy} />;
                            } else if (selectedSquare.square.type === 'explore') {
                                return <ExplorationActionPanel 
                                    square={selectedSquare}
                                    isPlanMode={mode === 'plan'}
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
                                    onOpenManualPowerInput={handleOpenManualPowerInput}
                                    onSetManualPower={handleSetManualPower}
                                />;
                            } else {
                                return <PracticeActionPanel 
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
                                    isPlanMode={mode === 'plan'}
                                    onPlanCombatParty={handlePlanCombatParty}
                                    targetEnemy={targetEnemies[selectedSquare.id]}
                                    onTargetEnemyChange={(enemyName) => handleTargetEnemyChange(selectedSquare.id, enemyName)}
                                    isResolvable={isResolvable}
                                    onSaveFormationMemo={handleSaveFormationMemo}
                                    onOpenCommunityFormations={handleOpenCommunityFormations}
                                />;
                            }
                        })()}
                    </div>
                    <div style={{ display: activeTab === 'ownership' ? 'block' : 'none', height: '100%' }}>
                        <OwnershipManager 
                            megidoDetails={megidoDetails} 
                            onDetailChange={handleMegidoDetailChangeWrapper}
                            onCheckDistributed={handleCheckDistributedMegido}
                            setModalState={setModalState}
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
                                onImport={handleImportFormation}
                                idMaps={idMaps}
                                editingFormation={editingFormation}
                                onEditingFormationChange={setEditingFormation}
                                onOpenCommunityFormations={handleOpenCommunityFormations}
                                handlePostFormation={handlePostFormation} 
                                isPosting={isPosting} 
                            />}
                        </div>
                    </div>
                </div>
            )}
        </>);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const MapContent = () => (
        <>
            {typeof TOWER_MAP_DATA !== 'undefined' && TOWER_MAP_DATA.map(floor => (
                <div ref={el => floorRefs.current[floor.floor] = el} key={floor.floor}>
                    <FloorGrid
                        key={floor.floor}
                        floorData={floor}
                        handleSquareClick={handleSquareClick}
                        getSquareStyle={getSquareStyle}
                        getSquareColorClass={getSquareColorClass}
                        getSquareColorRgbVarName={getSquareColorRgbVarName}
                        memos={memos}
                        activeFloor={planState.activeFloor}
                        targetFloor={targetFloor}
                        selectedSquare={selectedSquare}
                        runState={runState}
                        mode={mode}
                        planState={planState}
                        guidance={guidance}
                    />
                </div>
            ))}
        </>
    );

    return (
        <div className="app-container">
            {eventToast && (
                <div style={eventModalOverlayStyle} onClick={handleCloseEventToast}>
                    <div style={eventModalContentStyle} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0, color: 'var(--primary-accent)', fontSize: '24px'}}>おメギド！</h3>
                        <p style={{fontSize: '1.1rem', lineHeight: '1.6'}}>{eventToast.text}</p>
                        {eventToast.type === 'birthday' && (
                             <p>今日は{eventToast.base_name}を星間の塔で使ってみませんか？</p>
                        )}
                        <a 
                            href={generateEventTweetUrl(eventToast)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={isBirthdayButtonHovered ? eventButtonStyle.hover : eventButtonStyle.normal}
                            onMouseEnter={() => setIsBirthdayButtonHovered(true)}
                            onMouseLeave={() => setIsBirthdayButtonHovered(false)}
                            onClick={() => unlockAchievement('BIRTHDAY_TWEET')}
                        >
                            ツイートでお祝いする
                        </a>
                        <div style={{marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                            <input type="checkbox" id="dont-show-again" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} style={{width: '16px', height: '16px'}} />
                            <label htmlFor="dont-show-again" style={{color: 'var(--text-subtle)', cursor: 'pointer'}}>今日は再表示しない</label>
                        </div>
                    </div>
                </div>
            )}

            {showBetaModal && (
                <InfoModal 
                    isOpen={true} 
                    onClose={() => {
                        setShowBetaModal(false);
                        localStorage.setItem('betaModalShown', 'true');
                    }}
                    title="オープンβテストへようこそ！"
                >
                    {`この度は「星間の塔攻略支援ツール」オープンβにご参加いただき、本当にありがとうございます！！\n\n今回お試しいただいているのは、まだ全然完成していない“プロトタイプ版”です。\n「とりあえず動いてるな～」くらいの段階なので、荒削りな部分や足りない機能が多い点はご容赦ください。\n\nそのうえで、実際に触っていただく中で、\n「不具合を見つけた」「ここが使いにくい」「もっとこうしてほしい」\nといったご意見がありましたら、ぜひ気軽にお知らせください。\n\n報告はGoogleフォーム（設定 → ベータテスト用報告フォーム）から、何度でもご記入いただけます。\n小さな感想や気づきでも大歓迎です！\n\n皆さまからの声が、このツールをより良く育てていく力になります。\nどうぞよろしくお願いいたします！\n\nそれでは、良き戦争を！！！`}
                </InfoModal>
            )}

            {showUpdateModal && (
                <InfoModal
                    isOpen={true}
                    onClose={() => {
                        setShowUpdateModal(false);
                        localStorage.setItem('updateModalShown_20250918_community', 'true');
                    }}
                    title="機能改善と不具合修正のお知らせ (2025/09/18)"
                >
                    {`【新機能】
・「みんなの編成」機能を追加しました。
・投稿・削除にはGoogleアカウントかTwitterでのログインが必要です。
・閲覧するだけならログインは不要です。
・投稿されたデータを☆５で点数を付けることが可能です。
・採点するにはその編成を使う必要があります。
・「おまかせ探索」を追加しました
・次のコンディション回復マスまでの期間に計画モードで計画されているか、過去の履歴で使用されているメギドを取り除いて、目標とする期待度となる最小の組み合わせを探し出します。

【その他】
・この機能はまだテスト段階なので、今後大きく変化する可能性もあります。`}
                </InfoModal>
            )}

            <Header 
                mode={mode} 
                onModeChange={handleModeChange}
                targetFloor={targetFloor}
                onTargetFloorChange={handleTargetFloorChange}
                title="星間の塔 攻略支援ツール"
                activeTab={activeTab}
                onTabClick={handleTabClick}
                selectedSquare={selectedSquare}
                onSaveLog={handleSaveLog}
                onResetRun={handleResetRun}
                onUndo={handleUndo}
                onOpenSettings={handleOpenSettings}
                isMobileView={isMobileView}
                runState={runState}
                seasonLogs={seasonLogs}
                selectedLog={selectedLog}
                onSelectLog={handleSelectLog}
                currentUser={currentUser}
                onSignIn={handleSignIn}
                onSignOut={handleSignOut}
            />
                        {!isMobileView && (
                <nav className="desktop-nav">
                    <div className="desktop-nav-tabs">
                        <button onClick={() => handleTabClick('details')} className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}>マス詳細</button>
                        <button onClick={() => handleTabClick('ownership')} className={`tab-button ${activeTab === 'ownership' ? 'active' : ''}`}>所持メギド管理</button>
                        <button onClick={() => handleTabClick('formation')} className={`tab-button ${activeTab === 'formation' ? 'active' : ''}`}>編成管理</button>
                    </div>
                    <div className="desktop-nav-actions">
                        {mode === 'practice' && (
                            <>
                                <button onClick={handleSaveLog} className="btn btn-ghost record">記録</button>
                                <button onClick={handleUndo} className="btn btn-ghost undo">アンドゥ</button>
                                <button onClick={() => handleResetRun(false)} className="btn btn-ghost retire">リタイア</button>
                            </>
                        )}
                    </div>
                </nav>
            )}
            <div className="main-content">
                {isMobileView ? (
                    <div className="mobile-view-container">
                        <div style={{ display: mode === 'log' && (activeTab === 'summary' || activeTab === 'all_summary') ? 'block' : 'none', height: '100%', padding: '1rem' }}>
                            <RightPanelContent />
                        </div>
                        <div style={{ display: activeTab === 'details' ? 'block' : 'none', height: '100%' }}>
                            <div className="left-panel" style={{ width: '100%', overflowY: 'auto' }} >
                                <MapContent />
                            </div>
                        </div>
                        <div style={{ display: activeTab === 'ownership' ? 'block' : 'none', height: '100%' }}>
                            <OwnershipManager megidoDetails={megidoDetails} onDetailChange={handleMegidoDetailChangeWrapper} onCheckDistributed={handleCheckDistributedMegido} isMobileView={isMobileView} setModalState={setModalState} />
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
                                />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="desktop-grid-container">
                        <div className="left-panel">
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
                        <ResourceDashboard 
                            runState={runState}
                            megidoConditions={megidoConditions}
                            ownedMegidoIds={ownedMegidoIds}
                            planState={planState}
                            formations={formations}
                            mode={mode}
                            megidoDetails={megidoDetails}
                            manualRecovery={manualRecovery}
                            onManualRecover={handleManualRecovery}
                            isMobileView={isMobileView}
                            isCollapsed={isFooterCollapsed}
                            onToggleCollapse={handleToggleFooter}
                            planConditions={planConditions}
                        />
                    }
                </div>
            )}
            <footer className={`footer-glow-${partyConditionRisk} ${isRecoveryRecommended ? 'footer-recovery-glow' : ''}`} style={{ textAlign: 'center', padding: '1rem', borderTop: '1px solid #ccc' }}>
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
            <LogActionModal 
                isOpen={logActionModal.isOpen}
                onClose={() => setLogActionModal({ isOpen: false, squareKey: null })}
                squareKey={logActionModal.squareKey}
                selectedLog={selectedLog}
                towerData={TOWER_MAP_DATA}
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
                achievementsData={typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : {}}
                onExportData={handleExportData}
                onImportData={handleImportData}
                onResetAllData={handleResetAllData}
                onToggleTheme={handleToggleTheme}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                isMobileView={isMobileView}
                isTabletView={isTabletView}
                onUnlockAchievement={unlockAchievement}
            />
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
                        mode={mode}
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
        </div>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(<TowerTool />);
