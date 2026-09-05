import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  FolderGit2,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  fetchAdminProjects,
  createAdminProject,
  updateAdminProject,
  deleteAdminProject,
  uploadMultipleFiles,
  fetchAdminMemberTree,
} from '../../services/api';
import { Project, DomainTreeNode, ProjectMemberSnapshot } from '../../types';

export const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableMembers, setAvailableMembers] = useState<ProjectMemberSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [formSlug, setFormSlug] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formSelectedMembers, setFormSelectedMembers] = useState<ProjectMemberSnapshot[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [projData, treeData] = await Promise.all([
        fetchAdminProjects(),
        fetchAdminMemberTree(),
      ]);
      setProjects(projData);

      // Flatten tree to get all members for project assignment
      const allM: ProjectMemberSnapshot[] = [];
      treeData.forEach((d) => {
        d.members.forEach((m) => {
          allM.push({
            username: m.username,
            name: m.name,
            photoUrl: m.photoUrl || '',
          });
        });
      });
      setAvailableMembers(allM);
    } catch (err: any) {
      alert(`Failed to load projects: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormSlug('');
    setFormTitle('');
    setFormDescription('');
    setFormImages([]);
    setFormSelectedMembers([]);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormSlug(proj.slug);
    setFormTitle(proj.title);
    setFormDescription(proj.description);
    setFormImages(proj.images || []);
    setFormSelectedMembers(proj.members || []);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const res = await uploadMultipleFiles(files, 'projects');
      setFormImages((prev) => [...prev, ...res.urls]);
    } catch (err: any) {
      alert(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleMemberSelection = (member: ProjectMemberSnapshot) => {
    const exists = formSelectedMembers.some((m) => m.username === member.username);
    if (exists) {
      setFormSelectedMembers((prev) => prev.filter((m) => m.username !== member.username));
    } else {
      setFormSelectedMembers((prev) => [...prev, member]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateAdminProject(editingProject.slug, {
          title: formTitle,
          description: formDescription,
          images: formImages,
          members: formSelectedMembers,
        });
      } else {
        await createAdminProject({
          slug: formSlug.toLowerCase().trim().replace(/\s+/g, '-'),
          title: formTitle,
          description: formDescription,
          images: formImages,
          members: formSelectedMembers,
        });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Failed to save project: ${err.message}`);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete project "${title}"?`);
    if (!confirmed) return;
    try {
      await deleteAdminProject(slug);
      await loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f0f7f3', marginBottom: '4px' }}>
            Project Showcase Manager
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#7a9e8b' }}>
            Manage portfolio projects, image showcases, and contributor credits.
          </p>
        </div>

        <button
          onClick={openCreateModal}
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
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading && <div style={{ padding: '40px', color: '#7a9e8b' }}>Loading projects...</div>}

      {!loading && (
        <div
          style={{
            backgroundColor: '#0a1711',
            border: '1px solid #163324',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#07120c', borderBottom: '1px solid #163324', color: '#567564', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Project</th>
                <th style={{ padding: '12px 16px' }}>Slug</th>
                <th style={{ padding: '12px 16px' }}>Builders</th>
                <th style={{ padding: '12px 16px' }}>Images</th>
                <th style={{ padding: '12px 16px' }}>Updated</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#7a9e8b' }}>
                    No projects found. Click "New Project" to add one!
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.slug} style={{ borderBottom: '1px solid #0f2419' }}>
                    <td style={{ padding: '14px 16px', color: '#f0f7f3', fontWeight: 600 }}>
                      {p.title}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#7a9e8b', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {p.slug}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#3dffa0', fontSize: '0.85rem' }}>
                      {p.members?.length || 0} contributors
                    </td>
                    <td style={{ padding: '14px 16px', color: '#8da899', fontSize: '0.85rem' }}>
                      {p.images?.length || 0} photos
                    </td>
                    <td style={{ padding: '14px 16px', color: '#567564', fontSize: '0.8rem' }}>
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit Project"
                        style={{
                          padding: '6px',
                          borderRadius: '4px',
                          color: '#baffdd',
                          cursor: 'pointer',
                          marginRight: '6px',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.slug, p.title)}
                        title="Delete Project"
                        style={{
                          padding: '6px',
                          borderRadius: '4px',
                          color: '#ff6b6b',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {isModalOpen && (
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
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f0f7f3' }}>
                {editingProject ? `Edit "${editingProject.title}"` : 'Create New Project'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#7a9e8b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Slug (Only editable on create) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                  Slug (unique doc ID)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingProject}
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="campus-connect"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: editingProject ? '#050a08' : '#07120c',
                    border: '1px solid #163324',
                    borderRadius: '6px',
                    color: '#f0f7f3',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Campus Connect"
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

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Full project description and architecture notes..."
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

              {/* Images Upload */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#7a9e8b' }}>
                    Project Images (images[0] is thumbnail)
                  </label>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: '#11291c',
                      border: '1px solid #1c4a31',
                      color: '#baffdd',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={12} /> {uploading ? 'Uploading...' : 'Add Images'}
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {formImages.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formImages.map((img, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          width: '80px',
                          height: '56px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: `url("${img}") center/cover no-repeat`,
                          border: idx === 0 ? '2px solid #3dffa0' : '1px solid #1c4a31',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            background: 'rgba(0,0,0,0.8)',
                            color: '#ff6b6b',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#567564' }}>No images uploaded yet.</div>
                )}
              </div>

              {/* Members Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '8px' }}>
                  Assign Contributing Builders (Select from Active Members)
                </label>
                <div
                  style={{
                    maxHeight: '140px',
                    overflowY: 'auto',
                    border: '1px solid #163324',
                    borderRadius: '6px',
                    padding: '8px',
                    backgroundColor: '#07120c',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                  }}
                >
                  {availableMembers.map((m) => {
                    const isSelected = formSelectedMembers.some((sm) => sm.username === m.username);
                    return (
                      <button
                        type="button"
                        key={m.username}
                        onClick={() => toggleMemberSelection(m)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: isSelected ? '#1b472e' : '#0a1711',
                          color: isSelected ? '#baffdd' : '#7a9e8b',
                          border: isSelected ? '1px solid #3dffa0' : '1px solid #163324',
                          cursor: 'pointer',
                        }}
                      >
                        {m.name} (@{m.username})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
