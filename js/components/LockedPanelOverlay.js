const LockedPanelOverlay = ({ text }) => {
    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(45, 45, 45, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderRadius: '8px',
        color: 'var(--danger-color)',
        fontSize: '2.5rem',
        fontWeight: 700,
        textShadow: '0 0 10px rgba(0,0,0,0.5)',
        pointerEvents: 'none', // Allow clicks to pass through if needed, though the panel should be disabled
    };

    return (
        <div style={overlayStyle}>
            {text}
        </div>
    );
};