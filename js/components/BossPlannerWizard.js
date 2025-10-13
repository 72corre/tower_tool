const BossPlannerWizard = ({ isOpen, onClose, boss, guideText }) => {
    const e = React.createElement;

    if (!isOpen) {
        return null;
    }

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    };

    const contentStyle = {
        backgroundColor: 'var(--bg-panel)',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
    };

    const headerStyle = {
        borderBottom: '1px solid var(--border-color-light)',
        paddingBottom: '10px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    const bodyStyle = {
        overflowY: 'auto',
        flexGrow: 1
    };

    const footerStyle = {
        borderTop: '1px solid var(--border-color-light)',
        paddingTop: '20px',
        marginTop: '20px',
        textAlign: 'right'
    };

    return e('div', { style: overlayStyle, onClick: onClose },
        e('div', { style: contentStyle, onClick: (e) => e.stopPropagation() },
            e('div', { style: headerStyle },
                e('h2', { style: { margin: 0 } }, boss ? `${boss.name} 攻略計画` : 'ボス攻略計画'),
                e('button', { onClick: onClose, className: 'btn btn-ghost p-1' }, '×')
            ),
            e('div', { style: bodyStyle },
                e('div', { className: 'guide-text-panel card', style: { marginBottom: '20px', padding: '15px' } },
                    e('h3', { style: { marginTop: 0 } }, '攻略ガイド'),
                    e('p', { style: { whiteSpace: 'pre-wrap', margin: 0 } }, guideText || 'ガイド情報がありません。')
                ),
                e('div', { className: 'formation-editor-panel' },
                    e('h3', { style: { marginTop: 0 } }, '編成案'),
                    e('div', { className: 'placeholder', style: { padding: '20px', textAlign: 'center' } },
                        '（ここに編成エディタが表示されます）'
                    )
                )
            ),
            e('div', { style: footerStyle },
                e('button', { onClick: onClose, className: 'btn btn-secondary', style: { marginRight: '10px' } }, 'キャンセル'),
                e('button', { className: 'btn btn-primary' }, 'この編成でボスに挑む')
            )
        )
    );
};