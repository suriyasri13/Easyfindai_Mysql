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
      {/* Top Accent Line */}
      <div className="fixed top-0 left-0 w-full h-2 bg-blue-600 z-[60]"></div>

      {/* Floating Lines Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="absolute w-full h-full opacity-[0.05] animate-wave" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,20 Q25,10 50,20 T100,20" fill="none" stroke="#2563eb" strokeWidth="0.1" />
          <path d="M0,50 Q25,40 50,50 T100,50" fill="none" stroke="#2563eb" strokeWidth="0.1" />
          <path d="M0,80 Q25,70 50,80 T100,80" fill="none" stroke="#2563eb" strokeWidth="0.1" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10 px-6 py-12">
        <div className="bg-[#1e293b] p-10 rounded-t-[2.5rem] text-center shadow-2xl">
          <h1 className="text-4xl font-black mb-2 tracking-tighter text-white">EaseFind.AI</h1>
          <p className="text-blue-200 text-sm font-bold uppercase tracking-widest">
            Account Recovery
          </p>
        </div>

        <div className="bg-white p-10 rounded-b-[2.5rem] shadow-2xl border border-slate-100 text-center">
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
