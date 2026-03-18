'use client';

import { useReducer, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  isOpen: boolean;
  messages: Message[];
  sessionId: string | null;
  extractedData: Record<string, unknown>;
  completeness: number;
  isStreaming: boolean;
  status: 'idle' | 'active' | 'confirming' | 'completed' | 'escalated';
  error: string | null;
}

type ChatAction =
  | { type: 'TOGGLE' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'ADD_USER_MESSAGE'; content: string }
  | { type: 'START_STREAMING' }
  | { type: 'APPEND_TOKEN'; text: string }
  | { type: 'STREAM_DONE'; data: { conversationId: string; extractedData: Record<string, unknown>; completeness: number; status: string; intent: string } }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESTORE_CONVERSATION'; messages: Message[]; sessionId: string; extractedData: Record<string, unknown>; completeness: number; status: string }
  | { type: 'RESET' };

const initialState: ChatState = {
  isOpen: false,
  messages: [],
  sessionId: null,
  extractedData: {},
  completeness: 0,
  isStreaming: false,
  status: 'idle',
  error: null
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN':
      return { ...state, isOpen: true };
    case 'CLOSE':
      return { ...state, isOpen: false };
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, { role: 'user', content: action.content, timestamp: new Date() }],
        error: null
      };
    case 'START_STREAMING':
      return {
        ...state,
        isStreaming: true,
        messages: [...state.messages, { role: 'assistant', content: '', timestamp: new Date() }]
      };
    case 'APPEND_TOKEN': {
      const msgs = [...state.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + action.text };
      }
      return { ...state, messages: msgs };
    }
    case 'STREAM_DONE':
      return {
        ...state,
        isStreaming: false,
        sessionId: action.data.conversationId,
        extractedData: action.data.extractedData,
        completeness: action.data.completeness,
        status: action.data.status as ChatState['status']
      };
    case 'SET_ERROR':
      return { ...state, isStreaming: false, error: action.error };
    case 'RESTORE_CONVERSATION':
      return {
        ...state,
        messages: action.messages,
        sessionId: action.sessionId,
        extractedData: action.extractedData,
        completeness: action.completeness,
        status: action.status as ChatState['status']
      };
    case 'RESET':
      return { ...initialState, isOpen: state.isOpen };
    default:
      return state;
  }
}

export function useChatStore() {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(async (content: string) => {
    dispatch({ type: 'ADD_USER_MESSAGE', content });
    dispatch({ type: 'START_STREAMING' });

    const browserSessionId = localStorage.getItem('st_browser_session')
      || (() => { const id = crypto.randomUUID(); localStorage.setItem('st_browser_session', id); return id; })();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          browserSessionId,
          message: content
        })
      });

      if (!res.ok) {
        const err = await res.json();
        dispatch({ type: 'SET_ERROR', error: err.error || 'Something went wrong' });
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        dispatch({ type: 'SET_ERROR', error: 'No response stream' });
        return;
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text !== undefined) {
                dispatch({ type: 'APPEND_TOKEN', text: data.text });
              } else if (data.conversationId) {
                dispatch({ type: 'STREAM_DONE', data });
              }
            } catch {}
          }
        }
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Network error — please try again' });
    }
  }, [state.sessionId]);

  const resumeConversation = useCallback(async () => {
    const browserSessionId = localStorage.getItem('st_browser_session');
    if (!browserSessionId) return;

    try {
      const res = await fetch(`/api/ai/chat/${browserSessionId}`);
      const data = await res.json();
      if (data.conversation) {
        dispatch({
          type: 'RESTORE_CONVERSATION',
          messages: data.conversation.messages,
          sessionId: data.conversation.sessionId,
          extractedData: data.conversation.extractedData || {},
          completeness: data.conversation.completeness || 0,
          status: data.conversation.status
        });
      }
    } catch {}
  }, []);

  return { state, dispatch, sendMessage, resumeConversation };
}
