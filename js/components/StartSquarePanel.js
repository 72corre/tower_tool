const StartSquarePanel = ({ square, isLocked, lockText, onCreateFormation }) => {
    const { useState } = React;
    const [isHovered, setIsHovered] = useState({});

    const ghostButtonBaseStyle = {
        padding: '4px 8px',
        border: '1px solid var(--primary-accent)',
        color: 'var(--primary-accent)',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '12px',
        lineHeight: '1.5'
    };

    const ghostButtonHoverStyle = {
        ...ghostButtonBaseStyle,
        backgroundColor: 'var(--primary-accent)',
        color: 'var(--bg-panel, #2D2D2D)'
    };

    if (!square || !square.floor) {
        return <div>情報を読み込めませんでした。</div>;
    }

    const getTitle = (sq) => {
        if (!sq) return '探索';
        const subType = sq.sub_type;
        const style = sq.style || '';
        const styleText = style === 'RANDOM' ? 'ランダム' : style;

        switch (subType) {
            case 'recovery':
                return `コンディション回復（${styleText}）`;
            case 'tower_power':
                return '踏破力回復';
            case 'status_buff':
                return `ランダムバフ（${styleText}）`;
            case 'attack_buff':
                return `攻撃バフ（${styleText}）`;
            case 'defense_buff':
                return `防御バフ（${styleText}）`;
            case 'hp_buff':
                return `HPバフ（${styleText}）`;
            default:
                return '探索';
        }
    };

    const { floor } = square;
    const { squares } = floor;

    const battleSquares = Object.values(squares).filter(s => s.type === 'battle' || s.type === 'boss');
    const exploreSquares = Object.values(squares).filter(s => s.type === 'explore');

    const uniqueEnemies = [...new Set(battleSquares.flatMap(s => s.enemies || []))];

    return (
        <div className="p-4" style={{ position: 'relative' }}>
            {isLocked && <LockedPanelOverlay text={lockText} />}
            <h3 className="card-header">{floor.floor}F - スタート地点</h3>
            <div className="card mt-4">
                <h4 className="card-header">この階層の敵</h4>
                {uniqueEnemies.length > 0 ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px'}}>
                        {uniqueEnemies.map(enemy => (
                            <div key={enemy} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px' }}>
                                <span style={{ fontWeight: 'bold' }}>{enemy}</span>
                                <button
                                    onClick={() => onCreateFormation(enemy, floor.floor)}
                                    style={isHovered[enemy] ? ghostButtonHoverStyle : ghostButtonBaseStyle}
                                    onMouseEnter={() => setIsHovered(prev => ({...prev, [enemy]: true}))}
                                    onMouseLeave={() => setIsHovered(prev => ({...prev, [enemy]: false}))}
                                >
                                    新規編成作成
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-2 text-gray-400">戦闘マスはありません。</p>
                )}
            </div>
            <div className="card mt-4">
                <h4 className="card-header">この階層の探索マス</h4>
                {exploreSquares.length > 0 ? (
                    <ul className="list-disc list-inside mt-2">
                        {exploreSquares.map((s, i) => (
                            <li key={i}>{getTitle(s)}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-2 text-gray-400">探索マスはありません。</p>
                )}
            </div>
             <div className="card mt-4">
                <h4 className="card-header">階層テーマ</h4>
                <p className="mt-2">{floor.theme || 'なし'}</p>
            </div>
        </div>
    );
};