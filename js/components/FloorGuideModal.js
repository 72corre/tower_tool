
const FloorGuideModal = ({ floorNum, floorMessages, onClose }) => {
    if (!floorNum || !floorMessages) return null;

    const floorData = floorMessages.floors[floorNum];
    const commonDataKey = floorData.inherits;
    const commonData = commonDataKey ? floorMessages.common[commonDataKey] : null;

    const ContentParser = ({ content }) => {
        if (!content) return null;

        const parseLine = (line) => {
            const combinedRegex = /(E\{[^}]+\}|!\{[^}]+\}|`[^`]+`|\*\*[^\*]+\*\*|sick|security)/gi;
            const parts = line.split(combinedRegex);

            return parts.filter(part => part).map((part, index) => {
                if (part.startsWith('E{')) {
                    const enemyName = part.slice(2, -1);
                    return <span key={index} className="enemy-chip">{enemyName}</span>;
                }
                if (part.startsWith('!{')) {
                    const text = part.slice(2, -1);
                    return <span key={index} className="accent-text">{text}</span>;
                }
                if (part.startsWith('`')) {
                    const style = part.slice(1, -1);
                    let styleClass = '';
                    if (style === 'ラッシュ') styleClass = 'rush-text';
                    else if (style === 'カウンター') styleClass = 'counter-text';
                    else if (style === 'バースト') styleClass = 'burst-text';
                    return <span key={index} className={`style-chip ${styleClass}`}>{style}</span>;
                }
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                if (part.toLowerCase() === 'sick') {
                    return <span key={index} className="material-symbols-outlined" style={{verticalAlign: 'middle'}}>sick</span>;
                }
                if (part.toLowerCase() === 'security') {
                    return <span key={index} className="material-symbols-outlined" style={{verticalAlign: 'middle'}}>security</span>;
                }
                return part;
            });
        };

        return content.map((line, index) => (
            <p key={index} className="guide-paragraph">
                {parseLine(line)}
            </p>
        ));
    };

    const Section = ({ title, icon, children }) => (
        <div className="guide-section">
            <div className="guide-section-title">
                <span className="material-symbols-outlined">{icon}</span>
                <h4>{title}</h4>
            </div>
            <div className="guide-section-content">
                {children}
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="guide-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="guide-modal-header">
                    <h3 className="guide-modal-title">{floorData.title}</h3>
                    <button onClick={onClose} className="btn-icon close-button">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="guide-modal-body">
                    {/* Floor Theme */}
                    {floorData.theme && (
                         <Section title="階層テーマ" icon="sell">
                             <p className="guide-paragraph">{floorData.theme}</p>
                         </Section>
                    )}
                    {/* Floor Rule */}
                    {floorData.rule && (
                        <Section title={`${floorData.rule.title}: ${floorData.rule.summary}`} icon={floorData.rule.icon}>
                            <div className="rule-description">
                                <ContentParser content={[floorData.rule.description]} />
                            </div>
                        </Section>
                    )}

                    {/* Floor Specific Sections */}
                    {floorData.sections.map((section, index) => (
                        <Section key={index} title={section.title.text} icon={section.title.icon}>
                            <ContentParser content={section.content} />
                        </Section>
                    ))}

                    {/* Common Data Sections */}
                    {commonData && commonData.sections.map((section, index) => (
                         <Section key={`common-${index}`} title={section.title.text} icon={section.title.icon}>
                            <ContentParser content={section.content} />
                        </Section>
                    ))}
                    
                    {/* Boss Info */}
                    {commonData && commonData.boss && (
                        <Section title="ボス情報" icon={commonData.boss.icon}>
                            <p className="guide-paragraph rule-summary">{commonData.boss.floor}階 : {commonData.boss.name}</p>
                            <div className="rule-description">
                                <ContentParser content={[commonData.boss.hint]} />
                            </div>
                        </Section>
                    )}

                </div>
            </div>
        </div>
    );
};
