'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatConfirmation from './ChatConfirmation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  agentName: string;
  messages: Message[];
  isStreaming: boolean;
  status: 'idle' | 'active' | 'confirming' | 'completed' | 'escalated';
  extractedData: Record<string, unknown>;
  error: string | null;
  isMobile: boolean;
  isExpanded: boolean;
  onClose: () => void;
  onToggleExpand: () => void;
  onNewChat: () => void;
  onSend: (message: string) => void;
  onEdit: () => void;
  onConfirm: () => void;
}

export default function ChatPanel({
  agentName,
  messages,
  isStreaming,
  status,
  extractedData,
  error,
  isMobile,
  isExpanded,
  onClose,
  onToggleExpand,
  onNewChat,
  onSend,
  onEdit,
  onConfirm,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const panelClass = isMobile
    ? 'fixed inset-0 z-50 flex flex-col bg-white'
    : 'fixed bottom-6 right-6 z-40 flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300';

  const panelStyle = isMobile
    ? {}
    : isExpanded
      ? { width: '720px', height: '85vh', maxHeight: '800px' }
      : { width: '400px', height: '600px' };

  return (
    <div className={panelClass} style={panelStyle}>
      {/* Header */}
      <ChatHeader
        agentName={agentName}
        onClose={onClose}
        isMobile={isMobile}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onNewChat={onNewChat}
      />

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{ backgroundColor: '#F5F0E8' }}
      >
        {messages.length === 0 && !isStreaming && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: '#78716C' }}>
              কথোপকথন শুরু করুন...
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isLastAssistant =
            msg.role === 'assistant' && idx === messages.length - 1 && isStreaming;
          return (
            <ChatMessage
              key={idx}
              role={msg.role}
              content={msg.content}
              agentName={msg.role === 'assistant' ? agentName : undefined}
              isStreaming={isLastAssistant}
            />
          );
        })}

        {/* Confirmation card when status is 'confirming' */}
        {status === 'confirming' && Object.keys(extractedData).length > 0 && (
          <ChatConfirmation
            data={extractedData}
            onEdit={onEdit}
            onConfirm={onConfirm}
          />
        )}

        {/* Completion link */}
        {status === 'completed' && (
          <div
            className="mx-3 my-2 rounded-xl border p-4 text-sm text-center"
            style={{ backgroundColor: '#FFFDF7', borderColor: '#E8DDD0' }}
          >
            <p className="mb-3 font-medium" style={{ color: '#1C1917' }}>
              আপনার টিউশন পোস্ট সফলভাবে জমা হয়েছে!
            </p>
            <Link
              href="/post-tuition"
              className="inline-block px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#006A4E' }}
            >
              টিউশন পোস্ট দেখুন →
            </Link>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-1 mb-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        disabled={isStreaming || status === 'completed'}
        placeholder={status === 'completed' ? 'কথোপকথন সম্পন্ন হয়েছে' : 'বার্তা লিখুন...'}
      />
    </div>
  );
}
