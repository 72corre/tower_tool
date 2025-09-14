const LogViewer = ({ logs, onSelectLog, selectedLog, formations = {}, selectedLogSquare, onSelectLogSquare, onDeleteLog, targetEnemies, towerConnections, isMobileView, activeTab }) => {
    const { useState, useEffect, useMemo } = React;
    const [logTab, setLogTab] = useState(isMobileView ? activeTab : 'all_summary');

    useEffect(() => {
        if (isMobileView) {
            setLogTab(activeTab);
        }
    }, [activeTab, isMobileView]);

    useEffect(() => {
        if (selectedLogSquare && !isMobileView) setLogTab('detail');
    }, [selectedLogSquare, isMobileView]);

    const allLogsSummaryData = useMemo(() => {
        if (!logs || typeof TOWER_MAP_DATA === 'undefined' || !towerConnections) return null;

        const enemyWinLoss = {};
        const megidoUsage = {};

        logs.forEach(log => {
            const history = log.runState?.history || [];
            const logTargetEnemies = log.targetEnemies || {}; // Use log-specific targets

            history.forEach(h => {
                if (h.type === 'battle') {
                    const enemyName = logTargetEnemies[h.squareId];
                    if (enemyName) {
                        if (!enemyWinLoss[enemyName]) {
                            enemyWinLoss[enemyName] = { wins: 0, losses: 0, retreats: 0, challenges: 0 };
                        }
                        enemyWinLoss[enemyName].challenges++;
                        if (h.result === 'win') enemyWinLoss[enemyName].wins++;
                        if (h.result === 'lose') enemyWinLoss[enemyName].losses++;
                        if (h.result === 'retreat') enemyWinLoss[enemyName].retreats++;
                    }
                }
            });

            history.forEach(h => {
                const processMegido = (items) => {
                    items.forEach(item => {
                        if (item) {
                            const megidoId = item.megidoId || item;
                            megidoUsage[megidoId] = (megidoUsage[megidoId] || 0) + 1;
                        }
                    });
                };

                if (h.type === 'battle' && h.formationId) {
                    const form = formations[h.formationId];
                    if (form?.megidoSlots) processMegido(form.megidoSlots);
                } else if (h.type === 'explore' && Array.isArray(h.megido)) {
                    processMegido(h.megido);
                }
            });
        });

        const sortedMegidoUsage = Object.entries(megidoUsage)
            .map(([id, count]) => ({
                id,
                name: COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(id))?.名前 || '不明',
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const enemyStats = Object.entries(enemyWinLoss).map(([name, data]) => ({
            name,
            ...data,
            winRate: data.challenges > 0 ? (data.wins / data.challenges) * 100 : 0
        })).sort((a, b) => b.challenges - a.challenges);

        const statsKey = 'towerPowerStats';
        const savedStatsRaw = localStorage.getItem(statsKey);
        const towerStats = savedStatsRaw ? JSON.parse(savedStatsRaw) : null;

        let avgTotalConsumption = null;
        if (towerStats && towerStats.runs && towerStats.runs.length > 0) {
            const total = towerStats.runs.reduce((sum, run) => sum + run.totalConsumed, 0);
            avgTotalConsumption = total / towerStats.runs.length;
        }

        const floorConsumptionData = {};
        TOWER_MAP_DATA.forEach(floorData => {
            const floor = floorData.floor;
            const connectionsForFloor = towerConnections[floor] || {};
            const distance = calculateShortestPath(floorData, connectionsForFloor);

            if (distance === -1) {
                floorConsumptionData[floor] = 'N/A';
                return;
            }

            if (floor >= 1 && floor <= 10) floorConsumptionData[floor] = distance + 2;
            else if (floor >= 11 && floor <= 20) floorConsumptionData[floor] = distance * 1.8;
            else if (floor >= 21 && floor <= 30) floorConsumptionData[floor] = distance * 2;
            else if (floor === 31) floorConsumptionData[floor] = distance * 5;
            else if (floor > 31 && floor <= 35) floorConsumptionData[floor] = distance + 3;
            else floorConsumptionData[floor] = distance; // Fallback
        });

        let hasRealData = false;
        if (towerStats && towerStats.floorAverages) {
            for (const floor in towerStats.floorAverages) {
                const data = towerStats.floorAverages[floor];
                if(data.count > 0) {
                    floorConsumptionData[floor] = data.totalConsumed / data.count;
                    hasRealData = true;
                }
            }
        }

        return { enemyStats, sortedMegidoUsage, avgTotalConsumption, floorConsumptionData, hasRealData };
    }, [logs, formations, towerConnections]);

    const summaryData = useMemo(() => {
        if (!selectedLog) return null;
        const history = selectedLog.runState.history;
        const winCount = history.filter(h => h.result === 'win').length;
        const loseCount = history.filter(h => h.result === 'lose').length;
        const totalBattles = winCount + loseCount;
        const winRate = totalBattles > 0 ? (winCount / totalBattles) * 100 : 0;
        const formationStats = {};
        const megidoUsage = {};

        const floorRanges = ['1-5', '6-10', '11-15', '16-20', '21-25', '26-30', '31-35'];

        history.forEach(h => {
            const floor = parseInt(h.floor, 10);
            if (isNaN(floor)) return;

            const floorRangeIndex = Math.floor((floor - 1) / 5);
            const floorRange = floorRanges[floorRangeIndex];

            const processMegido = (items) => {
                items.forEach(item => {
                    if (item) {
                        const megidoId = item.megidoId || item;
                        if (!megidoUsage[megidoId]) {
                            const megidoData = COMPLETE_MEGIDO_LIST.find(md => String(md.id) === String(megidoId));
                            megidoUsage[megidoId] = { 
                                name: megidoData?.名前 || '不明', 
                                totalUsage: 0,
                                usageByFloor: {}
                            };
                        }
                        megidoUsage[megidoId].totalUsage++;
                        if (!megidoUsage[megidoId].usageByFloor[floorRange]) {
                            megidoUsage[megidoId].usageByFloor[floorRange] = 0;
                        }
                        megidoUsage[megidoId].usageByFloor[floorRange]++;
                    }
                });
            };

            if (h.type === 'battle' && h.formationId) {
                const form = formations[h.formationId];
                if (form?.megidoSlots) processMegido(form.megidoSlots);
                if (!formationStats[h.formationId]) {
                    formationStats[h.formationId] = { name: form?.name || '不明な編成', usage: 0, wins: 0 };
                }
                formationStats[h.formationId].usage++;
                if (h.result === 'win') formationStats[h.formationId].wins++;
            } else if (h.type === 'explore' && Array.isArray(h.megido)) {
                processMegido(h.megido);
            }
        });

        const sortedFormationStats = Object.values(formationStats).sort((a, b) => b.usage - a.usage);
        const sortedMegidoUsage = Object.values(megidoUsage).sort((a, b) => b.totalUsage - a.totalUsage);

        return { winRate: winRate.toFixed(1), totalBattles, formationStats: sortedFormationStats, megidoUsage: sortedMegidoUsage, floorRanges };
    }, [selectedLog, formations]);

    const squareHistory = useMemo(() => {
        if (!selectedLog || !selectedLogSquare) return [];
        return selectedLog.runState.history.filter(h => 
            h.floor === String(selectedLogSquare.floor.floor) && h.squareId === selectedLogSquare.id
        );
    }, [selectedLog, selectedLogSquare]);

    const handleSelectLog = (e) => {
        const selectedLogName = e.target.value;
        if (!selectedLogName) {
            onSelectLog(null);
            setLogTab('all_summary');
            return;
        }
        const log = logs.find(l => l.name === selectedLogName);
        onSelectLog(log || null);
        if(onSelectLogSquare) onSelectLogSquare(null);
        setLogTab('summary');
    };

    const getEnemyName = (square) => {
        if (!square || !square.square || !square.square.enemies) return '不明なマス';
        const enemyNames = square.square.enemies.join(', ');
        return enemyNames || '不明な敵';
    };

    return (
        <div>
            {!isMobileView && (
                <>
                    <h2 className="card-header">シーズンログ閲覧</h2>
                    <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
                        <select onChange={handleSelectLog} className="select-field" style={{flexGrow: 1}} value={selectedLog ? selectedLog.name : ""}>
                            <option value="">ログを選択...</option>
                            {logs.map(log => <option key={log.date} value={log.name}>{log.name}</option>)}
                        </select>
                        <button onClick={() => onDeleteLog(selectedLog.name)} disabled={!selectedLog} className="btn btn-danger">削除</button>
                    </div>
                </>
            )}
            
            <div className="card">
                {!isMobileView && (
                    <div className="tabs" style={{borderBottom: '1px solid var(--border-color)', marginBottom: '16px'}}>
                        <button onClick={() => setLogTab('all_summary')} className={`tab-button ${logTab === 'all_summary' ? 'active' : ''}`}>通算サマリー</button>
                        <button onClick={() => setLogTab('summary')} disabled={!selectedLog} className={`tab-button ${logTab === 'summary' ? 'active' : ''}`}>シーズンサマリー</button>
                        <button onClick={() => setLogTab('detail')} disabled={!selectedLogSquare} className={`tab-button ${logTab === 'detail' ? 'active' : ''}`}>マス詳細</button>
                    </div>
                )}

                {logTab === 'all_summary' && allLogsSummaryData && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                        <div className="card">
                            <h3 className="card-header">エネミー別勝率</h3>
                            <div className="table-container" style={{maxHeight: '300px'}}>
                                <table>
                                    <thead><tr><th>エネミー名</th><th>挑戦回数</th><th>勝率</th><th>勝利/敗北/リタイア</th></tr></thead>
                                    <tbody>
                                        {allLogsSummaryData.enemyStats.map(e => (
                                            <tr key={e.name}>
                                                <td>{e.name}</td>
                                                <td>{e.challenges}</td>
                                                <td>{e.winRate.toFixed(1)}%</td>
                                                <td>{e.wins}/{e.losses}/{e.retreats}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="card">
                            <h3 className="card-header">メギド使用頻度 Top 5</h3>
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>順位</th><th>メギド名</th><th>使用回数</th></tr></thead>
                                    <tbody>
                                        {allLogsSummaryData.sortedMegidoUsage.map((m, index) => (
                                            <tr key={m.id}>
                                                <td>{index + 1}位</td>
                                                <td>{m.name}</td>
                                                <td>{m.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="card">
                             <h3 className="card-header">平均塔破力</h3>
                             <p>挑戦全体の平均消費塔破力: <strong>{allLogsSummaryData.avgTotalConsumption ? allLogsSummaryData.avgTotalConsumption.toFixed(2) : 'データなし'}</strong></p>
                             <h4 style={{marginTop: '16px'}}>階ごとの平均消費塔破力 (実績/推定)</h4>
                             <div className="table-container" style={{maxHeight: '300px'}}>
                                <table>
                                    <thead><tr><th>階</th><th>平均消費量</th></tr></thead>
                                    <tbody>
                                        {Object.entries(allLogsSummaryData.floorConsumptionData).map(([floor, avg]) => (
                                            <tr key={floor}>
                                                <td>{floor}F</td>
                                                <td>{typeof avg === 'number' ? avg.toFixed(2) : avg}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    </div>
                )}

                {logTab === 'summary' && selectedLog && summaryData && (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                        <div className="card">
                            <h3 className="card-header">全体統計</h3>
                            <p>総戦闘回数: {summaryData.totalBattles}回</p>
                            <p>勝率: {summaryData.winRate}%</p>
                        </div>
                        <div className="card">
                            <h3 className="card-header">編成使用率</h3>
                            <div className="table-container" style={{maxHeight: '300px'}}>
                                <table>
                                    <thead><tr><th>編成名</th><th>使用回数</th><th>勝率</th></tr></thead>
                                    <tbody>
                                        {summaryData.formationStats.map(f => (
                                            <tr key={f.name}>
                                                <td>{f.name}</td>
                                                <td>{f.usage}</td>
                                                <td>{f.usage > 0 ? ((f.wins / f.usage) * 100).toFixed(0) : 0}% ({f.wins}/{f.usage})</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="card">
                            <h3 className="card-header">メギド使用回数</h3>
                            <div className="table-container" style={{maxHeight: '400px'}}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>メギド名</th>
                                            {summaryData.floorRanges.map(range => <th key={range}>{range}F</th>)}
                                            <th>合計</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summaryData.megidoUsage.map(m => (
                                            <tr key={m.name}>
                                                <td>{m.name}</td>
                                                {summaryData.floorRanges.map(range => (
                                                    <td key={range}>{m.usageByFloor[range] || 0}</td>
                                                ))}
                                                <td>{m.totalUsage}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {logTab === 'detail' && selectedLogSquare && (
                    <div>
                        <h3 className="card-header">{selectedLogSquare.floor.floor}F - {getEnemyName(selectedLogSquare)} ({selectedLogSquare.id}) の履歴</h3>
                        {squareHistory.length > 0 ? (
                            <ul style={{display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0}}>
                                {squareHistory.map((h, i) => {
                                    const form = h.formationId && h.type === 'battle' ? formations[h.formationId] : null;
                                    const exploreMegidoNames = h.type === 'explore' && Array.isArray(h.megido) 
                                        ? h.megido.map(mId => (COMPLETE_MEGIDO_LIST.find(md => String(md.id) === String(mId))?.名前 || '不明')).join(', ')
                                        : '';
                                    return (
                                        <li key={i} className="card">
                                            <p>アクション: <span style={{fontWeight: 700}}>{h.result || h.type}</span></p>
                                            {form && <p>使用編成: {form.name}</p>}
                                            {exploreMegidoNames && <p>探索メンバー: {exploreMegidoNames}</p>}
                                            <p style={{fontSize: '12px', color: 'var(--text-subtle)'}}>{new Date(h.timestamp).toLocaleString()}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : <p>このマスの履歴はありません。</p>}
                    </div>
                )}
            </div>
        </div>
    );
};