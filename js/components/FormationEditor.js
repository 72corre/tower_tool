const FormationEditor = React.memo(({ formation: initialFormation, onSave, onCancel, ownedMegidoIds, megidoDetails, onMegidoDetailChange, initialTagTarget, previousScreen, showToastMessage, onTargetSelect, uniquePrefix }) => {
    const { useState, useMemo, useEffect } = React;
    const [formation, setFormation] = useState(initialFormation);
    const [modalState, setModalState] = useState({ type: null, isOpen: false, slotIndex: null });
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [selectedEnemy, setSelectedEnemy] = useState('');
    const [isEnemyModalOpen, setIsEnemyModalOpen] = useState(false);

    useEffect(() => {
        if (initialFormation) {
            setFormation(rehydrateFormation(initialFormation, megidoDetails));
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
        let floor = null;
        let enemy = '';

        if (initialTagTarget && initialTagTarget.enemy) {
            floor = initialTagTarget.floor;
            enemy = initialTagTarget.enemy;
        } else if (formation.enemyName && formation.floor) {
            floor = formation.floor;
            enemy = formation.enemyName;
        }

        setSelectedEnemy(enemy);
        setSelectedFloor(floor);

        return () => {
            setSelectedEnemy('');
            setSelectedFloor(null);
        }
    }, [initialTagTarget, formation.id]);

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

        if (selectedEnemy && selectedFloor) {
            finalFormation.enemyName = selectedEnemy;
            finalFormation.floor = selectedFloor;
        }

        if (!finalFormation.name) {
            if (selectedEnemy && selectedFloor) {
                finalFormation.name = `${selectedFloor}F ${selectedEnemy}用編成`;
            } else if (finalFormation.megido[2]) {
                finalFormation.name = `${finalFormation.megido[2].名前}編成`;
            }
        }
        
        const newTags = new Set(finalFormation.tags || []);
        (finalFormation.megido || []).forEach(m => { if(m) newTags.add(m.名前) });

        if (selectedEnemy && selectedFloor) {
            const enemyData = ENEMY_ALL_DATA[selectedEnemy];
            const location = enemyData.locations.find(loc => loc && loc.floor === selectedFloor);
            if (location) {
                newTags.add(`${location.floor}F`);
                newTags.add(selectedEnemy);
                (location.rules || []).forEach(rule => newTags.add(rule));
            }
        }

        finalFormation.tags = Array.from(newTags);

        onSave(finalFormation, previousScreen);
        showToastMessage("編成を保存しました");
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
            case 'reishou': return { title: '霊宝選択', showFilters: true, filterType: 'reishou', items: megido ? (typeof COMPLETE_REISHOU_LIST !== 'undefined' ? COMPLETE_REISHOU_LIST : []).filter(r => { const style = r.conditions?.style; return style === megido.スタイル || style === '複数' || !style; }) : [], renderItem: (item, onSelect) => (<button key={item.id} onClick={() => onSelect(item)} className="modal-item-btn"><p style={{fontWeight: 500}}>{item.name}</p><p style={{fontSize: '12px'}}>{item.effects}</p></button>) };
            default: return { title: '', items: [], renderItem: () => null };
        }
    };

    return (
        <div className="formation-editor-form">
            <FilterableSelectionModal {...getModalConfig()} onSelect={handleSelect} onClose={() => setModalState({ isOpen: false, type: null, slotIndex: null })} isOpen={modalState.isOpen && modalState.type !== null} uniquePrefix={uniquePrefix} />
            <FilterableSelectionModal 
                title="エネミーを選択" 
                isOpen={isEnemyModalOpen} 
                onClose={() => setIsEnemyModalOpen(false)} 
                onSelect={(item) => {
                    setSelectedEnemy(item.name);
                    setSelectedFloor(null); // Reset floor when enemy changes
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
            <button onClick={onCancel} className="btn btn-ghost" style={{marginBottom: '16px'}}>&larr; 元の画面に戻る</button>
            <div className="card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div className="form-section">
                    <label className="label">編成名</label>
                    <input type="text" placeholder="未入力で自動命名" value={formation.name || ''} onChange={e => setFormation(f => ({...f, name: e.target.value}))} className="input-field" />
                </div>
                <div className="card">
                    <label className="label">ターゲット選択（自動タグ用）</label>
                    <div className="target-selectors">
                        <button onClick={() => setIsEnemyModalOpen(true)} className="btn btn-secondary">
                            {selectedEnemy || 'エネミーを選択...'}
                        </button>
                        <select 
                            value={selectedFloor || ''} 
                            onChange={e => {
                                const floorValue = e.target.value ? Number(e.target.value) : null;
                                setSelectedFloor(floorValue);
                            }}
                            className="select-css"
                            disabled={!selectedEnemy}
                        >
                            <option value="">階数を選択...</option>
                            {floorsForSelectedEnemy.map(floor => (
                                <option key={floor} value={floor}>{floor}F</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-section">
                    <label className="label">タグ（カンマ区切り）</label>
                    <input type="text" value={(formation.tags || []).join(', ')} onChange={e => setFormation(f => ({...f, tags: e.target.value.split(',').map(t=>t.trim())}))} className="input-field" />
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
                <button onClick={handleSaveClick} disabled={isSaveDisabled} className="btn btn-primary">
                    {isSaveDisabled ? 'リーダーを選択してください' : 'この編成を保存'}
                </button>
            </div>
        </div>
    );
});
