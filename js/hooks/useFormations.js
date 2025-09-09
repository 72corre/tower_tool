const useFormations = ({ showToastMessage, idMaps, setDisplayedEnemy, setActiveTab, setPracticeView, mode, handleMegidoDetailChange }) => {
    const { useState, useCallback } = React;

    const [formations, setFormations] = useState(() => {
        const saved = localStorage.getItem('formations');
        return saved ? JSON.parse(saved) : [];
    });
    const [editingFormation, setEditingFormation] = useState(null);
    const [initialTagTarget, setInitialTagTarget] = useState(null);
    const [previousScreen, setPreviousScreen] = useState('map');

    const handleSaveFormation = useCallback((formationToSave, targetScreen) => {
        const index = formations.findIndex(f => f.id === formationToSave.id);
        const newFormations = index > -1 ? formations.map(f => f.id === formationToSave.id ? formationToSave : f) : [...formations, formationToSave];
        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations));
        setEditingFormation(null); // Go back to manager view
        setInitialTagTarget(null); // Clear target
        showToastMessage('編成を保存しました。');
    }, [formations, showToastMessage]);

    const handleSaveFormationMemo = useCallback((formationId, newNotes) => {
        if (!formationId) return;
        const newFormations = formations.map(f => {
            if (f.id === formationId) {
                return { ...f, notes: newNotes };
            }
            return f;
        });
        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations));
        showToastMessage('編成メモを更新しました。');
    }, [formations, showToastMessage]);

    const handleDeleteFormation = useCallback((formationId) => {
        if (window.confirm('この編成を本当に削除しますか？')) {
            const newFormations = formations.filter(f => f.id !== formationId);
            setFormations(newFormations);
            localStorage.setItem('formations', JSON.stringify(newFormations));
            showToastMessage('編成を削除しました。');
        }
    }, [formations, showToastMessage]);

    const handleCopyFormation = useCallback((formationToCopy) => {
        const newFormation = { ...JSON.parse(JSON.stringify(formationToCopy)), id: `f${Date.now()}`, name: `${formationToCopy.name} (コピー)` };
        setFormations([...formations, newFormation]);
        localStorage.setItem('formations', JSON.stringify([...formations, newFormation]));
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
                        const newMegidoList = [];
                        for (let i = 0; i < 5; i++) {
                            const megidoQRID = decodedText.substring(pointer, pointer += 3);
                            if (megidoQRID === '999') {
                                newMegidoList.push(null);
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
                            if (!megidoId) continue;

                            let megidoData = COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId);
                            if (!megidoData) continue;

                            megidoData = JSON.parse(JSON.stringify(megidoData));

                            const levelMap = {'0': 70, '1': 72, '2': 74, '3': 76, '4': 80};
                            megidoData.level = levelMap[levelChar] || 70;
                            megidoData.ougiLevel = ougiLevel || 1;
                            megidoData.special_reishou = specialReishou;
                            megidoData.bond_reishou = bondReishou || 0;
                            megidoData.singularity_level = singularityLevel || 0;

                            const orbId = idMaps.orb.newToOriginal.get(orbQRID);
                            megidoData.orb = orbId ? COMPLETE_ORB_LIST.find(o => o.id === orbId) : null;

                            megidoData.reishou = reishouQRIDs
                                .map(rqid => {
                                    if (rqid === '999') return null;
                                    const reishouId = idMaps.reishou.newToOriginal.get(rqid);
                                    return reishouId ? COMPLETE_REISHOU_LIST.find(r => r.id === reishouId) : null;
                                })
                                .filter(Boolean);

                            newMegidoList.push(megidoData);

                            // Update global details
                            handleMegidoDetailChange(megidoId, 'level', levelMap[levelChar] || 70);
                            handleMegidoDetailChange(megidoId, 'ougiLevel', ougiLevel || 1);
                            handleMegidoDetailChange(megidoId, 'special_reishou', specialReishou);
                            handleMegidoDetailChange(megidoId, 'bond_reishou', bondReishou || 0);
                            if (megidoData.Singularity) {
                                handleMegidoDetailChange(megidoId, 'singularity_level', singularityLevel || 0);
                            }
                        }
                        const enemyName = idMaps.enemy.newToOriginal.get(enemyQRID);
                        const newFormation = {
                            id: `f${Date.now()}`,
                            name: formationName,
                            megido: newMegidoList,
                            tags: [],
                            notes: '',
                            enemyName: enemyName || null,
                            floor: floor || null
                        };
                        const newFormations = [...formations, newFormation];
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
        const newFormation = { id: `f${Date.now()}`, name: '', megido: Array(5).fill(null), tags: [], notes: '' };
        setEditingFormation(newFormation);
        setInitialTagTarget({ enemy: enemyName, floor: floor });
        if (mode === 'plan') {
            setPreviousScreen('combat_plan');
        } else {
            setPreviousScreen('action');
        }
        setActiveTab('formation'); // Always switch to formation tab
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