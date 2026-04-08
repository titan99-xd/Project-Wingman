import { Link } from 'react-router-dom'
import '../../styles/footer.css';
import facebook from '../../assets/Facebook_Logo_Primary.png';
import linkedIn from '../../assets/LI-In-Bug.png';
import instagram from '../../assets/Instagram_Glyph_Gradient.png';
import github from '../../assets/github-logo.png';

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" style={{ width: '100%', background: 'white', borderTop: '1px solid #eee' }}>
      <div className="footer-container" style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 2rem' }}>
        
        {/* Footer Main Content */}
        <div className="footer-main" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', padding: '4rem 0' }}>
          
          {/* Company Info */}
          <div className="footer-column footer-about">
            <span className="footer-logo-text" style={{ color: '#4169E1', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.5rem', display: 'block' }}>Social Media</span>
            <div className="footer-social" style={{ display: 'flex', gap: '1rem' }}>
              <a href="https://www.facebook.com/avvee18/" target="_blank" className="social-link"><img src={facebook} style={{ width: '24px' }} alt='fb' /></a>
              <a href="https://www.linkedin.com/in/avvee18/" target="_blank" className="social-link"><img src={linkedIn} style={{ width: '24px' }} alt='li' /></a>
              <a href="https://www.instagram.com/avveenav/" target="_blank" className="social-link"><img src={instagram} style={{ width: '24px' }} alt='ig' /></a>
              <a href="https://github.com/titan99-xd" target="_blank" className="social-link"><img src={github} style={{ width: '24px' }} alt='gh' /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading" style={{ color: '#4169E1', marginBottom: '1.5rem' }}>Quick Links</h3>
            <ul className="footer-links" style={{ listStyle: 'none', padding: 0 }}>
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/Manager" className="footer-link">Manager</Link></li>
              <li><Link to="/Tablet" className="footer-link">Tablet</Link></li>
              <li><Link to="/Security" className="footer-link">Security</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h3 className="footer-heading" style={{ color: '#4169E1', marginBottom: '1.5rem' }}>Contact Us</h3>
            <ul className="footer-contact" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem' }}>
                <a href="mailto:info@trinovatech.fi" className="contact-link">abhinavgautam3166@gmail.com</a>
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <a href="tel:+358407017910" className="contact-link">+358 417425877</a>
              </li>
              <li>Helsinki,Finland</li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom" style={{ borderTop: '1px solid #eee', padding: '2rem 0', display: 'flex', justifyContent: 'space-between' }}>
            <p>© {currentYear} All rights reserved.</p>
            <Link to="/privacy-policy" style={{ color: '#999', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </div>
    </footer>
  )
}