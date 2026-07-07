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
      text: 'Hello! I am the EVOTE.NG Civic AI Assistant. Ask me anything about Nigerian legislative bills, representative scorecards, political promises, or platform methodologies.',
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
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error connecting to the AI helper. Please verify your connection.',
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
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="mb-6 text-center border-b border-[#2c312a] pb-4 flex-shrink-0">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#00b368]">Civic Intelligence</span>
          <h1 className="text-3xl font-extrabold font-display text-white mt-1">Ask Civic AI</h1>
          <p className="text-sm text-[#6b7163]">
            Ask questions about bills, budgets, politicians, and electoral laws.
          </p>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl overflow-y-auto space-y-4 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow ${
                    m.sender === 'user' 
                      ? 'bg-[#008751] text-white rounded-br-none' 
                      : 'bg-[#141714] text-zinc-300 border border-[#2c312a] rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="text-[9px] text-zinc-500 block mt-1 text-right select-none">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#141714] border border-[#2c312a] rounded-2xl rounded-bl-none p-4 max-w-[80%] text-sm text-zinc-400 flex items-center gap-2">
                  <span className="inline-block animate-bounce text-[#00b368]">●</span>
                  <span className="inline-block animate-bounce text-[#00b368] delay-75">●</span>
                  <span className="inline-block animate-bounce text-[#00b368] delay-150">●</span>
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions if history is empty/short */}
          {messages.length === 1 && (
            <div className="pt-4 border-t border-[#2c312a]/30">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b7163] block mb-2">Try asking:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => askSampleQuestion(q)}
                    className="text-left text-xs bg-[#141714] hover:bg-[#2c312a] border border-[#2c312a] text-zinc-300 px-3 py-2 rounded-xl transition-colors"
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
            placeholder="Type your civic question here..."
            className="flex-1 bg-[#1d211b] border border-[#2c312a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00b368] transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center"
          >
            Send
          </button>
        </form>

      </div>
    </div>
  );
}
