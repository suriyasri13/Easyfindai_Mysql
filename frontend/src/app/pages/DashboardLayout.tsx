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
import bgImage from '../../assets/background.png';
import Prism from '../components/ui/Prism';

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

    fetchInitialUnreadCount();

    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/user_${user.userId}`, (message) => {
          const notification = JSON.parse(message.body);
          setUnreadCount((prev) => prev + 1);
          
          toast.message(notification.title, {
            description: notification.message,
            style: {
              background: '#0f172a',
              color: '#FFFFFF',
              border: '1px solid #3B82F6'
            },
            action: notification.actionUrl ? {
              label: notification.actionText || 'View',
              onClick: () => navigate(notification.actionUrl)
            } : undefined
          });
        });

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
    <div className="min-h-screen relative text-white overflow-x-hidden bg-slate-950">
      
      {/* Universal Premium Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-110 animate-slow-zoom"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] z-10"></div>
        <div className="absolute inset-0 z-0 opacity-25">
           <Prism
            animationType="rotate"
            timeScale={0.3}
            height={4.5}
            baseWidth={6.5}
            scale={4.0}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
          />
        </div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-xl h-[72px] shadow-sm border-b border-white/10">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-full px-8 relative z-10">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="text-2xl font-black tracking-tighter text-white">EaseFind<span className="text-blue-500">.AI</span></span>
          </div>

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
                className={`text-[13px] font-black uppercase tracking-widest transition-all duration-200 ${
                  isActive(link.to) 
                    ? "text-blue-400" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/')} className="text-white/70 hover:text-white transition-all" title="Home">
              <Home size={22} />
            </button>

            <Link to="/dashboard/notifications" className="relative text-white/70 hover:text-white transition-all" title="Notifications">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-900"></span>
              )}
            </Link>

            <button onClick={() => setIsChatOpen(!isChatOpen)} className="text-white/70 hover:text-white transition-all" title="AI Chat">
              <MessageSquare size={22} />
            </button>
            
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex relative z-10">
        {/* Glassmorphic Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[72px] left-0 h-[calc(100vh-72px)] bg-white/5 backdrop-blur-3xl z-30 transition-all duration-300 border-r border-white/5
            ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-64'}
          `}
        >
          <nav className="p-6 space-y-4">
            {[
              { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
              { to: "/dashboard/help", label: "Help", icon: HelpCircle, color: "text-orange-400" },
              { to: "/dashboard/contact", label: "Contact Us", icon: Phone, color: "text-green-400" },
              { to: "/dashboard/settings", label: "Settings", icon: Settings, color: "text-purple-400" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 font-black uppercase tracking-widest text-[10px] ${
                  isActive(item.to)
                    ? "bg-white/10 text-white border border-white/10 shadow-xl"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon size={20} className={`${item.color}`} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 lg:p-12 min-h-[calc(100vh-72px)] bg-slate-950/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <Outlet context={contextValue} />
          </div>
        </main>
      </div>

      <AIChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}