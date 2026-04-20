import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { registerUser } from "../services/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
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

    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await registerUser({ name: fullName, email, password });
      toast.success("Registration successful! Please login.");
      navigate("/");
    } catch (error: any) {
  console.log("Registration error:", error);
  toast.error(error.message || "Registration failed");
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#e0f2fe]">
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
            Identity Registration
          </p>
        </div>

        <div className="bg-white p-10 rounded-b-[2.5rem] shadow-2xl border border-slate-100">
          <div className="flex gap-4 mb-10 bg-slate-50 p-2 rounded-2xl">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-4 rounded-xl transition-all font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              Login
            </button>

            <button
              type="button"
              className="flex-1 py-4 rounded-xl transition-all font-black text-xs uppercase tracking-widest bg-white text-blue-600 shadow-sm"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[#1e293b] font-bold text-sm ml-1">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-rose-500 text-xs mt-2 font-bold ml-1">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1e293b] font-bold text-sm ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl"
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="text-rose-500 text-xs mt-2 font-bold ml-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1e293b] font-bold text-sm ml-1">Password</Label>
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
              {errors.password && (
                <p className="text-rose-500 text-xs mt-2 font-bold ml-1">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#1e293b] font-bold text-sm ml-1">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-blue-500/10 py-7 pr-14 text-base rounded-2xl"
                  placeholder="••••••••"
                />
                <div
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-300 hover:text-blue-600 p-2"
                >
                  {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-rose-500 text-xs mt-2 font-bold ml-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98] mt-4"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Already a member?{' '}
              <Link to="/" className="text-blue-600 font-bold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}