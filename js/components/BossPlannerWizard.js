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
    const [currentFormation, setCurrentFormation] = useState(null);
    const [positionModalState, setPositionModalState] = useState({ isOpen: false, megidoId: null });
    const [selectedMegido, setSelectedMegido] = useState(new Set());

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

    const handleCheckboxChange = (megidoId) => {
        setSelectedMegido(prev => {
            const newSet = new Set(prev);
            if (newSet.has(megidoId)) {
                newSet.delete(megidoId);
            } else {
                if (newSet.size >= 5) {
                    showToastMessage('最大5体まで選択できます。');
                } else {
                    newSet.add(megidoId);
                }
            }
            return newSet;
        });
    };

    const handleCreateFromSelectionClick = () => {
        if (selectedMegido.size === 0) {
            showToastMessage('メギドを1体以上選択してください。');
            return;
        }
        const tagTarget = { enemyName: boss.name, floors: [floorNum] };
        handleCreateFormationFromSelection(Array.from(selectedMegido), tagTarget);
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setSelectedMegido(new Set()); // ウィザードが開くたびに選択をリセット
        }
    }, [isOpen]);

    const handlePositionSelect = (position) => {
        const { megidoId } = positionModalState;
        if (!megidoId || position === null) {
            setPositionModalState({ isOpen: false, megidoId: null });
            return;
        }

        // 編成情報を更新
        const newSlots = [...currentFormation.megidoSlots];
        
        // 既に編成にいるかチェック
        if (newSlots.some(slot => slot && slot.megidoId === megidoId)) {
            showToastMessage('そのメギドは既に編成にいます。');
            setPositionModalState({ isOpen: false, megidoId: null });
            return;
        }

        // メギド情報を取得
        const megidoMaster = (typeof COMPLETE_MEGIDO_LIST !== 'undefined') 
            ? COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId)
            : null;

        if (!megidoMaster) {
            showToastMessage('メギド情報が見つかりません。');
            setPositionModalState({ isOpen: false, megidoId: null });
            return;
        }

        newSlots[position - 1] = {
            megidoId: megidoId,
            megidoName: megidoMaster.名前,
            megidoStyle: megidoMaster.スタイル || megidoMaster.style,
            // その他の必要な情報をここに追加
        };

        setCurrentFormation(prev => ({ ...prev, megidoSlots: newSlots }));

        // モーダルを閉じる
        setPositionModalState({ isOpen: false, megidoId: null });
    };

    const positionModalOptions = [
        { label: '1', value: 1, className: 'btn-primary' },
        { label: '2', value: 2, className: 'btn-primary' },
        { label: '3', value: 3, className: 'btn-primary' },
        { label: '4', value: 4, className: 'btn-primary' },
        { label: '5', value: 5, className: 'btn-primary' },
    ];

    if (!isOpen) {
        return null;
    }

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001 // z-indexを高く設定
    };

    const contentStyle = {
        backgroundColor: 'var(--bg-panel)',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
    };

    const headerStyle = {
        borderBottom: '1px solid var(--border-color-light)',
        paddingBottom: '10px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const bodyStyle = {
        overflowY: 'auto',
        flexGrow: 1,
        minHeight: '350px' // タブ切り替え時の高さ変動を防止
    };

    const footerStyle = {
        borderTop: '1px solid var(--border-color-light)',
        paddingTop: '20px',
        marginTop: '20px',
        textAlign: 'right'
    };

    return e('div', { style: overlayStyle, onClick: onClose },
        e('div', { style: contentStyle, onClick: (e) => e.stopPropagation() },
            e('div', { style: headerStyle },
                e('h2', { style: { margin: 0 } }, boss ? `${boss.name} 攻略計画` : 'ボス攻略計画'),
                e('button', { onClick: onClose, className: 'btn btn-ghost p-1 boss-planner-close-button' }, '×')
            ),
            e('div', { className: 'tabs', style: { marginBottom: '20px', borderBottom: '1px solid var(--border-color-light)' } },
                e('button', { 
                    onClick: () => setActiveTab('guide'), 
                    className: `tab-button boss-planner-guide-tab ${activeTab === 'guide' ? 'active' : ''}`,
                    style: { 
                        padding: '10px 15px', 
                        border: 'none', 
                        background: activeTab === 'guide' ? 'var(--bg-panel-active)' : 'transparent',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'guide' ? '2px solid var(--primary-accent)' : 'none'
                    }
                }, '攻略ガイド'),
                e('button', { 
                    onClick: () => setActiveTab('formation'), 
                    className: `tab-button boss-planner-formation-tab ${activeTab === 'formation' ? 'active' : ''}`,
                    style: { 
                        padding: '10px 15px', 
                        border: 'none', 
                        background: activeTab === 'formation' ? 'var(--bg-panel-active)' : 'transparent',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        borderBottom: activeTab === 'formation' ? '2px solid var(--primary-accent)' : 'none'
                    }
                }, '編成案')
            ),
            e('div', { style: bodyStyle },
                activeTab === 'guide' && e('div', { className: 'guide-text-panel card', style: { padding: '15px' } },
                    e('h3', { style: { marginTop: 0 } }, '攻略ガイド'),
                    e('p', { style: { whiteSpace: 'pre-wrap', margin: 0 } }, renderTextWithTooltip(guideText || '現在、有効なブリーフィング情報はありません。'))
                ),
                activeTab === 'formation' && e('div', {
                    className: 'formation-tab-content',
                    style: { display: 'flex', flexDirection: 'column', height: 'calc(80vh - 200px)' }
                },
                    e('p', { className: 'guide-text', style: { fontSize: '14px', color: 'var(--text-subtle)', margin: '0 0 15px 0', padding: '10px', backgroundColor: 'var(--bg-main)', borderRadius: '4px' } }, 'おすすめメギドにチェックを入れ、「選択したメギドで編成を作成」ボタンを押すと、編成の雛形を作成できます。'),
                    (recommendations && (recommendations.attackers.length > 0 || recommendations.jammers.length > 0 || recommendations.supporters.length > 0)) ? 
                        e('div', { style: { flexShrink: 0 } },
                            e('div', {
                                className: 'recommendations-panel card',
                                style: { marginBottom: '10px', padding: '15px', overflowY: 'auto', maxHeight: '180px' }
                            },
                                e('h4', { style: { marginTop: 0, marginBottom: '10px' } }, 'おすすめメギド'),
                                e('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' } },
                                    recommendations.attackers.concat(recommendations.jammers, recommendations.supporters).map(rec => e('div', {
                                        key: rec.megido.id + (rec.orb ? rec.orb.id : ''),
                                        className: 'recommendation-item',
                                        style: { display: 'flex', alignItems: 'center', gap: '5px', width: 'calc(50% - 5px)' }, // 2列にする
                                    },
                                        e('input', {
                                            type: 'checkbox',
                                            checked: selectedMegido.has(rec.megido.id),
                                            onChange: () => handleCheckboxChange(rec.megido.id),
                                            style: { cursor: 'pointer', flexShrink: 0 }
                                        }),
                                        e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                            e('img', {
                                                src: `asset/メギド/${rec.megido.名前}.png`,
                                                style: { width: '48px', height: '48px', borderRadius: '50%' },
                                            }),
                                            e('p', { style: { margin: 0, fontSize: '14px', fontWeight: 'bold' } }, rec.megido.名前)
                                        )
                                    ))
                                )
                            ),
                            e('button', { 
                                onClick: handleCreateFromSelectionClick, 
                                className: 'btn btn-primary', 
                                style: { marginTop: '15px', width: '100%' } 
                            }, '選択したメギドで編成を作成')
                        )
                    : e('div', { className: 'card', style: { padding: '20px', textAlign: 'center', color: 'var(--text-subtle)' } }, 'おすすめメギドが見つかりませんでした。\n「所持メギド」タブから手持ちのメギドを登録すると、ボスに有効なメギドがここに表示されます。')
                )
            ),            e('div', { style: footerStyle },
                e('button', { onClick: onClose, className: 'btn btn-secondary', style: { marginRight: '10px' } }, 'キャンセル'),
                e('button', { className: 'btn btn-primary' }, 'この編成でボスに挑む')
            ),
            e(ChoiceModal, {
                isOpen: positionModalState.isOpen,
                onClose: () => setPositionModalState({ isOpen: false, megidoId: null }),
                onConfirm: handlePositionSelect,
                title: '配置場所の選択',
                message: 'このメギドをどこに配置しますか？',
                options: positionModalOptions
            })
        )
    );
};