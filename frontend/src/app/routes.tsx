import { createBrowserRouter } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardLayout from "./pages/DashboardLayout";
import ReportItemPage from "./pages/ReportItemPage";
import LostItemsPage from "./pages/LostItemsPage";
import FoundItemsPage from "./pages/FoundItemsPage";
import MatchResultsPage from "./pages/MatchResultsPage";
import NotificationsPage from "./pages/NotificationsPage";
import HelpPage from "./pages/HelpPage";
import ContactUsPage from "./pages/ContactUsPage";
import SettingsPage from "./pages/SettingsPage";
import DashboardHome from "./pages/DashboardHome";
import GISMap from "./pages/GISMap";

import ResetPasswordPage from "./pages/ResetPasswordPage";

import ProtectedRoute from "./components/ProtectedRoute"; // ✅ correct path

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />, // ✅ FIX
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "report-item", element: <ReportItemPage /> },
      { path: "lost-items", element: <LostItemsPage /> },
      { path: "found-items", element: <FoundItemsPage /> },
      { path: "match-results", element: <MatchResultsPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "help", element: <HelpPage /> },
      { path: "contact", element: <ContactUsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "gis-map", element: <GISMap /> },
    ],
  },
]);