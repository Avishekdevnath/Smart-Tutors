'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useChatConfig } from '@/hooks/useChatConfig';
import { useChatStore } from '@/hooks/useChatStore';
import ChatBubble from './ChatBubble';
import ChatPanel from './ChatPanel';

// Routes where the chat widget should be hidden
const HIDDEN_ROUTES = ['/dashboard', '/tutor', '/admin'];

function shouldHide(pathname: string): boolean {
  return HIDDEN_ROUTES.some(route => pathname.startsWith(route));
}

export default function ChatWidget() {
  const pathname = usePathname();
  const { config, loading: configLoading } = useChatConfig();
  const { state, dispatch, sendMessage, startNewChat } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for 'open-chat-widget' custom event (homepage CTA)
  useEffect(() => {
    const handler = () => dispatch({ type: 'OPEN' });
    window.addEventListener('open-chat-widget', handler);
    return () => window.removeEventListener('open-chat-widget', handler);
  }, [dispatch]);

  const handleOpen = useCallback(() => {
    dispatch({ type: 'OPEN' });
  }, [dispatch]);

  // Inject greeting when panel opens and there are no messages
  useEffect(() => {
    if (!state.isOpen || configLoading || !config) return;
    if (state.messages.length > 0) return;

    // Inject greeting as streaming tokens then complete
    const greeting = config.persona.greeting;
    dispatch({ type: 'START_STREAMING' });
    let i = 0;
    const chunkSize = 5;
    const interval = setInterval(() => {
      if (i < greeting.length) {
        const chunk = greeting.slice(i, i + chunkSize);
        dispatch({ type: 'APPEND_TOKEN', text: chunk });
        i += chunkSize;
      } else {
        clearInterval(interval);
        dispatch({
          type: 'STREAM_DONE',
          data: {
            conversationId: '',
            extractedData: {},
            completeness: 0,
            status: 'idle',
            intent: '',
          },
        });
      }
    }, 30);

    return () => clearInterval(interval);
  // Only run when panel first opens with no messages
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isOpen, configLoading]);

  const handleClose = useCallback(() => {
    dispatch({ type: 'CLOSE' });
    setIsExpanded(false);
  }, [dispatch]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    startNewChat();
  }, [startNewChat]);

  const handleEdit = useCallback(() => {
    sendMessage('আমি পরিবর্তন করতে চাই');
  }, [sendMessage]);

  const handleConfirm = useCallback(() => {
    sendMessage('ঠিক আছে, এই তথ্য দিয়ে পোস্ট করুন');
  }, [sendMessage]);

  // Hide on protected routes
  if (shouldHide(pathname)) return null;

  const agentName = config?.persona?.name ?? 'কামরুল';

  return (
    <>
      {/* Chat panel — shown when open */}
      {state.isOpen && (
        <ChatPanel
          agentName={agentName}
          messages={state.messages}
          isStreaming={state.isStreaming}
          status={state.status}
          extractedData={state.extractedData}
          error={state.error}
          isMobile={isMobile}
          isExpanded={isExpanded}
          onClose={handleClose}
          onToggleExpand={handleToggleExpand}
          onNewChat={handleNewChat}
          onSend={sendMessage}
          onEdit={handleEdit}
          onConfirm={handleConfirm}
        />
      )}

      {/* Bubble — shown when closed */}
      {!state.isOpen && (
        <ChatBubble
          onClick={handleOpen}
          unreadCount={0}
        />
      )}
    </>
  );
}
