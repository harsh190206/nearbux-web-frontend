import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  return (
    <div 
      className={`rounded-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src="/nearbux.png" 
        alt="NearBux Logo" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};