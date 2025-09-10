const StatusBuffModal = ({ isOpen, onClose, onConfirm, expectationLevel }) => {
    const { useState, useEffect } = React;

    const [buffType, setBuffType] = useState('attack_buff');
    const [buffValue, setBuffValue] = useState('');
    const [towerPower, setTowerPower] = useState('');

    useEffect(() => {
        if (isOpen) {
            setBuffType('attack_buff');
            setBuffValue('');
            setTowerPower('');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const buffValueNum = parseInt(buffValue, 10);
        const towerPowerNum = parseInt(towerPower, 10) || 0;

        if (isNaN(buffValueNum) || buffValueNum <= 0) {
            alert('有効な上昇率(%)を入力してください。');
            return;
        }

        onConfirm({
            buffType,
            buffValue: buffValueNum,
            towerPowerRecovery: towerPowerNum
        });
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
        maxWidth: '90vw',
        backgroundColor: 'var(--bg-panel)',
        color: 'var(--text-main)'
    };

    return (
        <div style={backdropStyle} onClick={onClose}>
            <dialog open className="card" style={dialogStyle} onClick={e => e.stopPropagation()}>
                <h3 className="card-header">ステータス上昇記録</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <label className="label">上昇した能力</label>
                        <select value={buffType} onChange={e => setBuffType(e.target.value)} className="select-field">
                            <option value="attack_buff">攻撃力</option>
                            <option value="defense_buff">防御力</option>
                            <option value="hp_buff">HP</option>
                        </select>
                    </div>
                    <div>
                        <label className="label">上昇率 (%)</label>
                        <input
                            type="number"
                            value={buffValue}
                            onChange={e => setBuffValue(e.target.value)}
                            className="input-field"
                            placeholder="例: 5"
                            autoFocus
                        />
                    </div>
                    {expectationLevel === 3 && (
                        <div>
                            <label className="label">追加の塔破力回復 (期待度3ボーナス)</label>
                            <input
                                type="number"
                                value={towerPower}
                                onChange={e => setTowerPower(e.target.value)}
                                className="input-field"
                                placeholder="回復がなければ 0 or 空欄"
                            />
                        </div>
                    )}
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button onClick={onClose} className="btn btn-secondary">キャンセル</button>
                    <button onClick={handleConfirm} className="btn btn-primary">確定</button>
                </div>
            </dialog>
        </div>
    );
};