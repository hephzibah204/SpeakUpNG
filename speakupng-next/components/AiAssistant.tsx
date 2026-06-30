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
      content: `Hello! I am the EVOTE.NG AI Civic Assistant. Ask me anything about ${subjectName}'s track record, campaign promises, or citizen ratings.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestions = [
    `What are ${subjectName}'s main promises?`,
    `How is ${subjectName} rated by citizens?`,
    `Give me a summary of ${subjectName}'s background.`,
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
          { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to connect. Please check your connection and try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl flex flex-col h-[480px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-[#141714] border-b border-[#2c312a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00b368] animate-pulse"></div>
          <h3 className="font-bold text-sm text-white font-display">AI Civic Assistant</h3>
        </div>
        <span className="text-[10px] text-[#6b7163] font-bold uppercase tracking-wider bg-zinc-900 px-2 py-0.5 rounded border border-[#2c312a]">
          Beta
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#008751] text-white rounded-tr-none'
                  : 'bg-[#141714] border border-[#2c312a] text-zinc-300 rounded-tl-none'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#141714] border border-[#2c312a] rounded-2xl rounded-tl-none p-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 py-3 bg-[#141714]/40 border-t border-[#2c312a]/50 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="text-[11px] font-semibold text-[#00b368] hover:text-white bg-[#008751]/10 hover:bg-[#008751] border border-[#008751]/30 rounded-lg px-3 py-1.5 transition-all text-left"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-[#141714] border-t border-[#2c312a]">
        <div className="relative">
          <input
            type="text"
            disabled={loading}
            placeholder={`Ask about ${subjectName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="w-full pl-4 pr-12 py-3 border border-[#2c312a] rounded-xl bg-[#141714] text-xs sm:text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-[#00b368] transition-colors"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1.5 p-1.5 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
