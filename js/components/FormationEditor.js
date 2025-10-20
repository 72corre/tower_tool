const FormationEditor = React.memo(({ formation: initialFormation, onSave, onCancel, ownedMegidoIds, megidoDetails, onMegidoDetailChange, initialTagTarget, previousScreen, showToastMessage, onTargetSelect, uniquePrefix }) => {
    const { useState, useMemo, useEffect } = React;
    const [formation, setFormation] = useState(initialFormation);
    const [modalState, setModalState] = useState({ type: null, isOpen: false, slotIndex: null });
    const [selectedFloors, setSelectedFloors] = useState([]);
    const [selectedEnemy, setSelectedEnemy] = useState('');
    const [isEnemyModalOpen, setIsEnemyModalOpen] = useState(false);
    const [customTags, setCustomTags] = useState('');

    useEffect(() => {
        if (initialFormation) {
            setFormation(rehydrateFormation(initialFormation, megidoDetails));
            const customTagsArray = (initialFormation.tags || [])
                .filter(tag => typeof tag === 'string' || tag.category === 'custom')
                .map(tag => typeof tag === 'string' ? tag : tag.text);
            setCustomTags(customTagsArray.join(', '));
        }
    }, [initialFormation, megidoDetails]);

    // onMegidoDetailChangeによってmegidoDetailsが変更された場合、内部のformation stateにも同期させる
    useEffect(() => {
        if (!onMegidoDetailChange) return; // このpropがない場合は何もしない
        setFormation(currentFormation => {
            const newMegidoList = (currentFormation.megido || []).map(m => {
                if (!m) return null;
                const details = megidoDetails[m.id];
                // 既存のmegidoオブジェクトに、更新されたdetailsをマージする
                return details ? { ...m, ...details } : m;
            });
            // メギドリストが実際に変更された場合のみstateを更新
            if (JSON.stringify(currentFormation.megido) !== JSON.stringify(newMegidoList)) {
                return { ...currentFormation, megido: newMegidoList };
            }
            return currentFormation;
        });
    }, [megidoDetails, onMegidoDetailChange]);


    useEffect(() => {
        let floors = [];
        let enemy = '';

        if (initialTagTarget && initialTagTarget.enemy) {
            floors = Array.isArray(initialTagTarget.floor) ? initialTagTarget.floor : (initialTagTarget.floor ? [initialTagTarget.floor] : []);
            enemy = initialTagTarget.enemy;
        } else if (formation.enemyName) {
            // Prioritize the new 'floors' array property
            if (Array.isArray(formation.floors) && formation.floors.length > 0) {
                floors = formation.floors;
            } else if (formation.floor) { // Fallback to old 'floor' property
                // Handle both array (from old logic) and single value
                const floorOrFloors = Array.isArray(formation.floor) ? formation.floor : [formation.floor];
                floors = floorOrFloors.flatMap(f => String(f).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n)));
            }
            enemy = formation.enemyName;
        }

        setSelectedEnemy(enemy);
        setSelectedFloors(floors);

        return () => {
            setSelectedEnemy('');
            setSelectedFloors([]);
        }
    }, [initialTagTarget, formation.id, formation.enemyName, formation.floor, formation.floors]);

    const allEnemies = useMemo(() => {
        if (typeof ENEMY_ALL_DATA === 'undefined') return [];
        return Object.keys(ENEMY_ALL_DATA).map(name => ({ id: name, name }));
    }, []);

    const floorsForSelectedEnemy = useMemo(() => {
        if (!selectedEnemy || typeof ENEMY_ALL_DATA === 'undefined' || !ENEMY_ALL_DATA[selectedEnemy]?.locations) {
            return [];
        }
        const floors = new Set();
        ENEMY_ALL_DATA[selectedEnemy].locations.forEach(loc => {
            if (loc && loc.floor) {
                floors.add(loc.floor);
            }
        });
        return Array.from(floors).sort((a, b) => a - b);
    }, [selectedEnemy]);

    const isSaveDisabled = !formation.megido?.[2];

    const handleSelect = (item) => {
        const { type, slotIndex } = modalState;
        const newMegidoList = [...(formation.megido || Array(5).fill(null))];
        const currentMegido = newMegidoList[slotIndex];

        if (type === 'megido') {
            const isLeader = slotIndex === 2;
            const megidoData = item;
            const details = megidoDetails[megidoData.id] || { 
                owned: true, 
                level: 70, 
                ougiLevel: 1, 
                special_reishou: megidoData.専用霊宝 || false, 
                bond_reishou: 0,
                singularity_level: 0,
                reishou: []
            };
            
            newMegidoList[slotIndex] = { 
                ...megidoData, 
                ...details,
                orb: null,
                isLeader 
            };
        } else if (type === 'orb' && currentMegido) {
            const orbData = (typeof COMPLETE_ORB_LIST !== 'undefined') ? COMPLETE_ORB_LIST.find(o => o.id === item.id) : item;
            currentMegido.orb = orbData;
        } else if (type === 'reishou' && currentMegido) {
            if ((currentMegido.reishou?.length || 0) < 4) {
                currentMegido.reishou = [...(currentMegido.reishou || []), item];
            } else {
                alert('霊宝は4つまでしか装備できません。');
            }
        }
        
        setFormation(prev => ({ ...prev, megido: newMegidoList }));
        setModalState({ type: null, isOpen: false, slotIndex: null });
    };

    const handleSaveClick = () => {
        if (isSaveDisabled) return;
        let finalFormation = { ...formation };

        if (selectedEnemy && selectedFloors.length > 0) {
            finalFormation.enemyName = selectedEnemy;
            finalFormation.floors = selectedFloors;
            finalFormation.floor = selectedFloors.length === 1 ? selectedFloors[0] : selectedFloors.join(',');
        }

        if (!finalFormation.name) {
            if (selectedEnemy && selectedFloors.length > 0) {
                finalFormation.name = `${selectedFloors.join(',')}F ${selectedEnemy}用編成`;
            } else if (finalFormation.megido[2]) {
                finalFormation.name = `${finalFormation.megido[2].名前}編成`;
            }
        }

        const newTags = new Map();

        (finalFormation.megido || []).forEach(megido => {
            if (megido) {
                newTags.set(megido.名前, { text: megido.名前, category: 'megido' });
            }
        });

        if (selectedEnemy) {
            newTags.set(selectedEnemy, { text: selectedEnemy, category: 'enemy' });
        }

        selectedFloors.forEach(floor => {
            const tagText = `${floor}F`;
            newTags.set(tagText, { text: tagText, category: 'floor' });
        });

        customTags.split(',').forEach(tagText => {
            const trimmedText = tagText.trim();
            if (trimmedText && !newTags.has(trimmedText)) {
                newTags.set(trimmedText, { text: trimmedText, category: 'custom' });
            }
        });

        finalFormation.tags = Array.from(newTags.values());

        onSave(finalFormation, previousScreen);
        showToastMessage("編成を保存しました");
    };

    const handleFloorChange = (floor, isChecked) => {
        setSelectedFloors(prevFloors => {
            if (isChecked) {
                return [...prevFloors, floor].sort((a, b) => a - b);
            } else {
                return prevFloors.filter(f => f !== floor);
            }
        });
    };

    const getModalConfig = () => {
        const { type, slotIndex } = modalState;
        const megido = formation.megido?.[slotIndex];
        const currentFormationBaseNames = (formation.megido || []).map((m, i) => i === slotIndex ? null : (m ? getBaseMegidoName(m.名前) : null));

        switch (type) {
            case 'megido': return { 
                title: 'メギド選択', 
                showFilters: true,
                filterType: 'megido',
                items: (typeof COMPLETE_MEGIDO_LIST !== 'undefined' ? COMPLETE_MEGIDO_LIST : []).filter(m => ownedMegidoIds.has(String(m.id))),
                renderItem: (item, onSelect) => {
                    const baseName = getBaseMegidoName(item.名前);
                    const isAlreadyInFormation = currentFormationBaseNames.includes(baseName);
                    return <button key={item.id} onClick={() => onSelect(item)} disabled={isAlreadyInFormation} className="modal-item-btn"><p className={`font-bold ${getStyleClass(item.スタイル)}`}>{item.名前}</p></button>
                }
            };
            case 'orb': return { title: 'オーブ選択', showFilters: true, filterType: 'orb', items: megido ? (typeof COMPLETE_ORB_LIST !== 'undefined' ? COMPLETE_ORB_LIST : []).filter(o => { const cond = o.conditions; if (!cond) return true; if (cond === megido.スタイル || cond === megido.クラス) { return true; } const GENERAL_CONDITIONS = ['ラッシュ', 'カウンター', 'バースト', 'ファイター', 'トルーパー', 'スナイパー']; if (GENERAL_CONDITIONS.includes(cond)) { return false; } const isCondForReArmed = /[RCB]$/.test(cond); if (isCondForReArmed) { return cond === megido.名前; } else { return cond.startsWith(getBaseMegidoName(megido.名前)); } }) : [], renderItem: (item, onSelect) => (<button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn"><p style={{fontWeight: 500}}>{item.name} <span style={{color: 'var(--text-subtle)'}}>({item.race})</span></p><p style={{fontSize: '12px'}}>{item.trait}</p></button>) };
            case 'reishou': return { title: '霊宝選択', showFilters: true, filterType: 'reishou', items: megido ? (typeof COMPLETE_REISHOU_LIST !== 'undefined' ? COMPLETE_REISHOU_LIST : []).filter(r => { 
                const style = r.conditions?.style;
                if (Array.isArray(style)) {
                    return style.includes(megido.スタイル);
                }
                return style === megido.スタイル || !style;
            }) : [], renderItem: (item, onSelect) => (<button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn"><p style={{fontWeight: 500}}>{item.name}</p><p style={{fontSize: '12px'}}>{item.effects}</p></button>) };
            default: return { title: '', items: [], renderItem: () => null };
        }
    };

    return (
        <div className="formation-editor-form">
            <style>{`
                .megido-slot-stats-new {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    padding: 2px 0;
                }
                .stat-row {
                    display: grid;
                    grid-template-columns: 30px 1fr;
                    align-items: center;
                    gap: 2px;
                }
                .stat-label {
                    font-size: 10px;
                    color: var(--text-subtle);
                    text-align: left;
                    font-weight: 500;
                }
                .megido-slot-stat-select {
                    padding: 1px;
                    font-size: 10px;
                }
            `}</style>
            <FilterableSelectionModal {...getModalConfig()} onSelect={handleSelect} onClose={() => setModalState({ isOpen: false, type: null, slotIndex: null })} isOpen={modalState.isOpen && modalState.type !== null} uniquePrefix={uniquePrefix} />
            <FilterableSelectionModal 
                title="エネミーを選択" 
                isOpen={isEnemyModalOpen} 
                onClose={() => setIsEnemyModalOpen(false)} 
                onSelect={(item) => {
                    setSelectedEnemy(item.name);
                    setSelectedFloors([]); // Reset floors when enemy changes
                    setIsEnemyModalOpen(false);
                }}
                items={allEnemies}
                renderItem={(item, onSelect) => (
                    <button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn">
                        <p style={{fontWeight: 'bold'}}>{item.name}</p>
                    </button>
                )}
                showFilters={true}
                filterType="enemy"
            />
            <button onClick={onCancel} className="btn btn-ghost" style={{marginBottom: '16px'}}><span className="material-symbols-outlined">arrow_back</span> 元の画面に戻る</button>
            <div className="card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div className="form-section">
                    <label className="label">編成名</label>
                    <input type="text" placeholder="未入力で自動命名" value={formation.name || ''} onChange={e => setFormation(f => ({...f, name: e.target.value}))} className="input-field" />
                </div>
                <div className="card">
                    <label className="label">ターゲット選択（自動タグ用）</label>
                    <div className="target-selectors">
                        <button onClick={() => setIsEnemyModalOpen(true)} className="btn btn-secondary">
                            <span className="material-symbols-outlined">search</span>
                            {selectedEnemy || 'エネミーを選択...'}
                        </button>
                        <div className="floor-checkbox-group" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                            {floorsForSelectedEnemy.length > 0 ? floorsForSelectedEnemy.map(floor => (
                                <label key={floor} className="floor-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedFloors.includes(floor)}
                                        onChange={(e) => handleFloorChange(floor, e.target.checked)}
                                    />
                                    {floor}F
                                </label>
                            )) : <p>エネミーを選択してください</p>}
                        </div>
                    </div>
                </div>
                <div className="form-section">
                    <label className="label">カスタムタグ（カンマ区切り）</label>
                    <input type="text" value={customTags} onChange={e => setCustomTags(e.target.value)} className="input-field" />
                </div>
                <div className="form-section">
                    <label className="label">メモ</label>
                    <textarea value={formation.notes || ''} onChange={e => setFormation(f => ({...f, notes: e.target.value}))} className="input-field" rows="3"></textarea>
                </div>
                <div className="form-section">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formation.reishou_reminder || false}
                            onChange={e => {
                                const isChecked = e.target.checked;
                                if (isChecked && Notification.permission === 'default') {
                                    Notification.requestPermission();
                                }
                                setFormation(f => ({...f, reishou_reminder: isChecked}))
                            }}
                            className="w-5 h-5"
                        />
                        <span className="label" style={{marginBottom: 0}}>霊宝忘れ防止の通知を受け取る（現在機能していません）</span>
                    </label>
                </div>
                <div>
                    <h4 className="label">メギド構成</h4>
                    <div id="formation-slots-container" style={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px', marginTop: '8px'}}>
                        {[0, 1, 2, 3, 4].map(index => (
                            <div key={index} className="megido-slot-editor-desktop">
                                <MegidoSlotEditor 
                                    megido={formation.megido ? formation.megido[index] : null} 
                                    isLeader={index === 2}
                                    ownedMegidoIds={ownedMegidoIds} // これを追加
                                    megidoDetails={megidoDetails} // これも追加
                                    onSlotClick={() => setModalState({ type: 'megido', isOpen: true, slotIndex: index })}
                                    onOrbClick={(e) => { e.stopPropagation(); if(formation.megido?.[index]) setModalState({ type: 'orb', isOpen: true, slotIndex: index }); }}
                                    onReishouClick={(e) => { e.stopPropagation(); if(formation.megido?.[index]) setModalState({ type: 'reishou', isOpen: true, slotIndex: index }); }}
                                    onRemoveMegido={(e) => { e.stopPropagation(); const newList = [...formation.megido]; newList[index] = null; setFormation(f => ({...f, megido: newList})); }}
                                    onRemoveOrb={(e) => { e.stopPropagation(); const newList = [...formation.megido]; if(newList[index]) newList[index].orb = null; setFormation(f => ({...f, megido: newList})); }}
                                    onRemoveReishou={(reishouIndex) => { const newList = [...formation.megido]; if(newList[index]) newList[index].reishou.splice(reishouIndex, 1); setFormation(f => ({...f, megido: newList})); }}
                                    onStatChange={(field, value) => {
                                        const megidoId = formation.megido[index]?.id;
                                        if (megidoId && onMegidoDetailChange) {
                                            onMegidoDetailChange(megidoId, field, value);
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <button id="save-formation-button" onClick={handleSaveClick} disabled={isSaveDisabled} className="btn btn-primary">
                    <span className="material-symbols-outlined">save</span>
                    {isSaveDisabled ? 'リーダーを選択してください' : 'この編成を保存'}
                </button>
            </div>
        </div>
    );
});