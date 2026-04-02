import React from "react";
import { Link } from "react-router-dom";
import "../../styles/contact-me-btn.css";

const ContactButton: React.FC = () => {
  return (
    <div className="floating-contact">
      <Link to="/contact" className="cta-button">
        <span className="cta-text">Contact Me</span>
        <span className="cta-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M7.5 15L12.5 10L7.5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="cta-shimmer"></span>
      </Link>
    </div>
  );
};

export default ContactButton;
