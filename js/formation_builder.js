const { useState, useMemo } = React;

const FormationBuilderApp = () => {
    // ダミーのshowToastMessage
    const showToastMessage = (message) => console.log(`Toast: ${message}`);

    // useMegidoフックを呼び出し
    const { megidoDetails, ownedMegidoIds } = useMegido({ showToastMessage });

    // FormationEditorに渡すための初期状態。idが必須。
    const [initialFormation, setInitialFormation] = useState({
        id: `f-builder-${Date.now()}`,
        name: '',
        tags: [],
        notes: '',
        megido: Array(5).fill(null),
    });

    const [jsonOutput, setJsonOutput] = useState('');

    // onSaveハンドラ。FormationEditorから最終的なformationオブジェクトを受け取る
    const handleExport = (finalFormation) => {
        // finalFormation.megido は詳細情報を含んだオブジェクトの配列
        // これをIDの配列に変換する
        const formationForExport = {
            megidos: (finalFormation.megido || []).map(m => m ? m.id : null),
            leader: 2, // 中央固定
            orbs: (finalFormation.megido || []).map(m => m && m.orb ? m.orb.id : null),
            reishou: (finalFormation.megido || []).map(m => m ? (m.reishou || []).map(r => r.id) : []),
        };

        const dataToExport = {
            floor: finalFormation.floor || undefined,
            enemy: finalFormation.enemyName || undefined,
            formation: formationForExport,
            tags: finalFormation.tags && finalFormation.tags.length > 0 ? finalFormation.tags : undefined,
            memo: finalFormation.notes || undefined,
        };
        
        Object.keys(dataToExport).forEach(key => dataToExport[key] === undefined && delete dataToExport[key]);

        setJsonOutput(JSON.stringify(dataToExport, null, 2));
        showToastMessage("JSONを出力しました。");
    };

    return (
        <div className="container mx-auto p-4 font-sans bg-gray-50 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">編成データ出力ツール</h1>
                
                <p className="mb-4 text-gray-600">ここで作成した編成は、下の「この編成を保存」ボタンを押すとJSONとして出力されます。このページ自体に保存機能はありません。</p>

                <div className="mt-6">
                    <FormationEditor
                        formation={initialFormation}
                        onSave={handleExport}
                        onCancel={() => { /* このページではキャンセルは特に何もしない */ }}
                        ownedMegidoIds={ownedMegidoIds || new Set()}
                        megidoDetails={megidoDetails || {}}
                        showToastMessage={showToastMessage}
                        uniquePrefix="builder"
                    />
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">出力結果 (この内容をコピーして community_formations.js に貼り付けます)</label>
                    <textarea className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 font-mono text-sm" value={jsonOutput} readOnly rows="15"></textarea>
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FormationBuilderApp />);