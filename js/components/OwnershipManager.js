const useLongPress = (callback = () => {}, ms = 300) => {
    const { useState, useEffect } = React;
    const [startLongPress, setStartLongPress] = useState(false);

    useEffect(() => {
        let timerId;
        if (startLongPress) {
            timerId = setTimeout(callback, ms);
        } else {
            clearTimeout(timerId);
        }

        return () => {
            clearTimeout(timerId);
        };
    }, [callback, ms, startLongPress]);

    return {
        onMouseDown: () => setStartLongPress(true),
        onMouseUp: () => setStartLongPress(false),
        onMouseLeave: () => setStartLongPress(false),
        onTouchStart: () => setStartLongPress(true),
        onTouchEnd: () => setStartLongPress(false),
    };
};

const getBondReishouTierName = (tier) => {
    if (tier === 0) return 'なし';
    if (tier === 1) return '<真>';
    if (tier === 2) return '<剛>';
    if (tier === 3) return '<絆>';
    return `T${tier}`;
};

const Row = React.memo(({ megido, detail, onDetailChange, isMobileView, setModalState }) => {
    const { useCallback } = React;
    const details = { owned: false, level: 70, ougiLevel: 3, special_reishou: megido.専用霊宝 || false, bond_reishou: 0, singularity_level: 0, ...detail };
    
    const handleOugiConfirm = useCallback((value) => {
        const val = parseInt(value, 10);
        if (isNaN(val) || val < 1) {
            onDetailChange(megido.id, 'ougiLevel', 1);
        } else if (val > 99) {
            onDetailChange(megido.id, 'ougiLevel', 99);
        } else {
            onDetailChange(megido.id, 'ougiLevel', val);
        }
    }, [onDetailChange, megido.id]);

    const handleOugiClick = useCallback(() => {
        setModalState({
            isOpen: true,
            title: `${megido.名前} の奥義レベル`,
            message: '新しい奥義レベルを入力してください (1-99)',
            onConfirm: handleOugiConfirm,
            inputValue: details.ougiLevel
        });
    }, [megido.名前, details.ougiLevel, handleOugiConfirm, setModalState]);

    return (
        <tr>
            <td><input type="checkbox" checked={details.owned} onChange={(e) => onDetailChange(megido.id, 'owned', e.target.checked)} /></td>
            <td className={getStyleClass(megido.スタイル)} onClick={() => onDetailChange(megido.id, 'owned', !details.owned)} style={{ cursor: 'pointer' }}>{megido.名前}</td>
            <td>
                {megido.Singularity && (
                    <select value={details.singularity_level} onChange={e => onDetailChange(megido.id, 'singularity_level', parseInt(e.target.value, 10))} className="select-field">
                        {[0, 1, 2, 3, 4].map(lv => <option key={lv} value={lv}>{lv}</option>)}
                    </select>
                )}
            </td>
            <td>
                <select value={details.level} onChange={e => onDetailChange(megido.id, 'level', parseInt(e.target.value, 10))} className="select-field">
                    {[70, 75, 77, 79, 80].map(lv => <option key={lv} value={lv}>{lv}</option>)}
                </select>
            </td>
            <td>
                <button onClick={handleOugiClick} className="select-field-btn" style={{width: '100%'}}>
                    {details.ougiLevel}
                </button>
            </td>
            <td>
                {megido.専用霊宝 && <input type="checkbox" checked={details.special_reishou} onChange={(e) => onDetailChange(megido.id, 'special_reishou', e.target.checked)} />}
            </td>
            <td>
                {megido.絆霊宝 && 
                    <select value={details.bond_reishou} onChange={e => onDetailChange(megido.id, 'bond_reishou', parseInt(e.target.value, 10))} className="select-field">
                        {[0, 1, 2, 3].map(tier => <option key={tier} value={tier}>{getBondReishouTierName(tier)}</option>)}
                    </select>
                }
            </td>
        </tr>
    );
});

const OwnershipManager = ({ megidoDetails, onDetailChange, onCheckDistributed, isMobileView, setModalState }) => {
    const { useState, useMemo } = React;
    const [filters, setFilters] = useState({ text: '', style: 'All', clock: 'All', class: 'All', exactMatch: false });
    
    const sortedList = useMemo(() => {
        if (typeof COMPLETE_MEGIDO_LIST === 'undefined') return [];
        
        const clockOrder = { '祖': 1, '真': 2, '宵': 3, '継': 4 };
        
        return [...COMPLETE_MEGIDO_LIST].sort((a, b) => {
            const clockTypeA = a.時計.substring(0, 1);
            const clockTypeB = b.時計.substring(0, 1);
            const numA = parseInt(a.時計.substring(1), 10);
            const numB = parseInt(b.時計.substring(1), 10);

            const orderA = clockOrder[clockTypeA] || 99;
            const orderB = clockOrder[clockTypeB] || 99;

            if (orderA !== orderB) {
                return orderA - orderB;
            }
            if (numA !== numB) {
                return numA - numB;
            }
            return a.id.localeCompare(b.id);
        });
    }, []);

    const filteredList = useMemo(() => {
        if (!sortedList.length) return [];
        return sortedList.filter(m => {
            const searchText = filters.text.toLowerCase();
            
            let searchMatch = true;
            if (filters.text) {
                const name = m.名前.toLowerCase();
                if (filters.exactMatch) {
                    searchMatch = name === searchText;
                } else {
                    const trait = (m.汎用特性 || '').toLowerCase();
                    searchMatch = name.includes(searchText) || trait.includes(searchText);
                }
            }

            const styleMatch = filters.style === 'All' || m.スタイル === filters.style;
            const clockMatch = filters.clock === 'All' || m.時計.startsWith(filters.clock);
            const classMatch = filters.class === 'All' || m.クラス === filters.class;

            return searchMatch && styleMatch && clockMatch && classMatch;
        });
    }, [filters, sortedList]);

    const handleBulkCheck = (check) => {
        const newDetails = { ...megidoDetails };
        filteredList.forEach(m => {
            if (!newDetails[m.id]) {
                 newDetails[m.id] = { owned: false, level: 70, ougiLevel: 3, special_reishou: m.専用霊宝 || false, bond_reishou: 0 };
            }
            newDetails[m.id].owned = check;
        });
        onDetailChange(newDetails);
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', marginTop: '16px'}}>
            <FilterControls 
                filters={filters}
                onFilterChange={(type, value) => setFilters(f => ({ ...f, [type]: value }))}
                onBulkCheck={handleBulkCheck}
                onCheckDistributed={onCheckDistributed}
                showBulkButtons={true}
                isMobileView={isMobileView}
                filterType="megido"
                uniquePrefix="ownership"
            />
            <div className="table-container">
                <table className="ownership-table">
                    <thead>
                        <tr>
                            <th>所持</th><th>名前</th><th>凸</th><th>Lv</th><th>奥義</th><th>専用</th><th>絆</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.map(megido => {
                            const detail = megidoDetails[megido.id];
                            return <Row key={megido.id} megido={megido} detail={detail} onDetailChange={onDetailChange} isMobileView={isMobileView} setModalState={setModalState} />;
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};