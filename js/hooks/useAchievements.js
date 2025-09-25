const useAchievements = () => {
    const { useState, useCallback, useEffect } = React;

    const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
        const saved = localStorage.getItem('unlockedAchievements');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    const [achievementToast, setAchievementToast] = useState(null);

    const showAchievementToast = useCallback((achievement) => {
        setAchievementToast(achievement);
        setTimeout(() => {
            setAchievementToast(null);
        }, 4500);
    }, []);

    const unlockAchievement = useCallback((achievementId) => {
        if (typeof ACHIEVEMENTS === 'undefined') return;
        if (!unlockedAchievements.has(achievementId)) {
            const newUnlocked = new Set(unlockedAchievements);
            newUnlocked.add(achievementId);
            setUnlockedAchievements(newUnlocked);
            const achievement = ACHIEVEMENTS[achievementId];
            showAchievementToast(achievement);
        }
    }, [unlockedAchievements, showAchievementToast]);

    const checkAllAchievements = useCallback((userData) => {
        if (typeof ACHIEVEMENTS === 'undefined') return;

        const newUnlocked = new Set(unlockedAchievements);
        let changed = false;

        for (const ach of Object.values(ACHIEVEMENTS)) {
            if (ach.condition && !newUnlocked.has(ach.id)) {
                if (ach.condition(userData)) {
                    newUnlocked.add(ach.id);
                    showAchievementToast(ach);
                    changed = true;
                }
            }
        }

        if (changed) {
            setUnlockedAchievements(newUnlocked);
        }
    }, [unlockedAchievements, showAchievementToast]);

    useEffect(() => {
        localStorage.setItem('unlockedAchievements', JSON.stringify(Array.from(unlockedAchievements)));
    }, [unlockedAchievements]);

    return {
        unlockedAchievements,
        achievementToast,
        unlockAchievement,
        checkAllAchievements,
        showAchievementToast,
    };
};