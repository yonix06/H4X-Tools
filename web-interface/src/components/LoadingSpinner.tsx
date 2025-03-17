import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Use provided color or theme default
  const spinnerColor = color || (isDark ? 'text-purple-400' : 'text-purple-600');
  
  // Determine size classes
  let sizeClasses = 'w-8 h-8';
  if (size === 'small') {
    sizeClasses = 'w-5 h-5';
  } else if (size === 'large') {
    sizeClasses = 'w-12 h-12';
  }

  return (
    <div className="flex justify-center items-center">
      <svg 
        className={`animate-spin ${sizeClasses} ${spinnerColor}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export default LoadingSpinner;