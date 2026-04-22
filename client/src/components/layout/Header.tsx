import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import sentryxLogo from '../../assets/sentryx_logo.png'
import '../../styles/header.css';

export default function Header({ isClinical }: { isClinical?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve user session data
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user");
    closeMobileMenu();
    navigate("/login");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  
  const isActive = (path: string) => location.pathname.toLowerCase() === path.toLowerCase()

  // If user is a nurse, clicking the logo keeps them in the clinical app
  const logoTarget = user?.role === 'nurse' ? '/Tablet' : '/';

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        
        {/* 1. LOGO SECTION */}
        <Link to={logoTarget} className="logo-link" onClick={closeMobileMenu}>
          <img src={sentryxLogo} alt="Sentryx Health" className="logo" />
        </Link>

        {/* 2. DESKTOP NAVIGATION */}
        <nav className="desktop-nav">
          
          {/* Home is hidden for nurses to keep them focused on clinical tools */}
          {user?.role !== 'nurse' && (
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <span className="nav-text">Home</span>
              <span className="nav-indicator"></span>
            </Link>
          )}

          {/* ADMIN ONLY TOOLS */}
          {user?.role === 'admin' && (
            <>
              {/* 🟢 NEW: Ward Oversight (The God View) */}
              <Link to="/Oversight" className={`nav-link ${isActive('/Oversight') ? 'active' : ''}`}>
                <span className="nav-text">Oversight</span>
                <span className="nav-indicator"></span>
              </Link>
              
              {/* 📝 Manager (Registry/Admissions) */}
              <Link to="/Manager" className={`nav-link ${isActive('/Manager') ? 'active' : ''}`}>
                <span className="nav-text">Manager</span>
                <span className="nav-indicator"></span>
              </Link>

              <Link to="/EmergencyHub" className={`nav-link ${isActive('/EmergencyHub') ? 'active' : ''}`}>
                <span className="nav-text">Emergency Hub</span>
                <span className="nav-indicator"></span>
              </Link>
              
              <Link to="/Security" className={`nav-link ${isActive('/Security') ? 'active' : ''}`}>
                <span className="nav-text">Security</span>
                <span className="nav-indicator"></span>
              </Link>
            </>
          )}

          {/* TABLET ACCESS (Visible to both Roles if logged in) */}
          {user && (
            <Link to="/Tablet" className={`nav-link ${isActive('/Tablet') ? 'active' : ''}`}>
              <span className="nav-text">{user.role === 'admin' ? 'Tablet' : 'My Tablet'}</span>
              <span className="nav-indicator"></span>
            </Link>
          )}
        </nav>

        {/* 3. RIGHT SECTION - User Profile & Logout */}
        <div className="header-cta-group">
          {user ? (
            <div className="user-profile-section">
              <span className="user-name-display">{user.name}</span>
              <button className="logout-nav-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-nav-link">Staff Login</Link>
          )}

          {/* MOBILE MENU BUTTON */}
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

      {/* MOBILE NAVIGATION OVERLAY */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Sentryx Menu</span>
            <button className="mobile-close-btn" onClick={closeMobileMenu}>✕</button>
          </div>
          
          <div className="mobile-nav-links">
            {user?.role !== 'nurse' && (
              <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>🏠 Home</Link>
            )}

            {user?.role === 'admin' && (
              <>
                <Link to="/Oversight" className="mobile-nav-link" onClick={closeMobileMenu}>🛰️ Oversight</Link>
                <Link to="/Manager" className="mobile-nav-link" onClick={closeMobileMenu}>📋 Manager</Link>
                <Link to="/EmergencyHub" className="mobile-nav-link" onClick={closeMobileMenu}>🚨 Emergency Hub</Link>
                <Link to="/Security" className="mobile-nav-link" onClick={closeMobileMenu}>🛡️ Security</Link>
              </>
            )}

            {user && (
              <Link to="/Tablet" className="mobile-nav-link" onClick={closeMobileMenu}>
                📱 {user.role === 'admin' ? 'Clinical Tablet' : 'My Tablet'}
              </Link>
            )}

            {user ? (
              <button className="mobile-logout-btn" onClick={handleLogout}>Logout ({user.name})</button>
            ) : (
              <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>Staff Login</Link>
            )}
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
    </header>
  )
}