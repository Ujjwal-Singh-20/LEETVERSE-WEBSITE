import React, { useEffect, useState } from 'react';
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

export const AdminMembers: React.FC = () => {
  const [tree, setTree] = useState<DomainTreeNode[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [activeEditingMember, setActiveEditingMember] = useState<AdminMember | null>(null);

  // Modal State for adding a member
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addFormDomain, setAddFormDomain] = useState<string>('');
  const [newDomainInput, setNewDomainInput] = useState<string>('');
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    position: '',
    status: 'active' as 'active' | 'alumni',
    bio: '',
    rollNo: '',
    photoUrl: '',
    instagram: '',
    linkedin: '',
    github: '',
  });

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
    const finalDomain = addFormDomain === 'NEW_DOMAIN' ? newDomainInput.trim().toLowerCase().replace(/\s+/g, '-') : addFormDomain;

    if (!finalDomain) {
      alert('Please select or specify a domain.');
      return;
    }

    if (usernameCheck.available === false) {
      alert('Please choose an available username.');
      return;
    }

    try {
      await createAdminMember({
        domain: finalDomain,
        name: addForm.name,
        username: addForm.username,
        position: addForm.position,
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
        position: '',
        status: 'active',
        bio: '',
        rollNo: '',
        photoUrl: '',
        instagram: '',
        linkedin: '',
        github: '',
      });
      setUsernameCheck({ checking: false, available: null, message: '' });
      await loadTree();
    } catch (err: any) {
      alert(`Error creating member: ${err.message}`);
    }
  };

  // Autosave on blur for active editing member
  const handleFieldBlur = async (field: string, value: string | null) => {
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
            setAddFormDomain(tree[0]?.slug || 'web-dev');
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
                          <span>{domain.name}</span>
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
                                  onClick={() => setActiveEditingMember(member)}
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
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Position</label>
                    <input
                      type="text"
                      defaultValue={activeEditingMember.position}
                      onBlur={(e) => handleFieldBlur('position', e.target.value)}
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
              {/* Domain Select */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Domain</label>
                <select
                  value={addFormDomain}
                  onChange={(e) => setAddFormDomain(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#07120c',
                    border: '1px solid #163324',
                    borderRadius: '6px',
                    color: '#f0f7f3',
                  }}
                >
                  {tree.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {d.name} ({d.slug})
                    </option>
                  ))}
                  <option value="NEW_DOMAIN">+ Create New Domain</option>
                </select>

                {addFormDomain === 'NEW_DOMAIN' && (
                  <input
                    type="text"
                    placeholder="New domain name (e.g. Mobile Dev)"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#07120c',
                      border: '1px solid #163324',
                      borderRadius: '6px',
                      color: '#f0f7f3',
                      marginTop: '8px',
                    }}
                  />
                )}
              </div>

              {/* Name & Position */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Name</label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="Aditya Sharma"
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
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>Position</label>
                  <input
                    type="text"
                    required
                    value={addForm.position}
                    onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                    placeholder="Lead / Core Member"
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
