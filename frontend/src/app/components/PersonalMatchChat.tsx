import { X, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getChatMessages, sendChatMessage, ChatMessage, initiateChat } from '../services/api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { verifySerialNumber } from '../services/api';
import { toast } from 'sonner';

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
    isConfidential?: boolean;
  };
}

export default function PersonalMatchChat({ isOpen, onClose, match }: PersonalMatchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [serialInput, setSerialInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentUserId] = useState<string | number>(() => {
    // Attempt to get logged in user from storage, or fallback to 'anonymous'
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser).userId : 0;
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsVerified(false);
      setSerialInput('');
      return;
    }

    // 0. Initiate Chat (Sends email if first time)
    initiateChat(match.id, currentUserId);

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

  const handleVerify = async () => {
    if (!serialInput.trim()) return;
    setIsVerifying(true);
    try {
      const result = await verifySerialNumber(Number(match.id), serialInput);
      if (result.verified) {
        setIsVerified(true);
        toast.success("Identity Verified. Chat Unlocked.");
      } else {
        toast.error("Invalid Security Key. Access Denied.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
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

        {/* Chat Body - Gated by Verification */}
        {!isVerified ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-[#3B82F6] max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h4 className="text-xl font-bold text-[#1E2A44] mb-2">Security Verification</h4>
              <p className="text-sm text-gray-500 mb-6 font-medium">
                This item is protected. Please enter the **Serial Number** (Unique Identifier) to access this conversation.
              </p>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="Enter Serial Number / Key"
                  className="text-center border-2 border-gray-200 focus:border-[#3B82F6] font-mono text-lg tracking-widest h-14"
                />
                <Button 
                  onClick={handleVerify} 
                  disabled={isVerifying}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-6 font-bold text-base shadow-lg transition-transform active:scale-95"
                >
                  {isVerifying ? 'Verifying...' : 'Unlock Chat'}
                </Button>
                <p className="text-[10px] text-gray-400 mt-4 italic">
                  * Note: For security, verification is required every time you open this chat.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}