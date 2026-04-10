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
      await registerUser({ fullName, email, password });
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
        <div className="bg-[#1E2A44] text-white p-8 rounded-t-2xl text-center">
          <h1 className="text-3xl mb-2">Lost & Found</h1>
          <p className="text-white/80 text-sm">
            Reuniting people with their belongings
          </p>
        </div>

        <div className="bg-white p-8 rounded-b-2xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label>Confirm Password</Label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button type="submit">Register</Button>
          </form>

          <p className="text-center mt-6 text-sm">
            Already registered? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}