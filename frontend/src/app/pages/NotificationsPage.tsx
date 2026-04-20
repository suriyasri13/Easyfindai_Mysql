import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, Search, CheckCircle, MessageCircle, Globe, Trash2, XCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getNotifications, 
  getGlobalNotifications, 
  markNotificationAsRead, 
  deleteNotification,
  clearAllNotifications,
  Notification 
} from '../services/api';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const { refreshUnreadCount } = useOutletContext<{ refreshUnreadCount: () => void }>();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      // Fetch both Private and Global notifications
      const [privateData, globalData] = await Promise.all([
        getNotifications(user.userId),
        getGlobalNotifications()
      ]);

      // Merge and sort by date descending
      const combined = [...privateData, ...globalData].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(combined);
      setLoading(false);
      
      // Auto-mark private notifications as read
      const unreadPrivateIds = privateData.filter(n => !n.isRead).map(n => n.id);
      if (unreadPrivateIds.length > 0) {
        await Promise.all(unreadPrivateIds.map(id => markNotificationAsRead(id)));
        refreshUnreadCount();
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshUnreadCount();
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    if (!user || notifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;

    try {
      await clearAllNotifications(user.userId);
      setNotifications([]);
      refreshUnreadCount();
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type.toUpperCase()) {
      case 'GLOBAL':
        return {
          bg: 'from-blue-600/10 to-transparent border-blue-500/20',
          icon: <div className="p-3 bg-blue-500/20 rounded-xl"><Globe className="text-blue-400" size={24} /></div>,
          badge: 'Public Alert',
          accent: 'text-blue-400'
        };
      case 'CHAT':
        return {
          bg: 'from-indigo-600/10 to-transparent border-indigo-500/20',
          icon: <div className="p-3 bg-indigo-500/20 rounded-xl"><MessageCircle className="text-indigo-400" size={24} /></div>,
          badge: 'New Message',
          accent: 'text-indigo-400'
        };
      case 'FOUND':
        return {
          bg: 'from-sky-600/10 to-transparent border-sky-500/20',
          icon: <div className="p-3 bg-sky-500/20 rounded-xl"><Search className="text-sky-400" size={24} /></div>,
          badge: 'Found Item',
          accent: 'text-sky-400'
        };
      case 'MATCH':
        return {
          bg: 'from-emerald-600/10 to-transparent border-emerald-500/20',
          icon: <div className="p-3 bg-emerald-500/20 rounded-xl"><CheckCircle className="text-emerald-400" size={24} /></div>,
          badge: 'Match Found',
          accent: 'text-emerald-400'
        };
      case 'LOST':
      default:
        return {
          bg: 'from-rose-600/10 to-transparent border-rose-500/20',
          icon: <div className="p-3 bg-rose-500/20 rounded-xl"><Package className="text-rose-400" size={24} /></div>,
          badge: 'Lost Item',
          accent: 'text-rose-400'
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl text-[#1e293b] font-bold tracking-tight">Notifications</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Stay updated with your items and matches</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="flex items-center gap-3 px-8 py-4 bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 rounded-[1.5rem] transition-all font-bold text-sm shadow-sm"
          >
            <Trash2 size={20} />
            Clear All
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {['ALL', 'UNREAD', 'MATCHES', 'CHATS'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 rounded-[1.5rem] font-bold text-sm transition-all whitespace-nowrap shadow-sm border ${
              activeTab === tab 
                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100 scale-105' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl p-20 text-center animate-pulse border border-slate-100">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-400 text-lg font-bold uppercase tracking-widest">Synchronizing Intelligence...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl p-24 text-center border border-slate-100">
          <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} className="text-slate-300" />
          </div>
          <p className="text-[#1e293b] text-3xl font-bold mb-3 tracking-tight">You're all caught up!</p>
          <p className="text-slate-500 text-lg font-medium">No new notifications detected by our AI sensors.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {notifications.filter(n => {
            if (activeTab === 'ALL') return true;
            if (activeTab === 'UNREAD') return !n.isRead;
            if (activeTab === 'MATCHES') return n.type === 'MATCH';
            if (activeTab === 'CHATS') return n.type === 'CHAT';
            return true;
          }).map((notification) => {
            const style = getNotificationStyle(notification.type);
            const isUnread = !notification.isRead && notification.recipientId !== 0;
            
            return (
              <div
                key={notification.id}
                className={`group relative bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                  isUnread ? 'border-l-8 border-l-blue-500' : ''
                }`}
              >
                {/* Individual Clear Button */}
                <button 
                  onClick={() => handleDelete(notification.id)}
                  className="absolute top-8 right-8 p-4 text-slate-300 hover:text-white hover:bg-rose-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title="Remove notification"
                >
                  <Trash2 size={22} />
                </button>

                <div className="flex items-start gap-10">
                  <div className="flex-shrink-0">
                    <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                      {style.icon}
                    </div>
                  </div>
                  <div className="flex-1 pr-16">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-2xl text-[#1e293b] font-bold tracking-tight leading-tight">
                        {notification.title}
                      </h3>
                      <div className="flex gap-4">
                        {style.badge && (
                          <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                            notification.type === 'GLOBAL' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 border border-slate-100'
                          }`}>
                            {style.badge}
                          </span>
                        )}
                        {isUnread && (
                          <span className="px-5 py-2 bg-blue-500 text-white text-[10px] rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-100">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed font-medium">{notification.message}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                      <p className="text-slate-400 text-xs font-black tracking-widest uppercase">{formatDate(notification.createdAt)}</p>
                      
                      {notification.actionUrl && (
                        <button
                          onClick={() => navigate(notification.actionUrl!)}
                          className={`flex items-center gap-3 text-sm font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-all group/btn`}
                        >
                          {notification.actionText || 'Explore Details'} 
                          <ChevronRight size={20} className="transform group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}