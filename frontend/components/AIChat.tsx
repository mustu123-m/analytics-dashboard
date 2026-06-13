'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { chatWithData } from '@/lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }
interface Props { fileId: string; fileName: string; }

const STARTERS = [
  { text: 'Summarize the key trends', emoji: '📈' },
  { text: 'Which column has the most variance?', emoji: '📊' },
  { text: 'Are there any outliers?', emoji: '🔍' },
  { text: 'What should I investigate first?', emoji: '🧭' },
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
    <div className="max-w-2xl mx-auto flex flex-col rounded-3xl overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: 400, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ background: 'var(--grad-soft)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: 'var(--grad)' }}>🤖</div>
        <div>
          <p className="text-sm font-bold">AI Analyst</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Gemini 2.0 Flash · {fileName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--dim)' }}>TRY ASKING</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTERS.map(s => (
                <motion.button key={s.text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => send(s.text)}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-start gap-2"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span>{s.emoji}</span><span>{s.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium"
              style={{
                background: msg.role === 'user' ? 'var(--grad)' : 'var(--surface-2)',
                color: msg.role === 'user' ? 'white' : 'var(--text)',
              }}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex gap-1.5" style={{ background: 'var(--surface-2)' }}>
              {[0,1,2].map(i => (
                <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--indigo)' }}
                  animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
              ))}
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
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => send('')} disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-30 flex-shrink-0"
            style={{ background: 'var(--grad)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
