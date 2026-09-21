import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { fetchProjects } from '../services/api';
import { Project, ProjectMemberSnapshot } from '../types';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Horizontal Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const carouselSectionRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startScrollLeft, setStartScrollLeft] = useState<number>(0);

  // Window Width for accurate responsive calculations
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Cursor Movement Interaction State (Normalized -1 to +1)
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track scroll position for arc & focal calculations
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollX(scrollContainerRef.current.scrollLeft);
    }
  };

  // Scroll causes carousel to shift horizontally via mouse wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Don't hijack if modal is open
      if (activeProject) return;

      // When vertical scroll is dominant, translate to horizontal carousel shift
      if (Math.abs(e.deltaY) >= Math.abs(e.deltaX) * 0.5) {
        const atLeft = container.scrollLeft <= 2;
        const atRight =
          container.scrollLeft + container.clientWidth >= container.scrollWidth - 4;

        // If at boundaries and trying to scroll past, let the window scroll naturally
        if ((e.deltaY < 0 && atLeft) || (e.deltaY > 0 && atRight)) {
          return;
        }

        e.preventDefault();
        container.scrollLeft += e.deltaY * 1.15;
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [activeProject]);

  // Section-wide cursor movement tracking
  const handleSectionMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselSectionRef.current) return;
    const rect = carouselSectionRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setCursorPos({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  };

  const handleSectionMouseLeave = () => {
    setCursorPos({ x: 0, y: 0 });
    setHoveredCardIndex(null);
  };

  // Drag physics for horizontal mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setStartScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = startScrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Responsive Card Dimension Calculations
  const cardWidth = Math.min(420, Math.max(320, windowWidth * 0.34));
  const cardGap = 36;
  const sidePadding = Math.max(24, (windowWidth - cardWidth) / 2);

  const scrollStep = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const step = cardWidth + cardGap;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth',
      });
    }
  };

  // Find the currently focused project at the center of the viewport
  const focusedProjectIndex = useMemo(() => {
    if (projects.length === 0) return 0;
    const cardStep = cardWidth + cardGap;
    const viewportCenter = scrollX + windowWidth / 2;

    let closestIdx = 0;
    let minDiff = Infinity;
    projects.forEach((_, idx) => {
      const cardCenter = sidePadding + idx * cardStep + cardWidth / 2;
      const diff = Math.abs(cardCenter - viewportCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    return closestIdx;
  }, [projects, scrollX, windowWidth, cardWidth, cardGap, sidePadding]);

  return (
    <div
      id="projects"
      style={{
        minHeight: '100vh',
        padding: windowWidth < 768
          ? 'clamp(110px, 14vh, 140px) 0 clamp(40px, 6vh, 60px)'
          : 'clamp(85px, 11vh, 115px) 0 60px',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: windowWidth < 768
              ? 'clamp(24px, 4vh, 36px)'
              : 'clamp(10px, 1.8vw, 18px)',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <h1 style={{ margin: 0 }}>Projects</h1>
          </div>

          {/* Scroll Nav arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => scrollStep('left')}
              aria-label="Scroll left"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(13, 31, 22, 0.8)',
                border: '1px solid var(--accent-border-subtle)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-border-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={() => scrollStep('right')}
              aria-label="Scroll right"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(13, 31, 22, 0.8)',
                border: '1px solid var(--accent-border-subtle)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-border-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Loading projects...
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            No projects found.
          </div>
        )}
      </div>

      {/* Projects Curved Carousel Track */}
      {!loading && projects.length > 0 && (
        <div
          ref={carouselSectionRef}
          onMouseMove={handleSectionMouseMove}
          onMouseLeave={handleSectionMouseLeave}
          style={{
            position: 'relative',
            width: '100%',
            perspective: '1400px',
            paddingTop: windowWidth < 768 ? 'clamp(10px, 2vh, 20px)' : '0px',
          }}
        >
          {/* Horizontal Scroll Track */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              display: 'flex',
              gap: `${cardGap}px`,
              overflowX: 'auto',
              padding: `10px ${sidePadding}px 60px`,
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {projects.map((project, index) => {
              const cardCenter = sidePadding + index * (cardWidth + cardGap) + cardWidth / 2;
              const viewportCenter = scrollX + windowWidth / 2;
              const distFromCenter = cardCenter - viewportCenter;

              // Normalized distance from center (-2 to +2 approx within view)
              const normDist = Math.max(-2.5, Math.min(2.5, distFromCenter / (windowWidth * 0.42)));

              // Curve with Anchor at Top:
              // Center card is highest / closest to anchor beam, sides drop down along the search arc
              const arcY = Math.min(95, Math.pow(Math.abs(normDist), 1.85) * 55);

              // Cylindrical rotation around the top anchor:
              const rotZ = normDist * 5.2; // degrees
              const rotY = -normDist * 14; // 3D arc perspective

              // Scaling and focal intensity:
              const isCenterFocus = Math.abs(normDist) < 0.42;
              const scale = Math.max(0.88, 1 - Math.abs(normDist) * 0.075);
              const opacity = Math.max(0.6, 1 - Math.abs(normDist) * 0.25);

              // Cursor Movement Reactions:
              const cursorShiftX = cursorPos.x * 20;
              const cursorShiftY = cursorPos.y * 14;
              const cursorTiltY = cursorPos.x * 6;
              const cursorTiltX = -cursorPos.y * 6;

              const isHovered = hoveredCardIndex === index;

              return (
                <div
                  key={project.slug}
                  onClick={() => {
                    setActiveProject(project);
                    setActiveImageIndex(0);
                  }}
                  onMouseEnter={() => setHoveredCardIndex(index)}
                  onMouseLeave={() => setHoveredCardIndex(null)}
                  className="glass-panel"
                  style={{
                    width: `${cardWidth}px`,
                    minWidth: `${cardWidth}px`,
                    maxWidth: `${cardWidth}px`,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: `translate3d(${cursorShiftX}px, ${arcY + cursorShiftY}px, 0) rotateX(${cursorTiltX}deg) rotateY(${rotY + cursorTiltY}deg) rotateZ(${rotZ}deg) scale(${isHovered ? scale * 1.03 : scale})`,
                    transformOrigin: 'center -100px', // Anchor at top!
                    transition: isDragging
                      ? 'none'
                      : 'transform 0.22s cubic-bezier(0.2, 0, 0.2, 1), border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
                    border: isCenterFocus
                      ? '1.5px solid var(--accent-border)'
                      : isHovered
                        ? '1.5px solid var(--accent-border)'
                        : '1px solid var(--accent-border-subtle)',
                    background: isCenterFocus
                      ? 'var(--bg-glass-hover)'
                      : 'var(--bg-glass)',
                    boxShadow: isCenterFocus
                      ? '0 25px 55px rgba(0, 0, 0, 0.6)'
                      : isHovered
                        ? '0 18px 40px rgba(0, 0, 0, 0.5)'
                        : '0 10px 28px rgba(0, 0, 0, 0.35)',
                    opacity: opacity,
                    willChange: 'transform',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      height: 'clamp(200px, 22vw, 250px)',
                      position: 'relative',
                      background:
                        project.thumbnail || (project.images && project.images[0])
                          ? `url("${project.thumbnail || project.images[0]}") center/cover no-repeat`
                          : 'linear-gradient(135deg, #0d1f16 0%, #153324 100%)',
                      borderBottom: '1px solid rgba(0, 255, 157, 0.15)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(6, 13, 10, 0.85)',
                        border: '1px solid var(--accent-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-primary)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Layers size={13} />
                      {project.images?.length || 1} {project.images?.length === 1 ? 'image' : 'images'}
                    </div>
                  </div>

                  {/* Details */}
                  <div
                    style={{
                      padding: 'clamp(20px, 2.5vw, 28px)',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 'clamp(1.3rem, 1.8vw, 1.55rem)',
                        fontWeight: 700,
                        color: isCenterFocus ? '#ffffff' : 'var(--text-primary)',
                        marginBottom: '10px',
                      }}
                    >
                      {project.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '1rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        marginBottom: '20px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                      }}
                    >
                      {project.description}
                    </p>

                    {/* Contributor Strip */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', marginLeft: '6px' }}>
                          {(project.members || []).slice(0, 4).map((m, i) => (
                            <Link
                              key={m.username || i}
                              to={`/u/${m.username}`}
                              title={m.name}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                marginLeft: i === 0 ? 0 : '-8px',
                                border: '2px solid var(--bg-card)',
                                background: m.photoUrl ? `url("${m.photoUrl}") center/cover` : '#132a1e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                color: 'var(--text-accent)',
                                zIndex: 10 - i,
                              }}
                            >
                              {!m.photoUrl && m.name[0]}
                            </Link>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                          {project.members?.length || 0} contributors
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Open project in new tab"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'rgba(0, 255, 157, 0.15)',
                              border: '1px solid rgba(0, 255, 157, 0.4)',
                              color: 'var(--accent-primary)',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#00ff9d';
                              e.currentTarget.style.color = '#040907';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 255, 157, 0.15)';
                              e.currentTarget.style.color = 'var(--accent-primary)';
                            }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}

                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: 'var(--accent-primary)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          Inspect <ExternalLink size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {activeProject && (
        <div
          onClick={() => setActiveProject(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 9, 7, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(16px, 3vh, 32px) clamp(16px, 3vw, 32px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: 'min(92vw, 760px)',
              maxHeight: 'min(84vh, 760px)',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-border)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveProject(null)}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 20,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
            >
              <X size={18} />
            </button>

            {/* Modal Image Carousel */}
            {(() => {
              const activeImages =
                activeProject.images && activeProject.images.length > 0
                  ? activeProject.images
                  : activeProject.thumbnail
                    ? [activeProject.thumbnail]
                    : [];

              if (activeImages.length === 0) return null;

              return (
                <div style={{ marginBottom: '22px' }}>
                  <div
                    style={{
                      position: 'relative',
                      height: 'clamp(180px, 26vh, 280px)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      background: `url("${activeImages[activeImageIndex] || activeImages[0]}") center/contain no-repeat #07120c`,
                      border: '1px solid rgba(0, 255, 157, 0.15)',
                    }}
                  >
                    {activeImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === 0 ? activeImages.length - 1 : prev - 1
                            )
                          }
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'rgba(6, 13, 10, 0.8)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ChevronLeft size={22} />
                        </button>

                        <button
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              (prev + 1) % activeImages.length
                            )
                          }
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'rgba(6, 13, 10, 0.8)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ChevronRight size={22} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {activeImages.length > 1 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px', overflowX: 'auto' }}>
                      {activeImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          style={{
                            width: '64px',
                            height: '46px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: i === activeImageIndex ? '2px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: `url("${img}") center/cover no-repeat`,
                            opacity: i === activeImageIndex ? 1 : 0.6,
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Title, Action & Body */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '14px',
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                  flex: 1,
                  minWidth: '240px',
                }}
              >
                {activeProject.title}
              </h2>

              {activeProject.link && (
                <a
                  href={activeProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ExternalLink size={15} /> Open Project
                </a>
              )}
            </div>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
              {activeProject.description}
            </p>

            {/* Contributing Members */}
            {activeProject.members && activeProject.members.length > 0 && (
              <div>
                <div className="mono-tag" style={{ color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '12px' }}>
                  BUILDERS & CONTRIBUTORS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {activeProject.members.map((m: ProjectMemberSnapshot) => (
                    <Link
                      key={m.username}
                      to={`/u/${m.username}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(19, 42, 30, 0.8)',
                        border: '1px solid var(--accent-border-subtle)',
                        textDecoration: 'none',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-border-subtle)';
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: m.photoUrl ? `url("${m.photoUrl}") center/cover` : '#132a1e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: 'var(--text-accent)',
                          fontWeight: 700,
                        }}
                      >
                        {!m.photoUrl && m.name[0]}
                      </div>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {m.name}
                      </span>
                      <span className="mono-tag" style={{ fontSize: '11px', color: 'var(--accent-primary)' }}>
                        @{m.username}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
