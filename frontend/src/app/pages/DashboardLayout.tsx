import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { 
  LayoutDashboard, 
  HelpCircle, 
  Phone, 
  Settings, 
  Bell, 
  MessageSquare,
  Menu,
  X
} from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { 
  getUnreadNotificationCount, 
  getGlobalNotifications, 
  getNotifications, 
  markNotificationAsRead 
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import AIChatPanel from '../components/AIChatPanel';

export default function DashboardLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevCountRef = useRef(0);
  const lastGlobalIdRef = useRef<number>(0);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // 1. Initial fetch for unread count
    fetchInitialUnreadCount();

    // 2. Initialize WebSocket STOMP client
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket successfully');

        // Subscribe to private (user-specific) notifications
        stompClient.subscribe(`/topic/user_${user.userId}`, (message) => {
          const notification = JSON.parse(message.body);
          setUnreadCount((prev) => prev + 1);
          
          toast(notification.title, {
            description: notification.message,
            action: notification.actionUrl ? {
              label: notification.actionText || 'View',
              onClick: () => navigate(notification.actionUrl)
            } : undefined
          });
        });

        // Subscribe to global broadcasts
        stompClient.subscribe('/topic/global', (message) => {
          const notification = JSON.parse(message.body);
          
          toast.success(notification.title, {
            description: notification.message,
            style: {
              background: '#3182ce',
              color: '#ffffff',
              border: '1px solid #2b6cb0'
            },
            action: notification.actionUrl ? {
              label: notification.actionText || 'View',
              onClick: () => navigate(notification.actionUrl)
            } : undefined
          });
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket Error: ' + frame.headers['message']);
      }
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [user, navigate]);

  const fetchInitialUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await getUnreadNotificationCount(user.userId);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch initial notification count:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation Bar */}
      <nav className="bg-[#1E2A44] text-white shadow-lg sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-semibold">EaseFind.AI</h1>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/dashboard/report-item"
              className="hover:bg-white/20 hover:scale-105 active:scale-95 px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium"
            >
              Report Item
            </Link>
            <Link
              to="/dashboard/lost-items"
              className="hover:bg-white/20 hover:scale-105 active:scale-95 px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium"
            >
              Lost Items
            </Link>
            <Link
              to="/dashboard/found-items"
              className="hover:bg-white/20 hover:scale-105 active:scale-95 px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium"
            >
              Found Items
            </Link>
            <Link
              to="/dashboard/match-results"
              className="hover:bg-white/20 hover:scale-105 active:scale-95 px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium"
            >
              Match Results
            </Link>
            <Link 
              to="/dashboard/gis-map"
              className="hover:bg-white/20 hover:scale-105 active:scale-95 px-4 py-2 rounded-lg transition-all duration-200 text-base font-medium"
            >
              GIS Map
            </Link>
            <Link
              to="/dashboard/notifications"
              className="hover:bg-white/20 hover:scale-110 active:scale-90 p-2 rounded-lg transition-all duration-200 relative"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold px-1 ring-2 ring-[#1E2A44]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="hover:bg-white/10 p-2 rounded-lg transition-colors text-white"
            >
              <MessageSquare size={22} />
            </button>

          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen bg-white shadow-lg z-30 transition-transform
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            w-64 pt-20 lg:pt-4
          `}
        >
          <nav className="p-4 space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium group ${
                isActive('/dashboard')
                  ? 'bg-[#1E2A44] text-white shadow-md'
                  : 'hover:bg-blue-50 hover:text-[#1E2A44] hover:translate-x-1 text-gray-700'
              }`}
            >
              <LayoutDashboard size={22} className={`transition-colors ${isActive('/dashboard') ? 'text-white' : 'text-blue-600 group-hover:text-[#1E2A44]'}`} />
              <span className="font-semibold">Dashboard</span>
            </Link>
            <Link
              to="/dashboard/help"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium group ${
                isActive('/dashboard/help')
                  ? 'bg-[#1E2A44] text-white shadow-md'
                  : 'hover:bg-orange-50 hover:text-orange-700 hover:translate-x-1 text-gray-700'
              }`}
            >
              <HelpCircle size={22} className={`transition-colors ${isActive('/dashboard/help') ? 'text-white' : 'text-orange-600 group-hover:text-orange-700'}`} />
              <span className="font-semibold">Help</span>
            </Link>
            <Link
              to="/dashboard/contact"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium group ${
                isActive('/dashboard/contact')
                  ? 'bg-[#1E2A44] text-white shadow-md'
                  : 'hover:bg-green-50 hover:text-green-700 hover:translate-x-1 text-gray-700'
              }`}
            >
              <Phone size={22} className={`transition-colors ${isActive('/dashboard/contact') ? 'text-white' : 'text-green-600 group-hover:text-green-700'}`} />
              <span className="font-semibold">Contact Us</span>
            </Link>
            <Link
              to="/dashboard/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium group ${
                isActive('/dashboard/settings')
                  ? 'bg-[#1E2A44] text-white shadow-md'
                  : 'hover:bg-purple-50 hover:text-purple-700 hover:translate-x-1 text-gray-700'
              }`}
            >
              <Settings size={22} className={`transition-colors ${isActive('/dashboard/settings') ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'}`} />
              <span className="font-semibold">Settings</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}