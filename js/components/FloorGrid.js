const getSquareIcon = (square) => {
    const basePath = 'asset/';
    let iconName = square.type;

    if (square.type === 'explore') {
        iconName = square.sub_type;
    }
    
    return `${basePath}${iconName}.webp`;
};

const MapNode = React.memo(({ squareId, index, floorData, handleSquareClick, activePreviewId, setActivePreviewId, getSquareStyle, getSquareColorClass, getSquareColorRgbVarName, memos, runState, mode }) => {
    if (!squareId) return <div style={{ height: '48px' }}></div>;
    const square = floorData.squares[squareId];
    if (!square) return <div style={{ height: '48px', border: '1px solid red' }}>?</div>;

    const getEnemyName = (enemy) => (typeof enemy === 'string' ? enemy : enemy.name);

    const memo = memos[`${floorData.floor}-${squareId}`];
    const isCurrentPos = mode === 'practice' && runState.currentPosition?.floor === floorData.floor && runState.currentPosition?.squareId === squareId;
    let nodeClasses = getSquareStyle(square, floorData, squareId);
    if (isCurrentPos) {
        nodeClasses += ' current-position';
    }

    const handleClick = (e) => {
        e.stopPropagation();
        handleSquareClick(floorData, square, squareId, index);
    };

    return (
        <div className={`map-node-container ${activePreviewId === squareId ? 'long-press-hover' : ''}`} data-square-id={squareId} onClick={handleClick}>
            <div 
                className={`map-node transparent-node ${nodeClasses}`}
            >
                <div 
                    className={`map-node-icon ${getSquareColorClass(square)}`}
                    style={{ 
                        backgroundImage: `url(${getSquareIcon(square)})`,
                        '--animation-color-rgb': getSquareColorRgbVarName(square)
                    }}
                ></div>
            </div>
            {memo && <div className="memo-tooltip">{memo}</div>}
            {(mode === 'practice' || mode === 'plan' || mode === 'log') && (square.type === 'battle' || square.type === 'boss') && (
                <div className="enemy-tooltip">
                    <h4 style={{margin: 0, paddingBottom: '4px', borderBottom: '1px solid var(--border-color-light)', fontSize:'14px', fontWeight: 700}}>出現エネミー</h4>
                    <ul style={{margin: '8px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        {(square.enemies && square.enemies.length > 0) ? (
                            square.enemies.map((enemy, index) => {
                                const enemyName = getEnemyName(enemy);
                                return <li key={`${enemyName}-${index}`} style={{fontSize: '12px'}}>{enemyName}</li>;
                            })
                        ) : (
                            <li style={{fontSize: '12px', color: 'var(--text-subtle)'}}>情報なし</li>
                        )}
                    </ul>
                </div>
            )}
            {(mode === 'practice' || mode === 'plan' || mode === 'log') && square.type === 'explore' && (
                <div className="enemy-tooltip">
                    <h4 style={{margin: 0, paddingBottom: '4px', borderBottom: '1px solid var(--border-color-light)', fontSize:'14px', fontWeight: 700}}>探索マス情報</h4>
                    <div style={{marginTop: '8px', fontSize: '12px'}}>
                        {
                            (() => {
                                const subTypeJp = EXPLORE_SUB_TYPE_MAP[square.sub_type] || '不明';
                                if (square.sub_type === 'tower_power') {
                                    return `塔破力回復`;
                                }
                                if ([square.sub_type === 'recovery'] .includes(square.sub_type)){
                                    const styleJp = STYLE_ABBREVIATION_MAP[square.style] || '不明';
                                    return `${styleJp}のコンディション回復`;
                                }
                                if (['attack_buff', 'defense_buff', 'hp_buff', 'status_buff'].includes(square.sub_type)) {
                                    const styleJp = STYLE_ABBREVIATION_MAP[square.style] || '不明';
                                    return `${styleJp}の${subTypeJp}`;
                                }
                                // Fallback for other types if any
                                const styleJp = STYLE_ABBREVIATION_MAP[square.style] || '不明';
                                return `${styleJp}の${subTypeJp}`;
                            })()
                        }
                    </div>
                </div>
            )}
        </div>
    );
});

const FloorGrid = React.memo(({ floorData, handleSquareClick, activePreviewId, setActivePreviewId, getSquareStyle, getSquareColorClass, getSquareColorRgbVarName, memos, activeFloor, targetFloor, selectedSquare, runState, mode, guidance }) => {
    const containerRef = React.useRef(null);

    const isGreyedOut = floorData.floor > targetFloor;

    const backgroundUrl = `asset/maps/floor-${floorData.floor}.svg`;
    
    const SQUARE_SIZE = 48;
    const GAP = 4;
    const numCols = floorData.layoutGrid[0].length;
    const numRows = floorData.layoutGrid.length;
    const gridWidth = numCols * SQUARE_SIZE + (numCols - 1) * GAP;
    const gridHeight = numRows * SQUARE_SIZE + (numRows - 1) * GAP;

    return (
        <div className={`floor-grid ${activeFloor === floorData.floor ? 'floor-highlight' : ''} ${isGreyedOut ? 'opacity-40' : ''}`}>
            <h3 className="floor-header">{floorData.floor}階 <span>(テーマ: {floorData.theme})</span></h3>
            <div 
                ref={containerRef} 
                style={{
                    position: 'relative',
                    width: `${gridWidth}px`,
                    height: `${gridHeight}px`,
                    margin: '0 auto', // Center the grid
                    backgroundImage: `url(${backgroundUrl})`,
                    backgroundSize: 'auto', // Use natural size
                    backgroundPosition: 'top left',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div style={{
                    position: 'relative', 
                    zIndex: 1, 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${numCols}, ${SQUARE_SIZE}px)`,
                    gap: `${GAP}px`, 
                    alignItems: 'center' 
                }}>
                    {floorData.layoutGrid.flat().map((squareId, index) => (
                        <MapNode 
                            key={`${floorData.floor}-${squareId}-${index}`}
                            squareId={squareId}
                            index={index}
                            floorData={floorData}
                            handleSquareClick={handleSquareClick}
                            activePreviewId={activePreviewId}
                            setActivePreviewId={setActivePreviewId}
                            getSquareStyle={getSquareStyle}
                            getSquareColorClass={getSquareColorClass}
                            getSquareColorRgbVarName={getSquareColorRgbVarName}
                            memos={memos}
                            runState={runState}
                            mode={mode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});