'use client';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  agentName?: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, agentName, isStreaming = false }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Agent name label for assistant messages */}
        {!isUser && agentName && (
          <span className="text-xs font-medium px-1" style={{ color: '#006A4E' }}>
            {agentName}
          </span>
        )}

        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'rounded-2xl rounded-br-md text-white'
              : 'rounded-2xl rounded-bl-md border'
          }`}
          style={
            isUser
              ? { backgroundColor: '#006A4E', color: '#ffffff' }
              : {
                  backgroundColor: '#FFFDF7',
                  borderColor: '#E8DDD0',
                  color: '#1C1917',
                }
          }
        >
          {content}
          {/* Streaming cursor */}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse" style={{ backgroundColor: '#006A4E' }} />
          )}
        </div>
      </div>
    </div>
  );
}
