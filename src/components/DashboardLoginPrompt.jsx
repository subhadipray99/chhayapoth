'use client';

import React from 'react';
import { SignInButton } from '@clerk/nextjs';
import Button3D from './Button3D';
import { Lock, LogIn } from 'lucide-react';

export default function DashboardLoginPrompt() {
  return (
    <div className="soft-pop-card animate-pop-in" style={{
      textAlign: 'center',
      backgroundColor: 'var(--color-white)',
      maxWidth: '480px',
      margin: '40px auto',
      padding: '40px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '2.5px solid var(--color-black)',
        borderRadius: '50%',
        width: '72px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-red)',
        boxShadow: '3px 3px 0px var(--color-black)'
      }}>
        <Lock size={32} />
      </div>

      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          Author Dashboard Locked
        </h2>
        <p style={{ color: 'var(--color-grey-dark)', fontSize: '15px', lineHeight: 1.5 }}>
          You must be logged in as an author to manage drafts, view analytics, and publish new reflections.
        </p>
      </div>

      <SignInButton mode="modal">
        <Button3D variant="orange" style={{ width: '100%', justifyContent: 'center' }}>
          <LogIn size={16} style={{ marginRight: '8px' }} />
          Sign In with Clerk
        </Button3D>
      </SignInButton>
    </div>
  );
}
