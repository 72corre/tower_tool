const { useState, useEffect, useMemo, useRef, useCallback } = React;

const modeDescriptions = [
    { key: 'plan', title: '計画', description: 'どの様に登るのかを計画するモードです', icon: 'asset/plan.webp' },
    { key: 'practice', title: '実践', description: '実際に登りながら利用するモードです', icon: 'asset/practice.webp' },
    { key: 'log', title: 'ログ', description: '過去の記録を閲覧するモードです', icon: 'asset/log.webp' }
];

const modeMenuItems = modeDescriptions;

const floorMenuItems = [
    { key: 1, title: '1F', description: 'まずはこれがオススメ。Ωアバドンを倒しに行きます' },
    { key: 5, title: '5F', description: '１階まで登れたら、次はこれ。ディジィースプーを倒しに行きます' },
    { key: 10, title: '10F', description: 'ここからコンディション管理が大変に。ソウルクリエイトを倒しに行きます' },
    { key: 15, title: '15F', description: 'かなり慣れた人向け。デメタスを倒しに行きます。' },
    { key: 20, title: '20F', description: '魔喰機・無限を倒しに行きます' },
    { key: 25, title: '25F', description: 'グリードベアを倒しに行きます。' },
    { key: 30, title: '30F', description: 'グジグランズを倒しに行きます' },
    { key: 31, title: '31F', description: '最難関です。あともう一息！' },
    { key: 35, title: '35F', description: 'これであなたも星間の塔マスター！契りのドゥーエを倒しに行きます' },
];

const ModeSelectionModal = ({ isOpen, onClose, onSelect, currentKey, menuItems }) => {
    if (!isOpen) return null;

    return (
        <div className="mobile-modal-overlay" onClick={onClose}>
            <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()} style={{display: 'flex', flexDirection: 'column', maxHeight: '85vh', padding: 0, width: 'min(500px, 90vw)'}}>
                <div style={{ flexShrink: 0, padding: '1rem 1rem 0 1rem' }}>
                    <h3 style={{marginTop: 0, textAlign: 'center'}}>モードを選択</h3>
                </div>
                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {menuItems.map(item => (
                            <button
                                key={item.key}
                                className={`modal-item-btn ${currentKey === item.key ? 'selected' : ''}`}
                                onClick={() => {
                                    onSelect(item.key);
                                    onClose();
                                }}
                                style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', padding: '12px' }}
                            >
                                <img src={item.icon} alt="" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <strong style={{fontSize: '1.1rem'}}>{item.title}</strong>
                                    <span style={{fontSize: '0.8rem', color: 'var(--text-subtle)'}}>{item.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const DesktopHeader = () => {
    const { mode, handleModeChange: onModeChange, targetFloor, handleTargetFloorChange: onTargetFloorChange, handleOpenSettings: onOpenSettings, currentUser, handleSignIn: onSignIn, handleSignOut: onSignOut, handleOpenMapSearch: onOpenMapSearch, isGuideMode } = useAppContext();
    const [isModeModalOpen, setIsModeModalOpen] = React.useState(false);
    const [isFloorModalOpen, setIsFloorModalOpen] = React.useState(false);

    const processedFloorMenuItems = useMemo(() => {
        return floorMenuItems.map(item => {
            if (item.key <= 20) {
                return { ...item, title: `${item.title}（ガイド付き）` };
            }
            return item;
        });
    }, []);

    const currentModeInfo = modeMenuItems.find(item => item.key === mode) || modeMenuItems[0];
    const currentFloorInfo = processedFloorMenuItems.find(item => item.key === targetFloor) || { key: targetFloor, title: `${targetFloor}F` };

    const FloorSelectionModal = ({ isOpen, onClose, onSelect, currentKey, menuItems }) => {
        if (!isOpen) return null;
        return (
            <div className="mobile-modal-overlay" onClick={onClose}>
                <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()} style={{display: 'flex', flexDirection: 'column', maxHeight: '85vh', padding: 0, width: 'min(500px, 90vw)'}}>
                    <div style={{ flexShrink: 0, padding: '1rem 1rem 0 1rem' }}>
                        <h3 style={{marginTop: 0, textAlign: 'center'}}>目標階層を選択</h3>
                    </div>
                    <div className="floor-selection-list" style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
                        {menuItems.map(item => (
                            <button
                                key={item.key}
                                className={`modal-item-btn ${currentKey === item.key ? 'selected' : ''}`}
                                onClick={() => {
                                    onSelect(item.key);
                                    onClose();
                                }}
                            >
                                <strong style={{fontSize: '1.1rem'}}>{item.title}</strong>
                                <span style={{fontSize: '0.8rem', color: 'var(--text-subtle)'}}>{item.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <header className="main-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onOpenSettings} className="btn-icon" title="設定">
                        <img src="asset/settings.webp" alt="設定" style={{width: '28px', height: '28px'}} />
                    </button>
                </div>
                
                <h1>星間の塔 攻略支援ツール</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!isGuideMode && (
                        <button className="btn btn-ghost" onClick={() => setIsModeModalOpen(true)}>
                            モード: {currentModeInfo.title}
                        </button>
                    )}
                    <button className="btn btn-ghost" onClick={() => setIsFloorModalOpen(true)}>
                        目標: {currentFloorInfo.title}
                    </button>
                    <button id="map-search-button" className="btn-icon" title="マス検索" onClick={onOpenMapSearch}>
                        <img src="asset/map_search.png" alt="マス検索" style={{width: '24px', height: '24px'}} />
                    </button>
                    
                    {currentUser ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '99px' }}>
                            <img src={currentUser.photoURL} alt={currentUser.displayName} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '12px', fontWeight: 500, marginRight: '8px' }}>{currentUser.displayName}</span>
                            <button onClick={onSignOut} className="btn btn-secondary btn-small">ログアウト</button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                             <button onClick={() => onSignIn('google')} className="btn btn-secondary btn-small">Googleログイン</button>
                             <button onClick={() => onSignIn('twitter')} className="btn btn-secondary btn-small">Twitterログイン</button>
                        </div>
                    )}

                    <ModeSelectionModal
                        isOpen={isModeModalOpen}
                        onClose={() => setIsModeModalOpen(false)}
                        onSelect={onModeChange}
                        currentKey={mode}
                        menuItems={modeMenuItems}
                    />
                    <FloorSelectionModal
                        isOpen={isFloorModalOpen}
                        onClose={() => setIsFloorModalOpen(false)}
                        onSelect={onTargetFloorChange}
                        currentKey={targetFloor}
                        menuItems={processedFloorMenuItems}
                    />
                </div>
            </div>
        </header>
    );
};

const MobileHeader = () => {
    const { mode, handleModeChange: onModeChange, targetFloor, handleTargetFloorChange: onTargetFloorChange, activeTab, handleTabClick, onSaveLog, onResetRun, onUndo, handleOpenSettings: onOpenSettings, runState, seasonLogs, selectedLog, onSelectLog, currentUser, handleSignIn: onSignIn, handleSignOut: onSignOut, handleOpenMapSearch: onOpenMapSearch, isGuideMode } = useAppContext();
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
    const [isModeModalOpen, setIsModeModalOpen] = useState(false);
    const [isLogSelectionOpen, setIsLogSelectionOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const processedFloorMenuItems = useMemo(() => {
        return floorMenuItems.map(item => {
            if (item.key <= 20) {
                return { ...item, title: `${item.title}（ガイド付き）` };
            }
            return item;
        });
    }, []);

    const currentModeInfo = modeMenuItems.find(item => item.key === mode) || modeMenuItems[0];

    const getTitle = () => {
        if (mode === 'log') {
            return selectedLog ? selectedLog.name : 'ログを選択';
        }
        switch (activeTab) {
            case 'details':
                const currentFloor = runState?.currentPosition?.floor || '-';
                return (
                    <>
                        <span>{currentFloor}F / </span>
                        <button className="header-target-floor-btn" onClick={() => setIsFloorModalOpen(true)}>
                            目標:{targetFloor}F
                        </button>
                    </>
                );
            case 'ownership':
                return '所持メギド管理';
            case 'formation':
                return '編成管理';
            case 'summary':
                return 'シーズンサマリー';
            case 'all_summary':
                return '通算サマリー';
            default:
                return '星間の塔 攻略支援ツール';
        }
    };
    
    const handleTitleClick = () => {
        if (mode === 'log') {
            setIsLogSelectionOpen(true);
        }
    };

    const AuthContent = () => {
        if (currentUser) {
            return (
                <div style={{textAlign: 'center'}}>
                    <img src={currentUser.photoURL} alt={currentUser.displayName} style={{width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1rem'}} />
                    <p>{currentUser.displayName}としてログイン中</p>
                    <button onClick={() => { onSignOut(); setIsAuthModalOpen(false); }} className="btn btn-danger">ログアウト</button>
                </div>
            );
        } else {
            return (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    <button onClick={() => { onSignIn('google'); setIsAuthModalOpen(false); }} className="btn btn-secondary">Googleでログイン</button>
                    <button onClick={() => { onSignIn('twitter'); setIsAuthModalOpen(false); }} className="btn btn-secondary">Twitterでログイン</button>
                </div>
            );
        }
    };

    return (
        <div className="mobile-header-container">
            <div className="mobile-header-top-bar">
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onOpenSettings} className="btn-icon" title="設定">
                        <img src="asset/settings.webp" alt="設定" style={{width: '24px', height: '24px'}} />
                    </button>
                    {!isGuideMode && (
                        <div className="mode-selector-wrapper">
                            <button className="btn-icon" onClick={() => setIsModeModalOpen(true)} title={currentModeInfo.title}>
                                <img src="asset/plan.webp" alt="" style={{width: '24px', height: '24px'}} />
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ flex: '0 1 auto', textAlign: 'center' }}>
                    <h1 
                        className="mobile-header-title"
                        onClick={handleTitleClick}
                        style={mode === 'log' ? { cursor: 'pointer', textDecoration: 'underline' } : {}}
                    >
                        {getTitle()}
                    </h1>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                    <button id="map-search-button-mobile" className="btn-icon" title="マス検索" onClick={onOpenMapSearch}>
                        <img src="asset/map_search.png" alt="マス検索" style={{width: '24px', height: '24px'}} />
                    </button>
                    {currentUser ? (
                        <button onClick={() => setIsAuthModalOpen(true)} className="btn-icon">
                            <img src={currentUser.photoURL} alt="ユーザー情報" style={{width: '28px', height: '28px', borderRadius: '50%'}} />
                        </button>
                    ) : (
                        <button onClick={() => setIsAuthModalOpen(true)} className="btn-icon" title="ログイン">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px'}}><path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.9 8.181.75.75 0 1 1-1.499.044 7.5 7.5 0 0 0-14.993 0 .75.75 0 0 1-1.5-.045 9.005 9.005 0 0 1 5.9-8.181A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" /></svg>
                        </button>
                    )}
                    {activeTab === 'details' && mode === 'practice' && (
                        <>
                            <button onClick={() => setIsActionsMenuOpen(true)} className="btn-icon">︙</button>
                            {isActionsMenuOpen && (
                                <div className="mobile-actions-menu-overlay" onClick={() => setIsActionsMenuOpen(false)}></div>
                            )}
                            {isActionsMenuOpen && (
                                <div className="mobile-actions-menu">
                                    <button onClick={() => { onSaveLog(); setIsActionsMenuOpen(false); }} className="mobile-actions-menu-item">挑戦ログを保存</button>
                                    <button onClick={() => { onUndo(); setIsActionsMenuOpen(false); }} className="mobile-actions-menu-item">アンドゥ</button>
                                    <button onClick={() => { onResetRun(false); setIsActionsMenuOpen(false); }} className="mobile-actions-menu-item danger">挑戦をリタイア</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="mobile-header-tabs">
                 {mode !== 'log' ? (
                    <>
                        <button onClick={() => handleTabClick('details')} className={`mobile-tab-button ${activeTab === 'details' ? 'active' : ''}`}>
                            <span>マップ</span>
                        </button>
                                                <button id="mobile-ownership-tab-button" onClick={() => handleTabClick('ownership')} className={`mobile-tab-button ${activeTab === 'ownership' ? 'active' : ''}`}>
                            <span>所持メギド</span>
                        </button>
                        <button id="mobile-formation-tab-button" onClick={() => handleTabClick('formation')} className={`mobile-tab-button ${activeTab === 'formation' ? 'active' : ''}`}>
                            <span>編成</span>
                        </button>                    </>
                 ) : (
                    <>
                        <button onClick={() => handleTabClick('details')} className={`mobile-tab-button ${activeTab === 'details' ? 'active' : ''}`}>
                            <span>マップ</span>
                        </button>
                        <button onClick={() => handleTabClick('summary')} disabled={!selectedLog} className={`mobile-tab-button ${activeTab === 'summary' ? 'active' : ''}`}>
                            <span>シーズンサマリー</span>
                        </button>
                        <button onClick={() => handleTabClick('all_summary')} className={`mobile-tab-button ${activeTab === 'all_summary' ? 'active' : ''}`}>
                            <span>通算サマリー</span>
                        </button>
                    </>
                 )}
            </div>

            <ModeSelectionModal
                isOpen={isModeModalOpen}
                onClose={() => setIsModeModalOpen(false)}
                onSelect={onModeChange}
                currentKey={mode}
                menuItems={modeMenuItems}
            />

            {isAuthModalOpen && (
                <div className="mobile-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
                    <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
                        <AuthContent />
                    </div>
                </div>
            )}

            {isLogSelectionOpen && (
                 <div className="mobile-modal-overlay" onClick={() => setIsLogSelectionOpen(false)}>
                    <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()} style={{display: 'flex', flexDirection: 'column', maxHeight: '85vh', padding: 0}}>
                        <div style={{ flexShrink: 0, padding: '1rem 1rem 0 1rem' }}>
                            <h3 style={{marginTop: 0, textAlign: 'center'}}>ログを選択</h3>
                        </div>
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {seasonLogs.map(log => (
                                    <button
                                        key={log.name}
                                        className={`modal-item-btn ${selectedLog?.name === log.name ? 'selected' : ''}`}
                                        onClick={() => {
                                            onSelectLog(log);
                                            setIsLogSelectionOpen(false);
                                        }}
                                        style={{ flex: '1 1 auto' }}
                                    >
                                        {log.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ flexShrink: 0, padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border-color-light)' }}>
                        </div>
                    </div>
                </div>
            )}

            {isFloorModalOpen && (
                <div className="mobile-modal-overlay" onClick={() => setIsFloorModalOpen(false)}>
                    <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()} style={{display: 'flex', flexDirection: 'column', maxHeight: '85vh', padding: 0}}>
                        <div style={{ flexShrink: 0, padding: '1rem 1rem 0 1rem' }}>
                            <h3 style={{marginTop: 0, textAlign: 'center'}}>目標階層を選択</h3>
                        </div>
                        <div className="floor-selection-list" style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem' }}>
                            {processedFloorMenuItems.map(item => (
                                <button
                                    key={item.key}
                                    className={`modal-item-btn ${targetFloor === item.key ? 'selected' : ''}`}
                                    onClick={() => {
                                        onTargetFloorChange(item.key);
                                        setIsFloorModalOpen(false);
                                    }}
                                >
                                    <strong style={{fontSize: '1.1rem'}}>{item.title}</strong>
                                    <span style={{fontSize: '0.8rem', color: 'var(--text-subtle)'}}>{item.description}</span>
                                </button>
                            ))}
                        </div>
                        <div style={{ flexShrink: 0, padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--border-color-light)' }}>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Header = () => {
    const { isMobileView } = useAppContext();
    if (isMobileView) {
        return <MobileHeader />;
    }
    return <DesktopHeader />;
};