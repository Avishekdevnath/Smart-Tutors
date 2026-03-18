'use client';

import { useState, useEffect } from 'react';

interface ChatPersona {
  name: string;
  greeting: string;
}

interface ChatConfig {
  persona: ChatPersona;
}

let cachedConfig: ChatConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchChatConfig(): Promise<ChatConfig> {
  const now = Date.now();
  if (cachedConfig && now - cacheTimestamp < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const res = await fetch('/api/ai/config');
    if (!res.ok) throw new Error('Failed to fetch config');
    cachedConfig = await res.json();
    cacheTimestamp = now;
    return cachedConfig!;
  } catch {
    return {
      persona: {
        name: 'কামরুল',
        greeting: 'আসসালামু আলাইকুম! আমি smart agent কামরুল। আপনাকে কিভাবে সাহায্য করতে পারি?'
      }
    };
  }
}

export function useChatConfig() {
  const [config, setConfig] = useState<ChatConfig | null>(cachedConfig);
  const [loading, setLoading] = useState(!cachedConfig);

  useEffect(() => {
    fetchChatConfig().then(c => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  return { config, loading };
}
