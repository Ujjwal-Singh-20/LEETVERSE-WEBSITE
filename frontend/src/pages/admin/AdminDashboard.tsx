import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMembers } from './AdminMembers';
import { AdminProjects } from './AdminProjects';
import { AdminGallery } from './AdminGallery';
import { AdminReminders } from './AdminReminders';

export const AdminDashboard: React.FC = () => {
  const { admin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'projects' | 'gallery' | 'reminders'>('members');

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#050a08',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7a9e8b',
          fontFamily: 'var(--font-mono)',
        }}
      >
        Authenticating session...
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin />;
  }

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'members' && <AdminMembers />}
      {activeTab === 'projects' && <AdminProjects />}
      {activeTab === 'gallery' && <AdminGallery />}
      {activeTab === 'reminders' && <AdminReminders />}
    </AdminLayout>
  );
};
