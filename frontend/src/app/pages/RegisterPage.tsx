import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { registerUser } from "../services/api";
import bgImage from '../assets/background.png';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateEmail = (email: string) => {
    if (!email.includes("@")) return 'Email must contain "@"';
    if (!email.endsWith(".com")) return 'Email must end with ".com"';
    return "";
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least 1 capital letter";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) return "Password must contain at least 1 special character";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await registerUser({ name: fullName, email, password });
      toast.success("Registration successful! Please login.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
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

      <div className="w-full max-w-[450px] relative z-10 px-4 py-8">
        {/* Glassmorphic Register Card */}
        <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
          
          <div className="py-8 px-8 text-center border-b border-white/5">
            <h1 className="text-3xl font-black mb-1 tracking-tighter text-white">Join EaseFind.AI</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Create your intelligence profile
            </p>
          </div>

          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-slate-300 font-bold text-[10px] uppercase tracking-widest ml-1">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500/10 py-6 text-white text-base rounded-xl placeholder:text-slate-600 transition-all"
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-rose-500 text-[10px] mt-1 font-bold ml-1">{errors.fullName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 font-bold text-[10px] uppercase tracking-widest ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500/10 py-6 text-white text-base rounded-xl placeholder:text-slate-600 transition-all"
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-rose-500 text-[10px] mt-1 font-bold ml-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-300 font-bold text-[10px] uppercase tracking-widest ml-1">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500/10 py-6 pr-12 text-white text-base rounded-xl placeholder:text-slate-600 transition-all"
                      placeholder="••••••••"
                    />
                    <div onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-blue-400 p-2">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-slate-300 font-bold text-[10px] uppercase tracking-widest ml-1">Confirm</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 border-white/10 focus:border-blue-500 focus:ring-blue-500/10 py-6 pr-12 text-white text-base rounded-xl placeholder:text-slate-600 transition-all"
                      placeholder="••••••••"
                    />
                    <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-blue-400 p-2">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                </div>
              </div>
              
              {(errors.password || errors.confirmPassword) && (
                <p className="text-rose-500 text-[10px] font-bold ml-1">{errors.password || errors.confirmPassword}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-7 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-blue-900/20 transition-all active:scale-[0.98] mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Intelligence Profile"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Already registered?{' '}
                <Link to="/" className="text-blue-400 font-black hover:text-blue-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}