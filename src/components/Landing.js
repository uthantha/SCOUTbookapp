import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import cricketHero from '../assests/heroImg.jpg';
import athlete1 from '../assests/athlete1.jpg';
import athlete2 from '../assests/athlete2.jpg';
import scout from '../assests/scout.jpg';

export default function Landing() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleProtectedClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
  };

  return (
    <section className="landing">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-nav-logo">
            <span className="landing-logo-icon">
              <span className="material-icons">sports_cricket</span>
            </span>
            <span className="landing-logo-text">ScoutBook</span>
          </div>
          
          <div className="landing-nav-links">
            <a href="#home" className="landing-nav-link">Home</a>
            <a href="#features" className="landing-nav-link" onClick={handleProtectedClick}>Players</a>
            <a href="#features" className="landing-nav-link" onClick={handleProtectedClick}>Opportunities</a>
            <a href="#features" className="landing-nav-link" onClick={handleProtectedClick}>Tournaments</a>
          </div>
          
          <div className="landing-nav-actions">
            <Link to="/login" className="landing-nav-btn login">Login</Link>
            <Link to="/signin" className="landing-nav-btn signup">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="landing-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="landing-modal" onClick={(e) => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            <div className="landing-modal-icon">🔒</div>
            <h3>Login Required</h3>
            <p>Please login or sign up to access this feature</p>
            <div className="landing-modal-actions">
              <Link to="/login" className="landing-modal-btn primary">Login</Link>
              <Link to="/signin" className="landing-modal-btn secondary">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
      {/* Hero Section with Background Image */}
      <div id="home" className="hero-background" style={{ backgroundImage: `url(${cricketHero})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <h1>ScoutBook — Elevating Sports Talent Discovery</h1>
          <p className="lead">
            Discover the next generation of athletes. Build your sports profile, 
            showcase skills, and connect directly with scouts and teams across Nepal.
          </p>

          <div className="cta-row">
            <Link to="/signin" className="btn hero-btn primary">Get Started</Link>
            <a href="#features" className="btn hero-btn ghost-white">Explore Features</a>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="container">
          <h2>How It Works</h2>
          <p className="section-desc">A platform built for athletes, scouts, and sports organizations.</p>

          <div className="grid-3">
            <div className="card">
              <div className="card-image-wrapper">
                <img src={athlete1} alt="Athlete profile" className="feature-img" />
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Create Profile</h3>
                <p>Showcase stats, achievements, and highlight videos to attract scouts and sponsors.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-image-wrapper">
                <img src={scout} alt="Scout searching talent" className="feature-img" />
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Get Discovered</h3>
                <p>Scouts and clubs find you via search filters, rankings, and personalized recommendations.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-image-wrapper">
                <img src={athlete2} alt="Athlete training" className="feature-img" />
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Apply for Trials</h3>
                <p>Access open trials, scholarships, and tournaments directly through the app.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-image-wrapper">
                <img src={scout} alt="Professional scouts" className="feature-img" />
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3>Professional Scouts</h3>
                <p>Get tutored by professionals and boost your skill to next level</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="features-section">
        <div className="features-header">
          <span className="features-tag">WHY SCOUTBOOK</span>
          <h2>EVERYTHING YOU NEED TO FIND TALENT</h2>
          <p className="section-desc">Powerful tools designed specifically for scouts and talent managers</p>
        </div>

        <div className="features-grid container">
          <div className="feature-card gradient-card-1">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🎯</div>
            </div>
            <h3>Advanced Search</h3>
            <p>Filter players by role, batting style, bowling style, height, and more to find exactly what you're looking for</p>
            <div className="card-glow"></div>
          </div>
          <div className="feature-card gradient-card-2">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">📹</div>
            </div>
            <h3>Video Profiles</h3>
            <p>Watch player highlights and performance videos to evaluate talent before reaching out</p>
            <div className="card-glow"></div>
          </div>
          <div className="feature-card gradient-card-3">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">📊</div>
            </div>
            <h3>Detailed Stats</h3>
            <p>Access comprehensive player statistics, achievements, and performance history</p>
            <div className="card-glow"></div>
          </div>
          <div className="feature-card gradient-card-4">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">💼</div>
            </div>
            <h3>Opportunity Management</h3>
            <p>Post trials, scholarships, and training programs. Track applications in one place</p>
            <div className="card-glow"></div>
          </div>
          <div className="feature-card gradient-card-5">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🏆</div>
            </div>
            <h3>Tournament Access</h3>
            <p>Discover upcoming tournaments and events to scout live talent</p>
            <div className="card-glow"></div>
          </div>
          <div className="feature-card gradient-card-6">
            <div className="feature-icon-wrapper">
              <div className="feature-icon">🤝</div>
            </div>
            <h3>Direct Communication</h3>
            <p>Message players directly and build relationships with potential recruits</p>
            <div className="card-glow"></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Active Players</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100+</div>
              <div className="stat-label">Professional Scouts</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50+</div>
              <div className="stat-label">Tournaments</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">1000+</div>
              <div className="stat-label">Connections Made</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Powerful Portals Section */}
      <div className="portals-section">
        <div className="container">
          <div className="portals-header">
            <h2>Two Powerful Portals</h2>
            <p className="section-desc">Tailored experiences for players and scouts</p>
          </div>

          <div className="portals-grid">
            {/* Player Portal */}
            <div className="portal-card player-portal">
              <div className="portal-badge">For Players</div>
              <h3>Showcase Your Talent</h3>
              <ul className="portal-features">
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Build comprehensive cricket profile</span>
                </li>
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Upload highlight videos</span>
                </li>
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Display achievements and stats</span>
                </li>
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Browse opportunities like trials</span>
                </li>
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Connect with professional scouts</span>
                </li>
              </ul>
              <Link to="/signin" className="portal-btn player-btn">Get Started as Player</Link>
            </div>

            {/* Scout Portal */}
            <div className="portal-card scout-portal">
              <div className="portal-badge scout-badge">For Scouts & Coaches</div>
              <h3>Discover Top Talent</h3>
              <ul className="portal-features">
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Advanced player search & filtering</span>
                </li>
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>View comprehensive profiles & videos</span>
                </li>
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Post trials and opportunities</span>
                </li>
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Manage recruitment pipeline</span>
                </li>
                <li>
                  <span className="feature-bullet">⚫</span>
                  <span>Direct messaging with athletes</span>
                </li>
              </ul>
              <Link to="/signin" className="portal-btn scout-btn">Get Started as Scout</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="cta-banner">
        <div className="container">
          <h2>Ready to be discovered?</h2>
          <p>Join ScoutBook today and take your sports career to the next level.</p>
          <div className="cta-row">
            <Link to="/signin" className="btn primary large">Join Now</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
