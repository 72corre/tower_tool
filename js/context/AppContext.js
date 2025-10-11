const AppContext = React.createContext();

const AppProvider = ({ children }) => {
    // All the state and functions will be here
    const uiState = useUIState();
    const gameData = useGameData({ 
        showToastMessage: uiState.showToastMessage, 
        /* other dependencies */ 
    });
    const achievements = useAchievements();

    const value = {
        ...uiState,
        ...gameData,
        ...achievements,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

const useAppContext = () => React.useContext(AppContext);
