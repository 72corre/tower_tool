const useGameData = ({ showToastMessage, runState, megidoConditions, planState }) => {
    const { useState, useCallback } = React;

    const [memos, setMemos] = useState(() => {
        const saved = localStorage.getItem('memos');
        return saved ? JSON.parse(saved) : {};
    });

    const [seasonLogs, setSeasonLogs] = useState(() => {
        const saved = localStorage.getItem('seasonLogs');
        return saved ? JSON.parse(saved) : [];
    });

    const [selectedLog, setSelectedLog] = useState(null);

    const [targetEnemies, setTargetEnemies] = useState(() => {
        const saved = localStorage.getItem('targetEnemies');
        return saved ? JSON.parse(saved) : {};
    });

    const handleSaveLog = useCallback(() => {
        const date = new Date();
        const defaultLogName = `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_シーズンの記録`;
        const logName = prompt("このログの名前を入力してください:", defaultLogName);
        if (logName) {
            const newLog = { name: logName, date: new Date().toISOString(), runState, megidoConditions, targetEnemies, planState };
            const newLogs = [...seasonLogs, newLog];
            setSeasonLogs(newLogs);
            localStorage.setItem('seasonLogs', JSON.stringify(newLogs));
            showToastMessage("現在の挑戦をログに保存しました。");
        }
    }, [runState, megidoConditions, targetEnemies, planState, seasonLogs, showToastMessage]);

    const handleDeleteLog = useCallback((logNameToDelete) => {
        if (window.confirm(`本当にログ「${logNameToDelete}」を削除しますか？この操作は元に戻せません。`)) {
            const newLogs = seasonLogs.filter(log => log.name !== logNameToDelete);
            setSeasonLogs(newLogs);
            localStorage.setItem('seasonLogs', JSON.stringify(newLogs));
            if (selectedLog && selectedLog.name === logNameToDelete) {
                setSelectedLog(null);
            }
            showToastMessage("ログを削除しました。");
        }
    }, [seasonLogs, selectedLog, showToastMessage]);

    const handleSelectLog = useCallback((log) => {
        setSelectedLog(log);
        if (log) {
            localStorage.setItem('ui_selectedLogName', log.name);
        } else {
            localStorage.removeItem('ui_selectedLogName');
        }
    }, []);

    const onSaveMemo = (square, memo) => {
        const memoKey = `${square.floor.floor}-${square.id}`;
        const newMemos = { ...memos, [memoKey]: memo };
        setMemos(newMemos);
        localStorage.setItem('memos', JSON.stringify(newMemos));
        showToastMessage('メモを保存しました。');
    };

    const handleTargetEnemyChange = (squareId, enemyName) => {
        const newTargetEnemies = { ...targetEnemies };
        if (newTargetEnemies[squareId] === enemyName) {
            delete newTargetEnemies[squareId];
        } else {
            newTargetEnemies[squareId] = enemyName;
        }
        setTargetEnemies(newTargetEnemies);
        localStorage.setItem('targetEnemies', JSON.stringify(newTargetEnemies));
        showToastMessage('ターゲットを変更しました。');
    };

    return {
        memos,
        onSaveMemo,
        seasonLogs,
        selectedLog,
        handleSaveLog,
        handleDeleteLog,
        handleSelectLog,
        targetEnemies,
        handleTargetEnemyChange,
    };
};
