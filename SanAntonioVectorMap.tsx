import React from 'react';

interface SanAntonioVectorMapProps {
  className?: string;
  opacity?: number;
  maskId?: string;
}

/**
 * Monochrome Black & White San Antonio Vector Basemap
 * Tracing San Antonio street geometry: I-10, I-35, Loop 410, Loop 1604, and downtown urban blocks.
 * Primary arterial highways: stroke="rgba(255, 255, 255, 0.18)" strokeWidth="2.5"
 * Grid & residential streets: stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.0"
 * Pitch black canvas (#040711 / #000000) with radial vignette.
 */
export const SanAntonioVectorMap: React.FC<SanAntonioVectorMapProps> = ({
  className = "w-full h-full object-cover",
  opacity = 0.85,
  maskId = "saVectorRadialMask"
}) => {
  return (
    <div className="relative w-full h-full select-none pointer-events-none">
      <svg 
        viewBox="0 0 2400 1600" 
        className={`${className} select-none pointer-events-none`}
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity }}
      >
        <defs>
          {/* Radial Gradient Mask keeping center streets crisply visible and softly fading to dark edges */}
          <radialGradient id={maskId} cx="50%" cy="50%" r="58%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="78%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          
          <mask id={`mask_${maskId}`}>
            <rect width="2400" height="1600" fill={`url(#${maskId})`} />
          </mask>
        </defs>

        <g mask={`url(#mask_${maskId})`}>
          {/* Base canvas: Pitch black */}
          <rect width="2400" height="1600" fill="#040711" />

          {/* 1. DENSE RESIDENTIAL & SECONDARY URBAN STREET GRID (stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.0") */}
          <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.0">
            {/* Vertical City Streets */}
            {Array.from({ length: 48 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 50 + 25} y1="0" x2={i * 50 + 25} y2="1600" />
            ))}
            {/* Horizontal City Streets */}
            {Array.from({ length: 32 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 50 + 25} x2="2400" y2={i * 50 + 25} />
            ))}
            {/* Diagonal Grid Elements */}
            <line x1="300" y1="300" x2="2100" y2="1300" />
            <line x1="2100" y1="300" x2="300" y2="1300" />
            <line x1="600" y1="200" x2="1800" y2="1400" />
            <line x1="1800" y1="200" x2="600" y2="1400" />
          </g>

          {/* 2. SECONDARY COLLECTORS & CROSS ARTERIALS */}
          <g stroke="rgba(255, 255, 255, 0.11)" strokeWidth="1.4">
            {/* North & South Sector Horizontal Connectors */}
            <line x1="800" y1="200" x2="1600" y2="200" />
            <line x1="600" y1="350" x2="1800" y2="350" />
            <line x1="400" y1="500" x2="2000" y2="500" />
            <line x1="300" y1="650" x2="2100" y2="650" />
            <line x1="300" y1="950" x2="2100" y2="950" />
            <line x1="400" y1="1100" x2="2000" y2="1100" />
            <line x1="600" y1="1250" x2="1800" y2="1250" />
            <line x1="800" y1="1400" x2="1600" y2="1400" />

            {/* Radial Arterials (San Pedro, Blanco, Broadway, Zarzamora, New Braunfels, Commerce, Culebra) */}
            <line x1="720" y1="100" x2="1120" y2="780" />
            <line x1="880" y1="100" x2="1160" y2="780" />
            <line x1="1040" y1="80" x2="1190" y2="760" />
            <line x1="1360" y1="80" x2="1210" y2="760" />
            <line x1="1520" y1="100" x2="1240" y2="780" />
            <line x1="1680" y1="120" x2="1280" y2="800" />
            <line x1="1140" y1="820" x2="800" y2="1500" />
            <line x1="1180" y1="830" x2="1050" y2="1550" />
            <line x1="1220" y1="830" x2="1350" y2="1550" />
            <line x1="1260" y1="820" x2="1600" y2="1500" />
            <line x1="100" y1="740" x2="1150" y2="790" />
            <line x1="100" y1="840" x2="1150" y2="810" />
            <line x1="1250" y1="790" x2="2300" y2="740" />
            <line x1="1250" y1="810" x2="2300" y2="850" />
          </g>

          {/* 3. PRIMARY ARTERIAL HIGHWAYS (stroke="rgba(255, 255, 255, 0.18)" strokeWidth="2.5") */}
          <g stroke="rgba(255, 255, 255, 0.18)" strokeWidth="2.5" fill="none" strokeLinecap="round">
            {/* LOOP 1604 (Outer Loop) */}
            <ellipse 
              cx="1200" 
              cy="800" 
              rx="980" 
              ry="680" 
              strokeDasharray="10 6" 
            />

            {/* LOOP 410 (Inner Highway Beltway) */}
            <ellipse 
              cx="1200" 
              cy="800" 
              rx="580" 
              ry="400" 
              strokeWidth="2.8"
            />

            {/* HIGHWAY I-35 (NE to SW diagonal) */}
            <path d="M 2300 120 L 1650 480 L 1220 780 L 1150 820 L 800 1080 L 150 1500" />

            {/* HIGHWAY I-10 (NW to SE diagonal) */}
            <path d="M 120 160 L 680 480 L 1170 770 L 1240 820 L 1750 1120 L 2320 1480" />

            {/* HIGHWAY I-37 / US-281 (North-South Expressway) */}
            <path d="M 1205 60 L 1205 740 L 1235 810 L 1280 940 L 1380 1540" />

            {/* HIGHWAY US-90 */}
            <path d="M 1160 815 L 850 880 L 100 950" />

            {/* HIGHWAY 151 */}
            <path d="M 1140 790 L 780 730 L 120 700" />

            {/* WURZBACH PARKWAY ARC */}
            <path d="M 680 380 Q 1200 480 1720 380" strokeDasharray="8 4" strokeWidth="2.2" />

            {/* MILITARY DRIVE ARC */}
            <path d="M 650 1180 Q 1200 1100 1750 1180" strokeDasharray="8 4" strokeWidth="2.2" />

            {/* DOWNTOWN INNER FREEWAY LOOP */}
            <path 
              d="M 1130 750 C 1190 730 1230 730 1260 760 C 1280 790 1250 840 1200 850 C 1150 845 1120 800 1130 750 Z" 
              strokeWidth="2.8" 
            />
          </g>

          {/* DOWNTOWN RADAR BEACON (Monochrome Subdued Ring) */}
          <circle cx="1200" cy="790" r="45" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <circle cx="1200" cy="790" r="22" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1.5" />
          <circle cx="1200" cy="790" r="5" fill="rgba(255, 255, 255, 0.45)" />
        </g>
      </svg>

      {/* Contrast Masking: Radial vignette ensuring streets stay visible behind center while fading to dark edges */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(4, 7, 17, 0.45) 60%, rgba(4, 7, 17, 0.95) 100%)'
        }}
      />
    </div>
  );
};

export default SanAntonioVectorMap;
