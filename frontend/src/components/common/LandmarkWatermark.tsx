export default function LandmarkWatermark({ type }: { type: string }) {
  const getSvg = () => {
    switch (type) {
      case "india-gate":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M20 70h60v-4H20v4zm6-6h48V42H26v22zm4-20h40V34H30v10zm-4-12h48v-4H26v4zm8-6h32v-3H34v3zm6-5h20v-3H40v3zm-4 47h28V46c0-6-6-10-14-10s-14 4-14 10v18z" opacity="0.65" />
          </svg>
        );
      case "golden-temple":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M15 72h70v-4H15v4zm10-6h50V46H25v20zm8-22h34V32H33v12zm10-14c0-7 7-12 7-12s7 5 7 12h-14zm-14 36h28V50c0-4-4-7-14-7s-14 3-14 7v16z" opacity="0.65" />
            <circle cx="50" cy="18" r="3" />
          </svg>
        );
      case "gateway":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M18 72h64v-5H18v5zm8-7h48V34H26v31zm6-33h36V26H32v5zm4-7h28V20H36v4zm-3 40h34V46c0-9-8-14-17-14s-17 5-17 14v18z" opacity="0.65" />
            <rect x="22" y="16" width="6" height="18" rx="2" />
            <rect x="72" y="16" width="6" height="18" rx="2" />
          </svg>
        );
      case "howrah":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M5 68h90v-4H5v4zm10-4l18-40h8L23 64h-8zm62 0l-18-40h-8l18 40h8zm-34-40h14v40H43V24zm-20 40h54v-3H23v3z" opacity="0.6" />
            <line x1="28" y1="24" x2="72" y2="24" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case "gopuram":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M22 72h56v-4H22v4zm4-6h48V54H26v12zm4-14h40V42H30v12zm4-14h32V32H34v12zm4-14h24V24H38v10zm4-12h16c0-4-8-7-8-7s-8 3-8 7zm-3 50h22V60c0-5-5-8-11-8s-11 3-11 8v12z" opacity="0.65" />
          </svg>
        );
      case "charminar":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M20 72h60v-4H20v4zm12-6h36V42H32v24zm4-26h28V32H36v8zm-4 26h36V50c0-8-8-12-18-12s-18 4-18 12v16z" opacity="0.65" />
            <rect x="22" y="18" width="6" height="50" />
            <rect x="72" y="18" width="6" height="50" />
            <circle cx="25" cy="15" r="4" />
            <circle cx="75" cy="15" r="4" />
          </svg>
        );
      case "palace":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M15 72h70v-4H15v4zm8-6h54V48H23v18zm18-20h18V38H41v8zm9-10c0-6 6-10 6-10s6 4 6 10h-12zm-22 30h40V56c0-6-8-10-20-10s-20 4-20 10v16z" opacity="0.65" />
            <circle cx="28" cy="40" r="6" />
            <circle cx="72" cy="40" r="6" />
          </svg>
        );
      case "palms":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M30 72c2-20 12-36 26-44-6-1-16 2-22 8-5 5-7 14-4 36zm26-44c12-3 24 1 28 8-8 2-18 0-24-4-2-1-3-3-4-4zm-8-3c-1-8 4-17 12-21-3 7-1 15 2 19-5 1-10 0-14 2zm30 45H16c14-5 32-6 46 0 5 2 11 3 16 0z" opacity="0.65" />
          </svg>
        );
      case "himalaya":
      case "chinar":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M10 70l28-36 14 18 18-26 24 44H10zm28-36l-8 12 12 6-4-18zm32-8l-8 14 14 6-6-20z" opacity="0.6" />
          </svg>
        );
      case "lotus":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M50 20c-8 12-14 24-12 36 6 8 18 10 24 0 2-12-4-24-12-36zm-14 16c-10 6-18 16-16 26 8 6 18 2 22-6-2-8-4-14-6-20zm28 0c-2 6-4 12-6 20 4 8 14 12 22 6 2-10-6-20-16-26zM20 70h60c-10-4-20-6-30-6s-20 2-30 6z" opacity="0.65" />
          </svg>
        );
      case "rhino":
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M18 52c4-12 14-16 26-15 4 0 12-6 22-6 12 0 20 6 22 14 2 2 6 2 8 4-2 3-5 5-8 5v14h-8v-10H64v10h-8v-12H34v12h-8V58c-4 0-7-2-8-6zm66-4c3-2 5-6 6-9-2 1-5 4-6 9z" opacity="0.65" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 100 80" fill="currentColor">
            <path d="M25 70h50v-4H25v4zm6-6h38V46H31v18zm4-20h30V34H35v10zm6-12h18V24H41v8zm4-10h10V18H45v4zm-9 42h28V50c0-6-6-9-14-9s-14 3-14 9v16z" opacity="0.6" />
          </svg>
        );
    }
  };

  return (
    <div className="absolute right-1 bottom-1 w-20 h-16 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity text-slate-400 overflow-hidden flex items-end justify-end">
      {getSvg()}
    </div>
  );
}
