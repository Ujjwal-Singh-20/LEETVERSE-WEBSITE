import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Members', path: '/members' },
    { label: 'Projects', path: '/projects' },
    { label: 'Gallery', path: '/gallery' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease',
        background: scrolled
          ? 'rgba(6, 13, 10, 0.94)'
          : 'rgba(6, 13, 10, 0.82)',
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(14px)',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(14px)',
        borderBottom: scrolled
          ? '1px solid rgba(61, 255, 160, 0.18)'
          : '1px solid rgba(61, 255, 160, 0.08)',
        boxShadow: scrolled
          ? '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 1px 0 0 rgba(61, 255, 160, 0.1)'
          : '0 4px 20px -4px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
        }}
      >
        {/* Brand Wordmark (Reference Typography) */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <span className="wordmark" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.6rem)' }}>
            <span className="wordmark-leet">LEET</span>
            <span className="wordmark-verse">VERSE</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(20px, 3vw, 36px)',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: 'clamp(1rem, 1.1vw, 1.08rem)',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                  letterSpacing: '0.01em',
                  position: 'relative',
                  padding: '8px 4px',
                  transition: 'color var(--transition-fast)',
                }}
              >
                {link.label}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2.5px',
                      background: 'var(--accent-primary)',
                      borderRadius: '2px',
                      boxShadow: '0 0 10px var(--accent-glow)',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          style={{
            padding: '8px',
            color: 'var(--text-primary)',
            display: 'none',
          }}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '24px',
            backgroundColor: 'rgba(6, 13, 10, 0.98)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(0, 255, 157, 0.2)',
          }}
          className="mobile-nav-drawer"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  fontSize: '1.25rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--accent-primary)' : 'var(--text-primary)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: active ? 'rgba(0, 255, 157, 0.1)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};
