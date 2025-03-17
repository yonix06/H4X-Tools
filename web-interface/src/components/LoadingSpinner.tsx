import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  className = ''
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <motion.div
        className={`${sizes[size]} ${isDark ? 'text-purple-500' : 'text-purple-600'}`}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 6V4"/>
          <path opacity="0.8" d="M16.24 7.76L17.66 6.34"/>
          <path opacity="0.6" d="M18 12H20"/>
          <path opacity="0.4" d="M16.24 16.24L17.66 17.66"/>
          <path opacity="0.3" d="M12 18V20"/>
          <path opacity="0.2" d="M7.76 16.24L6.34 17.66"/>
          <path opacity="0.1" d="M6 12H4"/>
          <path opacity="0.05" d="M7.76 7.76L6.34 6.34"/>
        </svg>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;