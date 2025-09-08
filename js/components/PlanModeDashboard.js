const PlanModeDashboard = ({ planConditions, planState }) => {
    const { useState, useMemo } = React;
    const [isCollapsed, setIsCollapsed] = useState(true);

    const styleNameMap = {
        rush: 'ラッシュ',
        counter: 'カウンター',
        burst: 'バースト'
    };

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    if (!planConditions || !planState || typeof SIMULATED_CONDITION_SECTIONS === 'undefined') {
        return <div>Loading Plan...</div>;
    }

    const { fatigueByGroup, megidoConditionsBySection } = planConditions;

    return (
        <div className={`resource-dashboard ${isCollapsed ? 'is-collapsed' : ''}`}>
            <div className="dashboard-header" onClick={toggleCollapse}>
                <h3>コンディション管理 (計画)</h3>
                <div className="dashboard-toggle">{isCollapsed ? '∨' : '∧'}</div>
            </div>
            <div className="dashboard-content">
                {Object.entries(SIMULATED_CONDITION_SECTIONS).map(([styleKey, sections]) => (
                    <div key={styleKey} className="card" style={{ padding: '8px', marginBottom: '1rem' }}>
                        <h4 className={getStyleClass(styleKey)} style={{ fontWeight: 700, textAlign: 'center', textTransform: 'capitalize' }}>{styleNameMap[styleKey] || styleKey}</h4>
                        {sections.map((section, index) => {
                            const groupKey = `${section.start}-${section.end}`;
                            const groupData = fatigueByGroup[groupKey] || { used: 0, capacity: section.limit };
                            const sectionMegido = megidoConditionsBySection[groupKey] || {};
                            const usageRate = groupData.capacity > 0 ? (groupData.used / groupData.capacity) * 100 : 0;
                            let barColor = 'var(--success-color)';
                            if (usageRate > 80) barColor = 'var(--danger-color)';
                            else if (usageRate > 50) barColor = 'var(--warning-color)';

                            return (
                                <div key={index} style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', backgroundColor: (planState.activeFloor >= section.start && planState.activeFloor <= section.end) ? 'rgba(112, 240, 224, 0.1)' : 'transparent', borderRadius: '4px', padding: '4px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: 500 }}>{section.start}F - {section.end}F ({groupData.used}/{groupData.capacity})</p>
                                    <div className="progress-bar"><div className="progress-bar-inner" style={{ width: `${usageRate}%`, backgroundColor: barColor }}></div></div>
                                    <div className="fatigue-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginTop: '8px' }}>
                                        {Object.entries(sectionMegido).map(([megidoId, conditionData]) => {
                                            return <span key={megidoId}>{conditionData.megido.名前}({getNextCondition('絶好調', conditionData.fatigue)})</span>
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};