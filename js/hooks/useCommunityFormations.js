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

const useCommunityFormations = ({ formations, setFormations, showToastMessage, megidoDetails, idMaps, currentUser, generateTagsForFormation }) => {
    const [communityFormationsState, setCommunityFormationsState] = useState({ isOpen: false, floor: null, enemy: null, highlightId: null });
    const [isPosting, setIsPosting] = useState(false);

    // --- モーダル開閉ハンドラ ---
    const handleOpenCommunityFormations = useCallback((floor = null, enemy = null, highlightId = null) => {
        setCommunityFormationsState({ isOpen: true, floor, enemy, highlightId });
    }, []);

    const handleCloseCommunityFormations = useCallback(() => {
        setCommunityFormationsState({ isOpen: false, floor: null, enemy: null, highlightId: null });
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

        // QR文字列をデコードしてmegidoSlotsを再構築
        let megidoSlots = [];
        try {
            const decodedText = formationToCopy.qrString;
            if (!decodedText || !/^[0-9]+$/.test(decodedText) || decodedText.length < 125) { // 5 + 24*5 = 125
                throw new Error('無効なQRコード形式です。');
            }

            let pointer = 5; // enemyQRID(3) + floor(2)
            const slotLength = 24;

            for (let i = 0; i < 5; i++) {
                if (pointer + slotLength > decodedText.length) break;

                const slotText = decodedText.substring(pointer, pointer + slotLength);
                const megidoQRID = slotText.substring(0, 3);

                if (megidoQRID === '999') {
                    megidoSlots.push(null);
                } else {
                    const ougiLevel = parseInt(slotText.substring(3, 5), 10);
                    const singularityLevel = parseInt(slotText.substring(5, 6), 10);
                    const levelChar = slotText.substring(6, 7);
                    const reishouQRIDs = [
                        slotText.substring(7, 10),
                        slotText.substring(10, 13),
                        slotText.substring(13, 16),
                        slotText.substring(16, 19)
                    ];
                    const specialReishou = slotText.substring(19, 20) === '1';
                    const bondReishou = parseInt(slotText.substring(20, 21), 10);
                    const orbQRID = slotText.substring(21, 24);

                    const megidoId = idMaps.megido.newToOriginal.get(String(megidoQRID));
                    if (!megidoId) {
                        megidoSlots.push(null);
                        pointer += slotLength;
                        continue;
                    };

                    const megidoMaster = COMPLETE_MEGIDO_LIST.find(m => m.id === megidoId);
                    if (!megidoMaster) {
                        megidoSlots.push(null);
                        pointer += slotLength;
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
                        level: level,
                        ougiLevel: ougiLevel,
                        special_reishou: specialReishou,
                        bond_reishou: bondReishou,
                        singularity_level: singularityLevel,
                    });
                }
                pointer += slotLength;
            }
        } catch (error) {
            console.error("QRコードの解析または編成の復元に失敗しました:", error);
            showToastMessage('編成のコピーに失敗しました。QRコードの解析エラー。', 'error');
            return;
        }

        const newFormation = {
            id: newId,
            name: finalName,
            megidoSlots: megidoSlots, // デコードしたmegidoSlotsを使用
            tags: [...new Set([...(formationToCopy.tags || []), ...decodedTags])],
            notes: formationToCopy.comment || '', // コメントをnotesとして引き継ぐ
            enemyName: formationToCopy.enemyName || null,
            floor: formationToCopy.floor || null,
            communityId: formationToCopy.id,
            qrString: formationToCopy.qrString, // QR文字列も保存しておく
        };

        newFormation.tags = generateTagsForFormation(newFormation);
        
        const newFormations = { ...formations, [newId]: newFormation };
        setFormations(newFormations);
        localStorage.setItem('formations', JSON.stringify(newFormations)); // ★ この行を追加して保存
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
                const katakanaText = hiraganaToKatakana(String(text)).toLowerCase();
                const hiraganaText = katakanaToHiragana(String(text)).toLowerCase();
                return [...new Set([katakanaText, hiraganaText])];
            });

            const dataToPost = {
                qrString: qrString,
                tagValue: tags,
                comment: comment,
                floor: formation.floor,
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
        handleDeleteCommunityFormation, // ★ 追加
    };
};