const useMegido = ({ showToastMessage }) => {
    const { useState, useCallback } = React;

    const [megidoDetails, setMegidoDetails] = useState(() => {
        const saved = localStorage.getItem('megidoDetails');
        return saved ? JSON.parse(saved) : {};
    });

    const handleMegidoDetailChange = useCallback((megidoId, key, value) => {
        setMegidoDetails(prevDetails => {
            const megidoData = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === String(megidoId));
            const oldMegidoDetail = prevDetails[megidoId] || {
                owned: false,
                level: 70,
                ougiLevel: 3,
                special_reishou: megidoData?.専用霊宝 || false,
                bond_reishou: 0,
                reishou: []
            };

            if (oldMegidoDetail[key] === value) {
                return prevDetails;
            }

            const newMegidoDetail = { ...oldMegidoDetail, [key]: value };

            const newDetails = {
                ...prevDetails,
                [megidoId]: newMegidoDetail
            };

            localStorage.setItem('megidoDetails', JSON.stringify(newDetails));
            return newDetails;
        });
    }, []);

    const handleMegidoDetailChangeWrapper = useCallback((arg1, key, value) => {
        if (typeof arg1 === 'object' && key === undefined && value === undefined) {
            setMegidoDetails(arg1);
            localStorage.setItem('megidoDetails', JSON.stringify(arg1));
            showToastMessage('所持メギド情報を更新しました。');
        } else {
            handleMegidoDetailChange(arg1, key, value);
        }
    }, [handleMegidoDetailChange]);

    const handleCheckDistributedMegido = useCallback(() => {
        if (typeof COMPLETE_MEGIDO_LIST === 'undefined') {
            alert('メギドデータが読み込まれていません。');
            return;
        }

        setMegidoDetails(prevDetails => {
            const newDetails = { ...prevDetails };
            let checkedCount = 0;
            COMPLETE_MEGIDO_LIST.forEach(megido => {
                if (megido.入手方法 && megido.入手方法.includes('配布')) {
                    if (!newDetails[megido.id] || !newDetails[megido.id].owned) {
                        if (!newDetails[megido.id]) {
                            newDetails[megido.id] = { owned: true, level: 70, ougiLevel: 3, special_reishou: megido.専用霊宝 || false, bond_reishou: 0, reishou: [] };
                        } else {
                            newDetails[megido.id].owned = true;
                        }
                        checkedCount++;
                    }
                }
            });

            if (checkedCount > 0) {
                localStorage.setItem('megidoDetails', JSON.stringify(newDetails));
                showToastMessage(`${checkedCount}体の配布メギドを所持チェックしました。`);
            } else {
                showToastMessage('チェック済みの配布メギドはありませんでした。');
            }
            return newDetails;
        });
    }, [showToastMessage]);

    return {
        megidoDetails,
        setMegidoDetails,
        handleMegidoDetailChange,
        handleMegidoDetailChangeWrapper,
        handleCheckDistributedMegido
    };
};