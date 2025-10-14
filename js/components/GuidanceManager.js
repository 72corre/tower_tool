const usePrevious = (value) => {
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

const GuidanceManager = ({ isGuideMode, guideStep, setGuideStep, onSuggestTargetFloor }) => {
    const {
        activeTab,
        ownedMegidoIds,
        selectedSquare,
        formations,
        runState,
        editingFormation,
        isMobileView, // Get isMobileView from context
    } = React.useContext(window.AppContext);

    const [spotlight, setSpotlight] = React.useState({ selector: null, text: null });
    const [isDismissed, setIsDismissed] = React.useState(false);
    const prevGuideStep = usePrevious(guideStep);
    const prevActiveTab = usePrevious(activeTab);

    // Effect to determine the spotlight content based on the guide step
    React.useEffect(() => {
        if (prevGuideStep !== guideStep) {
            setIsDismissed(false);
        }

        if (!isGuideMode || !guideStep || isDismissed) {
            setSpotlight({ selector: null, text: null });
            return;
        }

        const stepConfig = TUTORIAL_GUIDANCE[guideStep];
        if (stepConfig) {
            setTimeout(() => {
                let finalHighlight = { ...stepConfig.highlight };
                // Adapt selector for mobile/desktop if needed
                if (guideStep === 'INITIAL_NO_MEGIDO') {
                    finalHighlight.selector = isMobileView ? '#mobile-ownership-tab-button' : '#tab-button-ownership';
                }
                setSpotlight(finalHighlight);
            }, 100); // 100ms delay
        } else {
            setSpotlight({ selector: null, text: null });
        }

    }, [isGuideMode, guideStep, isDismissed, prevGuideStep, isMobileView]);

    // Effect to ADVANCE the guide step based on user actions
    React.useEffect(() => {
        if (!isGuideMode) return;

        switch (guideStep) {
            case 'INITIAL_NO_MEGIDO':
                if (ownedMegidoIds.size > 0) setGuideStep('MEGIDO_REGISTERED_GO_TO_MAP');
                break;
            case 'MEGIDO_REGISTERED_GO_TO_MAP':
                if (activeTab === 'details') setGuideStep('SELECT_FIRST_BOSS');
                break;
            case 'SELECT_FIRST_BOSS':
                if (selectedSquare && selectedSquare.floor.floor === 1 && selectedSquare.id === 'b1') setGuideStep('CREATE_FORMATION');
                break;
            case 'CREATE_FORMATION':
                if (editingFormation) setGuideStep('SAVE_FORMATION');
                break;
            case 'SAVE_FORMATION':
                if (!editingFormation && Object.keys(formations).length > 0) setGuideStep('SIMULATE_BATTLE');
                break;
            case 'SIMULATE_BATTLE':
                const lastHistory = runState.history[runState.history.length - 1];
                if (lastHistory && lastHistory.type === 'battle' && lastHistory.squareId === 'b1' && lastHistory.result === 'win') setGuideStep('GO_TO_NEXT_FLOOR');
                break;
            case 'GO_TO_NEXT_FLOOR':
                if (runState.currentPosition && runState.currentPosition.floor === 2) setGuideStep('GUIDE_COMPLETE');
                break;
            default:
                break;
        }
    }, [isGuideMode, guideStep, setGuideStep, activeTab, ownedMegidoIds, selectedSquare, editingFormation, formations, runState]);

    // Effect for suggesting target floor
    const [hasSeenSuggestion, setHasSeenSuggestion] = React.useState(() => localStorage.getItem('hasSeenTargetFloorSuggestion') === 'true');
    React.useEffect(() => {
        const justLeftOwnership = prevActiveTab === 'ownership' && activeTab !== 'ownership';
        if (isGuideMode && !hasSeenSuggestion && justLeftOwnership && ownedMegidoIds.size > 0) {
            let suggestedFloor = 0;
            if (ownedMegidoIds.size < 100) suggestedFloor = 15;
            else if (ownedMegidoIds.size <= 150) suggestedFloor = 20;
            else if (ownedMegidoIds.size <= 200) suggestedFloor = 25;
            else suggestedFloor = 35;

            if (onSuggestTargetFloor) {
                onSuggestTargetFloor(suggestedFloor);
            }
            setHasSeenSuggestion(true);
            localStorage.setItem('hasSeenTargetFloorSuggestion', 'true');
        }
    }, [activeTab, prevActiveTab, isGuideMode, hasSeenSuggestion, ownedMegidoIds.size, onSuggestTargetFloor]);


    // Initialize guide
    React.useEffect(() => {
        if (isGuideMode) {
            const savedStep = localStorage.getItem('guideStep');
            if (savedStep && savedStep !== 'null' && savedStep !== 'undefined') {
                setGuideStep(savedStep);
            } else if (ownedMegidoIds.size === 0) {
                setGuideStep('INITIAL_NO_MEGIDO');
            } else {
                setGuideStep('MEGIDO_REGISTERED_GO_TO_MAP');
            }
        }
    }, [isGuideMode, setGuideStep, ownedMegidoIds.size]);

    // Persist guide step
    React.useEffect(() => {
        if (isGuideMode && guideStep) {
            localStorage.setItem('guideStep', guideStep);
        }
    }, [isGuideMode, guideStep]);

    if (!isGuideMode || !spotlight || !spotlight.selector) {
        return null;
    }

    return (
        <SpotlightOverlay
            selector={spotlight.selector}
            text={spotlight.text}
            onClose={() => setIsDismissed(true)}
        />
    );
};