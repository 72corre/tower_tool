const { useState, useCallback } = React;

/**
 * タグの数値を人間が読める文字列の配列にデコードします。
 * 1: 霊宝必須, 2: 絆霊宝必須, 4: 凸必須, 8: オーブキャスト不可
 * @param {number} tagValue - タグの合計値。
 * @returns {string[]} デコードされたタグ文字列の配列。
 */
const decodeFormationTags = (tagValue) => {
    if (!tagValue) return [];
    const tags = [];
    if (tagValue & 1) tags.push("霊宝必須");
    if (tagValue & 2) tags.push("絆霊宝必須");
    if (tagValue & 4) tags.push("凸必須");
    if (tagValue & 8) tags.push("オーブキャスト不可");
    return tags;
};

const useCommunityFormations = ({ formations, setFormations, showToastMessage, megidoDetails, idMaps, currentUser, unlockAchievement }) => {
    const [communityFormationsState, setCommunityFormationsState] = useState({ isOpen: false, floor: null, enemy: null, highlightId: null, initialFilter: '' });
    const [isPosting, setIsPosting] = useState(false);

    // --- モーダル開閉ハンドラ ---
    const handleOpenCommunityFormations = useCallback((floor = null, enemy = null, highlightId = null, initialFilter = '') => {
        setCommunityFormationsState({ isOpen: true, floor, enemy, highlightId, initialFilter });
    }, []);

    const handleCloseCommunityFormations = useCallback(() => {
        setCommunityFormationsState({ isOpen: false, floor: null, enemy: null, highlightId: null, initialFilter: '' });
    }, []);

    // --- 編成コピーハンドラ ---
    const handleCopyCommunityFormation = useCallback((formationToCopy) => {
        const newId = `f${Date.now()}`;
        const baseName = `(みんな) ${formationToCopy.name || '名称未設定'}`;

        let finalName = baseName;
        let counter = 1;
        while (Object.values(formations).some(f => f.name === finalName)) {
            counter++;
            finalName = `${baseName} (${counter})`;
        }

        const decodedTags = decodeFormationTags(formationToCopy.tagValue);

        let megidoSlots = [];
        let floors = [];
        try {
            const decodedText = formationToCopy.qrString;
            if (!decodedText) {
                throw new Error('QRコード文字列がありません。');
            }

            let pointer = 0;
            if (decodedText.startsWith('2') && decodedText.length > 125) { // V2 format
                pointer = 1; // Skip version '2'
                const enemyQRID = decodedText.substring(pointer, pointer += 3);
                const floorCount = parseInt(decodedText.substring(pointer, pointer += 1), 10);
                for (let i = 0; i < floorCount; i++) {
                    floors.push(parseInt(decodedText.substring(pointer, pointer += 2), 10));
                }
            } else { // V1 format
                const enemyQRID = decodedText.substring(pointer, pointer += 3);
                const floor = parseInt(decodedText.substring(pointer, pointer += 2), 10);
                if (!isNaN(floor)) floors.push(floor);
            }

            // Shared party data parsing logic
            for (let i = 0; i < 5; i++) {
                const megidoQRID = decodedText.substring(pointer, pointer += 3);
                if (megidoQRID === '999') {
                    megidoSlots.push(null);
                    pointer += 21; // Skip the rest of the empty slot data
                    continue;
                }
                const ougiLevel = parseInt(decodedText.substring(pointer, pointer += 2), 10);
                const singularityLevel = parseInt(decodedText.substring(pointer, pointer += 1), 10);
                const levelChar = decodedText.substring(pointer, pointer += 1);
                const reishouQRIDs = [
                    decodedText.substring(pointer, pointer += 3),
                    decodedText.substring(pointer, pointer += 3),
                    decodedText.substring(pointer, pointer += 3),
                    decodedText.substring(pointer, pointer += 3)
                ];
                const specialReishou = decodedText.substring(pointer, pointer += 1) === '1';
                const bondReishou = parseInt(decodedText.substring(pointer, pointer += 1), 10);
                const orbQRID = decodedText.substring(pointer, pointer += 3);

                const megidoId = idMaps.megido.newToOriginal.get(String(megidoQRID));
                const megidoMaster = megidoId ? COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId) : null;
                if (!megidoMaster) { megidoSlots.push(null); continue; }

                const levelMap = {'0': 70, '1': 72, '2': 74, '3': 76, '4': 80};
                const orbId = idMaps.orb.newToOriginal.get(orbQRID);
                const orbMaster = orbId ? COMPLETE_ORB_LIST.find(o => o.id === orbId) : null;
                const reishouIds = reishouQRIDs.map(rqid => (rqid === '999') ? null : idMaps.reishou.newToOriginal.get(rqid)).filter(Boolean);

                megidoSlots.push({
                    megidoId, orbId, reishouIds,
                    megidoName: megidoMaster.名前, megidoStyle: megidoMaster.スタイル || megidoMaster.style, leaderSkill: megidoMaster.LS,
                    orbName: orbMaster ? orbMaster.name : '', level: levelMap[levelChar] || 70, ougiLevel, special_reishou: specialReishou, bond_reishou: bondReishou, singularity_level: singularityLevel,
                });
            }

        } catch (error) {
            console.error("QRコードの解析または編成の復元に失敗しました:", error);
            showToastMessage('編成のコピーに失敗しました。QRコードの解析エラー。', 'error');
            return;
        }

        const newTags = new Map();

        (megidoSlots || []).forEach(slot => {
            if (slot && slot.megidoName) {
                newTags.set(slot.megidoName, { text: slot.megidoName, category: 'megido' });
            }
        });

        if (formationToCopy.enemyName) {
            newTags.set(formationToCopy.enemyName, { text: formationToCopy.enemyName, category: 'enemy' });
        }

        (floors || []).forEach(floor => {
            const tagText = `${floor}F`;
            newTags.set(tagText, { text: tagText, category: 'floor' });
        });

        const existingTags = [...new Set([...(formationToCopy.tags || []), ...decodedTags])];
        existingTags.forEach(tagText => {
            const trimmedText = tagText.trim();
            if (trimmedText && !newTags.has(trimmedText)) {
                const { category } = getTagInfo(trimmedText);
                newTags.set(trimmedText, { text: trimmedText, category: category });
            }
        });

        const newFormation = {
            id: newId,
            name: finalName,
            megidoSlots: megidoSlots,
            tags: Array.from(newTags.values()),
            notes: formationToCopy.comment || '',
            enemyName: formationToCopy.enemyName || null,
            floors: floors.length > 0 ? floors : (formationToCopy.floor ? [formationToCopy.floor] : null),
            floor: floors.length > 0 ? floors[0] : (formationToCopy.floor || null),
            communityId: formationToCopy.id,
            qrString: formationToCopy.qrString,
        };
        
        const newFormations = { ...formations, [newId]: newFormation };
        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations));
        unlockAchievement('THANK_YOU');
        showToastMessage('編成を自分のリストにコピーしました。');
        handleCloseCommunityFormations();
    }, [formations, setFormations, showToastMessage, handleCloseCommunityFormations, idMaps]);

    // --- 編成投稿ハンドラ ---
    const handlePostFormation = useCallback(async ({ formation, tags, comment }) => {
        if (!currentUser) {
            showToastMessage('投稿するにはログインが必要です。', 'error');
            return;
        }
        if (!idMaps || !megidoDetails) {
            showToastMessage('データがロード中のため、まだ投稿できません。', 'error');
            return;
        }
        setIsPosting(true);
        try {
            const qrString = encodeFormationToQrString(formation, megidoDetails, idMaps);
            if (!qrString) {
                throw new Error('QR文字列の生成に失敗しました。');
            }

            const megidoIds = formation.megidoSlots.map(slot => slot ? slot.megidoId : null).filter(Boolean);
            const megidoNames = formation.megidoSlots
            .filter(slot => slot && slot.megidoId)
            .map(slot => {
                if (slot.megidoName) {
                    return slot.megidoName;
                }
                const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => m.id === slot.megidoId);
                return megidoMaster ? megidoMaster.名前 : '';
            });

            const decodedTags = decodeFormationTags(tags);
            const searchableContent = [
                ...megidoNames,
                formation.enemyName,
                comment,
                ...decodedTags
            ].filter(Boolean);
            const searchText = searchableContent.flatMap(text => {
                const cleanText = String(text).trim();
                const katakanaText = hiraganaToKatakana(cleanText);
                const hiraganaText = katakanaToHiragana(cleanText);
                return [...new Set([katakanaText, hiraganaText])].filter(Boolean);
            });

            const dataToPost = {
                qrString: qrString,
                tagValue: tags,
                comment: comment,
                floor: Array.isArray(formation.floors) ? formation.floors[0] : formation.floor,
                floors: formation.floors || (formation.floor ? (Array.isArray(formation.floor) ? formation.floor : [formation.floor]) : []),
                enemyName: formation.enemyName,
                megidoIds: megidoIds,
                megidoNames: megidoNames,
                authorId: currentUser.uid,
                authorName: currentUser.displayName,
                authorPhotoURL: currentUser.photoURL,
                searchText: searchText, // 検索用フィールド
            };

            const newDocId = await postCommunityFormation(dataToPost);
            if (newDocId) {
                unlockAchievement('COURAGEOUS_POST');
                showToastMessage('編成を投稿しました！');
                // TODO: 投稿後にリストを再読み込みする
            } else {
                throw new Error('データベースへの保存に失敗しました。');
            }
        } catch (error) {
            console.error("投稿エラー:", error);
            showToastMessage(`投稿に失敗しました: ${error.message}`, 'error');
        } finally {
            setIsPosting(false);
        }
    }, [idMaps, megidoDetails, showToastMessage, currentUser]);

    const handleDeleteCommunityFormation = useCallback(async (formationToDelete) => {
        if (!currentUser) {
            showToastMessage('削除するにはログインが必要です。', 'error');
            return;
        }
        if (currentUser.uid !== formationToDelete.authorId) {
            showToastMessage('自分の投稿のみ削除できます。', 'error');
            return;
        }

        if (window.confirm('この投稿を削除します。よろしいですか？この操作は元に戻せません。')) {
            const success = await deleteCommunityFormation(formationToDelete.id);
            if (success) {
                showToastMessage('投稿を削除しました。');
                // UIから即時反映させるため、親コンポーネントでの再フェッチが必要
                // ここではモーダルを閉じることで、再オープン時の再フェッチを促す
                handleCloseCommunityFormations();
            } else {
                showToastMessage('削除に失敗しました。', 'error');
            }
        }
    }, [currentUser, showToastMessage, handleCloseCommunityFormations]);

    return {
        communityFormationsState,
        isPosting,
        handleOpenCommunityFormations,
        handleCloseCommunityFormations,
        handleCopyCommunityFormation,
        handlePostFormation,
        handleDeleteCommunityFormation,
    };
};