
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 'md', showText = true }) => {
  
  // Size mapping for the icon
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-20 h-20"
  };

  // Size mapping for the text container
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-4xl",
    xl: "text-7xl"
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          <defs>
            <linearGradient id="logo_gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" /> {/* blue-400 */}
              <stop offset="1" stopColor="#A78BFA" /> {/* purple-400 */}
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Outer Glass Container */}
          <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#logo_gradient)" fillOpacity="0.15" stroke="url(#logo_gradient)" strokeWidth="1.5" />
          
          {/* Inner Depth Symbols (Chevrons) */}
          <path d="M11 19L20 28L29 19" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 11L20 20L29 11" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" />
          
          {/* Subtle Glint */}
          <circle cx="32" cy="8" r="1.5" fill="white" fillOpacity="0.6" />
        </svg>
      </div>

      {showText && (
        <div className={`font-sans tracking-tight text-white flex items-baseline ${textSizes[size]}`}>
          <span className="font-light opacity-90">Deep</span>
          <span className="font-bold relative">
            Dive
            {/* Tiny accent dot */}
            <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0"></span>
          </span>
        </div>
      )}
    </div>
  );
};
