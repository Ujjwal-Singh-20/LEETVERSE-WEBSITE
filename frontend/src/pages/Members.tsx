import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Github, Linkedin, Instagram, ArrowRight, User } from 'lucide-react';
import { fetchMembers } from '../services/api';
import { DomainGroup, PublicMember } from '../types';

export const Members: React.FC = () => {
  const [domains, setDomains] = useState<DomainGroup[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers()
      .then((data) => {
        setDomains(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Unable to load members. Please try again.');
        setLoading(false);
      });
  }, []);

  // Filter members by domain and search query
  const filteredDomains = domains
    .filter((d: DomainGroup) => selectedDomain === 'all' || d.slug === selectedDomain)
    .map((d: DomainGroup) => ({
      ...d,
      members: d.members.filter((m: PublicMember) => {
        const matchesSearch =
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.position.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      }),
    }))
    .filter((d) => d.members.length > 0);

  const totalMembers = domains.reduce((acc, d) => acc + d.members.length, 0);

  return (
    <div id="members" style={{ minHeight: '100vh', padding: 'clamp(100px, 14vh, 140px) 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'clamp(24px, 4vw, 36px)' }}>
          <h1>Members</h1>
        </div>

        {/* Controls: Domain Tabs & Search */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
            borderBottom: '1px solid rgba(0, 255, 157, 0.12)',
            paddingBottom: '20px',
          }}
        >
          {/* Domain Tabs with responsive horizontal scroll */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              maxWidth: '100%',
              paddingBottom: '4px',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <button
              onClick={() => setSelectedDomain('all')}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
                fontWeight: selectedDomain === 'all' ? 700 : 500,
                background: selectedDomain === 'all' ? 'var(--accent-primary)' : 'rgba(13, 31, 22, 0.65)',
                color: selectedDomain === 'all' ? '#060d0a' : 'var(--text-primary)',
                border: selectedDomain === 'all' ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all var(--transition-fast)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              All Domains ({totalMembers})
            </button>
            {domains.map((d) => (
              <button
                key={d.slug}
                onClick={() => setSelectedDomain(d.slug)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'clamp(0.9rem, 1.1vw, 1rem)',
                  fontWeight: selectedDomain === d.slug ? 700 : 500,
                  background: selectedDomain === d.slug ? 'var(--accent-primary)' : 'rgba(13, 31, 22, 0.65)',
                  color: selectedDomain === d.slug ? '#060d0a' : 'var(--text-primary)',
                  border: selectedDomain === d.slug ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {d.name} ({d.members.length})
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '320px',
            }}
          >
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                background: '#0a1711',
                border: '1px solid var(--accent-border-subtle)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Loading members...
          </div>
        )}

        {error && (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: '#ff7373', fontSize: '1.1rem' }}>
            {error}
          </div>
        )}

        {/* Member Grid grouped by Domain */}
        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
            {filteredDomains.length === 0 ? (
              <div
                className="glass-panel"
                style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                No members found matching your search.
              </div>
            ) : (
              filteredDomains.map((domain) => (
                <div key={domain.slug}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '24px',
                    }}
                  >
                    <h2>{domain.name}</h2>
                    <span
                      className="mono-tag"
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(0, 255, 157, 0.12)',
                        color: 'var(--accent-primary)',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    >
                      {domain.members.length} {domain.members.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 28vw, 360px), 1fr))',
                      gap: '24px',
                    }}
                  >
                    {domain.members.map((member: PublicMember) => (
                      <Link
                        key={member.username}
                        to={`/u/${member.username}`}
                        className="glass-panel"
                        style={{
                          padding: '24px',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          textDecoration: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                          <div
                            style={{
                              width: '58px',
                              height: '58px',
                              borderRadius: '50%',
                              flexShrink: 0,
                              background: member.photoUrl
                                ? `url("${member.photoUrl}") center/cover no-repeat`
                                : 'linear-gradient(135deg, #132a1e 0%, #1e4230 100%)',
                              border: '1.5px solid var(--accent-border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.3rem',
                              fontWeight: 700,
                              color: 'var(--text-accent)',
                            }}
                          >
                            {!member.photoUrl && member.name[0]}
                          </div>

                          <div style={{ overflow: 'hidden' }}>
                            <div
                              style={{
                                fontSize: 'clamp(1.15rem, 1.4vw, 1.3rem)',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {member.name}
                            </div>
                            <div
                              style={{
                                fontSize: '0.95rem',
                                color: 'var(--accent-primary)',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {member.position}
                            </div>
                          </div>
                        </div>

                        {/* Bio (if present) */}
                        {member.bio && (
                          <p
                            style={{
                              fontSize: '0.975rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.6,
                              marginBottom: '18px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              flex: 1,
                            }}
                          >
                            {member.bio}
                          </p>
                        )}

                        {/* Card Footer: View Card Link */}
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
                            style={{ color: 'var(--accent-primary)', fontSize: '12px' }}
                          >
                            @{member.username}
                          </span>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: 'var(--text-accent)',
                            }}
                          >
                            Profile <ArrowRight size={14} />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
