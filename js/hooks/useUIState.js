const useUIState = () => {
    const { useState, useCallback } = React;

    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('ui_activeTab');
        const allowedTabs = ['details', 'ownership', 'formation', 'summary', 'all_summary'];
        return (savedTab && allowedTabs.includes(savedTab)) ? savedTab : 'details';
    });

    const [mode, setMode] = useState(() => localStorage.getItem('ui_mode') || 'practice');
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [recoveryModalState, setRecoveryModalState] = useState({ isOpen: false });
    const [choiceModalState, setChoiceModalState] = useState({ isOpen: false });
    const [statusBuffModalState, setStatusBuffModalState] = useState({ isOpen: false });
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'auto');
    const [isFooterCollapsed, setIsFooterCollapsed] = useState(() => {
        const saved = localStorage.getItem('isFooterCollapsed');
        return saved ? JSON.parse(saved) : true;
    });
    const [isMapSearchModalOpen, setIsMapSearchModalOpen] = useState(false);

    const showToastMessage = useCallback((message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, []);

    const handleModeChange = (newMode) => {
        setMode(newMode);
        // setDisplayedEnemy(null); // This will be handled in the main component
        if (mode === 'log' && newMode !== 'log') {
            // handleSelectLog(null); // This will be handled in the main component
            // setSelectedLogSquare(null); // This will be handled in the main component
        }
        setSelectedSquare(null);
        localStorage.removeItem('ui_selectedSquareKey');
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        // setDisplayedEnemy(null); // This will be handled in the main component
    };

    const handleToggleFooter = () => {
        const newCollapsedState = !isFooterCollapsed;
        setIsFooterCollapsed(newCollapsedState);
        localStorage.setItem('isFooterCollapsed', JSON.stringify(newCollapsedState));
    };

    const handleViewModeChange = (newMode) => {
        setViewMode(newMode);
        localStorage.setItem('viewMode', newMode);
    };
    
    const handleOpenMapSearch = () => setIsMapSearchModalOpen(true);
    const handleCloseMapSearch = () => setIsMapSearchModalOpen(false);

    return {
        activeTab,
        setActiveTab,
        mode,
        setMode,
        selectedSquare,
        setSelectedSquare,
        modalState,
        setModalState,
        recoveryModalState,
        setRecoveryModalState,
        choiceModalState,
        setChoiceModalState,
        statusBuffModalState,
        setStatusBuffModalState,
        toastMessage,
        showToast,
        showToastMessage,
        viewMode,
        handleViewModeChange,
        isFooterCollapsed,
        handleToggleFooter,
        isMapSearchModalOpen,
        handleOpenMapSearch,
        handleCloseMapSearch,
        handleModeChange,
        handleTabClick,
    };
};
