// Plain currentColor SVGs for the permission rows — raw emoji (🎥/🖥️/⛶)
// render in their own fixed full-color tone regardless of CSS, same issue
// fixed earlier for the theme-toggle and clock icons.
const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function WebcamIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10.5 22 7v10l-6-3.5" />
    </svg>
  );
}

export function MonitorIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function FullscreenIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <polyline points="8 3 3 3 3 8" />
      <polyline points="16 3 21 3 21 8" />
      <polyline points="3 16 3 21 8 21" />
      <polyline points="16 21 21 21 21 16" />
    </svg>
  );
}

// ---- "For best results" webcam-checklist illustrations ------------------
const checklistIconProps = {
  width: 64,
  height: 64,
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// A person in front of a screen, with a virtual-background pattern crossed
// out behind them.
export function AvoidVirtualBackgroundIcon() {
  return (
    <svg {...checklistIconProps} aria-hidden="true">
      <rect x="8" y="10" width="48" height="34" rx="3" />
      <circle cx="15" cy="16" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="20" cy="16" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="38" cy="30" r="4" strokeDasharray="2 3" />
      <circle cx="47" cy="20" r="2.5" strokeDasharray="2 3" />
      <circle cx="27" cy="35" r="6" />
      <path d="M17 44c0-5.5 4.5-10 10-10s10 4.5 10 10" />
    </svg>
  );
}

// A plain, solitary person — "find a private place".
export function PrivatePlaceIcon() {
  return (
    <svg {...checklistIconProps} aria-hidden="true">
      <circle cx="32" cy="22" r="9" />
      <path d="M14 50c0-10 8-18 18-18s18 8 18 18" />
    </svg>
  );
}

// A person under a downward light cone — "use proper light source".
export function LightSourceIcon() {
  return (
    <svg {...checklistIconProps} aria-hidden="true">
      <path d="M22 8h20l6 14H16z" />
      <circle cx="32" cy="34" r="8" />
      <path d="M18 54c0-8.5 6.5-15.5 14-15.5S46 45.5 46 54" />
    </svg>
  );
}

// A person framed inside a dashed viewfinder — "face visible in the webcam".
export function FaceVisibleIcon() {
  return (
    <svg {...checklistIconProps} aria-hidden="true">
      <rect x="10" y="8" width="44" height="44" rx="4" strokeDasharray="4 4" />
      <circle cx="32" cy="26" r="8" />
      <path d="M18 48c0-8 6.5-14.5 14-14.5S46 40 46 48" />
    </svg>
  );
}
