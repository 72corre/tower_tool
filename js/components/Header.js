const { useState, useEffect, useMemo, useRef, useCallback } = React;

const floorMenuItems = [
    { key: 1, title: '1F', icon: 'asset/1F.png', description: 'まずはこれがオススメ。Ωアバドンを倒しに行きます' },
    { key: 5, title: '5F', icon: 'asset/5F.png', description: '１階まで登れたら、次はこれ。ディジィースプーを倒しに行きます' },
    { key: 10, title: '10F', icon: 'asset/10F.png', description: 'ここからコンディション管理が大変に。ソウルクリエイトを倒しに行きます' },
    { key: 15, title: '15F', icon: 'asset/15F.png', description: 'かなり慣れた人向け。デメタスを倒しに行きます。' },
    { key: 20, title: '20F', icon: 'asset/20F.png', description: '魔喰機・無限を倒しに行きます' },
    { key: 25, title: '25F', icon: 'asset/25F.png', description: 'グリードベアを倒しに行きます。' },
    { key: 30, title: '30F', icon: 'asset/30F.png', description: 'グジグランズを倒しに行きます' },
    { key: 31, title: '31F', icon: 'asset/31F.png', description: '最難関です。あともう一息！' },
    { key: 35, title: '35F', icon: 'asset/35F.png', description: 'これであなたも星間の塔マスター！契りのドゥーエを倒しに行きます' },
];

const modeMenuItems = [
    { key: 'plan', title: '計画', description: 'どの様に登るのかを計画するモードです', icon: 'asset/plan.png' },
    { key: 'practice', title: '実践', description: '実際に登りながら利用するモードです', icon: 'asset/practice.png' },
    { key: 'log', title: 'ログ', description: '過去の記録を閲覧するモードです', icon: 'asset/log.png' }
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

const DesktopHeader = ({ mode, onModeChange, targetFloor, onTargetFloorChange, title, activeTab, onTabClick, onSaveLog, onResetRun, onUndo, onOpenSettings }) => {
    const [isModeModalOpen, setIsModeModalOpen] = React.useState(false);
    const [isFloorMenuOpen, setIsFloorMenuOpen] = React.useState(false);

    const currentModeInfo = modeMenuItems.find(item => item.key === mode) || modeMenuItems[0];
    const currentFloorInfo = floorMenuItems.find(item => item.key === targetFloor) || { key: targetFloor, title: `${targetFloor}F` };

    return (
        <header className="main-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={onOpenSettings} className="btn-icon" title="設定">
                        <img src="asset/settings.png" alt="設定" style={{width: '28px', height: '28px'}} />
                    </button>
                    <div className="mode-selector-wrapper">
                        <button className="btn-icon" onClick={() => setIsModeModalOpen(true)} title={currentModeInfo.title}>
                            <img src={currentModeInfo.icon} alt="" style={{width: '28px', height: '28px'}} />
                        </button>
                        <ModeSelectionModal
                            isOpen={isModeModalOpen}
                            onClose={() => setIsModeModalOpen(false)}
                            onSelect={onModeChange}
                            currentKey={mode}
                            menuItems={modeMenuItems}
                        />
                    </div>
                </div>
                
                <h1>{title}</h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="mode-selector-wrapper">
                         <div className={`mode-selector ${isFloorMenuOpen ? 'open' : ''}`} onClick={() => setIsFloorMenuOpen(true)}>
                            {currentFloorInfo.icon && <img src={currentFloorInfo.icon} alt="" className="mode-selector-icon" />}
                            <span className="mode-selector-name">目標: {currentFloorInfo.title}</span>
                            <span className="mode-selector-arrow">∨</span>
                        </div>
                        {isFloorMenuOpen && (
                             <div className="mega-menu-container">
                                <div className="mega-menu-overlay" onClick={() => setIsFloorMenuOpen(false)}></div>
                                <MegaMenu onClose={() => setIsFloorMenuOpen(false)} onSelect={onTargetFloorChange} currentKey={targetFloor} menuItems={floorMenuItems} layout="columns" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'absolute', bottom: '16px', right: '24px' }}>
                {mode === 'practice' && (
                    <>
                        <button onClick={onSaveLog} className="btn btn-ghost record">記録</button>
                        <button onClick={onUndo} className="btn btn-ghost undo">アンドゥ</button>
                        <button onClick={() => onResetRun(false)} className="btn btn-ghost retire">リタイア</button>
                    </>
                )}
                <button onClick={() => onTabClick('details')} className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}>マス詳細</button>
                <button onClick={() => onTabClick('ownership')} className={`tab-button ${activeTab === 'ownership' ? 'active' : ''}`}>所持メギド管理</button>
                <button onClick={() => onTabClick('formation')} className={`tab-button ${activeTab === 'formation' ? 'active' : ''}`}>編成管理</button>
            </div>
        </header>
    );
};

const MobileHeader = ({ mode, onModeChange, targetFloor, onTargetFloorChange, activeTab, onTabClick, onSaveLog, onResetRun, onUndo, onOpenSettings, runState, seasonLogs, selectedLog, onSelectLog }) => {
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
    const [isModeModalOpen, setIsModeModalOpen] = useState(false);
    const [isLogSelectionOpen, setIsLogSelectionOpen] = useState(false);

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

    return (
        <div className="mobile-header-container">
            <div className="mobile-header-top-bar">
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onOpenSettings} className="btn-icon" title="設定">
                        <img src="asset/settings.png" alt="設定" style={{width: '24px', height: '24px'}} />
                    </button>
                    <div className="mode-selector-wrapper">
                        <button className="btn-icon" onClick={() => setIsModeModalOpen(true)} title={currentModeInfo.title}>
                            <img src={currentModeInfo.icon} alt="" style={{width: '24px', height: '24px'}} />
                        </button>
                    </div>
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

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <div className="mobile-header-actions">
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
            </div>
            <div className="mobile-header-tabs">
                 {mode !== 'log' ? (
                    <>
                        <button onClick={() => onTabClick('details')} className={`mobile-tab-button ${activeTab === 'details' ? 'active' : ''}`}>
                            <span>マップ</span>
                        </button>
                        <button onClick={() => onTabClick('ownership')} className={`mobile-tab-button ${activeTab === 'ownership' ? 'active' : ''}`}>
                            <span>所持メギド</span>
                        </button>
                        <button onClick={() => onTabClick('formation')} className={`mobile-tab-button ${activeTab === 'formation' ? 'active' : ''}`}>
                            <span>編成</span>
                        </button>
                    </>
                 ) : (
                    <>
                        <button onClick={() => onTabClick('details')} className={`mobile-tab-button ${activeTab === 'details' ? 'active' : ''}`}>
                            <span>マップ</span>
                        </button>
                        <button onClick={() => onTabClick('summary')} disabled={!selectedLog} className={`mobile-tab-button ${activeTab === 'summary' ? 'active' : ''}`}>
                            <span>シーズンサマリー</span>
                        </button>
                        <button onClick={() => onTabClick('all_summary')} className={`mobile-tab-button ${activeTab === 'all_summary' ? 'active' : ''}`}>
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
                            {floorMenuItems.map(item => (
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

const Header = (props) => {
    if (props.isMobileView) {
        return <MobileHeader {...props} />;
    }
    return <DesktopHeader {...props} />;
};