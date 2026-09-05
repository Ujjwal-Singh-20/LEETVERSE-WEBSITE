import React, { useEffect, useState } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { fetchAdminReminders, createAdminReminder, deleteAdminReminder } from '../../services/api';
import { Reminder, ReminderTargetSection } from '../../types';

export const AdminReminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [text, setText] = useState<string>('');
  const [startAt, setStartAt] = useState<string>('');
  const [endAt, setEndAt] = useState<string>('');
  const [targetSection, setTargetSection] = useState<ReminderTargetSection>('global');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = async () => {
    try {
      const data = await fetchAdminReminders();
      // Sort with active / upcoming first, then past
      const now = Date.now();
      const sorted = [...data].sort((a, b) => {
        const aActive = new Date(a.startAt).getTime() <= now && now <= new Date(a.endAt).getTime();
        const bActive = new Date(b.startAt).getTime() <= now && now <= new Date(b.endAt).getTime();
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
      });
      setReminders(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load reminders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
    // Default start now and end in 24 hours
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    setStartAt(now.toISOString().slice(0, 16));
    setEndAt(future.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const startISO = new Date(startAt).toISOString();
    const endISO = new Date(endAt).toISOString();

    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
      setError('End date & time must be strictly after start date & time.');
      setSubmitting(false);
      return;
    }

    try {
      await createAdminReminder({
        text,
        startAt: startISO,
        endAt: endISO,
        targetSection,
      });
      setText('');
      await loadReminders();
    } catch (err: any) {
      setError(err.message || 'Failed to create reminder.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId: string, reminderText: string) => {
    const confirmed = window.confirm(`Delete reminder: "${reminderText}"?`);
    if (!confirmed) return;
    try {
      await deleteAdminReminder(docId);
      await loadReminders();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const now = Date.now();
  const currentActive = reminders.find(
    (r) => new Date(r.startAt).getTime() <= now && now <= new Date(r.endAt).getTime()
  );

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f0f7f3', marginBottom: '4px' }}>
          Mascot Reminders & Announcement Windows
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#7a9e8b' }}>
          Schedule time-windowed announcements surfaced by Bracket Buddy in the speech bubble on hover.
        </p>
      </div>

      {/* Current Active Status Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: currentActive ? '#0e2b1b' : '#0a1711',
          border: currentActive ? '1px solid #236640' : '1px solid #163324',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: currentActive ? '#1b472e' : '#14261c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentActive ? '#3dffa0' : '#5b826d',
            }}
          >
            <Bell size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: currentActive ? '#3dffa0' : '#7a9e8b', fontWeight: 600 }}>
              {currentActive ? 'LIVE ACTIVE REMINDER' : 'MASCOT STATUS'}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f0f7f3' }}>
              {currentActive ? `"${currentActive.text}"` : 'No active reminder (Mascot remains hidden by default until summoned)'}
            </div>
          </div>
        </div>

        {currentActive && (
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#8da899', fontFamily: 'var(--font-mono)' }}>
            <div>Target: {currentActive.targetSection}</div>
            <div>Ends: {new Date(currentActive.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )}
      </div>

      {/* Two Column Layout: Create Form + Reminders List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '28px', alignItems: 'flex-start' }}>
        {/* Create Reminder Form */}
        <div
          style={{
            backgroundColor: '#0a1711',
            border: '1px solid #163324',
            borderRadius: '8px',
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f0f7f3', marginBottom: '16px' }}>
            Schedule New Reminder
          </h2>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: '#2b1010',
                border: '1px solid #632323',
                color: '#ffc7c7',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                Announcement Message (Speech Bubble Text)
              </label>
              <textarea
                required
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="LeetVerse Hackathon submissions open today! Click to register..."
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                End Date & Time (Window Closes)
              </label>
              <input
                type="datetime-local"
                required
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
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
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#7a9e8b', marginBottom: '4px' }}>
                Anchor Target Section
              </label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value as ReminderTargetSection)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#07120c',
                  border: '1px solid #163324',
                  borderRadius: '6px',
                  color: '#f0f7f3',
                  fontSize: '0.85rem',
                }}
              >
                <option value="global">Global (Floating Bottom-Right on all pages)</option>
                <option value="hero">Hero (Home Page Top)</option>
                <option value="members">Members (Directory Section)</option>
                <option value="projects">Projects (Portfolio Section)</option>
                <option value="gallery">Gallery (Event Section)</option>
              </select>
            </div>

            {/* Note regarding cache refresh */}
            <div
              style={{
                fontSize: '0.75rem',
                color: '#5b826d',
                backgroundColor: '#07120c',
                padding: '10px',
                borderRadius: '4px',
                border: '1px dashed #163324',
                lineHeight: 1.4,
              }}
            >
              Important: Reminders take effect on the public site after creation once the static cache is refreshed.
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: '#1b472e',
                border: '1px solid #2d734b',
                color: '#baffdd',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                marginTop: '6px',
              }}
            >
              <Plus size={16} /> {submitting ? 'Creating...' : 'Publish Reminder'}
            </button>
          </form>
        </div>

        {/* Reminders List Table */}
        <div
          style={{
            backgroundColor: '#0a1711',
            border: '1px solid #163324',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #163324', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f7f3' }}>
              Scheduled Windows ({reminders.length})
            </h2>
          </div>

          <div style={{ padding: '8px' }}>
            {loading && <div style={{ padding: '24px', color: '#7a9e8b', textAlign: 'center' }}>Loading reminders...</div>}

            {!loading && reminders.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#7a9e8b', fontSize: '0.9rem' }}>
                No reminders scheduled yet.
              </div>
            )}

            {!loading && reminders.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reminders.map((r) => {
                  const sTime = new Date(r.startAt).getTime();
                  const eTime = new Date(r.endAt).getTime();
                  const isActive = sTime <= now && now <= eTime;
                  const isUpcoming = sTime > now;
                  const isPast = eTime < now;

                  return (
                    <div
                      key={r.docId}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? '#0e2b1b' : '#07120c',
                        border: isActive ? '1px solid #266b42' : '1px solid #14291d',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              backgroundColor: isActive ? '#1b472e' : isUpcoming ? '#1f3d4d' : '#261b1b',
                              color: isActive ? '#3dffa0' : isUpcoming ? '#7dd3fc' : '#947a7a',
                            }}
                          >
                            {isActive ? 'ACTIVE NOW' : isUpcoming ? 'UPCOMING' : 'EXPIRED'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#5b826d',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            Target: {r.targetSection || 'global'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDelete(r.docId, r.text)}
                          title="Delete Reminder"
                          style={{
                            padding: '4px',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div style={{ fontSize: '0.9rem', color: '#f0f7f3', fontWeight: 500 }}>
                        "{r.text}"
                      </div>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#7a9e8b', fontFamily: 'var(--font-mono)' }}>
                        <div>From: {new Date(r.startAt).toLocaleString()}</div>
                        <div>To: {new Date(r.endAt).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
