'use client';

import { useState } from 'react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const SAMPLE_QUESTIONS = [
  'What is the status of the Electoral Act 2022?',
  'Who represents Lagos Central in the Senate?',
  'What is the formula used for the Political DNA Score?',
  'List some promises made by Governor Seyi Makinde.'
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Welcome. Inquire about Nigerian legislative bills, representative scorecards, tracked campaign promises, or platform evaluation methodologies.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.response || 'Sorry, I could not process that request. Please try again.',
          timestamp: new Date()
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to connect to the query service. Please verify your connection.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const askSampleQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-body pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="mb-6 text-center border-b border-rule pb-4 flex-shrink-0">
          <span className="text-xs font-semibold text-accent-light">Civic intelligence query</span>
          <h1 className="text-3xl font-extrabold font-display text-ink mt-1">Ask EVOTE.NG</h1>
          <p className="text-sm text-muted mt-1">
            Search legislative bills, state budgets, politician track records, and electoral laws.
          </p>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 bg-paper-2 border border-rule rounded-2xl p-6 shadow-card overflow-y-auto space-y-4 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-accent text-accent-ink rounded-br-none' 
                      : 'bg-paper text-ink border border-rule rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[10px] text-muted block mt-1 text-right select-none tabular-nums">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-paper border border-rule rounded-2xl rounded-bl-none px-4 py-3 text-xs text-muted">
                  Searching verified records…
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions if history is empty/short */}
          {messages.length === 1 && (
            <div className="pt-4 border-t border-rule">
              <span className="text-xs font-semibold text-muted block mb-2">Example queries:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => askSampleQuestion(q)}
                    className="text-left text-xs bg-paper hover:bg-paper-3 border border-rule text-ink-2 px-3 py-2 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <form onSubmit={handleSend} className="mt-4 flex gap-3 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your civic inquiry here…"
            className="flex-1 bg-paper-2 border border-rule rounded-xl px-4 py-3 text-sm text-ink placeholder-muted focus-visible:outline-2 focus-visible:outline-focus transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-accent hover:bg-accent-light disabled:opacity-50 text-accent-ink font-bold px-6 py-3 rounded-xl transition-colors text-sm flex items-center justify-center focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5"
          >
            Submit
          </button>
        </form>

      </div>
    </div>
  );
}
