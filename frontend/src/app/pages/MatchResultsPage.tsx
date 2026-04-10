import { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import PersonalMatchChat from '../components/PersonalMatchChat';
import { getMatches } from "../services/api";
interface Item {
  id: string;
  userId: string;
  userName: string;
  type: string;
  itemName: string;
  category: string;
  description: string;
  contactInfo: string;
  date: string;
  location: string;
  image: string | null;
  isConfidential: boolean;
}

interface Match {
  id: string;
  lostItem: Item;
  foundItem: Item;
  confidence: number;
  matchReason: string[];
  matchDate: string;
}

export default function MatchResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
  fetchMatches();
}, []);

const fetchMatches = async () => {
  try {
    const data = await getMatches();
    setMatches(data);
  } catch (error) {
    console.error("Error fetching matches:", error);
  }
};

  const openChat = (match: Match) => {
    setSelectedMatch(match);
    setIsChatOpen(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl text-[#1E2A44] font-semibold">Match Results</h2>
        <p className="text-gray-600 mt-2 text-base">
          Potential matches between lost and found items
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-base">No matches found yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Matches are generated automatically when lost and found items have similar characteristics
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-gradient-to-r from-[#86EFAC]/20 to-white rounded-xl shadow-lg p-6 border-2 border-[#86EFAC]"
            >
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <CheckCircle className="text-[#16A34A]" size={28} />
                  <div>
                    <h3 className="text-xl text-[#1E2A44] font-semibold">Match Found!</h3>
                    <p className="text-sm text-gray-600">
                      Matched on {new Date(match.matchDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Confidence Score Visualization */}
                  <div className="flex items-center gap-3 ml-4 bg-white px-4 py-2 rounded-lg border-2 border-[#86EFAC]">
                    <div className="relative w-16 h-16">
                      <svg className="transform -rotate-90 w-16 h-16">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#E5E7EB"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#16A34A"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${(match.confidence / 100) * 175.93} 175.93`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-bold text-[#16A34A]">{match.confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Match</p>
                      <p className="text-sm font-semibold text-[#1E2A44]">Confidence</p>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => openChat(match)}
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium text-base px-6"
                >
                  <MessageSquare size={18} className="mr-2" />
                  Start Chat
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-[#16A34A] font-medium">
                  Match Reasons: {match.matchReason.join(', ')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lost Item */}
                <div className="bg-white rounded-lg p-5 border-2 border-[#FCA5A5] relative">
                  {match.lostItem.isConfidential && (
                    <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      🔐 Protected
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-[#FCA5A5] text-gray-800 text-xs rounded-full font-medium">
                      LOST
                    </span>
                    <h4 className="text-lg text-[#1E2A44] font-medium">{match.lostItem.itemName}</h4>
                  </div>
                  {match.lostItem.image && (
                    <img
                      src={match.lostItem.image}
                      alt={match.lostItem.itemName}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    {match.lostItem.description}
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    User: {match.lostItem.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(match.lostItem.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Found Item */}
                <div className="bg-white rounded-lg p-5 border-2 border-[#93C5FD] relative">
                  {match.foundItem.isConfidential && (
                    <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      🔐 Protected
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-[#93C5FD] text-gray-800 text-xs rounded-full font-medium">
                      FOUND
                    </span>
                    <h4 className="text-lg text-[#1E2A44] font-medium">{match.foundItem.itemName}</h4>
                  </div>
                  {match.foundItem.image && (
                    <img
                      src={match.foundItem.image}
                      alt={match.foundItem.itemName}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    {match.foundItem.description}
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    User: {match.foundItem.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(match.foundItem.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Personal Match Chat */}
      {selectedMatch && (
        <PersonalMatchChat
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedMatch(null);
          }}
          match={selectedMatch}
        />
      )}
    </div>
  );
}