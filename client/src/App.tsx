import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Layout
import Header from "./components/layout/Header";
import ScrollToTop from "./components/ScrollToTop";
import ContactButton from "./components/ui/contact-me-btn";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import "./styles/app.css";

function LayoutWrapper() {
  const location = useLocation();

  // Detect admin route (for hiding ContactButton only)
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ScrollToTop />

      {/* Header is always shown */}
      <Header />

      {/* Contact button is hidden on admin routes */}
      {!isAdminRoute && <ContactButton />}

      <main className="app-main">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper />
    </BrowserRouter>
  );
}