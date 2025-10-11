const PostFormationModal = ({ isOpen, onClose, formationToPost, onSubmit, isPosting }) => {
    const { useState, useEffect } = React;

    const [tagValue, setTagValue] = useState(0);
    const [comment, setComment] = useState('');

    // コンポーネントが開かれたとき、または対象の編成が変わったときに内部状態をリセット
    useEffect(() => {
        if (isOpen) {
            setTagValue(0);
            setComment('');
        }
    }, [isOpen, formationToPost]);

    const handleTagChange = (e) => {
        const { value, checked } = e.target;
        const intValue = parseInt(value, 10);
        setTagValue(current => checked ? current | intValue : current & ~intValue);
    };

    const handleSubmit = () => {
        if (!formationToPost) {
            alert('投稿対象の編成がありません。');
            return;
        }
        onSubmit({ 
            formation: formationToPost, 
            tags: tagValue, 
            comment 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>編成を投稿する</h2>
                
                <div className="card" style={{marginBottom: '1rem'}}>
                    <p><strong>対象編成:</strong> {formationToPost.name}</p>
                    <p><strong>ターゲット:</strong> {formationToPost.floor}F - {formationToPost.enemyName}</p>
                </div>

                <div className="form-group">
                    <label>タグ</label>
                    <div className="checkbox-group">
                        <label><input type="checkbox" value={1} onChange={handleTagChange} /> 霊宝必須</label>
                        <label><input type="checkbox" value={2} onChange={handleTagChange} /> 絆霊宝必須</label>
                        <label><input type="checkbox" value={4} onChange={handleTagChange} /> 凸必須</label>
                        <label><input type="checkbox" value={8} onChange={handleTagChange} /> オーブキャスト不可</label>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="comment-input">コメント（任意）</label>
                    <textarea id="comment-input" value={comment} onChange={e => setComment(e.target.value)} rows="3" placeholder="編成のポイントや立ち回りなど"></textarea>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-secondary" disabled={isPosting}>キャンセル</button>
                    <button onClick={handleSubmit} className="btn btn-primary" disabled={!formationToPost || isPosting}>
                        {isPosting ? '投稿中...' : 'この内容で投稿する'}
                    </button>
                </div>
            </div>
        </div>
    );
};