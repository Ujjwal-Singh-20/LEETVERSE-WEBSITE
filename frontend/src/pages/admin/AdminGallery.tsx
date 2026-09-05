import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  Calendar,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import {
  fetchAdminGallery,
  fetchAdminGalleryEvent,
  createAdminGalleryEvent,
  updateAdminGalleryEvent,
  deleteAdminGalleryEvent,
  uploadSingleFile,
  uploadMultipleFiles,
} from '../../services/api';
import { GalleryListingItem } from '../../types';

export const AdminGallery: React.FC = () => {
  const [events, setEvents] = useState<GalleryListingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  // Form State
  const [formSlug, setFormSlug] = useState<string>('');
  const [formEventName, setFormEventName] = useState<string>('');
  const [formShortDesc, setFormShortDesc] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formThumbnail, setFormThumbnail] = useState<string>('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const loadGallery = async () => {
    try {
      const data = await fetchAdminGallery();
      setEvents(data);
    } catch (err: any) {
      alert(`Failed to load gallery events: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormSlug('');
    setFormEventName('');
    setFormShortDesc('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormThumbnail('');
    setFormImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = async (evt: GalleryListingItem) => {
    try {
      // Fetch full event detail including images[]
      const fullEvt = await fetchAdminGalleryEvent(evt.slug);
      setEditingEvent(fullEvt);
      setFormSlug(fullEvt.slug);
      setFormEventName(fullEvt.eventName);
      setFormShortDesc(fullEvt.shortDesc);
      setFormDate(new Date(fullEvt.date).toISOString().split('T')[0]);
      setFormThumbnail(fullEvt.thumbnail);
      setFormImages(fullEvt.images || []);
      setIsModalOpen(true);
    } catch (err: any) {
      alert(`Failed to load event details: ${err.message}`);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadSingleFile(file, 'gallery');
      setFormThumbnail(res.url);
    } catch (err: any) {
      alert(`Thumbnail upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const res = await uploadMultipleFiles(files, 'gallery');
      setFormImages((prev) => [...prev, ...res.urls].slice(0, 10)); // max 10 images
    } catch (err: any) {
      alert(`Album photos upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dateISO = new Date(formDate).toISOString();
      if (editingEvent) {
        await updateAdminGalleryEvent(editingEvent.slug, {
          eventName: formEventName,
          shortDesc: formShortDesc,
          thumbnail: formThumbnail,
          images: formImages,
          date: dateISO,
        });
      } else {
        await createAdminGalleryEvent({
          slug: formSlug.toLowerCase().trim().replace(/\s+/g, '-'),
          eventName: formEventName,
          shortDesc: formShortDesc,
          thumbnail: formThumbnail,
          images: formImages,
          date: dateISO,
        });
      }
      setIsModalOpen(false);
      await loadGallery();
    } catch (err: any) {
      alert(`Failed to save gallery event: ${err.message}`);
    }
  };

  const handleDelete = async (slug: string, eventName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete event "${eventName}"?`);
    if (!confirmed) return;
    try {
      await deleteAdminGalleryEvent(slug);
      await loadGallery();
    } catch (err: any) {
      alert(`Failed to delete event: ${err.message}`);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f0f7f3', marginBottom: '4px' }}>
            Event Gallery Manager
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#7a9e8b' }}>
            Manage society events, thumbnail listings, and high-res photo albums.
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
          <Plus size={16} /> New Event
        </button>
      </div>

      {loading && <div style={{ padding: '40px', color: '#7a9e8b' }}>Loading gallery events...</div>}

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
                <th style={{ padding: '12px 16px' }}>Event Name</th>
                <th style={{ padding: '12px 16px' }}>Slug</th>
                <th style={{ padding: '12px 16px' }}>Date</th>
                <th style={{ padding: '12px 16px' }}>Description</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#7a9e8b' }}>
                    No gallery events found. Click "New Event" to create one!
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.slug} style={{ borderBottom: '1px solid #0f2419' }}>
                    <td style={{ padding: '14px 16px', color: '#f0f7f3', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '26px',
                            borderRadius: '4px',
                            background: evt.thumbnail ? `url("${evt.thumbnail}") center/cover no-repeat` : '#163324',
                            border: '1px solid #163324',
                            flexShrink: 0,
                          }}
                        />
                        {evt.eventName}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#7a9e8b', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {evt.slug}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#3dffa0', fontSize: '0.85rem' }}>
                      {new Date(evt.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#8da899', fontSize: '0.85rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {evt.shortDesc}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(evt)}
                        title="Edit Event"
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
                        onClick={() => handleDelete(evt.slug, evt.eventName)}
                        title="Delete Event"
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

      {/* Create / Edit Modal */}
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
                {editingEvent ? `Edit "${editingEvent.eventName}"` : 'Create Gallery Event'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: '#7a9e8b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                  Slug (unique doc ID)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingEvent}
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="hackathon-2026"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: editingEvent ? '#050a08' : '#07120c',
                    border: '1px solid #163324',
                    borderRadius: '6px',
                    color: '#f0f7f3',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                  Event Name
                </label>
                <input
                  type="text"
                  required
                  value={formEventName}
                  onChange={(e) => setFormEventName(e.target.value)}
                  placeholder="LeetVerse Hackathon 2026"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
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
                    Thumbnail Photo
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        backgroundColor: '#11291c',
                        border: '1px solid #1c4a31',
                        color: '#baffdd',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Upload size={13} /> Upload Cover
                      <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: 'none' }} />
                    </label>
                    {formThumbnail && <span style={{ fontSize: '0.75rem', color: '#3dffa0' }}>Cover ready</span>}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                  Short Description (Listing Summary)
                </label>
                <textarea
                  required
                  rows={2}
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  placeholder="24-hour build sprint bringing together college developers..."
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

              {/* Album Photos Upload */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#7a9e8b' }}>
                    Album Photos (Full Image Set, Max 10)
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
                    <Upload size={12} /> Add Photos
                    <input type="file" multiple accept="image/*" onChange={handleImagesUpload} style={{ display: 'none' }} />
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
                          border: '1px solid #1c4a31',
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
                  <div style={{ fontSize: '0.8rem', color: '#567564' }}>No album photos uploaded yet.</div>
                )}
              </div>

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
                  disabled={uploading || !formThumbnail}
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
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
