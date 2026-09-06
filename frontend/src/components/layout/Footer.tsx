import React from 'react';
import { Github, Linkedin, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(61, 255, 160, 0.1)',
        backgroundColor: '#040907',
        padding: '50px 0 35px',
        marginTop: '80px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Brand Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="LeetVerse Logo"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
                display: 'block',
                filter: 'drop-shadow(0 0 6px rgba(0, 255, 157, 0.35))',
              }}
            />
            <span className="wordmark" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.8rem)' }}>
              <span className="wordmark-leet">LEET</span>
              <span className="wordmark-verse">VERSE</span>
            </span>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="https://github.com/leetverse"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(13, 31, 22, 0.6)',
                border: '1px solid rgba(61, 255, 160, 0.2)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(61, 255, 160, 0.2)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Github size={18} />
            </a>

            <a
              href="https://linkedin.com/company/leetverse"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(13, 31, 22, 0.6)',
                border: '1px solid rgba(61, 255, 160, 0.2)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(61, 255, 160, 0.2)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Linkedin size={18} />
            </a>

            <a
              href="https://instagram.com/leetverse"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(13, 31, 22, 0.6)',
                border: '1px solid rgba(61, 255, 160, 0.2)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(61, 255, 160, 0.2)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>

        {/* Bottom Credits Line */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}
        >
          <div>
            © {new Date().getFullYear()} LeetVerse Society.
          </div>
        </div>
      </div>
    </footer>
  );
};
