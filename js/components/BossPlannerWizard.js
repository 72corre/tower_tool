const BossPlannerWizard = ({ isOpen, onClose, boss, guideText, floorNum }) => {
    const e = React.createElement;
    const { useState, useEffect, useContext, useMemo } = React;
    const { ownedMegidoIds, megidoDetails, showToastMessage, handleCreateFormationFromSelection, glossaryData, megidoConditions } = useContext(window.AppContext);

    const recommendations = useMemo(() => {
        if (!boss || typeof COMPLETE_MEGIDO_LIST === 'undefined' || typeof COMPLETE_ORB_LIST === 'undefined') {
            return { attackers: [], jammers: [], supporters: [] };
        }
        const result = findRecommendedMegido({
            enemy: boss,
            floorRules: [],
            ownedMegido: ownedMegidoIds,
            allMegidoMaster: COMPLETE_MEGIDO_LIST,
            ownedOrbs: new Set(),
            allOrbsMaster: COMPLETE_ORB_LIST,
            megidoConditions: megidoConditions || {},
        });
        if (result.success) {
            return result.recommendations;
        }
        return { attackers: [], jammers: [], supporters: [] };
    }, [boss, ownedMegidoIds, megidoConditions]);

    const [activeTab, setActiveTab] = useState('guide');

    const renderTextWithTooltip = (text) => {
        if (!glossaryData || !text) return text;
        const allTerms = Object.keys(glossaryData);
        allTerms.sort((a, b) => b.length - a.length);
        const regex = new RegExp(`(${allTerms.join('|')})`, 'g');
        const parts = text.split(regex);
        return parts.map((part, index) => {
            if (allTerms.includes(part)) {
                return e(GlossaryTooltip, { key: index, term: part }, part);
            }
            return part;
        });
    };

    const getIconElement = (iconName) => {
        if (!iconName) return e('span', { className: 'inline-block w-8' }); // Placeholder for alignment
        const iconMap = {
            attack: 'swords',
            special_attack: 'auto_awesome',
            help: 'help_outline',
            daze: 'star',
            shock: 'bolt',
            sleep: 'sleep',
            revive: 'sync',
            skill: 'psychology',
            shield: 'shield',
            info: 'info',
            gauge_down: 'south',
            status_ailment: 'sick',
            damage_reduction: 'security',
            fixed_damage: 'my_location',
            terrain_damage: 'local_fire_department'
        };
        const materialIconName = iconMap[iconName] || 'help_outline';
        return e('span', { className: 'material-symbols-outlined mr-3 text-2xl align-middle text-gray-300' }, materialIconName);
    };

    const renderTextWithEmphasis = (text) => {
        if (!text) return '';
        const parts = text.split(/(【.*?】)/g);
        return parts.map((part, index) => {
            if (part.startsWith('【') && part.endsWith('】')) {
                const keyword = part.slice(1, -1);
                return e('strong', { key: index, className: 'text-yellow-300 font-bold' }, keyword);
            }
            if (!part) return null;
            return renderTextWithTooltip(part);
        });
    };

    const renderRecommendationCard = (rec) => {
        const styleColors = {
            'ラッシュ': 'border-red-500',
            'カウンター': 'border-blue-500',
            'バースト': 'border-yellow-500'
        };
        const cardBorderStyle = styleColors[rec.megido.スタイル] || 'border-gray-500';

        const renderSingleReason = (reason, index) => {
            // Handle complex, pre-formatted reasons (e.g., synergies)
            if (reason.title) {
                return e('div', { key: index, className: 'mt-2 text-sm' },
                    e('h5', { className: 'font-bold text-purple-300' }, reason.title),
                    e('p', { className: 'text-xs text-gray-300 pl-1', dangerouslySetInnerHTML: { __html: reason.description } })
                );
            }

            // Handle new structured reasons
            if (reason.targetGimmick && reason.method && reason.counter) {
                return e('div', { key: index, className: 'text-sm flex items-start mt-1' },
                    e('span', { className: 'material-symbols-outlined text-green-400 mr-2' }, 'task_alt'),
                    e('p', null, 
                        '「',
                        e('strong', { className: 'text-red-400' }, reason.targetGimmick),
                        '」のため、',
                        e('strong', { className: 'text-amber-400' }, reason.method),
                        'の「',
                        e('strong', { className: 'text-green-400' }, reason.counter),
                        '」が有効です。'
                    )
                );
            }

            // Fallback for any other or older reason format
            return e('p', { key: index, className: 'text-sm' }, reason.description || '有効なアクションです。');
        };

        const reasons = Array.isArray(rec.reason) ? rec.reason : [rec.reason];

        return e('div', { key: rec.megido.id + (rec.orb ? rec.orb.id : ''), className: `bg-gray-800 bg-opacity-50 p-3 rounded-lg border-l-4 ${cardBorderStyle}` },
            e('div', { className: 'flex items-center mb-2' },
                e('img', { src: `asset/メギド/${rec.megido.名前}.png`, className: 'w-12 h-12 rounded-full mr-3' }),
                e('div', null,
                    e('h4', { className: 'text-lg font-bold text-white' }, rec.megido.名前),
                    e('span', { className: 'text-xs text-gray-400' }, `[${rec.megido.スタイル}]`)
                )
            ),
            e('div', { className: 'space-y-1' },
                reasons.map((reason, index) => renderSingleReason(reason, index))
            )
        );
    };

    if (!isOpen) {
        return null;
    }

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10001
    };

    const contentStyle = {
        backgroundColor: 'var(--bg-panel)', padding: '20px', borderRadius: '8px',
        width: '90%', maxWidth: '800px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column'
    };

    const headerStyle = {
        borderBottom: '1px solid var(--border-color-light)', paddingBottom: '10px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    };

    const bodyStyle = { overflowY: 'auto', flexGrow: 1, minHeight: '350px', padding: '5px' };

    const footerStyle = {
        borderTop: '1px solid var(--border-color-light)', paddingTop: '20px', marginTop: '20px',
        textAlign: 'right'
    };

    return e('div', { style: overlayStyle, onClick: onClose },
        e('div', { style: contentStyle, onClick: (e) => e.stopPropagation() },
            e('div', { style: headerStyle },
                e('h2', { style: { margin: 0 } }, boss ? `${boss.name} 攻略計画` : 'ボス攻略計画'),
                e('button', { onClick: onClose, className: 'btn btn-ghost p-1 boss-planner-close-button' }, '×')
            ),
            e('div', { className: 'tabs', style: { marginBottom: '10px', borderBottom: '1px solid var(--border-color-light)' } },
                e('button', { 
                    onClick: () => setActiveTab('guide'), 
                    className: `tab-button ${activeTab === 'guide' ? 'active' : ''}`,
                    style: { 
                        padding: '10px 15px', border: 'none', 
                        background: activeTab === 'guide' ? 'var(--primary-accent-faded)' : 'transparent',
                        color: 'var(--text-main)', cursor: 'pointer',
                        borderBottom: activeTab === 'guide' ? '3px solid var(--primary-accent)' : '3px solid transparent',
                        fontWeight: activeTab === 'guide' ? 'bold' : 'normal', transition: 'all 0.2s ease'
                    }
                }, '攻略ガイド'),
                e('button', { 
                    onClick: () => setActiveTab('formation'), 
                    className: `tab-button ${activeTab === 'formation' ? 'active' : ''}`,
                    style: { 
                        padding: '10px 15px', border: 'none', 
                        background: activeTab === 'formation' ? 'var(--primary-accent-faded)' : 'transparent',
                        color: 'var(--text-main)', cursor: 'pointer',
                        borderBottom: activeTab === 'formation' ? '3px solid var(--primary-accent)' : '3px solid transparent',
                        fontWeight: activeTab === 'formation' ? 'bold' : 'normal', transition: 'all 0.2s ease'
                    }
                }, '戦力分析')
            ),
            e('div', { style: bodyStyle },
                activeTab === 'guide' && (() => {
                    const guide = boss.guide;
                    if (!guide || !guide.sections) {
                        return e('div', { className: 'card', style: { padding: '15px' } },
                            e('p', null, guideText || '現在、有効なブリーフィング情報はありません。')
                        );
                    }
                    return e('div', { className: 'space-y-4' },
                        guide.sections.map((section, sectionIndex) => {
                            const isThreat = section.type === 'threat';
                            const cardClasses = isThreat ? 'bg-red-900 bg-opacity-40 border-red-700' : 'bg-sky-900 bg-opacity-40 border-sky-700';
                            const titleColor = isThreat ? 'text-red-300' : 'text-sky-300';
                            return e('div', { key: sectionIndex, className: `border rounded-lg p-4 ${cardClasses}` },
                                e('h4', { className: `text-lg font-bold mb-3 ${titleColor}` }, section.title),
                                e('ul', { className: 'list-none m-0 p-0 space-y-3' }, 
                                    section.points.map((point, pointIndex) => 
                                        e('li', { key: pointIndex, className: 'flex items-start' },
                                            getIconElement(point.icon),
                                            e('span', { className: 'text-base text-white' }, renderTextWithEmphasis(point.text))
                                        )
                                    )
                                ),
                                section.summary && e('p', { className: 'mt-4 text-sm text-gray-300' }, section.summary)
                            );
                        })
                    );
                })(),
                activeTab === 'formation' && e('div', {
                    className: 'formation-analysis-content space-y-4',
                },
                    e('p', { className: 'guide-text text-sm text-gray-300 p-2 bg-gray-900 rounded-md' }, 'ボスに有効なあなたの所持メギドと、その推薦理由を表示します。'),
                    (recommendations.attackers.length > 0 || recommendations.jammers.length > 0 || recommendations.supporters.length > 0)
                    ? e(React.Fragment, null,
                        recommendations.attackers.length > 0 && e(React.Fragment, null,
                            e('h4', { className: 'text-lg font-bold text-red-400 border-b border-red-400 pb-1 my-2' }, 'アタッカー候補'),
                            recommendations.attackers.map(rec => renderRecommendationCard(rec))
                        ),
                        recommendations.jammers.length > 0 && e(React.Fragment, null,
                            e('h4', { className: 'text-lg font-bold text-blue-400 border-b border-blue-400 pb-1 my-2' }, 'ジャマー候補'),
                            recommendations.jammers.map(rec => renderRecommendationCard(rec))
                        ),
                        recommendations.supporters.length > 0 && e(React.Fragment, null,
                            e('h4', { className: 'text-lg font-bold text-green-400 border-b border-green-400 pb-1 my-2' }, 'サポーター候補'),
                            recommendations.supporters.map(rec => renderRecommendationCard(rec))
                        )
                      )
                    : e('div', { className: 'card p-5 text-center text-gray-400' },
                        e('p', null, 'おすすめメギドが見つかりませんでした。'),
                        e('p', { className: 'mt-2 text-sm' }, '「所持メギド」タブから手持ちのメギドを登録すると、ボスに有効なメギドがここに表示されます。')
                      )
                )
            ),
            e('div', { style: footerStyle },
                e('button', { onClick: onClose, className: 'btn btn-secondary' }, '閉じる')
            )
        )
    );
};