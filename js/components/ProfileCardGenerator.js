const ProfileCardGenerator = ({ isOpen, onClose, profileData, megidoList, achievements }) => {
    const { useState, useEffect, useRef } = React;
    const canvasRef = useRef(null);
    const [userName, setUserName] = useState('アルスノヴァ');
    const [selectedMegido, setSelectedMegido] = useState('');
    const [selectedAchievement, setSelectedAchievement] = useState('');

    useEffect(() => {
        if (isOpen && megidoList.length > 0) {
            setSelectedMegido(megidoList[0].id);
        }
        if (isOpen && achievements.length > 0) {
            setSelectedAchievement(achievements[0].id);
        }
    }, [isOpen, megidoList, achievements]);

    const drawProfileCard = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Basic setup
        canvas.width = 800;
        canvas.height = 450;

        // Background
        ctx.fillStyle = '#282c34';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px "Noto Sans JP", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('星間の塔 プロフィール', canvas.width / 2, 50);

        // User Name
        ctx.font = '24px "Noto Sans JP", sans-serif';
        ctx.fillText(userName, canvas.width / 2, 100);

        // Stats
        ctx.font = '18px "Noto Sans JP", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`所持メギド数: ${profileData.ownedMegidoCount}`, 50, 150);
        ctx.fillText(`最大到達階数: ${profileData.maxFloor}F`, 50, 180);
        ctx.fillText(`塔頂回数: ${profileData.clearCount}`, 50, 210);

        // Achievement (Title)
        const achievement = achievements.find(a => a.id === selectedAchievement);
        if (achievement) {
            ctx.font = 'italic 22px "Noto Sans JP", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`- ${achievement.name} -`, canvas.width / 2, 140);
        }

        // Megido Image
        const megido = megidoList.find(m => m.id === selectedMegido);
        if (megido) {
            const img = new Image();
            const imageName = `${megido.名前}.png`;
            img.src = `asset/メギド/${imageName}`;
            img.onload = () => {
                // Simple image placement, can be improved
                ctx.drawImage(img, 550, 120, 200, 200); 
            };
            img.onerror = () => {
                ctx.fillStyle = 'red';
                ctx.fillText('画像読込失敗', 650, 220);
            }
        }
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'tower_profile.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    useEffect(() => {
        if (isOpen) {
            // Delay drawing to ensure fonts and data are ready
            setTimeout(drawProfileCard, 100);
        }
    }, [isOpen, userName, selectedMegido, selectedAchievement, profileData]);

    if (!isOpen) return null;

    return (
        <div className="mobile-modal-overlay" onClick={onClose}>
            <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto'}}>
                <h3 style={{ marginTop: 0, textAlign: 'center' }}>プロフィール画像生成</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label>プレイヤー名: </label>
                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="input" />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>推しメギド: </label>
                    <select value={selectedMegido} onChange={(e) => setSelectedMegido(e.target.value)} className="input">
                        {megidoList.map(m => <option key={m.id} value={m.id}>{m.名前}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>実績（二つ名）: </label>
                    <select value={selectedAchievement} onChange={(e) => setSelectedAchievement(e.target.value)} className="input">
                        {achievements.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                </div>

                <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', border: '1px solid #ccc', margin: '1rem 0' }}></canvas>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button onClick={drawProfileCard} className="btn btn-primary">画像再生成</button>
                    <button onClick={handleDownload} className="btn btn-secondary">ダウンロード</button>
                    <button onClick={onClose} className="btn">閉じる</button>
                </div>
            </div>
        </div>
    );
};
