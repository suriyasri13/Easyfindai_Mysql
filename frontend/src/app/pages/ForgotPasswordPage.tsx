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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="bg-[#1E2A44] text-white p-8 rounded-t-2xl text-center">
          <h1 className="text-4xl font-bold mb-2">EaseFind.AI</h1>
          <p className="text-white/90 text-base font-medium">
            Reset Your Password
          </p>
        </div>

        <div className="bg-white p-8 rounded-b-2xl shadow-xl">
          <p className="text-gray-600 mb-6 text-center text-sm">
            Enter the email address associated with your account, and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold text-base">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6]"
                placeholder="you@example.com"
              />
              {error && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E2A44] hover:bg-[#2D3E5F] text-white py-6 text-base font-semibold"
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center mt-6 text-base text-gray-600">
            Remember your password?{' '}
            <Link to="/" className="text-[#1E2A44] font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
