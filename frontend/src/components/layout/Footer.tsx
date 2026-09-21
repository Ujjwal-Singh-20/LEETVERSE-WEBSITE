import React from 'react';
import { Github, Linkedin, Instagram } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isBusinessCard = location.pathname.startsWith('/u/');

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'var(--bg-color)',
        padding: isBusinessCard ? '24px 0 20px' : 'clamp(30px, 4.5vh, 48px) 0 clamp(18px, 2.5vh, 32px)',
        marginTop: isBusinessCard ? '24px' : 'clamp(36px, 5vh, 70px)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: isBusinessCard ? '16px' : '24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Brand Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.png"
              alt="LeetVerse Logo"
              style={{
                width: isBusinessCard ? '24px' : '28px',
                height: isBusinessCard ? '24px' : '28px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
            <span className="wordmark" style={{ fontSize: isBusinessCard ? '1.25rem' : 'clamp(1.2rem, 1.8vw, 1.5rem)' }}>
              <span className="wordmark-leet">LEET</span>
              <span className="wordmark-verse">VERSE</span>
            </span>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://github.com/Chetan-Kedia/LeetVerse"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isBusinessCard ? '36px' : '40px',
                height: isBusinessCard ? '36px' : '40px',
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
              <Github size={isBusinessCard ? 16 : 18} />
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
                width: isBusinessCard ? '36px' : '40px',
                height: isBusinessCard ? '36px' : '40px',
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
              <Linkedin size={isBusinessCard ? 16 : 18} />
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
                width: isBusinessCard ? '36px' : '40px',
                height: isBusinessCard ? '36px' : '40px',
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
              <Instagram size={isBusinessCard ? 16 : 18} />
            </a>
          </div>
        </div>

        {/* Bottom Credits Line */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: isBusinessCard ? '12px' : '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
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
