import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Phone, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import AIChatPanel from '../components/AIChatPanel';

export default function HelpPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl mb-6 text-[#1E2A44] font-semibold">Help Center</h2>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 mb-8 border border-blue-100">
          <p className="text-gray-700 leading-relaxed mb-6 text-base">
            If you need assistance, please reach out through Contact Us or use the AI Chat for
            quick help. Our team is here to support you with any questions or issues you may
            have.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard/contact" className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all">
                <Phone size={20} className="mr-2" />
                Go to Contact Us
              </Button>
            </Link>
            <Button 
              onClick={() => setIsChatOpen(true)}
              className="flex-1 bg-[#1E2A44] hover:bg-[#2D3E5F] text-white py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <MessageSquare size={20} className="mr-2" />
              Open AI Chat
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl text-[#1E2A44] mb-3 font-semibold">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="text-lg mb-2 text-[#1E2A44] font-medium">How do I report a lost item?</h4>
              <p className="text-gray-600 text-base">
                Navigate to "Report Item" from the top navigation bar, select "Lost Item", fill
                in the details including item name, category, description, and location, then
                submit your report.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="text-lg mb-2 text-[#1E2A44] font-medium">How does the matching system work?</h4>
              <p className="text-gray-600 text-base">
                Our AI-powered system automatically matches lost and found items based on
                category, keywords in descriptions, and image similarity. You'll receive
                notifications when potential matches are found.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="text-lg mb-2 text-[#1E2A44] font-medium">
                Can I chat with someone who found my item?
              </h4>
              <p className="text-gray-600 text-base">
                Yes! Once a match is confirmed, you can use the Personal Chat feature to
                communicate directly with the person who found your item or the owner of a lost
                item you found.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="text-lg mb-2 text-[#1E2A44] font-medium">What file types can I upload?</h4>
              <p className="text-gray-600 text-base">
                You can upload JPG and PNG images with a maximum file size of 5MB. Clear photos
                help improve matching accuracy.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5">
              <h4 className="text-lg mb-2 text-[#1E2A44] font-medium">How do I enable location services?</h4>
              <p className="text-gray-600 text-base">
                When reporting an item, click the "Enable Current Location" button. Your browser
                will prompt you to allow location access. This helps us automatically fetch and
                display your current GPS coordinates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}