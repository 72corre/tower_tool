const usePrevious = (value) => {
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
};

const GuidanceManager = ({ isGuideMode, onSuggestTargetFloor }) => {
    const { megidoDetails, targetFloor, activeTab } = React.useContext(AppContext);
    const [hasSeenSuggestion, setHasSeenSuggestion] = React.useState(() => localStorage.getItem('hasSeenTargetFloorSuggestion') === 'true');
    
    const ownedMegidoCount = Object.values(megidoDetails).filter(detail => detail.owned).length;
    const prevActiveTab = usePrevious(activeTab);

    const handleDismissSuggestion = React.useCallback(() => {
        localStorage.setItem('hasSeenTargetFloorSuggestion', 'true');
        setHasSeenSuggestion(true);
    }, []);

    React.useEffect(() => {
        const justLeftOwnership = prevActiveTab === 'ownership' && activeTab !== 'ownership';

        if (isGuideMode && !hasSeenSuggestion && justLeftOwnership && ownedMegidoCount > 0) {
            let suggestedFloor = 0;
            if (ownedMegidoCount < 100) {
                suggestedFloor = 15;
            } else if (ownedMegidoCount <= 150) {
                suggestedFloor = 20;
            } else if (ownedMegidoCount <= 200) {
                suggestedFloor = 25;
            } else { // more than 200
                suggestedFloor = 35;
            }

            onSuggestTargetFloor(suggestedFloor);
            handleDismissSuggestion();
        }
    }, [activeTab, prevActiveTab, isGuideMode, hasSeenSuggestion, ownedMegidoCount, onSuggestTargetFloor, handleDismissSuggestion]);

    if (!isGuideMode) {
        return null;
    }

    // Step 1: Prompt to register Megido, but only when NOT on the ownership tab.
    if (ownedMegidoCount === 0 && activeTab !== 'ownership') {
        const baseBubbleStyle = {
            position: 'fixed',
            backgroundColor: 'rgba(74, 85, 104, 0.9)', // Bluish-gray
            color: 'white',
            padding: '15px 25px',
            borderRadius: '15px',
            zIndex: 10002,
            fontSize: '16px',
            textAlign: 'center',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        };
        const bubbleStyle = {
            ...baseBubbleStyle,
            top: '160px', // Moved down further
            left: '50%',
            transform: 'translateX(-50%)',
        };
        const arrowStyle = {
            content: '""',
            position: 'absolute',
            borderStyle: 'solid',
            borderColor: 'rgba(74, 85, 104, 0.9) transparent transparent transparent',
            bottom: '100%', // Arrow points up
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '10px 10px 0',
        };

        return (
            <div style={bubbleStyle}>
                <div style={arrowStyle}></div>
                <p>まずは所持しているメギドを登録しましょう！<br />登録が終わったら、次のステップに進むためにタブを移動してください。</p>
            </div>
        );
    }

    return null; 
};