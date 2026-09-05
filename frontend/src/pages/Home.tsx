import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2 } from 'lucide-react';
import { fetchProjects, fetchGallery } from '../services/api';
import { Project, GalleryListingItem } from '../types';

export const Home: React.FC = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<GalleryListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([fetchProjects(), fetchGallery()]).then(([pRes, gRes]) => {
      if (!mounted) return;

      if (pRes.status === 'fulfilled') {
        setFeaturedProjects(pRes.value.slice(0, 3));
      }

      if (gRes.status === 'fulfilled') {
        setFeaturedEvents(gRes.value.slice(0, 3));
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section
        id="hero"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(100px, 15vh, 160px) 24px 60px',
          textAlign: 'center',
        }}
      >
        <div
          className="container"
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '960px',
            margin: 'auto',
          }}
        >
          {/* Reference Typography Wordmark */}
          <div style={{ marginBottom: 'clamp(14px, 2.5vh, 24px)' }}>
            <h1
              className="wordmark"
              style={{
                fontSize: 'clamp(3.4rem, 12vw, 9.2rem)',
                display: 'inline-flex',
                alignItems: 'baseline',
                justifyContent: 'center',
              }}
            >
              <span className="wordmark-leet">LEET</span>
              <span className="wordmark-verse">VERSE</span>
            </h1>
          </div>

          {/* One Short Tagline - High Legibility */}
          <p
            className="lead-tagline"
            style={{
              maxWidth: '680px',
              margin: '0 auto clamp(28px, 4vh, 44px)',
            }}
          >
            Algorithmic problem solving and technical systems.
          </p>

          {/* Two CTAs */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'clamp(12px, 2vw, 20px)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Link to="/projects" className="btn-primary">
              See our Work <ArrowRight size={18} />
            </Link>
            <Link to="/members" className="btn-secondary">
              Meet the Team
            </Link>
          </div>
        </div>

        {/* Minimal Scroll Cue */}
        {/* <div
          style={{
            position: 'absolute',
            bottom: 'clamp(20px, 4vh, 40px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            opacity: 0.6,
          }}
        >
          <span className="mono-tag" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            SCROLL
          </span>
          <div
            style={{
              width: '1.5px',
              height: '28px',
              background: 'linear-gradient(180deg, var(--accent-primary) 0%, transparent 100%)',
            }}
          />
        </div> */}
      </section>

      {/* Clean Teaser Rows (Projects & Gallery) */}
      {featuredProjects.length > 0 && (
        <section style={{ padding: 'clamp(40px, 8vw, 80px) 0 40px', position: 'relative', zIndex: 5 }}>
          <div className="container">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'clamp(20px, 3vw, 32px)',
              }}
            >
              <h2>Projects</h2>
              <Link
                to="/projects"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--accent-primary)',
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                  fontWeight: 700,
                }}
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 30vw, 360px), 1fr))',
                gap: 'clamp(18px, 2.5vw, 28px)',
              }}
            >
              {featuredProjects.map((p) => (
                <Link
                  key={p.slug}
                  to="/projects"
                  className="glass-panel"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      height: 'clamp(180px, 22vw, 240px)',
                      background: (p.thumbnail || (p.images && p.images[0]))
                        ? `url("${p.thumbnail || p.images[0]}") center/cover no-repeat`
                        : 'linear-gradient(135deg, #0d1f16 0%, #153324 100%)',
                      borderBottom: '1px solid rgba(0, 255, 157, 0.12)',
                      position: 'relative',
                    }}
                  >
                    {!p.thumbnail && (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-dim)',
                        }}
                      >
                        <Code2 size={40} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 'clamp(18px, 2vw, 24px)' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredEvents.length > 0 && (
        <section
          style={{
            padding: '20px 0 clamp(60px, 10vw, 100px)',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div className="container">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'clamp(20px, 3vw, 32px)',
              }}
            >
              <h2>Gallery</h2>
              <Link
                to="/gallery"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--accent-primary)',
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                  fontWeight: 700,
                }}
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 30vw, 360px), 1fr))',
                gap: 'clamp(18px, 2.5vw, 28px)',
              }}
            >
              {featuredEvents.map((evt) => (
                <Link
                  key={evt.slug}
                  to="/gallery"
                  className="glass-panel"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      height: 'clamp(180px, 22vw, 220px)',
                      background: evt.thumbnail
                        ? `url("${evt.thumbnail}") center/cover no-repeat`
                        : 'linear-gradient(135deg, #0a1711 0%, #10261b 100%)',
                    }}
                  />
                  <div style={{ padding: 'clamp(16px, 2vw, 22px)' }}>
                    <div
                      className="mono-tag"
                      style={{ color: 'var(--accent-primary)', marginBottom: '6px' }}
                    >
                      {new Date(evt.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <h3 style={{ color: 'var(--text-primary)' }}>
                      {evt.eventName}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
