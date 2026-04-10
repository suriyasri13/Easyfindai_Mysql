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
      password: "Invalid email or password",
    });

    toast.error(error.message);
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
            Reuniting people with their belongings
          </p>
        </div>

        <div className="bg-white p-8 rounded-b-2xl shadow-xl">
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-md transition-all font-semibold text-base ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="flex-1 py-3 rounded-md transition-all font-semibold text-base text-gray-600 hover:text-gray-900"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold text-base">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6]"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
  <div className="flex items-center justify-between">
    <Label htmlFor="password" className="text-gray-700 font-semibold text-base">
      Password
    </Label>
    <Link to="/forgot-password" className="text-sm font-semibold text-[#14B8A6] hover:text-[#0D9488]">
      Forgot password?
    </Link>
  </div>

  <div className="relative mt-1.5">
    <Input
      id="password"
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="pr-10 border-2 border-gray-200 focus:border-[#14B8A6]"
      placeholder="••••••••"
    />

    {/* ICON ONLY - no button */}
    <div
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </div>
  </div>

  {errors.password && (
    <p className="text-red-500 text-sm mt-1.5 font-medium">
      {errors.password}
    </p>
  )}
</div>

            <Button
              type="submit"
              className="w-full bg-[#1E2A44] hover:bg-[#2D3E5F] text-white py-6 text-base font-semibold"
            >
              Sign in
            </Button>
          </form>

          <p className="text-center mt-6 text-base text-gray-600">
            New here?{' '}
            <Link to="/register" className="text-[#1E2A44] font-semibold">
              Register first to continue.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}