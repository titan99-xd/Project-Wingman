import Footer from '../components/layout/Footer.tsx';
import '../styles/About.css';
// import ContactButton from '../components/ui/contact-me-btn.tsx'


export default function About() {
  return (
    <div className='about-page'>
      <section className='about-hero'>
        <div className='about-hero-background'>
          <div className='gradient-orb orb-1'></div>
          <div className='gradient-orb orb-2'></div>
          <div className='gradient-orb orb-3'></div>
          <div className='grid-pattern'></div>
        </div>
        
        <div className='about-hero-container'>
          <h1 className='about-hero-title'>
            From 
            <span className='gradient-text'> Gaming</span> to
            <span className='gradient-text'> Software</span>
          </h1>
          
          <p className='about-hero-subtitle'>
            Hi! I’m Abhinav Gautam, originally from Nepal, now exploring life and tech in Finland. I’m currently pursuing my Bachelor of Engineering in Information
             and Communication Technology at Metropolia University of Applied Sciences. <br />
            My journey into the world of tech started in a rather unexpected place—editing a GTA V FiveM server.
            What began as a fun experiment quickly turned into a passion for coding and programming.
            From there, I dove headfirst into web development, mobile apps, and software development,
            constantly exploring new ways to build and create. <br />I believe technology should be simple, accessible,
            and useful for everyone. That’s what drives me—I love turning complex ideas into solutions that people can actually use.
            Whether it’s developing a sleek website, a practical app, or a software tool, I’m all about making technology work for people.
            Outside of coding, I’m always learning, experimenting, and thinking about how to make digital experiences better and more inclusive.
          </p>
          <a href="mailto:abhinavgautam3166@gmail.com?subject=General Inquiry" className="about-btn">
              <span>Get in Touch</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>  
        </div>
      </section>

      <section className='why-choose-section'>
        <div className='why-choose-container'>
          <div className='why-choose-content'>
            {/* <div className='section-badge'>
              <span>Why Trinova</span>
            </div> */}
            
            <h2 className='section-title'>
              What I Bring to
              <span className='gradient-text'> the Table</span>
            </h2>

            <div className='reasons-list'>
              <div className='reason-item'>
                <div className='reason-number'>01</div>
                <div className='reason-content'>
                  <h4>I make tech simple</h4>
                  <p>Building apps and software everyone can use.</p>
                </div>
              </div>

              <div className='reason-item'>
                <div className='reason-number'>02</div>
                <div className='reason-content'>
                  <h4>Curious by nature</h4>
                  <p>Always experimenting, learning, and improving.</p>
                </div>
              </div>

              <div className='reason-item'>
                <div className='reason-number'>03</div>
                <div className='reason-content'>
                  <h4>Problem solver</h4>
                  <p>Turning tricky challenges into practical solutions.</p>
                </div>
              </div>

              <div className='reason-item'>
                <div className='reason-number'>04</div>
                <div className='reason-content'>
                  <h4>Passion-driven</h4>
                  <p>Coding isn’t just work—it’s what I love to do.</p>
                </div>
              </div>
            </div>
          </div>

          <div className='why-choose-visual'>
            <div className='tech-stack-card'>
              <h4>My Technology Stack</h4>
              <div className='tech-badges'>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' alt='React' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' alt='Node.js' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' alt='Python' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' alt='TypeScript' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' alt='Figma' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg' alt='Firebase' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg' alt='Swift' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' alt='Docker' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' alt='PostgreSQL' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' alt='MongoDB' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' alt='MySQL' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg' alt='Flutter' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg' alt='.NET' />
                </div>
                <div className='tech-badge'>
                  <img src='https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg' alt='Express' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

