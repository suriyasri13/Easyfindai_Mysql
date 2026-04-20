import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, CheckCircle, Trash2, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import PersonalMatchChat from '../components/PersonalMatchChat';
import { getMatches, deleteMatch, confirmMatch } from "../services/api";
import { toast } from "sonner";

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
  status: string;
  lostItem: Item;
  foundItem: Item;
  confidence: number;
  matchReason: string[];
  matchDate: string;
}

export default function MatchResultsPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const highlightedMatchId = new URLSearchParams(location.search).get('matchId');
  const matchRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (matches.length > 0 && highlightedMatchId) {
      const element = matchRefs.current[highlightedMatchId];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [matches, highlightedMatchId]);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;
    try {
      const data = await getMatches(user.userId);
      setMatches(data);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  const handleConfirmMatch = async (id: string) => {
    if (window.confirm("Is the physical item successfully returned to its owner? This will publicly mark the items as MATCH FOUND!")) {
      try {
        await confirmMatch(id);
        toast.success("Item Marked as Recovered!");
        fetchMatches();
      } catch (error: any) {
        toast.error(error.message || "Failed to confirm match");
      }
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (window.confirm("Are you sure you want to clear this match? The items will become pending again.")) {
      try {
        await deleteMatch(id);
        toast.success("Match cleared successfully");
        fetchMatches();
      } catch (error: any) {
        toast.error(error.message || "Failed to clear match");
      }
    }
  };

  const openChat = (match: Match) => {
    setSelectedMatch(match);
    setIsChatOpen(true);
  };

  const handleClearAll = async () => {
    if (matches.length === 0) return;
    if (window.confirm("Are you sure you want to clear ALL matches? The items will become pending again.")) {
      try {
        await Promise.all(matches.map(match => deleteMatch(match.id)));
        toast.success("All matches cleared successfully");
        fetchMatches();
      } catch (error: any) {
        toast.error("Failed to clear some matches");
        fetchMatches();
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl text-[#1e293b] font-bold tracking-tight">Match Results</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            AI-powered intelligence identifying potential item reunions
          </p>
        </div>
        {matches.length > 0 && (
          <button 
            onClick={handleClearAll} 
            className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded-xl transition-all font-bold text-sm"
          >
            <Trash2 size={18} />
            Clear All Matches
          </button>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-24 text-center border border-slate-200">
          <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} className="text-slate-300" />
          </div>
          <p className="text-[#1e293b] text-3xl font-bold mb-3 tracking-tight">No matches found yet</p>
          <p className="text-slate-500 text-lg font-medium">
            Our AI is continuously analyzing reports to find your belongings.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {matches.map((match) => {
            const isHighlighted = match.id.toString() === highlightedMatchId;
            return (
            <div
              key={match.id}
              ref={(el) => (matchRefs.current[match.id] = el)}
              className={`bg-white rounded-3xl shadow-sm p-10 border border-slate-200 relative group overflow-hidden transition-all duration-300 ${match.status === 'RESOLVED' ? 'border-amber-200' : 'hover:border-blue-200'} ${isHighlighted ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-[#f8fafc] scale-[1.01]' : ''}`}
            >
              {match.status === 'RESOLVED' ? (
                <div className="absolute top-4 right-[-45px] bg-amber-500 text-white text-[10px] font-black px-12 py-2 rotate-45 shadow-lg z-20 tracking-widest">
                  RECOVERED
                </div>
              ) : (
                <div className="absolute top-4 right-[-40px] bg-blue-500 text-white text-[10px] font-black px-12 py-2 rotate-45 shadow-lg z-20 tracking-widest">
                  AI MATCH
                </div>
              )}

              <button
                onClick={() => handleDeleteMatch(match.id)}
                className="absolute top-8 right-16 p-4 bg-slate-50 hover:bg-rose-500 text-slate-300 hover:text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 z-30"
                title="Clear Match"
              >
                <Trash2 size={20} />
              </button>

              <div className="flex items-center justify-between mb-10 flex-wrap gap-8">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <CheckCircle className="text-blue-500" size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl text-[#1e293b] font-bold tracking-tight">{match.status === 'RESOLVED' ? 'Item Successfully Recovered!' : 'AI Analysis Found a Match!'}</h3>
                    <p className="text-slate-500 mt-1 font-medium">
                      Matched on {new Date(match.matchDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-5 ml-8 bg-slate-50 px-6 py-4 rounded-[1.5rem] border border-slate-100">
                    <div className="relative w-14 h-14">
                      <svg className="transform -rotate-90 w-14 h-14">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="#e2e8f0"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          stroke="#3b82f6"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${Math.round((match.confidence / 100) * 150.8)} 150.8`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-black text-blue-600">{Math.round(match.confidence)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Confidence Score</p>
                      <p className="text-lg font-bold text-[#1e293b]">AI Precision</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button
                    onClick={() => openChat(match)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 rounded-xl transition-all"
                  >
                    <MessageSquare size={20} className="mr-3" />
                    Open Chat
                  </Button>
                  
                  {match.status !== 'RESOLVED' && (
                    <Button
                      onClick={() => handleConfirmMatch(match.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-6 px-8 rounded-xl transition-all"
                    >
                      <CheckCircle size={20} className="mr-3" />
                      Mark Recovered
                    </Button>
                  )}
                </div>
              </div>

              <div className="mb-10 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-sm text-blue-600 font-bold flex items-center gap-3">
                  <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                  Key Intelligence Factors: {match.matchReason.join(', ')}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Lost Item */}
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 relative group/item hover:bg-white hover:shadow-lg transition-all">
                  {match.lostItem.isConfidential && (
                    <div className="absolute top-6 right-6 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-100">
                      🔐 Protected
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-8">
                    <span className="px-4 py-1.5 bg-rose-500 text-white text-[10px] rounded-xl font-black tracking-widest uppercase shadow-md">
                      LOST
                    </span>
                    <h4 className="text-2xl text-[#1e293b] font-bold tracking-tight">{match.lostItem.itemName}</h4>
                  </div>
                  {match.lostItem.image && (
                    <div className="rounded-2xl overflow-hidden mb-6 shadow-xl aspect-video">
                      <img
                        src={match.lostItem.image}
                        alt={match.lostItem.itemName}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <p className="text-base text-slate-500 mb-8 leading-relaxed font-medium line-clamp-3">
                    {match.lostItem.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <p className="text-base text-[#1e293b] font-bold flex items-center gap-3">
                      <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                        <User size={18} />
                      </div>
                      {match.lostItem.userName}
                    </p>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                      {new Date(match.lostItem.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Found Item */}
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 relative group/item hover:bg-white hover:shadow-lg transition-all">
                  {match.foundItem.isConfidential && (
                    <div className="absolute top-6 right-6 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-100">
                      🔐 Protected
                    </div>
                  )}
                  <div className="flex items-center gap-4 mb-8">
                    <span className="px-4 py-1.5 bg-blue-500 text-white text-[10px] rounded-xl font-black tracking-widest uppercase shadow-md">
                      FOUND
                    </span>
                    <h4 className="text-2xl text-[#1e293b] font-bold tracking-tight">{match.foundItem.itemName}</h4>
                  </div>
                  {match.foundItem.image && (
                    <div className="rounded-2xl overflow-hidden mb-6 shadow-xl aspect-video">
                      <img
                        src={match.foundItem.image}
                        alt={match.foundItem.itemName}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <p className="text-base text-slate-500 mb-8 leading-relaxed font-medium line-clamp-3">
                    {match.foundItem.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <p className="text-base text-[#1e293b] font-bold flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                        <User size={18} />
                      </div>
                      {match.foundItem.userName}
                    </p>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">
                      {new Date(match.foundItem.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )})}
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