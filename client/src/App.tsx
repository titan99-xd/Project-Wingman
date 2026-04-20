import React from "react"; 
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ContactButton from "./components/ui/contact-me-btn";

//  Authentication & Security Pages
import Login from "./pages/login";
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  
  if (!user) {
    // replace prop ensures they can't click "back" to the locked page
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>; 
};

function LayoutWrapper() {
  const location = useLocation();

  /**
   * THE CLINICAL GATEKEEPER LOGIC
   * We treat everything that isn't the Home/Public pages as "App Routes".
   * This hides the public footer and adapts the header.
   */
  const appRoutes = [
    "/login",
    "/gatekeeper",
    "/manager", 
    "/tablet", 
    "/security",
    "/emergencyhub"
  ];

  const isAppRoute = appRoutes.some(route => 
    location.pathname.toLowerCase().startsWith(route.toLowerCase())
  );

  return (
    <div className="app-container">
      <ScrollToTop />
      
      {/* Header adapts if we are in the "App" part of the site */}
      <Header isClinical={isAppRoute} />

      {/* Show floating contact button only on public marketing pages */}
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
          {/* We use the ProtectedRoute wrapper so users are forced to Login first */}
          <Route 
            path="/manager" 
            element={<ProtectedRoute><Manager /></ProtectedRoute>} 
          />
          <Route 
            path="/tablet" 
            element={<ProtectedRoute><Tablet /></ProtectedRoute>} 
          />
          <Route 
            path="/security" 
            element={<ProtectedRoute><Security /></ProtectedRoute>} 
          />
          <Route 
            path="/emergencyhub" 
            element={<ProtectedRoute><EmergencyHub /></ProtectedRoute>} 
          />
        </Routes>
      </main>

      {/* Hides the large marketing footer on all App/Clinical pages */}
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