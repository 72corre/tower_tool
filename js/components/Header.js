

const Header = ({ mode, onModeChange, targetFloor, onTargetFloorChange, title, activeTab, onTabClick, selectedSquare, onSaveLog, onResetRun, onOpenSettings, isMobileView }) => {
    const [isModeMenuOpen, setIsModeMenuOpen] = React.useState(false);
    const [isFloorMenuOpen, setIsFloorMenuOpen] = React.useState(false);

    const modeMenuItems = [
        { key: 'plan', title: '計画', description: 'どの様に登るのかを計画するモードです', icon: 'asset/plan.png' },
        { key: 'practice', title: '実践', description: '実際に登りながら利用するモードです', icon: 'asset/practice.png' },
        { key: 'log', title: 'ログ', description: '過去の記録を閲覧するモードです', icon: 'asset/log.png' }
    ];

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

    const currentModeInfo = modeMenuItems.find(item => item.key === mode) || modeMenuItems[0];
    const currentFloorInfo = floorMenuItems.find(item => item.key === targetFloor) || { key: targetFloor, title: `${targetFloor}F` };

    return (
        <React.Fragment>
            <header className="main-header">
                {/* Left Aligned Group */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button onClick={onOpenSettings} className="btn-icon" title="設定">
                        <img src="asset/settings.png" alt="設定" style={{width: '24px', height: '24px'}} />
                    </button>
                    <h1>{title}</h1>

                    {/* Mode Selector */}
                    <div className="mode-selector-wrapper">
                        <div 
                            className={`mode-selector ${isModeMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsModeMenuOpen(true)}
                        >
                            <img src={currentModeInfo.icon} alt="" className="mode-selector-icon" />
                            <span className="mode-selector-name">{currentModeInfo.title}</span>
                            <span className="mode-selector-arrow">∨</span>
                        </div>
                        
                        {isModeMenuOpen && (
                            <div className="mega-menu-container">
                                <div className="mega-menu-overlay" onClick={() => setIsModeMenuOpen(false)}></div>
                                <MegaMenu 
                                    onClose={() => setIsModeMenuOpen(false)}
                                    onSelect={onModeChange}
                                    currentKey={mode}
                                    menuItems={modeMenuItems}
                                />
                            </div>
                        )}
                    </div>

                    {/* Floor Selector */}
                    <div className="mode-selector-wrapper">
                         <div 
                            className={`mode-selector ${isFloorMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsFloorMenuOpen(true)}
                        >
                            {currentFloorInfo.icon && <img src={currentFloorInfo.icon} alt="" className="mode-selector-icon" />}
                            <span className="mode-selector-name">目標: {currentFloorInfo.title}</span>
                            <span className="mode-selector-arrow">∨</span>
                        </div>

                        {isFloorMenuOpen && (
                             <div className="mega-menu-container">
                                <div className="mega-menu-overlay" onClick={() => setIsFloorMenuOpen(false)}></div>
                                <MegaMenu 
                                    onClose={() => setIsFloorMenuOpen(false)}
                                    onSelect={onTargetFloorChange}
                                    currentKey={targetFloor}
                                    menuItems={floorMenuItems}
                                    layout="columns"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Aligned Group */}
                <div className="tabs" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {mode === 'practice' && (
                        <>
                            <button onClick={onSaveLog} className="btn btn-ghost record">記録</button>
                            <button onClick={() => onResetRun(false)} className="btn btn-ghost retire">リタイア</button>
                        </>
                    )}
                    <button onClick={() => onTabClick('details')} className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}>{isMobileView && activeTab !== 'details' ? '◀ マップ' : 'マス詳細'}</button>
                    <button onClick={() => onTabClick('ownership')} className={`tab-button ${activeTab === 'ownership' ? 'active' : ''}`}>所持メギド管理</button>
                    <button onClick={() => onTabClick('formation')} className={`tab-button ${activeTab === 'formation' ? 'active' : ''}`}>編成管理</button>
                </div>
            </header>
        </React.Fragment>
    );
};

