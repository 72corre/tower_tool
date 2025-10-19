const usePrevious = (value) => {
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

const GuidanceManager = ({ isGuideMode, guideStep, setGuideStep, ownedMegidoIds }) => {
    const {
        activeTab,
        selectedSquare,
        setChoiceModalState,
        setInfoModalState,
        isMobileView,
        editingFormation,
        formations,
        runState,
        bossPlannerState,
        handleTargetFloorChange,
        openBossPlannerForFloor,
    } = React.useContext(window.AppContext);

    const [isSpotlightDismissed, setIsSpotlightDismissed] = React.useState(false);
    const prevGuideStep = usePrevious(guideStep);
    const prevActiveTab = usePrevious(activeTab);

    const advance = React.useCallback(() => {
        const currentIndex = TUTORIAL_GUIDE_FLOW.findIndex(s => s.stepId === guideStep);
        const nextStep = TUTORIAL_GUIDE_FLOW[currentIndex + 1];
        if (nextStep) {
            console.log(`Advancing guide from ${guideStep} to ${nextStep.stepId}`);
            setGuideStep(nextStep.stepId);
        } else {
            console.log(`Guide complete, advancing from ${guideStep}`);
            setGuideStep('GUIDE_COMPLETE');
        }
    }, [guideStep, setGuideStep]);

    // Effect to SHOW UI (Modals and Spotlights)
    React.useEffect(() => {
        if (!isGuideMode || !guideStep || guideStep === 'GUIDE_COMPLETE') return;

        const stepConfig = TUTORIAL_GUIDE_FLOW.find(s => s.stepId === guideStep);
        if (!stepConfig || stepConfig.type !== 'modal') return;

        const getRecommendedFloor = (megidoCount) => {
            if (megidoCount <= 100) return 15;
            if (megidoCount <= 150) return 20;
            if (megidoCount <= 200) return 25;
            return 35;
        };

        const stateSnapshot = {
            ownedMegidoIds,
            recommendedFloor: getRecommendedFloor(ownedMegidoIds.size),
            handleTargetFloorChange,
            openBossPlannerForFloor,
            activeTab,
            selectedSquare,
            editingFormation,
            formations,
            runState,
            bossPlannerState,
        };

        const showModal = () => {
            const modalContent = typeof stepConfig.content === 'function' ? stepConfig.content(stateSnapshot) : stepConfig.content;

            if (stepConfig.options) {
                setChoiceModalState({
                    isOpen: true,
                    title: stepConfig.title,
                    message: modalContent,
                    options: stepConfig.options.map(o => ({ label: o, value: o })),
                    onConfirm: (choice) => {
                        if (stepConfig.stepId === 'INITIAL_BOSS_PLANNING_MODAL') {
                            if (choice === '完了') {
                                setChoiceModalState({ isOpen: false });
                                advance();
                            } else if (choice === '1階のボス') {
                                setChoiceModalState({ isOpen: false });
                                openBossPlannerForFloor(1, showModal);
                            } else if (choice === '5階のボス') {
                                setChoiceModalState({ isOpen: false });
                                openBossPlannerForFloor(5, showModal);
                            }
                        } else {
                            setChoiceModalState({ isOpen: false });
                            if (stepConfig.action) {
                                const shouldAdvance = stepConfig.action(choice, stateSnapshot);
                                if (shouldAdvance) advance();
                            } else {
                                advance();
                            }
                        }
                    },
                    onClose: () => setChoiceModalState({ isOpen: false })
                });
            } else {
                let modalChildren = modalContent;
                if (stepConfig.stepId === 'EXPLAIN_CONDITION_MODAL') {
                    const htmlContent = modalContent
                        .replace(/!\[(.*?)\]\((.*?)\)/g, "<img src='$2' alt='$1' style='display: inline-block; vertical-align: middle; height: 1.5em; margin: 0 0.25em;' />")
                        .replace(/\n/g, '<br />');
                    modalChildren = React.createElement('div', { dangerouslySetInnerHTML: { __html: htmlContent } });
                }

                setInfoModalState({
                    isOpen: true,
                    title: stepConfig.title,
                    children: modalChildren,
                    onConfirm: () => {
                        // This order can be more robust for state updates.
                        advance();
                        setInfoModalState({ isOpen: false });
                    },
                });
            }
        };

        showModal();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isGuideMode, guideStep]);

    // Effect to ADVANCE on user action (replaces the single large effect)
    // Each condition is in its own useEffect to isolate dependencies and prevent loops.

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'REGISTER_MEGIDO_SPOTLIGHT') {
            if (prevActiveTab === 'ownership' && activeTab !== 'ownership' && ownedMegidoIds.size > 0) {
                advance();
            }
        }
    }, [isGuideMode, guideStep, ownedMegidoIds, activeTab, prevActiveTab, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'GO_TO_MAP_SPOTLIGHT' && activeTab === 'details') advance();
    }, [isGuideMode, guideStep, activeTab, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'CHECK_RECOVERY_SQUARE_SPOTLIGHT' && selectedSquare?.id === 'f1-e2') {
            setTimeout(() => advance(), 10);
        }
    }, [isGuideMode, guideStep, selectedSquare, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'GO_TO_TOWER_EFFECT_SPOTLIGHT' && selectedSquare?.id === 'f1-e1') advance();
    }, [isGuideMode, guideStep, selectedSquare, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'SUGGEST_BATTLES_SPOTLIGHT' && selectedSquare?.id === 'f1-b1') advance();
    }, [isGuideMode, guideStep, selectedSquare, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'SPOTLIGHT_CREATE_FORMATION' && formations.length > 0) advance();
    }, [isGuideMode, guideStep, formations, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'SPOTLIGHT_SIMULATE_WIN_B1' && runState.history.some(h => h.squareId === 'f1-b1' && h.result === 'win')) advance();
    }, [isGuideMode, guideStep, runState, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'PROMPT_FOR_B2_SPOTLIGHT' && selectedSquare?.id === 'f1-b2') advance();
    }, [isGuideMode, guideStep, selectedSquare, advance]);



    React.useEffect(() => {
        if (isGuideMode && guideStep === 'GO_TO_TOWER_POWER_RECOVERY_SPOTLIGHT' && selectedSquare?.id === 'f1-e3') advance();
    }, [isGuideMode, guideStep, selectedSquare, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'USE_TOWER_POWER_RECOVERY_SPOTLIGHT' && runState.history.some(h => h.squareId === 'f1-e3')) advance();
    }, [isGuideMode, guideStep, runState, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'GO_TO_CONDITION_RECOVERY_SPOTLIGHT' && selectedSquare?.id === 'f1-e2') advance();
    }, [isGuideMode, guideStep, selectedSquare, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'USE_CONDITION_RECOVERY_SPOTLIGHT' && runState.history.some(h => h.squareId === 'f1-e2')) advance();
    }, [isGuideMode, guideStep, runState, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'GO_TO_BOSS_SPOTLIGHT' && selectedSquare?.id === 'f1-o') advance();
    }, [isGuideMode, guideStep, selectedSquare, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'EXPLAIN_BOSS_PLANNER_SPOTLIGHT' && bossPlannerState.isOpen) advance();
    }, [isGuideMode, guideStep, bossPlannerState, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'BOSS_PLANNER_GUIDE_TAB_SPOTLIGHT' && bossPlannerState.activeTab === 'guide') advance();
    }, [isGuideMode, guideStep, bossPlannerState, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'BOSS_PLANNER_FORMATION_TAB_SPOTLIGHT' && bossPlannerState.activeTab === 'formation') advance();
    }, [isGuideMode, guideStep, bossPlannerState, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'BOSS_PLANNER_CLOSE_MODAL' && !bossPlannerState.isOpen) advance();
    }, [isGuideMode, guideStep, bossPlannerState, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'CREATE_FORMATION_FOR_BOSS' && editingFormation) advance();
    }, [isGuideMode, guideStep, editingFormation, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'SAVE_FORMATION_FOR_BOSS' && !editingFormation && formations.length >= 3) advance();
    }, [isGuideMode, guideStep, editingFormation, formations, advance]);

    React.useEffect(() => {
        if (isGuideMode && guideStep === 'SIMULATE_BOSS_WIN' && runState.history.some(h => h.squareId === 'f1-o' && h.result === 'win')) advance();
    }, [isGuideMode, guideStep, runState, advance]);





    React.useEffect(() => {
        if (isGuideMode && guideStep) {
            localStorage.setItem('guideStep', guideStep);
            if (guideStep === 'GUIDE_COMPLETE') {
                // Optionally clear the step so it restarts next time
                // localStorage.removeItem('guideStep');
            }
        }
    }, [isGuideMode, guideStep]);

    // --- Render Spotlight ---
    const stepConfig = TUTORIAL_GUIDE_FLOW.find(s => s.stepId === guideStep);
    if (!isGuideMode || !stepConfig || stepConfig.type !== 'spotlight' || isSpotlightDismissed) {
        return null;
    }

    let selector = stepConfig.selector;
    if (typeof selector === 'object' && selector !== null) {
        selector = isMobileView ? selector.mobile : selector.desktop;
    }

    const handleSpotlightClick = () => {
        if (stepConfig.advance_on_click) {
            advance();
        }
        // For other spotlights, the advance is handled by the useEffect watching conditions
    };

    return (
        <SpotlightOverlay
            selector={selector}
            text={stepConfig.text}
            onClose={() => setIsSpotlightDismissed(true)}
            onClick={handleSpotlightClick}
        />
    );
};