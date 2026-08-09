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

export function MicrophoneIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

export function HelpCircleIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.3 9a2.7 2.7 0 1 1 3.9 2.4c-.8.4-1.2 1-1.2 1.9" />
      <circle cx="12" cy="16.8" r="0.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 13.5" />
    </svg>
  );
}

export function BookmarkIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M6 3h12v18l-6-4-6 4Z" />
    </svg>
  );
}

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

export function StarIcon({ filled }) {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2.5 15.09 8.76 22 9.76 17 14.64 18.18 21.52 12 18.26 5.82 21.52 7 14.64 2 9.76 8.91 8.76 12 2.5" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M12 3v13" />
      <polyline points="7 12 12 17 17 12" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

export function DockIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="15" y1="4" x2="15" y2="20" />
    </svg>
  );
}

export function InfoIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="7.5" r="0.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HistoryIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <polyline points="3 4 3 9 8 9" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </svg>
  );
}

export function CheckCircleIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12.5 11 15.5 16 9" />
    </svg>
  );
}

export function XCircleIcon() {
  return (
    <svg {...iconProps} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  );
}

export function SpinnerIcon({ className }) {
  return (
    <svg
      className={`spinner-icon ${className || ""}`}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 1-6.36 2.64" />
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
