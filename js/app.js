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

        const history = selectedLog.runState.history.filter(h => h.squareId === squareKey);
        const [floorNum, ...idParts] = squareKey.split('-');
        const squareId = idParts.join('-');
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
                        <button className="btn-close-modal" onClick={onClose}>閉じる</button>
                    </div>
                </div>
            </div>
        );
    };

    const TowerTool = () => {
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
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ui_activeTab') || 'details');
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [mode, setMode] = useState(() => localStorage.getItem('ui_mode') || 'practice');
    
    const [megidoDetails, setMegidoDetails] = useState(() => {
        const saved = localStorage.getItem('megidoDetails');
        return saved ? JSON.parse(saved) : {};
    });
    const [formations, setFormations] = useState(() => {
        const saved = localStorage.getItem('formations');
        return saved ? JSON.parse(saved) : [];
    });
    const [planState, setPlanState] = useState(() => {
        const saved = localStorage.getItem('planState');
        const defaultState = { assignments: {}, activeFloor: 1, explorationAssignments: {} };
        if (!saved) return defaultState;
        const parsed = JSON.parse(saved);
        if (!parsed.explorationAssignments) parsed.explorationAssignments = {};
        return parsed;
    });
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

    const [megidoConditions, setMegidoConditions] = useState({});
    const [runState, setRunState] = useState({ cleared: {}, highestFloorReached: 1, history: [], towerPower: 30, recommendations: {}, explorationFatigue: [] });

    const [planConditions, setPlanConditions] = useState({ fatigueByGroup: {}, megidoConditionsBySection: {} });

    const [practiceView, setPracticeView] = useState('action');
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [recoveryModalState, setRecoveryModalState] = useState({ isOpen: false });
    const [manualRecovery, setManualRecovery] = useState(null);
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [achievementToast, setAchievementToast] = useState(null);
    const [initialTagTarget, setInitialTagTarget] = useState(null);
    const [previousScreen, setPreviousScreen] = useState('map');
    const [targetFloor, setTargetFloor] = useState(35);
    const [displayedEnemy, setDisplayedEnemy] = useState(null);
    const [eventToast, setEventToast] = useState(null);
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
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem('viewMode') || 'auto';
    });
    const [isMobileView, setIsMobileView] = useState(false);
    const [isTabletView, setIsTabletView] = useState(false);
    const [editingFormation, setEditingFormation] = useState(null);
    const [showBetaModal, setShowBetaModal] = useState(false);
    
    const floorRefs = useRef({});

    // --- UI State Persistence ---
    useEffect(() => { localStorage.setItem('ui_mode', mode); }, [mode]);
    useEffect(() => { localStorage.setItem('ui_activeTab', activeTab); }, [activeTab]);

    const CONDITION_LEVELS = ['絶好調', '好調', '普通', '不調', '絶不調', '気絶'];

    const updateMegidoConditions = (megidoIds, change) => {
        setMegidoConditions(prevConditions => {
            const newConditions = { ...prevConditions };
            const messages = [];
            megidoIds.forEach(id => {
                if (!id) return;
                const megidoData = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(id));
                if (!megidoData) return;

                const oldCondition = newConditions[id] || '絶好調';
                const oldIndex = CONDITION_LEVELS.indexOf(oldCondition);
                const newIndex = Math.max(0, Math.min(CONDITION_LEVELS.length - 1, oldIndex + change));
                const newCondition = CONDITION_LEVELS[newIndex];

                if (oldCondition !== newCondition) {
                    newConditions[id] = newCondition;
                    const changeAmount = Math.abs(oldIndex - newIndex);
                    const changeText = change > 0 ? `${changeAmount}段階低下` : `${changeAmount}段階回復`;
                    messages.push(`${megidoData.名前}: ${oldCondition}→${newCondition} (${changeText})`);
                }
            });

            if (messages.length > 0) {
                showToastMessage(messages.join('\n'));
            }

            if (messages.length > 0) {
                return newConditions;
            } else {
                return prevConditions;
            }
        });
    };

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
        const handleResize = () => {
            const width = window.innerWidth;
            const isMobile = width <= 768;
            const isTablet = width > 768 && width <= 1180;

            const shouldBeMobile = viewMode === 'mobile' || (viewMode === 'auto' && isMobile);
            const shouldBeTablet = viewMode === 'tablet' || (viewMode === 'auto' && isTablet);

            setIsMobileView(shouldBeMobile);
            setIsTabletView(shouldBeTablet);
            
            document.body.classList.remove('mobile-view', 'tablet-view');
            if (shouldBeMobile) {
                document.body.classList.add('mobile-view');
            } else if (shouldBeTablet) {
                document.body.classList.add('tablet-view');
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);

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

    const ownedMegidoIds = useMemo(() => 
        new Set(Object.keys(megidoDetails).filter(id => megidoDetails[id] && megidoDetails[id].owned)),
        [megidoDetails]
    );

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

    useEffect(() => {
        if (mode !== 'plan') return;

        const fatigueByGroup = {};
        const megidoConditionsBySection = {};
        Object.entries(SIMULATED_CONDITION_SECTIONS).forEach(([style, sections]) => {
            sections.forEach(section => {
                const groupKey = `${section.start}-${section.end}`;
                fatigueByGroup[groupKey] = { used: 0, capacity: section.limit, style: style };
                megidoConditionsBySection[groupKey] = {};
            });
        });

        const megidoUsage = {};
        for (const [fullSquareId, enemyAssignments] of Object.entries(planState.assignments || {})) {
            const parts = fullSquareId.split('-');
            const floor = parseInt(parts[0], 10);
            const squareId = parts.slice(1).join('-');
            for (const formationSlots of Object.values(enemyAssignments)) {
                for (const formationId of formationSlots) {
                    if (!formationId) continue;
                    const formation = formations.find(f => f.id === formationId);
                    if (formation && formation.megido) {
                        formation.megido.forEach(m => {
                            if (m && m.id) {
                                const id = String(m.id);
                                if (!megidoUsage[id]) megidoUsage[id] = [];
                                if (!megidoUsage[id].some(u => u.squareId === squareId && u.type === 'combat')) {
                                    megidoUsage[id].push({ floor, squareId, type: 'combat' });
                                }
                            }
                        });
                    }
                }
            }
        }
        for (const [squareId, explorationParties] of Object.entries(planState.explorationAssignments || {})) {
            const floor = parseInt(squareId.split('-')[0].replace('f', ''));
            for (const party of Object.values(explorationParties)) {
                if (party && Array.isArray(party)) {
                    party.forEach(megidoId => {
                        if (megidoId) {
                            const id = String(megidoId);
                            if (!megidoUsage[id]) megidoUsage[id] = [];
                            if (!megidoUsage[id].some(u => u.squareId === squareId && u.type === 'explore')) {
                                megidoUsage[id].push({ floor, squareId, type: 'explore' });
                            }
                        }
                    });
                }
            }
        }


        const finalFatigueState = {};
        const ownedMegido = Object.keys(megidoDetails).filter(id => megidoDetails[id]?.owned);
        ownedMegido.forEach(id => finalFatigueState[id] = 0);

        const styleOrder = ['rush', 'counter', 'burst'];
        const styleKeyMap = { 'ラッシュ': 'rush', 'カウンター': 'counter', 'バースト': 'burst' };

        styleOrder.forEach(style => {
            const sections = SIMULATED_CONDITION_SECTIONS[style];
            if (!sections) return;

            for (const section of sections) {
                const groupKey = `${section.start}-${section.end}`;
                const megidoUsedInThisSection = new Set();

                // Apply recovery at the START of the section
                const recoveryAmount = section.start >= 21 ? 2 : 1;
                const extraRecovery = (style === 'burst' && section.start === 19) ? 2 : 0;
                ownedMegido.forEach(id => {
                    const megidoInfo = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === id);
                    const megidoStyle = megidoInfo ? (megidoInfo.style ?? megidoInfo.スタイル) : null;
                    if (megidoInfo && megidoStyle && styleKeyMap[megidoStyle] === style) {
                        finalFatigueState[id] = Math.max(0, finalFatigueState[id] - recoveryAmount - extraRecovery);
                    }
                });

                // Calculate fatigue for this section
                for (let floor = section.start; floor <= section.end; floor++) {
                    for (const megidoId in megidoUsage) {
                        const megidoInfo = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === megidoId);
                        const megidoStyle = megidoInfo ? (megidoInfo.style ?? megidoInfo.スタイル) : null;
                        if (!megidoStyle || styleKeyMap[megidoStyle] !== style) continue;

                        const usagesOnThisFloor = megidoUsage[megidoId].filter(u => u.floor === floor);
                        if (usagesOnThisFloor.length > 0) {
                            megidoUsedInThisSection.add(megidoId);
                            usagesOnThisFloor.forEach(usage => {
                                const conditionDrop = usage.type === 'explore' ? 2 : 1;
                                finalFatigueState[megidoId] += conditionDrop;
                            });
                        }
                    }
                }

                // Update display data for this section to show all fatigued megido of the correct style
                fatigueByGroup[groupKey].used = megidoUsedInThisSection.size;
                ownedMegido.forEach(megidoId => {
                    const megidoInfo = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === megidoId);
                    const megidoStyle = megidoInfo ? (megidoInfo.style ?? megidoInfo.スタイル) : null;
                    if (megidoInfo && megidoStyle && styleKeyMap[megidoStyle] === style) {
                        // Only show if not in peak condition
                        if (finalFatigueState[megidoId] > 0) {
                            megidoConditionsBySection[groupKey][megidoId] = {
                                fatigue: finalFatigueState[megidoId],
                                megido: megidoInfo
                            };
                        }
                    }
                });
            }
        });

        setPlanConditions({ fatigueByGroup, megidoConditionsBySection });
    }, [planState, formations, megidoDetails, mode]);

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
        const date = new Date();
        const conditionsSeasonKey = `${date.getFullYear()}年${date.getMonth() + 1}月シーズンの記録_conditions`;
        const savedConditions = localStorage.getItem(conditionsSeasonKey);
        if (savedConditions) {
            setMegidoConditions(JSON.parse(savedConditions));
        } else {
            const initialConditions = {};
            Object.keys(megidoDetails).forEach(id => {
                if(megidoDetails[id]?.owned) initialConditions[id] = '絶好調';
            });
            setMegidoConditions(initialConditions);
        }
        
        const seasonKey = `${date.getFullYear()}年${date.getMonth() + 1}月シーズンの記録`;
        const savedRun = localStorage.getItem(seasonKey);
        if (savedRun) {
            const parsedRun = JSON.parse(savedRun);
            if (!parsedRun.towerPower) parsedRun.towerPower = 30;
            if (!parsedRun.recommendations) parsedRun.recommendations = {};
            if (!parsedRun.currentPosition) parsedRun.currentPosition = { floor: 1, squareId: 'f1-s' };
            if (!parsedRun.explorationFatigue) parsedRun.explorationFatigue = [];
            if (!parsedRun.floorEntryPower) parsedRun.floorEntryPower = { '1': 30 };
            if (!parsedRun.powerRecoveredOnFloor) parsedRun.powerRecoveredOnFloor = {};
            if (!parsedRun.totalPowerRecovered) parsedRun.totalPowerRecovered = 0;
            setRunState(parsedRun);
        } else {
            handleResetRun(true);
        }

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
    }, [isLoading]); // Depend on isLoading to ensure data is available

    useEffect(() => {
        if (isLoading || typeof MEGIDO_BIRTHDAY_DATA === 'undefined') return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();
        let eventWasShown = false;

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
                setEventToast(eventToShow);
                eventWasShown = true;
                break; 
            }
        }

        // Check for beta modal
        const betaModalShown = localStorage.getItem('betaModalShown');
        if (!betaModalShown) {
            const betaStartDate = new Date('2025-09-09');
            const betaEndDate = new Date('2025-09-17');
            betaStartDate.setHours(0, 0, 0, 0);
            betaEndDate.setHours(0, 0, 0, 0);

            if (today >= betaStartDate && today < betaEndDate) {
                if (!eventWasShown) {
                    unlockAchievement('BETA_TESTER');
                    setShowBetaModal(true);
                }
            }
        }
    }, [isLoading]);

    useEffect(() => {
        if (!isLoading) {
            updateGuidance();
        }
    }, [runState, isLoading]);

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

    useEffect(() => {
        if (Object.keys(megidoConditions).length > 0) {
            const date = new Date();
            const seasonKey = `${date.getFullYear()}年${date.getMonth() + 1}月シーズンの記録_conditions`;
            localStorage.setItem(seasonKey, JSON.stringify(megidoConditions));
        }
    }, [megidoConditions]);

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

    const showToastMessage = (message) => {
        setToastMessage(message); setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
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

    useEffect(() => {
        const threshold = 160; // The threshold for detecting devtools
        let devtoolsOpen = false; // Flag to prevent continuous firing

        const checkDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    showAchievementToastById('DEBUG');
                }
            } else {
                devtoolsOpen = false;
            }
        };

        const intervalId = setInterval(checkDevTools, 1000);

        return () => clearInterval(intervalId);
    }, []); // Run only once on mount

    const handleCreateFormationFromEnemy = (enemyName, floor) => {
        setInitialTagTarget({ enemy: enemyName, floor: floor });
        if (mode === 'plan') {
            setPreviousScreen('combat_plan');
            setActiveTab('formation');
        } else {
            setPreviousScreen('action');
            setPracticeView('formation');
        }
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

    const handleMegidoDetailChange = (megidoId, key, value) => {
        const newDetails = { ...megidoDetails };
        if (!newDetails[megidoId]) {
            const megidoData = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(megidoId));
            newDetails[megidoId] = { owned: false, level: 70, ougiLevel: 3, special_reishou: megidoData?.専用霊宝 || false, bond_reishou: 0, reishou: [] };
        }
        newDetails[megidoId] = { ...newDetails[megidoId], [key]: value };
        setMegidoDetails(newDetails);
        localStorage.setItem('megidoDetails', JSON.stringify(newDetails));
    };

    const handleMegidoDetailChangeWrapper = (arg1, key, value) => {
        if (typeof arg1 === 'object' && key === undefined && value === undefined) {
            setMegidoDetails(arg1);
            localStorage.setItem('megidoDetails', JSON.stringify(arg1));
            showToastMessage('所持メギド情報を更新しました。');
        } else {
            handleMegidoDetailChange(arg1, key, value);
        }
    };
    
    const handleResetRun = (isInitialBoot = false) => {
        const confirmReset = isInitialBoot ? true : window.confirm('本当に今回の挑戦をリセットしますか？\nコンディション、実践モードの進捗が初期化されます。');
        if (confirmReset) {
            unlockAchievement('RESET_RUN');
            const newRecommendations = {};
            if (typeof TOWER_MAP_DATA !== 'undefined') {
                TOWER_MAP_DATA.forEach(floor => {
                    Object.entries(floor.squares).forEach(([squareId, square]) => {
                        if (square.type === 'explore') {
                            newRecommendations[squareId] = RECOMMENDATION_TYPES[Math.floor(Math.random() * RECOMMENDATION_TYPES.length)];
                        }
                    });
                });
            }
            const initialRunState = { cleared: { '1': ['f1-s'] }, highestFloorReached: 1, history: [], towerPower: 30, recommendations: newRecommendations, currentPosition: { floor: 1, squareId: 'f1-s' }, explorationFatigue: [], floorEntryPower: { '1': 30 }, powerRecoveredOnFloor: {}, totalPowerRecovered: 0 };
            setRunState(initialRunState);
            localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify(initialRunState));
            const initialConditions = {};
            if (typeof COMPLETE_MEGIDO_LIST !== 'undefined') {
                Object.keys(megidoDetails).forEach(id => {
                    if(megidoDetails[id]?.owned) initialConditions[id] = '絶好調';
                });
            }
            setMegidoConditions(initialConditions);
            localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録_conditions`, JSON.stringify(initialConditions));
            setSelectedSquare(null);
            localStorage.removeItem('ui_selectedSquareKey');
            if (!isInitialBoot) {
                setActiveTab('ownership');
                showToastMessage('挑戦状況をリセットしました。');
            }
        }
    };

    const handleCheckDistributedMegido = () => {
        if (typeof COMPLETE_MEGIDO_LIST === 'undefined') {
            alert('メギドデータが読み込まれていません。');
            return;
        }
        const newDetails = { ...megidoDetails };
        let checkedCount = 0;
        COMPLETE_MEGIDO_LIST.forEach(megido => {
            if (megido.入手方法 && megido.入手方法.includes('配布')) {
                if (!newDetails[megido.id] || !newDetails[megido.id].owned) {
                    if (!newDetails[megido.id]) {
                        newDetails[megido.id] = { owned: true, level: 70, ougiLevel: 3, special_reishou: megido.専用霊宝 || false, bond_reishou: 0, reishou: [] };
                    } else {
                        newDetails[megido.id].owned = true;
                    }
                    checkedCount++;
                }
            }
        });
        handleMegidoDetailChangeWrapper(newDetails);
        showToastMessage(`${checkedCount}体の配布メギドを所持チェックしました。`);
    };

    const handleSaveFormation = (formationToSave, targetScreen) => {
        const index = formations.findIndex(f => f.id === formationToSave.id);
        const newFormations = index > -1 ? formations.map(f => f.id === formationToSave.id ? formationToSave : f) : [...formations, formationToSave];
        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations));
        setDisplayedEnemy(null);
        if (mode === 'plan') setActiveTab(targetScreen || 'formation');
        else setPracticeView('action');
        showToastMessage('編成を保存しました。');
    };

    const handleSaveFormationMemo = (formationId, newNotes) => {
        if (!formationId) return;
        const newFormations = formations.map(f => {
            if (f.id === formationId) {
                return { ...f, notes: newNotes };
            }
            return f;
        });
        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations));
        showToastMessage('編成メモを更新しました。');
    };

    const handleDeleteFormation = (formationId) => {
        if (window.confirm('この編成を本当に削除しますか？')) {
            const newFormations = formations.filter(f => f.id !== formationId);
            setFormations(newFormations);
            localStorage.setItem('formations', JSON.stringify(newFormations));
            showToastMessage('編成を削除しました。');
        }
    };

    const handleCopyFormation = (formationToCopy) => {
        const newFormation = { ...JSON.parse(JSON.stringify(formationToCopy)), id: `f${Date.now()}`, name: `${formationToCopy.name} (コピー)` };
        setFormations([...formations, newFormation]);
        localStorage.setItem('formations', JSON.stringify([...formations, newFormation]));
        showToastMessage('編成をコピーしました。');
    };

    const handleImportFormation = () => {
        if (!idMaps) {
            showToastMessage('IDマッピングが準備できていません。');
            return;
        }
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        const html5QrCode = new Html5Qrcode("qr-reader-div");
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const formationName = file.name.replace(/\.[^/.]+$/, "");
            html5QrCode.scanFile(file, true)
                .then(decodedText => {
                    try {
                        if (!/^[0-9]+$/.test(decodedText) || decodedText.length < 100) {
                            throw new Error('無効なQRコード形式です。');
                        }
                        let pointer = 0;
                        const enemyQRID = decodedText.substring(pointer, pointer += 3);
                        const floor = parseInt(decodedText.substring(pointer, pointer += 2), 10);
                        const newMegidoDetails = JSON.parse(JSON.stringify(megidoDetails));
                        const newMegidoList = [];
                        for (let i = 0; i < 5; i++) {
                            const megidoQRID = decodedText.substring(pointer, pointer += 3);
                            if (megidoQRID === '999') {
                                newMegidoList.push(null);
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

                            const megidoId = idMaps.megido.newToOriginal.get(megidoQRID);
                            if (!megidoId) continue;

                            let megidoData = COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId);
                            if (!megidoData) continue;

                            megidoData = JSON.parse(JSON.stringify(megidoData));

                            const levelMap = {'0': 70, '1': 72, '2': 74, '3': 76, '4': 80};
                            megidoData.level = levelMap[levelChar] || 70;
                            megidoData.ougiLevel = ougiLevel || 1;
                            megidoData.special_reishou = specialReishou;
                            megidoData.bond_reishou = bondReishou || 0;
                            megidoData.singularity_level = singularityLevel || 0;

                            const orbId = idMaps.orb.newToOriginal.get(orbQRID);
                            megidoData.orb = orbId ? COMPLETE_ORB_LIST.find(o => o.id === orbId) : null;

                            megidoData.reishou = reishouQRIDs
                                .map(rqid => {
                                    if (rqid === '999') return null;
                                    const reishouId = idMaps.reishou.newToOriginal.get(rqid);
                                    return reishouId ? COMPLETE_REISHOU_LIST.find(r => r.id === reishouId) : null;
                                })
                                .filter(Boolean);

                            newMegidoList.push(megidoData);

                            // Update global details
                            handleMegidoDetailChange(megidoId, 'level', levelMap[levelChar] || 70);
                            handleMegidoDetailChange(megidoId, 'ougiLevel', ougiLevel || 1);
                            handleMegidoDetailChange(megidoId, 'special_reishou', specialReishou);
                            handleMegidoDetailChange(megidoId, 'bond_reishou', bondReishou || 0);
                            if (megidoData.Singularity) {
                                handleMegidoDetailChange(megidoId, 'singularity_level', singularityLevel || 0);
                            }
                        }
                        const enemyName = idMaps.enemy.newToOriginal.get(enemyQRID);
                        const newFormation = {
                            id: `f${Date.now()}`,
                            name: formationName,
                            megido: newMegidoList,
                            tags: [],
                            notes: '',
                            enemyName: enemyName || null,
                            floor: floor || null
                        };
                        const newFormations = [...formations, newFormation];
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

    const handleSquareClick = (floorData, square, squareId, index) => {
        const squareInfo = { floor: floorData, square: square, id: squareId };
        const squareKey = `${floorData.floor}-${squareId}`;
        localStorage.setItem('ui_selectedSquareKey', squareKey);

        if (mode === 'log') {
            setLogActionModal({ isOpen: true, squareKey: squareKey });
        } else {
            setSelectedSquare(squareInfo);
            setActiveTab('details');
        }
    };

    const handleSelectLog = (log) => {
        setSelectedLog(log);
        if (log) {
            localStorage.setItem('ui_selectedLogName', log.name);
        } else {
            localStorage.removeItem('ui_selectedLogName');
        }
    };

    const onCancel = () => {
        setSelectedSquare(null);
        localStorage.removeItem('ui_selectedSquareKey');
    };

    const getSquareStyle = (square, floorData, squareId) => {
        let classes = '';
        if (selectedSquare && selectedSquare.floor.floor === floorData.floor && selectedSquare.id === squareId) {
            classes += ' node-state-selected';
        }
        const clearedSquaresOnFloor = runState.cleared[floorData.floor] || [];
        const isCleared = clearedSquaresOnFloor.includes(squareId);
        if (isCleared && mode === 'practice') {
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
    };

    const getSquareColorClass = (square) => {
        if (square.type === 'start') return 'node-color-start';
        if (square.type === 'boss') return 'node-color-boss';
        if (square.type === 'battle') return 'node-color-battle';
        
        if (square.type === 'explore') {
            if (square.sub_type === 'recovery') {
                if (square.style === 'RANDOM') {
                    return 'node-color-recovery-RANDOM';
                }
                return `node-color-recovery-${square.style.slice(0, 1)}`;
            }
            if (square.sub_type === 'tower_power') {
                return 'node-color-tower-power';
            }
            return 'node-color-random';
        }
        
        return '';
    };

    const getSquareColorRgbVarName = (square) => {
        if (square.type === 'start') return '--node-color-start-rgb';
        if (square.type === 'boss') return '--node-color-boss-rgb';
        if (square.type === 'battle') return '--node-color-battle-rgb';
        
        if (square.type === 'explore') {
            if (square.sub_type === 'recovery') {
                if (square.style === 'RANDOM') return '--node-color-random-rgb'; // Fallback for random
                return `--node-color-recovery-${square.style.slice(0, 1).toLowerCase()}-rgb`;
            }
            if (square.sub_type === 'tower_power') {
                return '--node-color-tower-power-rgb';
            }
            return '--node-color-random-rgb';
        }
        
        return '--text-main'; // Default fallback
    };

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

    const onPlanExplorationParty = (squareId, recType, party) => {
        const newPlanState = {
            ...planState,
            explorationAssignments: {
                ...planState.explorationAssignments,
                [squareId]: {
                    ...(planState.explorationAssignments[squareId] || {}),
                    [recType]: party
                }
            }
        };
        setPlanState(newPlanState);
        localStorage.setItem('planState', JSON.stringify(newPlanState));
        showToastMessage('探索計画を更新しました。');
    };

    const handlePlanCombatParty = (squareId, enemyName, slotIndex, formationId) => {
        const newAssignmentsForSquare = { ...(planState.assignments[squareId] || {}) };
        const newSlotsForEnemy = [...(newAssignmentsForSquare[enemyName] || Array(3).fill(null))];

        // Remove duplicates
        const existingIndex = newSlotsForEnemy.indexOf(formationId);
        if (existingIndex > -1) {
            newSlotsForEnemy[existingIndex] = null;
        }
        newSlotsForEnemy[slotIndex] = formationId;

        const newPlanState = {
            ...planState,
            assignments: {
                ...planState.assignments,
                [squareId]: {
                    ...newAssignmentsForSquare,
                    [enemyName]: newSlotsForEnemy
                }
            }
        };
        setPlanState(newPlanState);
        localStorage.setItem('planState', JSON.stringify(newPlanState));
        showToastMessage('戦闘計画を更新しました。');
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

    const handleManualRecovery = (megidoId) => {
        if (!manualRecovery) return;

        const megido = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(megidoId));
        if (!megido) return;

        const megidoStyle = megido.style ?? megido.スタイル;
        if (!megidoStyle) return;
        
        const megidoStyleKey = megidoStyle.includes('ラッシュ') ? 'R' : megidoStyle.includes('カウンター') ? 'C' : 'B';

        if (megidoStyleKey === manualRecovery.style) {
            updateMegidoConditions([megidoId], manualRecovery.recoveryAmount);
            const newPoints = manualRecovery.points - 1;
            if (newPoints > 0) {
                setManualRecovery({ ...manualRecovery, points: newPoints });
            } else {
                setManualRecovery(null);
                showToastMessage('手動回復を完了しました。');
            }
        }
    };

    const updateGuidance = () => {
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
    };

    const handleResolveSquare = (result, data, square) => {
        console.log("Resolving square:", square.id, "sub_type:", square.square.sub_type, "style:", square.square.style);

        let newRunState = { ...runState };
        const isBoss = square.square.type === 'boss';
        const hasBeenAttempted = newRunState.history.some(h => h.squareId === square.id && h.type === 'battle');
        const cost = isBoss && !hasBeenAttempted ? 0 : 1;
        if (newRunState.towerPower < cost) {
            showToastMessage('塔破力が足りません。');
            return;
        }
        newRunState.towerPower -= cost;
        switch (result) {
            case 'explore': {
                logAction('EXPLORE', { sub_type: square.square.sub_type });
                const megidoIds = data.party.map(m => m.id);
                updateMegidoConditions(megidoIds, 2);
                newRunState.explorationFatigue = [...new Set([...newRunState.explorationFatigue, ...megidoIds])];
                
                const floorNum = String(square.floor.floor);
                if (!newRunState.cleared[floorNum]) {
                    newRunState.cleared[floorNum] = [];
                }
                newRunState.cleared[floorNum].push(square.id);
                newRunState.history.push({
                    type: 'explore',
                    squareId: square.id,
                    floor: floorNum,
                    megido: megidoIds,
                    totalPower: data.totalPower,
                    requiredPower: data.requiredPower,
                    expectationLevel: data.expectationLevel,
                    timestamp: new Date().toISOString()
                });
                showToastMessage('探索完了');
                break;
            }
            case 'win': {
                setWinStreak(s => s + 1);
                const megidoIds = data.megido.filter(m => m).map(m => m.id);
                const isLowCondition = megidoIds.some(id => (CONDITION_LEVELS.indexOf(megidoConditions[id] || '絶好調') >= 3));
                logAction('COMBAT_RESULT', { result: 'win', isLowCondition });

                updateMegidoConditions(megidoIds, 1);
                const floorNum = String(square.floor.floor);
                if (!newRunState.cleared[floorNum]) {
                    newRunState.cleared[floorNum] = [];
                }
                newRunState.cleared[floorNum].push(square.id);
                newRunState.history.push({
                    type: 'battle',
                    result: 'win',
                    squareId: square.id,
                    floor: floorNum,
                    formationId: data.id,
                    timestamp: new Date().toISOString()
                });
                showToastMessage('勝利！');
                if (square.square.type === 'boss') {
                    const newCounts = { ...floorClearCounts };
                    newCounts[floorNum] = (newCounts[floorNum] || 0) + 1;
                    setFloorClearCounts(newCounts);
                    logAction('BOSS_DEFEAT', { floor: square.floor.floor, towerPower: newRunState.towerPower });

                    const currentFloor = parseInt(floorNum, 10);
                    const entryPower = runState.floorEntryPower[currentFloor] || 30; // Fallback
                    const recoveredOnFloor = runState.powerRecoveredOnFloor[currentFloor] || 0;
                    const consumedOnFloor = entryPower - newRunState.towerPower + recoveredOnFloor;

                    const statsKey = 'towerPowerStats';
                    const savedStatsRaw = localStorage.getItem(statsKey);
                    const savedStats = savedStatsRaw ? JSON.parse(savedStatsRaw) : { runs: [], floorAverages: {} };

                    const floorStats = savedStats.floorAverages[currentFloor] || { totalConsumed: 0, count: 0 };
                    floorStats.totalConsumed += consumedOnFloor;
                    floorStats.count += 1;
                    savedStats.floorAverages[currentFloor] = floorStats;

                    if (currentFloor === 35) {
                        const totalConsumedInRun = 30 - newRunState.towerPower + (newRunState.totalPowerRecovered || 0);
                        savedStats.runs.push({ totalConsumed: totalConsumedInRun });
                    }

                    localStorage.setItem(statsKey, JSON.stringify(savedStats));

                    const nextFloorNum = Number(floorNum) + 1;
                    if (nextFloorNum <= 35) {
                        const nextFloorData = TOWER_MAP_DATA.find(f => f.floor === nextFloorNum);
                        if (nextFloorData) {
                            const nextFloorStartSquare = Object.keys(nextFloorData.squares).find(key => nextFloorData.squares[key].type === 'start');
                            if (nextFloorStartSquare) {
                                if (!newRunState.cleared[nextFloorNum]) {
                                    newRunState.cleared[nextFloorNum] = [];
                                }
                                newRunState.cleared[nextFloorNum].push(nextFloorStartSquare);
                                newRunState.highestFloorReached = nextFloorNum;
                                newRunState.currentPosition = { floor: nextFloorNum, squareId: nextFloorStartSquare }; // Update current position
                                newRunState.floorEntryPower[nextFloorNum] = newRunState.towerPower;
                                if (floorRefs.current[nextFloorNum]) {
                                    setTimeout(() => {
                                        floorRefs.current[nextFloorNum].scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                }
                            }
                        }
                    }
                }
                break;
            }
            case 'lose': {
                const megidoIds = data.megido.filter(m => m).map(m => m.id);
                const isLowCondition = megidoIds.some(id => (CONDITION_LEVELS.indexOf(megidoConditions[id] || '絶好調') >= 3));
                logAction('COMBAT_RESULT', { result: 'lose', isLowCondition });

                updateMegidoConditions(megidoIds, 2);
                newRunState.history.push({
                    type: 'battle',
                    result: 'lose',
                    squareId: square.id,
                    floor: String(square.floor.floor),
                    formationId: data.id,
                    timestamp: new Date().toISOString()
                });
                showToastMessage('敗北...');
                break;
            }
            case 'retreat': {
                setWinStreak(0);
                const megidoIds = data.megido.filter(m => m).map(m => m.id);
                const isLowCondition = megidoIds.some(id => (CONDITION_LEVELS.indexOf(megidoConditions[id] || '絶好調') >= 3));
                logAction('COMBAT_RESULT', { result: 'retreat', isLowCondition });

                newRunState.history.push({
                    type: 'battle',
                    result: 'retreat',
                    squareId: square.id,
                    floor: String(square.floor.floor),
                    formationId: data.id,
                    timestamp: new Date().toISOString()
                });
                showToastMessage('戦闘を棄権しました。');
                break;
            }
            default:
                break;
        }
        
        setRunState(newRunState);
        localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify(newRunState));
        setSelectedSquare(null);
        localStorage.removeItem('ui_selectedSquareKey');
        updateGuidance();

        if (result === 'explore') {
            const squareSubType = square.square.sub_type;
            const squareStyle = square.square.style;

            if (squareSubType === 'tower_power') { 
                setModalState({ isOpen: true, title: '塔破力回復', message: '回復した塔破力の値を入力してください。', onConfirm: (amountStr) => { 
                    const amount = parseInt(amountStr, 10);
                    if (!isNaN(amount) && amount > 0) { 
                        setRunState(prev => { 
                            const currentFloor = prev.currentPosition.floor;
                            const newState = { 
                                ...prev, 
                                towerPower: prev.towerPower + amount,
                                totalPowerRecovered: (prev.totalPowerRecovered || 0) + amount,
                                powerRecoveredOnFloor: {
                                    ...prev.powerRecoveredOnFloor,
                                    [currentFloor]: (prev.powerRecoveredOnFloor?.[currentFloor] || 0) + amount
                                }
                            }; 
                            localStorage.setItem(`${new Date().getFullYear()}年${new Date().getMonth() + 1}月シーズンの記録`, JSON.stringify(newState)); 
                            return newState; 
                        }); 
                        showToastMessage(`塔破力が${amount}回復しました。`); 
                    } 
                    setModalState(prev => ({ ...prev, isOpen: false })); 
                } });
            } else if (squareSubType === 'recovery') {
                if (squareStyle === 'RANDOM') {
                    setRecoveryModalState({
                        isOpen: true,
                        title: 'ランダムコンディション回復',
                        message: 'ゲーム内で指定された回復スタイルを選択し、回復可能な人数を入力してください。',
                        onConfirm: (styleKey, capacity) => {
                            if (styleKey && !isNaN(capacity) && capacity > 0) {
                                const fullStyleName = styleKey === 'R' ? 'RUSH' : styleKey === 'C' ? 'COUNTER' : 'BURST';
                                handleConditionRecovery(fullStyleName, capacity, square.floor.floor);
                            }
                            setRecoveryModalState({ isOpen: false });
                        }
                    });
                } else {
                    setModalState({
                        isOpen: true,
                        title: 'コンディション回復',
                        message: '回復可能な人数を入力してください。',
                        onConfirm: (capacity) => {
                            if (!isNaN(capacity) && capacity > 0) {
                                handleConditionRecovery(square.square.style, capacity, square.floor.floor);
                            }
                            setModalState(prev => ({ ...prev, isOpen: false }));
                        }
                    });
                }
            }
        }
    };

    const handleConditionRecovery = (style, capacity, floor) => {
        const recoveryAmount = floor <= 20 ? -1 : -2;
        const targetStyleKey = style.slice(0, 1);

        const fatiguedMegido = Object.keys(megidoConditions)
            .map(id => {
                const m = COMPLETE_MEGIDO_LIST.find(x => String(x.id) === String(id));
                const cond = megidoConditions[id];
                if (m && cond !== '絶好調' && ownedMegidoIds.has(id)) {
                    const megidoStyle = m.style ?? m.スタイル;
                    if (megidoStyle) {
                        const styleKey = megidoStyle.includes('ラッシュ') ? 'R' : megidoStyle.includes('カウンター') ? 'C' : 'B';
                        if (styleKey === targetStyleKey) {
                            return { id, name: m.名前, condition: cond, style: styleKey };
                        }
                    }
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => CONDITION_ORDER.indexOf(b.condition) - CONDITION_ORDER.indexOf(a.condition));

        if (fatiguedMegido.length <= capacity) {
            const idsToRecover = fatiguedMegido.map(m => m.id);
            updateMegidoConditions(idsToRecover, recoveryAmount);
            showToastMessage(`${style}の疲労メギド${idsToRecover.length}体を回復しました。`);
        } else {
            let remainingCapacity = capacity;
            const recoveredIds = new Set();
            const conditionGroups = CONDITION_LEVELS.slice(1).reverse();

            for (const cond of conditionGroups) {
                if (remainingCapacity <= 0) break;
                const group = fatiguedMegido.filter(m => m.condition === cond);
                if (group.length > 0 && group.length <= remainingCapacity) {
                    const idsInGroup = group.map(m => m.id);
                    updateMegidoConditions(idsInGroup, recoveryAmount);
                    idsInGroup.forEach(id => recoveredIds.add(id));
                    remainingCapacity -= group.length;
                } else if (group.length > 0 && group.length > remainingCapacity) {
                    setManualRecovery({ style: targetStyleKey, points: remainingCapacity, recoveryAmount: recoveryAmount });
                    showToastMessage(`${recoveredIds.size}体を自動回復しました。残り${remainingCapacity}人分は手動で選択してください。`);
                    return;
                }
            }
            if (recoveredIds.size > 0) {
                showToastMessage(`${recoveredIds.size}体を自動回復しました。`);
            }
        }
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

    const RightPanelContent = () => {
        // NOTE: The 'connections' variable used in the original code was not defined.
        // The logic using it has been temporarily commented out to prevent errors.
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
                />
            ) : (
                <div className="tab-content" style={{marginTop: '1rem'}}>
                    {activeTab === 'details' && !selectedSquare && (
                        <div className="placeholder" style={{height: '100%'}}>マスを選択してください</div>
                    )}
                    {activeTab === 'details' && selectedSquare && (() => {
                        const floorNum = selectedSquare.floor.floor;
                        const clearedSquaresOnFloor = runState.cleared[floorNum] || [];
                        const isCleared = clearedSquaresOnFloor.includes(selectedSquare.id);
                        const isPastFloor = floorNum < runState.highestFloorReached;
                        
                        let isResolvable = false;
                        if (mode === 'practice' && !isCleared) {
                            const neighbors = typeof connections !== 'undefined' ? Object.keys(connections).reduce((acc, key) => {
                                if (connections[key].includes(selectedSquare.id)) acc.push(key);
                                if (key === selectedSquare.id) acc.push(...connections[key]);
                                return acc;
                            }, []) : [];
                            isResolvable = neighbors.some(neighborId => clearedSquaresOnFloor.includes(neighborId));
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
                            />;
                        }
                    })()}
                    {activeTab === 'ownership' && (
                        <OwnershipManager 
                            megidoDetails={megidoDetails} 
                            onDetailChange={handleMegidoDetailChangeWrapper}
                            onCheckDistributed={handleCheckDistributedMegido}
                        />
                    )}
                    {activeTab === 'formation' && (
                        editingFormation ? (
                            <FormationEditor
                                formation={editingFormation}
                                onSave={handleSaveFormation}
                                onCancel={() => setEditingFormation(null)}
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
                            />
                        )
                    )}
                </div>
            )}
        </>);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="app-container">
            {eventToast && (
                <div style={eventModalOverlayStyle} onClick={() => {
                    if (dontShowAgain) {
                        localStorage.setItem(eventToast.storageKey, 'true');
                    }
                    setEventToast(null);
                    setDontShowAgain(false); // Reset for next time

                    // Show beta modal after closing event toast
                    const betaModalShown = localStorage.getItem('betaModalShown');
                    if (!betaModalShown) {
                        const today = new Date();
                        const betaStartDate = new Date('2025-09-09');
                        const betaEndDate = new Date('2025-09-17');
                        today.setHours(0, 0, 0, 0);
                        if (today >= betaStartDate && today < betaEndDate) {
                            unlockAchievement('BETA_TESTER');
                            setShowBetaModal(true);
                        }
                    }
                }}>
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
                    {`この度は「星間の塔攻略支援ツール」オープンβにご参加いただき、本当にありがとうございます！！

今回お試しいただいているのは、まだ全然完成していない“プロトタイプ版”です。
「とりあえず動いてるな～」くらいの段階なので、荒削りな部分や足りない機能が多い点はご容赦ください。

そのうえで、実際に触っていただく中で、
「不具合を見つけた」「ここが使いにくい」「もっとこうしてほしい」
といったご意見がありましたら、ぜひ気軽にお知らせください。

報告はGoogleフォーム（設定 → ベータテスト用報告フォーム）から、何度でもご記入いただけます。
小さな感想や気づきでも大歓迎です！

皆さまからの声が、このツールをより良く育てていく力になります。
どうぞよろしくお願いいたします！

それでは、良き戦争を！！！`}
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
                onOpenSettings={handleOpenSettings}
                isMobileView={isMobileView}
                runState={runState}
                seasonLogs={seasonLogs}
                selectedLog={selectedLog}
                onSelectLog={handleSelectLog}
            />
            <div className="main-content" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                {isMobileView ? (
                    <div className="mobile-view-container">
                        {mode === 'log' && activeTab === 'summary' ? (
                            <LogSummary selectedLog={selectedLog} />
                        ) : activeTab === 'details' ? (
                            <div className="left-panel" style={{ width: '100%' }}>
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
                            </div>
                        ) : activeTab === 'ownership' ? (
                            <OwnershipManager megidoDetails={megidoDetails} onDetailChange={handleMegidoDetailChangeWrapper} onCheckDistributed={handleCheckDistributedMegido} />
                        ) : activeTab === 'formation' ? (
                            editingFormation ? (
                                <FormationEditor
                                    formation={editingFormation}
                                    onSave={handleSaveFormation}
                                    onCancel={() => setEditingFormation(null)}
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
                                />
                            )
                        ) : null}
                    </div>
                ) : (
                    <>
                        <div className="left-panel" style={{ flex: '0 0 40%', overflowY: 'auto', height: 'calc(100vh - 150px)' }}>
                            {mode === 'plan' ? 
                                <PlanModeDashboard planConditions={planConditions} planState={planState} /> :
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
                                />
                            }
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
                        </div>
                        <div className={`right-panel ${isRouteObvious ? 'desaturate-panel' : ''}`} style={{ flex: '1' }}>
                            <RightPanelContent />
                        </div>
                    </>
                )}
            </div>
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
                            <img src="asset/achievement.png" alt="Achievement Icon" />
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
            {isMobileView && selectedSquare && (
                <div className="mobile-panel-overlay" onClick={() => onCancel()}>
                    <div className="mobile-panel-content" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-close-modal" onClick={() => onCancel()}>&times;</button>
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
                    />
                </div>
            )}
        </div>
    );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<TowerTool />);