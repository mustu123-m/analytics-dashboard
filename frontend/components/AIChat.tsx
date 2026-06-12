'use client';
import { useState, useRef, useEffect } from 'react';
import { chatWithData } from '@/lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }
interface Props { fileId: string; fileName: string; }

const STARTERS = [
  'Summarize the key trends',
  'Which column has the most variance?',
  'Are there any outliers?',
  'What should I investigate first?',
];

export default function AIChat({ fileId, fileName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text: string) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    const next: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(next);
    setLoading(true);
    try {
      const { reply } = await chatWithData(fileId, userMsg, messages);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages([...next, { role: 'assistant', content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 230px)', background: 'var(--surface)', border: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--green)' }} />
          <p className="text-xs mono" style={{ color: 'var(--muted)' }}>gemini-2.0-flash · {fileName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-1.5">
            <p className="text-xs mono uppercase tracking-wider mb-2" style={{ color: 'var(--dim)' }}>Suggested</p>
            {STARTERS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="block w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? 'var(--blue)' : 'var(--surface-2)',
                color: msg.role === 'user' ? '#08090d' : 'var(--text)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2.5 rounded-lg flex gap-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              {[0,1,2].map(i => <span key={i} className="w-1 h-1 rounded-full pulse-dot" style={{ background: 'var(--dim)', animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send('')}
            placeholder="Ask about this dataset…"
            className="flex-1"
          />
          <button onClick={() => send('')} disabled={!input.trim() || loading}
            className="px-3 rounded-md transition-opacity disabled:opacity-30"
            style={{ background: 'var(--blue)', color: '#08090d' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
