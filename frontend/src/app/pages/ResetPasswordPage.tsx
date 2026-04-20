import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { resetPassword } from '../services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      navigate('/');
    }
  }, [token, navigate]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least 1 capital letter';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least 1 special character';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!token) return;

    setError('');
    setLoading(true);

    try {
      await resetPassword(token, password);
      
      toast.success("Password reset successfully! You can now login.");
      navigate("/");

    } catch (error: any) {
      setError(error.message || "Failed to reset password. Token may have expired.");
      toast.error(error.message || "Something went wrong.");
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
            <radialGradient id="pulse" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Animated Scanning Line */}
          <rect width="100%" height="2" fill="#2563eb" className="animate-scan opacity-20" />
          
          {/* Floating Nodes */}
          <circle cx="20%" cy="30%" r="3" fill="#2563eb" className="animate-pulse" />
          <circle cx="80%" cy="20%" r="2" fill="#2563eb" className="animate-pulse delay-700" />
          <circle cx="40%" cy="70%" r="4" fill="#2563eb" className="animate-pulse delay-1000" />
          <circle cx="70%" cy="80%" r="3" fill="#2563eb" className="animate-pulse delay-300" />
          <circle cx="10%" cy="90%" r="2" fill="#2563eb" className="animate-pulse delay-500" />
        </svg>

        {/* Radar Pulse Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[url(#pulse)] opacity-10 animate-ping"></div>
      </div>

      <div className="w-full max-w-md relative z-10 px-6 py-12">
        <div className="bg-[#1e293b] py-8 px-10 rounded-t-[2.5rem] text-center shadow-2xl">
          <h1 className="text-4xl font-black mb-2 tracking-tighter text-white">EaseFind.AI</h1>
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">
            Security Protocol
          </p>
        </div>

        <div className="bg-white px-10 py-8 rounded-b-[2.5rem] shadow-2xl border border-slate-100">
          <p className="text-slate-500 mb-10 text-center text-base font-medium leading-relaxed">
            Please enter your new high-security password below to regain access to your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="password" title="At least 8 characters, 1 uppercase, 1 special char" className="text-[#1e293b] font-bold text-sm ml-1">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-7 pr-14 text-base rounded-2xl"
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
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-xs mt-2 font-bold ml-1">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {loading ? "Resetting..." : "Update Password"}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <Link to="/" className="text-blue-600 font-bold hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
