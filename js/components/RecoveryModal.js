const RecoveryModal = ({ isOpen, onClose, onConfirm, title, message, showNumberInput = true, numberInputPlaceholder = "回復人数", showRecoveryAmountInput = false, fixedStyle = null }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [selectedStyle, setSelectedStyle] = React.useState(null);
    const [recoveryAmount, setRecoveryAmount] = React.useState(1);

    React.useEffect(() => {
        if (isOpen) {
            setInputValue('');
            setSelectedStyle(fixedStyle);
            setRecoveryAmount(1);
        }
    }, [isOpen, fixedStyle]);

    const handleConfirm = () => {
        const numberValue = showNumberInput ? parseInt(inputValue, 10) : null;
        if (selectedStyle && (!showNumberInput || (!isNaN(numberValue) && numberValue > 0))) {
            onConfirm(selectedStyle, numberValue, recoveryAmount);
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
                            onClick={() => !fixedStyle && setSelectedStyle(opt.value)}
                            className={`btn ${selectedStyle === opt.value ? 'btn-primary' : 'btn-secondary'} ${fixedStyle ? 'disabled' : ''}`}
                            style={{ flex: 1 }}
                            disabled={!!fixedStyle}
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

                {showRecoveryAmountInput && (
                    <div style={{ margin: '16px 0' }}>
                        <p>回復段階:</p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="radio"
                                    name="recoveryAmount"
                                    value={1}
                                    checked={recoveryAmount === 1}
                                    onChange={() => setRecoveryAmount(1)}
                                />
                                1段階
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input
                                    type="radio"
                                    name="recoveryAmount"
                                    value={2}
                                    checked={recoveryAmount === 2}
                                    onChange={() => setRecoveryAmount(2)}
                                />
                                2段階
                            </label>
                        </div>
                    </div>
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