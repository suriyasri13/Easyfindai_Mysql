import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Phone, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import AIChatPanel from '../components/AIChatPanel';

export default function HelpPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100">
        <h2 className="text-4xl mb-10 text-[#1e293b] font-bold tracking-tight">Help Center</h2>

        <div className="bg-slate-50 rounded-[2rem] p-10 mb-12 border border-slate-100 shadow-sm">
          <p className="text-slate-500 leading-relaxed mb-10 text-lg font-medium">
            Need help? Reach out through our contact channels or use our real-time AI assistance
            for instant support with reporting items, tracking matches, or account management.
          </p>

          <div className="flex flex-col sm:flex-row gap-8">
            <Link to="/dashboard/contact" className="flex-1">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-8 text-lg font-bold shadow-xl shadow-emerald-100 transition-all rounded-2xl">
                <Phone size={24} className="mr-3" />
                Contact Support
              </Button>
            </Link>
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-8 text-lg font-bold shadow-xl shadow-blue-100 transition-all rounded-2xl"
            >
              <MessageSquare size={24} className="mr-3" />
              Chat with EaseFind AI
            </Button>
          </div>
        </div>

        <div className="space-y-10">
          <h3 className="text-2xl text-[#1e293b] font-bold flex items-center gap-3">
            <span className="p-2 bg-blue-50 text-blue-500 rounded-lg">❓</span>
            Frequently Asked Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: "How do I report a lost item?",
                a: "Navigate to \"Report Item\" from the top navigation bar, select \"Lost Item\", fill in the details including item name, category, description, and location, then submit your report."
              },
              {
                q: "How does the matching system work?",
                a: "Our AI-powered system automatically matches lost and found items based on category, keywords in descriptions, and image similarity. You'll receive notifications when potential matches are found."
              },
              {
                q: "Can I chat with someone who found my item?",
                a: "Yes! Once a match is confirmed, you can use the Personal Chat feature to communicate directly with the person who found your item or the owner of a lost item you found."
              },
              {
                q: "What file types can I upload?",
                a: "You can upload JPG and PNG images with a maximum file size of 5MB. Clear photos help improve matching accuracy."
              },
              {
                q: "How do I enable location services?",
                a: "When reporting an item, click the \"Enable Current Location\" button. Your browser will prompt you to allow location access. This helps us automatically fetch and display your current GPS coordinates."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group shadow-sm">
                <h4 className="text-xl mb-4 text-[#1e293b] font-bold group-hover:text-blue-600 transition-colors">{faq.q}</h4>
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}