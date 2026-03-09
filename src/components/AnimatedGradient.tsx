"use client";

export const AnimatedGradient: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
        </defs>

        {/* Animated blob 1 */}
        <circle
          cx="300"
          cy="300"
          r="150"
          fill="rgba(59, 130, 246, 0.3)"
          filter="url(#blur)"
          opacity="0.3"
        >
          <animate attributeName="cx" values="300;600;300" dur="20s" repeatCount="indefinite" />
          <animate attributeName="cy" values="300;500;300" dur="15s" repeatCount="indefinite" />
        </circle>

        {/* Animated blob 2 */}
        <circle
          cx="900"
          cy="500"
          r="150"
          fill="rgba(168, 85, 247, 0.3)"
          filter="url(#blur)"
          opacity="0.3"
        >
          <animate attributeName="cx" values="900;600;900" dur="25s" repeatCount="indefinite" />
          <animate attributeName="cy" values="500;200;500" dur="18s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};
