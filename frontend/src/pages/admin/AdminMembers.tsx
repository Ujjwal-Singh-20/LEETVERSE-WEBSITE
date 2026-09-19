import React, { useEffect, useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  Check,
  AlertCircle,
  ExternalLink,
  Search,
  Crown,
  ShieldCheck,
  Github,
  Linkedin,
  Instagram,
} from 'lucide-react';
import {
  fetchAdminMemberTree,
  checkUsernameAvailable,
  createAdminMember,
  updateAdminMemberField,
  deleteAdminMember,
  uploadSingleFile,
} from '../../services/api';
import { DomainTreeNode, AdminMember } from '../../types';
import { STANDARD_POSITIONS, formatDomainName } from '../../utils/memberTiers';

export const PRESET_DOMAINS = [
  { slug: 'graphic-design', label: 'GRAPHIC DESIGN' },
  { slug: 'marketing-pr', label: 'MARKETING AND PR' },
  { slug: 'cloud', label: 'CLOUD' },
  { slug: 'video-editing', label: 'VIDEO EDITING' },
  { slug: 'web-dev', label: 'WEB DEV' },
  { slug: 'app-dev', label: 'APP DEV' },
  { slug: 'data-science', label: 'DATA SCIENCE AND DATA ANALYTICS' },
  { slug: 'ai-ml', label: 'AI/ML' },
  { slug: 'cp-dsa', label: 'COMPETITIVE PROGRAMMING' },
];

export type RoleLevel =
  | 'PRESIDENT'
  | 'VICE PRESIDENT'
  | 'GENERAL SECRETARY'
  | 'LEAD'
  | 'ASST LEAD'
  | 'MEMBER';

export const isExecutiveRole = (role: RoleLevel) =>
  role === 'PRESIDENT' ||
  role === 'VICE PRESIDENT' ||
  role === 'GENERAL SECRETARY';

export const AdminMembers: React.FC = () => {
  const [tree, setTree] = useState<DomainTreeNode[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeEditingMember, setActiveEditingMember] = useState<AdminMember | null>(null);
  const [customPositionMode, setCustomPositionMode] = useState<boolean>(false);

  // Modal State for adding a member
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<RoleLevel>('MEMBER');
  const [addFormDomains, setAddFormDomains] = useState<string[]>(['web-dev']);
  const [customDomainList, setCustomDomainList] = useState<string[]>([]);
  const [newDomainInput, setNewDomainInput] = useState<string>('');
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    position: 'Core Member',
    status: 'active' as 'active' | 'alumni',
    bio: '',
    rollNo: '',
    photoUrl: '',
    instagram: '',
    linkedin: '',
    github: '',
  });

  // Dynamically combine preset domains with any existing domains in the database and custom additions
  const availableDomains = useMemo(() => {
    const map = new Map<string, string>();
    PRESET_DOMAINS.forEach((d) => map.set(d.slug, d.label));
    tree.forEach((t) => {
      if (t.slug !== 'executive' && !map.has(t.slug)) {
        map.set(t.slug, formatDomainName(t.name || t.slug));
      }
    });
    customDomainList.forEach((c) => {
      if (!map.has(c)) {
        map.set(c, formatDomainName(c));
      }
    });
    return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
  }, [tree, customDomainList]);

  const handleRoleChange = (role: RoleLevel) => {
    setSelectedRole(role);
    let targetDomains = addFormDomains;
    if (isExecutiveRole(role)) {
      targetDomains = ['executive'];
      setAddFormDomains(['executive']);
    } else if (addFormDomains.includes('executive')) {
      targetDomains = ['web-dev'];
      setAddFormDomains(['web-dev']);
    }

    const firstDomain = targetDomains[0] || 'web-dev';
    const domainLabel = availableDomains.find((d) => d.slug === firstDomain)?.label || 'DOMAIN';

    if (role === 'PRESIDENT') {
      setAddForm((prev) => ({ ...prev, position: 'President' }));
    } else if (role === 'VICE PRESIDENT') {
      setAddForm((prev) => ({ ...prev, position: 'Vice President' }));
    } else if (role === 'GENERAL SECRETARY') {
      setAddForm((prev) => ({ ...prev, position: 'General Secretary' }));
    } else if (role === 'LEAD') {
      setAddForm((prev) => ({ ...prev, position: `${domainLabel} Lead` }));
    } else if (role === 'ASST LEAD') {
      setAddForm((prev) => ({ ...prev, position: `Asst. ${domainLabel} Lead` }));
    } else {
      setAddForm((prev) => ({ ...prev, position: 'Core Member' }));
    }
  };

  const toggleAddFormDomain = (slug: string) => {
    setAddFormDomains((prev) => {
      if (prev.includes(slug)) {
        if (prev.length <= 1) return prev; // Keep at least one domain
        return prev.filter((d) => d !== slug);
      } else {
        return [...prev, slug];
      }
    });
  };

  const handleAddCustomDomain = () => {
    const slug = newDomainInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) return;
    if (!customDomainList.includes(slug)) {
      setCustomDomainList((prev) => [...prev, slug]);
    }
    if (!addFormDomains.includes(slug)) {
      setAddFormDomains((prev) => [...prev, slug]);
    }
    setNewDomainInput('');
  };

  // Username validation state
  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: '' });

  // Uploading state
  const [uploading, setUploading] = useState<boolean>(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const loadTree = async () => {
    try {
      const data = await fetchAdminMemberTree();
      setTree(data);
      // Auto expand all domains initially
      const initExpanded: Record<string, boolean> = {};
      data.forEach((d) => (initExpanded[d.slug] = true));
      setExpandedDomains(initExpanded);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load member tree.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, []);

  const toggleDomain = (slug: string) => {
    setExpandedDomains((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Live username availability check on type
  const handleUsernameChange = async (usernameVal: string) => {
    const formatted = usernameVal.toLowerCase().replace(/\s+/g, '-');
    setAddForm((prev) => ({ ...prev, username: formatted }));

    if (formatted.length < 2) {
      setUsernameCheck({ checking: false, available: null, message: 'Must be at least 2 characters' });
      return;
    }

    setUsernameCheck({ checking: true, available: null, message: 'Checking availability...' });
    try {
      const res = await checkUsernameAvailable(formatted);
      if (res.available) {
        setUsernameCheck({ checking: false, available: true, message: 'Username is available!' });
      } else {
        setUsernameCheck({ checking: false, available: false, message: 'Username is already taken' });
      }
    } catch {
      setUsernameCheck({ checking: false, available: null, message: 'Could not verify username' });
    }
  };

  // File upload for new member photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadSingleFile(file, 'members');
      if (isEditing && activeEditingMember) {
        await handleFieldBlur('photoUrl', res.url);
        setActiveEditingMember((prev) => prev ? { ...prev, photoUrl: res.url } : null);
      } else {
        setAddForm((prev) => ({ ...prev, photoUrl: res.url }));
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Submit new member
  const handleCreateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isExec = isExecutiveRole(selectedRole);
    const finalDomains = isExec ? ['executive'] : (addFormDomains.length > 0 ? addFormDomains : ['ai-ml']);
    const primaryDomain = finalDomains[0];

    if (!primaryDomain) {
      alert('Please select or specify at least one domain.');
      return;
    }

    if (usernameCheck.available === false) {
      alert('Please choose an available username.');
      return;
    }

    const finalPosition = addForm.position.trim();
    if (!finalPosition) {
      alert('Please enter a position/title.');
      return;
    }

    try {
      await createAdminMember({
        domain: primaryDomain,
        domains: finalDomains,
        name: addForm.name,
        username: addForm.username,
        position: finalPosition,
        status: addForm.status,
        bio: addForm.bio || '',
        rollNo: addForm.rollNo,
        photoUrl: addForm.photoUrl || null,
        instagram: addForm.instagram || null,
        linkedin: addForm.linkedin || null,
        github: addForm.github || null,
      });

      setIsAddModalOpen(false);
      // Reset form
      setAddForm({
        name: '',
        username: '',
        position: 'Core Member',
        status: 'active',
        bio: '',
        rollNo: '',
        photoUrl: '',
        instagram: '',
        linkedin: '',
        github: '',
      });
      setSelectedRole('MEMBER');
      setAddFormDomains(['ai-ml']);
      setNewDomainInput('');
      setUsernameCheck({ checking: false, available: null, message: '' });
      await loadTree();
    } catch (err: any) {
      alert(`Error creating member: ${err.message}`);
    }
  };

  // Autosave on blur for active editing member
  const handleFieldBlur = async (field: string, value: any) => {
    if (!activeEditingMember) return;
    setAutosaveStatus('Saving...');
    try {
      await updateAdminMemberField(
        activeEditingMember.domain,
        activeEditingMember.docId,
        field,
        value
      );
      setAutosaveStatus('Saved');
      setTimeout(() => setAutosaveStatus(''), 2000);
      // Update local tree
      setTree((prev) =>
        prev.map((d) =>
          d.slug === activeEditingMember.domain
            ? {
                ...d,
                members: d.members.map((m) =>
                  m.docId === activeEditingMember.docId ? { ...m, [field]: value } : m
                ),
              }
            : d
        )
      );
    } catch (err: any) {
      setAutosaveStatus('Error saving');
      alert(`Autosave failed: ${err.message}`);
    }
  };

  // Hard delete member
  const handleDeleteMember = async (domain: string, docId: string, name: string, username: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}" (@${username})?\n\nWARNING: This action is permanent and will delete their public digital business card (/u/${username}) and release the username in the database lookup index.`
    );
    if (!confirmed) return;

    try {
      await deleteAdminMember(domain, docId);
      if (activeEditingMember?.docId === docId) {
        setActiveEditingMember(null);
      }
      await loadTree();
    } catch (err: any) {
      alert(`Failed to delete member: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f0f7f3', marginBottom: '4px' }}>
            Domain & Members Hierarchy
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#7a9e8b' }}>
            Interactive domain tree with single-field autosave on blur.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedRole('MEMBER');
            setAddFormDomains(['ai-ml']);
            setNewDomainInput('');
            setAddForm({
              name: '',
              username: '',
              position: 'Core Member',
              status: 'active',
              bio: '',
              rollNo: '',
              photoUrl: '',
              instagram: '',
              linkedin: '',
              github: '',
            });
            setUsernameCheck({ checking: false, available: null, message: '' });
            setIsAddModalOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '6px',
            backgroundColor: '#1b472e',
            border: '1px solid #2d734b',
            color: '#baffdd',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      {loading && <div style={{ padding: '40px', color: '#7a9e8b' }}>Loading tree structure...</div>}

      {/* Main Two-Column View: Tree on Left, Active Editor on Right */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: activeEditingMember ? '1fr 1fr' : '1fr', gap: '24px' }}>
          {/* Left Column: Domain Tree */}
          <div
            style={{
              backgroundColor: '#0a1711',
              border: '1px solid #163324',
              borderRadius: '8px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#567564', letterSpacing: '0.05em', marginBottom: '16px' }}>
              Tree View ({tree.length} domains)
            </div>

            {tree.length === 0 ? (
              <div style={{ color: '#7a9e8b', fontSize: '0.9rem' }}>No members or domains found. Click "Add Member" to create the first domain!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tree.map((domain) => {
                  const isExpanded = expandedDomains[domain.slug];
                  return (
                    <div
                      key={domain.slug}
                      style={{
                        border: '1px solid #14291d',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#07120c',
                      }}
                    >
                      {/* Domain Header Row */}
                      <div
                        onClick={() => toggleDomain(domain.slug)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          backgroundColor: '#0a1a11',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#e6ede8' }}>
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span>{formatDomainName(domain.name || domain.slug)}</span>
                          <span style={{ fontSize: '0.75rem', color: '#5b826d', fontFamily: 'var(--font-mono)' }}>
                            ({domain.slug})
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#11291c',
                            color: '#3dffa0',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {domain.members.length} members
                        </span>
                      </div>

                      {/* Nested Members List */}
                      {isExpanded && (
                        <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {domain.members.length === 0 ? (
                            <div style={{ padding: '8px 12px', color: '#567564', fontSize: '0.85rem' }}>
                              No members in this domain.
                            </div>
                          ) : (
                            domain.members.map((member) => {
                              const isSelected = activeEditingMember?.docId === member.docId;
                              return (
                                <div
                                  key={member.docId}
                                  onClick={() => {
                                    setActiveEditingMember(member);
                                    setCustomPositionMode(false);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    backgroundColor: isSelected ? '#143021' : '#0a1711',
                                    border: isSelected ? '1px solid #286641' : '1px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: '#163324',
                                        background: member.photoUrl ? `url("${member.photoUrl}") center/cover` : '#163324',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        color: '#3dffa0',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {!member.photoUrl && member.name[0]}
                                    </div>

                                    <div>
                                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f7f3' }}>
                                        {member.name}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: '#7a9e8b' }}>
                                        {member.position} &bull; <span style={{ fontFamily: 'var(--font-mono)' }}>@{member.username}</span>
                                      </div>
                                      {member.domains && member.domains.length > 1 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '3px' }}>
                                          {member.domains.map((d) => (
                                            <span
                                              key={d}
                                              style={{
                                                fontSize: '0.65rem',
                                                padding: '1px 5px',
                                                borderRadius: '3px',
                                                background: 'rgba(0, 255, 157, 0.08)',
                                                border: '1px solid rgba(0, 255, 157, 0.25)',
                                                color: '#3dffa0',
                                                fontFamily: 'var(--font-mono)',
                                                textTransform: 'uppercase',
                                              }}
                                            >
                                              {formatDomainName(d)}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {(member.github || member.linkedin || member.instagram) && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#5b826d' }}>
                                        {member.github && <Github size={12} />}
                                        {member.linkedin && <Linkedin size={12} />}
                                        {member.instagram && <Instagram size={12} />}
                                      </div>
                                    )}
                                    <span
                                      style={{
                                        fontSize: '0.75rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: member.status === 'active' ? '#10301f' : '#2b2314',
                                        color: member.status === 'active' ? '#3dffa0' : '#e6b158',
                                        fontFamily: 'var(--font-mono)',
                                      }}
                                    >
                                      {member.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Member Inspector & Autosave Fields */}
          {activeEditingMember && (
            <div
              style={{
                backgroundColor: '#0a1711',
                border: '1px solid #1e4731',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#567564', letterSpacing: '0.05em' }}>
                    Member Inspector
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f0f7f3' }}>
                    {activeEditingMember.name}
                  </h2>
                  <div style={{ fontSize: '0.8rem', color: '#7a9e8b', fontFamily: 'var(--font-mono)' }}>
                    Domain: {activeEditingMember.domain} | Doc ID: {activeEditingMember.docId}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {autosaveStatus && (
                    <span style={{ fontSize: '0.75rem', color: '#3dffa0', fontFamily: 'var(--font-mono)' }}>
                      {autosaveStatus}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteMember(activeEditingMember.domain, activeEditingMember.docId, activeEditingMember.name, activeEditingMember.username)}
                    title="Delete member"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255, 75, 75, 0.1)',
                      border: '1px solid rgba(255, 75, 75, 0.3)',
                      color: '#ff6b6b',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

              {/* Editable Fields Form (Autosaves on Blur) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Photo Upload & Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: activeEditingMember.photoUrl ? `url("${activeEditingMember.photoUrl}") center/cover` : '#163324',
                      border: '2px solid #235238',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3dffa0',
                      fontSize: '1.2rem',
                    }}
                  >
                    {!activeEditingMember.photoUrl && activeEditingMember.name[0]}
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        backgroundColor: '#11291c',
                        border: '1px solid #1c4a31',
                        color: '#baffdd',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Upload size={13} /> {uploading ? 'Uploading...' : 'Replace Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, true)}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    defaultValue={activeEditingMember.name}
                    onBlur={(e) => handleFieldBlur('name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                {/* Position & Status Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#7a9e8b' }}>Position</label>
                      <button
                        type="button"
                        onClick={() => setCustomPositionMode(!customPositionMode)}
                        style={{
                          fontSize: '0.72rem',
                          color: '#3dffa0',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                      >
                        {customPositionMode ? 'Preset List' : 'Type Custom'}
                      </button>
                    </div>

                    {customPositionMode ? (
                      <input
                        type="text"
                        value={activeEditingMember.position}
                        onChange={(e) => setActiveEditingMember({ ...activeEditingMember, position: e.target.value })}
                        onBlur={(e) => handleFieldBlur('position', e.target.value)}
                        placeholder="e.g. Lead Researcher"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: '#07120c',
                          border: '1px solid #163324',
                          borderRadius: '6px',
                          color: '#f0f7f3',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <select
                        value={activeEditingMember.position}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__custom__') {
                            setCustomPositionMode(true);
                            return;
                          }
                          handleFieldBlur('position', val);
                          setActiveEditingMember({ ...activeEditingMember, position: val });
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          backgroundColor: '#07120c',
                          border: '1px solid #163324',
                          borderRadius: '6px',
                          color: '#f0f7f3',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      >
                        {STANDARD_POSITIONS.map((group) => (
                          <optgroup key={group.category} label={group.category}>
                            {group.positions.map((pos) => (
                              <option key={pos} value={pos}>
                                {pos}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                        {!STANDARD_POSITIONS.some((g) => g.positions.includes(activeEditingMember.position)) && (
                          <option value={activeEditingMember.position}>
                            {activeEditingMember.position} (Current)
                          </option>
                        )}
                        <option value="__custom__">+ Type Custom Position...</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Status</label>
                    <select
                      defaultValue={activeEditingMember.status}
                      onChange={(e) => handleFieldBlur('status', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#07120c',
                        border: '1px solid #163324',
                        borderRadius: '6px',
                        color: '#f0f7f3',
                        fontSize: '0.9rem',
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="alumni">Alumni</option>
                    </select>
                  </div>
                </div>

                {/* Assigned Domains (For non-executive members) */}
                {activeEditingMember.domain !== 'executive' && (
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#07120c',
                      borderRadius: '6px',
                      border: '1px solid #163324',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#7a9e8b' }}>
                        Assigned Domains (Can belong to multiple)
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#567564' }}>
                        Auto-saves
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {availableDomains.map((d) => {
                        const currentDomains =
                          activeEditingMember.domains && activeEditingMember.domains.length > 0
                            ? activeEditingMember.domains
                            : [activeEditingMember.domain];
                        const isAssigned = currentDomains.includes(d.slug);

                        return (
                          <button
                            key={d.slug}
                            type="button"
                            onClick={async () => {
                              let nextDomains: string[];
                              if (isAssigned) {
                                if (currentDomains.length <= 1) {
                                  alert('A member must belong to at least one domain.');
                                  return;
                                }
                                nextDomains = currentDomains.filter((s) => s !== d.slug);
                              } else {
                                nextDomains = [...currentDomains, d.slug];
                              }
                              setActiveEditingMember((prev) => (prev ? { ...prev, domains: nextDomains } : null));
                              await handleFieldBlur('domains', nextDomains);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 10px',
                              borderRadius: '5px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              backgroundColor: isAssigned ? 'rgba(0, 255, 157, 0.12)' : 'transparent',
                              border: isAssigned ? '1px solid #00ff9d' : '1px solid #1c4a31',
                              color: isAssigned ? '#00ff9d' : '#5f806e',
                            }}
                          >
                            {isAssigned && <Check size={12} />}
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Roll No (Admin only) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                    Roll No (University ID &bull; Admin Only)
                  </label>
                  <input
                    type="text"
                    defaultValue={activeEditingMember.rollNo}
                    onBlur={(e) => handleFieldBlur('rollNo', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                      fontSize: '0.9rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Bio</label>
                  <textarea
                    defaultValue={activeEditingMember.bio || ''}
                    rows={3}
                    onBlur={(e) => handleFieldBlur('bio', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                      fontSize: '0.9rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Social Links */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>GitHub URL</label>
                  <input
                    type="text"
                    defaultValue={activeEditingMember.github || ''}
                    onBlur={(e) => handleFieldBlur('github', e.target.value || null)}
                    placeholder="https://github.com/..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>LinkedIn URL</label>
                  <input
                    type="text"
                    defaultValue={activeEditingMember.linkedin || ''}
                    onBlur={(e) => handleFieldBlur('linkedin', e.target.value || null)}
                    placeholder="https://linkedin.com/in/..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Instagram URL</label>
                  <input
                    type="text"
                    defaultValue={activeEditingMember.instagram || ''}
                    onBlur={(e) => handleFieldBlur('instagram', e.target.value || null)}
                    placeholder="https://instagram.com/..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#567564' }}>
                  Changes are saved automatically when clicking outside any field.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0a1711',
              border: '1px solid #1c4a31',
              borderRadius: '10px',
              padding: '28px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f0f7f3', marginBottom: '16px' }}>
              Add New Member to Society
            </h2>

            <form onSubmit={handleCreateMemberSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Step 1: Position / Role */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3dffa0', marginBottom: '6px' }}>
                  Position / Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as RoleLevel)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: '#07120c',
                    border: '1px solid #1c4a31',
                    borderRadius: '6px',
                    color: '#f0f7f3',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontWeight: 600,
                  }}
                >
                  <option value="PRESIDENT">PRESIDENT</option>
                  <option value="VICE PRESIDENT">VICE PRESIDENT</option>
                  <option value="GENERAL SECRETARY">GENERAL SECRETARY</option>
                  <option value="LEAD">LEAD</option>
                  <option value="ASST LEAD">ASST LEAD</option>
                  <option value="MEMBER">MEMBER</option>
                </select>
              </div>

              {/* Step 2: Domain Selection (Shown only if not Executive) */}
              {isExecutiveRole(selectedRole) ? (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fbbf24',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Crown size={16} color="#f59e0b" />
                  <span>
                    Executive role selected ({selectedRole}): Domain is automatically assigned as <strong>Executive</strong> (under President, Vice President & General Secretary).
                  </span>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#3dffa0', marginBottom: '8px' }}>
                    Assigned Domains (Select one or more) *
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {availableDomains.map((d) => {
                      const isSelected = addFormDomains.includes(d.slug);
                      return (
                        <button
                          key={d.slug}
                          type="button"
                          onClick={() => toggleAddFormDomain(d.slug)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            backgroundColor: isSelected ? 'rgba(0, 255, 157, 0.15)' : '#07120c',
                            border: isSelected ? '1px solid #00ff9d' : '1px solid #163324',
                            color: isSelected ? '#00ff9d' : '#7a9e8b',
                          }}
                        >
                          {isSelected && <Check size={13} />}
                          {d.label}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Add custom domain (e.g. CYBERSECURITY)..."
                      value={newDomainInput}
                      onChange={(e) => setNewDomainInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomDomain();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        backgroundColor: '#07120c',
                        border: '1px solid #1c4a31',
                        borderRadius: '6px',
                        color: '#f0f7f3',
                        fontSize: '0.82rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDomain}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#11291c',
                        border: '1px solid #1c4a31',
                        color: '#3dffa0',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Member Name & Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.position}
                    onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                    placeholder="e.g. AI/ML Lead"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                    }}
                  />
                </div>
              </div>

              {/* Username with Live Check */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                  Username (for /u/:username)
                </label>
                <input
                  type="text"
                  required
                  value={addForm.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="aditya-s"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#07120c',
                    border: '1px solid #163324',
                    borderRadius: '6px',
                    color: '#f0f7f3',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
                {usernameCheck.message && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      marginTop: '4px',
                      color: usernameCheck.available ? '#3dffa0' : usernameCheck.available === false ? '#ff6b6b' : '#7a9e8b',
                    }}
                  >
                    {usernameCheck.message}
                  </div>
                )}
              </div>

              {/* Roll No & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Roll No</label>
                  <input
                    type="text"
                    required
                    value={addForm.rollNo}
                    onChange={(e) => setAddForm({ ...addForm, rollNo: e.target.value })}
                    placeholder="21CS045"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                  Profile Photo (Optional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '4px',
                      backgroundColor: '#11291c',
                      border: '1px solid #1c4a31',
                      color: '#baffdd',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, false)} style={{ display: 'none' }} />
                  </label>
                  {addForm.photoUrl && (
                    <span style={{ fontSize: '0.75rem', color: '#3dffa0' }}>
                      Photo uploaded!
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Bio</label>
                <textarea
                  value={addForm.bio}
                  onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                  rows={2}
                  placeholder="Short bio..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#07120c',
                    border: '1px solid #163324',
                    borderRadius: '6px',
                    color: '#f0f7f3',
                  }}
                />
              </div>

              {/* Social Links */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '6px', fontWeight: 600 }}>
                  Social Links (Optional)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#07120c', border: '1px solid #163324', borderRadius: '6px', padding: '0 10px' }}>
                    <Github size={14} color="#7a9e8b" />
                    <input
                      type="text"
                      value={addForm.github}
                      onChange={(e) => setAddForm({ ...addForm, github: e.target.value })}
                      placeholder="GitHub URL or handle (e.g. github.com/username)"
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f0f7f3',
                        fontSize: '0.82rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#07120c', border: '1px solid #163324', borderRadius: '6px', padding: '0 10px' }}>
                    <Linkedin size={14} color="#7a9e8b" />
                    <input
                      type="text"
                      value={addForm.linkedin}
                      onChange={(e) => setAddForm({ ...addForm, linkedin: e.target.value })}
                      placeholder="LinkedIn URL (e.g. linkedin.com/in/username)"
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f0f7f3',
                        fontSize: '0.82rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#07120c', border: '1px solid #163324', borderRadius: '6px', padding: '0 10px' }}>
                    <Instagram size={14} color="#7a9e8b" />
                    <input
                      type="text"
                      value={addForm.instagram}
                      onChange={(e) => setAddForm({ ...addForm, instagram: e.target.value })}
                      placeholder="Instagram URL or handle (e.g. instagram.com/handle)"
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f0f7f3',
                        fontSize: '0.82rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid #1c4a31',
                    color: '#7a9e8b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    backgroundColor: '#1b472e',
                    border: '1px solid #2d734b',
                    color: '#baffdd',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
