import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router';
import { Package, Search, CheckCircle, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardHome() {

  const { user } = useAuth();

  const [statsData, setStatsData] = useState({
    lost: 0,
    found: 0,
    matches: 0,
    successRate: 0
  });

  useEffect(() => {

    axios.get("http://localhost:8080/api/dashboard/stats")
      .then(res => {
        setStatsData(res.data);
      })
      .catch(err => console.error(err));

  }, []);

  const stats = [
    { label: 'Total Lost Items', value: statsData.lost, icon: Package, color: 'bg-[#FCA5A5]/20 text-[#DC2626]' },
    { label: 'Total Found Items', value: statsData.found, icon: Search, color: 'bg-[#93C5FD]/20 text-[#2563EB]' },
    { label: 'Matches Found', value: statsData.matches, icon: CheckCircle, color: 'bg-[#86EFAC]/20 text-[#16A34A]' },
    { label: 'Success Rate', value: statsData.successRate + "%", icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
  ];

  const quickActions = [
    { label: 'Report Lost Item', path: '/dashboard/report-item', color: 'bg-[#FCA5A5] hover:bg-[#FCA5A5]/90' },
    { label: 'Report Found Item', path: '/dashboard/report-item', color: 'bg-[#93C5FD] hover:bg-[#93C5FD]/90' },
    { label: 'View Matches', path: '/dashboard/match-results', color: 'bg-[#86EFAC] hover:bg-[#86EFAC]/90' },
  ];

  return (
    <div className="space-y-8">

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#1E2A44] to-[#2D3E5F] text-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl mb-2">Welcome back, {user?.fullName}!</h2>
        <p className="text-white/80">
          Track your lost and found items, view matches, and reconnect with your belongings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-gray-600 text-sm">{stat.label}</p>
            <p className="text-3xl mt-1 text-[#1E2A44]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl mb-4 text-[#1E2A44]">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className={`${action.color} text-gray-800 p-6 rounded-xl shadow-md transition-all hover:scale-105 hover:shadow-lg`}
            >
              <p className="text-lg font-medium">{action.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl mb-4 text-[#1E2A44]">Recent Activity</h3>

        <div className="space-y-3">

          <div className="flex items-center gap-4 p-3 bg-[#86EFAC]/20 rounded-lg border border-[#86EFAC]/30">
            <CheckCircle className="text-[#16A34A]" size={20} />
            <div>
              <p className="text-sm text-gray-800">New match found for "Laptop"</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-[#93C5FD]/20 rounded-lg border border-[#93C5FD]/30">
            <Search className="text-[#2563EB]" size={20} />
            <div>
              <p className="text-sm text-gray-800">Found item "Wallet" reported</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-[#FCA5A5]/20 rounded-lg border border-[#FCA5A5]/30">
            <Package className="text-[#DC2626]" size={20} />
            <div>
              <p className="text-sm text-gray-800">Lost item "Keys" reported</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}