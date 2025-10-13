const FormationCard = ({
    form,
    isExpanded,
    onToggleExpand,
    isInvalid,
    nameStyle,
    cardStyle,
    onGenerateShareImage = () => {},
    onCopy,
    onExport,
    onEdit,
    onDelete,
    onTagClick,
    onPost,
    onGoToSource,
    isGuideMode,
    isBossFormation,
    onSetBossFormation
}) => {
    return (
        <div className="card" style={cardStyle}>
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
                        <img src="asset/boss.webp" alt="ボス攻略編成" style={{ width: '24px', height: '24px' }} />
                    </button>
                )}
                <button 
                    className="formation-card-menu-btn"
                    onClick={() => onToggleExpand(form.id)}
                >
                    ︙
                </button>
            </div>

            {isExpanded && (
                <div className="formation-card-actions">
                    {form.communityId && (
                        <button onClick={() => onGoToSource(form)} className="btn btn-secondary">採点しに行く</button>
                    )} 
                    <button onClick={() => onPost(form)} className="btn btn-primary">投稿</button>
                    <button onClick={() => onGenerateShareImage(form)} className="btn btn-secondary">共有画像</button>
                    <button onClick={() => onCopy(form.id)} className="btn btn-secondary">コピー</button>
                    <button onClick={() => onExport(form)} className="btn btn-secondary">エクスポート</button>
                    <button onClick={() => onEdit(form)} className="btn btn-secondary">編集</button>
                    <button onClick={() => {
                        if (window.confirm(`「${form.name}」を削除してもよろしいですか？`)) {
                            onDelete(form.id);
                        }
                    }} className="btn btn-danger">削除</button>
                </div>
            )}

            <p style={{color: 'var(--text-subtle)', margin: '8px 0', whiteSpace: 'pre-wrap'}}>{form.notes || ''}</p>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px'}}>{(form.tags || []).map((tag, i) => (
                <button key={`${tag}-${i}`} className="tag-button-item" onClick={() => onTagClick(tag)}>
                    {tag}
                </button>
            ))}</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px'}}>{(form.megidoSlots || []).map((slot, i) => slot ? 
                <span key={`${slot.megidoId}-${i}`} style={{fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--bg-main)', borderRadius: '4px'}} className={getStyleClass(slot.megidoStyle)}>{slot.megidoName}</span> : 
                <span key={i} style={{fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--bg-main)', borderRadius: '4px'}}>-</span>
            )
            }
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
        onGenerateShareImage,
        bossFormationId,
        onSetBossFormation,
        isGuideMode
    } = props;
    const { useState, useEffect, useMemo, useCallback } = React;
    const [tagSearch, setTagSearch] = useState({ text: '', exactMatch: false });
    const [qrCodeData, setQrCodeData] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
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
            if (tagSearch.exactMatch) {
                return f.tags.some(tag => hiraganaToKatakana(tag).toLowerCase() === searchText);
            } else {
                return f.tags.some(tag => hiraganaToKatakana(tag).toLowerCase().includes(searchText));
            }
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

        // QR文字列の生成を utils.js の関数に一元化
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

    const handleToggleExpand = (formId) => {
        setExpandedCardId(prevId => prevId === formId ? null : formId);
    };

    const handleGoToSource = (form) => {
        if (form.communityId) {
            onOpenCommunityFormations(form.floor, form.enemyName, form.communityId);
        } else {
            showToastMessage('この編成は「みんなの編成」からコピーされたものではありません。', 'info');
        }
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
            {qrCodeData && isQriousLoaded && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200}}>
                    <div className="card" style={{textAlign: 'center', padding: '40px'}}>
                        <h3 style={{marginTop: 0}}>生成QRコード</h3>
                        <canvas id="qr-canvas" style={{width: '256px', height: '256px'}}></canvas>
                        <button onClick={() => setQrCodeData(null)} className="btn btn-primary" style={{marginTop: '24px'}}>閉じる</button>
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
                    <button onClick={handleNewFormation} className="btn btn-ghost p-1" title="新規作成">
                        <img src="asset/create.webp" alt="新規作成" style={{width: '32px', height: '32px'}} />
                    </button>
                    <button onClick={onImport} className="btn btn-ghost p-1" disabled={!isHtml5QrLoaded || !idMaps} title="QRコードでインポート">
                        <img src="asset/scan.webp" alt="QRコードでインポート" style={{width: '32px', height: '32px'}} />
                    </button>
                    <button onClick={() => onOpenCommunityFormations()} className="btn btn-ghost p-1" title="みんなの編成">
                        <img src="asset/community.webp" alt="みんなの編成" style={{width: '32px', height: '32px'}} />
                    </button>
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {(filteredFormations || []).map(form => {
                    const rehydratedForm = rehydrateFormation(form, megidoDetails);
                    const isInvalid = isFormationInvalid(rehydratedForm, megidoDetails, ownedMegidoIds);
                    const isBossFormation = form.id === bossFormationId;

                    const cardStyle = {
                        ...(isInvalid ? { backgroundColor: 'rgba(217, 83, 79, 0.3)' } : {}),
                        ...(isBossFormation && isGuideMode ? { border: '2px solid var(--primary-accent)', boxShadow: '0 0 8px var(--primary-accent)' } : {})
                    };
                    const nameStyle = isInvalid ? { color: 'var(--danger-color)' } : {};
                    
                    return (
                        <FormationCard
                            key={form.id}
                            form={form}
                            isExpanded={expandedCardId === form.id}
                            onToggleExpand={handleToggleExpand}
                            isInvalid={isInvalid}
                            nameStyle={nameStyle}
                            cardStyle={cardStyle}
                            onCopy={onCopy}
                            onExport={handleExportClick}
                            onEdit={(f) => onEditingFormationChange(f)}
                            onDelete={onDelete}
                            onTagClick={(tag) => setTagSearch({ text: tag, exactMatch: false })}
                            onPost={(f) => setPostModalState({ isOpen: true, formation: f })}
                            onGoToSource={handleGoToSource}
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