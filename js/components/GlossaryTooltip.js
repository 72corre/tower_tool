
const GlossaryTooltip = ({ term, children }) => {
    const { glossaryData } = useAppContext();
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });

    if (!glossaryData || !glossaryData[term]) {
        return <>{children}</>;
    }

    const description = glossaryData[term];

    const handleMouseEnter = (e) => {
        const rect = e.target.getBoundingClientRect();
        setTooltipPosition({ 
            top: rect.top - 10, // Position above the element
            left: rect.left + rect.width / 2 // Center horizontally
        });
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    const tooltipStyle = {
        position: 'fixed',
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        transform: 'translate(-50%, -100%)',
        backgroundColor: 'var(--bg-panel, #2d2d2d)',
        color: 'var(--text-main, #f0f0f0)',
        padding: '10px 15px',
        borderRadius: '6px',
        border: '1px solid var(--primary-accent, #70f0e0)',
        zIndex: 11000, // Ensure it's on top
        width: '300px',
        maxWidth: '90vw',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        fontSize: '14px',
        lineHeight: '1.6',
        pointerEvents: 'none', // Allow mouse events to pass through
        opacity: showTooltip ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        visibility: showTooltip ? 'visible' : 'hidden',
    };

    return (
        <span 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
            style={{ textDecoration: 'underline dotted', cursor: 'help' }}
        >
            {children}
            {showTooltip && ReactDOM.createPortal(
                <div style={tooltipStyle}>
                    <h4 style={{marginTop: 0, color: 'var(--primary-accent, #70f0e0)', fontSize: '16px'}}>{term}</h4>
                    <p style={{margin: 0}}>{description}</p>
                </div>,
                document.body
            )}
        </span>
    );
};
