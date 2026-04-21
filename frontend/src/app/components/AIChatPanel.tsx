import { X, Send, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { askChatBot } from '../services/api';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: 'Hello! I\'m your AI assistant for EaseFind.ai. How can I help you today?', isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput('');
    setIsTyping(true);
    
    try {
      const data = await askChatBot(userQuery);
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (e) {
      setMessages(prev => [...prev, { text: "I'm having trouble connecting to my neural network right now. Please test your connection and try again!", isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-8 bottom-8 w-[420px] h-[650px] bg-white rounded-[3rem] shadow-2xl z-50 flex flex-col border border-pink-100 overflow-hidden transition-all transform duration-500 font-sans">
      
      {/* Soft Premium Header */}
      <div className="bg-gradient-to-r from-sky-500 to-pink-500 text-white p-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight uppercase">AI Assistant</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-widest">Active Now</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-2.5 rounded-xl transition-all">
          <X size={22} />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-sky-50/30 to-pink-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-end gap-3 text-sm ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:scale-110 ${
              msg.isUser ? 'bg-white text-slate-400 border border-pink-50' : 'bg-gradient-to-br from-sky-500 to-indigo-500 text-white'
            }`}>
              {msg.isUser ? <User size={18} /> : <Bot size={18} />}
            </div>

            <div className={`max-w-[80%] p-5 shadow-sm whitespace-pre-line leading-relaxed text-[14px] font-bold transition-all ${
              msg.isUser
                ? 'bg-sky-500 text-white rounded-[1.75rem] rounded-br-none shadow-sky-200'
                : 'bg-white text-slate-800 rounded-[1.75rem] rounded-bl-none border border-pink-50 shadow-pink-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end gap-3 text-sm">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-lg">
              <Bot size={18} />
            </div>
            <div className="bg-white p-5 rounded-[1.75rem] rounded-bl-none shadow-pink-100 flex items-center gap-2 h-[56px] border border-pink-50">
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white border-t border-pink-50">
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-full border border-pink-50 focus-within:border-sky-500/50 transition-all duration-500">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-6 text-sm text-slate-800 placeholder:text-slate-300 font-bold"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-slate-800 hover:bg-slate-900 text-white rounded-full w-[52px] h-[52px] p-0 flex-shrink-0 transition-all active:scale-90 shadow-xl"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}