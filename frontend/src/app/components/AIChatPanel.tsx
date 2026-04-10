import { X, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatPanel({ isOpen, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: 'Hello! I\'m your AI assistant for EaseFind.ai. How can I help you today?', isUser: false }
  ]);
  const [input, setInput] = useState('');

  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    // Report Lost Item
    if (msg.includes('report') && (msg.includes('lost') || msg.includes('lose'))) {
      return 'To report a lost item:\n1. Click "Report Item" in the top navigation\n2. Select "Report Lost Item"\n3. Fill in details: item name, category, description\n4. Add contact information\n5. Enable location or enter last known location\n6. Upload a photo (optional)\n7. Click "Submit Lost Item Report"\n\nYour item will be automatically matched with found items!';
    }
    
    // Report Found Item
    if (msg.includes('report') && msg.includes('found')) {
      return 'To report a found item:\n1. Click "Report Item" in the top navigation\n2. Select "Report Found Item"\n3. Fill in details: item name, category, description\n4. Add your contact information\n5. Enter current storage location\n6. Upload a photo (optional)\n7. Click "Submit Found Item Report"\n\nThe system will match it with lost items automatically!';
    }
    
    // Matching
    if (msg.includes('match') || msg.includes('how does') || msg.includes('work')) {
      return 'Our AI matching system works by:\n1. Analyzing item categories\n2. Comparing item names and descriptions\n3. Matching keywords and attributes\n4. Calculating confidence scores\n\nWhen a match is found (40%+ confidence), you\'ll see it in "Match Results" and receive a notification. You can then start a personal chat with the matched user!';
    }
    
    // Claim Process
    if (msg.includes('claim') || msg.includes('get back') || msg.includes('retrieve')) {
      return 'To claim your item:\n1. Go to "Match Results" page\n2. Find your matched item\n3. Click "Start Chat" button\n4. Coordinate with the finder\n5. Arrange a safe meetup location\n6. Verify the item details\n7. Collect your item!\n\nAlways meet in public places for safety.';
    }
    
    // Location
    if (msg.includes('location') || msg.includes('gps')) {
      return 'Location features:\n• Click "Enable Current Location" to auto-fill GPS coordinates\n• Your browser will ask for permission\n• For lost items: provides last known location\n• For found items: where the item is currently stored\n\nThis helps match items in your area!';
    }
    
    // Chat
    if (msg.includes('chat') || msg.includes('message') || msg.includes('contact')) {
      return 'Personal Chat is available only for matched items:\n1. Go to "Match Results"\n2. Find a confirmed match\n3. Click "Start Chat"\n4. Communicate directly with the other user\n5. Arrange item return\n\nChat is private and secure between matched users only.';
    }
    
    // Upload/Image
    if (msg.includes('upload') || msg.includes('image') || msg.includes('photo')) {
      return 'Image upload guidelines:\n• Supported formats: JPG, PNG\n• Maximum size: 5MB\n• Clear, well-lit photos work best\n• Multiple angles help matching\n• Images improve match accuracy\n\nClick the upload area in the report form to select your image.';
    }
    
    // Contact/Help
    if (msg.includes('help') || msg.includes('contact') || msg.includes('support')) {
      return 'Need more help?\n📞 Phone: 7200076786\n📧 Email: support@easefind.ai\n📍 Address: No 12: 555 MCE Campus Road, Chennai\n⏰ Hours: Mon-Fri, 9:00 AM – 5:00 PM\n\nYou can also visit the Contact Us page from the sidebar!';
    }
    
    // Default response
    return 'I can help you with:\n• How to report lost/found items\n• Understanding the matching system\n• Claiming your items\n• Using the chat feature\n• Location services\n• Image uploads\n\nWhat would you like to know more about?';
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    // Get AI response
    setTimeout(() => {
      const aiResponse = getAIResponse(input);
      setMessages(prev => [...prev, {
        text: aiResponse,
        isUser: false
      }]);
    }, 500);

    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-6 bottom-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200">
      {/* Header */}
      <div className="bg-[#1E2A44] text-white p-4 rounded-t-2xl flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Chat Assistant</h3>
        <button
          onClick={onClose}
          className="hover:bg-white/10 p-1 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line text-sm ${
                msg.isUser
                  ? 'bg-[#14B8A6] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border-2 border-gray-200 focus:border-[#14B8A6]"
          />
          <Button
            onClick={handleSend}
            className="bg-[#14B8A6] hover:bg-[#0F9B8E] text-white"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}