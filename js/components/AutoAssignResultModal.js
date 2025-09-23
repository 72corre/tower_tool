const AutoAssignResultModal = ({ isOpen, onClose, result, onSelectParty, onRetry }) => {
    if (!isOpen || !result) return null;

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

    const handleSelect = (party) => {
        onSelectParty(party);
        onClose();
    };

    return (
        <div style={backdropStyle} onClick={onClose}>
            <div className="card" style={dialogStyle} onClick={e => e.stopPropagation()}>
                <h3 className="card-header">おまかせ編成 結果</h3>
                {result.success ? (
                    <div>
                        <p>以下の組み合わせが見つかりました。クリックで選択できます。</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                            {result.combinations.map((combo, index) => (
                                <button key={index} className="btn btn-secondary" onClick={() => handleSelect(combo.party)} style={{textAlign: 'left', padding: '12px'}}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <span style={{fontWeight: 500}}>
                                            {combo.party.map(m => m.名前).join(', ')}
                                        </span>
                                        <span style={{ fontWeight: 'bold' }}>
                                            計: {combo.totalPower}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p>条件に合う組み合わせが見つかりませんでした。</p>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="btn btn-primary" onClick={() => onRetry({ lowerExpectation: true })}>
                                目標期待度を下げて再検索
                            </button>
                            <button className="btn btn-primary" onClick={() => onRetry({ includeGoodCondition: true })}>
                                「好調」のメギドを含めて再検索
                            </button>
                        </div>
                    </div>
                )}
                 <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={onClose} className="btn btn-ghost">閉じる</button>
                </div>
            </div>
        </div>
    );
};