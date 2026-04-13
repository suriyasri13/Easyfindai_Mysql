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
    <div className="fixed right-6 bottom-6 w-[400px] h-[550px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/20 z-50 flex flex-col border border-gray-100 overflow-hidden transition-all transform duration-300">
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-[#1A2538] to-[#2D3E5F] text-white p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#14B8A6] to-teal-600 p-2.5 rounded-full shadow-inner ring-2 ring-white/10">
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold tracking-wide">EaseFind.ai Assistant</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <p className="text-[11px] font-semibold text-teal-100 uppercase tracking-wider">Online</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-white/10 p-2 rounded-full transition-colors opacity-80 hover:opacity-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Window */}
      <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-gradient-to-b from-gray-50/50 to-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2.5 text-sm ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Contextual Avatars */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
              msg.isUser 
                ? 'bg-gray-100 text-gray-500 border border-gray-200' 
                : 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white border border-teal-500/20'
            }`}>
              {msg.isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Asymmetrical Chat Bubbles */}
            <div
              className={`max-w-[78%] p-3.5 shadow-sm whitespace-pre-line leading-relaxed text-[14.5px] ${
                msg.isUser
                  ? 'bg-[#1E2A44] text-white rounded-2xl rounded-br-sm'
                  : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-bl-sm font-medium'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Real-time Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5 text-sm">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white flex items-center justify-center shadow-md">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-gray-100 text-gray-800 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 h-[46px]">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 pb-5">
        <div className="flex items-center gap-2 bg-gray-50/80 p-1.5 rounded-full border-2 border-gray-100 focus-within:border-teal-400 focus-within:bg-white transition-all duration-300">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 text-[15px] text-gray-700 placeholder:text-gray-400"
            disabled={isTyping}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white rounded-full w-[42px] h-[42px] p-0 flex-shrink-0 transition-transform active:scale-95 shadow-md shadow-teal-500/20 disabled:opacity-50 disabled:shadow-none"
          >
            <Send size={18} className="translate-x-[1px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}