import { Link } from 'react-router-dom'
import '../../styles/footer.css';
import facebook from '../../assets/Facebook_Logo_Primary.png';
import linkedIn from '../../assets/LI-In-Bug.png';
import instagram from '../../assets/Instagram_Glyph_Gradient.png';
import github from '../../assets/github-logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Main Content */}
        <div className="footer-main">
          {/* Company Info */}
          <div className="footer-column footer-about">
            <div className="footer-logo">
              <span className="footer-logo-text">Social Media</span>
            </div>
            <div className="footer-social">
              <a href="https://www.facebook.com/avvee18/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <img src={facebook} alt='facebook' />
              </a>
              
              <a href="https://www.linkedin.com/in/avvee18/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <img src={linkedIn} alt='LinkedIn' />
              </a>
              <a href="https://www.instagram.com/avveenav/" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <img src={instagram} alt='Instagram' />
              </a>
              <a href="https://github.com/titan99-xd" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">
                <img src={github} alt='Github' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/about" className="footer-link">About Me</Link></li>
              <li><Link to="/portfolio" className="footer-link">Portfolio</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Me</Link></li>
              
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h3 className="footer-heading">My Experience</h3>
            <ul className="footer-links">
              <li><a href="#services" className="footer-link">Web Development</a></li>
              <li><a href="#services" className="footer-link">Mobile Apps</a></li>
              <li><a href="#services" className="footer-link">UI/UX Design</a></li>
              <li><a href="#services" className="footer-link">IT Consulting</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h3 className="footer-heading">Contact Me</h3>
            <ul className="footer-contact">
              <li className="contact-item">
                <span className="contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <a href="mailto:info@trinovatech.fi" className="contact-link">
                  abhinavgautam3166@gmail.com
                </a>
              </li>
              <li className="contact-item">
                <span className="contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                </span>
                <a href="tel:+358407017910" className="contact-link">
                  +358 417425877
                </a>
              </li>
              <li className="contact-item">
                <span className="contact-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <div className="contact-link">
                   Helsinki Finland
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} All rights reserved.
            </p>
            <div className="footer-legal">
              <Link to="/privacy-policy" className="legal-link">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
