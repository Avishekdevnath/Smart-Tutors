'use client';

import { useReducer, useCallback, useEffect } from 'react';

const LS_KEY = 'st_chat_session';

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
  error: null,
};

// Load persisted session from localStorage (browser-only)
function loadFromStorage(): Partial<ChatState> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const saved = JSON.parse(raw);
    // Skip restoring if saved messages contain raw JSON blobs (legacy corruption)
    const messages: Message[] = (saved.messages || [])
      .filter((m: Message) => !(m.role === 'assistant' && m.content.trim().startsWith('{')))
      .map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }));
    return {
      messages,
      sessionId: saved.sessionId || null,
      extractedData: saved.extractedData || {},
      completeness: saved.completeness || 0,
      status: saved.status || 'idle',
    };
  } catch {
    return {};
  }
}

function saveToStorage(state: ChatState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      messages: state.messages,
      sessionId: state.sessionId,
      extractedData: state.extractedData,
      completeness: state.completeness,
      status: state.status,
    }));
  } catch {}
}

function clearStorage() {
  try {
    localStorage.removeItem(LS_KEY);
    // Also clear legacy key
    localStorage.removeItem('st_browser_session');
  } catch {}
}

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
        error: null,
      };
    case 'START_STREAMING':
      return {
        ...state,
        isStreaming: true,
        messages: [...state.messages, { role: 'assistant', content: '', timestamp: new Date() }],
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
        status: action.data.status as ChatState['status'],
      };
    case 'SET_ERROR': {
      const msgs = state.messages;
      const lastMsg = msgs[msgs.length - 1];
      const cleanedMsgs =
        lastMsg?.role === 'assistant' && lastMsg.content === ''
          ? msgs.slice(0, -1)
          : msgs;
      return { ...state, isStreaming: false, error: action.error, messages: cleanedMsgs };
    }
    case 'RESTORE_CONVERSATION':
      return {
        ...state,
        messages: action.messages,
        sessionId: action.sessionId,
        extractedData: action.extractedData,
        completeness: action.completeness,
        status: action.status as ChatState['status'],
      };
    case 'RESET':
      return { ...initialState, isOpen: state.isOpen };
    default:
      return state;
  }
}

export function useChatStore() {
  const [state, dispatch] = useReducer(chatReducer, initialState, (base) => ({
    ...base,
    ...loadFromStorage(),
  }));

  // Persist to localStorage whenever conversation state changes
  useEffect(() => {
    if (state.messages.length > 0 || state.sessionId) {
      saveToStorage(state);
    }
  }, [state.messages, state.sessionId, state.extractedData, state.completeness, state.status]);

  const sendMessage = useCallback(async (content: string) => {
    dispatch({ type: 'ADD_USER_MESSAGE', content });
    dispatch({ type: 'START_STREAMING' });

    // Re-read sessionId from state via closure isn't reliable after dispatch;
    // we use a ref-like approach — read latest value from localStorage
    const saved = (() => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } })();
    const sessionId = saved.sessionId || null;

    // Generate/persist a stable browser session id
    const browserSessionId =
      localStorage.getItem('st_browser_session') ||
      (() => {
        const id = crypto.randomUUID();
        localStorage.setItem('st_browser_session', id);
        return id;
      })();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, browserSessionId, message: content }),
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
              } else if (data.error) {
                dispatch({ type: 'SET_ERROR', error: 'একটু সমস্যা হচ্ছে, আবার চেষ্টা করুন।' });
              }
            } catch {}
          }
        }
      }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Network error — please try again' });
    }
  }, []);

  const startNewChat = useCallback(() => {
    clearStorage();
    dispatch({ type: 'RESET' });
  }, []);

  return { state, dispatch, sendMessage, startNewChat };
}
