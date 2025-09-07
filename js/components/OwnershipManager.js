const OwnershipManager = ({ megidoDetails, onDetailChange, onCheckDistributed }) => {
    const [filters, setFilters] = useState({ text: '', style: 'All', clock: 'All', class: 'All', exactMatch: false });
    
    const filteredList = useMemo(() => {
        if (typeof COMPLETE_MEGIDO_LIST === 'undefined') return [];
        return COMPLETE_MEGIDO_LIST.filter(m => {
            const searchText = filters.text.toLowerCase();
            
            let searchMatch = filters.text === '';
            if (!searchMatch) {
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
    }, [filters]);

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

    const getBondReishouTierName = (tier) => {
        if (tier === 0) return 'なし';
        if (tier === 1) return '<真>';
        if (tier === 2) return '<剛>';
        if (tier === 3) return '<絆>';
        return `T${tier}`;
    };

    return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', gap: '16px'}}>
            <FilterControls 
                onFilterChange={(type, value) => setFilters(f => ({ ...f, [type]: value }))}
                onBulkCheck={handleBulkCheck}
                onCheckDistributed={onCheckDistributed}
                showBulkButtons={true}
            />
            <div className="table-container">
                <table className="ownership-table">
                    <thead>
                        <tr>
                            <th>所持</th><th>名前</th><th>凸</th><th>Lv</th><th>奥義Lv</th><th>専用霊宝</th><th>絆霊宝</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.map(megido => {
                            const details = { owned: false, level: 70, ougiLevel: 3, special_reishou: megido.専用霊宝 || false, bond_reishou: 0, singularity_level: 0, ...(megidoDetails[megido.id] || {}) };
                            return (
                            <tr key={megido.id}>
                                <td><input type="checkbox" checked={details.owned} onChange={(e) => onDetailChange(megido.id, 'owned', e.target.checked)} /></td>
                                <td className={getStyleClass(megido.スタイル)}>{megido.名前}</td>
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
                                     <input type="number" min="1" max="11" value={details.ougiLevel} onChange={e => onDetailChange(megido.id, 'ougiLevel', parseInt(e.target.value, 10))} className="input-field"/>
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
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};