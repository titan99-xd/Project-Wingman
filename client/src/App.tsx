import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer"; // Added this
import ScrollToTop from "./components/ScrollToTop";
import ContactButton from "./components/ui/contact-me-btn";

// Sentryx Pages
import Home from "./pages/Home";
import Manager from "./pages/Manager";  
import Tablet from "./pages/Tablet";     
import Security from "./pages/Security"; 
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import "./styles/app.css";

function LayoutWrapper() {
  const location = useLocation();

  // Hide the floating contact button on clinical/admin pages to keep the UI clean
  const isClinicalRoute = 
    location.pathname.startsWith("/Manager") || 
    location.pathname.startsWith("/Tablet") ||
    location.pathname.startsWith("/Security");

  return (
    <div className="app-container">
      <ScrollToTop />

      <Header />

      {/* Show floating contact button only on public Home/Contact/Privacy pages */}
      {!isClinicalRoute && <ContactButton />}

      <main className="app-main">
        <Routes>
          {/* Sentryx Clinical Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/Manager" element={<Manager />} />
          <Route path="/Tablet" element={<Tablet />} />
          <Route path="/Security" element={<Security />} />
          
          {/* Public/Legal Routes */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </main>

      <Footer /> {/* Added this back to the bottom */}
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