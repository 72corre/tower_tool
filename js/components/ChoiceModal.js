const ChoiceModal = ({ isOpen, onClose, onConfirm, title, message, options, closeOnConfirm = true }) => {
    if (!isOpen) {
        return null;
    }

    const handleConfirm = (option) => {
        if (onConfirm) {
            onConfirm(option);
        }
        if (closeOnConfirm) {
            onClose();
        }
    };

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

    const optionsContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '1rem',
        marginBottom: '1.5rem'
    };

    return (
        <div style={backdropStyle} onClick={onClose}>
            <dialog open className="card" style={dialogStyle} onClick={e => e.stopPropagation()}>
                <h3 className="card-header">{title}</h3>
                {message && <p style={{textAlign: 'center', marginBottom: '1rem'}}>{message}</p>}
                <div style={optionsContainerStyle}>
                    {options && options.map(option => (
                        <button key={option.value} onClick={() => handleConfirm(option.value)} disabled={option.disabled} className={`btn btn-primary ${option.disabled ? 'disabled' : ''}`}>
                            {option.label}
                        </button>
                    ))}
                </div>
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                </div>
            </dialog>
        </div>
    );
};
