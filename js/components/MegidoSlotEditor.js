const MegidoSlotEditor = ({ megido, onSlotClick, onOrbClick, onReishouClick, onRemoveMegido, onRemoveReishou, onRemoveOrb, isLeader, ownedMegidoIds, megidoDetails, onStatChange }) => {
    
    // --- スタイル定義 ---
    const slotBaseStyle = {
        minHeight: '320px', // 高さ固定
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // 中身を上下に分配
        boxSizing: 'border-box',
    };

    const reishouChipStyle = {
        display: 'inline-flex', // to align items inside
        alignItems: 'center',
        padding: '2px 6px',
        margin: '2px',
        borderRadius: '4px',
        backgroundColor: 'var(--bg-main)',
        fontSize: '10px',
        border: '1px solid var(--border-color)',
        whiteSpace: 'nowrap',
    };

    // --- 空きスロットのレンダリング ---
    if (!megido) {
        return (
            <div onClick={onSlotClick} className="card megido-slot-empty" style={{...slotBaseStyle, alignItems:'center', justifyContent:'center', cursor:'pointer'}}>
                <span style={{fontSize: '16px', color: 'var(--text-subtle)'}}>空きスロット</span>
            </div>
        );
    }
    
    // --- データ準備 ---
    const isOwned = ownedMegidoIds.has(String(megido.id));
    const ownedDetails = megidoDetails[megido.id] || {};

    const isSlotInvalid = () => {
        if (!isOwned) return true;
        if ((megido.level || 70) > (ownedDetails.level || 70)) return true;
        if ((megido.special_reishou || false) && !(ownedDetails.special_reishou || false)) return true;
        if ((megido.bond_reishou || 0) > (ownedDetails.bond_reishou || 0)) return true;
        if (megido.Singularity && (megido.singularity_level || 0) > (ownedDetails.singularity_level || 0)) return true;
        return false;
    };

    const formatBondReishou = (tier) => {
        switch (tier) {
            case 1: return '<真>';
            case 2: return '<剛>';
            case 3: return '<絆>';
            default: return 'なし';
        }
    };

    // --- スロットの動的スタイル ---
    const leaderStyle = isLeader ? { boxShadow: '0 0 8px var(--primary-accent)', border: '1px solid var(--primary-accent)' } : {};
    const finalSlotStyle = { ...slotBaseStyle, ...leaderStyle };
    if (isSlotInvalid()) {
        finalSlotStyle.backgroundColor = 'rgba(217, 83, 79, 0.3)';
    }

    // --- レンダリング ---
    return (
        <div className="card" style={finalSlotStyle}>
            {/* --- 上段: メギド情報 --- */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <p onClick={onSlotClick} className={`font-bold cursor-pointer hover:text-blue-400 ${getStyleClass(megido.スタイル)}`} style={{ fontWeight: 700, cursor: 'pointer', fontSize: '16px', margin: 0, lineHeight: 1.2 }}>
                        {megido.名前} {isLeader && <span style={{ color: 'var(--primary-accent)' }}>(L)</span>}
                    </p>
                    <button onClick={onRemoveMegido} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0, lineHeight: 0.8 }}>×</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', fontSize: '12px' }}>
                    <span>Lv: {megido.level || 70}</span>
                    <span>奥義: {megido.ougiLevel || 1}</span>
                    {megido.専用霊宝 && <span>専用霊宝: {megido.special_reishou ? '✓' : '✗'}</span>}
                    {megido.絆霊宝 && <span>絆霊宝: {formatBondReishou(megido.bond_reishou)}</span>}
                    {megido.Singularity && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>凸:</span>
                            <select
                                value={megido.singularity_level || 0}
                                onChange={e => onStatChange('singularity_level', parseInt(e.target.value))}
                                onClick={e => e.stopPropagation()}
                                className="select-field"
                                style={{ padding: '0 2px', fontSize: '11px', width: '100%' }}
                            >
                                {[0, 1, 2, 3, 4].map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 中段: オーブ情報 --- */}
            <div style={{ marginTop: 'auto' }}> {/* これで中段と下段が下に来る */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                    <button onClick={onOrbClick} className="btn btn-secondary" style={{ width: '100%', textAlign: 'left', padding: '6px 8px', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{opacity: 0.7, marginRight: '4px'}}>オ:</span>{megido.orb?.name || '選択...'}
                    </button>
                    {megido.orb && <button onClick={onRemoveOrb} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>}
                </div>
            </div>

            {/* --- 下段: 霊宝情報 --- */}
            <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 500, margin: 0, fontSize: '12px' }}>霊宝:</p>
                    {(megido.reishou?.length || 0) < 4 && <button onClick={onReishouClick} style={{ color: 'var(--primary-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>+</button>}
                </div>
                <div className="card" style={{ padding: '4px', backgroundColor: 'var(--bg-main)', minHeight: '58px' }}>
                    {(megido.reishou && megido.reishou.length > 0) ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 4px', alignItems: 'center' }}>
                            {megido.reishou.map((r, i) => 
                                <div key={i} className="reishou-chip" style={reishouChipStyle} title={r.name}>
                                    <span onClick={(e) => {e.stopPropagation(); onRemoveReishou(i);}} style={{cursor: 'pointer', color: 'var(--danger-color)', marginRight: '4px', fontWeight: 'bold'}}>×</span>
                                    {r.name.substring(0, 3)}
                                </div>
                            )}
                        </div>
                    ) : <p style={{ color: 'var(--text-subtle)', margin: 0, fontSize: '12px', textAlign: 'center' }}>なし</p>}
                </div>
            </div>
        </div>
    );
};