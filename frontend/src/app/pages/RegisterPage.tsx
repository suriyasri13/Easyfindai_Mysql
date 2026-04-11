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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-slate-100">
      <div className="w-full max-w-md">
        {/* Header - Matching LoginPage */}
        <div className="bg-[#1E2A44] text-white p-8 rounded-t-2xl text-center">
          <h1 className="text-4xl font-bold mb-2">EaseFind.AI</h1>
          <p className="text-white/90 text-base font-medium">
            Reuniting people with their belongings
          </p>
        </div>

        <div className="bg-white p-8 rounded-b-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="fullName" className="text-gray-700 font-semibold text-base">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6]"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.fullName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold text-base">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6]"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field with Toggle */}
            <div>
              <Label htmlFor="password" className="text-gray-700 font-semibold text-base">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 border-2 border-gray-200 focus:border-[#14B8A6]"
                  placeholder="••••••••"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field with Toggle */}
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold text-base">Confirm Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10 border-2 border-gray-200 focus:border-[#14B8A6]"
                  placeholder="••••••••"
                />
                <div
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1E2A44] hover:bg-[#2D3E5F] text-white py-6 text-base font-semibold mt-4"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center mt-6 text-sm">
            Already registered? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}