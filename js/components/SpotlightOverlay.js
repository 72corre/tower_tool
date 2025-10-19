const SpotlightOverlay = ({ selector, text, onClose, onClick }) => {
    const { useState, useEffect, useRef } = React;
    const [targetRect, setTargetRect] = useState(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (selector) {
            const element = document.querySelector(selector);
            if (element) {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
            } else {
                setTargetRect(null); // セレクタが見つからない場合はリセット
            }
        } else {
            setTargetRect(null);
        }
    }, [selector]);

    if (!targetRect) {
        return null;
    }

    const padding = 10;
    const pathData = `
        M 0,0
        L ${window.innerWidth},0
        L ${window.innerWidth},${window.innerHeight}
        L 0,${window.innerHeight}
        Z
        M ${targetRect.left - padding},${targetRect.top - padding}
        L ${targetRect.right + padding},${targetRect.top - padding}
        L ${targetRect.right + padding},${targetRect.bottom + padding}
        L ${targetRect.left - padding},${targetRect.bottom + padding}
        Z
    `;

    const tooltipStyle = {
        position: 'absolute',
        padding: '15px 20px',
        background: 'var(--bg-panel)',
        color: 'var(--text-main)',
        borderRadius: '8px',
        border: '1px solid var(--primary-accent)',
        maxWidth: '300px',
        fontSize: '15px',
        lineHeight: '1.6',
        boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
        zIndex: 10003, // さらに上に
    };

    // ツールチップの位置を計算
    if (targetRect.top > window.innerHeight / 2) {
        // 要素が画面の下半分にある場合、上にツールチップを出す
        tooltipStyle.bottom = `${window.innerHeight - targetRect.top + padding + 10}px`;
    } else {
        // 要素が画面の上半分にある場合、下にツールチップを出す
        tooltipStyle.top = `${targetRect.bottom + padding + 10}px`;
    }
    if (targetRect.left > window.innerWidth / 2) {
        tooltipStyle.right = `${window.innerWidth - targetRect.right - padding}px`;
    } else {
        tooltipStyle.left = `${targetRect.left - padding}px`;
    }


    return (
        <div 
            ref={overlayRef} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10002 }}
            onClick={onClick || onClose}
        >
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <path d={pathData} fill="rgba(0, 0, 0, 0.7)" fillRule="evenodd" />
            </svg>
            <div style={tooltipStyle}>
                {text}
                <button onClick={onClose} style={{ display: 'block', marginTop: '15px', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', backgroundColor: 'var(--primary-accent)', color: 'var(--bg-main)' }}>
                    OK
                </button>
            </div>
        </div>
    );
};