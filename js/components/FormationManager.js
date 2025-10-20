

const categoryColors = {
    floor: '#2a4365',
    rule: '#b7791f',
    enemy: '#c53030',
    custom: '#553c9a',
};

const FormationActionModal = ({
    isOpen,
    onClose,
    form,
    onGoToSource,
    onPost,
    onGenerateShareImage,
    onCopy,
    onExport,
    onEdit,
    onDelete
}) => {
    if (!isOpen || !form) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '300px'}}>
                <h3 style={{marginTop: 0}}>{form.name} - アクション</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                    {form.communityId && (
                        <button onClick={() => { onGoToSource(form); onClose(); }} className="btn btn-secondary">採点しに行く</button>
                    )} 
                    <button onClick={() => { onPost(form); onClose(); }} className="btn btn-primary">投稿</button>
                    <button onClick={() => { onGenerateShareImage(form); onClose(); }} className="btn btn-secondary">共有画像</button>
                    <button onClick={() => { onCopy(form.id); onClose(); }} className="btn btn-secondary">コピー</button>
                    <button onClick={() => { onExport(form); onClose(); }} className="btn btn-secondary">エクスポート</button>
                    <button onClick={() => { onEdit(form); onClose(); }} className="btn btn-secondary">編集</button>
                    <button onClick={() => {
                        if (window.confirm(`「${form.name}」を削除してもよろしいですか？`)) {
                            onDelete(form.id);
                        }
                        onClose();
                    }} className="btn btn-danger">削除</button>
                </div>
                <button onClick={onClose} className="btn btn-secondary" style={{marginTop: '16px'}}>閉じる</button>
            </div>
        </div>
    );
};

const FormationCard = ({
    form,
    onOpenActionMenu,
    isInvalid,
    invalidReason,
    nameStyle,
    cardStyle,
    onTagClick,
    isGuideMode,
    isBossFormation,
    onSetBossFormation
}) => {
    return (
        <div className="card" style={{...cardStyle, height: '200px', display: 'flex', flexDirection: 'column'}}>
            <div className="formation-card-header">
                <h3 style={{...nameStyle, fontWeight: 700, margin: 0, flexGrow: 1, display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {form.name}
                    {isBossFormation && isGuideMode && <span className="boss-formation-label">ボス攻略編成</span>}
                </h3>
                {isGuideMode && (
                    <button 
                        onClick={() => onSetBossFormation(form.id)}
                        className={`btn btn-ghost p-1 boss-formation-btn ${isBossFormation ? 'active' : ''}`}
                        title={isBossFormation ? 'ボス攻略編成の指定を解除' : 'この編成をボス攻略用に指定'}
                    >
                        <span className="material-symbols-outlined">workspace_premium</span>
                    </button>
                )}
                <button 
                    className="formation-card-menu-btn"
                    onClick={() => onOpenActionMenu(form.id)}
                >
                    ︙
                </button>
            </div>

            {isInvalid && invalidReason && (
                <p style={{ color: 'var(--danger-color)', fontWeight: 'bold', margin: '8px 0', display: 'flex', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{marginRight: '8px'}}>report</span>
                    {invalidReason}
                </p>
            )}

            <div style={{ flex: 1, overflowY: 'auto', margin: '8px 0' }}>
                <p style={{color: 'var(--text-subtle)', whiteSpace: 'pre-wrap', margin: 0}}>{form.notes || ''}</p>
            </div>

            <div className="tag-carousel" style={{display: 'flex', flexWrap: 'nowrap', gap: '8px', overflowX: 'auto', paddingBottom: '8px'}}>
                {(form.tags || []).map((tagObject, i) => {
                    const text = typeof tagObject === 'string' ? tagObject : tagObject.text;
                    const category = typeof tagObject === 'string' ? getTagInfo(tagObject).category : tagObject.category;

                    let color;
                    let textColor = 'white';

                    if (category === 'megido') {
                        const megido = window.COMPLETE_MEGIDO_LIST && window.COMPLETE_MEGIDO_LIST.find(m => m.名前 === text);
                        if (megido) {
                            const style = megido.スタイル;
                            if (style === 'ラッシュ') {
                                color = 'var(--rush-color)';
                                textColor = 'var(--bg-main)';
                            } else if (style === 'カウンター') {
                                color = 'var(--counter-color)';
                            } else if (style === 'バースト') {
                                color = 'var(--burst-color)';
                                textColor = 'var(--bg-main)';
                            } else {
                                color = categoryColors.custom;
                            }
                        } else {
                             color = categoryColors.custom;
                        }
                    } else {
                        color = categoryColors[category] || categoryColors.custom;
                    }

                    return (
                        <button 
                            key={`${text}-${i}`}
                            className="tag-button-item" 
                            style={{
                                backgroundColor: color, 
                                color: textColor,
                                flexShrink: 0, 
                                whiteSpace: 'nowrap',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '4px 12px',
                                cursor: 'pointer'
                            }} 
                            onClick={() => onTagClick(tagObject)}>
                            {text}
                        </button>
                    );
                })}
            </div>

            <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px'}}>{(form.megidoSlots || []).map((slot, i) => slot ? 
                <span key={`${slot.megidoId}-${i}`} style={{fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--bg-main)', borderRadius: '4px'}} className={getStyleClass(slot.megidoStyle)}>{slot.megidoName}</span> : 
                <span key={i} style={{fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--bg-main)', borderRadius: '4px'}}>-</span>
            )}
            </div>
        </div>
    );
};

const FormationManager = (props) => {
    const {
        ownedMegidoIds,
        formations,
        onSave,
        onDelete,
        onCopy,
        onImport,
        isHtml5QrLoaded,
        megidoDetails,
        initialTagTarget,
        setInitialTagTarget,
        showToastMessage,
        setPreviousScreen,
        previousScreen,
        onTargetSelect,
        onCancel,
        isQriousLoaded,
        idMaps,
        editingFormation,
        onEditingFormationChange,
        onOpenCommunityFormations,
        handlePostFormation,
        isPosting,
        bossFormationId,
        onSetBossFormation,
        isGuideMode
    } = props;
    const { useState, useEffect, useMemo, useCallback } = React;
    const [tagSearch, setTagSearch] = useState({ text: '', exactMatch: false });
    const [qrCodeData, setQrCodeData] = useState(null);
    const [actionMenuCardId, setActionMenuCardId] = useState(null);
    const [postModalState, setPostModalState] = useState({ isOpen: false, formation: null });

    useEffect(() => {
        if (qrCodeData && isQriousLoaded) {
            const canvas = document.getElementById('qr-canvas');
            if (canvas) {
                new QRious({ element: canvas, value: qrCodeData, size: 512 });
            }
        }
    }, [qrCodeData, isQriousLoaded]);

    useEffect(() => {
        if (!editingFormation) {
            onTargetSelect(null, null);
        }
    }, [editingFormation]);

    useEffect(() => {
        if (initialTagTarget) {
            setPreviousScreen(previousScreen);
            onEditingFormationChange({ id: `f${Date.now()}`, name: '', tags: [], notes: '', megido: Array(5).fill(null) });
        }
    }, [initialTagTarget]);

    const formationList = useMemo(() => Object.values(formations), [formations]);

    const filteredFormations = useMemo(() => {
        if (typeof COMPLETE_MEGIDO_LIST === 'undefined') return [];
        if (!tagSearch.text) return formationList;
        return formationList.filter(f => {
            if (!f.tags || f.tags.length === 0) return false;
            const searchText = hiraganaToKatakana(tagSearch.text).toLowerCase();
            return f.tags.some(tagObject => {
                const tagText = typeof tagObject === 'string' ? tagObject : tagObject.text;
                const lowerTagText = hiraganaToKatakana(tagText).toLowerCase();
                if (tagSearch.exactMatch) {
                    return lowerTagText === searchText;
                }
                return lowerTagText.includes(searchText);
            });
        });
    }, [tagSearch, formationList]);

    const handleSave = (formationToSave, targetScreen) => {
        onSave(formationToSave, targetScreen);
        onEditingFormationChange(null);
        if (initialTagTarget) {
            setInitialTagTarget(null);
        }
    };

    const handleCancel = () => {
        onEditingFormationChange(null);
        if (initialTagTarget) {
            setInitialTagTarget(null);
        }
        onTargetSelect(null, null);
        if (onCancel) onCancel();
    };

    const handleNewFormation = () => {
        setPreviousScreen('formation');
        onEditingFormationChange({ id: `f${Date.now()}`, name: '', tags: [], notes: '', megido: Array(5).fill(null) });
        showToastMessage('新規編成の準備ができました。');
    };

    const handleExportClick = (form, returnOnly = false) => {
        if (!idMaps || !megidoDetails) {
            showToastMessage('IDマッピングが完了していません。', 'error');
            return null;
        }

        const qrString = encodeFormationToQrString(form, megidoDetails, idMaps);

        if (!qrString) {
            showToastMessage('QRコード文字列の生成に失敗しました。', 'error');
            return null;
        }

        if (returnOnly) {
            return qrString;
        }
        setQrCodeData(qrString);
    };

    const handleOpenActionMenu = (formId) => {
        setActionMenuCardId(formId);
    };

    const handleGoToSource = (form) => {
        if (form.communityId) {
            onOpenCommunityFormations(form.floor, form.enemyName, form.communityId);
        } else {
            showToastMessage('この編成は「みんなの編成」からコピーされたものではありません。', 'info');
        }
    };
    
    const { handleGenerateShareImage } = useAppContext();

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {qrCodeData && isQriousLoaded && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200}}>
                    <div className="card" style={{textAlign: 'center', padding: '40px'}}>
                        <h3 style={{marginTop: 0}}>生成QRコード</h3>
                        <canvas id="qr-canvas" style={{width: '256px', height: '256px'}}></canvas>
                        <button onClick={() => setQrCodeData(null)} className="btn btn-primary" style={{marginTop: '24px'}}><span className="material-symbols-outlined">close</span>閉じる</button>
                    </div>
                </div>
            )}

            {postModalState.isOpen && (
                <PostFormationModal 
                    isOpen={postModalState.isOpen}
                    onClose={() => setPostModalState({ isOpen: false, formation: null })}
                    formationToPost={postModalState.formation}
                    isPosting={isPosting}
                    onSubmit={async (data) => {
                        await handlePostFormation(data);
                        setPostModalState({ isOpen: false, formation: null });
                    }}
                />
            )}

            <FormationActionModal
                isOpen={!!actionMenuCardId}
                onClose={() => setActionMenuCardId(null)}
                form={formations[actionMenuCardId]}
                onGoToSource={handleGoToSource}
                onPost={(f) => setPostModalState({ isOpen: true, formation: f })}
                onGenerateShareImage={handleGenerateShareImage}
                onCopy={onCopy}
                onExport={handleExportClick}
                onEdit={(f) => onEditingFormationChange(f)}
                onDelete={onDelete}
            />

            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <input 
                        type="text" 
                        placeholder="名前またはタグで検索..."
                        value={tagSearch.text}
                        onChange={e => setTagSearch({ text: e.target.value, exactMatch: tagSearch.exactMatch })}
                        className="input-field" 
                        style={{flexGrow: 1}}
                    />
                    <div className="flex items-center gap-1">
                        <label className="label mb-0 text-xs whitespace-nowrap" htmlFor="tag-exact-match">完全一致:</label>
                        <input 
                            id="tag-exact-match"
                            type="checkbox" 
                            checked={tagSearch.exactMatch} 
                            onChange={e => setTagSearch({ text: tagSearch.text, exactMatch: e.target.checked })}
                        />
                    </div>
                </div>

                <div style={{display: 'flex', gap: '16px', justifyContent: 'flex-end'}}>
                    <button onClick={handleNewFormation} className="btn btn-ghost" title="新規作成">
                        <span className="material-symbols-outlined">add_circle</span>
                        <span>新規作成</span>
                    </button>
                    <button onClick={onImport} className="btn btn-ghost" disabled={!isHtml5QrLoaded || !idMaps} title="QRコードでインポート">
                        <span className="material-symbols-outlined">qr_code_scanner</span>
                        <span>QR読込</span>
                    </button>
                    <button onClick={() => onOpenCommunityFormations()} className="btn btn-ghost" title="みんなの編成">
                        <span className="material-symbols-outlined">public</span>
                        <span>みんなの編成</span>
                    </button>
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {(filteredFormations || []).map(form => {
                    const rehydratedForm = rehydrateFormation(form, megidoDetails);
                    const invalidReason = getFormationInvalidReason(rehydratedForm, megidoDetails, ownedMegidoIds);
                    const isInvalid = !!invalidReason;
                    const isBossFormation = form.id === bossFormationId;

                    const cardStyle = {
                        ...(isInvalid ? { 
                            backgroundColor: 'rgba(217, 83, 79, 0.3)',
                            border: '2px solid var(--warning-color)'
                        } : {}),
                        ...(isBossFormation && isGuideMode ? { border: '2px solid var(--primary-accent)', boxShadow: '0 0 8px var(--primary-accent)' } : {})
                    };
                    const nameStyle = isInvalid ? { color: 'var(--danger-color)' } : {};
                    
                    return (
                        <FormationCard
                            key={form.id}
                            form={form}
                            onOpenActionMenu={handleOpenActionMenu}
                            isInvalid={isInvalid}
                            nameStyle={nameStyle}
                            cardStyle={cardStyle}
                            invalidReason={invalidReason}
                            onTagClick={(tagObject) => {
                                const category = typeof tagObject === 'string' ? getTagInfo(tagObject).category : tagObject.category;
                                const text = typeof tagObject === 'string' ? tagObject : tagObject.text;
                                const isMegidoTag = category === 'megido';
                                setTagSearch({ text: text, exactMatch: isMegidoTag });
                            }}
                            isGuideMode={isGuideMode}
                            isBossFormation={isBossFormation}
                            onSetBossFormation={onSetBossFormation}
                        />
                    );
                })}
            </div>
        </div>
    );
};