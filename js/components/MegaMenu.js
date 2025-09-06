
const MegaMenu = ({ onClose, onSelect, currentKey, menuItems, layout = 'single' }) => {

    // Handle Escape key press
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleSelect = (key) => {
        onSelect(key);
        onClose();
    };

    const renderItem = (item) => (
        <div 
            key={item.key} 
            className={`mega-menu-item ${currentKey === item.key ? 'active' : ''}`}
            onClick={() => handleSelect(item.key)}
        >
            {item.icon && <img src={item.icon} alt={item.title} className="mega-menu-icon" />}
            <div className="mega-menu-text">
                <div className="mega-menu-title">{item.title}</div>
                {item.description && <div className="mega-menu-description">{item.description}</div>}
            </div>
        </div>
    );

    if (layout === 'columns') {
        const column1 = menuItems.slice(0, 5);
        const column2 = menuItems.slice(5);
        return (
            <div className="mega-menu-panel">
                <div className="mega-menu-column">
                    {column1.map(renderItem)}
                </div>
                <div className="mega-menu-column">
                    {column2.map(renderItem)}
                </div>
            </div>
        );
    }

    return (
        <div className="mega-menu-panel" style={{flexDirection: 'column', width: '480px', maxWidth: '480px'}}>
            {menuItems.map(renderItem)}
        </div>
    );
};
