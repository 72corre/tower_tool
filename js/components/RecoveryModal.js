const RecoveryModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [selectedStyle, setSelectedStyle] = React.useState(null);

    React.useEffect(() => {
        if (isOpen) {
            setInputValue('');
            setSelectedStyle(null);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const numberValue = parseInt(inputValue, 10);
        if (selectedStyle && !isNaN(numberValue) && numberValue > 0) {
            onConfirm(selectedStyle, numberValue);
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

    const dialogStyle = {
        zIndex: 1002,
        width: '400px',
        position: 'fixed',
        top: '25%',
        left: '50%',
        transform: 'translateX(-50%)'
    };

    return (
        <dialog open style={dialogStyle} className="card">
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

            <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="input-field"
                placeholder="回復人数"
                disabled={!selectedStyle}
            />
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button onClick={onClose} className="btn btn-secondary">キャンセル</button>
                <button onClick={handleConfirm} className="btn btn-primary" disabled={!selectedStyle || !inputValue}>確定</button>
            </div>
        </dialog>
    );
};