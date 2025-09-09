const FilterControls = ({ filters = {}, onFilterChange, onBulkCheck, onCheckDistributed, showBulkButtons = false, isMobileView = false }) => {
    const buttonClasses = "px-2 py-1 border rounded text-xs transition-colors duration-200";
    const successButton = `${buttonClasses} border-green-500 text-green-500 hover:bg-green-500 hover:text-white`;
    const dangerButton = `${buttonClasses} border-red-500 text-red-500 hover:bg-red-500 hover:text-white`;
    const infoButton = `${buttonClasses} border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white`;

    const FilterItem = ({ label, value, onChange, children }) => (
        <div className="flex flex-col gap-1">
            <label className="label mb-0 text-sm font-medium">{label}</label>
            <select value={value} onChange={onChange} className="select-field w-full">
                {children}
            </select>
        </div>
    );

    const BulkButtons = () => (
        <div className={`flex items-center gap-2 ${isMobileView ? 'w-full justify-around mt-2' : 'ml-auto flex-shrink-0'}`}>
            <button onClick={() => onBulkCheck(true)} className={successButton}>全チェック</button>
            <button onClick={() => onBulkCheck(false)} className={dangerButton}>全解除</button>
            <button onClick={onCheckDistributed} className={infoButton}>配布チェック</button>
        </div>
    );

    return (
        <div className="form-section flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FilterItem label="時計" value={filters.clock || 'All'} onChange={e => onFilterChange('clock', e.target.value)}>
                    <option value="All">全て</option><option value="祖">祖</option><option value="真">真</option><option value="継">継</option><option value="宵">宵</option>
                </FilterItem>
                <FilterItem label="クラス" value={filters.class || 'All'} onChange={e => onFilterChange('class', e.target.value)}>
                    <option value="All">全て</option><option value="ファイター">ファイター</option><option value="トルーパー">トルーパー</option><option value="スナイパー">スナイパー</option>
                </FilterItem>
                <FilterItem label="スタイル" value={filters.style || 'All'} onChange={e => onFilterChange('style', e.target.value)}>
                    <option value="All">全て</option><option value="カウンター">カウンター</option><option value="ラッシュ">ラッシュ</option><option value="バースト">バースト</option>
                </FilterItem>
            </div>
            {showBulkButtons && <BulkButtons />}
        </div>
    );
};