'use client';

interface ChatHeaderProps {
  agentName: string;
  onClose: () => void;
  onBack?: () => void;
  isMobile?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onNewChat?: () => void;
}

export default function ChatHeader({ agentName, onClose, onBack, isMobile = false, isExpanded = false, onToggleExpand, onNewChat }: ChatHeaderProps) {
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

      {/* New Chat button */}
      {onNewChat && (
        <button
          onClick={onNewChat}
          aria-label="Start new chat"
          title="নতুন চ্যাট শুরু করুন"
          className="text-white hover:opacity-80 focus:outline-none flex-shrink-0 mr-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </button>
      )}

      {/* Expand/collapse button — desktop only */}
      {!isMobile && onToggleExpand && (
        <button
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Collapse chat' : 'Expand chat'}
          className="text-white hover:opacity-80 focus:outline-none flex-shrink-0 mr-1"
        >
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          )}
        </button>
      )}

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
