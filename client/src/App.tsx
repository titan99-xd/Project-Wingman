import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Layout Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ContactButton from "./components/ui/contact-me-btn";

// Sentryx Pages
import Home from "./pages/Home";
import Manager from "./pages/Manager";  
import Tablet from "./pages/Tablet";     
import Security from "./pages/Security"; 
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import "./App.css";

function LayoutWrapper() {
  const location = useLocation();

  /**
   * THE GATEKEEPER LOGIC
   * This handles /Manager, /manager, and /ManAgEr automatically.
   */
  const isClinicalRoute = [
    "/manager", 
    "/tablet", 
    "/security"
  ].some(route => location.pathname.toLowerCase().startsWith(route));

  return (
    <div className="app-container">
      <ScrollToTop />
      <Header isClinical={isClinicalRoute} />

      {/* Show floating contact button only on public pages (Home/Contact) */}
      {!isClinicalRoute && <ContactButton />}

      <main className="app-main">
        <Routes>
          {/* Sentryx Clinical/Admin Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/Manager" element={<Manager />} />
          <Route path="/Tablet" element={<Tablet />} />
          <Route path="/Security" element={<Security />} />
          
          {/* Public/Legal Routes */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </main>

      {/* Hides the big footer on clinical pages 
         so nurses can see more patient data. 
      */}
      {!isClinicalRoute && <Footer />}
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