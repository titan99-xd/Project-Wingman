import ContactForm from "../components/layout/ContactForm";
import Footer from "../components/layout/Footer";
import "../styles/contact.css";

export default function Contact() {
  return (
    <>
      <section className="page-section contact-page">
        <header className="contact-header">
          {/* <h1 className="highlight">Contact Us</h1> */}
        </header>

        <div className="contact-grid">
          <div className="contact-left">
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
