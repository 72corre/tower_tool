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
    'BUTTON_MASHER': { id: 'BUTTON_MASHER', name: '連打の鬼', description: 'いずれかのボタンを1秒間に10回以上クリックする', type: 'secret', category: 'secret' },
    'LOVE_バエル': {
        id: 'LOVE_バエル',
        name: 'バエル大好き',
        description: 'バエルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖01_バエル', '祖01_バエルC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_バエル': {
        id: 'ALWAYS_WITH_バエル',
        name: 'バエルといつも一緒',
        description: 'バエルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖01_バエル', '祖01_バエルC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アガレス': {
        id: 'LOVE_アガレス',
        name: 'アガレス大好き',
        description: 'アガレスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖02_アガレス', '祖02_アガレスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アガレス': {
        id: 'ALWAYS_WITH_アガレス',
        name: 'アガレスといつも一緒',
        description: 'アガレスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖02_アガレス', '祖02_アガレスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ウァサゴ': {
        id: 'LOVE_ウァサゴ',
        name: 'ウァサゴ大好き',
        description: 'ウァサゴを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖03_ウァサゴ', '祖03_ウァサゴB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ウァサゴ': {
        id: 'ALWAYS_WITH_ウァサゴ',
        name: 'ウァサゴといつも一緒',
        description: 'ウァサゴを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖03_ウァサゴ', '祖03_ウァサゴB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ガミジン': {
        id: 'LOVE_ガミジン',
        name: 'ガミジン大好き',
        description: 'ガミジンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖04_ガミジン', '祖04_ガミジンB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ガミジン': {
        id: 'ALWAYS_WITH_ガミジン',
        name: 'ガミジンといつも一緒',
        description: 'ガミジンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖04_ガミジン', '祖04_ガミジンB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_マルバス': {
        id: 'LOVE_マルバス',
        name: 'マルバス大好き',
        description: 'マルバスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖05_マルバス', '祖05_マルバスR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_マルバス': {
        id: 'ALWAYS_WITH_マルバス',
        name: 'マルバスといつも一緒',
        description: 'マルバスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖05_マルバス', '祖05_マルバスR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ウァレフォル': {
        id: 'LOVE_ウァレフォル',
        name: 'ウァレフォル大好き',
        description: 'ウァレフォルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖06_ウァレフォル', '祖06_ウァレフォルC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ウァレフォル': {
        id: 'ALWAYS_WITH_ウァレフォル',
        name: 'ウァレフォルといつも一緒',
        description: 'ウァレフォルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖06_ウァレフォル', '祖06_ウァレフォルC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アモン': {
        id: 'LOVE_アモン',
        name: 'アモン大好き',
        description: 'アモンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖07_アモン', '祖07_アモンR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アモン': {
        id: 'ALWAYS_WITH_アモン',
        name: 'アモンといつも一緒',
        description: 'アモンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖07_アモン', '祖07_アモンR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_バルバトス': {
        id: 'LOVE_バルバトス',
        name: 'バルバトス大好き',
        description: 'バルバトスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖08_バルバトス', '祖08_バルバトスR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_バルバトス': {
        id: 'ALWAYS_WITH_バルバトス',
        name: 'バルバトスといつも一緒',
        description: 'バルバトスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖08_バルバトス', '祖08_バルバトスR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_パイモン': {
        id: 'LOVE_パイモン',
        name: 'パイモン大好き',
        description: 'パイモンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖09_パイモン', '祖09_パイモンB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_パイモン': {
        id: 'ALWAYS_WITH_パイモン',
        name: 'パイモンといつも一緒',
        description: 'パイモンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖09_パイモン', '祖09_パイモンB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ブエル': {
        id: 'LOVE_ブエル',
        name: 'ブエル大好き',
        description: 'ブエルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖10_ブエル', '祖10_ブエルR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ブエル': {
        id: 'ALWAYS_WITH_ブエル',
        name: 'ブエルといつも一緒',
        description: 'ブエルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖10_ブエル', '祖10_ブエルR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_グシオン': {
        id: 'LOVE_グシオン',
        name: 'グシオン大好き',
        description: 'グシオンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖11_グシオン', '祖11_グシオンB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_グシオン': {
        id: 'ALWAYS_WITH_グシオン',
        name: 'グシオンといつも一緒',
        description: 'グシオンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖11_グシオン', '祖11_グシオンB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_シトリー': {
        id: 'LOVE_シトリー',
        name: 'シトリー大好き',
        description: 'シトリーを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖12_シトリー', '祖12_シトリーR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_シトリー': {
        id: 'ALWAYS_WITH_シトリー',
        name: 'シトリーといつも一緒',
        description: 'シトリーを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖12_シトリー', '祖12_シトリーR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ベレト': {
        id: 'LOVE_ベレト',
        name: 'ベレト大好き',
        description: 'ベレトを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖13_ベレト', '祖13_ベレトB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ベレト': {
        id: 'ALWAYS_WITH_ベレト',
        name: 'ベレトといつも一緒',
        description: 'ベレトを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖13_ベレト', '祖13_ベレトB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_レラジェ': {
        id: 'LOVE_レラジェ',
        name: 'レラジェ大好き',
        description: 'レラジェを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖14_レラジェ', '祖14_レラジェR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_レラジェ': {
        id: 'ALWAYS_WITH_レラジェ',
        name: 'レラジェといつも一緒',
        description: 'レラジェを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖14_レラジェ', '祖14_レラジェR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_エリゴス': {
        id: 'LOVE_エリゴス',
        name: 'エリゴス大好き',
        description: 'エリゴスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖15_エリゴス', '祖15_エリゴスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_エリゴス': {
        id: 'ALWAYS_WITH_エリゴス',
        name: 'エリゴスといつも一緒',
        description: 'エリゴスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖15_エリゴス', '祖15_エリゴスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ゼパル': {
        id: 'LOVE_ゼパル',
        name: 'ゼパル大好き',
        description: 'ゼパルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖16_ゼパル', '祖16_ゼパルC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ゼパル': {
        id: 'ALWAYS_WITH_ゼパル',
        name: 'ゼパルといつも一緒',
        description: 'ゼパルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖16_ゼパル', '祖16_ゼパルC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ボティス': {
        id: 'LOVE_ボティス',
        name: 'ボティス大好き',
        description: 'ボティスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖17_ボティス', '祖17_ボティスR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ボティス': {
        id: 'ALWAYS_WITH_ボティス',
        name: 'ボティスといつも一緒',
        description: 'ボティスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖17_ボティス', '祖17_ボティスR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_バティン': {
        id: 'LOVE_バティン',
        name: 'バティン大好き',
        description: 'バティンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖18_バティン', '祖18_バティンB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_バティン': {
        id: 'ALWAYS_WITH_バティン',
        name: 'バティンといつも一緒',
        description: 'バティンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖18_バティン', '祖18_バティンB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_サレオス': {
        id: 'LOVE_サレオス',
        name: 'サレオス大好き',
        description: 'サレオスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖19_サレオス', '祖19_サレオスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_サレオス': {
        id: 'ALWAYS_WITH_サレオス',
        name: 'サレオスといつも一緒',
        description: 'サレオスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖19_サレオス', '祖19_サレオスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_プルソン': {
        id: 'LOVE_プルソン',
        name: 'プルソン大好き',
        description: 'プルソンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖20_プルソン', '祖20_プルソンB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_プルソン': {
        id: 'ALWAYS_WITH_プルソン',
        name: 'プルソンといつも一緒',
        description: 'プルソンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖20_プルソン', '祖20_プルソンB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_モラクス': {
        id: 'LOVE_モラクス',
        name: 'モラクス大好き',
        description: 'モラクスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖21_モラクス', '祖21_モラクスR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_モラクス': {
        id: 'ALWAYS_WITH_モラクス',
        name: 'モラクスといつも一緒',
        description: 'モラクスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖21_モラクス', '祖21_モラクスR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_イポス': {
        id: 'LOVE_イポス',
        name: 'イポス大好き',
        description: 'イポスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖22_イポス', '祖22_イポスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_イポス': {
        id: 'ALWAYS_WITH_イポス',
        name: 'イポスといつも一緒',
        description: 'イポスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖22_イポス', '祖22_イポスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アイム': {
        id: 'LOVE_アイム',
        name: 'アイム大好き',
        description: 'アイムを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖23_アイム', '祖23_アイムR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アイム': {
        id: 'ALWAYS_WITH_アイム',
        name: 'アイムといつも一緒',
        description: 'アイムを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖23_アイム', '祖23_アイムR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ナベリウス': {
        id: 'LOVE_ナベリウス',
        name: 'ナベリウス大好き',
        description: 'ナベリウスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖24_ナベリウス', '祖24_ナベリウスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ナベリウス': {
        id: 'ALWAYS_WITH_ナベリウス',
        name: 'ナベリウスといつも一緒',
        description: 'ナベリウスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖24_ナベリウス', '祖24_ナベリウスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_グラシャラボラス': {
        id: 'LOVE_グラシャラボラス',
        name: 'グラシャラボラス大好き',
        description: 'グラシャラボラスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖25_グラシャラボラス', '祖25_グラシャラボラスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_グラシャラボラス': {
        id: 'ALWAYS_WITH_グラシャラボラス',
        name: 'グラシャラボラスといつも一緒',
        description: 'グラシャラボラスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖25_グラシャラボラス', '祖25_グラシャラボラスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ブネ': {
        id: 'LOVE_ブネ',
        name: 'ブネ大好き',
        description: 'ブネを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖26_ブネ', '祖26_ブネB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ブネ': {
        id: 'ALWAYS_WITH_ブネ',
        name: 'ブネといつも一緒',
        description: 'ブネを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖26_ブネ', '祖26_ブネB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ロノウェ': {
        id: 'LOVE_ロノウェ',
        name: 'ロノウェ大好き',
        description: 'ロノウェを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖27_ロノウェ', '祖27_ロノウェR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ロノウェ': {
        id: 'ALWAYS_WITH_ロノウェ',
        name: 'ロノウェといつも一緒',
        description: 'ロノウェを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖27_ロノウェ', '祖27_ロノウェR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ベリト': {
        id: 'LOVE_ベリト',
        name: 'ベリト大好き',
        description: 'ベリトを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖28_ベリト', '祖28_ベリトB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ベリト': {
        id: 'ALWAYS_WITH_ベリト',
        name: 'ベリトといつも一緒',
        description: 'ベリトを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖28_ベリト', '祖28_ベリトB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アスタロト': {
        id: 'LOVE_アスタロト',
        name: 'アスタロト大好き',
        description: 'アスタロトを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖29_アスタロト', '祖29_アスタロトB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アスタロト': {
        id: 'ALWAYS_WITH_アスタロト',
        name: 'アスタロトといつも一緒',
        description: 'アスタロトを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖29_アスタロト', '祖29_アスタロトB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フォルネウス': {
        id: 'LOVE_フォルネウス',
        name: 'フォルネウス大好き',
        description: 'フォルネウスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖30_フォルネウス', '祖30_フォルネウスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フォルネウス': {
        id: 'ALWAYS_WITH_フォルネウス',
        name: 'フォルネウスといつも一緒',
        description: 'フォルネウスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖30_フォルネウス', '祖30_フォルネウスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フォラス': {
        id: 'LOVE_フォラス',
        name: 'フォラス大好き',
        description: 'フォラスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖31_フォラス', '祖31_フォラスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フォラス': {
        id: 'ALWAYS_WITH_フォラス',
        name: 'フォラスといつも一緒',
        description: 'フォラスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖31_フォラス', '祖31_フォラスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アスモデウス': {
        id: 'LOVE_アスモデウス',
        name: 'アスモデウス大好き',
        description: 'アスモデウスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖32_アスモデウス', '祖32_アスモデウスR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アスモデウス': {
        id: 'ALWAYS_WITH_アスモデウス',
        name: 'アスモデウスといつも一緒',
        description: 'アスモデウスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖32_アスモデウス', '祖32_アスモデウスR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ガープ': {
        id: 'LOVE_ガープ',
        name: 'ガープ大好き',
        description: 'ガープを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖33_ガープ', '祖33_ガープR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ガープ': {
        id: 'ALWAYS_WITH_ガープ',
        name: 'ガープといつも一緒',
        description: 'ガープを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖33_ガープ', '祖33_ガープR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フルフル': {
        id: 'LOVE_フルフル',
        name: 'フルフル大好き',
        description: 'フルフルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖34_フルフル', '祖34_フルフルC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フルフル': {
        id: 'ALWAYS_WITH_フルフル',
        name: 'フルフルといつも一緒',
        description: 'フルフルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖34_フルフル', '祖34_フルフルC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_マルコシアス': {
        id: 'LOVE_マルコシアス',
        name: 'マルコシアス大好き',
        description: 'マルコシアスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖35_マルコシアス', '祖35_マルコシアスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_マルコシアス': {
        id: 'ALWAYS_WITH_マルコシアス',
        name: 'マルコシアスといつも一緒',
        description: 'マルコシアスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖35_マルコシアス', '祖35_マルコシアスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ストラス': {
        id: 'LOVE_ストラス',
        name: 'ストラス大好き',
        description: 'ストラスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖36_ストラス', '祖36_ストラスR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ストラス': {
        id: 'ALWAYS_WITH_ストラス',
        name: 'ストラスといつも一緒',
        description: 'ストラスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖36_ストラス', '祖36_ストラスR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フェニックス': {
        id: 'LOVE_フェニックス',
        name: 'フェニックス大好き',
        description: 'フェニックスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖37_フェニックス', '祖37_フェニックスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フェニックス': {
        id: 'ALWAYS_WITH_フェニックス',
        name: 'フェニックスといつも一緒',
        description: 'フェニックスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖37_フェニックス', '祖37_フェニックスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ハルファス': {
        id: 'LOVE_ハルファス',
        name: 'ハルファス大好き',
        description: 'ハルファスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖38_ハルファス', '祖38_ハルファスR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ハルファス': {
        id: 'ALWAYS_WITH_ハルファス',
        name: 'ハルファスといつも一緒',
        description: 'ハルファスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖38_ハルファス', '祖38_ハルファスR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_マルファス': {
        id: 'LOVE_マルファス',
        name: 'マルファス大好き',
        description: 'マルファスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖39_マルファス', '祖39_マルファスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_マルファス': {
        id: 'ALWAYS_WITH_マルファス',
        name: 'マルファスといつも一緒',
        description: 'マルファスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖39_マルファス', '祖39_マルファスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ラウム': {
        id: 'LOVE_ラウム',
        name: 'ラウム大好き',
        description: 'ラウムを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖40_ラウム', '祖40_ラウムC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ラウム': {
        id: 'ALWAYS_WITH_ラウム',
        name: 'ラウムといつも一緒',
        description: 'ラウムを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖40_ラウム', '祖40_ラウムC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フォカロル': {
        id: 'LOVE_フォカロル',
        name: 'フォカロル大好き',
        description: 'フォカロルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖41_フォカロル', '祖41_フォカロルR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フォカロル': {
        id: 'ALWAYS_WITH_フォカロル',
        name: 'フォカロルといつも一緒',
        description: 'フォカロルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖41_フォカロル', '祖41_フォカロルR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ウェパル': {
        id: 'LOVE_ウェパル',
        name: 'ウェパル大好き',
        description: 'ウェパルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖42_ウェパル', '祖42_ウェパルB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ウェパル': {
        id: 'ALWAYS_WITH_ウェパル',
        name: 'ウェパルといつも一緒',
        description: 'ウェパルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖42_ウェパル', '祖42_ウェパルB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_サブナック': {
        id: 'LOVE_サブナック',
        name: 'サブナック大好き',
        description: 'サブナックを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖43_サブナック', '祖43_サブナックB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_サブナック': {
        id: 'ALWAYS_WITH_サブナック',
        name: 'サブナックといつも一緒',
        description: 'サブナックを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖43_サブナック', '祖43_サブナックB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_シャックス': {
        id: 'LOVE_シャックス',
        name: 'シャックス大好き',
        description: 'シャックスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖44_シャックス', '祖44_シャックスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_シャックス': {
        id: 'ALWAYS_WITH_シャックス',
        name: 'シャックスといつも一緒',
        description: 'シャックスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖44_シャックス', '祖44_シャックスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ヴィネ': {
        id: 'LOVE_ヴィネ',
        name: 'ヴィネ大好き',
        description: 'ヴィネを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖45_ヴィネ', '祖45_ヴィネR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ヴィネ': {
        id: 'ALWAYS_WITH_ヴィネ',
        name: 'ヴィネといつも一緒',
        description: 'ヴィネを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖45_ヴィネ', '祖45_ヴィネR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ビフロンス': {
        id: 'LOVE_ビフロンス',
        name: 'ビフロンス大好き',
        description: 'ビフロンスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖46_ビフロンス', '祖46_ビフロンスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ビフロンス': {
        id: 'ALWAYS_WITH_ビフロンス',
        name: 'ビフロンスといつも一緒',
        description: 'ビフロンスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖46_ビフロンス', '祖46_ビフロンスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ウヴァル': {
        id: 'LOVE_ウヴァル',
        name: 'ウヴァル大好き',
        description: 'ウヴァルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖47_ウヴァル', '祖47_ウヴァルC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ウヴァル': {
        id: 'ALWAYS_WITH_ウヴァル',
        name: 'ウヴァルといつも一緒',
        description: 'ウヴァルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖47_ウヴァル', '祖47_ウヴァルC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ハーゲンティ': {
        id: 'LOVE_ハーゲンティ',
        name: 'ハーゲンティ大好き',
        description: 'ハーゲンティを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖48_ハーゲンティ', '祖48_ハーゲンティB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ハーゲンティ': {
        id: 'ALWAYS_WITH_ハーゲンティ',
        name: 'ハーゲンティといつも一緒',
        description: 'ハーゲンティを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖48_ハーゲンティ', '祖48_ハーゲンティB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_クロケル': {
        id: 'LOVE_クロケル',
        name: 'クロケル大好き',
        description: 'クロケルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖49_クロケル', '祖49_クロケルR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_クロケル': {
        id: 'ALWAYS_WITH_クロケル',
        name: 'クロケルといつも一緒',
        description: 'クロケルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖49_クロケル', '祖49_クロケルR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フルカス': {
        id: 'LOVE_フルカス',
        name: 'フルカス大好き',
        description: 'フルカスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖50_フルカス', '祖50_フルカスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フルカス': {
        id: 'ALWAYS_WITH_フルカス',
        name: 'フルカスといつも一緒',
        description: 'フルカスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖50_フルカス', '祖50_フルカスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_バラム': {
        id: 'LOVE_バラム',
        name: 'バラム大好き',
        description: 'バラムを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖51_バラム', '祖51_バラムR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_バラム': {
        id: 'ALWAYS_WITH_バラム',
        name: 'バラムといつも一緒',
        description: 'バラムを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖51_バラム', '祖51_バラムR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アロケル': {
        id: 'LOVE_アロケル',
        name: 'アロケル大好き',
        description: 'アロケルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖52_アロケル', '祖52_アロケルR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アロケル': {
        id: 'ALWAYS_WITH_アロケル',
        name: 'アロケルといつも一緒',
        description: 'アロケルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖52_アロケル', '祖52_アロケルR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_カイム': {
        id: 'LOVE_カイム',
        name: 'カイム大好き',
        description: 'カイムを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖53_カイム', '祖53_カイムB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_カイム': {
        id: 'ALWAYS_WITH_カイム',
        name: 'カイムといつも一緒',
        description: 'カイムを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖53_カイム', '祖53_カイムB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ムルムル': {
        id: 'LOVE_ムルムル',
        name: 'ムルムル大好き',
        description: 'ムルムルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖54_ムルムル', '祖54_ムルムルC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ムルムル': {
        id: 'ALWAYS_WITH_ムルムル',
        name: 'ムルムルといつも一緒',
        description: 'ムルムルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖54_ムルムル', '祖54_ムルムルC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_オロバス': {
        id: 'LOVE_オロバス',
        name: 'オロバス大好き',
        description: 'オロバスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖55_オロバス', '祖55_オロバスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_オロバス': {
        id: 'ALWAYS_WITH_オロバス',
        name: 'オロバスといつも一緒',
        description: 'オロバスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖55_オロバス', '祖55_オロバスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_グレモリー': {
        id: 'LOVE_グレモリー',
        name: 'グレモリー大好き',
        description: 'グレモリーを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖56_グレモリー', '祖56_グレモリーR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_グレモリー': {
        id: 'ALWAYS_WITH_グレモリー',
        name: 'グレモリーといつも一緒',
        description: 'グレモリーを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖56_グレモリー', '祖56_グレモリーR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_オセ': {
        id: 'LOVE_オセ',
        name: 'オセ大好き',
        description: 'オセを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖57_オセ', '祖57_オセC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_オセ': {
        id: 'ALWAYS_WITH_オセ',
        name: 'オセといつも一緒',
        description: 'オセを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖57_オセ', '祖57_オセC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アミー': {
        id: 'LOVE_アミー',
        name: 'アミー大好き',
        description: 'アミーを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖58_アミー', '祖58_アミーC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アミー': {
        id: 'ALWAYS_WITH_アミー',
        name: 'アミーといつも一緒',
        description: 'アミーを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖58_アミー', '祖58_アミーC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_オリアス': {
        id: 'LOVE_オリアス',
        name: 'オリアス大好き',
        description: 'オリアスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖59_オリアス', '祖59_オリアスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_オリアス': {
        id: 'ALWAYS_WITH_オリアス',
        name: 'オリアスといつも一緒',
        description: 'オリアスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖59_オリアス', '祖59_オリアスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ウァプラ': {
        id: 'LOVE_ウァプラ',
        name: 'ウァプラ大好き',
        description: 'ウァプラを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖60_ウァプラ', '祖60_ウァプラR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ウァプラ': {
        id: 'ALWAYS_WITH_ウァプラ',
        name: 'ウァプラといつも一緒',
        description: 'ウァプラを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖60_ウァプラ', '祖60_ウァプラR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ザガン': {
        id: 'LOVE_ザガン',
        name: 'ザガン大好き',
        description: 'ザガンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖61_ザガン', '祖61_ザガンR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ザガン': {
        id: 'ALWAYS_WITH_ザガン',
        name: 'ザガンといつも一緒',
        description: 'ザガンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖61_ザガン', '祖61_ザガンR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ウァラク': {
        id: 'LOVE_ウァラク',
        name: 'ウァラク大好き',
        description: 'ウァラクを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖62_ウァラク', '祖62_ウァラクC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ウァラク': {
        id: 'ALWAYS_WITH_ウァラク',
        name: 'ウァラクといつも一緒',
        description: 'ウァラクを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖62_ウァラク', '祖62_ウァラクC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アンドラス': {
        id: 'LOVE_アンドラス',
        name: 'アンドラス大好き',
        description: 'アンドラスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖63_アンドラス', '祖63_アンドラスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アンドラス': {
        id: 'ALWAYS_WITH_アンドラス',
        name: 'アンドラスといつも一緒',
        description: 'アンドラスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖63_アンドラス', '祖63_アンドラスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フラウロス': {
        id: 'LOVE_フラウロス',
        name: 'フラウロス大好き',
        description: 'フラウロスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖64_フラウロス', '祖64_フラウロスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フラウロス': {
        id: 'ALWAYS_WITH_フラウロス',
        name: 'フラウロスといつも一緒',
        description: 'フラウロスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖64_フラウロス', '祖64_フラウロスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アンドレアルフス': {
        id: 'LOVE_アンドレアルフス',
        name: 'アンドレアルフス大好き',
        description: 'アンドレアルフスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖65_アンドレアルフス', '祖65_アンドレアルフスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アンドレアルフス': {
        id: 'ALWAYS_WITH_アンドレアルフス',
        name: 'アンドレアルフスといつも一緒',
        description: 'アンドレアルフスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖65_アンドレアルフス', '祖65_アンドレアルフスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_キマリス': {
        id: 'LOVE_キマリス',
        name: 'キマリス大好き',
        description: 'キマリスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖66_キマリス', '祖66_キマリスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_キマリス': {
        id: 'ALWAYS_WITH_キマリス',
        name: 'キマリスといつも一緒',
        description: 'キマリスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖66_キマリス', '祖66_キマリスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アムドゥスキアス': {
        id: 'LOVE_アムドゥスキアス',
        name: 'アムドゥスキアス大好き',
        description: 'アムドゥスキアスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖67_アムドゥスキアス', '祖67_アムドゥスキアスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アムドゥスキアス': {
        id: 'ALWAYS_WITH_アムドゥスキアス',
        name: 'アムドゥスキアスといつも一緒',
        description: 'アムドゥスキアスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖67_アムドゥスキアス', '祖67_アムドゥスキアスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ベリアル': {
        id: 'LOVE_ベリアル',
        name: 'ベリアル大好き',
        description: 'ベリアルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖68_ベリアル', '祖68_ベリアルB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ベリアル': {
        id: 'ALWAYS_WITH_ベリアル',
        name: 'ベリアルといつも一緒',
        description: 'ベリアルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖68_ベリアル', '祖68_ベリアルB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_デカラビア': {
        id: 'LOVE_デカラビア',
        name: 'デカラビア大好き',
        description: 'デカラビアを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖69_デカラビア', '祖69_デカラビアB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_デカラビア': {
        id: 'ALWAYS_WITH_デカラビア',
        name: 'デカラビアといつも一緒',
        description: 'デカラビアを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖69_デカラビア', '祖69_デカラビアB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_セーレ': {
        id: 'LOVE_セーレ',
        name: 'セーレ大好き',
        description: 'セーレを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖70_セーレ', '祖70_セーレR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_セーレ': {
        id: 'ALWAYS_WITH_セーレ',
        name: 'セーレといつも一緒',
        description: 'セーレを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖70_セーレ', '祖70_セーレR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ダンタリオン': {
        id: 'LOVE_ダンタリオン',
        name: 'ダンタリオン大好き',
        description: 'ダンタリオンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖71_ダンタリオン', '祖71_ダンタリオンR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ダンタリオン': {
        id: 'ALWAYS_WITH_ダンタリオン',
        name: 'ダンタリオンといつも一緒',
        description: 'ダンタリオンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖71_ダンタリオン', '祖71_ダンタリオンR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アンドロマリウス': {
        id: 'LOVE_アンドロマリウス',
        name: 'アンドロマリウス大好き',
        description: 'アンドロマリウスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['祖72_アンドロマリウス', '祖72_アンドロマリウスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アンドロマリウス': {
        id: 'ALWAYS_WITH_アンドロマリウス',
        name: 'アンドロマリウスといつも一緒',
        description: 'アンドロマリウスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['祖72_アンドロマリウス', '祖72_アンドロマリウスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_リリム': {
        id: 'LOVE_リリム',
        name: 'リリム大好き',
        description: 'リリムを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真01_リリム', '真01_リリムR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_リリム': {
        id: 'ALWAYS_WITH_リリム',
        name: 'リリムといつも一緒',
        description: 'リリムを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真01_リリム', '真01_リリムR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ニバス': {
        id: 'LOVE_ニバス',
        name: 'ニバス大好き',
        description: 'ニバスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真02_ニバス', '真02_ニバスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ニバス': {
        id: 'ALWAYS_WITH_ニバス',
        name: 'ニバスといつも一緒',
        description: 'ニバスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真02_ニバス', '真02_ニバスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_サキュバス': {
        id: 'LOVE_サキュバス',
        name: 'サキュバス大好き',
        description: 'サキュバスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真03_サキュバス', '真03_サキュバスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_サキュバス': {
        id: 'ALWAYS_WITH_サキュバス',
        name: 'サキュバスといつも一緒',
        description: 'サキュバスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真03_サキュバス', '真03_サキュバスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ユフィール': {
        id: 'LOVE_ユフィール',
        name: 'ユフィール大好き',
        description: 'ユフィールを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真04_ユフィール', '真04_ユフィールC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ユフィール': {
        id: 'ALWAYS_WITH_ユフィール',
        name: 'ユフィールといつも一緒',
        description: 'ユフィールを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真04_ユフィール', '真04_ユフィールC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フリアエ': {
        id: 'LOVE_フリアエ',
        name: 'フリアエ大好き',
        description: 'フリアエを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真05_フリアエ', '真05_フリアエR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フリアエ': {
        id: 'ALWAYS_WITH_フリアエ',
        name: 'フリアエといつも一緒',
        description: 'フリアエを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真05_フリアエ', '真05_フリアエR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アラストール': {
        id: 'LOVE_アラストール',
        name: 'アラストール大好き',
        description: 'アラストールを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真06_アラストール', '真06_アラストールB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アラストール': {
        id: 'ALWAYS_WITH_アラストール',
        name: 'アラストールといつも一緒',
        description: 'アラストールを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真06_アラストール', '真06_アラストールB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ヒュトギン': {
        id: 'LOVE_ヒュトギン',
        name: 'ヒュトギン大好き',
        description: 'ヒュトギンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真07_ヒュトギン', '真07_ヒュトギンC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ヒュトギン': {
        id: 'ALWAYS_WITH_ヒュトギン',
        name: 'ヒュトギンといつも一緒',
        description: 'ヒュトギンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真07_ヒュトギン', '真07_ヒュトギンC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ロキ': {
        id: 'LOVE_ロキ',
        name: 'ロキ大好き',
        description: 'ロキを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真08_ロキ', '真08_ロキR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ロキ': {
        id: 'ALWAYS_WITH_ロキ',
        name: 'ロキといつも一緒',
        description: 'ロキを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真08_ロキ', '真08_ロキR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_インキュバス': {
        id: 'LOVE_インキュバス',
        name: 'インキュバス大好き',
        description: 'インキュバスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真09_インキュバス', '真09_インキュバスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_インキュバス': {
        id: 'ALWAYS_WITH_インキュバス',
        name: 'インキュバスといつも一緒',
        description: 'インキュバスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真09_インキュバス', '真09_インキュバスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_グリマルキン': {
        id: 'LOVE_グリマルキン',
        name: 'グリマルキン大好き',
        description: 'グリマルキンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真10_グリマルキン', '真10_グリマルキンR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_グリマルキン': {
        id: 'ALWAYS_WITH_グリマルキン',
        name: 'グリマルキンといつも一緒',
        description: 'グリマルキンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真10_グリマルキン', '真10_グリマルキンR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_コルソン': {
        id: 'LOVE_コルソン',
        name: 'コルソン大好き',
        description: 'コルソンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真11_コルソン', '真11_コルソンR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_コルソン': {
        id: 'ALWAYS_WITH_コルソン',
        name: 'コルソンといつも一緒',
        description: 'コルソンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真11_コルソン', '真11_コルソンR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ジニマル': {
        id: 'LOVE_ジニマル',
        name: 'ジニマル大好き',
        description: 'ジニマルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真12_ジニマル', '真12_ジニマルR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ジニマル': {
        id: 'ALWAYS_WITH_ジニマル',
        name: 'ジニマルといつも一緒',
        description: 'ジニマルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真12_ジニマル', '真12_ジニマルR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_サラ': {
        id: 'LOVE_サラ',
        name: 'サラ大好き',
        description: 'サラを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真14_サラ', '真14_サラB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_サラ': {
        id: 'ALWAYS_WITH_サラ',
        name: 'サラといつも一緒',
        description: 'サラを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真14_サラ', '真14_サラB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_サタナキア': {
        id: 'LOVE_サタナキア',
        name: 'サタナキア大好き',
        description: 'サタナキアを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真15_サタナキア', '真15_サタナキアB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_サタナキア': {
        id: 'ALWAYS_WITH_サタナキア',
        name: 'サタナキアといつも一緒',
        description: 'サタナキアを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真15_サタナキア', '真15_サタナキアB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ティアマト': {
        id: 'LOVE_ティアマト',
        name: 'ティアマト大好き',
        description: 'ティアマトを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真17_ティアマト', '真17_ティアマトR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ティアマト': {
        id: 'ALWAYS_WITH_ティアマト',
        name: 'ティアマトといつも一緒',
        description: 'ティアマトを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真17_ティアマト', '真17_ティアマトR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ブニ': {
        id: 'LOVE_ブニ',
        name: 'ブニ大好き',
        description: 'ブニを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真18_ブニ', '真18_ブニB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ブニ': {
        id: 'ALWAYS_WITH_ブニ',
        name: 'ブニといつも一緒',
        description: 'ブニを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真18_ブニ', '真18_ブニB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_オリエンス': {
        id: 'LOVE_オリエンス',
        name: 'オリエンス大好き',
        description: 'オリエンスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真19_オリエンス', '真19_オリエンスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_オリエンス': {
        id: 'ALWAYS_WITH_オリエンス',
        name: 'オリエンスといつも一緒',
        description: 'オリエンスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真19_オリエンス', '真19_オリエンスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_カスピエル': {
        id: 'LOVE_カスピエル',
        name: 'カスピエル大好き',
        description: 'カスピエルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真22_カスピエル', '真22_カスピエルC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_カスピエル': {
        id: 'ALWAYS_WITH_カスピエル',
        name: 'カスピエルといつも一緒',
        description: 'カスピエルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真22_カスピエル', '真22_カスピエルC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ネフィリム': {
        id: 'LOVE_ネフィリム',
        name: 'ネフィリム大好き',
        description: 'ネフィリムを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真23_ネフィリム', '真23_ネフィリムB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ネフィリム': {
        id: 'ALWAYS_WITH_ネフィリム',
        name: 'ネフィリムといつも一緒',
        description: 'ネフィリムを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真23_ネフィリム', '真23_ネフィリムB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ニスロク': {
        id: 'LOVE_ニスロク',
        name: 'ニスロク大好き',
        description: 'ニスロクを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真25_ニスロク', '真25_ニスロクB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ニスロク': {
        id: 'ALWAYS_WITH_ニスロク',
        name: 'ニスロクといつも一緒',
        description: 'ニスロクを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真25_ニスロク', '真25_ニスロクB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_マルチネ': {
        id: 'LOVE_マルチネ',
        name: 'マルチネ大好き',
        description: 'マルチネを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真27_マルチネ', '真27_マルチネC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_マルチネ': {
        id: 'ALWAYS_WITH_マルチネ',
        name: 'マルチネといつも一緒',
        description: 'マルチネを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真27_マルチネ', '真27_マルチネC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_フルーレティ': {
        id: 'LOVE_フルーレティ',
        name: 'フルーレティ大好き',
        description: 'フルーレティを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真31_フルーレティ', '真31_フルーレティB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_フルーレティ': {
        id: 'ALWAYS_WITH_フルーレティ',
        name: 'フルーレティといつも一緒',
        description: 'フルーレティを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真31_フルーレティ', '真31_フルーレティB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ハック': {
        id: 'LOVE_ハック',
        name: 'ハック大好き',
        description: 'ハックを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真33_ハック', '真33_ハックB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ハック': {
        id: 'ALWAYS_WITH_ハック',
        name: 'ハックといつも一緒',
        description: 'ハックを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真33_ハック', '真33_ハックB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_メフィスト': {
        id: 'LOVE_メフィスト',
        name: 'メフィスト大好き',
        description: 'メフィストを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真36_メフィスト', '真36_メフィストC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_メフィスト': {
        id: 'ALWAYS_WITH_メフィスト',
        name: 'メフィストといつも一緒',
        description: 'メフィストを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真36_メフィスト', '真36_メフィストC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アガリアレプト': {
        id: 'LOVE_アガリアレプト',
        name: 'アガリアレプト大好き',
        description: 'アガリアレプトを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真38_アガリアレプト', '真38_アガリアレプトR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アガリアレプト': {
        id: 'ALWAYS_WITH_アガリアレプト',
        name: 'アガリアレプトといつも一緒',
        description: 'アガリアレプトを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真38_アガリアレプト', '真38_アガリアレプトR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アマイモン': {
        id: 'LOVE_アマイモン',
        name: 'アマイモン大好き',
        description: 'アマイモンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真41_アマイモン', '真41_アマイモンR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アマイモン': {
        id: 'ALWAYS_WITH_アマイモン',
        name: 'アマイモンといつも一緒',
        description: 'アマイモンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真41_アマイモン', '真41_アマイモンR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_シャミハザ': {
        id: 'LOVE_シャミハザ',
        name: 'シャミハザ大好き',
        description: 'シャミハザを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真50_シャミハザ', '真50_シャミハザR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_シャミハザ': {
        id: 'ALWAYS_WITH_シャミハザ',
        name: 'シャミハザといつも一緒',
        description: 'シャミハザを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真50_シャミハザ', '真50_シャミハザR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_プルフラス': {
        id: 'LOVE_プルフラス',
        name: 'プルフラス大好き',
        description: 'プルフラスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真51_プルフラス', '真51_プルフラスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_プルフラス': {
        id: 'ALWAYS_WITH_プルフラス',
        name: 'プルフラスといつも一緒',
        description: 'プルフラスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真51_プルフラス', '真51_プルフラスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ジズ': {
        id: 'LOVE_ジズ',
        name: 'ジズ大好き',
        description: 'ジズを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真52_ジズ', '真52_ジズR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ジズ': {
        id: 'ALWAYS_WITH_ジズ',
        name: 'ジズといつも一緒',
        description: 'ジズを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真52_ジズ', '真52_ジズR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ベバル': {
        id: 'LOVE_ベバル',
        name: 'ベバル大好き',
        description: 'ベバルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真53_ベバル', '真53_ベバルC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ベバル': {
        id: 'ALWAYS_WITH_ベバル',
        name: 'ベバルといつも一緒',
        description: 'ベバルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真53_ベバル', '真53_ベバルC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アバラム': {
        id: 'LOVE_アバラム',
        name: 'アバラム大好き',
        description: 'アバラムを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真54_アバラム', '真54_アバラムC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アバラム': {
        id: 'ALWAYS_WITH_アバラム',
        name: 'アバラムといつも一緒',
        description: 'アバラムを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真54_アバラム', '真54_アバラムC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ベヒモス': {
        id: 'LOVE_ベヒモス',
        name: 'ベヒモス大好き',
        description: 'ベヒモスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真57_ベヒモス', '真57_ベヒモスB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ベヒモス': {
        id: 'ALWAYS_WITH_ベヒモス',
        name: 'ベヒモスといつも一緒',
        description: 'ベヒモスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真57_ベヒモス', '真57_ベヒモスB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ダゴン': {
        id: 'LOVE_ダゴン',
        name: 'ダゴン大好き',
        description: 'ダゴンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真58_ダゴン', '真58_ダゴンR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ダゴン': {
        id: 'ALWAYS_WITH_ダゴン',
        name: 'ダゴンといつも一緒',
        description: 'ダゴンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真58_ダゴン', '真58_ダゴンR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_スコルベノト': {
        id: 'LOVE_スコルベノト',
        name: 'スコルベノト大好き',
        description: 'スコルベノトを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真59_スコルベノト', '真59_スコルベノトR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_スコルベノト': {
        id: 'ALWAYS_WITH_スコルベノト',
        name: 'スコルベノトといつも一緒',
        description: 'スコルベノトを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真59_スコルベノト', '真59_スコルベノトR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_インプ': {
        id: 'LOVE_インプ',
        name: 'インプ大好き',
        description: 'インプを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真62_インプ', '真62_インプR']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_インプ': {
        id: 'ALWAYS_WITH_インプ',
        name: 'インプといつも一緒',
        description: 'インプを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真62_インプ', '真62_インプR']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アマゼロト': {
        id: 'LOVE_アマゼロト',
        name: 'アマゼロト大好き',
        description: 'アマゼロトを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真63_アマゼロト', '真63_アマゼロトB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アマゼロト': {
        id: 'ALWAYS_WITH_アマゼロト',
        name: 'アマゼロトといつも一緒',
        description: 'アマゼロトを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真63_アマゼロト', '真63_アマゼロトB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_プロメテウス': {
        id: 'LOVE_プロメテウス',
        name: 'プロメテウス大好き',
        description: 'プロメテウスを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真64_プロメテウス', '真64_プロメテウスC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_プロメテウス': {
        id: 'ALWAYS_WITH_プロメテウス',
        name: 'プロメテウスといつも一緒',
        description: 'プロメテウスを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真64_プロメテウス', '真64_プロメテウスC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_ネルガル': {
        id: 'LOVE_ネルガル',
        name: 'ネルガル大好き',
        description: 'ネルガルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真68_ネルガル', '真68_ネルガルB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_ネルガル': {
        id: 'ALWAYS_WITH_ネルガル',
        name: 'ネルガルといつも一緒',
        description: 'ネルガルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真68_ネルガル', '真68_ネルガルB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_バールゼフォン': {
        id: 'LOVE_バールゼフォン',
        name: 'バールゼフォン大好き',
        description: 'バールゼフォンを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真69_バールゼフォン', '真69_バールゼフォンC']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_バールゼフォン': {
        id: 'ALWAYS_WITH_バールゼフォン',
        name: 'バールゼフォンといつも一緒',
        description: 'バールゼフォンを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真69_バールゼフォン', '真69_バールゼフォンC']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    },
    'LOVE_アクィエル': {
        id: 'LOVE_アクィエル',
        name: 'アクィエル大好き',
        description: 'アクィエルを編成した編成を５つ以上登録する',
        type: 'public',
        category: 'collection',
        condition: (data) => {
            if (!data.formations) return false;
            const megidoIdsInGroup = new Set(['真71_アクィエル', '真71_アクィエルB']);
            const count = Object.values(data.formations).filter(formation =>
                formation.megidoSlots.some(slot => slot && megidoIdsInGroup.has(slot.megidoId))
            ).length;
            return count >= 5;
        }
    },
    'ALWAYS_WITH_アクィエル': {
        id: 'ALWAYS_WITH_アクィエル',
        name: 'アクィエルといつも一緒',
        description: 'アクィエルを編成に入れたまま10回戦闘勝利を記録する',
        type: 'public',
        category: 'battle',
        condition: (data) => {
            if (!data.runState || !data.runState.history) return false;
            const megidoIdsInGroup = new Set(['真71_アクィエル', '真71_アクィエルB']);
            const count = data.runState.history.filter(h => 
                h.type === 'battle' && h.result === 'win' && h.megido.some(id => megidoIdsInGroup.has(id))
            ).length;
            return count >= 10;
        }
    }
};