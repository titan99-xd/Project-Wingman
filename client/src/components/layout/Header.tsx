import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import sentryxLogo from '../../assets/sentryx_logo.png'
import '../../styles/header.css';

// The isClinical prop now only controls the Emergency Hub button
export default function Header({ isClinical }: { isClinical?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  
  const isActive = (path: string) => location.pathname.toLowerCase() === path.toLowerCase()

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        
        {/* 1. LOGO SECTION (Left) */}
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <img 
            src={sentryxLogo} 
            alt="Sentryx Health" 
            className="logo"
          />
        </Link>

        {/* 2. DESKTOP NAVIGATION (Center - Hidden on Mobile via CSS) */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <span className="nav-text">Home</span>
            <span className="nav-indicator"></span>
          </Link>
          <Link to="/Manager" className={`nav-link ${isActive('/Manager') ? 'active' : ''}`}>
            <span className="nav-text">Manager</span>
            <span className="nav-indicator"></span>
          </Link>
          <Link to="/Tablet" className={`nav-link ${isActive('/Tablet') ? 'active' : ''}`}>
            <span className="nav-text">Tablet</span>
            <span className="nav-indicator"></span>
          </Link>
          <Link to="/Security" className={`nav-link ${isActive('/Security') ? 'active' : ''}`}>
            <span className="nav-text">Security</span>
            <span className="nav-indicator"></span>
          </Link>
        </nav>

        {/* 3. RIGHT SECTION (Emergency Hub + Mobile Hamburger) */}
        <div className="header-cta-group">
          {/* Emergency Hub hides on Clinical pages, but the Hamburger stays! */}
          {!isClinical && (
            <div className="header-cta">
              <button className="cta-button" onClick={() => console.log("Emergency Hub Triggered")}>
                <span className="cta-text">Emergency Hub</span>
                <div className="cta-icon">→</div>
              </button>
            </div>
          )}

          {/* MOBILE MENU BUTTON - Now outside any conditional checks */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </button>
        </div>
      </div>

      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Sentryx Menu</span>
            <button className="mobile-close-btn" onClick={closeMobileMenu}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          
          <div className="mobile-nav-links">
            <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <span className="mobile-link-icon">🏠</span>
              <span className="mobile-link-text">Home</span>
            </Link>
            <Link to="/Manager" className={`mobile-nav-link ${isActive('/Manager') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <span className="mobile-link-icon">📋</span>
              <span className="mobile-link-text">Ward Manager</span>
            </Link>
            <Link to="/Tablet" className={`mobile-nav-link ${isActive('/Tablet') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <span className="mobile-link-icon">📱</span>
              <span className="mobile-link-text">Nurse Tablet</span>
            </Link>
            <Link to="/Security" className={`mobile-nav-link ${isActive('/Security') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <span className="mobile-link-icon">🛡️</span>
              <span className="mobile-link-text">Security & Logs</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay for Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </header>
  )
}