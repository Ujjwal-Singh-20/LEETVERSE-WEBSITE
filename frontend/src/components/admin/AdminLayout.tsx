import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderGit2,
  Calendar,
  Bell,
  RefreshCw,
  LogOut,
  ChevronRight,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerCacheRefresh } from '../../services/api';

interface AdminLayoutProps {
  activeTab: 'members' | 'projects' | 'gallery' | 'reminders';
  setActiveTab: (tab: 'members' | 'projects' | 'gallery' | 'reminders') => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
}) => {
  const { admin, logout } = useAuth();
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);
  const [cacheError, setCacheError] = useState<string | null>(null);

  const handleRefreshCache = async () => {
    setCacheLoading(true);
    setCacheMessage(null);
    setCacheError(null);
    try {
      const res = await triggerCacheRefresh();
      setCacheMessage(`Cache refreshed! Generated: ${res.files.join(', ')}`);
      setTimeout(() => setCacheMessage(null), 6000);
    } catch (err: any) {
      setCacheError(err.message || 'Failed to refresh cache.');
      setTimeout(() => setCacheError(null), 6000);
    } finally {
      setCacheLoading(false);
    }
  };

  const navItems = [
    { id: 'members', label: 'Members & Domains', icon: Users },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'gallery', label: 'Gallery Events', icon: Calendar },
    { id: 'reminders', label: 'Mascot Reminders', icon: Bell },
  ] as const;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#070f0b',
        color: '#e6ede8',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#050a08',
          borderRight: '1px solid #14261c',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #14261c',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: '#0d2417',
              border: '1px solid #1b472e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3dffa0',
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f7f3' }}>
              LeetVerse Admin
            </div>
            <div style={{ fontSize: '0.75rem', color: '#688c78' }}>
              Internal Management
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: active ? 600 : 400,
                  backgroundColor: active ? '#11291c' : 'transparent',
                  color: active ? '#3dffa0' : '#8da899',
                  border: active ? '1px solid #1c4a31' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} />
                  {item.label}
                </div>
                {active && <ChevronRight size={14} />}
              </button>
            );
          })}

          {/* Operational Cache Refresh Action */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #14261c' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#567564', letterSpacing: '0.05em', padding: '0 12px 8px' }}>
              Deployments & Cache
            </div>
            <button
              onClick={handleRefreshCache}
              disabled={cacheLoading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: '#0a1d13',
                border: '1px solid #1c4a31',
                color: '#3dffa0',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: cacheLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={15} style={{ animation: cacheLoading ? 'spin 1s linear infinite' : 'none' }} />
              {cacheLoading ? 'Generating Blobs...' : 'Refresh Static Cache'}
            </button>
          </div>
        </nav>

        {/* Admin Profile & Logout */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #14261c',
            backgroundColor: '#040806',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f7f3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin?.name || 'Admin User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#567564', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin?.email}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                padding: '6px',
                borderRadius: '4px',
                color: '#8da899',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#567564',
              textDecoration: 'none',
              marginTop: '4px',
            }}
          >
            Visit Public Site <ExternalLink size={12} />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          marginLeft: '260px',
          flex: 1,
          padding: '36px 40px',
          minWidth: 0,
        }}
      >
        {/* Cache status banner if triggered */}
        {cacheMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '6px',
              backgroundColor: '#0b2618',
              border: '1px solid #23633e',
              color: '#baffdd',
              fontSize: '0.9rem',
              marginBottom: '24px',
            }}
          >
            <CheckCircle2 size={18} color="#3dffa0" />
            {cacheMessage}
          </div>
        )}

        {cacheError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '6px',
              backgroundColor: '#2b1010',
              border: '1px solid #632323',
              color: '#ffc7c7',
              fontSize: '0.9rem',
              marginBottom: '24px',
            }}
          >
            <AlertCircle size={18} color="#ff6b6b" />
            {cacheError}
          </div>
        )}

        {children}
      </main>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
