import { X, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getChatMessages, sendChatMessage, ChatMessage } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface PersonalMatchChatProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: string | number;
    lostItem: {
      userId: string | number;
      userName: string;
      itemName: string;
    };
    foundItem: {
      userId: string | number;
      userName: string;
      itemName: string;
    };
  };
}

export default function PersonalMatchChat({ isOpen, onClose, match }: PersonalMatchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [currentUserId] = useState<string | number>(() => {
    // Attempt to get logged in user from storage, or fallback to 'anonymous'
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser).userId : 0;
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Initial Fetch (Checks for 0 messages and triggers AI Bot if needed)
    fetchMessages();

    // 2. Setup STOMP WebSocket for 0-latency chat
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      debug: (str) => console.log(str),
      onConnect: () => {
        stompClient.subscribe(`/topic/chat_${match.id}`, (message) => {
          if (message.body) {
            const newChat = JSON.parse(message.body);
            setMessages(prev => {
              // Prevent duplicates
              if (prev.some(m => m.id === newChat.id)) return prev;
              return [...prev, newChat];
            });
          }
        });
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [isOpen, match.id]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await getChatMessages(match.id);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      matchId: match.id,
      senderId: currentUserId,
      content: input,
    };

    try {
      // Optimitic instantly responsive update
      const tempMsg = { ...newMessage, id: Date.now(), timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, tempMsg]);
      setInput('');

      await sendChatMessage(newMessage);
      // Fallback: also fetch in case WebSocket was sleeping
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
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
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Match Info */}
        <div className="bg-[#3B82F6]/10 p-4 border-b border-[#3B82F6]/30">
          <p className="text-sm text-gray-700 font-medium text-center">
            Conversation between <span className="font-bold text-[#1E2A44]">{match.lostItem.userName} (Lost)</span> and <span className="font-bold text-[#1E2A44]">{match.foundItem.userName} (Found)</span>
          </p>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 mt-10 italic">No messages yet. Start the conversation!</p>
          )}
          {messages.map((msg, idx) => {
            const isBot = Number(msg.senderId) === 0;
            const isMe = Number(msg.senderId) === Number(currentUserId);
            
            return (
            <div
              key={msg.id || idx}
              className={`flex ${isBot ? 'justify-center' : isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] ${
                  isBot ? 'bg-gradient-to-r from-[#86EFAC]/30 to-[#93C5FD]/30 border border-[#86EFAC] text-[#1E2A44]' :
                  isMe ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-800'
                } rounded-lg p-3 shadow-sm`}
              >
                {isBot && <p className="text-xs font-bold text-[#16A34A] mb-1">🤖 Security Bot</p>}
                <p className={`text-sm mb-1 ${isBot ? 'font-medium' : ''}`}>{msg.content}</p>
                <p className={`text-[10px] ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                </p>
              </div>
            </div>
          )})}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 border-2 border-gray-200 focus:border-[#3B82F6] text-base"
            />
            <Button onClick={handleSend} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}