import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { loginWithGoogle, loading, loginError } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050a08',
        padding: '24px',
        color: '#e6ede8',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          backgroundColor: '#0a1711',
          border: '1px solid #163324',
          borderRadius: '12px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '10px',
            backgroundColor: '#0d2618',
            border: '1px solid #1e5235',
            color: '#3dffa0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Shield size={28} />
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '8px', color: '#f0f7f3' }}>
          LeetVerse Admin
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#7a9e8b', marginBottom: '28px', lineHeight: 1.5 }}>
          Restricted internal portal. Authenticate with your authorized society Google account.
        </p>

        {loginError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              borderRadius: '6px',
              backgroundColor: '#2b1010',
              border: '1px solid #632323',
              color: '#ffc7c7',
              fontSize: '0.85rem',
              textAlign: 'left',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{loginError}</div>
          </div>
        )}

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#1a1a1a',
            fontWeight: 600,
            fontSize: '0.925rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {loading ? 'Authenticating...' : 'Sign in with Google'}
        </button>

        <div style={{ marginTop: '24px', fontSize: '0.75rem', color: '#526e5f' }}>
          Protected by Firebase Authentication & Firestore Admin Whitelist.
        </div>
      </div>
    </div>
  );
};
