const MegidoSlotEditor = ({ megido, onSlotClick, onOrbClick, onReishouClick, onRemoveMegido, onRemoveReishou, onRemoveOrb, isLeader, ownedMegidoIds, megidoDetails, onStatChange }) => {
    
    // --- スタイル定義 ---
    const slotBaseStyle = {
        minHeight: '320px',
        padding: '0', // 内側のセクションでパディングを管理
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundColor: 'var(--bg-panel)',
    };

    const sectionStyle = {
        padding: '8px 12px',
        borderBottom: '1px solid var(--border-color-light)',
    };
    
    const reishouChipStyle = {
        display: 'inline-block',
        padding: '2px 6px',
        margin: '2px',
        borderRadius: '12px', // より丸く
        backgroundColor: 'var(--bg-main)',
        fontSize: '11px',
        border: '1px solid var(--border-color)',
        whiteSpace: 'nowrap',
        cursor: 'pointer', // タップ可能であることを示す
    };

    // --- 空きスロットのレンダリング ---
    if (!megido) {
        return (
            <div onClick={onSlotClick} className="card megido-slot-empty" style={{...slotBaseStyle, border: '2px dashed var(--border-color)', alignItems:'center', justifyContent:'center', cursor:'pointer', borderRadius: '8px'}}>
                <span style={{fontSize: '16px', color: 'var(--text-subtle)'}}>+</span>
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
        finalSlotStyle.outline = '2px solid var(--danger-color)';
        finalSlotStyle.outlineOffset = '-2px';
    }

    // --- レンダリング ---
    return (
        <div className="card" style={finalSlotStyle}>
            {/* --- 上段: メギド情報 --- */}
            <div className="megido-section" style={{...sectionStyle, flexGrow: 1}}>
                <p onClick={onRemoveMegido} className={`font-bold cursor-pointer hover:text-red-400 ${getStyleClass(megido.スタイル)}`} style={{ fontWeight: 700, cursor: 'pointer', fontSize: '16px', margin: 0, lineHeight: 1.2, marginBottom: '8px' }}>
                    {megido.名前} {isLeader && <span style={{ color: 'var(--primary-accent)' }}>(L)</span>}
                </p>
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
            <div className="orb-section" style={{...sectionStyle, flexShrink: 0}}>
                 <button onClick={megido.orb ? onRemoveOrb : onOrbClick} className="btn btn-secondary" style={{ width: '100%', textAlign: 'left', padding: '6px 8px', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{opacity: 0.7, marginRight: '4px'}}>オ:</span>{megido.orb?.name || '選択...'}
                </button>
            </div>

            {/* --- 下段: 霊宝情報 --- */}
            <div className="reishou-section" style={{...sectionStyle, borderBottom: 'none', flexShrink: 0}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 500, margin: 0, fontSize: '12px' }}>霊宝:</p>
                    {(megido.reishou?.length || 0) < 4 && <button onClick={onReishouClick} style={{ color: 'var(--primary-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>+</button>}
                </div>
                <div style={{ minHeight: '54px' }}>
                    {(megido.reishou && megido.reishou.length > 0) ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 4px', alignItems: 'center' }}>
                            {megido.reishou.map((r, i) => 
                                <div key={i} className="reishou-chip" style={reishouChipStyle} title={r.name} onClick={(e) => {e.stopPropagation(); onRemoveReishou(i);}}>
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