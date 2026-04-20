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

      {/* Floating Lines Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="absolute w-full h-full opacity-[0.05] animate-wave" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,20 Q25,10 50,20 T100,20" fill="none" stroke="#2563eb" strokeWidth="0.1" />
          <path d="M0,50 Q25,40 50,50 T100,50" fill="none" stroke="#2563eb" strokeWidth="0.1" />
          <path d="M0,80 Q25,70 50,80 T100,80" fill="none" stroke="#2563eb" strokeWidth="0.1" />
        </svg>
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
