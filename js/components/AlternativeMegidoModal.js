const AlternativeMegidoModal = ({ isOpen, onClose, suggestions }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="text-xl font-bold mb-4">代替メギド候補</h2>
                {suggestions.map(({ unowned, alternatives }) => (
                    <div key={unowned.id} className="mb-4">
                        <h3 className="font-bold text-lg">未所持: {unowned.名前}</h3>
                        {alternatives.length > 0 ? (
                            <ul>
                                {alternatives.map(({ megido, score }) => (
                                    <li key={megido.id}>
                                        {megido.名前} (一致度: {score})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>代替候補が見つかりませんでした。</p>
                        )}
                    </div>
                ))}
                <button onClick={onClose} className="btn-secondary p-2 rounded w-full mt-4">閉じる</button>
            </div>
        </div>
    );
};