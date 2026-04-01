import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import trinovaLogo from '../../assets/trinova_logo.png'
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo-link" onClick={closeMobileMenu}>
          <img 
            src={trinovaLogo} 
            alt="Trinova Technology" 
            className="logo"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <span className="nav-text">Home</span>
            <span className="nav-indicator"></span>
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
          >
            <span className="nav-text">About</span>
            <span className="nav-indicator"></span>
          </Link>
          <Link 
            to="/portfolio" 
            className={`nav-link ${isActive('/portfolio') ? 'active' : ''}`}
          >
            <span className="nav-text">Project</span>
            <span className="nav-indicator"></span>
          </Link>
           <Link 
            to="/blog" 
            className={`nav-link ${isActive('/blog') ? 'active' : ''}`}
          >
            <span className="nav-text">Blog</span>
            <span className="nav-indicator"></span>
          </Link>
          <Link 
            to="/contact" 
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
          >
            <span className="nav-text">Contact Me</span>
            <span className="nav-indicator"></span>
          </Link>
        </nav>
        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className="menu-line"></span>
          <span className="menu-line"></span>
          <span className="menu-line"></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Menu</span>
            <button 
              className="mobile-close-btn"
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          
          <div className="mobile-nav-links">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">🏠</span>
              <span className="mobile-link-text">Home</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
            <Link 
              to="/about" 
              className={`mobile-nav-link ${isActive('/about') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">ℹ️</span>
              <span className="mobile-link-text">About</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
            <Link 
              to="/portfolio" 
              className={`mobile-nav-link ${isActive('/portfolio') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">📁</span>
              <span className="mobile-link-text">Project</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
            <Link 
              to="/blog" 
              className={`mobile-nav-link ${isActive('/blog') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">📝</span>
              <span className="mobile-link-text">Blog</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
            <Link 
              to="/contact" 
              className={`mobile-nav-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span className="mobile-link-icon">💼</span>
              <span className="mobile-link-text">Contact Me</span>
              <span className="mobile-link-arrow">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={closeMobileMenu}
        ></div>
      )}
    </header>
  )
}