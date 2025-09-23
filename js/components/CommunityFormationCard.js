const CommunityFormationCard = ({ formationData, onCopy, getMegido, getOrb, onRate, idMaps, hasUsed, currentUser, onDelete }) => {
    const { id, qrString, floor, enemyName, comment, tagValue, total_rating, rating_count, authorId, authorName, authorPhotoURL } = formationData;
    const { useMemo, useState } = React;

    const [selectedRating, setSelectedRating] = useState(0);

    const handleRate = () => {
        if (selectedRating > 0) {
            onRate(id, selectedRating);
            setSelectedRating(0); // 送信後にリセット
        }
    };

    const avgRating = rating_count > 0 ? total_rating / rating_count : 0;

    // qrStringからメギドとオーブのIDをデコードする
    const decodeSlotsFromQr = (qr, idMaps) => {
        if (!qr || !idMaps) return [];
        const slots = [];
        let pointer = 5; // enemyId(3) + floor(2)
        const slotLength = 24;

        for (let i = 0; i < 5; i++) {
            if (pointer + slotLength > qr.length) break;

            const slotText = qr.substring(pointer, pointer + slotLength);
            const megidoQRID = slotText.substring(0, 3);
            const orbQRID = slotText.substring(21, 24);

            const megidoId = idMaps.megido.newToOriginal.get(megidoQRID);
            const orbId = idMaps.orb.newToOriginal.get(orbQRID);

            slots.push({ megidoId, orbId });
            pointer += slotLength;
        }
        return slots;
    };

    const decodedSlots = useMemo(() => decodeSlotsFromQr(qrString, idMaps), [qrString, idMaps]);

    const isAuthor = currentUser && currentUser.uid === authorId;

    return (
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700 mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">
                        {floor ? `${floor}F` : ''} {enemyName || ''}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {decodeFormationTags(tagValue).map(tag => (
                            <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {authorName && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <img src={authorPhotoURL} alt={authorName} className="w-6 h-6 rounded-full" />
                            <span>{authorName}</span>
                        </div>
                    )}
                    <button onClick={() => onCopy(formationData)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">コピー</button>
                    {isAuthor && (
                        <button onClick={() => onDelete(formationData)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">削除</button>
                    )}
                </div>
            </div>
            {comment && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded">{comment}</p>}
            {/* Megido Row */}
            <div className="flex justify-around items-end mt-3">
                {decodedSlots.map((slot, index) => {
                    if (!slot || !slot.megidoId) return <div key={index} className="w-16 h-24 flex-shrink-0"></div>;
                    const megido = getMegido(slot.megidoId);
                    if (!megido) return <div key={index} className="w-16 h-24 bg-red-200 dark:bg-red-800 rounded flex items-center justify-center text-red-500 flex-shrink-0">?</div>;

                    return (
                        <div key={index} className="text-center flex-shrink-0 w-16">
                            <img src={`./asset/メギド/${megido.名前}.png`} alt={megido.名前} className="w-16 h-16 mx-auto rounded-full border-2 border-gray-300 dark:border-gray-500" />
                            <p className="text-xs mt-1 truncate w-full">{megido.名前}</p>
                        </div>
                    );
                })}
            </div>
            {/* Orb Row */}
            <div className="flex justify-around items-start mt-2">
                {decodedSlots.map((slot, index) => {
                    if (!slot || !slot.orbId) return <div key={index} className="w-12 h-16 flex-shrink-0"></div>;
                    const orb = getOrb(slot.orbId);
                    if (!orb) return <div key={index} className="w-12 h-16 flex-shrink-0"></div>;

                    return (
                        <div key={index} className="text-center flex-shrink-0 w-12">
                            <img src={`./asset/オーブ/${orb.name}.png`} alt={orb.name} className="w-12 h-12 mx-auto" />
                            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 truncate w-full">{orb.name}</p>
                        </div>
                    );
                })}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex flex-wrap justify-between items-center">
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
                    <span className="text-xs text-gray-400">({avgRating.toFixed(1)} / {rating_count || 0}件)</span>
                </div>
                {hasUsed && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => setSelectedRating(star)} className="text-xl hover:scale-125 transition-transform" style={{color: star <= selectedRating ? '#FFC107' : '#E0E0E0'}}>★</button>
                            ))}
                        </div>
                        {selectedRating > 0 && (
                            <button onClick={handleRate} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm">評価を送信</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};