import React, { memo } from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const Loader = memo(({ size = 'md', color = 'primary', className = '' }: LoaderProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-purple-500',
    secondary: 'border-blue-500',
    white: 'border-white'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-200 ${colorClasses[color]} ${sizeClasses[size]}`}
        style={{
          borderTopColor: 'transparent',
          willChange: 'transform'
        }}
      />
    </div>
  );
});

Loader.displayName = 'Loader';

export default Loader;
