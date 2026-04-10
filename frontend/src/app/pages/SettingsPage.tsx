import { useState } from "react";
import { Eye, EyeOff, Bell, Moon, Sun, LogOut } from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-4xl text-[#1E2A44] font-bold">Settings</h2>
        <p className="text-gray-600 mt-2 text-base">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl mb-4 text-[#1E2A44] font-bold">
          Profile Information
        </h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <Label className="text-gray-700 font-semibold text-base">
              Full Name
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-base"
            />
          </div>

          <div>
            <Label className="text-gray-700 font-semibold text-base">
              Email
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-base"
            />
          </div>

          <Button
            type="submit"
            className="bg-[#14B8A6] hover:bg-[#0F9B8E] text-white py-3 text-base font-semibold"
          >
            Update Profile
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl mb-4 text-[#1E2A44] font-bold">
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current Password */}
          <div>
            <Label className="text-gray-700 font-semibold text-base">
              Current Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10 border-2 border-gray-200 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-base"
              />
              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <Label className="text-gray-700 font-semibold text-base">
              New Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pr-10 border-2 border-gray-200 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-base"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">
              Min 8 chars, 1 capital letter, 1 special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <Label className="text-gray-700 font-semibold text-base">
              Confirm New Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) =>
                  setConfirmNewPassword(e.target.value)
                }
                className="pr-10 border-2 border-gray-200 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-base"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-[#14B8A6] hover:bg-[#0F9B8E] text-white py-3 text-base font-semibold"
          >
            Change Password
          </Button>
        </form>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl mb-4 text-[#1E2A44] font-bold">
          Account Actions
        </h3>
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-base font-semibold"
        >
          <LogOut size={20} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}