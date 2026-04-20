import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing security token.');
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Password updated successfully! Please sign in.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f8fafc]">

      {/* AI Search & Connect Animation Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#f8fafc]">
        {/* Animated Blobs for depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>


        {/* The Neural Grid */}
        <svg className="absolute w-full h-full opacity-[0.1]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2563eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Floating Nodes */}
          <circle cx="20%" cy="30%" r="3" fill="#2563eb" className="animate-pulse" />
          <circle cx="80%" cy="20%" r="2" fill="#2563eb" className="animate-pulse delay-700" />
          <circle cx="40%" cy="70%" r="4" fill="#2563eb" className="animate-pulse delay-1000" />
          <circle cx="70%" cy="80%" r="3" fill="#2563eb" className="animate-pulse delay-300" />
          <circle cx="10%" cy="90%" r="2" fill="#2563eb" className="animate-pulse delay-500" />
        </svg>
      </div>

      <div className="w-full max-w-[400px] relative z-10 px-4 py-8">
        <div className="bg-[#1e293b] py-6 px-8 rounded-t-[2rem] text-center shadow-2xl border-b border-white/5">
          <h1 className="text-3xl font-black mb-1 tracking-tighter text-white">EaseFind.AI</h1>
          <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em]">
            Security Protocol
          </p>
        </div>

        <div className="bg-white px-8 py-8 rounded-b-[2rem] shadow-2xl border border-slate-100">
          <p className="text-slate-500 mb-10 text-center text-base font-medium leading-relaxed">
            Please enter your new high-security password below to regain access to your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-[#1e293b] font-bold text-sm ml-1">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-6 pr-14 text-base rounded-xl"
                  placeholder="••••••••"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-300 hover:text-blue-600 p-2"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-[#1e293b] font-bold text-sm ml-1">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-6 text-base rounded-xl"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-xs mt-2 font-bold ml-1 text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-7 text-lg font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {loading ? "Resetting..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
