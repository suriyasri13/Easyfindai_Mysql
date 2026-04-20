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
  Search,
  X,
  LogOut,
  Home
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
  const { user, logout } = useAuth();
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
          
          toast.message(notification.title, {
            description: notification.message,
            style: {
              background: '#1E2A44',
              color: '#FFFFFF',
              border: '1px solid #3B82F6'
            },
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
              background: '#3B82F6',
              color: '#ffffff',
              border: '2px solid #FFFFFF'
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

  const contextValue = { unreadCount, refreshUnreadCount: fetchInitialUnreadCount };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen relative text-slate-900 overflow-x-hidden bg-[#f8fafc]">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[5%] right-[-5%] w-[700px] h-[700px] bg-indigo-400/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
        </div>
      </div>
      {/* Top Navigation Bar - Exactly as in screenshot */}
      <nav className="sticky top-0 z-40 bg-[#1e293b]/95 backdrop-blur-xl h-[72px] shadow-sm border-b border-white/5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-full px-8">
          {/* Left: Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="text-2xl font-bold tracking-tight text-white">EaseFind.AI</span>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            {[
              { to: "/dashboard/report-item", label: "Report Item" },
              { to: "/dashboard/lost-items", label: "Lost Items" },
              { to: "/dashboard/found-items", label: "Found Items" },
              { to: "/dashboard/match-results", label: "Match Results" },
              { to: "/dashboard/gis-map", label: "GIS Map" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[15px] transition-all duration-200 ${
                  isActive(link.to) 
                    ? "text-white font-bold" 
                    : "text-slate-300 hover:text-white font-medium"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="text-white/90 hover:text-white transition-all"
              title="Home"
            >
              <Home size={24} />
            </button>

            <Link
              to="/dashboard/notifications"
              className="relative text-white/90 hover:text-white transition-all"
              title="Notifications"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1e293b]"></span>
              )}
            </Link>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="text-white/90 hover:text-white transition-all"
              title="AI Chat"
            >
              <MessageSquare size={24} />
            </button>
            
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar - Light Theme as in image */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white/70 backdrop-blur-xl z-30 transition-all duration-300 border-r border-slate-200/50
            ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-64'}
          `}
        >
          <nav className="p-6 space-y-3">
            {[
              { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-500" },
              { to: "/dashboard/help", label: "Help", icon: HelpCircle, color: "text-orange-500" },
              { to: "/dashboard/contact", label: "Contact Us", icon: Phone, color: "text-green-500" },
              { to: "/dashboard/settings", label: "Settings", icon: Settings, color: "text-purple-500" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                  isActive(item.to)
                    ? "bg-slate-100 text-[#1e293b] shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#1e293b]"
                }`}
              >
                <item.icon size={22} className={`${item.color}`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content - Light Theme */}
        <main className="flex-1 p-8 lg:p-12 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <Outlet context={contextValue} />
          </div>
        </main>
      </div>

      {/* AI Chat Panel */}
      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}