const FilterableSelectionModal = ({ title, items, secondaryItems, onSelect, onClose, isOpen, renderItem, showFilters, initialSearch, isFormationSearch = false, filterType = 'megido', ...props }) => {
    const { useMemo, useState, useEffect, useRef } = React;
    const dialogRef = useRef(null);
    const [filters, setFilters] = useState({ text: '', style: 'All', clock: 'All', class: 'All', race: 'All', lineage: 'All', exactMatch: false });

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (initialSearch) {
                setFilters(f => ({ ...f, text: initialSearch.text || '', exactMatch: initialSearch.exactMatch || false }));
            }
        } else {
            dialogRef.current?.close();
            // Reset filters on close
            setFilters({ text: '', style: 'All', clock: 'All', class: 'All', race: 'All', lineage: 'All', exactMatch: false });
        }
    }, [isOpen, initialSearch]);

    const filterLogic = (item) => {
        const searchText = filters.text.toLowerCase();
        
        let searchMatch = filters.text === '';
        if (!searchMatch) {
            const name = (item.名前 || item.name || '').toLowerCase();
            if (isFormationSearch) {
                const tags = (item.tags || []).map(t => t.toLowerCase());
                searchMatch = name.includes(searchText) || tags.some(t => t.includes(searchText));
            } else {
                if (filters.exactMatch) {
                    searchMatch = name === searchText;
                } else {
                    const trait = (item.汎用特性 || item.trait || item.effects || '').toLowerCase();
                    searchMatch = name.includes(searchText) || trait.includes(searchText);
                }
            }
        }

        if (!searchMatch) return false;
        if (isFormationSearch) return true;

        switch (filterType) {
            case 'megido': {
                const styleMatch = !filters.style || filters.style === 'All' || item.スタイル === filters.style;
                const clockMatch = !filters.clock || filters.clock === 'All' || (item.時計 || '').startsWith(filters.clock);
                const classMatch = !filters.class || filters.class === 'All' || item.クラス === filters.class;
                return styleMatch && clockMatch && classMatch;
            }
            case 'orb': {
                if (!filters.race || filters.race === 'All') return true;
                return (item.race || '').includes(filters.race);
            }
            case 'reishou': {
                if (!filters.lineage || filters.lineage === 'All') return true;
                return item.lineage === filters.lineage;
            }
            default:
                return true;
        }
    };

    const filteredItems = useMemo(() => {
        let sourceItems = items || [];
        if (!showFilters && !isFormationSearch) return sourceItems;
        return sourceItems.filter(filterLogic);
    }, [items, filters, showFilters, isFormationSearch, filterType]);

    const filteredSecondaryItems = useMemo(() => {
        let sourceItems = secondaryItems || [];
        if (!showFilters && !isFormationSearch) return sourceItems;
        if (!sourceItems) return [];
        return sourceItems.filter(filterLogic);
    }, [secondaryItems, filters, showFilters, isFormationSearch, filterType]);

    const dialogStyle = isOpen ? {
        display: 'flex',
        flexDirection: 'column',
        height: '80vh',
        width: 'clamp(300px, 80vw, 600px)',
        padding: '0',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-panel)',
        color: 'var(--text-main)'
    } : {};

    const headerStyle = {
        flexShrink: 0,
        padding: '1rem 1rem 0 1rem'
    };
    
    const contentStyle = {
        flexGrow: 1,
        overflowY: 'auto',
        padding: '0 1rem'
    };

    const footerStyle = {
        flexShrink: 0,
        padding: '1rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color-light)'
    };

    return (
        <dialog ref={dialogRef} onClose={onClose} style={dialogStyle}>
            <div style={headerStyle}>
                <h3 className="card-header" style={{padding: '0 0 1rem 0', margin: 0}}>{title}</h3>
                {isFormationSearch && (
                    <div style={{ margin: '1rem 0' }}>
                        <input
                            type="text"
                            placeholder="編成名またはタグで検索..."
                            value={filters.text}
                            onChange={e => setFilters(f => ({ ...f, text: e.target.value }))}
                            className="input-field"
                            style={{ width: '100%' }}
                            autoFocus
                        />
                    </div>
                )}
                {showFilters && <FilterControls filters={filters} onFilterChange={(type, value) => setFilters(f => ({ ...f, [type]: value }))} filterType={filterType} />}
            </div>
            
            <div style={contentStyle}>
                <div className="modal-grid">
                    {filteredItems.map(item => renderItem(item, onSelect, props))}
                    {secondaryItems && filteredItems.length > 0 && <div className="modal-divider"></div>}
                    {secondaryItems && <h4 className="modal-subheader">その他の編成</h4>}
                    {filteredSecondaryItems && filteredSecondaryItems.map(item => renderItem(item, onSelect, props))}
                </div>
            </div>

            <div style={footerStyle}>
                <button onClick={onClose} className="btn modal-close-btn">閉じる</button>
            </div>
        </dialog>
    );
};