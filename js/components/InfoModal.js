const InfoModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 2000 // Ensure it's on top
    };

    const contentStyle = {
        position: 'relative',
        background: 'var(--bg-panel)', 
        padding: '1.5rem',
        borderRadius: '8px', 
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--primary-accent)', 
        boxShadow: '0 5px 25px rgba(0,0,0,0.5)'
    };

    const titleStyle = {
        marginTop: 0, 
        textAlign: 'center',
        color: 'var(--primary-accent)',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color-light)'
    };

    const bodyStyle = {
        whiteSpace: 'pre-wrap', 
        lineHeight: 1.7,
        overflowY: 'auto',
        flexGrow: 1,
        paddingRight: '1rem', // for scrollbar
        marginRight: '-1rem' // offset padding
    };

    const footerStyle = {
        flexShrink: 0, 
        paddingTop: '1.5rem', 
        textAlign: 'center', 
        borderTop: '1px solid var(--border-color-light)', 
        marginTop: '1rem'
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
                <h3 style={titleStyle}>{title}</h3>
                <div style={bodyStyle}>
                    {children}
                </div>
                <div style={footerStyle}>
                    <button className="btn btn-primary" onClick={onClose}>閉じる</button>
                </div>
            </div>
        </div>
    );
};