const SimulatedConditionTracker = ({ planState, formations, megidoDetails }) => {
    const { useMemo } = React;

    const { fatigueCounts, megidoConditions } = useMemo(() => {
        if (!planState || !formations || !megidoDetails || typeof TOWER_MAP_DATA === 'undefined' || typeof COMPLETE_MEGIDO_LIST === 'undefined' || typeof SIMULATED_CONDITION_SECTIONS === 'undefined') {
            return { fatigueCounts: {}, megidoConditions: {} };
        }

        const ownedMegido = Object.keys(megidoDetails).filter(id => megidoDetails[id]?.owned);
        const currentMegidoConditions = {};
        ownedMegido.forEach(id => currentMegidoConditions[id] = 0);

        const calculatedFatigueCounts = {};
        Object.keys(SIMULATED_CONDITION_SECTIONS).forEach(style => {
            calculatedFatigueCounts[style] = {};
            SIMULATED_CONDITION_SECTIONS[style].forEach((section, index) => {
                const sectionId = `${style}-${index}`;
                calculatedFatigueCounts[style][sectionId] = { used: 0, limit: section.limit, start: section.start, end: section.end };
            });
        });

        const megidoUsage = {};
        for (const [squareId, enemyAssignments] of Object.entries(planState.assignments || {})) {
            const floor = parseInt(squareId.split('-')[0].replace('f', ''));
            const uniqueMegidoInSquare = new Set();
            for (const formationSlots of Object.values(enemyAssignments)) {
                for (const formationId of formationSlots) {
                    if (formationId) {
                        const formation = formations.find(f => f.id === formationId);
                        if (formation) {
                            formation.megido.forEach(m => {
                                if (m) uniqueMegidoInSquare.add(String(m.id));
                            });
                        }
                    }
                }
            }
            uniqueMegidoInSquare.forEach(megidoId => {
                if (!megidoUsage[megidoId]) megidoUsage[megidoId] = [];
                megidoUsage[megidoId].push({ floor, squareId });
            });
        }

        for (let floor = 1; floor <= 35; floor++) {
            Object.keys(SIMULATED_CONDITION_SECTIONS).forEach(style => {
                const section = SIMULATED_CONDITION_SECTIONS[style].find(s => s.start === floor);
                if (section) {
                    ownedMegido.forEach(id => {
                        const megidoInfo = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === id);
                        if (megidoInfo?.style.toLowerCase() === style && currentMegidoConditions[id] > 0) {
                            currentMegidoConditions[id]--;
                        }
                    });
                }
            });

            for (const megidoId in megidoUsage) {
                const usagesOnThisFloor = megidoUsage[megidoId].filter(u => u.floor === floor);
                if (usagesOnThisFloor.length === 0) continue;

                const megidoInfo = COMPLETE_MEGIDO_LIST.find(m => String(m.id) === megidoId);
                if (!megidoInfo) continue;
                const style = megidoInfo.style.toLowerCase();
                const sections = SIMULATED_CONDITION_SECTIONS[style];
                
                const uniqueSquareIdsOnFloor = [...new Set(usagesOnThisFloor.map(u => u.squareId))];

                uniqueSquareIdsOnFloor.forEach(squareId => {
                    const squareInfo = TOWER_MAP_DATA.find(f => f.floor === floor)?.squares[squareId];
                    const sectionIndex = sections.findIndex(s => floor >= s.start && floor <= s.end);
                    if (sectionIndex === -1) return;
                    const section = sections[sectionIndex];

                    const isBoss = squareInfo?.type === 'boss';
                    const isStyleRecovery = squareInfo?.type === 'explore' && squareInfo?.sub_type === 'recovery' && squareInfo?.style.toLowerCase() === style;
                    const isLastFloorOfSection = floor === section.end;

                    let targetSectionIndex = sectionIndex;
                    if ((isBoss && isLastFloorOfSection) || isStyleRecovery) {
                        if (sectionIndex + 1 < sections.length) {
                            targetSectionIndex = sectionIndex + 1;
                        }
                    }
                    
                    const targetSectionId = `${style}-${targetSectionIndex}`;
                    const targetSectionInfo = calculatedFatigueCounts[style][targetSectionId];

                    if (targetSectionInfo.used < targetSectionInfo.limit) {
                        targetSectionInfo.used++;
                        currentMegidoConditions[megidoId]++;
                    }
                });
            }
        }
        return { fatigueCounts: calculatedFatigueCounts, megidoConditions: currentMegidoConditions };
    }, [planState, formations, megidoDetails]);

    const styles = {
        container: { padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', marginTop: '1rem', border: '1px solid var(--border-color)' },
        header: { color: 'var(--primary-accent)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', fontSize: '16px' },
        styleSection: { marginBottom: '1rem' },
        styleTitle: { fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'capitalize' },
        sectionRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px', borderBottom: '1px solid var(--bg-main)' },
        sectionLabel: { color: 'var(--text-subtle)' },
        sectionValue: { color: 'var(--text-main)' }
    };

    return (
        <div style={styles.container}>
            <h4 style={styles.header}>計画モード 疑似コンディション</h4>
            {Object.entries(fatigueCounts).map(([style, sections]) => (
                <div key={style} style={styles.styleSection}>
                    <h5 style={styles.styleTitle}>{style}</h5>
                    {Object.values(sections).map((data, index) => (
                        <div key={index} style={styles.sectionRow}>
                            <span style={styles.sectionLabel}>{data.start}F - {data.end}F</span>
                            <span style={styles.sectionValue}>{data.used} / {data.limit}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};