import React from "react"; 
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ContactButton from "./components/ui/contact-me-btn";

// Authentication & Security Pages
import Login from "./pages/login"; // Keeping your specific file casing
import Gatekeeper from "./pages/Gatekeeper";

// Sentryx Clinical/Admin Pages
import Home from "./pages/Home";
import Manager from "./pages/Manager";  
import Tablet from "./pages/Tablet";     
import Security from "./pages/Security"; 
import EmergencyHub from "./pages/EmergencyHub"; 
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import "./App.css";

/**
 * 🔒 SMART PROTECTED ROUTE
 * Handles: 1. Identity (Login), 2. Authorization (Role), 3. Physical Presence (Geofence)
 */
const ProtectedRoute = ({ 
  children, 
  allowRole 
}: { 
  children: React.ReactNode; 
  allowRole?: "admin" | "nurse" 
}) => {
  const location = useLocation();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  
  // 1. Check Identity: Not logged in? Go to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Authorization: If route is Admin-only (Manager/Security) and user is a Nurse
  if (allowRole === "admin" && user.role !== "admin") {
    return <Navigate to="/gatekeeper" replace />;
  }

  // 3. Check Geofence: If Nurse tries to access Tablet without passing Check-In
  const isTabletRoute = location.pathname.toLowerCase() === "/tablet";
  if (user.role === "nurse" && isTabletRoute && !user.isCheckIn) {
    return <Navigate to="/gatekeeper" replace />;
  }
  
  return <>{children}</>; 
};

function LayoutWrapper() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  /**
   * UI ADAPTATION LOGIC
   */
  // 1. Hide Header entirely on security-sensitive entry pages
  const isGatekeeperOrLogin = path === "/gatekeeper" || path === "/login";

  // 2. Identify all "App" routes to hide the public marketing footer
  const appRoutes = ["/login", "/gatekeeper", "/manager", "/tablet", "/security", "/emergencyhub"];
  const isAppRoute = appRoutes.some(route => path.startsWith(route));

  return (
    <div className="app-container">
      <ScrollToTop />
      
      {/* 🔴 Header is now REMOVED from Gatekeeper and Login for extra security */}
      {!isGatekeeperOrLogin && <Header isClinical={isAppRoute} />}

      {!isAppRoute && <ContactButton />}

      <main className="app-main">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          {/* --- AUTHENTICATION FLOW --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/gatekeeper" element={<Gatekeeper />} />
          
          {/* --- PROTECTED CLINICAL ROUTES --- */}
          
          {/* Manager: Admin Only */}
          <Route 
            path="/manager" 
            element={<ProtectedRoute allowRole="admin"><Manager /></ProtectedRoute>} 
          />

          {/* Security: Admin Only */}
          <Route 
            path="/security" 
            element={<ProtectedRoute allowRole="admin"><Security /></ProtectedRoute>} 
          />

          {/* Emergency Hub: Admin Only (as per your request to move from Home) */}
          <Route 
            path="/emergencyhub" 
            element={<ProtectedRoute allowRole="admin"><EmergencyHub /></ProtectedRoute>} 
          />

          {/* Tablet: Accessible by both, but Nurses are forced through Geofence */}
          <Route 
            path="/tablet" 
            element={<ProtectedRoute><Tablet /></ProtectedRoute>} 
          />
        </Routes>
      </main>

      {!isAppRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper />
    </BrowserRouter>
  );
}