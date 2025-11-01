import React from 'react';

interface TalentEdgeLogoProps {
  showText?: boolean;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
}

const TalentEdgeLogo: React.FC<TalentEdgeLogoProps> = ({
  showText = true,
  className = '',
  iconSize = 'md',
}) => {
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon - Bookmark/Flag shape with gradient */}
      <div
        className={`${iconSizes[iconSize]} relative flex-shrink-0`}
        style={{
          clipPath:
            'polygon(0 0, 80% 0, 100% 25%, 80% 50%, 100% 75%, 80% 100%, 0 100%)',
        }}
      >
        <div
          className="w-full h-full rounded-sm"
          style={{
            background: 'linear-gradient(90deg, #2563eb 0%, #a21caf 100%)',
          }}
        />
      </div>

      {/* Text with gradient */}
      {showText && (
        <span className="font-semibold text-lg">
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #2563eb 0%, #a21caf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            TalentEdge
          </span>{' '}
          <span
            className="bg-clip-text text-transparent uppercase"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #7c3aed 0%, #a21caf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AI
          </span>
        </span>
      )}
    </div>
  );
};

export default TalentEdgeLogo;
