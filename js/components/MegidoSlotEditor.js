const MegidoSlotEditor = ({ megido, onSlotClick, onOrbClick, onReishouClick, onRemoveMegido, onRemoveReishou, onRemoveOrb, isLeader, ownedMegidoIds, megidoDetails, onStatChange }) => {
    
    // --- スタイル定義 ---
    const slotBaseStyle = {
        minHeight: '200px',
        padding: '0', 
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundColor: 'var(--bg-panel)',
    };

    const sectionStyle = {
        padding: '6px 8px',
        borderBottom: '1px solid var(--border-color-light)',
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
                <p onClick={onRemoveMegido} className={`megido-slot-name font-bold cursor-pointer hover:text-red-400 ${getStyleClass(megido.スタイル)}`}>
                    {megido.名前} {isLeader && <span style={{ color: 'var(--primary-accent)' }}>(L)</span>}
                </p>
                <div className="megido-slot-stats">
                    <select value={megido.level || 70} onChange={e => onStatChange('level', parseInt(e.target.value))} onClick={e => e.stopPropagation()} className="select-field megido-slot-stat-select">
                        {[70, 75, 77, 79, 80].map(lv => <option key={lv} value={lv}>{`Lv${lv}`}</option>)}
                    </select>
                    <select value={megido.ougiLevel || 1} onChange={e => onStatChange('ougiLevel', parseInt(e.target.value))} onClick={e => e.stopPropagation()} className="select-field megido-slot-stat-select">
                        {Array.from({length: 11}, (_, i) => i + 1).map(lv => <option key={lv} value={lv}>{`奥義${lv}`}</option>)}
                    </select>
                    {megido.専用霊宝 && 
                        <label className="flex items-center gap-1 cursor-pointer" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={megido.special_reishou} onChange={e => onStatChange('special_reishou', e.target.checked)} />
                            <span className="text-xs">専用</span>
                        </label>}
                    {megido.絆霊宝 && 
                        <select value={megido.bond_reishou || 0} onChange={e => onStatChange('bond_reishou', parseInt(e.target.value))} onClick={e => e.stopPropagation()} className="select-field megido-slot-stat-select">
                            {[0, 1, 2, 3].map(tier => <option key={tier} value={tier}>{formatBondReishou(tier)}</option>)}
                        </select>}
                    {megido.Singularity && (
                        <select
                            value={megido.singularity_level || 0}
                            onChange={e => onStatChange('singularity_level', parseInt(e.target.value))}
                            onClick={e => e.stopPropagation()}
                            className="select-field megido-slot-stat-select"
                        >
                            {[0, 1, 2, 3, 4].map(level => <option key={level} value={level}>{`凸${level}`}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {/* --- 中段: オーブ情報 --- */}
            <div className="orb-section" style={{...sectionStyle, flexShrink: 0}}>
                 <button onClick={megido.orb ? onRemoveOrb : onOrbClick} className="btn btn-secondary megido-slot-orb-btn">
                    {megido.orb?.name || 'オーブを選択...'}
                </button>
            </div>

            {/* --- 下段: 霊宝情報 --- */}
            <div className="reishou-section" style={{...sectionStyle, borderBottom: 'none', flexShrink: 0}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <p className="megido-slot-reishou-label">霊宝:</p>
                    {(megido.reishou?.length || 0) < 4 && <button onClick={onReishouClick} style={{ color: 'var(--primary-accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>+</button>}
                </div>
                <div style={{ minHeight: '38px' }}>
                    {(megido.reishou && megido.reishou.length > 0) ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 2px', alignItems: 'center' }}>
                            {megido.reishou.map((r, i) => 
                                <div key={i} className="reishou-chip" title={r.name} onClick={(e) => {e.stopPropagation(); onRemoveReishou(i);}}>
                                    {r.name.substring(0, 3)}
                                </div>
                            )}
                        </div>
                    ) : <p className="megido-slot-reishou-none">なし</p>}
                </div>
            </div>
        </div>
    );
};