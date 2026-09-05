import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  const [radarAngle, setRadarAngle] = useState(0);

  // Gentle, smooth ambient radar sweep
  useEffect(() => {
    let animId: number;
    const animate = () => {
      setRadarAngle((prev) => (prev + 0.6) % 360);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      {/* Light Ambient Background Radar Scan */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '640px',
          height: '640px',
          pointerEvents: 'none',
          opacity: 0.16,
          zIndex: 0,
        }}
      >
        <svg
          viewBox="0 0 600 600"
          width="100%"
          height="100%"
          style={{
            overflow: 'visible',
          }}
        >
          {/* Subtle concentric sonar rings */}
          <circle cx="300" cy="300" r="280" fill="none" stroke="var(--accent-primary)" strokeWidth="1" strokeDasharray="3 6" opacity="0.6" />
          <circle cx="300" cy="300" r="200" fill="none" stroke="var(--accent-primary)" strokeWidth="1" opacity="0.5" />
          <circle cx="300" cy="300" r="120" fill="none" stroke="var(--accent-primary)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          <circle cx="300" cy="300" r="50" fill="none" stroke="var(--accent-primary)" strokeWidth="1" opacity="0.7" />

          {/* Faint crosshairs */}
          <line x1="20" y1="300" x2="580" y2="300" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.4" />
          <line x1="300" y1="20" x2="300" y2="580" stroke="var(--accent-primary)" strokeWidth="0.8" opacity="0.4" />

          {/* Rotating soft radar beam */}
          <g transform={`rotate(${radarAngle} 300 300)`}>
            <line x1="300" y1="300" x2="580" y2="300" stroke="var(--accent-primary)" strokeWidth="1.5" opacity="0.8" />
            <path
              d="M 300 300 L 580 300 A 280 280 0 0 0 542.4 158.8 Z"
              fill="url(#lightRadarGrad)"
            />
          </g>

          <defs>
            <radialGradient id="lightRadarGrad" cx="300" cy="300" r="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Clean, Non-Bloated Center Content */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: 'clamp(36px, 6vw, 56px) clamp(24px, 5vw, 48px)',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          borderRadius: '24px',
          border: '1px solid rgba(0, 255, 157, 0.3)',
          background: 'rgba(10, 23, 17, 0.75)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 255, 157, 0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Cool Bracket 404 Lockup */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '10px',
            userSelect: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(3rem, 9vw, 5rem)',
              color: 'var(--accent-primary)',
              fontWeight: 300,
              lineHeight: 1,
              textShadow: '0 0 25px rgba(0, 255, 157, 0.6)',
            }}
          >
            [
          </span>

          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 9vw, 5rem)',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-2px',
              color: '#ffffff',
              textShadow: '0 0 35px rgba(0, 255, 157, 0.25)',
            }}
          >
            404
          </span>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'clamp(3rem, 9vw, 5rem)',
              color: 'var(--accent-primary)',
              fontWeight: 300,
              lineHeight: 1,
              textShadow: '0 0 25px rgba(0, 255, 157, 0.6)',
            }}
          >
            ]
          </span>
        </div>

        {/* Bracketed not_found status */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-accent)',
            letterSpacing: '0.5px',
            marginBottom: '14px',
          }}
        >
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{'{'}</span>
          <span>not_found</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{'}'}</span>
        </div>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            maxWidth: '320px',
            margin: '0 auto 28px',
          }}
        >
          The coordinate you were looking for doesn't exist or has shifted in the matrix.
        </p>

        {/* Clean Return Home CTA */}
        <Link
          to="/"
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 26px',
            fontSize: '0.95rem',
          }}
        >
          <ArrowLeft size={16} /> Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
