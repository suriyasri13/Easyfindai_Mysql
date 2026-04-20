import { useState } from "react";
import { Eye, EyeOff, Bell, Moon, Sun, LogOut, User, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";
import { changePassword, updateProfile } from "../services/api";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least 1 capital letter";
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return "Password must contain at least 1 special character";
    }
    return "";
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      await changePassword({
        userId: user?.id,
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error("Current password is incorrect");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email) {
      toast.error("Please fill in all profile fields");
      return;
    }

    try {
      const updatedUser = await updateProfile({
        userId: user?.id,
        fullName,
        email,
      });

      // Update session user locally (optional but useful)
      localStorage.setItem("easefind_user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="mb-10">
        <h2 className="text-4xl text-[#1e293b] font-bold tracking-tight">Settings</h2>
        <p className="text-slate-500 mt-2 text-lg font-medium">
          Manage your account preferences and security
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100">
        <h3 className="text-2xl mb-8 text-[#1e293b] font-bold flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
            <User size={24} />
          </div>
          Profile Information
        </h3>
        <form onSubmit={handleProfileUpdate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[#1e293b] font-bold text-base block">
                Full Name
              </Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[#1e293b] font-bold text-base block">
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 text-base font-bold transition-all shadow-xl shadow-blue-100 rounded-2xl"
          >
            Update Profile
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100">
        <h3 className="text-2xl mb-8 text-[#1e293b] font-bold flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
            <Shield size={24} />
          </div>
          Security & Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Password */}
            <div className="md:col-span-2 space-y-3">
              <Label className="text-[#1e293b] font-bold text-base block">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 pr-12 text-base rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-3">
              <Label className="text-[#1e293b] font-bold text-base block">
                New Password
              </Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 pr-12 text-base rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">
                Min 8 chars, 1 uppercase, 1 special character
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <Label className="text-[#1e293b] font-bold text-base block">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 pr-12 text-base rounded-2xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-7 text-base font-bold transition-all shadow-xl shadow-purple-100 rounded-2xl"
          >
            Change Password
          </Button>
        </form>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100">
        <h3 className="text-2xl mb-8 text-[#1e293b] font-bold">
          Account Actions
        </h3>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white border-2 border-rose-100 py-8 text-xl font-black transition-all rounded-2xl shadow-sm hover:shadow-xl"
        >
          <LogOut size={24} className="mr-3" />
          Logout from Session
        </Button>
      </div>
    </div>
  );
}