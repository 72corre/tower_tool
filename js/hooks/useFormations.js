const useFormations = ({ showToastMessage, idMaps, setDisplayedEnemy, setActiveTab, setPracticeView, mode, handleMegidoDetailChange }) => {
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
        const newFormation = { 
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
        const html5QrCode = new Html5Qrcode("qr-reader-div");
        fileInput.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            const formationName = file.name.replace(/\.[^/.]+$/, "");
            html5QrCode.scanFile(file, true)
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
                                pointer += 21; // Skip the rest of the empty slot
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
        handleImportFormation,
        handleCreateFormationFromEnemy
    };
};
