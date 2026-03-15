import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  '/',
  '/category/uzbekistan',
  '/category/global',
  '/category/speech',
  '/category/opinion',
  '/glossary',
  '/about',
];

export let swipeDirection: 'left' | 'right' | null = null;

export const SwipeNavigation = ({ setSwipeDirection }: { setSwipeDirection: (dir: 'left' | 'right' | null) => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSwiping = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const wheelAccumulatorX = useRef(0);
  const wheelAccumulatorY = useRef(0);
  const lastWheelTime = useRef(Date.now());

  useEffect(() => {
    const handleNavigation = (direction: 'left' | 'right') => {
      if (isSwiping.current) return;
      
      const currentIndex = navItems.findIndex(item => location.pathname === item);
      if (currentIndex === -1) return; // Not on a main nav page

      let nextIndex = currentIndex;
      if (direction === 'left' && currentIndex < navItems.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (direction === 'right' && currentIndex > 0) {
        nextIndex = currentIndex - 1;
      }

      if (nextIndex !== currentIndex) {
        isSwiping.current = true;
        swipeDirection = direction;
        setSwipeDirection(direction);
        navigate(navItems[nextIndex]);
        
        // Prevent multiple navigations in quick succession
        setTimeout(() => {
          isSwiping.current = false;
          swipeDirection = null;
          setSwipeDirection(null);
        }, 800);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        touchStartX.current = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        touchStartY.current = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && !isSwiping.current) {
        const currentX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        
        const diffX = touchStartX.current - currentX;
        const diffY = touchStartY.current - currentY;

        // Threshold and prevent accidental vertical scrolling
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 2) {
          e.preventDefault(); // Prevent default browser back/forward swipe
          if (diffX > 0) {
            handleNavigation('left'); // Swiped left, go to next
          } else {
            handleNavigation('right'); // Swiped right, go to prev
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Ignore vertical scrolling
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;

      // Prevent default browser back/forward navigation on trackpad
      if (Math.abs(e.deltaX) > 10) {
        e.preventDefault();
      }

      const now = Date.now();
      if (now - lastWheelTime.current > 100) {
        wheelAccumulatorX.current = 0;
        wheelAccumulatorY.current = 0;
      }
      lastWheelTime.current = now;

      wheelAccumulatorX.current += e.deltaX;
      wheelAccumulatorY.current += e.deltaY;

      if (!isSwiping.current && Math.abs(wheelAccumulatorX.current) > 100 && Math.abs(wheelAccumulatorX.current) > Math.abs(wheelAccumulatorY.current) * 2) {
        if (wheelAccumulatorX.current > 0) {
          handleNavigation('left');
        } else {
          handleNavigation('right');
        }
        wheelAccumulatorX.current = 0;
        wheelAccumulatorY.current = 0;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [location.pathname, navigate]);

  return null;
};
