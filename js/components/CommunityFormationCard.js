const CommunityFormationCard = ({ formationData, onCopy, getMegido, getOrb, rating, onRate }) => {
    const { formation, floor, enemy, tags, memo } = formationData;

    const handleRate = (newRating) => {
        const formationId = getFormationId(formation);
        if (formationId) {
            onRate(formationId, newRating);
        }
    };

    const avgRating = rating && rating.rating_count > 0 ? rating.total_rating / rating.rating_count : 0;

    return (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">
                        {floor ? `${floor}F` : ''} {enemy || ''}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {(tags || []).map(tag => (
                            <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
                <button onClick={() => onCopy(formation)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">コピー</button>
            </div>
            {memo && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded">{memo}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
                {(formation.megidos || []).map((megidoId, index) => {
                    if (!megidoId) return <div key={index} className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded"></div>;
                    const megido = getMegido(megidoId);
                    if (!megido) return <div key={index} className="w-16 h-16 bg-red-200 dark:bg-red-800 rounded flex items-center justify-center text-red-500">?</div>; // データ不整合の場合
                    const orbId = formation.orbs[index];
                    const orb = orbId ? getOrb(orbId) : null;
                    return (
                        <div key={index} className="text-center">
                            <img src={`./メギド/${megido.名前}.png`} alt={megido.名前} className="w-16 h-16 mx-auto rounded-full border-2 border-gray-300 dark:border-gray-500" />
                            <p className="text-xs mt-1">{megido.名前}</p>
                            {orb && <img src={`./メギド/${orb.name}.png`} alt={orb.name} className="w-8 h-8 mx-auto" />}
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">評価:</span>
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} 
                                className="cursor-pointer text-2xl"
                                style={{color: star <= avgRating ? '#FFC107' : '#E0E0E0'}}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    <span className="text-xs text-gray-400">({avgRating.toFixed(1)} / {rating ? rating.rating_count : 0}件)</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-500">採点する:</span>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleRate(star)} className="text-xl text-gray-300 dark:text-gray-500 hover:text-yellow-400">★</button>
                    ))}
                </div>
            </div>
        </div>
    );
};