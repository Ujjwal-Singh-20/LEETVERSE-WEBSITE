import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { fetchGallery, fetchGalleryImages } from '../services/api';
import { GalleryListingItem } from '../types';
import { TactilePhotoDeck } from '../components/gallery/TactilePhotoDeck';

export const Gallery: React.FC = () => {
  const [events, setEvents] = useState<GalleryListingItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Active event photos cache for on-page preview
  const [activeEventPhotos, setActiveEventPhotos] = useState<string[]>([]);
  const [loadingActivePhotos, setLoadingActivePhotos] = useState<boolean>(false);

  // Lightbox modal state (Full-screen tactile desk viewer)
  const [lightboxSlug, setLightboxSlug] = useState<string | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxTitle, setLightboxTitle] = useState<string>('');
  const [lightboxDate, setLightboxDate] = useState<string>('');
  const [lightboxDesc, setLightboxDesc] = useState<string>('');
  const [lightboxLoading, setLightboxLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchGallery()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const activeEvent = events[activeIndex];

  // Fetch photos for the currently selected event in the featured carousel
  useEffect(() => {
    if (!activeEvent) return;

    setLoadingActivePhotos(true);
    fetchGalleryImages(activeEvent.slug)
      .then((data) => {
        const imgs = data.images && data.images.length > 0 ? data.images : [activeEvent.thumbnail];
        setActiveEventPhotos(imgs);
      })
      .catch(() => {
        setActiveEventPhotos([activeEvent.thumbnail]);
      })
      .finally(() => {
        setLoadingActivePhotos(false);
      });
  }, [activeEvent]);

  const openLightbox = async (item: GalleryListingItem) => {
    setLightboxSlug(item.slug);
    setLightboxTitle(item.eventName);
    setLightboxDate(item.date);
    setLightboxDesc(item.shortDesc);
    setLightboxLoading(true);

    try {
      const data = await fetchGalleryImages(item.slug);
      setLightboxImages(data.images && data.images.length > 0 ? data.images : [item.thumbnail]);
    } catch {
      setLightboxImages([item.thumbnail]);
    } finally {
      setLightboxLoading(false);
    }
  };

  const closeLightbox = () => {
    setLightboxSlug(null);
    setLightboxImages([]);
  };

  const nextEvent = () => {
    setActiveIndex((prev) => (prev + 1) % events.length);
  };

  const prevEvent = () => {
    setActiveIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <div id="gallery" style={{ minHeight: '100vh', padding: 'clamp(100px, 14vh, 140px) 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'clamp(24px, 4vw, 36px)' }}>
          <h1>Gallery</h1>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Loading events...
          </div>
        )}

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div
            className="glass-panel"
            style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}
          >
            No events found.
          </div>
        )}

        {/* Tactile Featured Event Showcase */}
        {!loading && events.length > 0 && activeEvent && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 32vw, 440px), 1fr))',
              gap: 'clamp(28px, 4vw, 56px)',
              alignItems: 'center',
              background: 'radial-gradient(ellipse at center, rgba(14, 34, 24, 0.6) 0%, rgba(6, 13, 10, 0.85) 100%)',
              border: '1px solid rgba(0, 255, 157, 0.18)',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(24px, 4vw, 44px)',
              marginBottom: '64px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 255, 157, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Left: Interactive Tactile Stack of Photos */}
            <div
              style={{
                position: 'relative',
                minHeight: 'clamp(320px, 40vw, 420px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loadingActivePhotos ? (
                <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  Loading photos...
                </div>
              ) : activeEventPhotos.length > 0 ? (
                <TactilePhotoDeck
                  key={activeEvent.slug}
                  images={activeEventPhotos}
                  title={activeEvent.eventName}
                  eventDate={activeEvent.date}
                  description={activeEvent.shortDesc}
                  isFullScreen={false}
                  onOpenFullScreen={() => openLightbox(activeEvent)}
                />
              ) : null}
            </div>

            {/* Right: Event Information & Event Switcher */}
            <div
              className="glass-panel"
              style={{
                padding: 'clamp(24px, 3.5vw, 40px)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(10, 23, 17, 0.85)',
                border: '1px solid var(--accent-border-subtle)',
                boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px',
                  color: 'var(--accent-primary)',
                }}
              >
                <Calendar size={18} />
                <span className="mono-tag" style={{ fontSize: '13px' }}>
                  {new Date(activeEvent.date).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '14px',
                  lineHeight: 1.25,
                }}
              >
                {activeEvent.eventName}
              </h2>

              <p
                style={{
                  color: 'var(--text-muted)',
                  lineHeight: 1.7,
                  fontSize: '1.05rem',
                  marginBottom: '28px',
                }}
              >
                {activeEvent.shortDesc}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <button
                  onClick={() => openLightbox(activeEvent)}
                  className="btn-primary"
                  style={{ fontSize: '0.95rem', padding: '12px 24px' }}
                >
                  <Maximize2 size={16} /> Inspect Album Theater
                </button>

                {/* Event switcher buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={prevEvent}
                    aria-label="Previous event"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(6, 13, 10, 0.8)',
                      border: '1px solid var(--accent-border-subtle)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--accent-border-subtle)')}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--text-dim)',
                      padding: '0 4px',
                    }}
                  >
                    {activeIndex + 1}/{events.length}
                  </span>

                  <button
                    onClick={nextEvent}
                    aria-label="Next event"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(6, 13, 10, 0.8)',
                      border: '1px solid var(--accent-border-subtle)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--accent-border-subtle)')}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Events Archive Grid */}
        {!loading && events.length > 0 && (
          <div>
            <div
              style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span className="mono-tag" style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>
                ALL ARCHIVED EVENTS ({events.length})
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Click any card to inspect tactile stack
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 30vw, 360px), 1fr))',
                gap: 'clamp(18px, 2.5vw, 28px)',
              }}
            >
              {events.map((evt, idx) => (
                <div
                  key={evt.slug}
                  onClick={() => openLightbox(evt)}
                  className="glass-panel"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--accent-border-subtle)';
                  }}
                >
                  <div
                    style={{
                      height: 'clamp(180px, 22vw, 220px)',
                      background: evt.thumbnail ? `url("${evt.thumbnail}") center/cover no-repeat` : 'linear-gradient(135deg, #0d1f16 0%, #153324 100%)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(6, 13, 10, 0.9) 0%, rgba(6, 13, 10, 0.2) 60%)',
                      }}
                    />

                    {/* Subtle Polaroids count pill */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(6, 13, 10, 0.8)',
                        backdropFilter: 'blur(8px)',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-primary)',
                        border: '1px solid rgba(0, 255, 157, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Sparkles size={11} />
                      <span>Inspect Deck</span>
                    </div>
                  </div>

                  <div style={{ padding: 'clamp(16px, 2vw, 22px)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="mono-tag" style={{ fontSize: '12px', color: 'var(--accent-primary)', marginBottom: '6px' }}>
                      {new Date(evt.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.15rem, 1.4vw, 1.35rem)', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {evt.eventName}
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, flex: 1 }}>
                      {evt.shortDesc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Tactile Desk Theater Lightbox Modal */}
      {lightboxSlug && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at center, #15221b 0%, #08100c 70%, #030605 100%)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Subtle desk texture overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.04,
              backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              pointerEvents: 'none',
            }}
          />

          {lightboxLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', zIndex: 10 }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  border: '3px solid rgba(0, 255, 157, 0.2)',
                  borderTopColor: 'var(--accent-primary)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 16px',
                }}
              />
              <p className="mono-tag" style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                Arranging tactile photo deck...
              </p>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TactilePhotoDeck
                images={lightboxImages}
                title={lightboxTitle}
                eventDate={lightboxDate}
                description={lightboxDesc}
                isFullScreen={true}
                onClose={closeLightbox}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
