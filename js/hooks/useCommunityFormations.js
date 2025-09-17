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

const useCommunityFormations = ({ formations, setFormations, showToastMessage, megidoDetails, idMaps }) => {
    // 「みんなの編成」モーダルの開閉状態と初期フィルタ
    const [communityFormationsState, setCommunityFormationsState] = useState({ isOpen: false, floor: null, enemy: null });
    const [isPosting, setIsPosting] = useState(false);

    // --- モーダル開閉ハンドラ ---
    const handleOpenCommunityFormations = useCallback((floor = null, enemy = null) => {
        setCommunityFormationsState({ isOpen: true, floor, enemy });
    }, []);

    const handleCloseCommunityFormations = useCallback(() => {
        setCommunityFormationsState({ isOpen: false, floor: null, enemy: null });
    }, []);

    // --- 編成コピーハンドラ ---
    const handleCopyCommunityFormation = useCallback((formationToCopy) => {
        const newId = `f${Date.now()}`;
        const baseName = `(みんな) ${formationToCopy.name || '名称未設定'}`;

        // 重複名がないかチェックし、あれば連番を付与
        let finalName = baseName;
        let counter = 1;
        while (Object.values(formations).some(f => f.name === finalName)) {
            counter++;
            finalName = `${baseName} (${counter})`;
        }

        // タグの数値をデコードして、新しい編成のtagsプロパティに追加
        const decodedTags = decodeFormationTags(formationToCopy.tagValue);

        const newFormation = {
            ...formationToCopy, // 元の編成情報を引き継ぐ
            id: newId,
            name: finalName,
            tags: [...new Set([...(formationToCopy.tags || []), ...decodedTags])], // 既存タグと結合し重複を削除
            communityId: formationToCopy.id, // 評価機能のためにコピー元のIDを記録
        };
        
        // 不要な可能性のあるプロパティをクリーンアップ
        delete newFormation.tagValue;
        delete newFormation.ratings; // 評価データはコピーしない

        const newFormations = { ...formations, [newId]: newFormation };
        setFormations(newFormations);
        showToastMessage('編成を自分のリストにコピーしました。');
        handleCloseCommunityFormations();
    }, [formations, setFormations, showToastMessage, handleCloseCommunityFormations]);

    // --- 編成投稿ハンドラ ---
    const handlePostFormation = useCallback(async ({ formation, tags, comment }) => {
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
            const megidoNames = megidoIds.map(id => megidoDetails[id]?.name || '');

            const dataToPost = {
                qrString: qrString,
                tagValue: tags,
                comment: comment,
                floor: formation.floor,
                enemyName: formation.enemyName,
                megidoIds: megidoIds,
                megidoNames: megidoNames,
                // authorId: '...' // TODO: ユーザー認証を実装した場合
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
    }, [idMaps, megidoDetails, showToastMessage]);

    return {
        communityFormationsState,
        isPosting,
        handleOpenCommunityFormations,
        handleCloseCommunityFormations,
        handleCopyCommunityFormation,
        handlePostFormation,
    };
};