const { useState, useEffect, useMemo } = React;

const CommunityFormations = ({ onClose, onCopyFormation, onDeleteFormation, currentUser, ownedMegidoIds, showToastMessage, initialFloor, initialEnemy, initialHighlightId, userFormations, runHistory, megidoDetails, idMaps }) => {
    
    const [formations, setFormations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [ratedInSession, setRatedInSession] = useState(new Set()); // 評価済みかをセッション内で管理

    // フィルタ条件を一つのstateで管理
    const [filters, setFilters] = useState({
        floor: initialFloor || '',
        enemy: initialEnemy || '',
        megidoName: '',
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
                const filterTerm = (filters.megidoName || filters.enemy || '').trim();
                const katakanaTerm = hiraganaToKatakana(filterTerm);
                const hiraganaTerm = katakanaToHiragana(filterTerm);
                
                const termsToSearch = [...new Set([katakanaTerm, hiraganaTerm])].filter(Boolean);

                let allFormations = [];
                const query = {};
                if (filters.floor) {
                    query.floor = filters.floor;
                }

                if (termsToSearch.length > 0) {
                    const promises = termsToSearch.map(term => getCommunityFormations({ ...query, searchTerm: term }));
                    const results = await Promise.all(promises);
                    const flattenedResults = results.flat();
                    // Merge and remove duplicates
                    const uniqueIds = new Set();
                    allFormations = flattenedResults.filter(f => {
                        if (uniqueIds.has(f.id)) {
                            return false;
                        } else {
                            uniqueIds.add(f.id);
                            return true;
                        }
                    });
                } else if (Object.keys(query).length > 0) {
                    allFormations = await getCommunityFormations(query);
                }

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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col text-gray-900 dark:text-gray-100" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">みんなの編成</h2>
                        <button onClick={() => setIsFilterVisible(!isFilterVisible)} className="text-sm text-blue-500 hover:underline">
                            {isFilterVisible ? 'フィルターを隠す' : 'フィルターを表示'}
                        </button>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
                </div>

                {isFilterVisible && (
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 animate-fade-in-down">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="number"
                                name="floor"
                                placeholder="階数"
                                value={filters.floor}
                                onChange={handleFilterChange}
                                className="p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            />
                            <input
                                type="text"
                                name="enemy"
                                placeholder="敵の名前"
                                value={filters.enemy}
                                onChange={handleFilterChange}
                                className="p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                list="enemy-options"
                            />
                            <input
                                type="text"
                                name="megidoName"
                                placeholder="メギド名"
                                value={filters.megidoName}
                                onChange={handleFilterChange}
                                className="p-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            />
                            <datalist id="enemy-options">
                                {enemyOptions.map(opt => <option key={opt} value={opt} />)}
                            </datalist>
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold mb-2">除外するタグ:</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-2">
                                    <label className="inline-flex items-center"><input type="checkbox" className="rounded" name="reishou" checked={filters.excludeTags.reishou} onChange={handleExcludeTagChange} /> <span className="ml-2">霊宝必須</span></label>
                                    <label className="inline-flex items-center"><input type="checkbox" className="rounded" name="kizuna" checked={filters.excludeTags.kizuna} onChange={handleExcludeTagChange} /> <span className="ml-2">絆霊宝必須</span></label>
                                    <label className="inline-flex items-center"><input type="checkbox" className="rounded" name="totsu" checked={filters.excludeTags.totsu} onChange={handleExcludeTagChange} /> <span className="ml-2">凸必須</span></label>
                                    <label className="inline-flex items-center"><input type="checkbox" className="rounded" name="orb_cast" checked={filters.excludeTags.orb_cast} onChange={handleExcludeTagChange} /> <span className="ml-2">オーブキャスト不可</span></label>
                                </div>
                            </div>
                            <div>
                                 <p className="text-sm font-semibold mb-2">表示設定:</p>
                                 <label className="inline-flex items-center"><input type="checkbox" className="rounded" name="hideNotOwned" checked={filters.hideNotOwned} onChange={handleFilterChange} /> <span className="ml-2">未所持メギドを含む編成を隠す</span></label>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 flex-grow overflow-y-auto bg-gray-100 dark:bg-gray-900">
                    {isLoading ? (
                        <div className="text-center text-gray-500 pt-10">読み込み中...</div>
                    ) : error ? (
                         <div className="text-center text-red-500 pt-10">{error}</div>
                    ) : filteredFormations.length > 0 ? (
                        filteredFormations.map((data, index) => {
                            const hasUsed = Object.values(userFormations).some(f => f.communityId === data.id);
                            return (
                                <div id={`community-card-${data.id}`} key={data.id || index}>
                                    <CommunityFormationCard
                                        formationData={data}
                                        onCopy={onCopyFormation}
                                        onRate={handleRate}
                                        onDelete={onDeleteFormation} // ★ 追加
                                        currentUser={currentUser} // ★ 追加
                                        getMegido={getMegido}
                                        getOrb={getOrb}
                                        idMaps={idMaps}
                                        hasUsed={hasUsed}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-500 pt-10">
                            <p>条件に合う編成が見つかりませんでした。</p>
                            <p className="text-sm mt-2">検索条件や除外タグを見直してください。</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t text-right sticky bottom-0 bg-white dark:bg-gray-800 z-10 border-gray-200 dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500">閉じる</button>
                </div>
            </div>
        </div>
    );
};