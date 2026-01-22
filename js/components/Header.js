const { useState, useEffect, useMemo, useRef, useCallback } = React;

const floorMenuItems = [
    { key: 1, title: '1F', description: 'まずはこれがオススメ。Ωアバドンを倒しに行きます' },
    { key: 5, title: '5F', description: '１階まで登れたら、次はこれ。ディジィースプーを倒しに行きます' },
    { key: 10, title: '10F', description: 'ここからコンディション管理が大変に。ソウルクリエイトを倒しに行きます' },
    { key: 15, title: '15F', description: 'かなり慣れた人向け。デメタスを倒しに行きます。' },
    { key: 20, title: '20F', description: '魔喰機・無限を倒しに行きます' },
    { key: 25, title: '25F', description: 'グリードベアを倒しに行きます。' },
    { key: 30, title: '30F', description: '30F' },
    { key: 31, title: '31F', description: '最難関です。あともう一息！' },
    { key: 35, title: '35F', description: 'これであなたも星間の塔マスター！契りのドゥーエを倒しに行きます' },
];

const HeaderButton = ({ onClick, icon, text, title, className = "", children }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center min-w-[44px] py-1 hover:bg-white/5 rounded-lg transition-colors ${className}`} title={title}>
        {icon && <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>}
        {children}
        <span className="text-[7px] text-primary/80 mt-0.5 font-bold">{text}</span>
    </button>
);

const AuthContent = ({ currentUser, onSignIn, onSignOut, setIsAuthModalOpen }) => {
    if (currentUser) {
        return (
            <div className="text-center">
                <img src={currentUser.photoURL} alt={currentUser.displayName} className="w-16 h-16 rounded-full mx-auto mb-4" />
                <p>{currentUser.displayName}としてログイン中</p>
                <button onClick={() => { onSignOut(); setIsAuthModalOpen(false); }} className="btn bg-red-600 text-white mt-4">ログアウト</button>
            </div>
        );
    } else {
        return (
            <div className="flex flex-col gap-4">
                <button onClick={() => { onSignIn('google'); setIsAuthModalOpen(false); }} className="btn bg-blue-600 text-white">Googleでログイン</button>
                <button onClick={() => { onSignIn('twitter'); setIsAuthModalOpen(false); }} className="btn bg-blue-400 text-white">Twitterでログイン</button>
            </div>
        );
    }
};

const FloorSelectionModal = ({ isOpen, onClose, onSelect, currentKey, menuItems }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" onClick={onClose}>
            <div className="bg-card-dark rounded-lg p-6 shadow-lg border border-primary/20 max-h-[85vh] overflow-y-auto w-11/12 md:w-1/2 lg:w-1/3" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-white text-center mb-4">目標階層を選択</h3>
                <div className="grid grid-cols-1 gap-3">
                    {menuItems.map(item => (
                        <button
                            key={item.key}
                            className={`p-3 rounded-md text-left transition-colors ${currentKey === item.key ? 'bg-primary text-background-dark font-bold' : 'bg-white/5 text-white hover:bg-white/10'}`}
                            onClick={() => {
                                onSelect(item.key);
                                onClose();
                            }}
                        >
                            <strong className="text-sm">{item.title}</strong>
                            <span className="block text-xs text-white/70">{item.description}</span>
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="btn bg-gray-700 text-white w-full mt-4">閉じる</button>
            </div>
        </div>
    );
};

const Header = () => {
    const { 
        targetFloor, handleTargetFloorChange: onTargetFloorChange, 
        handleOpenSettings: onOpenSettings, 
        currentUser, handleSignIn: onSignIn, handleSignOut: onSignOut, 
        handleOpenMapSearch: onOpenMapSearch, 
        runState, handleOpenRecoveryModal,
        activeTab, handleTabClick,
        handleSaveLog, handleUndo, handleResetRun
    } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const processedFloorMenuItems = useMemo(() => {
        return floorMenuItems.map(item => {
            if (item.key <= 20) {
                return { ...item, title: `${item.title}（ガイド付き）` };
            }
            return item;
        });
    }, []);

    const currentFloorInfo = processedFloorMenuItems.find(item => item.key === targetFloor) || { key: targetFloor, title: `${targetFloor}F` };

    const Tab = ({ value, icon, label }) => (
        <label className={`flex flex-col cursor-pointer h-full grow items-center justify-center rounded-md px-2 font-bold transition-all duration-200 ${activeTab === value ? 'bg-primary text-background-dark' : 'text-primary/70'}`}>
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            <span className="text-[9px]">{label}</span>
            <input checked={activeTab === value} onChange={() => handleTabClick(value)} className="hidden" name="nav" type="radio" value={value}/>
        </label>
    );

    return (
        <header className="bg-background-dark/95 ios-blur border-b border-white/10 z-20 shrink-0">
            <div className="flex items-center justify-between px-1 py-1">
                {/* Left Buttons */}
                <div className="flex items-center">
                    <HeaderButton onClick={onOpenSettings} icon="settings" text="設定" title="設定" />
                    <div className="relative" ref={menuRef}>
                        <HeaderButton onClick={() => setIsMenuOpen(prev => !prev)} icon="menu" text="メニュー" title="メニュー" />
                        {isMenuOpen && (
                            <div className="absolute left-0 mt-2 w-48 bg-card-dark rounded-lg shadow-lg py-1 z-50 border border-white/10">
                                <button onClick={() => { handleOpenRecoveryModal(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-white/10">緊急回復</button>
                                <div className="border-t border-white/10 my-1"></div>
                                <button onClick={() => { handleSaveLog(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-white/10">ログの保存</button>
                                <button onClick={() => { handleUndo(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-white hover:bg-white/10">アンドゥ</button>
                                <button onClick={() => { handleResetRun(false); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/50">挑戦をリタイア</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Central Floor Level Button */}
                <button onClick={() => setIsFloorModalOpen(true)} className="flex flex-col items-center justify-center px-3 py-1 bg-white/5 rounded-xl border border-white/5 active:scale-95 transition-all">
                    <span className="text-[6px] uppercase tracking-[0.2em] text-primary/60 font-bold">Floor Level</span>
                    <div className="flex items-center gap-1">
                        <h1 className="text-white text-[12px] font-bold tracking-tight text-glow leading-tight whitespace-nowrap">
                            {runState?.currentPosition?.floor || '-'}F / {currentFloorInfo.title}
                        </h1>
                        <span className="material-symbols-outlined text-primary text-xs">unfold_more</span>
                    </div>
                </button>

                {/* Right Buttons */}
                <div className="flex items-center">
                    <HeaderButton onClick={onOpenMapSearch} icon="search" text="検索" title="マス検索" />
                    {currentUser ? (
                        <HeaderButton onClick={() => setIsAuthModalOpen(true)} text="ユーザー" title="ユーザー情報">
                            <img src={currentUser.photoURL} alt="ユーザー情報" className="w-5 h-5 rounded-full" />
                        </HeaderButton>
                    ) : (
                        <HeaderButton onClick={() => setIsAuthModalOpen(true)} icon="account_circle" text="ログイン" title="ログイン" />
                    )}
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 pb-2 pt-1">
                <div className="flex h-12 items-center justify-center rounded-lg bg-card-dark/50 p-1 border border-white/5">
                    <Tab value="details" icon="explore" label="マップ" />
                    <Tab value="ownership" icon="person_check" label="メギド" />
                    <Tab value="formation" icon="groups" label="編成" />
                </div>
            </div>

            <FloorSelectionModal
                isOpen={isFloorModalOpen}
                onClose={() => setIsFloorModalOpen(false)}
                onSelect={onTargetFloorChange}
                currentKey={targetFloor}
                menuItems={processedFloorMenuItems}
            />
            {isAuthModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]" onClick={() => setIsAuthModalOpen(false)}>
                    <div className="bg-card-dark rounded-lg p-6 shadow-lg border border-primary/20 max-h-[85vh] overflow-y-auto w-11/12 md:w-1/2 lg:w-1/3" onClick={(e) => e.stopPropagation()}>
                        <AuthContent currentUser={currentUser} onSignIn={onSignIn} onSignOut={onSignOut} setIsAuthModalOpen={setIsAuthModalOpen} />
                        <button onClick={() => setIsAuthModalOpen(false)} className="btn bg-gray-700 text-white w-full mt-4">閉じる</button>
                    </div>
                </div>
            )}
        </header>
    );
};