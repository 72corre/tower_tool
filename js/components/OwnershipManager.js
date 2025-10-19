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
    
    const handleOwnedChange = useCallback((e) => {
        onDetailChange(megido.id, 'owned', e.target.checked);
    }, [onDetailChange, megido.id]);

    const handleNameClick = useCallback(() => {
        onDetailChange(megido.id, 'owned', !details.owned);
    }, [onDetailChange, megido.id, details.owned]);

    const handleSingularityChange = useCallback((e) => {
        onDetailChange(megido.id, 'singularity_level', parseInt(e.target.value, 10));
    }, [onDetailChange, megido.id]);

    const handleLevelChange = useCallback((e) => {
        onDetailChange(megido.id, 'level', parseInt(e.target.value, 10));
    }, [onDetailChange, megido.id]);

    const handleSpecialReishouChange = useCallback((e) => {
        onDetailChange(megido.id, 'special_reishou', e.target.checked);
    }, [onDetailChange, megido.id]);

    const handleBondReishouChange = useCallback((e) => {
        onDetailChange(megido.id, 'bond_reishou', parseInt(e.target.value, 10));
    }, [onDetailChange, megido.id]);

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
    }, [megido.名前, details.ougiLevel, handleOugiConfirm]);

    return (
        <tr>
            <td><input type="checkbox" checked={details.owned} onChange={handleOwnedChange} /></td>
            <td className={getStyleClass(megido.スタイル)} onClick={handleNameClick} style={{ cursor: 'pointer' }}>{megido.名前}</td>
            <td>
                {megido.Singularity && (
                    <select value={details.singularity_level} onChange={handleSingularityChange} className="select-field">
                        {[0, 1, 2, 3, 4].map(lv => <option key={lv} value={lv}>{lv}</option>)}
                    </select>
                )}
            </td>
            <td>
                <select value={details.level} onChange={handleLevelChange} className="select-field">
                    {[70, 75, 77, 79, 80].map(lv => <option key={lv} value={lv}>{lv}</option>)}
                </select>
            </td>
            <td>
                <button onClick={handleOugiClick} className="select-field-btn" style={{width: '100%'}}>
                    {details.ougiLevel}
                </button>
            </td>
            <td>
                {megido.専用霊宝 && <input type="checkbox" checked={details.special_reishou} onChange={handleSpecialReishouChange} />}
            </td>
            <td>
                {megido.絆霊宝 && 
                    <select value={details.bond_reishou} onChange={handleBondReishouChange} className="select-field">
                        {[0, 1, 2, 3].map(tier => <option key={tier} value={tier}>{getBondReishouTierName(tier)}</option>)}
                    </select>
                }
            </td>
        </tr>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function: re-render only if the detail content changes.
    if (prevProps.megido.id !== nextProps.megido.id) return false;
    
    const prevDetail = prevProps.detail || {};
    const nextDetail = nextProps.detail || {};
    
    // This prevents re-renders caused by unstable function props (onDetailChange, setModalState)
    // by only comparing the data that affects the visual output of the row.
    return (
        prevDetail.owned === nextDetail.owned &&
        prevDetail.level === nextDetail.level &&
        prevDetail.ougiLevel === nextDetail.ougiLevel &&
        prevDetail.special_reishou === nextDetail.special_reishou &&
        prevDetail.bond_reishou === nextDetail.bond_reishou &&
        prevDetail.singularity_level === nextDetail.singularity_level
    );
});

const OwnershipManager = ({ megidoDetails, onDetailChange, onCheckDistributed, isMobileView, setModalState }) => {
    const { useState, useMemo, useRef, useEffect } = React;
    const [filters, setFilters] = useState({ text: '', style: 'All', clock: 'All', class: 'All', exactMatch: false });
    const scrollContainerRef = useRef(null);
    const scrollPositionRef = useRef(0);

    // Save scroll position continuously
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const handleScroll = () => {
            scrollPositionRef.current = container.scrollTop;
        };
        
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);
    
    // After megidoDetails changes, restore the scroll position
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            // Use requestAnimationFrame to restore after the DOM has been updated
            requestAnimationFrame(() => {
                container.scrollTop = scrollPositionRef.current;
            });
        }
    }, [megidoDetails]);

    const sortedList = useMemo(() => {
        if (typeof COMPLETE_MEGIDO_LIST === 'undefined') return [];
        
        const clockOrder = { '祖': 1, '真': 2, '宵': 3, '継': 4 };
        
        return [...COMPLETE_MEGIDO_LIST].sort((a, b) => {
            const clockTypeA = a.時計.substring(0, 1);
            const clockTypeB = b.時計.substring(0, 1);
            const numA = parseInt(a.時計.substring(1), 10);
            const numB = parseInt(a.時計.substring(1), 10);

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
            const searchText = hiraganaToKatakana(filters.text.toLowerCase());
            
            let searchMatch = true;
            if (filters.text) {
                const name = hiraganaToKatakana(m.名前.toLowerCase());
                if (filters.exactMatch) {
                    searchMatch = name === searchText;
                } else {
                    const trait = hiraganaToKatakana((m.汎用特性 || '').toLowerCase());
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
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', gap: '8px'}}>
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
            <div className="table-container" ref={scrollContainerRef}>
                <table className="ownership-table">
                    <thead>
                        <tr>
                            <th>所持</th>
                            <th>名前</th>
                            <th>覚醒</th>
                            <th>Lv</th>
                            <th>奥義Lv</th>
                            <th>専用</th>
                            <th>絆</th>
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