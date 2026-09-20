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
import { getMemberTier, formatDomainName } from '../utils/memberTiers';

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

  const tier = getMemberTier(member.position);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 160px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(90px, 12vh, 125px) clamp(16px, 4vw, 24px) 30px',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      {/* Background Soft Glow matching Member Tier */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(480px, 90vw)',
          height: 'min(480px, 90vw)',
          background: `radial-gradient(circle, ${tier.glowColor} 0%, transparent 70%)`,
          pointerEvents: 'none',
          transition: 'all var(--transition-smooth)',
        }}
      />

      {/* Top back navigation */}
      <div style={{ maxWidth: 'min(92vw, 460px)', width: '100%', marginBottom: '16px' }}>
        <Link
          to="/members"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 600,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = tier.accentColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={18} /> Back to Members
        </Link>
      </div>

      {/* Digital Business Card */}
      <div
        className="glass-panel mc-bg card-bg"
        style={{
          maxWidth: 'min(92vw, 460px)',
          width: '100%',
          padding: 'clamp(24px, 4vw, 36px)',
          borderRadius: 'var(--radius-lg)',
          position: 'relative',
          border: `1.5px solid ${tier.borderColor}`,
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px ${tier.glowColor}`,
          overflow: 'hidden',
          transition: 'border-color var(--transition-smooth), box-shadow var(--transition-smooth)',
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
            <ShieldCheck size={18} color={tier.accentColor} />
            <span
              className="mono-tag"
              style={{
                fontSize: '12px',
                color: tier.accentColor,
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
              background: tier.bgSubtle,
              border: `1px solid ${tier.borderColor}`,
              color: copied ? tier.accentColor : 'var(--text-accent)',
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

        {/* Avatar / Photo with Ambient Enlarged Blurred Photo Glow */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              position: 'relative',
              width: 'clamp(122px, 18vw, 148px)',
              height: 'clamp(122px, 18vw, 148px)',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Ambient Blurred Photo Glow emitting outward */}
            <div
              className="photo-ambient-glow"
              style={{
                position: 'absolute',
                inset: '-12px',
                borderRadius: '50%',
                background: member.photoUrl
                  ? `url("${member.photoUrl}") center/cover no-repeat`
                  : `radial-gradient(circle, ${tier.glowColor} 0%, rgba(18, 42, 30, 0.8) 70%)`,
                filter: 'blur(20px)',
                opacity: 0.85,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {/* Sharp Foreground Avatar with Tier Colored Ring & Static Glow */}
            <div
              className="mc-ring"
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: member.photoUrl
                  ? `url("${member.photoUrl}") center/cover no-repeat`
                  : 'linear-gradient(135deg, #122a1e 0%, #204b36 100%)',
                border: `2px solid ${tier.ringColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(2.8rem, 4.2vw, 3.4rem)',
                fontWeight: 800,
                color: tier.accentColor,
              }}
            >
              {!member.photoUrl && member.name[0]}
            </div>
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
              color: tier.accentColor,
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            {member.position}
          </div>

          {/* {tier.type !== 'member' && (
            <div style={{ marginBottom: '10px' }}>
              <span
                className="mono-tag"
                style={{
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: tier.bgSubtle,
                  color: tier.accentColor,
                  border: `1px solid ${tier.borderColor}`,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                {tier.badge}
              </span>
            </div>
          )} */}

          {member.domains && member.domains.length > 0 && member.domains[0] !== 'executive' && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '10px',
              }}
            >
              {member.domains.map((d) => (
                <span
                  key={d}
                  className="mono-tag"
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0, 255, 157, 0.06)',
                    border: '1px solid rgba(0, 255, 157, 0.25)',
                    color: 'var(--text-accent)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {formatDomainName(d)}
                </span>
              ))}
            </div>
          )}

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
              padding: '1.1rem 0',
              borderTop: '1px solid #1e3d28',
              borderBottom: '1px solid #1e3d28',
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'var(--text-accent)',
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
