import { useMemo, useState } from 'react';
import type { PageKey } from '../types';

export default function LandingPage({
  onNavigate,
  isLoggedIn,
}: {
  onNavigate: (page: PageKey) => void;
  isLoggedIn: boolean;
}) {
  // Interactive Impact Score Calculator State
  const [subscribers, setSubscribers] = useState(3500000); // 0 to 5M
  const [complaintVelocity, setComplaintVelocity] = useState(420); // 0 to 1000 complaints/hr
  const [revenueCr, setRevenueCr] = useState(1.4); // 0 to 3 Cr/hr
  const [durationHours, setDurationHours] = useState(3.5); // 0 to 8 hrs

  // Dynamic Impact Score Calculation
  const calculation = useMemo(() => {
    // Sub-scores normalized 0 to 100
    const reachScore = Math.min(100, Math.round((subscribers / 5000000) * 100));
    const complaintScore = Math.min(100, Math.round((complaintVelocity / 1000) * 100));
    const revenueScore = Math.min(100, Math.round((revenueCr / 3.0) * 100));
    const durationScore = Math.min(100, Math.round((durationHours / 8.0) * 100));

    // Weighted composite score (35% reach, 30% complaints, 20% revenue, 15% duration)
    const compositeScore = Number(
      (reachScore * 0.35 + complaintScore * 0.3 + revenueScore * 0.2 + durationScore * 0.15).toFixed(1)
    );

    let priority: 'P1' | 'P2' | 'P3' | 'P4' = 'P4';
    let priorityLabel = 'Low Priority';
    let severityClass = 'severity-low';

    if (compositeScore >= 85) {
      priority = 'P1';
      priorityLabel = 'Critical Business Impact';
      severityClass = 'severity-critical';
    } else if (compositeScore >= 65) {
      priority = 'P2';
      priorityLabel = 'High Priority Incident';
      severityClass = 'severity-high';
    } else if (compositeScore >= 45) {
      priority = 'P3';
      priorityLabel = 'Medium Priority';
      severityClass = 'severity-medium';
    }

    return {
      reachScore,
      complaintScore,
      revenueScore,
      durationScore,
      compositeScore,
      priority,
      priorityLabel,
      severityClass,
    };
  }, [subscribers, complaintVelocity, revenueCr, durationHours]);

  return (
    <div className="landing-root">
      {/* Top Navbar */}
      <header className="landing-nav">
        <div className="landing-nav-brand">
          <div className="brand-mark">OQ</div>
          <div>
            <div className="brand-title">OutageIQ</div>
            <div className="brand-subtitle">The NOC Squad</div>
          </div>
        </div>

        <nav className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#scoring-engine">Impact Calculator</a>
          <a href="#workflow">Workflow</a>
          <a href="#noc-squad">The NOC Squad</a>
        </nav>

        <div className="landing-nav-actions">
          {isLoggedIn ? (
            <button className="primary-button" onClick={() => onNavigate('overview')}>
              Open Dashboard →
            </button>
          ) : (
            <>
              <button className="ghost-button" onClick={() => onNavigate('login')}>
                Sign In
              </button>
              <button className="primary-button" onClick={() => onNavigate('overview')}>
                Launch Command Center
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <span className="pulse-dot"></span> Real-Time Telecom & Network Outage Prioritization
        </div>
        <h1 className="landing-hero-title">
          Prioritize Network Outages by <span className="gradient-text">Real Business Impact</span>, Not Just Severity Codes.
        </h1>
        <p className="landing-hero-subtitle">
          OutageIQ unifies outage alerts, customer complaint velocity, and regional subscriber metrics into an explainable <strong>0 to 100 Impact Score</strong> so NOC teams resolve highest-impact incidents first.
        </p>

        <div className="landing-hero-cta">
          <button className="primary-button hero-btn" onClick={() => onNavigate(isLoggedIn ? 'overview' : 'login')}>
            {isLoggedIn ? 'Go to Command Center' : 'Access Live Dashboard'}
          </button>
          <a href="#scoring-engine" className="ghost-button hero-btn">
            Try Impact Calculator ↓
          </a>
        </div>

        {/* Live Hero Incident Simulation Preview */}
        <div className="landing-hero-card">
          <div className="hero-card-header">
            <div className="hero-card-title">
              <span className="severity-chip severity-critical">P1 CRITICAL</span>
              <strong>OUT-2026-0806-MUM-91</strong>
              <small>Mumbai • Node MUM-COR-19</small>
            </div>
            <div className="hero-card-score">
              <span className="score-label">Impact Score</span>
              <strong className="score-value">94.2</strong>
            </div>
          </div>
          <div className="hero-card-metrics">
            <div>
              <span>Subscriber Reach</span>
              <strong>4.2M (96%)</strong>
            </div>
            <div>
              <span>Complaint Velocity</span>
              <strong>486/hr (95%)</strong>
            </div>
            <div>
              <span>Revenue Exposure</span>
              <strong>₹1.8 Cr/hr (92%)</strong>
            </div>
            <div>
              <span>Active Duration</span>
              <strong>4h 12m (94%)</strong>
            </div>
          </div>
          <div className="meter">
            <span style={{ width: '94.2%' }}></span>
          </div>
        </div>
      </section>

      {/* Metrics Counter Section */}
      <section className="landing-metrics">
        <div className="metric-box">
          <strong>4.2M+</strong>
          <span>Subscribers Covered</span>
        </div>
        <div className="metric-box">
          <strong>₹8.76 Cr</strong>
          <span>Revenue at Risk Managed</span>
        </div>
        <div className="metric-box">
          <strong>3h 42m</strong>
          <span>Avg Incident Resolution Time</span>
        </div>
        <div className="metric-box">
          <strong>84%</strong>
          <span>SLA Compliance Rate</span>
        </div>
      </section>

      {/* Interactive Impact Score Engine Demonstrator */}
      <section id="scoring-engine" className="landing-section">
        <div className="section-title-block">
          <span className="section-badge">PRD Scoring Engine</span>
          <h2>Interactive Impact Score Calculator</h2>
          <p>
            Experience how OutageIQ transforms multi-stream signals into a transparent, explainable 0 to 100 score. Move the parameters below:
          </p>
        </div>

        <div className="calculator-grid">
          <div className="calculator-controls panel">
            <h3>Adjust Incident Parameters</h3>

            <div className="slider-group">
              <div className="slider-header">
                <label>Subscriber Reach</label>
                <strong>{(subscribers / 1000000).toFixed(2)}M subs</strong>
              </div>
              <input
                type="range"
                min="100000"
                max="5000000"
                step="100000"
                value={subscribers}
                onChange={(e) => setSubscribers(Number(e.target.value))}
              />
              <small>Weight: 35% • Reach Sub-Score: {calculation.reachScore}/100</small>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Complaint Velocity</label>
                <strong>{complaintVelocity} complaints/hr</strong>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={complaintVelocity}
                onChange={(e) => setComplaintVelocity(Number(e.target.value))}
              />
              <small>Weight: 30% • Complaint Sub-Score: {calculation.complaintScore}/100</small>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Revenue Exposure</label>
                <strong>₹{revenueCr.toFixed(2)} Cr/hr</strong>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={revenueCr}
                onChange={(e) => setRevenueCr(Number(e.target.value))}
              />
              <small>Weight: 20% • Revenue Sub-Score: {calculation.revenueScore}/100</small>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <label>Outage Duration</label>
                <strong>{durationHours.toFixed(1)} hours</strong>
              </div>
              <input
                type="range"
                min="0.2"
                max="8.0"
                step="0.2"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
              />
              <small>Weight: 15% • Duration Sub-Score: {calculation.durationScore}/100</small>
            </div>
          </div>

          <div className="calculator-result panel">
            <div className="result-badge-row">
              <span className={`severity-chip ${calculation.severityClass}`}>
                {calculation.priority} • {calculation.priorityLabel}
              </span>
              <small>PRD Formula v1.0</small>
            </div>

            <div className="computed-score-display">
              <div className="big-score">{calculation.compositeScore}</div>
              <div className="score-out-of">/ 100 Impact Score</div>
            </div>

            <div className="meter calc-meter">
              <span style={{ width: `${calculation.compositeScore}%` }}></span>
            </div>

            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span>Reach (35%)</span>
                <strong>{(calculation.reachScore * 0.35).toFixed(1)} pts</strong>
              </div>
              <div className="breakdown-item">
                <span>Complaints (30%)</span>
                <strong>{(calculation.complaintScore * 0.3).toFixed(1)} pts</strong>
              </div>
              <div className="breakdown-item">
                <span>Revenue (20%)</span>
                <strong>{(calculation.revenueScore * 0.2).toFixed(1)} pts</strong>
              </div>
              <div className="breakdown-item">
                <span>Duration (15%)</span>
                <strong>{(calculation.durationScore * 0.15).toFixed(1)} pts</strong>
              </div>
            </div>

            <p className="calculator-note">
              This score directly controls the rank of the incident in the NOC Squad queue, ensuring high-exposure core issues bypass lower-impact local tickets.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="landing-section">
        <div className="section-title-block">
          <span className="section-badge">Core Capabilities</span>
          <h2>Engineered for Modern NOC Operations</h2>
          <p>Everything your engineering and regional ops leaders need to manage network incidents efficiently.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📡</div>
            <h3>Unified Multi-Stream Ingestion</h3>
            <p>
              Merges outage alerts, complaint logs, and regional subscriber snapshots into one working dataset per outage event.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Intelligent Complaint Matching</h3>
            <p>
              Automatically attributes unlinked customer complaint tickets to active outages using geographic node proximity algorithms.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Explainable Impact Score</h3>
            <p>
              Replaces subjective severity codes with a mathematically rigorous 0–100 score based on subscriber reach, velocity, and revenue.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚨</div>
            <h3>Automated Priority Tiers</h3>
            <p>
              Instant classification into P1, P2, P3, and P4 tiers with confidence flags when input data streams are incomplete.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Regional Impact Heatmaps</h3>
            <p>
              Filter and analyze incident pressure across key regions including Mumbai, Delhi NCR, Bangalore, Chennai, and Hyderabad.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Executive Exporting</h3>
            <p>
              Generate top-outage executive summaries and exportable CSV/PDF snapshots ready for leadership briefings.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture & Workflow Section */}
      <section id="workflow" className="landing-section">
        <div className="section-title-block">
          <span className="section-badge">Architecture & Pipeline</span>
          <h2>The NOC Squad Workflow</h2>
          <p>How raw streams transform into actionable priority queues</p>
        </div>

        <div className="workflow-steps">
          <div className="step-card">
            <div className="step-number">01</div>
            <h4>Ingest Data Streams</h4>
            <p>Pull raw outage alerts, complaint tickets, and regional usage snapshots.</p>
          </div>
          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h4>Validate & Deduplicate</h4>
            <p>Enforce schema integrity, detect encoding, and eliminate duplicate records.</p>
          </div>
          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h4>Match & Merge</h4>
            <p>Link orphan complaints to closest outage node and merge into single-row outage state.</p>
          </div>
          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">04</div>
            <h4>Score & Rank</h4>
            <p>Calculate normalized sub-scores, compute 0–100 Impact Score, and assign priority tier.</p>
          </div>
          <div className="step-arrow">→</div>

          <div className="step-card">
            <div className="step-number">05</div>
            <h4>Review & Export</h4>
            <p>Display ranked queue in NOC Command Center and export leadership summaries.</p>
          </div>
        </div>
      </section>

      {/* Team / Mission Section */}
      <section id="noc-squad" className="landing-section">
        <div className="noc-squad-panel panel">
          <div className="noc-badge">Kalvium Community • The NOC Squad</div>
          <h2>Designed for Engineers, Powered by Data</h2>
          <p>
            OutageIQ was built to help NOC teams move from reactive, noise-heavy triage to impact-based prioritization. By combining real subscriber reach with complaint velocity and revenue risk, engineers can focus on fixing the issues that matter most.
          </p>
          <div className="noc-actions">
            <button className="primary-button" onClick={() => onNavigate(isLoggedIn ? 'overview' : 'login')}>
              {isLoggedIn ? 'Return to Dashboard' : 'Launch Demo Workspace'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="brand-mark">OQ</div>
            <div>
              <strong>OutageIQ</strong>
              <small>By The NOC Squad • Kalvium Community</small>
            </div>
          </div>
          <div className="footer-links">
            <button className="text-link" onClick={() => onNavigate(isLoggedIn ? 'overview' : 'login')}>
              Command Center
            </button>
            <button className="text-link" onClick={() => onNavigate('login')}>
              Sign In
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 OutageIQ • The NOC Squad. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
