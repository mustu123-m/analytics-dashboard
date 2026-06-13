'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div className="flex flex-col rounded-2xl overflow-hidden glass" style={{ height: 'calc(100vh - 320px)', minHeight: 380 }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--glass-br)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center relative flex-shrink-0" style={{ background: 'var(--grad-1)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5.5 2.5C4 2.5 3 3.5 3 5C2 5.3 1.5 6.2 1.5 7C1.5 8 2.3 8.8 3 9C3 10.5 4 11.5 5.5 11.5M5.5 2.5C6.5 2.5 7 3 7 4V10C7 11 6.5 11.5 5.5 11.5M5.5 2.5V11.5M10.5 2.5C12 2.5 13 3.5 13 5C14 5.3 14.5 6.2 14.5 7C14.5 8 13.7 8.8 13 9C13 10.5 12 11.5 10.5 11.5M10.5 2.5C9.5 2.5 9 3 9 4V10C9 11 9.5 11.5 10.5 11.5M10.5 2.5V11.5" stroke="#05060A" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold">AI Analyst</p>
          <p className="text-xs mono truncate" style={{ color: 'var(--dim)' }}>gemini-2.0-flash · {fileName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold mb-2" style={{ color: 'var(--dim)' }}>TRY ASKING</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTERS.map(s => (
                <motion.button key={s} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: 'var(--glass-2)', border: '1px solid var(--glass-br)' }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium"
              style={{
                background: msg.role === 'user' ? 'var(--grad-1)' : 'var(--glass-2)',
                color: msg.role === 'user' ? '#05060A' : 'var(--text)',
              }}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex gap-1.5" style={{ background: 'var(--glass-2)' }}>
              {[0,1,2].map(i => (
                <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--cyan)' }}
                  animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--glass-br)' }}>
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
            style={{ background: 'var(--grad-1)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="#05060A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
