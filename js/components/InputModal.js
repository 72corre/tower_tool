const InputModal = ({ isOpen, onClose, onConfirm, title, message, inputValue: initialValue = '' }) => {
    const [inputValue, setInputValue] = React.useState(initialValue);

    React.useEffect(() => {
        if (isOpen) {
            setInputValue(initialValue || '');
        }
    }, [isOpen, initialValue]);

    const handleConfirm = () => {
        const numberValue = parseInt(inputValue, 10);
        if (!isNaN(numberValue)) {
            onConfirm(numberValue);
        }
        onClose();
    };

    if (!isOpen) {
        return null;
    }

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

    const inputStyle = {
        width: '100px',
        textAlign: 'center',
        fontSize: '1.2rem',
        margin: '1rem auto',
        display: 'block'
    };

    return (
        <div style={backdropStyle} onClick={onClose}>
            <dialog open className="card" style={dialogStyle} onClick={e => e.stopPropagation()}>
                <h3 className="card-header">{title}</h3>
                <p style={{textAlign: 'center', marginBottom: '1rem'}}>{message}</p>
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="input-field"
                    style={inputStyle}
                    autoFocus
                />
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={onClose} className="btn btn-secondary">キャンセル</button>
                    <button onClick={handleConfirm} className="btn btn-primary">確定</button>
                </div>
            </dialog>
        </div>
    );
};