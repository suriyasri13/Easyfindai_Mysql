import { useEffect, useState } from 'react';
import { Package, Search, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'lost' | 'found' | 'match';
  title: string;
  message: string;
  date: string;
  isNew: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Generate sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'match',
        title: 'New Match Found!',
        message: 'A potential match has been found for your lost Laptop',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isNew: true,
      },
      {
        id: '2',
        type: 'found',
        title: 'Found Item Reported',
        message: 'Someone reported finding a Wallet in your area',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isNew: true,
      },
      {
        id: '3',
        type: 'lost',
        title: 'Lost Item Verified',
        message: 'Your lost item report for Keys has been verified',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isNew: false,
      },
      {
        id: '4',
        type: 'match',
        title: 'Match Update',
        message: 'The match confidence for your Phone has increased to 85%',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        isNew: false,
      },
    ];

    setNotifications(sampleNotifications);
  }, []);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'lost':
        return {
          bg: 'from-[#FCA5A5]/20 to-white border-[#FCA5A5]',
          icon: <Package className="text-[#DC2626]" size={24} />,
        };
      case 'found':
        return {
          bg: 'from-[#93C5FD]/20 to-white border-[#93C5FD]',
          icon: <Search className="text-[#2563EB]" size={24} />,
        };
      case 'match':
        return {
          bg: 'from-[#86EFAC]/20 to-white border-[#86EFAC]',
          icon: <CheckCircle className="text-[#16A34A]" size={24} />,
        };
      default:
        return {
          bg: 'from-gray-50 to-white border-gray-100',
          icon: <Package className="text-gray-600" size={24} />,
        };
    }
  };

  const formatDate = (dateString: string) => {
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
      <div className="mb-8">
        <h2 className="text-4xl text-[#1E2A44] font-bold">Notifications</h2>
        <p className="text-gray-600 mt-2 text-base">Stay updated with your items and matches</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-base">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const style = getNotificationStyle(notification.type);
            return (
              <div
                key={notification.id}
                className={`bg-gradient-to-r ${style.bg} rounded-xl shadow-md p-5 border-2 transition-all hover:shadow-lg ${
                  notification.isNew ? 'ring-2 ring-[#14B8A6]' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{style.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl text-[#1E2A44] mb-1 font-bold">
                        {notification.title}
                      </h3>
                      {notification.isNew && (
                        <span className="px-3 py-1 bg-[#14B8A6] text-white text-sm rounded-full font-semibold">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-base mb-2">{notification.message}</p>
                    <p className="text-gray-500 text-sm font-medium">{formatDate(notification.date)}</p>
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