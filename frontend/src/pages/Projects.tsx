import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  X,
  User,
  FolderGit2,
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
  const [scrollX, setScrollX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startScrollLeft, setStartScrollLeft] = useState<number>(0);

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

  // Track scroll position for arc calculation
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollX(scrollContainerRef.current.scrollLeft);
    }
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

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div id="projects" style={{ minHeight: '100vh', padding: 'clamp(100px, 14vh, 140px) 0 80px', overflowX: 'hidden' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(24px, 4vw, 36px)', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1>Projects</h1>
          </div>

          {/* Scroll Nav arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => scrollBy(-440)}
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
              onClick={() => scrollBy(440)}
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

      {/* Horizontal Scroll Track */}
      {!loading && projects.length > 0 && (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            display: 'flex',
            gap: '32px',
            overflowX: 'auto',
            padding: '40px clamp(18px, 4vw, 48px) 80px',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {projects.map((project, index) => {
            const cardWidth = 380;
            const containerCenter = scrollX + (window.innerWidth / 2);
            const cardCenter = (index * (cardWidth + 32)) + (cardWidth / 2);
            const distanceFromCenter = Math.abs(containerCenter - cardCenter);
            // Subtle arc curvature
            const arcOffset = Math.min(45, Math.pow(distanceFromCenter / 450, 2) * 18);

            return (
              <div
                key={project.slug}
                onClick={() => {
                  setActiveProject(project);
                  setActiveImageIndex(0);
                }}
                className="glass-panel"
                style={{
                  width: 'clamp(320px, 34vw, 420px)',
                  minWidth: 'clamp(300px, 32vw, 380px)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transform: `translateY(${arcOffset}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease, border-color 0.2s ease',
                  border: '1px solid var(--accent-border-subtle)',
                  background: 'rgba(13, 31, 22, 0.8)',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    height: 'clamp(200px, 22vw, 250px)',
                    position: 'relative',
                    background: (project.thumbnail || (project.images && project.images[0]))
                      ? `url("${project.thumbnail || project.images[0]}") center/cover no-repeat`
                      : 'linear-gradient(135deg, #0d1f16 0%, #153324 100%)',
                    borderBottom: '1px solid rgba(0, 255, 157, 0.12)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(6, 13, 10, 0.8)',
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
                <div style={{ padding: 'clamp(20px, 2.5vw, 28px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3
                    style={{
                      fontSize: 'clamp(1.3rem, 1.8vw, 1.55rem)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
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
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
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
            );
          })}
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
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg)',
              padding: 'clamp(24px, 4vw, 36px)',
              position: 'relative',
              background: '#0d1f16',
              border: '1px solid var(--accent-border)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveProject(null)}
              aria-label="Close modal"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
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
                <div style={{ marginBottom: '28px' }}>
                  <div
                    style={{
                      position: 'relative',
                      height: 'clamp(240px, 35vw, 400px)',
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

            {/* Modal Title & Body */}
            <h2 style={{ fontSize: 'clamp(1.6rem, 2.8vw, 2.2rem)', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)' }}>
              {activeProject.title}
            </h2>

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
