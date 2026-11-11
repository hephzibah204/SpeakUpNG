'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiAssistantProps {
  politicianId?: string;
  officialId?: string;
  subjectName: string;
}

export function AiAssistant({ politicianId, officialId, subjectName }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Inquire about ${subjectName}'s legislative votes, tracked promises, or public rating records.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    `What are ${subjectName}'s main promises?`,
    `How is ${subjectName} rated by citizens?`,
    `Summary of ${subjectName}'s background`,
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          politician_id: politicianId,
          official_id: officialId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Record retrieval failed. Please try again.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-paper-2 border border-rule rounded-2xl flex flex-col h-[480px] overflow-hidden shadow-card font-body">
      {/* Header */}
      <div className="bg-paper border-b border-rule px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-light"></span>
          <h3 className="font-semibold text-sm text-ink font-display">Inquiry assistant</h3>
        </div>
        <span className="text-xs text-muted">Records intelligence</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-accent text-accent-ink rounded-tr-none'
                  : 'bg-paper border border-rule text-ink rounded-tl-none'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-paper border border-rule rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-muted">
              Querying civic records…
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 py-3 bg-paper border-t border-rule flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="text-xs font-semibold text-accent-light hover:text-ink bg-paper-3 hover:bg-paper-2 border border-rule rounded-lg px-3 py-1.5 transition-colors text-left focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-paper border-t border-rule">
        <div className="relative">
          <input
            type="text"
            disabled={loading}
            placeholder={`Ask about ${subjectName}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="w-full pl-4 pr-12 py-3 border border-rule rounded-xl bg-paper-2 text-xs sm:text-sm text-ink placeholder-muted focus-visible:outline-2 focus-visible:outline-focus transition-colors"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            aria-label="Submit inquiry"
            className="absolute right-2 top-1.5 p-2 bg-accent hover:bg-accent-light disabled:opacity-50 text-accent-ink rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5"
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
