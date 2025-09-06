const MegidoSlotEditor = ({ megido, onSlotClick, onOrbClick, onReishouClick, onRemoveMegido, onRemoveReishou, onRemoveOrb, isLeader, ownedMegidoIds, megidoDetails, onStatChange }) => {
    if (!megido) return <div onClick={onSlotClick} className="card megido-slot-empty" style={{height: '100%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}>空きスロット</div>;
    
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

    const leaderStyle = isLeader ? {boxShadow: '0 0 8px var(--primary-accent)', border: '1px solid var(--primary-accent)'} : {};
    const slotStyle = {
        ...leaderStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px'
    };

    if (isSlotInvalid()) {
        slotStyle.backgroundColor = 'rgba(217, 83, 79, 0.3)';
    }

    const DetailDisplay = ({ label, formationValue, ownedValue, isHigherBetter = true }) => {
        const isDifferent = isHigherBetter ? formationValue > ownedValue : formationValue !== ownedValue;
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{label}:</span>
                <span style={{ fontWeight: 'bold' }}>
                    {formationValue}
                    {isOwned && isDifferent && <span style={{ color: 'var(--warning-color)', marginLeft: '8px' }}>({ownedValue})</span>}
                </span>
            </div>
        );
    };
    
    const BoolDetailDisplay = ({ label, formationValue, ownedValue }) => {
        const isDifferent = formationValue && !ownedValue;
        const formatBool = (val) => val ? '✓' : '✗';
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{label}:</span>
                <span style={{ fontWeight: 'bold' }}>
                    {formatBool(formationValue)}
                    {isOwned && isDifferent && <span style={{ color: 'var(--warning-color)', marginLeft: '8px' }}>({formatBool(ownedValue)})</span>}
                </span>
            </div>
        );
    };


    return (
        <div className="card" style={slotStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p onClick={onSlotClick} className={`font-bold cursor-pointer hover:text-blue-400 ${getStyleClass(megido.スタイル)}`} style={{fontWeight: 700, cursor: 'pointer', fontSize: '16px'}}>{megido.名前} {isLeader && <span style={{color: 'var(--primary-accent)'}}>(L)</span>}</p>
                <button onClick={onRemoveMegido} style={{color: 'var(--danger-color)', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}>×</button>
            </div>

            {/* Details Display */}
            <div style={{fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                <DetailDisplay label="Lv" formationValue={megido.level || 70} ownedValue={ownedDetails.level || 70} />
                <p>奥義Lv: {megido.ougiLevel || 1}</p>
                {megido.専用霊宝 && <BoolDetailDisplay label="専用霊宝" formationValue={megido.special_reishou || false} ownedValue={ownedDetails.special_reishou || false} />}
                {megido.絆霊宝 && <DetailDisplay label="絆霊宝" formationValue={`T${megido.bond_reishou || 0}`} ownedValue={`T${ownedDetails.bond_reishou || 0}`} />}
                {megido.Singularity && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>凸:</span>
                        <select
                            value={megido.singularity_level || 0}
                            onChange={e => onStatChange('singularity_level', parseInt(e.target.value))}
                            onClick={e => e.stopPropagation()}
                            className="select-field"
                            style={{ padding: '2px 4px', fontSize: '12px' }}
                        >
                            {[0, 1, 2, 3, 4].map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Orb and Reishou List */}
            <div style={{fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px'}}>
                    <button onClick={onOrbClick} className="btn btn-secondary" style={{width: '100%', textAlign: 'left', padding: '4px 8px'}}>オーブ: {megido.orb?.name || '選択'}</button>
                    {megido.orb && <button onClick={onRemoveOrb} style={{color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer'}}>x</button>}
                </div>
                <div className="card" style={{padding: '8px', backgroundColor: 'var(--bg-main)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <p style={{fontWeight: 500, margin: 0}}>霊宝:</p>
                        {(megido.reishou?.length || 0) < 4 && <button onClick={onReishouClick} style={{color: 'var(--primary-accent)', background: 'none', border: 'none', cursor: 'pointer'}}>+ 追加</button>}
                    </div>
                    {(megido.reishou && megido.reishou.length > 0) ? megido.reishou.map((r, i) => 
                        <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span>- {r.name}</span><button onClick={(e) => {e.stopPropagation(); onRemoveReishou(i);}} style={{color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer'}}>x</button></div>
                    ) : <p style={{color: 'var(--text-subtle)', margin: '4px 0'}}>なし</p>}
                </div>
            </div>
        </div>
    );
};