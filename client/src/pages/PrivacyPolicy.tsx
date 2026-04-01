import Footer from '../components/layout/Footer';
import '../styles/PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <div className='privacy-page'>
      <section className='privacy-hero'>
        <div className='privacy-hero-background'>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
          <div className='grid-pattern'></div>
        </div>

        <div className='privacy-hero-container'>
          <h1 className='privacy-hero-title'>
            Privacy <span className='gradient-text'>Policy</span>
          </h1>
          <p className='privacy-last-updated'>Last updated: December 2025</p>
        </div>
      </section>

      <section className='privacy-content'>
        <div className='privacy-container'>
          <div className='privacy-intro'>
            <p>
              This Privacy Policy explains how I ("I", "me", "my website") collect, use, and protect your information when you visit my personal website{' '}
              <a href="https://trinovatech.fi" target="_blank" rel="noopener noreferrer">https://abhinavgautam.com.np</a>{' '} 
              or contact me through it.
            </p>
          </div>

          <div className='privacy-section'>
            <h2>1. Who I Am</h2>
            <ul className='info-list'>
              <li><strong>Name:</strong> Abhinav Gautam</li>
              <li><strong>Website:</strong> https://abhinavgautam.com.np</li>
              <li><strong>Email:</strong> <a href="mailto:abhinavgautam3166@gmail.com">abhinavgautam3166@gmail.com</a></li>
              <li><strong>Location:</strong> Helsinki, Finland</li>
            </ul>
            <p>This is my personal portfolio website where I share my work, skills, and projects.</p>
          </div>

          <div className='privacy-section'>
            <h2>2. Information I Collect</h2>
            <p>I only collect information necessary for communication or website performance:</p>
            <ul>
              <li>Contact form details such as your name, email, and message.</li>
              <li>Technical data such as IP address, device type, browser, and pages visited.</li>
              <li>Cookies used for basic functionality or anonymous analytics.</li>
            </ul>
            <p>No sensitive personal data is intentionally collected.</p>
          </div>

          <div className='privacy-section'>
            <h2>3. How I Use Your Information</h2>
            <p>Your information is used only for:</p>
            <ul>
              <li>Responding to your messages or inquiries.</li>
              <li>Improving website performance and content.</li>
              <li>Understanding visitor behaviour through analytics.</li>
              <li>Ensuring website security.</li>
            </ul>
            <p>I do not sell or use your data for advertising.</p>
          </div>

          <div className='privacy-section'>
            <h2>4. Legal Basis (GDPR)</h2>
            <p>Your data may be processed based on:</p>
            <ul>
              <li><strong>Consent:</strong> When you submit a contact form.</li>
              <li><strong>Legitimate interest:</strong> To operate, secure, and improve the website.</li>
            </ul>
          </div>

          <div className='privacy-section'>
            <h2>5. Data Retention</h2>
            <p>
              Messages sent through the contact form may be stored for up to 12 months unless continued communication requires longer. Analytics data may follow third-party retention cycles.
            </p>
          </div>

          <div className='privacy-section'>
            <h2>6. Data Sharing</h2>
            <p>I do not sell or rent your information. Data may only be shared with:</p>
            <ul>
              <li>Hosting providers and analytics tools.</li>
              <li>Authorities when legally required.</li>
            </ul>
            <p>All third-party services follow GDPR requirements.</p>
          </div>

          <div className='privacy-section'>
            <h2>7. Cookies</h2>
            <p>
              This website may use cookies for functionality, performance, and analytics. You can disable cookies through your browser settings.
            </p>
          </div>

          <div className='privacy-section'>
            <h2>8. Data Security</h2>
            <p>
              I take reasonable measures to protect your personal data, but no online service can guarantee complete security.
            </p>
          </div>

          <div className='privacy-section'>
            <h2>9. Your Rights (GDPR)</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to your personal data.</li>
              <li>Request corrections to inaccurate data.</li>
              <li>Request deletion of your data.</li>
              <li>Withdraw consent at any time.</li>
              <li>Request restriction or portability of your data.</li>
            </ul>
            <p>
              To exercise your rights, contact me at{' '}
              <a href="mailto:abhinavgautam3166@gmail.com">abhinavgautam3166@gmail.com</a>.
            </p>
          </div>

          <div className='privacy-section'>
            <h2>10. International Data Transfers</h2>
            <p>
              Some services (such as analytics or hosting) may process data outside the EU/EEA. When this occurs, appropriate safeguards such as Standard Contractual Clauses (SCCs) are applied.
            </p>
          </div>

          <div className='privacy-section'>
            <h2>11. Updates to This Policy</h2>
            <p>
              This Privacy Policy may be updated occasionally. Changes will be posted on this page with an updated date.
            </p>
          </div>

          <div className='privacy-section'>
            <h2>12. Contact</h2>
            <p>If you have questions about this Privacy Policy, contact me at:</p>
            <div className='contact-box'>
              <p><strong>Abhinav Gautam</strong></p>
              <p>Email: <a href="mailto:abhinavgautam3166@gmail.com">abhinavgautam3166@gmail.com</a></p>
              <p>Location: Helsinki, Finland</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}