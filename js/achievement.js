const ACHIEVEMENTS = {
    // --- Simple State-Based Achievements ---
    'FIRST_FORMATION': {
        id: 'FIRST_FORMATION',
        name: '最初の編成',
        description: '初めての編成を保存する。',
        type: 'public',
        category: 'collection',
        condition: (data) => data.formations && Object.keys(data.formations).length >= 1
    },
    'TEN_FORMATIONS': {
        id: 'TEN_FORMATIONS',
        name: '編成の達人',
        description: '合計10個の編成を保存する。',
        type: 'public',
        category: 'collection',
        condition: (data) => data.formations && Object.keys(data.formations).length >= 10
    },
    'MEGIDO_72': {
        id: 'MEGIDO_72',
        name: 'メギド72',
        description: '72種類以上のメギドを所持する。',
        type: 'public',
        category: 'collection',
        condition: (data) => data.ownedMegidoIds && data.ownedMegidoIds.size >= 72
    },
    'PLAN_ALL_SQUARES': {
        id: 'PLAN_ALL_SQUARES',
        name: '大いなる意思',
        description: 'すべてのマスを計画モードで計画した状態にする。',
        type: 'secret',
        category: 'secret',
        condition: (data) => {
            if (!data.planState || !data.towerMapData || data.towerMapData.length === 0) return false;
            const allSquares = new Set();
            data.towerMapData.forEach(floor => {
                Object.keys(floor.squares).forEach(squareId => {
                    if (floor.squares[squareId].type !== 'start') {
                        allSquares.add(`${floor.floor}-${squareId}`);
                    }
                });
            });

            const plannedCombat = Object.keys(data.planState.assignments || {}).filter(key => {
                const assignmentsForSquare = data.planState.assignments[key];
                return Object.values(assignmentsForSquare).some(enemySlots => 
                    enemySlots.some(slot => slot !== null)
                );
            });

            const plannedExplore = Object.keys(data.planState.explorationAssignments || {}).filter(key => {
                const assignmentsForSquare = data.planState.explorationAssignments[key];
                return Object.values(assignmentsForSquare).some(party => party.some(megidoId => megidoId !== null));
            });

            const allPlanned = new Set([...plannedCombat, ...plannedExplore]);

            if (allSquares.size === 0) return false;

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
        category: 'secret',
        condition: (data) => data.winStreak >= 27
    },
    'WIN_STREAK_72': {
        id: 'WIN_STREAK_72',
        name: '７２戦錬磨の覇者',
        description: '実戦モードで敗北/リタイアすることなく７２回連続で勝利を選択する。',
        type: 'secret',
        category: 'secret',
        condition: (data) => data.winStreak >= 72
    },
    'CLEAR_10F_1': { id: 'CLEAR_10F_1', name: '星間の挑戦者', description: '初めて星間の塔10Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['10'] || 0) >= 1 },
    'CLEAR_20F_1': { id: 'CLEAR_20F_1', name: '塔に挑みし者', description: '初めて星間の塔20Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['20'] || 0) >= 1 },
    'CLEAR_30F_1': { id: 'CLEAR_30F_1', name: '星間の開拓者', description: '初めて星間の塔30Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['30'] || 0) >= 1 },
    'CLEAR_10F_2': { id: 'CLEAR_10F_2', name: '星海の冒険者', description: '合計２回、星間の塔10Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['10'] || 0) >= 2 },
    'CLEAR_20F_2': { id: 'CLEAR_20F_2', name: '星の海に挑みし者', description: '合計２回、星間の塔20Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['20'] || 0) >= 2 },
    'CLEAR_30F_2': { id: 'CLEAR_30F_2', name: '星海の開拓者', description: '合計２回、星間の塔30Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['30'] || 0) >= 2 },
    'CLEAR_10F_3': { id: 'CLEAR_10F_3', name: '煌めきの冒険者', description: '合計３回、星間の塔10Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['10'] || 0) >= 3 },
    'CLEAR_20F_3': { id: 'CLEAR_20F_3', name: '星の荒野に挑みし者', description: '合計３回、星間の塔20Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['20'] || 0) >= 3 },
    'CLEAR_30F_3': { id: 'CLEAR_30F_3', name: '星界の先駆者', description: '合計３回、星間の塔30Fをクリアする。', type: 'public', category: 'progress', condition: (data) => (data.floorClearCounts['30'] || 0) >= 3 },
    'CLEAR_35F_72': { id: 'CLEAR_35F_72', name: 'Someday,again...', description: '合計７２回、星間の塔３５Ｆをクリアする。', type: 'private', category: 'secret', condition: (data) => (data.floorClearCounts['35'] || 0) >= 72 },
    'TOGGLE_THEME_72': { id: 'TOGGLE_THEME_72', name: '光と闇', description: '72回、ライトモードとダークモードを切り替える。', type: 'secret', category: 'secret', condition: (data) => data.themeToggleCount >= 72 },
    'DATA_IO_7': { id: 'DATA_IO_7', name: '「どこか」へ、旅立つ', description: '合計で７回データ管理でエクスポート・インポートを行う。', type: 'secret', category: 'secret', condition: (data) => data.dataManagementCount >= 7 },

    // --- Event-Based Achievements ---
    'APP_START': { id: 'APP_START', name: '無名の少年', description: 'アプリを起動する。', type: 'public', category: 'progress' },
    'RESET_RUN': { id: 'RESET_RUN', name: 'やり直し', description: '実践モードの進行をリセットする。', type: 'secret', category: 'secret' },
    'BETA_TESTER': { id: 'BETA_TESTER', name: 'ベータテスター', description: 'オープンβテストに参加する。', type: 'private', category: 'secret' },
    'SUPPORT_ITACHI': { id: 'SUPPORT_ITACHI', name: 'いたち応援！', description: 'ベータテスト用報告フォームから開発者を応援する。', type: 'private', category: 'secret' },
    'BIRTHDAY_TWEET': { id: 'BIRTHDAY_TWEET', name: '生まれてきてくれてありがとう', description: '誕生日をお祝いするツイートを投稿する。', type: 'secret', category: 'secret' },
    'FIRST_SEASON': { id: 'FIRST_SEASON', name: '最初のシーズン', description: '初めてシーズンを終える', type: 'public', category: 'progress' },
    'BE_PREPARED': { id: 'BE_PREPARED', name: '備えあれば憂いなし', description: '初めてデータのエクスポートを行う', type: 'public', category: 'feature' },
    'BEYOND_TIME': { id: 'BEYOND_TIME', name: '時を超えて', description: 'データをインポートして復帰する', type: 'public', category: 'feature' },
    'CROSS_DIMENSIONAL_FORMATION': { id: 'CROSS_DIMENSIONAL_FORMATION', name: '次元を超えた編成', description: '初めてQRコードで編成をエクスポート/インポートする', type: 'public', category: 'feature' },
    'WELCOME_TO_THE_DARK_SIDE': { id: 'WELCOME_TO_THE_DARK_SIDE', name: 'ダークサイドへようこそ', description: '初めてダークモードに切り替える', type: 'public', category: 'feature' },
    'AUTO_ASSIGN_DEBUT': { id: 'AUTO_ASSIGN_DEBUT', name: 'おまかせデビュー', description: '初めておまかせ探索を利用する', type: 'public', category: 'feature' },
    'COURAGEOUS_POST': { id: 'COURAGEOUS_POST', name: '勇気ある投稿', description: '初めて編成をコミュニティに投稿する', type: 'public', category: 'feature' },
    'THANK_YOU': { id: 'THANK_YOU', name: 'ありがとう！', description: '他のユーザーの編成をコピーする', type: 'public', category: 'feature' },

    // --- New Simple Achievements ---
    'SEASON_CHALLENGER': { id: 'SEASON_CHALLENGER', name: 'シーズンチャレンジャー', description: '3シーズン連続で挑戦する', type: 'public', category: 'progress', condition: (data) => data.seasonLogs && data.seasonLogs.length >= 3 },
    'SEASON_MASTER': { id: 'SEASON_MASTER', name: 'シーズンマスター', description: '12シーズン（1年間）挑戦する', type: 'public', category: 'progress', condition: (data) => data.seasonLogs && data.seasonLogs.length >= 12 },
    'FORMATION_COLLECTOR': { id: 'FORMATION_COLLECTOR', name: '編成コレクター', description: '50個の編成を保存する', type: 'public', category: 'collection', condition: (data) => data.formations && Object.keys(data.formations).length >= 50 },
    'FORMATION_MANIAC': { id: 'FORMATION_MANIAC', name: '編成マニア', description: '100個の編成を保存する', type: 'public', category: 'collection', condition: (data) => data.formations && Object.keys(data.formations).length >= 100 },
    'TAG_MASTER': { id: 'TAG_MASTER', name: 'タグマスター', description: '1つの編成に10個以上のタグを付ける', type: 'public', category: 'collection', condition: (data) => data.formations && Object.values(data.formations).some(f => f.tags && f.tags.length >= 10) },
    'MEMO_DEMON': { id: 'MEMO_DEMON', name: 'メモ魔', description: '10個の編成にメモを記入する', type: 'public', category: 'collection', condition: (data) => data.formations && Object.values(data.formations).filter(f => f.notes && f.notes.trim() !== '').length >= 10 },
    'PLANNED_CRIME': { id: 'PLANNED_CRIME', name: '計画的犯行', description: '初めて計画モードでパーティを割り当てる', type: 'public', category: 'feature', condition: (data) => data.planState && (Object.keys(data.planState.assignments || {}).length > 0 || Object.keys(data.planState.explorationAssignments || {}).length > 0) },
    'EXPLORER': { id: 'EXPLORER', name: 'エクスプローラー', description: '1シーズンで探索マスを10回以上クリアする', type: 'public', category: 'progress', condition: (data) => data.runState && data.runState.history && data.runState.history.filter(h => h.type === 'explore').length >= 10 },
    'BATTLE_JUNKIE': { id: 'BATTLE_JUNKIE', name: 'バトルジャンキー', description: '1シーズンで戦闘マスを100回以上クリアする', type: 'public', category: 'progress', condition: (data) => data.runState && data.runState.history && data.runState.history.filter(h => h.type === 'battle').length >= 100 },
    'EFFICIENCY_IS_KEY': { id: 'EFFICIENCY_IS_KEY', name: '効率重視', description: 'おまかせ探索の結果を10回採用する', type: 'public', category: 'feature', condition: (data) => data.autoAssignUseCount >= 10 },
    'SEARCH_MASTER': { id: 'SEARCH_MASTER', name: '検索の達人', description: 'マップ検索機能を5回利用する', type: 'public', category: 'feature', condition: (data) => data.mapSearchCount >= 5 },
    'THANKS_TO_THE_DEV': { id: 'THANKS_TO_THE_DEV', name: '開発者に感謝', description: '「このアプリについて」のページを5回開く', type: 'secret', category: 'secret', condition: (data) => data.aboutPageOpenCount >= 5 },

    // --- Unique Formations ---
    'GIRLS_NIGHT_OUT': {
        id: 'GIRLS_NIGHT_OUT',
        name: '今度みんなで女子会開こうよ',
        description: 'リリムとサキュバスとアガリアレプトを同時に編成する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.formations) return false;
            const requiredMegidoGroups = [ ['真01_リリム', '真01_リリムR'], ['真03_サキュバス', '真03_サキュバスB'], ['真38_アガリアレプト', '真38_アガリアレプトR'] ];
            return Object.values(data.formations).some(formation => {
                const formationMegidoIds = new Set(formation.megidoSlots.map(slot => slot && slot.megidoId).filter(Boolean));
                return requiredMegidoGroups.every(group => group.some(id => formationMegidoIds.has(id)));
            });
        }
    },
    'FOUR_KINGS_OF_FORMOUTH': {
        id: 'FOUR_KINGS_OF_FORMOUTH',
        name: 'フォルマウスの４冥王',
        description: 'ガープとアマイモンとジニマルとコルソンを同時に編成する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.formations) return false;
            const requiredMegidoGroups = [ ['祖33_ガープ', '祖33_ガープR'], ['真41_アマイモン', '真41_アマイモンR'], ['真12_ジニマル', '真12_ジニマルR'], ['真11_コルソン', '真11_コルソンR'] ];
            return Object.values(data.formations).some(formation => {
                const formationMegidoIds = new Set(formation.megidoSlots.map(slot => slot && slot.megidoId).filter(Boolean));
                return requiredMegidoGroups.every(group => group.some(id => formationMegidoIds.has(id)));
            });
        }
    },
    'SAKE': {
        id: 'SAKE',
        name: 'SAKE！',
        description: 'メフィストとインキュバスとカスピエルを同時に編成する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.formations) return false;
            const requiredMegidoGroups = [ ['真36_メフィスト', '真36_メフィストC'], ['真09_インキュバス', '真09_インキュバスC'], ['真22_カスピエル', '真22_カスピエルC'] ];
            return Object.values(data.formations).some(formation => {
                const formationMegidoIds = new Set(formation.megidoSlots.map(slot => slot && slot.megidoId).filter(Boolean));
                return requiredMegidoGroups.every(group => group.some(id => formationMegidoIds.has(id)));
            });
        }
    },
    'DAD_AND_MOM': {
        id: 'DAD_AND_MOM',
        name: 'おとーさんとおかーさん',
        description: 'リヴァイアサンとエウリノームを同時に編成する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.formations) return false;
            const requiredMegido = ['真21_リヴァイアサン', '宵03_エウリノーム'];
            return Object.values(data.formations).some(formation => {
                const formationMegidoIds = new Set(formation.megidoSlots.map(slot => slot && slot.megidoId).filter(Boolean));
                return requiredMegido.every(id => formationMegidoIds.has(id));
            });
        }
    },
    'PARADISE_LOST': {
        id: 'PARADISE_LOST',
        name: '昼と夜の失楽園',
        description: 'サタンとベルゼブフを同時に編成する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.formations) return false;
            const requiredMegido = ['宵05_サタン', '宵04_ベルゼブフ'];
            return Object.values(data.formations).some(formation => {
                const formationMegidoIds = new Set(formation.megidoSlots.map(slot => slot && slot.megidoId).filter(Boolean));
                return requiredMegido.every(id => formationMegidoIds.has(id));
            });
        }
    },
    'BUNE_AUTO_EXPLORE': { id: 'BUNE_AUTO_EXPLORE', name: 'ブネ、頼めるか', description: 'おまかせ探索でブネを選ぶ', type: 'secret', category: 'secret' },
    'PRIDE_OF_THE_72': {
        id: 'PRIDE_OF_THE_72',
        name: '祖メギドの誇り',
        description: '祖メギドのみで編成を組んで勝利する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            return data.runState.history.some(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.length > 0 && h.megido.every(id => id.startsWith('祖'))
            );
        }
    },
    'WILL_OF_THE_TRUE': {
        id: 'WILL_OF_THE_TRUE',
        name: '真メギドの意志',
        description: '真メギドのみで編成を組んで勝利する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            return data.runState.history.some(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.length > 0 && h.megido.every(id => id.startsWith('真'))
            );
        }
    },
    'FLIGHT_SQUAD': {
        id: 'FLIGHT_SQUAD',
        name: '飛行部隊',
        description: '飛行特性を持つメギドのみで編成を組んで勝利する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history || !data.megidoList) return false;
            return data.runState.history.some(h => {
                if (h.type !== 'battle' || h.result !== 'win' || h.megido.length === 0) return false;
                return h.megido.every(id => {
                    const megido = data.megidoList.find(m => m.id === id);
                    return megido && megido.汎用特性 && megido.汎用特性.includes('飛行');
                });
            });
        }
    },
    'RUSH_ONLY': {
        id: 'RUSH_ONLY',
        name: 'ラッシュ一筋',
        description: 'ラッシュメギドのみの編成で10回勝利する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history || !data.megidoList) return false;
            const wins = data.runState.history.filter(h => {
                if (h.type !== 'battle' || h.result !== 'win' || h.megido.length === 0) return false;
                return h.megido.every(id => {
                    const megido = data.megidoList.find(m => m.id === id);
                    return megido && (megido.スタイル === 'ラッシュ' || megido.style === 'ラッシュ');
                });
            }).length;
            return wins >= 10;
        }
    },
    'COUNTER_SPIRIT': {
        id: 'COUNTER_SPIRIT',
        name: 'カウンタースピリッツ',
        description: 'カウンターメギドのみの編成で10回勝利する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history || !data.megidoList) return false;
            const wins = data.runState.history.filter(h => {
                if (h.type !== 'battle' || h.result !== 'win' || h.megido.length === 0) return false;
                return h.megido.every(id => {
                    const megido = data.megidoList.find(m => m.id === id);
                    return megido && (megido.スタイル === 'カウンター' || megido.style === 'カウンター');
                });
            }).length;
            return wins >= 10;
        }
    },
    'BURST_MAGIC': {
        id: 'BURST_MAGIC',
        name: 'バーストマジック',
        description: 'バーストメギドのみの編成で10回勝利する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history || !data.megidoList) return false;
            const wins = data.runState.history.filter(h => {
                if (h.type !== 'battle' || h.result !== 'win' || h.megido.length === 0) return false;
                return h.megido.every(id => {
                    const megido = data.megidoList.find(m => m.id === id);
                    return megido && (megido.スタイル === 'バースト' || megido.style === 'バースト');
                });
            }).length;
            return wins >= 10;
        }
    },
    'PERFECT_PLAN': {
        id: 'PERFECT_PLAN',
        name: '完璧な計画',
        description: '1つの階層の全ての戦闘マスを計画モードで埋める',
        type: 'public',
        category: 'feature',
        condition: (data) => {
            if (!data.planState || !data.towerMapData) return false;
            return data.towerMapData.some(floor => {
                const combatSquares = Object.keys(floor.squares).filter(sId => ['battle', 'boss'].includes(floor.squares[sId].type));
                if (combatSquares.length === 0) return false;
                return combatSquares.every(sId => {
                    const fullId = `${floor.floor}-${sId}`;
                    return data.planState.assignments && data.planState.assignments[fullId];
                });
            });
        }
    },
    'FLOOR_PLANNER': {
        id: 'FLOOR_PLANNER',
        name: 'フロアプランナー',
        description: '10階層分、計画モードでボスまでのルートを計画する',
        type: 'public',
        category: 'feature',
        condition: (data) => {
            if (!data.planState || !data.planState.assignments) return false;
            const plannedFloors = new Set(Object.keys(data.planState.assignments).map(key => key.split('-')[0]));
            return plannedFloors.size >= 10;
        }
    },
    // --- Secret / Timed Achievements ---
    'THREE_DAY_LOGIN': { id: 'THREE_DAY_LOGIN', name: '三日坊主の終わり', description: '3日連続ログイン', type: 'public', category: 'progress', condition: (data) => data.loginData && data.loginData.consecutiveDays >= 3 },
    'WEEKLY_USER': { id: 'WEEKLY_USER', name: 'ウィークリーユーザー', description: '7日連続ログイン', type: 'public', category: 'progress', condition: (data) => data.loginData && data.loginData.consecutiveDays >= 7 },
    'MONTHLY_USER': { id: 'MONTHLY_USER', name: 'マンスリーユーザー', description: '30日連続ログイン', type: 'public', category: 'progress', condition: (data) => data.loginData && data.loginData.consecutiveDays >= 30 },
    'TOWER_OF_ANNIVERSARY': { id: 'TOWER_OF_ANNIVERSARY', name: 'Tower of Anniversary', description: '1年間利用する', type: 'public', category: 'progress', condition: (data) => data.loginData && (Date.now() - data.loginData.firstLogin) >= 31536000000 },
    'MEGIDO_DAY': { id: 'MEGIDO_DAY', name: 'メギドの日', description: '7月2日にアプリを起動する', type: 'secret', category: 'secret' },
    'APRIL_FOOLS': { id: 'APRIL_FOOLS', name: 'エイプリルフール', description: '4月1日にアプリを起動する', type: 'secret', category: 'secret' },
    'STARING_INTO_THE_VOID': { id: 'STARING_INTO_THE_VOID', name: '虚無を見つめる者', description: '何も選択されていない状態で3分間放置する', type: 'secret', category: 'secret' },
    'BUTTON_MASHER': { id: 'BUTTON_MASHER', name: '連打の鬼', description: 'いずれかのボタンを1秒間に10回以上クリックする', type: 'secret', category: 'secret' }
};