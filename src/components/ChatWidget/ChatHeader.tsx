'use client';

interface ChatHeaderProps {
  agentName: string;
  onClose: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}

export default function ChatHeader({ agentName, onClose, onBack, isMobile = false }: ChatHeaderProps) {
  const initial = agentName ? agentName.charAt(0).toUpperCase() : 'K';

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-t-xl flex-shrink-0"
      style={{ backgroundColor: '#006A4E' }}
    >
      {/* Back arrow on mobile */}
      {isMobile && onBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className="text-white mr-1 focus:outline-none hover:opacity-80"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
      )}

      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
        <span className="text-white font-bold text-base">{initial}</span>
      </div>

      {/* Agent info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight truncate">{agentName}</p>
        <p className="text-white text-opacity-80 text-xs leading-tight" style={{ opacity: 0.8 }}>
          Smart Tutor সাহায্যকারী
        </p>
      </div>

      {/* Close (X) button — shown on desktop; on mobile, back arrow is used */}
      {!isMobile && (
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-white hover:opacity-80 focus:outline-none flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Close button on mobile too (top-right) */}
      {isMobile && (
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-white hover:opacity-80 focus:outline-none flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
