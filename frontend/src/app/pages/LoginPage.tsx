import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { loginUser } from "../services/api";
import bgImage from '../assets/background.png';

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* Immersive Background Image with Dark Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110 animate-slow-zoom"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="w-full max-w-[420px] relative z-10 px-4">
        {/* Glassmorphic Login Card */}
        <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
          
          <div className="py-10 px-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 rotate-3 group">
              <Sparkles className="text-white group-hover:scale-125 transition-transform" size={32} />
            </div>
            <h1 className="text-3xl font-black mb-2 tracking-tighter text-white">Welcome back</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              Securely access your intelligence dashboard
            </p>
          </div>

          <div className="px-8 pb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-bold text-xs uppercase tracking-widest ml-1">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-white text-base rounded-2xl placeholder:text-slate-600 transition-all"
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-500 text-[10px] mt-1 font-black uppercase tracking-widest ml-1 animate-pulse">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="password" className="text-slate-300 font-bold text-xs uppercase tracking-widest ml-1">
                    Password
                  </Label>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500/10 py-7 pr-14 text-white text-base rounded-2xl placeholder:text-slate-600 transition-all"
                    placeholder="••••••••"
                  />

                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-blue-400 p-2 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>

                {errors.password && (
                  <p className="text-rose-500 text-[10px] mt-1 font-black uppercase tracking-widest ml-1 animate-pulse">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 accent-blue-600" />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" size="sm" className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-8 text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-blue-900/20 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? (
                   <Loader2 className="animate-spin" size={24} />
                ) : (
                  "Sign in to Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-400 font-black hover:text-blue-300 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center mt-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
          Powered by EaseFind Intelligence
        </p>
      </div>
    </div>
  );
}