const Settings = ({
    show,
    onClose,
    unlockedAchievements,
    achievementsData,
    onExportData,
    onImportData,
    onResetAllData,
    onToggleTheme,
    viewMode,
    onViewModeChange,
    isMobileView,
    isTabletView,
    onUnlockAchievement,
    onOpenProfileGenerator,
    onIncrementAboutPageOpen
}) => {
    const { useState, useEffect } = React;
    const [activeSettingsTab, setActiveSettingsTab] = useState('achievements');
    const [activeAchievementTab, setActiveAchievementTab] = useState('all');
    const [mailSubject, setMailSubject] = useState('不具合報告');

    useEffect(() => {
        if (activeSettingsTab === 'about') {
            onIncrementAboutPageOpen();
        }
    }, [activeSettingsTab]);

    if (!show) {
        return null;
    }

    const achievementCategories = { all: 'すべて', progress: '進行度', collection: '収集', battle: '戦闘', feature: '機能', secret: '秘密' };

    const achievementsArray = Object.values(achievementsData);
    const visibleAchievements = achievementsArray.filter(ach => {
        if (isMobileView && ach.type === 'private') {
            return false;
        }
        if (activeAchievementTab !== 'all' && ach.category !== activeAchievementTab) {
            if (ach.type === 'secret' && activeAchievementTab !== 'secret') return false;
            if (ach.type !== 'secret' && activeAchievementTab === 'secret') return false;
            if (activeAchievementTab !== 'all' && ach.category !== activeAchievementTab) return false;
        }
        return ach.type !== 'private' || unlockedAchievements.has(ach.id);
    });

    const totalAchievements = achievementsArray.length;
    const unlockedCount = unlockedAchievements.size;

    const isDesktopView = !isMobileView && !isTabletView;

    // --- Conditional Styles ---
    const settingsModalStyle = {
        width: 'min(1200px, 90vw)',
        height: '85vh',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column'
    };

    const settingsContentStyle = {
        display: 'flex',
        flexDirection: isMobileView ? 'column' : 'row',
        flexGrow: 1,
        overflow: 'hidden'
    };

    const sidebarStyle = {
        flexShrink: 0,
        display: 'flex',
        flexDirection: isMobileView ? 'row' : 'column',
        overflowX: isMobileView ? 'auto' : 'hidden',
        borderBottom: isMobileView ? '1px solid var(--border-color)' : 'none',
        borderRight: isMobileView ? 'none' : '1px solid var(--border-color)',
        padding: isMobileView ? '0' : '0 1rem 0 0',
        margin: isMobileView ? '0 0 0.5rem 0' : '0'
    };

    const mainContentStyle = {
        flexGrow: 1,
        overflowY: 'auto',
        padding: isDesktopView ? '0 1.5rem' : '0 1rem'
    };

    const tabButtonStyle = {
        whiteSpace: isMobileView ? 'nowrap' : 'normal',
        padding: isMobileView ? '0.6rem 0.8rem' : '0.5rem 1rem',
        fontSize: isMobileView ? '0.85rem' : '1rem'
    };

    const settingItemStyle = {
        flexDirection: isDesktopView ? 'row' : 'column',
        alignItems: isDesktopView ? 'center' : 'flex-start',
        gap: isDesktopView ? '1rem' : '0.5rem'
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="card settings-modal" style={settingsModalStyle} onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2 style={{ margin: 0, fontSize: isDesktopView ? '1.5rem' : '1.1rem' }}>設定</h2>
                    
                </div>
                <div style={settingsContentStyle}>
                    <div style={sidebarStyle}>
                        <button
                            style={tabButtonStyle}
                            className={`settings-tab-button ${activeSettingsTab === 'achievements' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('achievements')}
                        >
                            実績
                        </button>
                        <button
                            style={tabButtonStyle}
                            className={`settings-tab-button ${activeSettingsTab === 'data' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('data')}
                        >
                            データ管理
                        </button>
                        <button
                            style={tabButtonStyle}
                            className={`settings-tab-button ${activeSettingsTab === 'appearance' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('appearance')}
                        >
                            外観
                        </button>
                        <button
                            style={tabButtonStyle}
                            className={`settings-tab-button ${activeSettingsTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('about')}
                        >
                            このアプリについて
                        </button>
                        <button
                            style={tabButtonStyle}
                            className={`settings-tab-button ${activeSettingsTab === 'specialThanks' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('specialThanks')}
                        >
                            Special Thanks
                        </button>
                        <button
                            style={tabButtonStyle}
                            className={`settings-tab-button ${activeSettingsTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('profile')}
                        >
                            プロフィール
                        </button>
                    </div>
                    <div style={mainContentStyle}>
                        {activeSettingsTab === 'achievements' && (
                            <div>
                                <h3>実績 ({unlockedCount} / {totalAchievements})</h3>
                                <div className="achievement-tabs" style={{ display: 'flex', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                    {Object.entries(achievementCategories).map(([key, name]) => {
                                        const isActive = activeAchievementTab === key;
                                        const style = {
                                            padding: '0.5rem 1rem',
                                            border: 'none',
                                            background: isActive ? 'var(--bg-main)' : 'transparent',
                                            color: isActive ? 'var(--text-main)' : 'var(--text-subtle)',
                                            borderBottom: isActive ? '2px solid var(--primary-accent)' : '2px solid transparent',
                                            marginBottom: '-1px',
                                            cursor: 'pointer'
                                        };
                                        return (
                                            <button 
                                                key={key} 
                                                style={style}
                                                onClick={() => setActiveAchievementTab(key)}
                                            >
                                                {name}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="achievement-list">
                                    {visibleAchievements.map(ach => {
                                        const isUnlocked = unlockedAchievements.has(ach.id);
                                        if (ach.type === 'secret' && !isUnlocked) {
                                            return (
                                                <div key={ach.id} className="achievement-item secret">
                                                    <div className="achievement-icon">❓</div>
                                                    <div className="achievement-details">
                                                        <h4 className="achievement-name">{ach.name}</h4>
                                                        <p className="achievement-desc">？？？</p>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={ach.id} className={`achievement-item ${isUnlocked ? 'unlocked' : ''}`}>
                                                    <div className="achievement-icon">{isUnlocked ? '🏆' : '🔒'}</div>
                                                    <div className="achievement-details">
                                                        <h4 className="achievement-name">{ach.name}</h4>
                                                        <p className="achievement-desc">{ach.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        )}
                        {activeSettingsTab === 'data' && (
                            <div>
                                <h3>データ管理</h3>
                                <p>現在のアプリの状態（所持メギド、編成、設定など）をファイルに保存したり、ファイルから復元したりします。</p>
                                <div className="settings-actions vertical">
                                    <button onClick={onExportData} className="btn btn-secondary">エクスポート</button>
                                    <button onClick={onImportData} className="btn btn-secondary">インポート</button>
                                </div>
                                <h4 style={{marginTop: '32px', color: 'var(--danger-color)'}}>危険な操作</h4>
                                <div className="settings-actions">
                                     <button onClick={onResetAllData} className="btn btn-danger">全データリセット</button>
                                </div>
                            </div>
                        )}
                        {activeSettingsTab === 'appearance' && (
                            <div>
                                <h3>外観</h3>
                                <div className="settings-actions vertical">
                                    <div className="setting-item" style={settingItemStyle}>
                                        <label htmlFor="theme-toggle">テーマ</label>
                                        <button id="theme-toggle" onClick={onToggleTheme} className="btn btn-secondary">ライト/ダークモード切替</button>
                                    </div>

                                </div>
                            </div>
                        )}
                        {activeSettingsTab === 'about' && (
                            <div>
                                <h3>このアプリについて</h3>
                                <div className="about-section">
                                    <h4>バージョン</h4>
                                    <p>ver. 2025.09.09-β</p>
                                </div>
                                <div className="about-section">
                                    <h4>免責事項</h4>
                                    <p>当サイトはメギド７２のゲーム内、ゲーム外で配布された画像、データを引用しています。<br/>これらの著作権、商標権、その他知的財産権は、株式会社ディー・エヌ・エーおよびメディア・ビジョン株式会社に帰属します。</p>
                                    <p>当サイトは個人ファンサイトであり、株式会社ディー・エヌ・エー他企業様とは一切関係ありません。</p>
                                </div>
                                <div className="about-section">
                                    <h4>連絡先</h4>
                                    <div className="mail-subject-selector">
                                        <label>
                                            <input type="radio" name="mail_subject" value="不具合報告" checked={mailSubject === '不具合報告'} onChange={e => setMailSubject(e.target.value)} />
                                            不具合報告
                                        </label>
                                        <label>
                                            <input type="radio" name="mail_subject" value="要望" checked={mailSubject === '要望'} onChange={e => setMailSubject(e.target.value)} />
                                            要望
                                        </label>
                                        <label>
                                            <input type="radio" name="mail_subject" value="感想" checked={mailSubject === '感想'} onChange={e => setMailSubject(e.target.value)} />
                                            感想
                                        </label>
                                    </div>
                                    <p>
                                        <a href={`mailto:72corre+Tower_Tool@gmail.com?subject=${encodeURIComponent(`【星間の塔 攻略支援ツール】${mailSubject}`)}`}>
                                            72corre+Tower_Tool@gmail.com
                                        </a>
                                    </p>
                                </div>
                                <div className="about-section">
                                    <h4>使用ライブラリ</h4>
                                    <ul>
                                        <li>React</li>
                                        <li>qrious</li>
                                        <li>html5-qrcode</li>
                                        <li>Tailwind CSS</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        {activeSettingsTab === 'specialThanks' && (
                            <div>
                                <h3>Special Thanks</h3>
                                <div className="about-section">
                                    <p>（ここに協力者のお名前を記載します）</p>
                                </div>
                            </div>
                        )}
                        {activeSettingsTab === 'profile' && (
                            <div>
                                <h3>プロフィール</h3>
                                <p>あなたの星間の塔の攻略状況をまとめたプロフィール画像を生成します。</p>
                                <div className="settings-actions vertical">
                                    <button onClick={onOpenProfileGenerator} className="btn btn-primary">プロフィール画像を生成</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};