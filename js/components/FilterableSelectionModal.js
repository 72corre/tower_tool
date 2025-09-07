const FilterableSelectionModal = ({ title, items, secondaryItems, onSelect, onClose, isOpen, renderItem, showFilters, initialSearch, ...props }) => {
    const { useMemo, useState, useEffect, useRef } = React;
    const dialogRef = useRef(null);
    const [filters, setFilters] = useState({ text: '', style: 'All', clock: 'All', class: 'All', exactMatch: false });

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            if (initialSearch) {
                setFilters(f => ({ ...f, text: initialSearch.text || '', exactMatch: initialSearch.exactMatch || false }));
            }
        } else {
            dialogRef.current?.close();
            setFilters({ text: '', style: 'All', clock: 'All', class: 'All', exactMatch: false });
        }
    }, [isOpen, initialSearch]);

    const filteredItems = useMemo(() => {
        if (!showFilters) return items;
        return items.filter(item => {
            const searchText = filters.text.toLowerCase();
            
            let searchMatch = filters.text === '';
            if (!searchMatch) {
                const name = (item.名前 || item.name || '').toLowerCase();
                if (filters.exactMatch) {
                    searchMatch = name === searchText;
                } else {
                    const trait = (item.汎用特性 || item.trait || item.effects || '').toLowerCase();
                    searchMatch = name.includes(searchText) || trait.includes(searchText);
                }
            }

            const styleMatch = filters.style === 'All' || !item.スタイル || item.スタイル === filters.style;
            const clockMatch = filters.clock === 'All' || !item.時計 || (item.時計 || '').startsWith(filters.clock);
            const classMatch = filters.class === 'All' || !item.クラス || item.クラス === filters.class;

            if (!item.スタイル) { // オーブや霊宝の場合
                return searchMatch;
            }

            return searchMatch && styleMatch && clockMatch && classMatch;
        });
    }, [items, filters, showFilters]);

    const filteredSecondaryItems = useMemo(() => {
        if (!showFilters || !secondaryItems) return secondaryItems;
        return secondaryItems.filter(item => {
            const searchText = filters.text.toLowerCase();
            
            let searchMatch = filters.text === '';
            if (!searchMatch) {
                const name = (item.名前 || item.name || '').toLowerCase();
                if (filters.exactMatch) {
                    searchMatch = name === searchText;
                } else {
                    const trait = (item.汎用特性 || item.trait || item.effects || '').toLowerCase();
                    searchMatch = name.includes(searchText) || trait.includes(searchText);
                }
            }

            const styleMatch = filters.style === 'All' || !item.スタイル || item.スタイル === filters.style;
            const clockMatch = filters.clock === 'All' || !item.時計 || (item.時計 || '').startsWith(filters.clock);
            const classMatch = filters.class === 'All' || !item.クラス || item.クラス === filters.class;

            if (!item.スタイル) { // オーブや霊宝の場合
                return searchMatch;
            }

            return searchMatch && styleMatch && clockMatch && classMatch;
        });
    }, [secondaryItems, filters, showFilters]);

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
                {showFilters && <FilterControls filters={filters} onFilterChange={(type, value) => setFilters(f => ({ ...f, [type]: value }))} />}
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