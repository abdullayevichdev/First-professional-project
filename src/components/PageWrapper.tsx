import React, { useContext } from 'react';
import { motion } from 'motion/react';
import { SwipeContext } from '../App';
import { swipeDirection as globalSwipeDirection } from './SwipeNavigation';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const variants = {
  initial: (direction: 'left' | 'right' | null) => {
    if (direction === 'left') return { opacity: 0, x: 50 };
    if (direction === 'right') return { opacity: 0, x: -50 };
    return { opacity: 0, y: 20 };
  },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: (direction: 'left' | 'right' | null) => {
    if (direction === 'left') return { opacity: 0, x: -50 };
    if (direction === 'right') return { opacity: 0, x: 50 };
    return { opacity: 0, y: -20 };
  }
};

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  const swipeDirection = useContext(SwipeContext);

  return (
    <motion.div
      custom={globalSwipeDirection || swipeDirection}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
