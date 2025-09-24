const getSquareIcon = (square) => {
    const basePath = 'asset/';
    let iconName = square.type;

    if (square.type === 'explore') {
        iconName = square.sub_type;
    }
    
    return `${basePath}${iconName}.webp`;
};

const MapNode = React.memo(({ squareId, index, floorData, handleSquareClick, getSquareStyle, getSquareColorClass, getSquareColorRgbVarName, memos, runState, mode }) => {
    if (!squareId) return <div style={{ height: '48px' }}></div>;
    const square = floorData.squares[squareId];
    if (!square) return <div style={{ height: '48px', border: '1px solid red' }}>?</div>;

    const memo = memos[`${floorData.floor}-${squareId}`];
    const isCurrentPos = mode === 'practice' && runState.currentPosition?.floor === floorData.floor && runState.currentPosition?.squareId === squareId;
    let nodeClasses = getSquareStyle(square, floorData, squareId);
    if (isCurrentPos) {
        nodeClasses += ' current-position';
    }

    return (
        <div className="map-node-container" data-square-id={squareId}>
            <div 
                onClick={() => handleSquareClick(floorData, square, squareId, index)} 
                className={`map-node ${nodeClasses}`}
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
                            square.enemies.map(enemyName => (
                                <li key={enemyName} style={{fontSize: '12px'}}>{enemyName}</li>
                            ))
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

const FloorGrid = React.memo(({ floorData, handleSquareClick, getSquareStyle, getSquareColorClass, getSquareColorRgbVarName, memos, activeFloor, targetFloor, selectedSquare, runState, mode, guidance }) => {
    const containerRef = React.useRef(null);
    const [lineCoords, setLineCoords] = React.useState([]);

    React.useEffect(() => {
        if (!containerRef.current) return;

        const calculateLineCoordinates = () => {
            const newCoords = [];
            const squareElements = containerRef.current.querySelectorAll('[data-square-id]');
            const elementsMap = new Map();
            squareElements.forEach(el => elementsMap.set(el.dataset.squareId, el));
            const floorSquareIds = new Set(Object.keys(floorData.squares));

            for (const startId in connections) {
                if (floorSquareIds.has(startId)) {
                    const startElement = elementsMap.get(startId);
                    if (startElement) {
                        connections[startId].forEach(endId => {
                            // To avoid drawing lines twice, we only draw from the "smaller" ID to the "larger" one
                            if (floorSquareIds.has(endId) && startId < endId) {
                                const endElement = elementsMap.get(endId);
                                if (endElement) {
                                    const containerRect = containerRef.current.getBoundingClientRect();
                                    const startRect = startElement.getBoundingClientRect();
                                    const endRect = endElement.getBoundingClientRect();
                                    
                                    newCoords.push({
                                        startId,
                                        endId,
                                        x1: startRect.left + startRect.width / 2 - containerRect.left,
                                        y1: startRect.top + startRect.height / 2 - containerRect.top,
                                        x2: endRect.left + endRect.width / 2 - containerRect.left,
                                        y2: endRect.top + endRect.height / 2 - containerRect.top,
                                    });
                                }
                            }
                        });
                    }
                }
            }
            setLineCoords(newCoords);
        };

        // Initial calculation
        calculateLineCoordinates();

        // Recalculate on window resize
        window.addEventListener('resize', calculateLineCoordinates);
        return () => {
            window.removeEventListener('resize', calculateLineCoordinates);
        };

    }, [floorData]); // Dependency is only on floorData, not on runState etc.

    const isGreyedOut = floorData.floor > targetFloor;
    const isPastFloor = runState.currentPosition?.floor > floorData.floor;
    const clearedSquaresOnFloor = runState.cleared[floorData.floor] || [];

    return (
        <div className={`floor-grid ${activeFloor === floorData.floor ? 'floor-highlight' : ''} ${isGreyedOut ? 'opacity-40' : ''} ${isPastFloor ? 'past-floor' : ''}`}>
            <h3 className="floor-header">{floorData.floor}階 <span>(テーマ: {floorData.theme})</span></h3>
            <div ref={containerRef} style={{ position: 'relative' }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                    {lineCoords.map((line, i) => {
                        const isStartCleared = clearedSquaresOnFloor.includes(line.startId);
                        const isEndCleared = clearedSquaresOnFloor.includes(line.endId);
                        
                        let lineClass = 'map-line';
                        if (mode === 'practice') {
                            if (isStartCleared && isEndCleared) {
                                lineClass = 'line-traversed';
                            } else if (isStartCleared && !isEndCleared) {
                                if (guidance.recommended === line.endId) {
                                    lineClass = 'line-recommended';
                                } else if (guidance.candidates.hasOwnProperty(line.endId)) {
                                    lineClass = 'line-candidate';
                                }
                            } else if (!isStartCleared && isEndCleared) {
                                if (guidance.recommended === line.startId) {
                                    lineClass = 'line-recommended';
                                } else if (guidance.candidates.hasOwnProperty(line.startId)) {
                                    lineClass = 'line-candidate';
                                }
                            }
                        } else if (mode === 'plan') {
                            lineClass = 'line-plan';
                        }

                        return <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} className={lineClass} />;
                    })}
                </svg>
                <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: `repeat(${floorData.layoutGrid[0].length}, 1fr)`, gap: '4px', alignItems: 'center' }}>
                    {floorData.layoutGrid.flat().map((squareId, index) => (
                        <MapNode 
                            key={`${floorData.floor}-${squareId}-${index}`}
                            squareId={squareId}
                            index={index}
                            floorData={floorData}
                            handleSquareClick={handleSquareClick}
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