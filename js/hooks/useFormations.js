const useFormations = ({ showToastMessage, idMaps, setDisplayedEnemy, setActiveTab, setPracticeView, mode, handleMegidoDetailChange, megidoDetails }) => {
    const { useState, useCallback, useMemo } = React;

    const [formations, setFormations] = useState(() => {
        const saved = localStorage.getItem('formations');
        if (!saved) return {};

        try {
            const data = JSON.parse(saved);

            // Migration from old array format to new dictionary format
            if (Array.isArray(data)) {
                console.log("Migrating formations from old array format...");
                const newFormationsDict = {};
                data.forEach(formation => {
                    if (!formation || !formation.id) return;

                    const newFormation = {
                        id: formation.id,
                        name: formation.name || '',
                        tags: formation.tags || [],
                        notes: formation.notes || '',
                        enemyName: formation.enemyName || null,
                        floor: formation.floor || null,
                        reishou_reminder: formation.reishou_reminder || false,
                        megidoSlots: (formation.megido || Array(5).fill(null)).map(m => {
                            if (!m || !m.id) return null;
                            
                            const megidoMaster = (typeof COMPLETE_MEGIDO_LIST !== 'undefined') ? COMPLETE_MEGIDO_LIST.find(master => String(master.id) === String(m.id)) : null;
                            const orbMaster = m.orb && (typeof COMPLETE_ORB_LIST !== 'undefined') ? COMPLETE_ORB_LIST.find(master => String(master.id) === String(m.orb.id)) : null;
                            
                            return {
                                megidoId: m.id,
                                orbId: m.orb ? m.orb.id : null,
                                reishouIds: (m.reishou || []).map(r => r.id).filter(Boolean),
                                // Denormalized data for performance
                                megidoName: megidoMaster ? megidoMaster.名前 : '不明',
                                megidoStyle: megidoMaster ? (megidoMaster.スタイル || megidoMaster.style) : '',
                                leaderSkill: megidoMaster ? megidoMaster.LS : '',
                                orbName: orbMaster ? orbMaster.name : '',
                            };
                        })
                    };
                    newFormationsDict[formation.id] = newFormation;
                });
                // Save migrated data immediately
                localStorage.setItem('formations', JSON.stringify(newFormationsDict));
                console.log("Migration complete.");
                return newFormationsDict;
            }
            // Already in new format or empty
            return data;
        } catch (error) {
            console.error("Failed to load or migrate formations:", error);
            return {}; // Return empty object on error
        }
    });

    const [editingFormation, setEditingFormation] = useState(null);
    const [initialTagTarget, setInitialTagTarget] = useState(null);
    const [previousScreen, setPreviousScreen] = useState('map');



    const handleSaveFormation = useCallback((formationToSave) => {
        // The formationToSave comes from FormationEditor and has full megido/orb objects.
        // We convert it to the new, denormalized, ID-based format for storage.
        const newFormationData = {
            id: formationToSave.id,
            name: formationToSave.name || '',
            tags: formationToSave.tags || [],
            notes: formationToSave.notes || '',
            enemyName: formationToSave.enemyName || null,
            floor: formationToSave.floor || null,
            floors: formationToSave.floors || [],
            reishou_reminder: formationToSave.reishou_reminder || false,
            megidoSlots: (formationToSave.megido || Array(5).fill(null)).map(m => {
                if (!m || !m.id) return null;
                
                const megidoMaster = (typeof COMPLETE_MEGIDO_LIST !== 'undefined') ? COMPLETE_MEGIDO_LIST.find(master => String(master.id) === String(m.id)) : null;
                const orbMaster = m.orb && (typeof COMPLETE_ORB_LIST !== 'undefined') ? COMPLETE_ORB_LIST.find(master => String(master.id) === String(m.orb.id)) : null;

                return {
                    megidoId: m.id,
                    orbId: m.orb ? m.orb.id : null,
                    reishouIds: (m.reishou || []).map(r => r.id).filter(Boolean),
                    // Denormalized data
                    megidoName: megidoMaster ? megidoMaster.名前 : '不明',
                    megidoStyle: megidoMaster ? (megidoMaster.スタイル || megidoMaster.style) : '',
                    leaderSkill: megidoMaster ? megidoMaster.LS : '',
                    orbName: orbMaster ? orbMaster.name : '',
                };
            })
        };
        


        const newFormations = { ...formations, [newFormationData.id]: newFormationData };
        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations));
        
        setEditingFormation(null);
        setInitialTagTarget(null);
        showToastMessage('編成を保存しました。');
    }, [formations, showToastMessage]);

    const handleSaveFormationMemo = useCallback((formationId, newNotes) => {
        if (!formationId || !formations[formationId]) return;
        
        const updatedFormation = { ...formations[formationId], notes: newNotes };
        const newFormations = { ...formations, [formationId]: updatedFormation };

        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations));
        showToastMessage('編成メモを更新しました。');
    }, [formations, showToastMessage]);

    const handleDeleteFormation = useCallback((formationId) => {
        if (window.confirm('この編成を本当に削除しますか？')) {
            const newFormations = { ...formations };
            delete newFormations[formationId];
            setFormations(newFormations);
            localStorage.setItem('formations', JSON.stringify(newFormations));
            showToastMessage('編成を削除しました。');
        }
    }, [formations, showToastMessage]);

    const handleCopyFormation = useCallback((formationId) => {
        const formationToCopy = formations[formationId];
        if (!formationToCopy) return;

        const newId = `f${Date.now()}`;
        // The formation is already in the new denormalized format, so we can just spread it.
        let newFormation = { 
            ...formationToCopy, 
            id: newId, 
            name: `${formationToCopy.name} (コピー)` 
        };
        

        
        const newFormations = { ...formations, [newId]: newFormation };
        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations));
        showToastMessage('編成をコピーしました。');
    }, [formations, showToastMessage]);

    const handleImportFormation = useCallback(() => {
        if (!idMaps) {
            showToastMessage('IDマッピングが準備できていません。');
            return;
        }
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        const html5QrCode = new Html5Qrcode("qr-reader-div", { verbose: true });
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const formationName = file.name.replace(/\.[^/.]+$/, "");
            html5QrCode.scanFile(file)
                .then(decodedText => {
                    try {
                        if (!/^[0-9]+$/.test(decodedText) || decodedText.length < 100) {
                            throw new Error('無効なQRコード形式です。');
                        }
                        let pointer = 0;
                        const enemyQRID = decodedText.substring(pointer, pointer += 3);
                        const floor = parseInt(decodedText.substring(pointer, pointer += 2), 10);
                        
                        const megidoSlots = [];

                        for (let i = 0; i < 5; i++) {
                            const megidoQRID = decodedText.substring(pointer, pointer += 3);
                            if (megidoQRID === '999') {
                                megidoSlots.push(null);
                                pointer += 22; // Skip the rest of the empty slot
                                continue;
                            }
                            const ougiLevel = parseInt(decodedText.substring(pointer, pointer += 2), 10);
                            const singularityLevel = parseInt(decodedText.substring(pointer, pointer += 1), 10);
                            const levelChar = decodedText.substring(pointer, pointer += 1);
                            const reishouQRIDs = [];
                            for(let j=0; j<4; j++) {
                                reishouQRIDs.push(decodedText.substring(pointer, pointer += 3));
                            }
                            const specialReishou = decodedText.substring(pointer, pointer += 1) === '1';
                            const bondReishou = parseInt(decodedText.substring(pointer, pointer += 1), 10);
                            const orbQRID = decodedText.substring(pointer, pointer += 3);

                            const megidoId = idMaps.megido.newToOriginal.get(megidoQRID);
                            if (!megidoId) {
                                megidoSlots.push(null);
                                continue;
                            };

                            const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId);
                            if (!megidoMaster) {
                                megidoSlots.push(null);
                                continue;
                            };

                            const levelMap = {'0': 70, '1': 72, '2': 74, '3': 76, '4': 80};
                            const level = levelMap[levelChar] || 70;
                            
                            const orbId = idMaps.orb.newToOriginal.get(orbQRID);
                            const orbMaster = orbId ? COMPLETE_ORB_LIST.find(o => o.id === orbId) : null;

                            const reishouIds = reishouQRIDs
                                .map(rqid => (rqid === '999') ? null : idMaps.reishou.newToOriginal.get(rqid))
                                .filter(Boolean);

                            megidoSlots.push({
                                megidoId: megidoId,
                                orbId: orbId,
                                reishouIds: reishouIds,
                                megidoName: megidoMaster.名前,
                                megidoStyle: megidoMaster.スタイル || megidoMaster.style,
                                leaderSkill: megidoMaster.LS,
                                orbName: orbMaster ? orbMaster.name : '',
                            });

                            // Update global details
                            handleMegidoDetailChange(megidoId, 'level', level);
                            handleMegidoDetailChange(megidoId, 'ougiLevel', ougiLevel || 1);
                            handleMegidoDetailChange(megidoId, 'special_reishou', specialReishou);
                            handleMegidoDetailChange(megidoId, 'bond_reishou', bondReishou || 0);
                            if (megidoMaster.Singularity) {
                                handleMegidoDetailChange(megidoId, 'singularity_level', singularityLevel || 0);
                            }
                        }
                        const enemyName = idMaps.enemy.newToOriginal.get(enemyQRID);
                        const newFormation = {
                            id: `f${Date.now()}`,
                            name: formationName,
                            megidoSlots: megidoSlots,
                            tags: [],
                            notes: '',
                            enemyName: enemyName || null,
                            floor: floor || null
                        };
                        
                        const newFormations = { ...formations, [newFormation.id]: newFormation };
                        setFormations(newFormations);
                        localStorage.setItem('formations', JSON.stringify(newFormations));
                        showToastMessage('編成をインポートしました。');
                    } catch (error) {
                        console.error("QRコードの解析または編成の復元に失敗しました:", error);
                        showToastMessage('QRコードの読み取りに失敗しました。');
                    }
                })
                .catch(err => {
                    console.error(`QRコードのスキャンに失敗しました。${err}`);
                    showToastMessage('QRコードのスキャンに失敗しました。');
                });
        };
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }, [formations, idMaps, showToastMessage, handleMegidoDetailChange]);

    const handleCreateFormationFromEnemy = useCallback((enemyName, floor) => {
        // This creates a temporary "in-memory" formation for the editor.
        // It still uses the old structure with full objects because the editor is built for it.
        // The conversion to the new format happens in handleSaveFormation.
        const newFormation = { 
            id: `f${Date.now()}`, 
            name: '', 
            megido: Array(5).fill(null), // Editor expects this
            tags: [], 
            notes: '' 
        };
        setEditingFormation(newFormation);
        setInitialTagTarget({ enemy: enemyName, floor: floor });
        if (mode === 'plan') {
            setPreviousScreen('combat_plan');
        } else {
            setPreviousScreen('action');
        }
        setActiveTab('formation');
    }, [mode, setActiveTab]);

    const [generatedImageData, setGeneratedImageData] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [tweetUrl, setTweetUrl] = useState('');

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

    const generateTweetText = useCallback((form) => {
        const baseUrl = 'https://twitter.com/intent/tweet';
        let text = '星間の塔\n';
        if (form.floor && form.enemyName) {
            const floorData = TOWER_MAP_DATA.find(f => f.floor === form.floor);
            if (floorData) {
                const square = Object.values(floorData.squares).find(s => s.enemies && s.enemies.includes(form.enemyName));
                const rules = square ? square.rules.join(", ") : '';
                text += `${form.floor}F：${rules} ${form.enemyName}\n`;
            }
        }
        text += '\n#メギド72 #星間の塔ツール';
        return `${baseUrl}?text=${encodeURIComponent(text)}`;
    }, []);

    const loadImage = useCallback((src) => new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    }), []);

    const handleGenerateShareImage = useCallback(async (form) => {
        showToastMessage('共有用画像を生成中です...');
        // rehydrateFormation は utils.js にあると仮定
        const rehydratedForm = rehydrateFormation(form, megidoDetails);

        setTweetUrl(generateTweetText(rehydratedForm));
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
        // encodeFormationToQrString は utils.js にあると仮定
        const qrString = encodeFormationToQrString(rehydratedForm, megidoDetails, idMaps);
        if (!qrString) {
            showToastMessage('QRコードの生成に失敗');
            console.error('[GenImg] QR string is empty. Aborting.');
            return;
        }
        new window.QRious({
            element: qrCanvas,
            value: qrString,
            size: 400,
            padding: 0
        });
        
        const imagePromises = [loadImage('asset/back.webp')];
        rehydratedForm.megido.forEach(m => imagePromises.push(m ? loadImage(`asset/メギド/${m.名前}.png`) : Promise.resolve(null)));
        // オーブの画像アセットが見つからないため、オーブの読み込みと描画を無効化
        // rehydratedForm.megido.forEach(m => imagePromises.push(m && m.orb ? loadImage(`asset/オーブ/${m.orb.name}.png`) : Promise.resolve(null)));
        const [bgImage, ...loadedImages] = await Promise.all(imagePromises);
        const megidoImages = loadedImages.slice(0, 5);
        // const orbImages = loadedImages.slice(5);

        if (bgImage) ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = COLORS.BG_HEADER;
        ctx.fillRect(0, 0, canvas.width, LAYOUT.HEADER_H);
        ctx.fillStyle = COLORS.BG_MAIN;
        ctx.fillRect(0, LAYOUT.HEADER_H, canvas.width, canvas.height - LAYOUT.HEADER_H);

        const qrPadding = 6;
        const qrBgSize = LAYOUT.QR_SIZE + qrPadding * 2;
        const qrBgX = canvas.width - qrBgSize - LAYOUT.PADDING;
        const qrBgY = 5;
        const qrX = qrBgX + qrPadding + 4;
        const qrY = qrBgY + qrPadding + 4;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(qrBgX, qrBgY, qrBgSize, qrBgSize);
        ctx.drawImage(qrCanvas, qrX, qrY, LAYOUT.QR_SIZE, LAYOUT.QR_SIZE);

        const leftColumnMaxWidth = 450;

        if (rehydratedForm.floor || rehydratedForm.enemyName) {
            const floorData = TOWER_MAP_DATA.find(f => f.floor === rehydratedForm.floor);
            const square = floorData ? Object.values(floorData.squares).find(s => s.enemies && s.enemies.includes(rehydratedForm.enemyName)) : null;
            const rules = square ? square.rules.join(", ") : '';

            const floorText = `${rehydratedForm.floor || '?'}F`;
            drawOutlinedText(ctx, floorText, LAYOUT.PADDING, LAYOUT.PADDING, { font: 'bold 42px "Noto Sans JP", sans-serif' });
            const floorWidth = ctx.measureText(floorText).width;
            drawOutlinedText(ctx, rehydratedForm.enemyName || 'N/A', LAYOUT.PADDING + floorWidth + 15, LAYOUT.PADDING + 10, { font: 'bold 32px "Noto Sans JP", sans-serif', maxWidth: leftColumnMaxWidth - floorWidth - 15 });
            drawOutlinedText(ctx, rules, LAYOUT.PADDING, LAYOUT.PADDING + 55, { font: '20px "Noto Sans JP", sans-serif', fillStyle: COLORS.TEXT_SUBTLE, textBaseline: 'top', maxWidth: leftColumnMaxWidth });
        } else {
            drawOutlinedText(ctx, rehydratedForm.name || '名称未設定の編成', LAYOUT.PADDING, LAYOUT.PADDING + 10, { font: 'bold 32px "Noto Sans JP", sans-serif', textBaseline: 'top', maxWidth: leftColumnMaxWidth });
        }

        if (rehydratedForm.notes) {
            const notesX = leftColumnMaxWidth + LAYOUT.PADDING * 2;
            const notesMaxWidth = canvas.width - notesX - qrBgSize - LAYOUT.PADDING * 3;
            const lineHeight = 22;
            let currentY = LAYOUT.PADDING;
            const lines = rehydratedForm.notes.split('\n');

            for (let i = 0; i < lines.length; i++) {
                if (i >= 4) break;
                const line = lines[i];
                drawOutlinedText(ctx, line, notesX, currentY, { font: '18px "Noto Sans JP", sans-serif', fillStyle: COLORS.TEXT_SUBTLE, textBaseline: 'top', maxWidth: notesMaxWidth });
                currentY += lineHeight;
            }
        }

        const cardW = 210;
        const cardH = 480;
        const cardY = LAYOUT.HEADER_H + 30;
        const cardTotalW = cardW * 5 + 25 * 4;
        const cardStartX = (canvas.width - cardTotalW) / 2;

        megidoImages.forEach((img, i) => {
            const megido = rehydratedForm.megido[i];
            if (!megido) return;
            const cardX = cardStartX + i * (cardW + 25);
            ctx.strokeStyle = COLORS.BORDER;
            ctx.lineWidth = 1;
            ctx.strokeRect(cardX, cardY, cardW, cardH);
            if (img) {
                ctx.drawImage(img, cardX + 15, cardY + 15, cardW - 30, cardW - 30);
            } else {
                drawOutlinedText(ctx, megido.名前, cardX + cardW / 2, cardY + 80, { textAlign: 'center', maxWidth: cardW - 20 });
            }
            let infoY = cardY + cardW - 20;
            drawOutlinedText(ctx, megido.名前, cardX + cardW / 2, infoY, { font: 'bold 24px "Noto Sans JP", sans-serif', textAlign: 'center', maxWidth: cardW - 20 });
            infoY += 30;

            const ougiText = `奥義Lv. ${megido.ougiLevel || 1}`;
            drawOutlinedText(ctx, ougiText, cardX + cardW / 2, infoY, { font: 'bold 22px "Noto Sans JP", sans-serif', textAlign: 'center', fillStyle: COLORS.ACCENT_GOLD });
            infoY += 30;
            if (megido.special_reishou) {
                drawOutlinedText(ctx, '☆ 専用霊宝', cardX + cardW / 2, infoY, { font: '18px "Noto Sans JP", sans-serif', textAlign: 'center' });
                infoY += 25;
            }
            if (megido.bond_reishou) {
                drawOutlinedText(ctx, `☆ 絆霊宝 Tier ${megido.bond_reishou}`, cardX + cardW / 2, infoY, { font: '18px "Noto Sans JP", sans-serif', textAlign: 'center' });
                infoY += 25;
            }
            if (megido.Singularity && megido.singularity_level > 0) {
                drawOutlinedText(ctx, `☆ 凸 ${megido.singularity_level}`, cardX + cardW / 2, infoY, { font: '18px "Noto Sans JP", sans-serif', textAlign: 'center' });
                infoY += 25;
            }
            infoY += 10;
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = COLORS.BORDER;
            ctx.fillRect(cardX + 10, infoY, cardW - 20, 1);
            ctx.globalAlpha = 1.0;
            infoY += 10;
            const orb = megido.orb;
            if (orb) {
                drawOutlinedText(ctx, orb.name, cardX + cardW / 2, infoY, { font: 'bold 20px "Noto Sans JP", sans-serif', textAlign: 'center', maxWidth: cardW - 20 });
                infoY += 30;
            }
            if (megido.reishou && megido.reishou.length > 0) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = COLORS.BORDER;
                ctx.fillRect(cardX + 10, infoY, cardW - 20, 1);
                ctx.globalAlpha = 1.0;
                infoY += 10;
                megido.reishou.forEach(r => {
                    drawOutlinedText(ctx, r.name, cardX + cardW / 2, infoY, { font: '16px "Noto Sans JP", sans-serif', textAlign: 'center', maxWidth: cardW - 20 });
                    infoY += 20;
                });
            }
        });
        setGeneratedImageData(canvas.toDataURL('image/png'));
        setShowShareModal(true);
    }, [showToastMessage, megidoDetails, idMaps, generateTweetText, loadImage]);

    return {
        formations,
        setFormations,
        editingFormation,
        setEditingFormation,
        initialTagTarget,
        setInitialTagTarget,
        previousScreen,
        setPreviousScreen,
        handleSaveFormation,
        handleSaveFormationMemo,
        handleDeleteFormation,
        handleCopyFormation,
        handleCreateFormationFromEnemy,
        handleGenerateShareImage,
        generatedImageData,
        showShareModal,
        setShowShareModal,
        tweetUrl,
        setTweetUrl,

    };
};
