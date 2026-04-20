import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { forgotPassword } from '../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    if (!email.includes('@')) {
      return 'Email must contain "@"';
    }
    if (!email.endsWith('.com')) {
      return 'Email must end with ".com"';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      
      toast.success("Password reset token generated!");
      // Build link using the current port (works for both 5173 and 5174)
      const resetUrl = `${window.location.origin}/reset-password?token=${response.token}`;
      window.location.href = resetUrl;

    } catch (error: any) {
      setError(error.message || "Failed to send reset link. Please try again.");
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
            Account Recovery
          </p>
        </div>

        <div className="bg-white px-10 py-8 rounded-b-[2.5rem] shadow-2xl border border-slate-100 text-center">
          <p className="text-slate-500 mb-10 text-base font-medium leading-relaxed">
            Enter your registered email address and we'll send you an intelligence link to reset your credentials.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#1e293b] font-bold text-sm ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl"
                placeholder="name@example.com"
              />
              {error && (
                <p className="text-rose-500 text-xs mt-2 font-bold ml-1">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {loading ? "Processing..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50">
            <p className="text-sm text-slate-400 font-medium">
              Remember your password?{' '}
              <Link to="/" className="text-blue-600 font-bold hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
