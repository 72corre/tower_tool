const { useState, useEffect, useMemo } = React;

const CommunityFormations = ({ onClose, onCopyFormation, onDeleteFormation, currentUser, ownedMegidoIds, showToastMessage, initialFloor, initialEnemy, initialHighlightId, initialMegidoName, userFormations, runHistory, megidoDetails, idMaps }) => {
    
    const [formations, setFormations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(!initialMegidoName);
    const [ratedInSession, setRatedInSession] = useState(new Set()); // 評価済みかをセッション内で管理

    // フィルタ条件を一つのstateで管理
    const [filters, setFilters] = useState({
        floor: initialFloor || '',
        enemy: initialEnemy || '',
        megidoName: initialMegidoName || '',
        hideNotOwned: true, // 未所持メギドを隠す
        excludeTags: { // 除外するタグ
            reishou: false,
            kizuna: false,
            totsu: false,
            orb_cast: false,
        }
    });

    useEffect(() => {
        // ユーザーが何か入力するまで検索を実行しない
        if (!filters.floor && !filters.enemy && !filters.megidoName) {
            setFormations([]);
            setIsLoading(false);
            return;
        }

        const fetchFormations = async () => {
            setIsLoading(true);
            try {
                const query = {};

                if (filters.floor) {
                    const floorNum = parseInt(filters.floor, 10);
                    if (!isNaN(floorNum)) {
                        query.floors_array_contains = floorNum;
                    }
                }

                if (filters.enemy) {
                    query.enemyName_katakana_eq = hiraganaToKatakana(filters.enemy.trim());
                }

                if (filters.megidoName) {
                    const term = filters.megidoName.trim();
                    const katakanaTerm = hiraganaToKatakana(term);
                    const hiraganaTerm = katakanaToHiragana(term);
                    const termsToSearch = [...new Set([katakanaTerm, hiraganaTerm])].filter(Boolean);
                    if (termsToSearch.length > 0) {
                        query.megidoNames_array_contains_any = termsToSearch;
                    }
                }

                const allFormations = await getCommunityFormations(query);

                if (allFormations.length > 0) {
                    const formationIds = allFormations.map(f => f.id);
                    const ratings = await getRatingsForFormations(formationIds);
                    const mergedFormations = allFormations.map(formation => ({
                        ...formation,
                        ...ratings[formation.id]
                    }));
                    setFormations(mergedFormations);
                } else {
                    setFormations([]);
                }

                setError(null);
            } catch (err) {
                console.error("Error fetching formations: ", err);
                setError('編成の読み込みに失敗しました。');
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchFormations();
        }, 500); // ユーザーの入力を500ms待ってからクエリを投げる

        return () => clearTimeout(timer);

    }, [filters.floor, filters.enemy, filters.megidoName]); // サーバーサイドフィルタのトリガー

    // クライアントサイドでのフィルタリング
    const filteredFormations = useMemo(() => {
        return formations.filter(data => {
            if (filters.hideNotOwned) {
                if (!data.megidoIds || data.megidoIds.length === 0) return true;
                const hasAllMegidos = data.megidoIds.every(megidoId => ownedMegidoIds.has(String(megidoId)));
                if (!hasAllMegidos) return false;
            }

            const tagValue = data.tagValue || 0;
            if (filters.excludeTags.reishou && (tagValue & 1)) return false;
            if (filters.excludeTags.kizuna && (tagValue & 2)) return false;
            if (filters.excludeTags.totsu && (tagValue & 4)) return false;
            if (filters.excludeTags.orb_cast && (tagValue & 8)) return false;

            return true;
        });
    }, [formations, filters.hideNotOwned, filters.excludeTags, ownedMegidoIds]);

    // ハイライトとスクロール処理
    useEffect(() => {
        if (initialHighlightId && filteredFormations.length > 0) {
            const targetElement = document.getElementById(`community-card-${initialHighlightId}`);
            if (targetElement) {
                // 少し待ってからスクロールしないと、レンダリングが間に合わない場合がある
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetElement.classList.add('highlight');
                    // 2秒後にハイライトを解除
                    setTimeout(() => {
                        targetElement.classList.remove('highlight');
                    }, 2000);
                }, 100);
            }
        }
    }, [filteredFormations, initialHighlightId]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleExcludeTagChange = (e) => {
        const { name, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            excludeTags: { ...prev.excludeTags, [name]: checked }
        }));
    };

    const enemyOptions = useMemo(() => {
        if (formations.length === 0) return [];
        const enemies = new Set();
        formations.forEach(f => {
            if(f.enemyName) enemies.add(f.enemyName);
        });
        return Array.from(enemies);
    }, [formations]);

    const handleRate = async (formationId, rating) => {
        if (ratedInSession.has(formationId)) {
            showToastMessage('この編成は既に評価済みです。', 'info');
            return;
        }

        // ユーザーがこの編成をコピーしたことがあるかチェック
        const hasUsedFormation = Object.values(userFormations).some(f => f.communityId === formationId);

        if (!hasUsedFormation) {
            showToastMessage('この編成を自分のリストにコピーしたユーザーのみ評価できます。', 'error');
            return;
        }

        await submitRating(formationId, rating);
        showToastMessage(`${rating}点で評価しました！`);

        setRatedInSession(prev => new Set(prev).add(formationId));

        // 楽観的更新: UIに即時反映させる
        setFormations(currentFormations => 
            currentFormations.map(f => {
                if (f.id === formationId) {
                    const newTotalRating = (f.total_rating || 0) + rating;
                    const newRatingCount = (f.rating_count || 0) + 1;
                    return {
                        ...f,
                        total_rating: newTotalRating,
                        rating_count: newRatingCount,
                    };
                }
                return f;
            })
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content w-full max-w-4xl h-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="settings-header flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">みんなの編成</h2>
                        <button onClick={() => setIsFilterVisible(!isFilterVisible)} className="btn btn-ghost btn-small">
                            {isFilterVisible ? 'フィルターを隠す' : 'フィルターを表示'}
                        </button>
                    </div>
                    <button onClick={onClose} className="btn-icon text-2xl font-bold">&times;</button>
                </div>

                {isFilterVisible && (
                    <div className="p-4 border-b animate-fade-in-down" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="number"
                                name="floor"
                                placeholder="階数"
                                value={filters.floor}
                                onChange={handleFilterChange}
                                className="input-field"
                            />
                            <input
                                type="text"
                                name="enemy"
                                placeholder="敵の名前"
                                value={filters.enemy}
                                onChange={handleFilterChange}
                                className="input-field"
                                list="enemy-options"
                            />
                            <input
                                type="text"
                                name="megidoName"
                                placeholder="メギド名"
                                value={filters.megidoName}
                                onChange={handleFilterChange}
                                className="input-field"
                            />
                            <datalist id="enemy-options">
                                {enemyOptions.map(opt => <option key={opt} value={opt} />)}
                            </datalist>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold mb-2">除外するタグ:</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    <label className="inline-flex items-center"><input type="checkbox" name="reishou" checked={filters.excludeTags.reishou} onChange={handleExcludeTagChange} /> <span className="ml-2" style={{ color: filters.excludeTags.reishou ? 'var(--primary-accent)' : 'inherit' }}>霊宝必須</span></label>
                                    <label className="inline-flex items-center"><input type="checkbox" name="kizuna" checked={filters.excludeTags.kizuna} onChange={handleExcludeTagChange} /> <span className="ml-2" style={{ color: filters.excludeTags.kizuna ? 'var(--primary-accent)' : 'inherit' }}>絆霊宝必須</span></label>
                                    <label className="inline-flex items-center"><input type="checkbox" name="totsu" checked={filters.excludeTags.totsu} onChange={handleExcludeTagChange} /> <span className="ml-2" style={{ color: filters.excludeTags.totsu ? 'var(--primary-accent)' : 'inherit' }}>凸必須</span></label>
                                    <label className="inline-flex items-center"><input type="checkbox" name="orb_cast" checked={filters.excludeTags.orb_cast} onChange={handleExcludeTagChange} /> <span className="ml-2" style={{ color: filters.excludeTags.orb_cast ? 'var(--primary-accent)' : 'inherit' }}>オーブキャスト不可</span></label>
                                </div>
                            </div>
                            <div>
                                 <p className="text-sm font-semibold mb-2">表示設定:</p>
                                 <label className="inline-flex items-center"><input type="checkbox" name="hideNotOwned" checked={filters.hideNotOwned} onChange={handleFilterChange} /> <span className="ml-2" style={{ color: filters.hideNotOwned ? 'var(--primary-accent)' : 'inherit' }}>未所持メギドを含む編成を隠す</span></label>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-grow overflow-y-auto p-4" style={{ backgroundColor: 'var(--bg-main)' }}>
                    {isLoading ? (
                        <div className="placeholder">読み込み中...</div>
                    ) : error ? (
                         <div className="placeholder text-danger">{error}</div>
                    ) : filteredFormations.length > 0 ? (
                        filteredFormations.map((data, index) => {
                            const hasUsed = Object.values(userFormations).some(f => f.communityId === data.id);
                            return (
                                <div id={`community-card-${data.id}`} key={data.id || index}>
                                    <CommunityFormationCard
                                        formationData={data}
                                        onCopy={onCopyFormation}
                                        onRate={handleRate}
                                        onDelete={onDeleteFormation}
                                        currentUser={currentUser}
                                        getMegido={getMegido}
                                        getOrb={getOrb}
                                        idMaps={idMaps}
                                        hasUsed={hasUsed}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="placeholder">
                            <p>条件に合う編成が見つかりませんでした。</p>
                            <p className="text-sm mt-2">検索条件や除外タグを見直してください。</p>
                        </div>
                    )}
                </div>

                <div className="settings-header flex justify-end">
                    <button onClick={onClose} className="btn btn-secondary">閉じる</button>
                </div>
            </div>
        </div>
    );
};