const RecoveryModal = ({ isOpen, onClose, onConfirm, title, message, showNumberInput = true, numberInputPlaceholder = "回復人数" }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [selectedStyle, setSelectedStyle] = React.useState(null);

    React.useEffect(() => {
        if (isOpen) {
            setInputValue('');
            setSelectedStyle(null);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (showNumberInput) {
            const numberValue = parseInt(inputValue, 10);
            if (selectedStyle && !isNaN(numberValue) && numberValue > 0) {
                onConfirm(selectedStyle, numberValue);
            }
        } else {
            if (selectedStyle) {
                onConfirm(selectedStyle, null);
            }
        }
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    const styleOptions = [
        { text: 'ラッシュ', value: 'R' },
        { text: 'カウンター', value: 'C' },
        { text: 'バースト', value: 'B' }
    ];

    const backdropStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    };

    const dialogStyle = {
        zIndex: 1001,
        borderRadius: '8px',
        border: '1px solid #444',
        padding: '1.5rem',
        width: '400px',
        maxWidth: '90vw'
    };

    return (
        <div style={backdropStyle} onClick={onClose}>
            <div className="card" style={dialogStyle} onClick={e => e.stopPropagation()}>
                <h3 className="card-header">{title}</h3>
                <p>{message}</p>
                
                <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
                    {styleOptions.map(opt => (
                        <button 
                            key={opt.value} 
                            onClick={() => setSelectedStyle(opt.value)}
                            className={`btn ${selectedStyle === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ flex: 1 }}
                        >
                            {opt.text}
                        </button>
                    ))}
                </div>

                {showNumberInput && (
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="input-field"
                        placeholder={numberInputPlaceholder}
                        disabled={!selectedStyle}
                    />
                )}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                        onClick={handleConfirm} 
                        className="btn btn-primary" 
                        disabled={!selectedStyle || (showNumberInput && !inputValue)}
                    >
                        確定
                    </button>
                </div>
            </div>
        </div>
    );
};