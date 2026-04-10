import { X, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface PersonalMatchChatProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: string;
    lostItem: {
      userId: string;
      userName: string;
      itemName: string;
    };
    foundItem: {
      userId: string;
      userName: string;
      itemName: string;
    };
  };
}

export default function PersonalMatchChat({ isOpen, onClose, match }: PersonalMatchChatProps) {
  const [messages, setMessages] = useState<{ text: string; sender: string; time: string }[]>([
    {
      text: `Hello! I found an item matching "${match.foundItem.itemName}". Is this yours?`,
      sender: match.foundItem.userName,
      time: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      text: input,
      sender: 'You',
      time: new Date().toLocaleTimeString(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-[#3B82F6] text-white p-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Match Chat</h3>
            <p className="text-sm text-white/90">
              Chatting about: {match.lostItem.itemName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Match Info */}
        <div className="bg-[#3B82F6]/10 p-4 border-b border-[#3B82F6]/30">
          <p className="text-sm text-gray-700 font-medium">
            <span className="font-semibold text-[#1E2A44]">{match.lostItem.userName}</span> (Lost) ↔{' '}
            <span className="font-semibold text-[#1E2A44]">{match.foundItem.userName}</span> (Found)
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  msg.sender === 'You'
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-gray-100 text-gray-800'
                } rounded-lg p-3`}
              >
                <p className="text-sm mb-1">{msg.text}</p>
                <p className={`text-xs ${msg.sender === 'You' ? 'text-white/70' : 'text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 border-2 border-gray-200 focus:border-[#14B8A6] text-base"
            />
            <Button
              onClick={handleSend}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}