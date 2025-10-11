
const RecommendationModal = ({ isOpen, onClose, recommendations, enemyName }) => {
    if (!isOpen || !recommendations) return null;

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
        zIndex: 1050
    };

    const dialogStyle = {
        zIndex: 1051,
        borderRadius: '8px',
        border: '1px solid #444',
        padding: '1.5rem',
        width: '500px',
        maxWidth: '90vw'
    };

    const renderMegidoList = (list) => {
        if (!list || list.length === 0) {
            return <p style={{ color: 'var(--text-subtle)', fontSize: '14px' }}>該当するメギドは見つかりませんでした。</p>;
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {list.map(({ megido, reason }) => (
                    <div key={megido.id} className="btn btn-secondary" style={{ textAlign: 'left', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontWeight: 500 }}>{megido.名前}</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-subtle)', margin: '4px 0 0' }}>{reason}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={backdropStyle} onClick={onClose}>
            <div className="card" style={dialogStyle} onClick={e => e.stopPropagation()}>
                <h3 className="card-header">攻略おすすめメギド ({enemyName})</h3>
                
                <div>
                    <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>アタッカー候補</h4>
                    {renderMegidoList(recommendations.attackers)}
                </div>

                <div>
                    <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>サポーター候補</h4>
                    {renderMegidoList(recommendations.supporters)}
                </div>

                 <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={onClose} className="btn btn-ghost">閉じる</button>
                </div>
            </div>
        </div>
    );
};
