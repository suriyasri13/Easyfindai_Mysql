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
    
    // Clear input and trigger typing indicator immediately
    const userQuery = input;
    setInput('');
    setIsTyping(true);
    
    try {
      const data = await askChatBot(userQuery);
      setMessages(prev => [...prev, {
        text: data.response,
        isUser: false
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        text: "I'm having trouble connecting to my neural network right now. Please test your connection and try again!",
        isUser: false
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-8 bottom-8 w-[420px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl shadow-black/10 z-50 flex flex-col border border-black/5 overflow-hidden transition-all transform duration-500">
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/20">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">AI Assistant</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Active Now</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/10 p-2.5 rounded-xl transition-all"
        >
          <X size={22} />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-3 text-sm ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Contextual Avatars */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-[1.25rem] flex items-center justify-center shadow-md transition-transform hover:scale-110 ${
              msg.isUser 
                ? 'bg-white text-foreground/50 border border-black/5' 
                : 'bg-gradient-to-br from-primary to-blue-600 text-white'
            }`}>
              {msg.isUser ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Asymmetrical Chat Bubbles */}
            <div
              className={`max-w-[80%] p-5 shadow-sm whitespace-pre-line leading-relaxed text-[15px] font-medium transition-all ${
                msg.isUser
                  ? 'bg-primary text-white rounded-[1.75rem] rounded-br-none shadow-primary/20'
                  : 'bg-white text-foreground rounded-[1.75rem] rounded-bl-none border border-black/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Real-time Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-3 text-sm">
            <div className="flex-shrink-0 w-10 h-10 rounded-[1.25rem] bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-lg">
              <Bot size={20} />
            </div>
            <div className="bg-white p-5 rounded-[1.75rem] rounded-bl-none shadow-sm flex items-center gap-2 h-[56px] border border-black/5">
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-black/5 pb-8">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-full border border-black/5 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-500">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-6 text-base text-foreground placeholder:text-foreground/30 font-medium"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-white rounded-full w-[52px] h-[52px] p-0 flex-shrink-0 transition-all active:scale-90 shadow-xl shadow-primary/30"
          >
            <Send size={22} className="translate-x-[2px] -translate-y-[1px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}