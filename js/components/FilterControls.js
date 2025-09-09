const FilterControls = ({ filters = {}, onFilterChange, onBulkCheck, onCheckDistributed, showBulkButtons = false, isMobileView = false }) => {
    const buttonClasses = "px-2 py-1 border rounded text-xs transition-colors duration-200";
    const successButton = `${buttonClasses} border-green-500 text-green-500 hover:bg-green-500 hover:text-white`;
    const dangerButton = `${buttonClasses} border-red-500 text-red-500 hover:bg-red-500 hover:text-white`;
    const infoButton = `${buttonClasses} border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white`;

    const characterGroups = {
        'All': [],
        'あ行': ['あ', 'い', 'う', 'え', 'お'],
        'か行': ['か', 'き', 'く', 'け', 'こ'],
        'さ行': ['さ', 'し', 'す', 'せ', 'そ'],
        'た行': ['た', 'ち', 'つ', 'て', 'と'],
        'な行': ['な', 'に', 'ぬ', 'ね', 'の'],
        'は行': ['は', 'ひ', 'ふ', 'へ', 'ほ'],
        'ま行': ['ま', 'み', 'む', 'め', 'も'],
        'や行': ['や', 'ゆ', 'よ'],
        'ら行': ['ら', 'り', 'る', 'れ', 'ろ'],
        'わ行': ['わ', 'を', 'ん'],
        'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    };

    const handleGroupChange = (e) => {
        onFilterChange('charGroup', e.target.value);
        onFilterChange('char', 'All'); // Reset character filter when group changes
    };

    const BulkButtons = () => (
        <div className={`flex items-center gap-2 ${isMobileView ? 'w-full justify-around mt-2' : 'ml-auto flex-shrink-0'}`}>
            <button onClick={() => onBulkCheck(true)} className={successButton}>全チェック</button>
            <button onClick={() => onBulkCheck(false)} className={dangerButton}>全解除</button>
            <button onClick={onCheckDistributed} className={infoButton}>配布チェック</button>
        </div>
    );

    return (
        <div className="form-section flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input 
                    type="text" 
                    placeholder="名前または特性で検索..." 
                    value={filters.text || ''}
                    onChange={e => onFilterChange('text', e.target.value)} 
                    className="input-field w-full"
                />
                <div className="flex items-center gap-2">
                    <label className="label mb-0 text-sm" htmlFor="exact-match-checkbox">完全一致:</label>
                    <input 
                        id="exact-match-checkbox"
                        type="checkbox" 
                        checked={filters.exactMatch || false}
                        onChange={e => onFilterChange('exactMatch', e.target.checked)} 
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center pb-2">
                <div className="flex items-center gap-2">
                    <label className="label mb-0 text-sm">グループ:</label>
                    <select value={filters.charGroup || 'All'} onChange={handleGroupChange} className="select-field w-auto">
                        {Object.keys(characterGroups).map(group => <option key={group} value={group}>{group}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="label mb-0 text-sm">文字:</label>
                    <select value={filters.char || 'All'} onChange={e => onFilterChange('char', e.target.value)} className="select-field w-auto" disabled={!filters.charGroup || filters.charGroup === 'All'}>
                        <option value="All">全て</option>
                        {(characterGroups[filters.charGroup] || []).map(char => <option key={char} value={char}>{char}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="label mb-0 text-sm">時計:</label>
                    <select value={filters.clock || 'All'} onChange={e => onFilterChange('clock', e.target.value)} className="select-field w-auto">
                        <option value="All">全て</option><option value="祖">祖</option><option value="真">真</option><option value="継">継</option><option value="宵">宵</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="label mb-0 text-sm">クラス:</label>
                    <select value={filters.class || 'All'} onChange={e => onFilterChange('class', e.target.value)} className="select-field w-auto">
                        <option value="All">全て</option><option value="ファイター">ファイター</option><option value="トルーパー">トルーパー</option><option value="スナイパー">スナイパー</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="label mb-0 text-sm">スタイル:</label>
                    <select value={filters.style || 'All'} onChange={e => onFilterChange('style', e.target.value)} className="select-field w-auto">
                        <option value="All">全て</option><option value="カウンター">カウンター</option><option value="ラッシュ">ラッシュ</option><option value="バースト">バースト</option>
                    </select>
                </div>
                {!isMobileView && showBulkButtons && <BulkButtons />}
            </div>
            {isMobileView && showBulkButtons && <BulkButtons />}
        </div>
    );
};