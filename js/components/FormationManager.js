const FormationCard = React.memo(({
    form,
    isExpanded,
    onToggleExpand,
    isInvalid,
    nameStyle,
    cardStyle,
    onGenerateShareImage,
    onCopy,
    onExport,
    onEdit,
    onDelete,
    onTagClick
}) => {
    return (
        <div className="card" style={cardStyle}>
            <div className="formation-card-header">
                <h3 style={{...nameStyle, fontWeight: 700, margin: 0, flexGrow: 1}}>{form.name}</h3>
                <button 
                    className="formation-card-menu-btn"
                    onClick={() => onToggleExpand(form.id)}
                >
                    ︙
                </button>
            </div>

            {isExpanded && (
                <div className="formation-card-actions">
                    <button onClick={() => onGenerateShareImage(form)} className="btn btn-secondary">共有画像</button>
                    <button onClick={() => onCopy(form)} className="btn btn-secondary">コピー</button>
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
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px'}}>{(form.megido || []).map((m, i) => m ? 
                <span key={`${m.id}-${i}`} style={{fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--bg-main)', borderRadius: '4px'}} className={getStyleClass(m.スタイル)}>{m.名前}</span> : 
                <span key={i} style={{fontSize: '12px', padding: '2px 6px', backgroundColor: 'var(--bg-main)', borderRadius: '4px'}}>-</span>
            )
            }
            </div>
        </div>
    );
});

const FormationManager = ({
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
    isMobileView
}) => {
    const [tagSearch, setTagSearch] = useState({ text: '', exactMatch: false });
    const [qrCodeData, setQrCodeData] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [generatedImageData, setGeneratedImageData] = useState('');
    const [tweetUrl, setTweetUrl] = useState('');
    const [expandedCardId, setExpandedCardId] = useState(null);

    const drawOutlinedText = (ctx, text, x, y, options = {}) => {
        const {
            font = 'bold 24px "Noto Sans JP", sans-serif',
            fillStyle = '#FFFFFF',
            strokeStyle = '#000000',
            lineWidth = 5,
            textAlign = 'left',
            textBaseline = 'top',
            maxWidth
        } = options;
        ctx.font = font;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.fillStyle = fillStyle;
        ctx.textAlign = textAlign;
        ctx.textBaseline = textBaseline;
        if (maxWidth) {
            ctx.strokeText(text, x, y, maxWidth);
            ctx.fillText(text, x, y, maxWidth);
        } else {
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        }
    };

    const generateTweetText = (form) => {
        const baseUrl = 'https://twitter.com/intent/tweet';
        let text = '星間の塔\n';
        if (form.floor && form.enemyName) {
            const floorData = TOWER_MAP_DATA.find(f => f.floor === form.floor);
            if (floorData) {
                const square = Object.values(floorData.squares).find(s => s.enemies && s.enemies.includes(form.enemyName));
                const rules = square ? square.rules.join(', ') : '';
                text += `${form.floor}F：${rules} ${form.enemyName}\n`;
            }
        }
        text += '\n#メギド72 #星間の塔ツール';
        return `${baseUrl}?text=${encodeURIComponent(text)}`;
    };

    const handleGenerateShareImage = async (form) => {
        showToastMessage('共有用画像を生成中です...');
        setTweetUrl(generateTweetText(form));
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 675;
        const ctx = canvas.getContext('2d');
        const COLORS = {
            BG_HEADER: 'rgba(26, 32, 44, 0.9)',
            BG_MAIN: 'rgba(18, 18, 18, 0.9)',
            BORDER: '#4A5568',
            TEXT: '#FFFFFF',
            TEXT_SUBTLE: '#A0AEC0',
            ACCENT_GOLD: '#FFC107'
        };
        const LAYOUT = {
            HEADER_H: 130,
            PADDING: 30,
            QR_SIZE: 100
        };
        
        const qrCanvas = document.createElement('canvas');
        const qrString = handleExportClick(form, true);
        if (!qrString) {
            showToastMessage('QRコードの生成に失敗');
            return;
        }
        new QRious({
            element: qrCanvas,
            value: qrString,
            size: 400, // 高解像度で生成
            padding: 0
        });
        const loadImage = (src) => new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
        const imagePromises = [loadImage('asset/back.png')];
        form.megido.forEach(m => imagePromises.push(m ? loadImage(`asset/メギド/${m.名前}.png`) : Promise.resolve(null)));
        form.megido.forEach(m => imagePromises.push(m && m.orb ? loadImage(`asset/オーブ/${m.orb.name}.png`) : Promise.resolve(null)));
        const [bgImage, ...loadedImages] = await Promise.all(imagePromises);
        const megidoImages = loadedImages.slice(0, 5);
        const orbImages = loadedImages.slice(5);

        if (bgImage) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = COLORS.BG_HEADER;
        ctx.fillRect(0, 0, canvas.width, LAYOUT.HEADER_H);
        ctx.fillStyle = COLORS.BG_MAIN;
        ctx.fillRect(0, LAYOUT.HEADER_H, canvas.width, canvas.height - LAYOUT.HEADER_H);

        // --- RIGHT COLUMN (QR Code) ---
        const qrPadding = 6;
        const qrBgSize = LAYOUT.QR_SIZE + qrPadding * 2;
        const qrBgX = canvas.width - qrBgSize - LAYOUT.PADDING;
        const qrBgY = 5; // Lowered QR code position
        const qrX = qrBgX + qrPadding + 4;
        const qrY = qrBgY + qrPadding + 4;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(qrBgX, qrBgY, qrBgSize, qrBgSize);
        ctx.drawImage(qrCanvas, qrX, qrY, LAYOUT.QR_SIZE, LAYOUT.QR_SIZE);

        // --- LEFT COLUMN (Info) ---
        const leftColumnMaxWidth = 450;

        if (form.floor || form.enemyName) {
            const floorData = TOWER_MAP_DATA.find(f => f.floor === form.floor);
            const square = floorData ? Object.values(floorData.squares).find(s => s.enemies && s.enemies.includes(form.enemyName)) : null;
            const rules = square ? square.rules.join(', ') : '';

            const floorText = `${form.floor || '?'}F`;
            drawOutlinedText(ctx, floorText, LAYOUT.PADDING, LAYOUT.PADDING, {
                font: 'bold 42px "Noto Sans JP", sans-serif'
            });
            const floorWidth = ctx.measureText(floorText).width;
            drawOutlinedText(ctx, form.enemyName || 'N/A', LAYOUT.PADDING + floorWidth + 15, LAYOUT.PADDING + 10, {
                font: 'bold 32px "Noto Sans JP", sans-serif',
                maxWidth: leftColumnMaxWidth - floorWidth - 15
            });
            drawOutlinedText(ctx, rules, LAYOUT.PADDING, LAYOUT.PADDING + 55, {
                font: '20px "Noto Sans JP", sans-serif',
                fillStyle: COLORS.TEXT_SUBTLE,
                textBaseline: 'top',
                maxWidth: leftColumnMaxWidth
            });
        } else {
            // Fallback to formation name
            drawOutlinedText(ctx, form.name || '名称未設定の編成', LAYOUT.PADDING, LAYOUT.PADDING + 10, {
                font: 'bold 32px "Noto Sans JP", sans-serif',
                textBaseline: 'top',
                maxWidth: leftColumnMaxWidth
            });
        }

        // --- CENTER COLUMN (Notes) ---
        if (form.notes) {
            const notesX = leftColumnMaxWidth + LAYOUT.PADDING * 2;
            const notesMaxWidth = canvas.width - notesX - qrBgSize - LAYOUT.PADDING * 3;
            const lineHeight = 22;
            let currentY = LAYOUT.PADDING;
            const lines = form.notes.split('\n');

            for (let i = 0; i < lines.length; i++) {
                if (i >= 4) break; // Max 4 lines
                const line = lines[i];
                drawOutlinedText(ctx, line, notesX, currentY, {
                    font: '18px "Noto Sans JP", sans-serif',
                    fillStyle: COLORS.TEXT_SUBTLE,
                    textBaseline: 'top',
                    maxWidth: notesMaxWidth
                });
                currentY += lineHeight;
            }
        }

        // --- Cards Section ---
        const cardW = 210;
        const cardH = 480;
        const cardY = LAYOUT.HEADER_H + 30;
        const cardTotalW = cardW * 5 + 25 * 4;
        const cardStartX = (canvas.width - cardTotalW) / 2;

        megidoImages.forEach((img, i) => {
            const megido = form.megido[i];
            if (!megido) return;
            const cardX = cardStartX + i * (cardW + 25);
            ctx.strokeStyle = COLORS.BORDER;
            ctx.lineWidth = 1;
            ctx.strokeRect(cardX, cardY, cardW, cardH);
            if (img) {
                ctx.drawImage(img, cardX + 15, cardY + 15, cardW - 30, cardW - 30);
            } else {
                drawOutlinedText(ctx, megido.名前, cardX + cardW / 2, cardY + 80, {
                    textAlign: 'center',
                    maxWidth: cardW - 20
                });
            }
            let infoY = cardY + cardW;
            const ougiText = `奥義Lv. ${megido.ougiLevel || 1}`;
            drawOutlinedText(ctx, ougiText, cardX + cardW / 2, infoY, {
                font: 'bold 22px "Noto Sans JP", sans-serif',
                textAlign: 'center',
                fillStyle: COLORS.ACCENT_GOLD
            });
            infoY += 30;
            if (megido.special_reishou) {
                drawOutlinedText(ctx, '☆ 専用霊宝', cardX + cardW / 2, infoY, {
                    font: '18px "Noto Sans JP", sans-serif',
                    textAlign: 'center'
                });
                infoY += 25;
            }
            if (megido.bond_reishou) {
                drawOutlinedText(ctx, `☆ 絆霊宝 Tier ${megido.bond_reishou}`, cardX + cardW / 2, infoY, {
                    font: '18px "Noto Sans JP", sans-serif',
                    textAlign: 'center'
                });
                infoY += 25;
            }
            if (megido.Singularity && megido.singularity_level > 0) {
                drawOutlinedText(ctx, `☆ 凸 ${megido.singularity_level}`, cardX + cardW / 2, infoY, {
                    font: '18px "Noto Sans JP", sans-serif',
                    textAlign: 'center'
                });
                infoY += 25;
            }
            infoY += 10;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = COLORS.BORDER;
            ctx.fillRect(cardX + 10, infoY, cardW - 20, 1);
            ctx.globalAlpha = 1.0;
            infoY += 10;
            const orbImg = orbImages[i];
            const orb = megido.orb;
            if (orb) {
                if (orbImg) {
                    ctx.drawImage(orbImg, cardX + (cardW - 60) / 2, infoY, 60, 60);
                    infoY += 60;
                }
                drawOutlinedText(ctx, orb.name, cardX + cardW / 2, infoY, {
                    font: '16px "Noto Sans JP", sans-serif',
                    textAlign: 'center',
                    maxWidth: cardW - 20
                });
                infoY += 25;
            }
            if (megido.reishou && megido.reishou.length > 0) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = COLORS.BORDER;
                ctx.fillRect(cardX + 10, infoY, cardW - 20, 1);
                ctx.globalAlpha = 1.0;
                infoY += 10;
                megido.reishou.forEach(r => {
                    drawOutlinedText(ctx, r.name, cardX + cardW / 2, infoY, {
                        font: '16px "Noto Sans JP", sans-serif',
                        textAlign: 'center',
                        maxWidth: cardW - 20
                    });
                    infoY += 20;
                });
            }
        });
        setGeneratedImageData(canvas.toDataURL('image/png'));
        setShowShareModal(true);
    };

    useEffect(() => {
        if (qrCodeData && isQriousLoaded) {
            const canvas = document.getElementById('qr-canvas');
            if (canvas) {
                new QRious({
                    element: canvas,
                    value: qrCodeData,
                    size: 512
                });
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
            onEditingFormationChange({
                id: `f${Date.now()}`,
                name: '',
                tags: [],
                notes: '',
                megido: Array(5).fill(null)
            });
        }
    }, [initialTagTarget]);

    const filteredFormations = useMemo(() => {
        if (typeof COMPLETE_MEGIDO_LIST === 'undefined') return [];
        if (!tagSearch.text) return formations;
        return formations.filter(f => {
            if (!f.tags || f.tags.length === 0) return false;
            const searchText = tagSearch.text.toLowerCase();
            if (tagSearch.exactMatch) {
                return f.tags.some(tag => tag.toLowerCase() === searchText);
            } else {
                return f.tags.some(tag => tag.toLowerCase().includes(searchText));
            }
        });
    }, [tagSearch, formations]);

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
        onEditingFormationChange({
            id: `f${Date.now()}`,
            name: '',
            tags: [],
            notes: '',
            megido: Array(5).fill(null)
        });
        showToastMessage('新規編成の準備ができました。');
    };

    const handleExportClick = (form, returnOnly = false) => {
        if (!idMaps) {
            showToastMessage('IDマッピングが完了していません。');
            return null;
        }
        let qrString = '';
        const enemyId = form.enemyName ? (idMaps.enemy.originalToNew.get(form.enemyName) || '000') : '000';
        const floor = form.floor ? form.floor.toString().padStart(2, '0') : '00';
        qrString += enemyId;
        qrString += floor;
        for (let i = 0; i < 5; i++) {
            const megido = form.megido[i];
            if (megido) {
                const megidoDetailsForSlot = megidoDetails[megido.id] || {};
                qrString += idMaps.megido.originalToNew.get(String(megido.id)) || '999';
                qrString += (megido.ougiLevel || 1).toString().padStart(2, '0');
                qrString += (megidoDetailsForSlot.singularity_level || 0).toString();
                const level = megido.level || 70;
                let levelChar = '0';
                if (level >= 80) levelChar = '4';
                else if (level >= 76) levelChar = '3';
                else if (level >= 74) levelChar = '2';
                else if (level >= 72) levelChar = '1';
                qrString += levelChar;
                const reishouIds = (megido.reishou || []).map(r => idMaps.reishou.originalToNew.get(r.id) || '999').slice(0, 4);
                while (reishouIds.length < 4) {
                    reishouIds.push('999');
                }
                qrString += reishouIds.join('');
                qrString += megido.special_reishou ? '1' : '0';
                qrString += (megido.bond_reishou || 0).toString();
                const orbId = (megido.orb && megido.orb.id) ? (idMaps.orb.originalToNew.get(megido.orb.id) || '999') : '999';
                qrString += orbId;
            } else {
                qrString += '999'; // Megido ID
                qrString += '01';  // Ougi Level
                qrString += '0';   // Singularity Level
                qrString += '0';   // Level Cap
                qrString += '999999999999'; // Reishou
                qrString += '0';   // Special Reishou
                qrString += '0';   // Bond Reishou
                qrString += '999'; // Orb
            }
        }
        if (returnOnly) {
            return qrString;
        }
        setQrCodeData(qrString);
    };

    const handleToggleExpand = (formId) => {
        setExpandedCardId(prevId => prevId === formId ? null : formId);
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {qrCodeData && isQriousLoaded && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200}}>
                    <div className="card" style={{textAlign: 'center', padding: '40px'}}>
                        <h3 style={{marginTop: 0}}>生成QRコード</h3>
                        <canvas id="qr-canvas" style={{width: '256px', height: '256px'}}></canvas>
                        <button onClick={() => setQrCodeData(null)} className="btn btn-primary" style={{marginTop: '24px'}}>閉じる</button>
                    </div>
                </div>
            )}
            {showShareModal && generatedImageData && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200}} onClick={() => setShowShareModal(false)}>
                    <div className="card" style={{textAlign: 'center', padding: '20px', maxWidth: '90vw', maxHeight: '90vh'}} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0}}>共有用画像</h3>
                        <img src={generatedImageData} style={{maxWidth: '100%', maxHeight: 'calc(90vh - 150px)', margin: 'auto'}} />
                        <div style={{display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px'}}>
                            <a href={generatedImageData} download={`tower-formation-${Date.now()}.png`} className="btn btn-primary">ダウンロード</a>
                            <a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">ツイート</a>
                            <button onClick={() => setShowShareModal(false)} className="btn btn-ghost">閉じる</button>
                        </div>
                    </div>
                </div>
            )}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center'}}>
                <input 
                    type="text" 
                    placeholder="名前またはタグで検索..."
                    value={tagSearch.text}
                    onChange={e => setTagSearch({ text: e.target.value, exactMatch: tagSearch.exactMatch })}
                    className="input-field" 
                    style={{flexGrow: 1}}
                />
                <div className="flex items-center gap-2">
                    <label className="label mb-0 text-sm" htmlFor="tag-exact-match">完全一致:</label>
                    <input 
                        id="tag-exact-match"
                        type="checkbox" 
                        checked={tagSearch.exactMatch} 
                        onChange={e => setTagSearch({ text: tagSearch.text, exactMatch: e.target.checked })}
                    />
                </div>
                {!isMobileView && (
                    <button onClick={handleNewFormation} className="btn btn-ghost">新規作成</button>
                )}
                <button onClick={onImport} className="btn btn-ghost" disabled={!isHtml5QrLoaded}>インポート</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {(filteredFormations || []).map(form => {
                    const isInvalid = isFormationInvalid(form, megidoDetails, ownedMegidoIds);
                    const cardStyle = isInvalid ? { backgroundColor: 'rgba(217, 83, 79, 0.3)' } : {};
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
                            onGenerateShareImage={handleGenerateShareImage}
                            onCopy={onCopy}
                            onExport={handleExportClick}
                            onEdit={() => { setPreviousScreen('formation'); onEditingFormationChange(form); }}
                            onDelete={onDelete}
                            onTagClick={(tag) => setTagSearch({ text: tag, exactMatch: true })}
                        />
                    );
                })}
            </div>
            {isMobileView && (
                <div className="fab-container">
                    <button onClick={handleNewFormation} className="fab-add-formation">+</button>
                    <span className="fab-text">新規作成</span>
                </div>
            )}
        </div>
    );
};