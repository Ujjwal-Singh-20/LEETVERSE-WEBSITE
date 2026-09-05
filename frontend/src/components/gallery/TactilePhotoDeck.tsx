import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, VolumeX, X, Maximize2 } from 'lucide-react';

interface TactilePhotoDeckProps {
  images: string[];
  title: string;
  eventDate?: string;
  description?: string;
  isFullScreen?: boolean;
  onClose?: () => void;
  onOpenFullScreen?: () => void;
}

// Organic scatter offsets when a photo is tossed to the desk/side
const SCATTER_OFFSETS = [
  { x: -350, y: -65, rot: -15, scale: 0.82 },
  { x: -390, y: 115, rot: 13, scale: 0.79 },
  { x: 360, y: -95, rot: 16, scale: 0.81 },
  { x: -310, y: 220, rot: -10, scale: 0.76 },
  { x: 380, y: 130, rot: -14, scale: 0.79 },
  { x: -420, y: 35, rot: -22, scale: 0.75 },
  { x: 350, y: -30, rot: 9, scale: 0.78 },
  { x: -270, y: -190, rot: 19, scale: 0.77 },
];

// Subtle tilt for waiting photos in the stack
const STACK_TILTS = [-2, 2.5, -1.5, 1.8, -2.8, 1.2];

export const TactilePhotoDeck: React.FC<TactilePhotoDeckProps> = ({
  images,
  title,
  eventDate,
  description,
  isFullScreen = false,
  onClose,
  onOpenFullScreen,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check window size for mobile adjustments
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Subtle synthetic whoosh/card flick audio
  const playCardSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // AudioContext unavailable or blocked
    }
  }, [soundEnabled]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      playCardSound();
    }
  }, [currentIndex, images.length, playCardSound]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      playCardSound();
    }
  }, [currentIndex, playCardSound]);

  const handleRestack = useCallback(() => {
    setCurrentIndex(0);
    playCardSound();
  }, [playCardSound]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Compute transform style for a photo based on its state:
  // 1. Thrown/Scattered (idx < currentIndex)
  // 2. Active Center (idx === currentIndex)
  // 3. Stacked underneath (idx > currentIndex)
  const getCardStyle = (idx: number): React.CSSProperties => {
    const isThrown = idx < currentIndex;
    const isActive = idx === currentIndex;
    const isWaiting = idx > currentIndex;

    if (isActive) {
      return {
        transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
        zIndex: 50,
        filter: 'brightness(1) contrast(1)',
        boxShadow: '0 25px 65px rgba(0, 0, 0, 0.85), 0 4px 15px rgba(0, 0, 0, 0.4)',
        cursor: currentIndex < images.length - 1 ? 'pointer' : 'default',
        opacity: 1,
      };
    }

    if (isThrown) {
      const preset = SCATTER_OFFSETS[idx % SCATTER_OFFSETS.length];
      let x = preset.x;
      let y = preset.y;
      let scale = preset.scale;

      if (isMobile) {
        // Adjust scatter for small viewports so photos remain visible at edges
        const dir = idx % 2 === 0 ? -1 : 1;
        x = dir * (window.innerWidth < 480 ? 65 : 110);
        y = (idx % 3 === 0 ? -60 : 60) + (idx * 8);
        scale = 0.62;
      }

      return {
        transform: `translate3d(${x}px, ${y}px, 0) rotate(${preset.rot}deg) scale(${scale})`,
        zIndex: 10 + idx,
        filter: 'brightness(0.48) contrast(0.92) grayscale(0.25)',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.65)',
        cursor: 'pointer',
        opacity: 0.88,
      };
    }

    // isWaiting (underneath current)
    const stackDepth = idx - currentIndex;
    const tilt = STACK_TILTS[idx % STACK_TILTS.length];
    const offsetX = stackDepth * 4;
    const offsetY = stackDepth * 2;
    const scale = Math.max(0.86, 1 - stackDepth * 0.025);

    return {
      transform: `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${tilt}deg) scale(${scale})`,
      zIndex: 40 - stackDepth,
      filter: `brightness(${Math.max(0.72, 0.92 - stackDepth * 0.06)})`,
      boxShadow: '0 14px 32px rgba(0, 0, 0, 0.6)',
      cursor: 'pointer',
      opacity: stackDepth > 5 ? 0 : 1, // Only render top 5 in stack for clean performance
    };
  };

  const cardWidth = isFullScreen
    ? 'clamp(280px, 48vw, 540px)'
    : 'clamp(240px, 32vw, 360px)';
  const cardHeight = isFullScreen
    ? 'clamp(220px, 40vw, 420px)'
    : 'clamp(200px, 26vw, 290px)';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: isFullScreen ? '100%' : 'clamp(380px, 46vw, 480px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: isFullScreen ? 'hidden' : 'visible',
        userSelect: 'none',
      }}
    >
      {/* Tabletop Photo Area */}
      <div
        style={{
          position: 'relative',
          width: cardWidth,
          height: cardHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {images.map((imgUrl, idx) => {
          const cardStyle = getCardStyle(idx);
          const isThrown = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div
              key={`${imgUrl}-${idx}`}
              onClick={() => {
                if (isThrown) {
                  // Clicking on a scattered photo jumps back to it
                  setCurrentIndex(idx);
                  playCardSound();
                } else if (isActive) {
                  // Clicking the active photo flips it to the next
                  handleNext();
                }
              }}
              title={
                isThrown
                  ? `Photo ${idx + 1} (Click to bring back)`
                  : isActive
                  ? `Photo ${idx + 1} of ${images.length} (Click to toss next)`
                  : `Photo ${idx + 1}`
              }
              style={{
                position: 'absolute',
                width: cardWidth,
                height: cardHeight,
                backgroundColor: '#ffffff',
                padding: isFullScreen ? '12px 12px 38px 12px' : '9px 9px 28px 9px',
                borderRadius: '4px',
                transition: 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, filter 0.4s ease, box-shadow 0.4s ease',
                willChange: 'transform, opacity, filter',
                ...cardStyle,
              }}
            >
              {/* Photo Image Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: '2px',
                  backgroundColor: '#111814',
                }}
              >
                <img
                  src={imgUrl}
                  alt={`${title} - Photo ${idx + 1}`}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* Subtle vignette gloss */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.25)',
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* Polaroid Bottom Caption Area */}
              <div
                style={{
                  position: 'absolute',
                  bottom: isFullScreen ? '10px' : '7px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#2a342f',
                  fontSize: isFullScreen ? '11px' : '10px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                  opacity: 0.85,
                }}
              >
                <span style={{ textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                  {title}
                </span>
                <span>
                  {idx + 1} / {images.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Note Metadata Card (Reference Image Yellow Post-it) */}
      {isFullScreen && (
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '85px' : 'clamp(28px, 6vw, 60px)',
            right: isMobile ? '16px' : 'clamp(20px, 4vw, 50px)',
            width: isMobile ? 'clamp(200px, 50vw, 240px)' : 'clamp(230px, 22vw, 300px)',
            backgroundColor: '#ffe885',
            color: '#1a1915',
            padding: 'clamp(14px, 2vw, 20px)',
            borderRadius: '2px',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.75), 0 2px 8px rgba(0, 0, 0, 0.4)',
            transform: 'rotate(2.5deg)',
            zIndex: 70,
            transition: 'transform 0.3s ease',
            pointerEvents: 'auto',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(2.5deg) scale(1)')}
        >
          {/* Asterisk Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#000' }}>*</span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(13px, 1.2vw, 15px)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#000',
              }}
            >
              ARCHIVE RECORD
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(15px, 1.4vw, 18px)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '6px',
              color: '#111',
            }}
          >
            {title}
          </h3>

          {eventDate && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                color: '#444',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              {new Date(eventDate).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </div>
          )}

          {description && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'clamp(11px, 1vw, 12.5px)',
                lineHeight: 1.45,
                color: '#2b2a24',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            >
              {description}
            </p>
          )}

          <div
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px dashed rgba(0, 0, 0, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: '#555',
            }}
          >
            <span>LEETVERSE ARCHIVE</span>
            <span style={{ fontWeight: 700, color: '#000' }}>
              P.{currentIndex + 1}
            </span>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Controls (< 4/6 >) */}
      <div
        style={{
          position: 'absolute',
          bottom: isFullScreen ? '24px' : '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 80,
          background: 'rgba(6, 13, 10, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '6px 14px',
          borderRadius: '999px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          aria-label="Previous photo"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentIndex === 0 ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
            color: currentIndex === 0 ? 'rgba(255, 255, 255, 0.3)' : '#0a1711',
            border: 'none',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            transform: currentIndex === 0 ? 'none' : 'scale(1)',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Counter (e.g. 4 / 6) */}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '1px',
            minWidth: '42px',
            textAlign: 'center',
          }}
        >
          {currentIndex + 1} / {images.length}
        </span>

        {/* Next Button (Bright highlighted button like reference image!) */}
        <button
          onClick={handleNext}
          disabled={currentIndex >= images.length - 1}
          aria-label="Next photo"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              currentIndex >= images.length - 1
                ? 'rgba(255, 255, 255, 0.08)'
                : '#ffe885', // Warm yellow highlight matching reference, or neon green
            color: '#111814',
            border: 'none',
            cursor: currentIndex >= images.length - 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow:
              currentIndex < images.length - 1
                ? '0 0 15px rgba(255, 232, 133, 0.4)'
                : 'none',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>

        {/* Re-stack Button */}
        {currentIndex > 0 && (
          <button
            onClick={handleRestack}
            title="Re-stack photos"
            aria-label="Re-stack all photos"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            <RotateCcw size={14} />
          </button>
        )}

        {/* Fullscreen Trigger if on page */}
        {!isFullScreen && onOpenFullScreen && (
          <button
            onClick={onOpenFullScreen}
            title="Open Fullscreen Album"
            aria-label="Open Fullscreen Album"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              color: 'var(--accent-primary)',
              border: '1px solid var(--accent-border-subtle)',
              cursor: 'pointer',
              marginLeft: '2px',
            }}
          >
            <Maximize2 size={14} />
          </button>
        )}
      </div>

      {/* Bottom Left Sound Toggle (Reference Image ||| ON) */}
      {isFullScreen && (
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            position: 'absolute',
            bottom: '24px',
            left: 'clamp(20px, 4vw, 40px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: soundEnabled ? 'var(--text-primary)' : 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            cursor: 'pointer',
            zIndex: 80,
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span>SFX {soundEnabled ? 'ON' : 'OFF'}</span>
        </button>
      )}

      {/* Top Right Close Button (Reference Image CLOSE X) */}
      {isFullScreen && onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: 'clamp(20px, 4vw, 40px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1px',
            cursor: 'pointer',
            zIndex: 80,
            padding: '6px 12px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
        >
          <span>CLOSE</span>
          <X size={18} />
        </button>
      )}
    </div>
  );
};
