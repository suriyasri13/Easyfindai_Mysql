import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { loginUser } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    if (!email.includes('@')) {
      return 'Email must contain "@"';
    }
    if (!email.endsWith('.com')) {
      return 'Email must end with ".com"';
    }
    return '';
  };

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

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError || passwordError) {
    setErrors({ email: emailError, password: passwordError });
    return;
  }

  setErrors({});
  setLoading(true);

  try {
    const response = await loginUser({
      email,
      password,
    });

    login(
      {
        userId: response.userId,
        email: response.email,
        name: response.fullName,
        role: "USER",
      },
      response.token
    );

    toast.success("Login successful!");
    navigate("/dashboard");

  } catch (error: any) {
    setErrors({
      email: "Invalid email or password",
    });

    toast.error(error.message);
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

      <div className="w-full max-w-[400px] relative z-10 px-4">
        <div className="bg-[#1e293b] py-6 px-8 rounded-t-[2rem] text-center shadow-2xl border-b border-white/5">
          <h1 className="text-3xl font-black mb-1 tracking-tighter text-white">EaseFind.AI</h1>
          <p className="text-blue-200 text-[10px] font-bold uppercase tracking-[0.2em]">
            Intelligence Platform
          </p>
        </div>

        <div className="bg-white px-8 py-8 rounded-b-[2rem] shadow-2xl border border-slate-100">
          <div className="flex gap-4 mb-10 bg-slate-50 p-2 rounded-2xl">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${
                isLogin 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="flex-1 py-4 rounded-xl transition-all font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[#1e293b] font-bold text-sm ml-1">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-6 text-base rounded-xl"
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="text-rose-500 text-xs mt-2 font-bold ml-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" className="text-[#1e293b] font-bold text-sm">
                  Password
                </Label>
                <Link to="/forgot-password" size="sm" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
                  Forgot?
                </Link>
              </div>

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

              {errors.password && (
                <p className="text-rose-500 text-xs mt-2 font-bold ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-7 text-lg font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {loading ? "Processing..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}