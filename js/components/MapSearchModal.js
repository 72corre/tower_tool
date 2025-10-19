
const { useState, useEffect, useCallback, useMemo } = React;

const MapSearchModal = ({ isOpen, onClose, towerData, megidoData, enemyData, formations, planState, runState, megidoDetails, idMaps, onSelectSquare, onGenerateShareImage }) => {
    if (!isOpen) return null;

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showPredefined, setShowPredefined] = useState(false);

    const getSquareInfo = useCallback((floorNum, squareId) => {
        const floor = towerData.find(f => f.floor === floorNum);
        if (!floor) return null;
        const square = floor.squares[squareId];
        if (!square) return null;
        return { floor: floorNum, id: squareId, type: square.type, sub_type: square.sub_type, style: square.style, enemies: square.enemies, rules: square.rules };
    }, [towerData]);

    const getMegidoInfo = useCallback((megidoId) => {
        return megidoData.find(m => m.id === megidoId);
    }, [megidoData]);

    const getStyleColorClass = useCallback((square) => {
        if (square.type === 'explore' && (square.sub_type === 'recovery' || square.sub_type === 'status_buff')) {
            if (square.style === 'R') return 'highlight-rush';
            if (square.style === 'C') return 'highlight-counter';
            if (square.style === 'B') return 'highlight-burst';
            if (square.style === 'RANDOM') return 'highlight-random';
            if (square.sub_type === 'tower_power') return 'highlight-tower-power';
        }
        return '';
    }, []);

    const handleSearch = useCallback((type, params = {}) => {
        let results = [];
        const katakanaSearchTerm = hiraganaToKatakana(searchTerm.toLowerCase());

        const addResult = (floorNum, squareId, resultType, details = {}) => {
            const existing = results.find(r => r.floor === floorNum && r.squareId === squareId && r.type === resultType);
            if (!existing) {
                results.push({ floor: floorNum, squareId, type: resultType, ...details });
            }
        };

        if (type === 'free_text' && katakanaSearchTerm) {
            // マス情報の検索
            towerData.forEach(floorData => {
                Object.entries(floorData.squares).forEach(([squareId, square]) => {
                    // エネミー名
                    if (square.enemies && square.enemies.some(enemy => hiraganaToKatakana(enemy.toLowerCase()).includes(katakanaSearchTerm))) {
                        addResult(floorData.floor, squareId, 'square', { squareType: square.type, squareSubType: square.sub_type, squareStyle: square.style, enemyName: square.enemies.find(enemy => hiraganaToKatakana(enemy.toLowerCase()).includes(katakanaSearchTerm)) });
                    }
                    // ルール
                    if (square.rules && square.rules.some(rule => hiraganaToKatakana(rule.toLowerCase()).includes(katakanaSearchTerm))) {
                        addResult(floorData.floor, squareId, 'square', { squareType: square.type, squareSubType: square.sub_type, squareStyle: square.style, rule: square.rules.find(rule => hiraganaToKatakana(rule.toLowerCase()).includes(katakanaSearchTerm)) });
                    }
                });
            });

            // 編成情報の検索
            Object.values(formations).forEach(form => {
                // 編成名
                if (hiraganaToKatakana(form.name.toLowerCase()).includes(katakanaSearchTerm)) {
                    addResult(form.floor, form.enemyName, 'formation', { formationId: form.id, formationName: form.name, tags: form.tags, megidoNames: form.megidoSlots.map(m => m?.megidoName).filter(Boolean) });
                }
                // タグ
                if (form.tags && form.tags.some(tag => hiraganaToKatakana(tag.toLowerCase()).includes(katakanaSearchTerm))) {
                    addResult(form.floor, form.enemyName, 'formation', { formationId: form.id, formationName: form.name, tags: form.tags, megidoNames: form.megidoSlots.map(m => m?.megidoName).filter(Boolean) });
                }
                // メギド名
                if (form.megidoSlots && form.megidoSlots.some(slot => slot && slot.megidoName && hiraganaToKatakana(slot.megidoName.toLowerCase()).includes(katakanaSearchTerm))) {
                    addResult(form.floor, form.enemyName, 'formation', { formationId: form.id, formationName: form.name, tags: form.tags, megidoNames: form.megidoSlots.map(m => m?.megidoName).filter(Boolean) });
                }
                // エネミー名
                if (form.enemyName && hiraganaToKatakana(form.enemyName.toLowerCase()).includes(katakanaSearchTerm)) {
                    addResult(form.floor, form.enemyName, 'formation', { formationId: form.id, formationName: form.name, tags: form.tags, megidoNames: form.megidoSlots.map(m => m?.megidoName).filter(Boolean) });
                }
            });

            // 計画モードの編成検索 (planState.assignments, planState.explorationAssignments)
            Object.entries(planState.assignments).forEach(([squareKey, assignments]) => {
                const [floorNumStr, squareId] = squareKey.split('-');
                const floorNum = parseInt(floorNumStr, 10);
                Object.values(assignments).forEach(party => {
                    party.forEach(megidoId => {
                        const megido = getMegidoInfo(megidoId);
                        if (megido && hiraganaToKatakana(megido.名前.toLowerCase()).includes(katakanaSearchTerm)) {
                            addResult(floorNum, squareId, 'plan_assignment', { megidoName: megido.名前 });
                        }
                    });
                });
            });
            Object.entries(planState.explorationAssignments).forEach(([squareId, assignments]) => {
                const [floorNumStr, actualSquareId] = squareId.split('-');
                const floorNum = parseInt(floorNumStr, 10);
                Object.values(assignments).forEach(party => {
                    party.forEach(megidoId => {
                        const megido = getMegidoInfo(megidoId);
                        if (megido && hiraganaToKatakana(megido.名前.toLowerCase()).includes(katakanaSearchTerm)) {
                            addResult(floorNum, actualSquareId, 'plan_assignment', { megidoName: megido.名前 });
                        }
                    });
                });
            });

        } else if (type === 'next_recovery') {
            const currentFloorNum = planState.activeFloor;
            let found = false;
            for (let i = currentFloorNum; i <= 35; i++) { // 35Fまで探索
                const floorData = towerData.find(f => f.floor === i);
                if (floorData) {
                    for (const squareId in floorData.squares) {
                        const square = floorData.squares[squareId];
                        if (square.type === 'explore' && square.sub_type === 'recovery') {
                            addResult(i, squareId, 'square', { squareType: square.type, squareSubType: square.sub_type, squareStyle: square.style });
                            found = true;
                        }
                    }
                }
                if (found) break; // 最初のフロアで見つかったら終了
            }
        } else if (type === 'styled_recovery') {
            const targetStyle = params.style.toUpperCase(); // RUSH, COUNTER, BURST, RANDOM
            towerData.forEach(floorData => {
                Object.entries(floorData.squares).forEach(([squareId, square]) => {
                    if (square.type === 'explore' && square.sub_type === 'recovery') {
                        if (targetStyle === 'RANDOM' && square.style === 'RANDOM') {
                            addResult(floorData.floor, squareId, 'square', { squareType: square.type, squareSubType: square.sub_type, squareStyle: square.style });
                        } else if (square.style === targetStyle.slice(0, 1)) {
                            addResult(floorData.floor, squareId, 'square', { squareType: square.type, squareSubType: square.sub_type, squareStyle: square.style });
                        }
                    }
                });
            });
        } else if (type === 'all_styled_recovery') {
            towerData.forEach(floorData => {
                Object.entries(floorData.squares).forEach(([squareId, square]) => {
                    if (square.type === 'explore' && square.sub_type === 'recovery' && square.style !== 'RANDOM') {
                        addResult(floorData.floor, squareId, 'square', { squareType: square.type, squareSubType: square.sub_type, squareStyle: square.style });
                    }
                });
            });
        } else if (type === 'megido_in_formation') {
            const styleMap = {
                RUSH: 'ラッシュ',
                COUNTER: 'カウンター',
                BURST: 'バースト'
            };
            const targetStyleJP = styleMap[params.style.toUpperCase()];

            if (!targetStyleJP) return; // Mapにない場合は何もしない

            // 編成データから検索
            Object.values(formations).forEach(form => {
                if (form.megidoSlots.some(slot => {
                    const megido = getMegidoInfo(slot?.megidoId);
                    return megido && megido.スタイル === targetStyleJP;
                })) {
                    addResult(form.floor, form.enemyName, 'formation', { formationId: form.id, formationName: form.name, tags: form.tags, megidoNames: form.megidoSlots.map(m => m?.megidoName).filter(Boolean) });
                }
            });
            // 計画モードの編成から検索
            Object.entries(planState.assignments).forEach(([squareKey, assignments]) => {
                const [floorNumStr, squareId] = squareKey.split('-');
                const floorNum = parseInt(floorNumStr, 10);
                Object.values(assignments).forEach(party => {
                    party.forEach(megidoId => {
                        const megido = getMegidoInfo(megidoId);
                        if (megido && megido.スタイル === targetStyleJP) {
                            addResult(floorNum, squareId, 'plan_assignment', { megidoName: megido.名前, megidoStyle: megido.スタイル });
                        }
                    });
                });
            });
            Object.entries(planState.explorationAssignments).forEach(([squareId, assignments]) => {
                const [floorNumStr, actualSquareId] = squareId.split('-');
                const floorNum = parseInt(floorNumStr, 10);
                Object.values(assignments).forEach(party => {
                    party.forEach(megidoId => {
                        const megido = getMegidoInfo(megidoId);
                        if (megido && megido.スタイル === targetStyleJP) {
                            addResult(floorNum, actualSquareId, 'plan_assignment', { megidoName: megido.名前, megidoStyle: megido.スタイル });
                        }
                    });
                });
            });

            // 実践モードの探索履歴から検索
            if (runState && runState.history) {
                runState.history.forEach(action => {
                    if (action.type === 'explore' && action.megido) {
                        action.megido.forEach(megidoId => {
                            const megido = getMegidoInfo(megidoId);
                            if (megido && megido.スタイル === targetStyleJP) {
                                addResult(parseInt(action.floor, 10), action.squareId, 'plan_assignment', { megidoName: megido.名前, megidoStyle: megido.スタイル });
                            }
                        });
                    }
                });
            }
        }

        // 階層でソートし、重複を排除
        results.sort((a, b) => a.floor - b.floor);
        const finalResults = results.filter(r => r.floor != null);
        setSearchResults(finalResults);
    }, [searchTerm, towerData, formations, planState, getMegidoInfo, getSquareInfo, runState]);

    const predefinedSearches = [
        { label: '次のコンディション回復マス', type: 'next_recovery' },
        { label: 'コンディション回復(スタイル別)', type: 'all_styled_recovery' },
        { label: '回復マス(ラッシュ)', type: 'styled_recovery', params: { style: 'rush' } },
        { label: '回復マス(カウンター)', type: 'styled_recovery', params: { style: 'counter' } },
        { label: '回復マス(バースト)', type: 'styled_recovery', params: { style: 'burst' } },
        { label: '回復マス(ランダム)', type: 'styled_recovery', params: { style: 'random' } },
        { label: '使用メギド(ラッシュ)', type: 'megido_in_formation', params: { style: 'rush' } },
        { label: '使用メギド(カウンター)', type: 'megido_in_formation', params: { style: 'counter' } },
        { label: '使用メギド(バースト)', type: 'megido_in_formation', params: { style: 'burst' } },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{width: '90vw', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
                <h3 style={{ textAlign: 'center', marginTop: '0', flexShrink: 0 }}>マス検索</h3>
                
                <div className="map-search-controls" style={{ flexShrink: 0, marginBottom: '1rem' }}>
                    <div className="free-text-search" style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="メギド名, タグ, 編成名, エネミー名..."
                            style={{ flexGrow: 1, padding: '8px' }}
                        />
                        <button className="btn btn-primary" onClick={() => handleSearch('free_text')}><span className="material-symbols-outlined">search</span>検索</button>
                    </div>
                    <div className="predefined-search-container">
                        <button onClick={() => setShowPredefined(!showPredefined)} className="btn btn-secondary" style={{width: '100%', marginBottom: '8px'}}>
                            <span className="material-symbols-outlined">{showPredefined ? 'expand_less' : 'expand_more'}</span>
                            {showPredefined ? 'プリセット検索を隠す' : 'プリセット検索を表示'}
                        </button>
                        {showPredefined && (
                            <div className="predefined-search" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {predefinedSearches.map(search => (
                                    <button 
                                        key={search.label}
                                        className="btn btn-secondary"
                                        onClick={() => handleSearch(search.type, search.params)}
                                    >
                                        {search.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div id="map-search-results" style={{ flexGrow: 1, overflowY: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    {searchResults.length === 0 ? (
                        <p style={{textAlign: 'center', color: 'var(--text-subtle)', marginTop: '2rem'}}>検索結果がここに表示されます。</p>
                    ) : (
                        Object.entries(searchResults.reduce((acc, result) => {
                            (acc[result.floor] = acc[result.floor] || []).push(result);
                            return acc;
                        }, {})).sort(([floorA], [floorB]) => parseInt(floorA) - parseInt(floorB)).map(([floorNum, resultsInFloor]) => (
                            <div key={floorNum} className="search-result-floor-group">
                                <h3>{floorNum}F</h3>
                                <ul className="search-result-list">
                                    {resultsInFloor.map((result, index) => (
                                        <li 
                                            key={index} 
                                            className={`search-result-item ${result.type === 'square' ? getStyleColorClass({ type: 'explore', sub_type: result.squareSubType, style: result.squareStyle }) : ''}`}
                                            onClick={() => {
                                                if (result.type === 'square' || result.type === 'plan_assignment') {
                                                    const floorDataObj = towerData.find(f => f.floor === result.floor);
                                                    const squareObj = floorDataObj ? floorDataObj.squares[result.squareId] : null;
                                                    if (floorDataObj && squareObj) {
                                                        onSelectSquare(floorDataObj, squareObj, result.squareId);
                                                        onClose();
                                                    }
                                                } else if (result.type === 'formation') {
                                                    // 編成の場合は、詳細表示ではなく共有画像生成を促す
                                                    // onSelectSquare(result.floor, result.squareId, result.squareId); // 編成に紐づくマスがあれば
                                                    // onClose();
                                                }
                                            }}
                                        >
                                            <div className="floor-info">{result.floor}F</div>
                                            {result.type === 'square' && (() => {
                                                const translations = {
                                                    'recovery': 'コンディション回復',
                                                    'R': 'ラッシュ',
                                                    'C': 'カウンター',
                                                    'B': 'バースト',
                                                    'RANDOM': 'ランダム'
                                                };
                                                const subTypeText = translations[result.squareSubType] || result.squareSubType;
                                                const styleText = translations[result.squareStyle] || result.squareStyle;

                                                if (result.squareSubType === 'recovery' && result.squareStyle) {
                                                    return (
                                                        <>
                                                            <div className="square-type">{result.squareType === 'explore' ? '探索' : result.squareType === 'battle' ? '戦闘' : result.squareType}マス</div>
                                                            <div className="square-details">{styleText} {subTypeText}</div>
                                                            {result.enemyName && <div className="enemy-name">{result.enemyName}</div>}
                                                            {result.rule && <div className="square-details">ルール: {result.rule}</div>}
                                                        </>
                                                    );
                                                }

                                                return (
                                                    <>
                                                        <div className="square-type">{result.squareType === 'explore' ? '探索' : result.squareType === 'battle' ? '戦闘' : result.squareType}マス</div>
                                                        {result.squareSubType && <div className="square-details">({subTypeText})</div>}
                                                        {result.squareStyle && <div className="square-details">({styleText})</div>}
                                                        {result.enemyName && <div className="enemy-name">{result.enemyName}</div>}
                                                        {result.rule && <div className="square-details">ルール: {result.rule}</div>}
                                                    </>
                                                );
                                            })()}
                                            {result.type === 'formation' && (
                                                <>
                                                    <div className="square-type">編成: {result.formationName}</div>
                                                    {result.enemyName && <div className="enemy-name">{result.enemyName}</div>}
                                                    {result.megidoNames && <div className="megido-names">{result.megidoNames.join(', ')}</div>}
                                                    {result.tags && result.tags.length > 0 && <div className="tags">タグ: {result.tags.join(', ')}</div>}
                                                    <button className="share-image-button" onClick={(e) => { e.stopPropagation(); onGenerateShareImage(formations[result.formationId]); onClose(); }}>共有画像を生成</button>
                                                </>
                                            )}
                                            {result.type === 'plan_assignment' && (
                                                <>
                                                    <div className="square-type">計画: {result.megidoName}</div>
                                                    <div className="floor-info">({result.megidoStyle})</div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};
