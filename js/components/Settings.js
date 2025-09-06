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
    onViewModeChange
}) => {
    const [activeSettingsTab, setActiveSettingsTab] = useState('achievements');
    const [mailSubject, setMailSubject] = useState('不具合報告');

    if (!show) {
        return null;
    }

    const achievementsArray = Object.values(achievementsData);
    const visibleAchievements = achievementsArray.filter(ach => {
        return ach.type !== 'private' || unlockedAchievements.has(ach.id);
    });

    const totalAchievements = achievementsArray.length;
    const unlockedCount = unlockedAchievements.size;

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="card settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header">
                    <h2 style={{ margin: 0 }}>設定</h2>
                    <button onClick={onClose} className="btn-icon" title="閉じる">
                        <span style={{fontSize: '24px', lineHeight: '1'}}>&times;</span>
                    </button>
                </div>
                <div className="settings-content">
                    <div className="settings-sidebar">
                        <button
                            className={`settings-tab-button ${activeSettingsTab === 'achievements' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('achievements')}
                        >
                            実績
                        </button>
                        <button
                            className={`settings-tab-button ${activeSettingsTab === 'data' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('data')}
                        >
                            データ管理
                        </button>
                        <button
                            className={`settings-tab-button ${activeSettingsTab === 'appearance' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('appearance')}
                        >
                            外観
                        </button>
                        <button
                            className={`settings-tab-button ${activeSettingsTab === 'about' ? 'active' : ''}`}
                            onClick={() => setActiveSettingsTab('about')}
                        >
                            このアプリについて
                        </button>
                    </div>
                    <div className="settings-main">
                        {activeSettingsTab === 'achievements' && (
                            <div>
                                <h3>実績 ({unlockedCount} / {totalAchievements})</h3>
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
                                <div className="settings-actions">
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
                                    <div className="setting-item">
                                        <label htmlFor="theme-toggle">テーマ</label>
                                        <button id="theme-toggle" onClick={onToggleTheme} className="btn btn-secondary">ライト/ダークモード切替</button>
                                    </div>
                                    <div className="setting-item">
                                        <label htmlFor="view-mode-select">表示モード (デバッグ用)</label>
                                        <select id="view-mode-select" value={viewMode} onChange={(e) => onViewModeChange(e.target.value)} className="select-css">
                                            <option value="auto">自動</option>
                                            <option value="pc">PC</option>
                                            <option value="mobile">モバイル</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeSettingsTab === 'about' && (
                            <div>
                                <h3>このアプリについて</h3>
                                <div className="about-section">
                                    <h4>バージョン</h4>
                                    <p>ver. 2025.09.05-β</p>
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
                                <div className="about-section">
                                    <h4>Special Thanks</h4>
                                    <p>（ここに協力者のお名前を記載します）</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};