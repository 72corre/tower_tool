const FilterControls = ({ filters = {}, onFilterChange, onBulkCheck, onCheckDistributed, showBulkButtons = false, isMobileView = false, filterType = 'megido' }) => {
    const { useState } = React;
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);

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

    const getPlaceholderText = () => {
        switch (filterType) {
            case 'megido': return '名前または特性で検索...';
            case 'orb': return '名前または特性で検索...';
            case 'reishou': return '名前または効果で検索...';
            default: return '検索...';
        }
    };

    const renderMegidoFilters = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FilterItem label="時計" value={filters.clock || 'All'} onChange={e => onFilterChange('clock', e.target.value)}>
                <option value="All">全て</option><option value="祖">祖</option><option value="真">真</option><option value="宵">宵</option><option value="継">継</option>
            </FilterItem>
            <FilterItem label="クラス" value={filters.class || 'All'} onChange={e => onFilterChange('class', e.target.value)}>
                <option value="All">全て</option><option value="ファイター">ファイター</option><option value="トルーパー">トルーパー</option><option value="スナイパー">スナイパー</option>
            </FilterItem>
            <FilterItem label="スタイル" value={filters.style || 'All'} onChange={e => onFilterChange('style', e.target.value)}>
                <option value="All">全て</option><option value="カウンター">カウンター</option><option value="ラッシュ">ラッシュ</option><option value="バースト">バースト</option>
            </FilterItem>
        </div>
    );

    const renderOrbFilters = () => {
        const races = ['獣', '獣人', '植物', '虫', '爬虫類', '海洋生物', '飛行', '物体', '不定形', '悪魔', '死者', '龍', '神', '精霊', '古代生物', '大幻獣'];
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilterItem label="種族" value={filters.race || 'All'} onChange={e => onFilterChange('race', e.target.value)}>
                    <option value="All">全て</option>
                    {races.map(r => <option key={r} value={r}>{r}</option>)}
                </FilterItem>
            </div>
        );
    };

    const renderReishouFilters = () => {
        const lineages = ['猛撃', '一心', '滅丸', '類型', '光芒', '勇将', '剛堅', '轟雷', '廻天', '狂勇', '烈火', '連鎖', '地裂', '水心', '回生', '寄生'];
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FilterItem label="系譜" value={filters.lineage || 'All'} onChange={e => onFilterChange('lineage', e.target.value)}>
                    <option value="All">全て</option>
                    {lineages.map(l => <option key={l} value={l}>{l}</option>)}
                </FilterItem>
            </div>
        );
    };

    const renderDetailedFilters = () => {
        switch (filterType) {
            case 'megido': return renderMegidoFilters();
            case 'orb': return renderOrbFilters();
            case 'reishou': return renderReishouFilters();
            default: return null;
        }
    };

    return (
        <div className="form-section flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    placeholder={getPlaceholderText()}
                    value={filters.text || ''}
                    onChange={e => onFilterChange('text', e.target.value)}
                    className="input-field w-full"
                />
                <div className="flex items-center gap-2">
                    <label className="label mb-0 text-sm" htmlFor={`exact-match-checkbox-${filterType}`}>完全一致:</label>
                    <input
                        id={`exact-match-checkbox-${filterType}`}
                        type="checkbox"
                        checked={filters.exactMatch || false}
                        onChange={e => onFilterChange('exactMatch', e.target.checked)}
                    />
                </div>
            </div>

            <div className="accordion-header" onClick={() => setIsAccordionOpen(!isAccordionOpen)} style={{ cursor: 'pointer', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined">filter_list</span>
                <span style={{ fontWeight: 500 }}>詳細フィルター {isAccordionOpen ? '−' : '＋'}</span>
            </div>

            {isAccordionOpen && (
                <div className="accordion-content">
                    {renderDetailedFilters()}
                </div>
            )}

            {showBulkButtons && <BulkButtons />}
        </div>
    );
};