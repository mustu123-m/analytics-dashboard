'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { chatWithData } from '@/lib/api';

interface Message { role: 'user' | 'assistant'; content: string; }

interface Props { fileId: string; fileName: string; }

const STARTERS = [
  'What are the key trends in this dataset?',
  'Which column has the most variance?',
  'Are there any outliers I should know about?',
  'What insights can you provide about the distribution?',
];

export default function AIChat({ fileId, fileName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const { reply } = await chatWithData(fileId, userMsg, messages);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] max-w-3xl rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.15)' }}>
          <Bot size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Ask about {fileName}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by GPT-4o Mini</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Suggested questions:</p>
            {STARTERS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left w-full transition-all hover:border-indigo-500"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <Sparkles size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Bot size={13} style={{ color: 'var(--accent)' }} />
              </div>
            )}
            <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
                color: 'var(--text)',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              }}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ background: 'var(--surface-2)' }}>
                <User size={13} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Bot size={13} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--surface-2)', borderRadius: '4px 18px 18px 18px' }}>
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send('')}
            placeholder="Ask anything about your data..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <button onClick={() => send('')} disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--accent)' }}>
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
