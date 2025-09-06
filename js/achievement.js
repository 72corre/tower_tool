const ACHIEVEMENTS = {
    // --- Simple State-Based Achievements ---
    'FIRST_FORMATION': {
        id: 'FIRST_FORMATION',
        name: '最初の編成',
        description: '初めての編成を保存する。',
        type: 'public',
        condition: (data) => data.formations && data.formations.length >= 1
    },
    'TEN_FORMATIONS': {
        id: 'TEN_FORMATIONS',
        name: '編成の達人',
        description: '合計10個の編成を保存する。',
        type: 'public',
        condition: (data) => data.formations && data.formations.length >= 10
    },
    'MEGIDO_72': {
        id: 'MEGIDO_72',
        name: 'メギド72',
        description: '72種類以上のメギドを所持する。',
        type: 'public',
        condition: (data) => data.ownedMegidoIds && data.ownedMegidoIds.size >= 72
    },
    'PLAN_ALL_SQUARES': {
        id: 'PLAN_ALL_SQUARES',
        name: '大いなる意思',
        description: 'すべてのマスを計画モードで計画した状態にする。',
        type: 'secret',
        condition: (data) => {
            if (!data.planState || typeof TOWER_MAP_DATA === 'undefined') return false;
            const allSquares = new Set();
            TOWER_MAP_DATA.forEach(floor => {
                Object.keys(floor.squares).forEach(squareId => {
                    if (floor.squares[squareId].type !== 'start') {
                        allSquares.add(`${floor.floor}-${squareId}`);
                    }
                });
            });

            const plannedCombat = Object.keys(data.planState.assignments || {});
            const plannedExplore = Object.keys(data.planState.explorationAssignments || {}).map(sid => `${sid.split('-')[0].replace('f','')}-${sid}`);

            const allPlanned = new Set([...plannedCombat, ...plannedExplore]);

            for (const square of allSquares) {
                if (!allPlanned.has(square)) {
                    return false;
                }
            }
            return true;
        }
    },

    // --- Counter-Based Achievements ---
    'WIN_STREAK_27': {
        id: 'WIN_STREAK_27',
        name: '不敗神話の貴公子',
        description: '実戦モードで敗北/リタイアすることなく２７回連続で勝利を選択する。',
        type: 'secret',
        condition: (data) => data.winStreak >= 27
    },
    'WIN_STREAK_72': {
        id: 'WIN_STREAK_72',
        name: '７２戦錬磨の覇者',
        description: '実戦モードで敗北/リタイアすることなく７２回連続で勝利を選択する。',
        type: 'secret',
        condition: (data) => data.winStreak >= 72
    },
    'CLEAR_10F_1': { id: 'CLEAR_10F_1', name: '星間の挑戦者', description: '初めて星間の塔10Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['10'] || 0) >= 1 },
    'CLEAR_20F_1': { id: 'CLEAR_20F_1', name: '塔に挑みし者', description: '初めて星間の塔20Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['20'] || 0) >= 1 },
    'CLEAR_30F_1': { id: 'CLEAR_30F_1', name: '星間の開拓者', description: '初めて星間の塔30Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['30'] || 0) >= 1 },
    'CLEAR_10F_2': { id: 'CLEAR_10F_2', name: '星海の冒険者', description: '合計２回、星間の塔10Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['10'] || 0) >= 2 },
    'CLEAR_20F_2': { id: 'CLEAR_20F_2', name: '星の海に挑みし者', description: '合計２回、星間の塔20Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['20'] || 0) >= 2 },
    'CLEAR_30F_2': { id: 'CLEAR_30F_2', name: '星海の開拓者', description: '合計２回、星間の塔30Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['30'] || 0) >= 2 },
    'CLEAR_10F_3': { id: 'CLEAR_10F_3', name: '煌めきの冒険者', description: '合計３回、星間の塔10Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['10'] || 0) >= 3 },
    'CLEAR_20F_3': { id: 'CLEAR_20F_3', name: '星の荒野に挑みし者', description: '合計３回、星間の塔20Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['20'] || 0) >= 3 },
    'CLEAR_30F_3': { id: 'CLEAR_30F_3', name: '星界の先駆者', description: '合計３回、星間の塔30Fをクリアする。', type: 'public', condition: (data) => (data.floorClearCounts['30'] || 0) >= 3 },
    'CLEAR_35F_72': { id: 'CLEAR_35F_72', name: 'Someday,again...', description: '合計７２回、星間の塔３５Ｆをクリアする。', type: 'private', condition: (data) => (data.floorClearCounts['35'] || 0) >= 72 },
    'TOGGLE_THEME_72': { id: 'TOGGLE_THEME_72', name: '光と闇', description: '72回、ライトモードとダークモードを切り替える。', type: 'secret', condition: (data) => data.themeToggleCount >= 72 },
    'DATA_IO_7': { id: 'DATA_IO_7', name: '「どこか」へ、旅立つ', description: '合計で７回データ管理でエクスポート・インポートを行う。', type: 'secret', condition: (data) => data.dataManagementCount >= 7 },

    // --- Event-Based Achievements (unlocked directly, no condition function needed here) ---
    'APP_START': {
        id: 'APP_START',
        name: '無名の少年',
        description: 'アプリを起動する。',
        type: 'public'
    },
    'RESET_RUN': {
        id: 'RESET_RUN',
        name: 'やり直し',
        description: '実践モードの進行をリセットする。',
        type: 'secret'
    },
    'DEBUG': {
        id: 'DEBUG',
        name: 'デバッグ',
        description: '開発者コンソールを開く。',
        type: 'private'
    }
};