const useSwipeNavigation = ({ onSwipeLeft, onSwipeRight, threshold = 50, isSwipeEnabled = true }) => {
    const touchStart = React.useRef(null);
    const touchEnd = React.useRef(null);
    const ref = React.useRef(null);

    const handleTouchStart = (e) => {
        if (!isSwipeEnabled) return;
        touchEnd.current = null; // Reset touch end on new touch
        touchStart.current = e.targetTouches[0];
    };

    const handleTouchMove = (e) => {
        if (!isSwipeEnabled) return;
        touchEnd.current = e.targetTouches[0];
    };

    const handleTouchEnd = () => {
        if (!isSwipeEnabled || !touchStart.current || !touchEnd.current) {
            return;
        }

        const distanceX = touchStart.current.clientX - touchEnd.current.clientX;
        const distanceY = touchStart.current.clientY - touchEnd.current.clientY;

        // Make sure it's a horizontal swipe and not a vertical scroll
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
            const isLeftSwipe = distanceX > threshold;
            const isRightSwipe = distanceX < -threshold;

            if (isLeftSwipe && onSwipeLeft) {
                onSwipeLeft();
            }
            if (isRightSwipe && onSwipeRight) {
                onSwipeRight();
            }
        }

        touchStart.current = null;
        touchEnd.current = null;
    };

    React.useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Use passive: true for touchmove to improve scroll performance.
        // We don't call preventDefault, so it's safe.
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: true });
        element.addEventListener('touchend', handleTouchEnd);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [ref.current, onSwipeLeft, onSwipeRight, isSwipeEnabled]);

    return ref;
};