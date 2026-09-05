import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Github,
  Linkedin,
  Instagram,
  ArrowLeft,
  Share2,
  Check,
  ShieldCheck,
  UserX,
} from 'lucide-react';
import { fetchBusinessCard } from '../services/api';
import { PublicMember } from '../types';

export const BusinessCard: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [member, setMember] = useState<PublicMember | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);

    fetchBusinessCard(username)
      .then((data) => {
        setMember(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.status === 404 || err.code === 'USERNAME_NOT_FOUND' || err.code === 'MEMBER_NOT_FOUND') {
          setNotFound(true);
        }
        setLoading(false);
      });
  }, [username]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              border: '3px solid rgba(0, 255, 157, 0.2)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <div className="mono-tag" style={{ fontSize: '13px' }}>
            Loading member profile...
          </div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          className="glass-panel"
          style={{
            maxWidth: '440px',
            width: '100%',
            padding: '48px 32px',
            textAlign: 'center',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(255, 75, 75, 0.1)',
              border: '1px solid rgba(255, 75, 75, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#ff6b6b',
            }}
          >
            <UserX size={34} />
          </div>

          <span className="mono-tag" style={{ color: '#ff8585', marginBottom: '8px', display: 'block', fontSize: '12px' }}>
            404 NOT FOUND
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.2rem)', marginBottom: '12px' }}>Member Not Found</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
            No member profile exists for username{' '}
            <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              @{username}
            </span>
            .
          </p>

          <Link to="/members" className="btn-primary" style={{ display: 'inline-flex' }}>
            <ArrowLeft size={18} /> Back to Members
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(100px, 14vh, 140px) 24px 60px',
        position: 'relative',
      }}
    >
      {/* Background Soft Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(0, 255, 157, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top back navigation */}
      <div style={{ maxWidth: 'clamp(360px, 92vw, 480px)', width: '100%', marginBottom: '20px' }}>
        <Link
          to="/members"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={18} /> Back to Members
        </Link>
      </div>

      {/* Digital Business Card */}
      <div
        className="glass-panel"
        style={{
          maxWidth: 'clamp(360px, 92vw, 480px)',
          width: '100%',
          padding: 'clamp(28px, 4vw, 40px)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          border: '1px solid var(--accent-border)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px var(--accent-glow-subtle)',
        }}
      >
        {/* Verified Society Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--accent-primary)" />
            <span
              className="mono-tag"
              style={{
                fontSize: '12px',
                color: 'var(--accent-primary)',
                fontWeight: 700,
              }}
            >
              LeetVerse Member
            </span>
          </div>

          <button
            onClick={handleShare}
            title="Copy Profile Link"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 255, 157, 0.1)',
              border: '1px solid var(--accent-border-subtle)',
              color: copied ? 'var(--accent-primary)' : 'var(--text-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              transition: 'all var(--transition-fast)',
            }}
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Copied' : 'Share'}
          </button>
        </div>

        {/* Avatar / Photo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: 'clamp(94px, 14vw, 116px)',
              height: 'clamp(94px, 14vw, 116px)',
              borderRadius: '50%',
              margin: '0 auto 18px',
              background: member.photoUrl
                ? `url("${member.photoUrl}") center/cover no-repeat`
                : 'linear-gradient(135deg, #122a1e 0%, #204b36 100%)',
              border: '3px solid var(--accent-primary)',
              boxShadow: '0 0 24px var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.6rem',
              fontWeight: 800,
              color: 'var(--text-accent)',
            }}
          >
            {!member.photoUrl && member.name[0]}
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3.2vw, 2.1rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}
          >
            {member.name}
          </h2>

          <div
            style={{
              fontSize: 'clamp(1.05rem, 1.4vw, 1.2rem)',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            {member.position}
          </div>

          <div
            className="mono-tag"
            style={{
              color: 'var(--text-dim)',
              fontSize: '12.5px',
            }}
          >
            @{member.username} &bull; {member.status}
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <div
            style={{
              padding: '18px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(6, 13, 10, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'var(--text-muted)',
              marginBottom: '26px',
              textAlign: 'center',
            }}
          >
            {member.bio}
          </div>
        )}

        {/* Social Links Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            paddingTop: '8px',
          }}
        >
          {member.github && (
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub Profile"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(13, 31, 22, 0.85)',
                border: '1px solid var(--accent-border-subtle)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-border-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Github size={22} />
            </a>
          )}

          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn Profile"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(13, 31, 22, 0.85)',
                border: '1px solid var(--accent-border-subtle)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-border-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Linkedin size={22} />
            </a>
          )}

          {member.instagram && (
            <a
              href={member.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram Profile"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(13, 31, 22, 0.85)',
                border: '1px solid var(--accent-border-subtle)',
                color: 'var(--text-primary)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-border-subtle)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Instagram size={22} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
