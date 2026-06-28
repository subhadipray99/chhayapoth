'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button3D from './Button3D';
import { Camera, X, User } from 'lucide-react';

const AuthContext = createContext({
  user: null,
  isMock: true,
  loading: true,
  login: async () => {},
  logout: () => {},
  showLoginModal: false,
  setShowLoginModal: () => {}
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isClerk, setIsClerk] = useState(false);

  // Check if Clerk publishable key is present
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    if (hasClerkKey) {
      setIsClerk(true);
      setLoading(false);
      // If Clerk is active, Clerk components handle user state
      return;
    }

    // Mock Mode Auth Initializer
    const checkMockSession = () => {
      try {
        const cookies = document.cookie.split(';');
        const userCookie = cookies.find(c => c.trim().startsWith('chhayapoth_mock_user='));
        
        if (userCookie) {
          const userJson = decodeURIComponent(userCookie.split('=')[1]);
          setUser(JSON.parse(userJson));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Error reading mock user cookie:', e);
      } finally {
        setLoading(false);
      }
    };

    checkMockSession();
  }, [hasClerkKey]);

  // Mock Login handler
  const login = async (mockUser) => {
    // Save mock user into cookies (expires in 7 days)
    const cookieValue = encodeURIComponent(JSON.stringify(mockUser));
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    document.cookie = `chhayapoth_mock_user=${cookieValue}; path=/; max-age=${maxAge}`;
    
    setUser(mockUser);
    setShowLoginModal(false);
    
    // Call database endpoint to get or create author profile
    try {
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUser)
      });
    } catch (err) {
      console.error('Failed to sync mock user with DB:', err);
    }
    
    router.refresh();
  };

  // Mock Logout handler
  const logout = () => {
    // Delete cookie
    document.cookie = 'chhayapoth_mock_user=; path=/; max-age=0';
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const contextValue = {
    user,
    isMock: !isClerk,
    loading,
    login,
    logout,
    showLoginModal,
    setShowLoginModal
  };

  // Render standard provider if in Clerk mode, otherwise mock provider
  if (isClerk) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {showLoginModal && (
        <MockLoginModal 
          onClose={() => setShowLoginModal(false)} 
          onLogin={login} 
        />
      )}
    </AuthContext.Provider>
  );
}

// Mock Auth Modal Component
function MockLoginModal({ onClose, onLogin }) {
  const [tab, setTab] = useState('select'); // select | create
  const [customName, setCustomName] = useState('');
  const [customBio, setCustomBio] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [uploading, setUploading] = useState(false);

  const preseededAuthors = [
    {
      id: 'author-1',
      name: 'Satyajit Ray',
      email: 'satyajit@chhayapoth.org',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Filmmaker, author, illustrator, and designer. Creator of Feluda and Professor Shonku.'
    },
    {
      id: 'author-2',
      name: 'Rabindranath Tagore',
      email: 'rabindranath@chhayapoth.org',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      bio: 'Poet, philosopher, and social reformer. Nobel laureate in Literature.'
    },
    {
      id: 'author-3',
      name: 'Jibanananda Das',
      email: 'jibanananda@chhayapoth.org',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      bio: 'Modernist poet and writer. Capturing the rustic beauty of Bengal through surrealist imagery.'
    }
  ];

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setCustomAvatar(data.url);
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newAuthor = {
      id: 'author-' + Math.random().toString(36).substr(2, 9),
      name: customName,
      email: `${customName.toLowerCase().replace(/\s+/g, '')}@mock.chhayapoth.org`,
      avatar: customAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      bio: customBio || 'Chhayapoth Author'
    };

    onLogin(newAuthor);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="soft-pop-card animate-pop-in" style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: 'var(--color-cream)',
        padding: '32px'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-black)'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '28px',
          fontWeight: 800,
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Mock Login
        </h2>
        
        <p style={{
          color: 'var(--color-grey-dark)',
          textAlign: 'center',
          fontSize: '14px',
          marginBottom: '24px'
        }}>
          Chhayapoth is running in <strong>Mock Mode</strong>. Select an author or create a custom one to login.
        </p>

        {/* Tab Headers */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid var(--color-black)',
          marginBottom: '24px',
          gap: '8px'
        }}>
          <button
            onClick={() => setTab('select')}
            style={{
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: '15px',
              border: 'none',
              background: 'none',
              color: tab === 'select' ? 'var(--color-orange)' : 'var(--color-black-soft)',
              borderBottom: tab === 'select' ? '3px solid var(--color-orange)' : 'none',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Choose Author
          </button>
          <button
            onClick={() => setTab('create')}
            style={{
              padding: '8px 16px',
              fontWeight: 700,
              fontSize: '15px',
              border: 'none',
              background: 'none',
              color: tab === 'create' ? 'var(--color-orange)' : 'var(--color-black-soft)',
              borderBottom: tab === 'create' ? '3px solid var(--color-orange)' : 'none',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            Create Profile
          </button>
        </div>

        {tab === 'select' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {preseededAuthors.map(auth => (
              <div 
                key={auth.id}
                onClick={() => onLogin(auth)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid var(--color-black)',
                  backgroundColor: 'var(--color-white)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="author-select-item"
              >
                <img 
                  src={auth.avatar} 
                  alt={auth.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-black)',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '16px' }}>{auth.name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-grey-dark)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {auth.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Avatar Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-black)',
                  backgroundColor: 'var(--color-grey-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {customAvatar ? (
                    <img src={customAvatar} alt="avatar preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={32} style={{ color: 'var(--color-grey-dark)' }} />
                  )}
                </div>
                <label style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--color-orange)',
                  border: '2px solid var(--color-black)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white'
                }}>
                  <Camera size={12} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }} 
                  />
                </label>
              </div>
              <span style={{ fontSize: '14px', color: 'var(--color-grey-dark)' }}>
                {uploading ? 'Uploading...' : 'Upload Profile Picture'}
              </span>
            </div>

            {/* Inputs */}
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Author Name</label>
              <input 
                type="text"
                placeholder="Rabindranath Tagore"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className="soft-pop-input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>Author Bio</label>
              <textarea 
                placeholder="A writer of verses and songs..."
                value={customBio}
                onChange={e => setCustomBio(e.target.value)}
                className="soft-pop-input"
                style={{ height: '80px', resize: 'none' }}
              />
            </div>

            <Button3D 
              variant="orange" 
              type="submit" 
              style={{ width: '100%', marginTop: '8px' }}
              disabled={uploading}
            >
              Create & Login
            </Button3D>
          </form>
        )}
      </div>
    </div>
  );
}
