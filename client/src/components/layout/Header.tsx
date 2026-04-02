import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import sentryxLogo from '../../assets/sentryx_logo.png' // Make sure to rename your asset!
import '../../styles/header.css';

export default function Header() {
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
  const isActive = (path: string) => location.pathname === path

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo Section */}
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <img 
            src={sentryxLogo} 
            alt="Sentryx Health" 
            className="logo"
          />
        </Link>

        {/* Desktop Navigation - Centered via CSS */}
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

        {/* Header CTA - The Shimmer Button */}
        <div className="header-cta">
          <button className="cta-button" onClick={() => console.log("Emergency Hub Triggered")}>
            <span className="cta-text">Emergency Hub</span>
            <div className="cta-icon">→</div>
            <div className="cta-shimmer"></div>
          </button>
        </div>

        {/* Mobile Menu Button */}
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

      {/* Mobile Navigation Drawer */}
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
              <span className="mobile-link-text">Home Dashboard</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
            <Link to="/Manager" className={`mobile-nav-link ${isActive('/Manager') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <span className="mobile-link-icon">📋</span>
              <span className="mobile-link-text">Ward Manager</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
            <Link to="/Tablet" className={`mobile-nav-link ${isActive('/Tablet') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <span className="mobile-link-icon">📱</span>
              <span className="mobile-link-text">Nurse Tablet</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
            <Link to="/Security" className={`mobile-nav-link ${isActive('/Security') ? 'active' : ''}`} onClick={closeMobileMenu}>
              <span className="mobile-link-icon">🛡️</span>
              <span className="mobile-link-text">Security & Logs</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
          </div>

          <div className="mobile-nav-footer">
            <Link to="/Manager" className="mobile-cta-button" onClick={closeMobileMenu}>
              <span>System Status</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay - Triggers fade in/out via your CSS */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}
    </header>
  )
}