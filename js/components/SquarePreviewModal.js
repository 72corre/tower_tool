const SquarePreviewModal = ({ isOpen, onClose, squareInfo, onNavigate }) => {
    if (!isOpen || !squareInfo) return null;

    const { floor, square, id } = squareInfo;

    const handleNavigate = () => {
        onClose();
        onNavigate(floor, square, id);
    }

    const renderContent = () => {
        if (square.type === 'battle' || square.type === 'boss') {
            return (
                <>
                    <h4 style={{margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--border-color-light)', fontSize:'16px', fontWeight: 700}}>出現エネミー</h4>
                    <ul style={{margin: '12px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px'}}>
                        {(square.enemies && square.enemies.length > 0) ? (
                            square.enemies.map(enemyName => (
                                <li key={enemyName} style={{fontSize: '14px'}}>{enemyName}</li>
                            ))
                        ) : (
                            <li style={{fontSize: '14px', color: 'var(--text-subtle)'}}>情報なし</li>
                        )}
                    </ul>
                </>
            );
        } else if (square.type === 'explore') {
            const subTypeJp = EXPLORE_SUB_TYPE_MAP[square.sub_type] || '不明';
            let detailText = '';
            if (square.sub_type === 'tower_power') {
                detailText = `塔破力回復`;
            } else if (square.sub_type === 'recovery'){
                const styleJp = STYLE_ABBREVIATION_MAP[square.style] || '不明';
                detailText = `${styleJp}のコンディション回復`;
            } else if (['attack_buff', 'defense_buff', 'hp_buff', 'status_buff'].includes(square.sub_type)) {
                const styleJp = STYLE_ABBREVIATION_MAP[square.style] || '不明';
                detailText = `${styleJp}の${subTypeJp}`;
            } else {
                detailText = subTypeJp;
            }
            return (
                <>
                    <h4 style={{margin: 0, paddingBottom: '8px', borderBottom: '1px solid var(--border-color-light)', fontSize:'16px', fontWeight: 700}}>探索マス情報</h4>
                    <p style={{fontSize: '14px', marginTop: '12px'}}>{detailText}</p>
                </>
            );
        } else {
            return <p>プレビュー対象外のマスです。</p>;
        }
    };

    return (
        <div className="mobile-modal-overlay" onClick={onClose}>
            <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '400px'}}>
                <h3 style={{marginTop: 0, textAlign: 'center'}}>{floor.floor}F - {square.type}マス</h3>
                <div style={{margin: '16px 0'}}>
                    {renderContent()}
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '24px'}}>
                    <button onClick={handleNavigate} className="btn btn-primary">詳細へ</button>
                    <button onClick={onClose} className="btn btn-secondary">閉じる</button>
                </div>
            </div>
        </div>
    );
};