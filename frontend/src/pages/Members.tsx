import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Award,
  Terminal,
  Palette,
  Search,
  X,
  ArrowRight,
  ArrowUpRight,
  Users,
  Globe,
  Cpu,
  Smartphone,
  Cloud,
  Layers,
  Code2,
  Briefcase,
} from 'lucide-react';
import { fetchMembers } from '../services/api';
import { DomainGroup, PublicMember } from '../types';
import {
  groupMembersByHierarchy,
  getMemberTier,
  HierarchyMember,
  TIER_CONFIGS,
} from '../utils/memberTiers';

// Resolve an icon for the domain, while keeping colors 100% unified with LeetVerse design system
function getDomainMeta(slug: string) {
  const s = slug.toLowerCase();
  let Icon = Layers;

  if (s.includes('web')) {
    Icon = Globe;
  } else if (s.includes('ai') || s.includes('ml') || s.includes('intelligence')) {
    Icon = Cpu;
  } else if (s.includes('app') || s.includes('mobile') || s.includes('ios') || s.includes('android')) {
    Icon = Smartphone;
  } else if (s.includes('design') || s.includes('ui') || s.includes('ux') || s.includes('creative')) {
    Icon = Palette;
  } else if (s.includes('cp') || s.includes('dsa') || s.includes('algo') || s.includes('code')) {
    Icon = Terminal;
  } else if (s.includes('cloud') || s.includes('devops') || s.includes('infra') || s.includes('security')) {
    Icon = Cloud;
  } else if (s.includes('management') || s.includes('pr') || s.includes('event') || s.includes('lead')) {
    Icon = Briefcase;
  }

  return {
    icon: Icon,
  };
}

/**
 * Reusable Member Hierarchy Card with signature tier border, glowing ring, and hints
 * (No top-right blur circle point, clean executive finish)
 */
const MemberCard: React.FC<{
  member: PublicMember | HierarchyMember;
  domainSlug?: string;
  isPresident?: boolean;
}> = ({ member, domainSlug, isPresident = false }) => {
  const tier = (member as HierarchyMember).tier || getMemberTier(member.position, domainSlug);

  return (
    <Link
      to={`/u/${member.username}`}
      className="glass-panel"
      style={{
        padding: isPresident ? 'clamp(26px, 3.5vw, 36px)' : '24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        textDecoration: 'none',
        borderRadius: 'var(--radius-lg)',
        border: `1.5px solid ${tier.borderColor}`,
        boxShadow: `0 14px 34px rgba(0, 0, 0, 0.45), 0 0 22px ${tier.glowColor}`,
        transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)',
        backgroundColor: '#0a1711',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 20px 45px rgba(0, 0, 0, 0.6), 0 0 32px ${tier.glowColor}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = `0 14px 34px rgba(0, 0, 0, 0.45), 0 0 22px ${tier.glowColor}`;
      }}
    >
      {/* Header with Avatar & Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
        {/* Avatar with dynamic tier ring & photo */}
        <div
          style={{
            position: 'relative',
            width: isPresident ? '72px' : '62px',
            height: isPresident ? '72px' : '62px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ambient soft glow around avatar */}
          <div
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${tier.glowColor} 0%, transparent 70%)`,
              filter: 'blur(8px)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: member.photoUrl
                ? `url("${member.photoUrl}") center/cover no-repeat`
                : 'linear-gradient(135deg, #132a1e 0%, #1e4230 100%)',
              border: `2px solid ${tier.ringColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isPresident ? '1.7rem' : '1.4rem',
              fontWeight: 800,
              color: tier.accentColor,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {!member.photoUrl && member.name[0]}
          </div>
        </div>

        {/* Member Name, Position, Badge */}
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              fontSize: isPresident ? 'clamp(1.25rem, 1.6vw, 1.45rem)' : 'clamp(1.1rem, 1.3vw, 1.25rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '4px',
            }}
          >
            {member.name}
          </div>

          <div
            style={{
              fontSize: '0.92rem',
              color: tier.accentColor,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: '6px',
            }}
          >
            {member.position}
          </div>

          {/* Tier Badge */}
          <span
            className="mono-tag"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '2px 8px',
              background: tier.bgSubtle,
              color: tier.accentColor,
              border: `1px solid ${tier.borderColor}`,
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.03em',
            }}
          >
            {isPresident && <Crown size={11} />}
            {tier.badge}
          </span>
        </div>
      </div>

      {/* Bio (if available) */}
      {member.bio && (
        <p
          style={{
            fontSize: '0.925rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
            marginBottom: '18px',
            display: '-webkit-box',
            WebkitLineClamp: isPresident ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {member.bio}
        </p>
      )}

      {/* Card Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <span
          className="mono-tag"
          style={{
            color: 'var(--text-dim)',
            fontSize: '12px',
            transition: 'color var(--transition-fast)',
          }}
        >
          @{member.username}
        </span>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: tier.accentColor,
          }}
        >
          Card <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
};

export const Members: React.FC = () => {
  const [domains, setDomains] = useState<DomainGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State for Domain Members Popup
  const [activeModalDomain, setActiveModalDomain] = useState<DomainGroup | null>(null);

  useEffect(() => {
    fetchMembers()
      .then((data) => {
        setDomains(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load members. Please try again.');
        setLoading(false);
      });
  }, []);

  // Keyboard shortcut listener for Esc to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModalDomain(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (activeModalDomain) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalDomain]);

  // Group all members into hierarchy tiers
  const hierarchy = useMemo(() => {
    return groupMembersByHierarchy(domains);
  }, [domains]);

  // Global search filtering across all members
  const searchedMembers = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    const results: HierarchyMember[] = [];

    domains.forEach((d) => {
      d.members.forEach((m) => {
        if (
          m.name.toLowerCase().includes(query) ||
          m.username.toLowerCase().includes(query) ||
          m.position.toLowerCase().includes(query) ||
          d.name.toLowerCase().includes(query)
        ) {
          if (!results.some((r) => r.username === m.username)) {
            results.push({
              ...m,
              domainSlug: d.slug,
              domainName: d.name,
              tier: getMemberTier(m.position, d.slug),
            });
          }
        }
      });
    });

    return results;
  }, [domains, searchQuery]);

  // Members inside active modal (sorted Leads first, then Asst. Leads, then Members)
  const modalMembers = useMemo(() => {
    if (!activeModalDomain) return [];
    const list = activeModalDomain.members.map((m) => ({
      ...m,
      tier: getMemberTier(m.position, activeModalDomain.slug),
    }));

    list.sort((a, b) => a.tier.rank - b.tier.rank);
    return list;
  }, [activeModalDomain]);

  return (
    <div id="members" style={{ minHeight: '100vh', padding: 'clamp(100px, 14vh, 140px) 0 90px' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: 'clamp(32px, 5vw, 48px)', textAlign: 'center', maxWidth: '820px', margin: '0 auto clamp(32px, 5vw, 48px)' }}>
          <h1 style={{ marginBottom: '14px', letterSpacing: '-0.02em' }}>
            Meet The <span style={{ color: 'var(--accent-primary)' }}>Team</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(1rem, 1.25vw, 1.15rem)', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto 28px' }}>
            The leaders, architects, developers, and visionaries shaping LeetVerse. Explore the leadership hierarchy and domain teams.
          </p>

          {/* Global Search Bar */}
          <div
            style={{
              position: 'relative',
              maxWidth: '480px',
              width: '100%',
              margin: '0 auto',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search members by name, role, domain, or @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 44px 13px 46px',
                backgroundColor: '#0a1711',
                border: '1.5px solid var(--accent-border-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--accent-border-subtle)')}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(0, 255, 157, 0.2)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            Loading members hierarchy...
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: '#ff7373', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            {error}
          </div>
        )}

        {/* Global Search Results View */}
        {!loading && !error && searchedMembers !== null && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem' }}>
                Search Results ({searchedMembers.length})
              </h2>
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to Hierarchy & Domains
              </button>
            </div>

            {searchedMembers.length === 0 ? (
              <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                No members found matching "{searchQuery}".
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 28vw, 340px), 1fr))',
                  gap: '24px',
                }}
              >
                {searchedMembers.map((member) => (
                  <MemberCard key={member.username} member={member} domainSlug={member.domainSlug} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Normal Hierarchy & Domain View */}
        {!loading && !error && searchedMembers === null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
            {/* 1. PRESIDENT TIER */}
            {hierarchy.presidents.length > 0 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span
                    className="mono-tag"
                    style={{
                      padding: '4px 14px',
                      background: TIER_CONFIGS.president.bgSubtle,
                      color: TIER_CONFIGS.president.accentColor,
                      border: `1px solid ${TIER_CONFIGS.president.borderColor}`,
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Crown size={14} /> PRESIDENT
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    maxWidth: '520px',
                    margin: '0 auto',
                  }}
                >
                  {hierarchy.presidents.map((pres) => (
                    <div key={pres.username} style={{ width: '100%' }}>
                      <MemberCard member={pres} isPresident={true} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. VICE-PRESIDENTS TIER */}
            {hierarchy.vicePresidents.length > 0 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <span
                    className="mono-tag"
                    style={{
                      padding: '4px 14px',
                      background: TIER_CONFIGS['vice-president'].bgSubtle,
                      color: TIER_CONFIGS['vice-president'].accentColor,
                      border: `1px solid ${TIER_CONFIGS['vice-president'].borderColor}`,
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Award size={14} /> VICE PRESIDENTS
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: hierarchy.vicePresidents.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
                    justifyContent: 'center',
                    gap: '24px',
                    maxWidth: hierarchy.vicePresidents.length === 1 ? '460px' : '880px',
                    margin: '0 auto',
                  }}
                >
                  {hierarchy.vicePresidents.map((vp) => (
                    <MemberCard key={vp.username} member={vp} />
                  ))}
                </div>
              </div>
            )}

            {/* 3. TECH LEADS TIER (Society Tech Leadership) */}
            {hierarchy.techLeads.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid rgba(0, 255, 157, 0.15)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Code2 size={22} color={TIER_CONFIGS['tech-lead'].accentColor} />
                    <h2 style={{ fontSize: 'clamp(1.3rem, 2vw, 1.6rem)' }}>Tech Leads</h2>
                  </div>
                  <span
                    className="mono-tag"
                    style={{
                      padding: '4px 10px',
                      background: TIER_CONFIGS['tech-lead'].bgSubtle,
                      color: TIER_CONFIGS['tech-lead'].accentColor,
                      border: `1px solid ${TIER_CONFIGS['tech-lead'].borderColor}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    {hierarchy.techLeads.length} {hierarchy.techLeads.length === 1 ? 'Lead' : 'Leads'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 26vw, 340px), 1fr))',
                    gap: '24px',
                  }}
                >
                  {hierarchy.techLeads.map((lead) => (
                    <MemberCard key={lead.username} member={lead} domainSlug={lead.domainSlug} />
                  ))}
                </div>
              </div>
            )}

            {/* 4. NON-TECH LEADS TIER (Society Non-Tech Leadership) */}
            {hierarchy.nonTechLeads.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid rgba(244, 63, 94, 0.2)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Palette size={22} color={TIER_CONFIGS['non-tech-lead'].accentColor} />
                    <h2 style={{ fontSize: 'clamp(1.3rem, 2vw, 1.6rem)' }}>Non-Tech Leads</h2>
                  </div>
                  <span
                    className="mono-tag"
                    style={{
                      padding: '4px 10px',
                      background: TIER_CONFIGS['non-tech-lead'].bgSubtle,
                      color: TIER_CONFIGS['non-tech-lead'].accentColor,
                      border: `1px solid ${TIER_CONFIGS['non-tech-lead'].borderColor}`,
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    {hierarchy.nonTechLeads.length} {hierarchy.nonTechLeads.length === 1 ? 'Lead' : 'Leads'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 26vw, 340px), 1fr))',
                    gap: '24px',
                  }}
                >
                  {hierarchy.nonTechLeads.map((lead) => (
                    <MemberCard key={lead.username} member={lead} domainSlug={lead.domainSlug} />
                  ))}
                </div>
              </div>
            )}

            {/* 5. DOMAIN CARDS (Unified LeetVerse Styling - Scalable for Future Domains) */}
            <div style={{ paddingTop: '20px' }}>
              <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(0, 255, 157, 0.08)',
                    border: '1px solid var(--accent-border-subtle)',
                    marginBottom: '12px',
                  }}
                >
                  <Users size={14} color="var(--accent-primary)" />
                  <span className="mono-tag" style={{ color: 'var(--accent-primary)', fontSize: '12px' }}>
                    EXPLORE DOMAINS & TEAMS
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', marginBottom: '8px' }}>
                  Domains & Specializations
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
                  Click any domain card to view all team members, domain leads, and profiles.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(300px, 30vw, 380px), 1fr))',
                  gap: '28px',
                }}
              >
                {hierarchy.domainGroups.map((domain) => {
                  const meta = getDomainMeta(domain.slug);
                  const Icon = meta.icon;

                  // Find Domain Lead and Assistant Lead within this domain
                  const lead = domain.members.find((m) => {
                    const p = m.position.toLowerCase();
                    return p.includes('lead') && !p.includes('asst') && !p.includes('assistant');
                  });
                  const asstLead = domain.members.find((m) => {
                    const p = m.position.toLowerCase();
                    return p.includes('asst') || p.includes('assistant');
                  });

                  return (
                    <div
                      key={domain.slug}
                      onClick={() => setActiveModalDomain(domain)}
                      className="glass-panel"
                      style={{
                        padding: '28px',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '1px solid rgba(0, 255, 157, 0.14)',
                        backgroundColor: '#0a1711',
                        transition: 'all var(--transition-smooth)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.boxShadow = '0 18px 40px rgba(0, 0, 0, 0.6), 0 0 24px rgba(0, 255, 157, 0.16)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'rgba(0, 255, 157, 0.14)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Top Row: Icon & Count */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div
                          style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: 'rgba(0, 255, 157, 0.08)',
                            border: '1px solid rgba(0, 255, 157, 0.22)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)',
                          }}
                        >
                          <Icon size={24} />
                        </div>

                        <span
                          className="mono-tag"
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(0, 255, 157, 0.08)',
                            color: 'var(--accent-primary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: '1px solid rgba(0, 255, 157, 0.2)',
                          }}
                        >
                          {domain.members.length} {domain.members.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      {/* Domain Title */}
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {domain.name}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.55 }}>
                          Explore projects, team members, and development initiatives in {domain.name}.
                        </p>
                      </div>

                      {/* Lead / Asst Lead preview pills */}
                      {/* {(lead || asstLead) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px', padding: '10px 12px', background: 'rgba(0, 0, 0, 0.35)', borderRadius: '8px', border: '1px solid rgba(0, 255, 157, 0.1)' }}>
                          {lead && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '11px', fontFamily: 'var(--font-mono)' }}>LEAD:</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{lead.name}</span>
                            </div>
                          )}
                          {asstLead && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                              <span style={{ color: '#4ff2ae', fontWeight: 700, fontSize: '11px', fontFamily: 'var(--font-mono)' }}>ASST:</span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{asstLead.name}</span>
                            </div>
                          )}
                        </div>
                      )} */}

                      {/* Bottom Row: Stacked Avatars & View Team CTA */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '16px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {/* Stacked Preview Avatars */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {domain.members.slice(0, 4).map((m, idx) => (
                            <div
                              key={m.username}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: m.photoUrl
                                  ? `url("${m.photoUrl}") center/cover no-repeat`
                                  : 'linear-gradient(135deg, #132a1e 0%, #1e4230 100%)',
                                border: '2px solid #060d0a',
                                marginLeft: idx === 0 ? 0 : '-10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: 'var(--text-accent)',
                              }}
                            >
                              {!m.photoUrl && m.name[0]}
                            </div>
                          ))}
                          {domain.members.length > 4 && (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#112219',
                                border: '2px solid #060d0a',
                                marginLeft: '-10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: 'var(--text-muted)',
                              }}
                            >
                              +{domain.members.length - 4}
                            </div>
                          )}
                        </div>

                        {/* View Members Button */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--accent-primary)',
                            fontSize: '0.925rem',
                            fontWeight: 700,
                          }}
                        >
                          View Team <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DOMAIN MEMBERS POPUP MODAL (Direct, Clean, No Inner Search) */}
      {activeModalDomain && (
        <div
          onClick={() => setActiveModalDomain(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(4, 9, 6, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(16px, 3vw, 36px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#09150f',
              border: '1.5px solid rgba(0, 255, 157, 0.25)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: 'min(92vw, 860px)',
              width: '100%',
              maxHeight: 'min(84vh, 760px)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 255, 157, 0.12)',
              overflow: 'hidden',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: 'clamp(20px, 3vw, 28px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(13, 31, 22, 0.65)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'rgba(0, 255, 157, 0.08)',
                    border: '1px solid rgba(0, 255, 157, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {React.createElement(getDomainMeta(activeModalDomain.slug).icon, { size: 26 })}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: 'clamp(1.3rem, 2vw, 1.7rem)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {activeModalDomain.name}
                    </h2>
                    <span
                      className="mono-tag"
                      style={{
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(0, 255, 157, 0.08)',
                        color: 'var(--accent-primary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid rgba(0, 255, 157, 0.2)',
                      }}
                    >
                      {activeModalDomain.members.length} members
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                    Domain team members and contributions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalDomain(null)}
                title="Close (Esc)"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Direct Grid of Domain Members */}
            <div
              style={{
                padding: 'clamp(20px, 3vw, 28px)',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(250px, 24vw, 280px), 1fr))',
                gap: '20px',
                flex: 1,
              }}
            >
              {modalMembers.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No members currently listed in {activeModalDomain.name}.
                </div>
              ) : (
                modalMembers.map((member) => (
                  <MemberCard
                    key={member.username}
                    member={member}
                    domainSlug={activeModalDomain.slug}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Animation Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
