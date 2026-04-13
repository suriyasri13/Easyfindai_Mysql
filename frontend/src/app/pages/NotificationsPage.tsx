import { useEffect, useState } from 'react';
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
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type.toUpperCase()) {
      case 'GLOBAL':
        return {
          bg: 'from-blue-100 to-white border-blue-300',
          icon: <Globe className="text-blue-600" size={24} />,
          badge: 'Public Alert'
        };
      case 'CHAT':
        return {
          bg: 'from-[#6366F1]/20 to-white border-[#6366F1]',
          icon: <MessageCircle className="text-[#6366F1]" size={24} />,
          badge: 'New Message'
        };
      case 'FOUND':
        return {
          bg: 'from-[#93C5FD]/20 to-white border-[#93C5FD]',
          icon: <Search className="text-[#2563EB]" size={24} />,
          badge: 'Found Item'
        };
      case 'MATCH':
        return {
          bg: 'from-[#86EFAC]/20 to-white border-[#86EFAC]',
          icon: <CheckCircle className="text-[#16A34A]" size={24} />,
          badge: 'Match Found'
        };
      case 'LOST':
      default:
        return {
          bg: 'from-[#FCA5A5]/20 to-white border-[#FCA5A5]',
          icon: <Package className="text-[#DC2626]" size={24} />,
          badge: 'Lost Item'
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
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl text-[#1E2A44] font-bold">Notifications</h2>
          <p className="text-gray-600 mt-2 text-base">Stay updated with your items and matches</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold text-sm"
          >
            <XCircle size={18} />
            Clear All
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ALL', 'UNREAD', 'MATCHES', 'CHATS'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'bg-[#1E2A44] text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center animate-pulse text-gray-400">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-base">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
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
                className={`group relative bg-gradient-to-r ${style.bg} rounded-xl shadow-md p-5 border-2 transition-all hover:shadow-lg ${
                  isUnread ? 'ring-2 ring-[#3B82F6]' : ''
                }`}
              >
                {/* Individual Clear Button */}
                <button 
                  onClick={() => handleDelete(notification.id)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Remove notification"
                >
                  <Trash2 size={20} />
                </button>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{style.icon}</div>
                  <div className="flex-1 pr-8">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl text-[#1E2A44] mb-1 font-bold">
                        {notification.title}
                      </h3>
                      <div className="flex gap-2">
                        {style.badge && (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            notification.type === 'GLOBAL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {style.badge}
                          </span>
                        )}
                        {isUnread && (
                          <span className="px-3 py-1 bg-[#3B82F6] text-white text-[10px] rounded-full font-bold uppercase tracking-wider transition-all animate-pulse">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-base mb-2">{notification.message}</p>
                    <p className="text-gray-500 text-sm font-medium">{formatDate(notification.createdAt)}</p>
                    
                    {notification.actionUrl && (
                      <button
                        onClick={() => navigate(notification.actionUrl!)}
                        className="mt-3 flex items-center gap-1 text-sm font-bold text-[#1E2A44] hover:text-[#3B82F6] transition-colors"
                      >
                        {notification.actionText || 'View Details'} <ChevronRight size={16} />
                      </button>
                    )}
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