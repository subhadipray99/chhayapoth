'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button3D from './Button3D';
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';
import { Feather, Menu, X, LayoutDashboard, PlusCircle } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const genres = ['All', 'Fiction', 'Poetry', 'Philosophy', 'Life', 'Tech'];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(248, 250, 252, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '3px solid var(--color-black)',
      padding: '16px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* LOGO */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: 'var(--color-orange)',
            border: '2px solid var(--color-black)',
            padding: '6px 12px',
            borderRadius: '12px',
            boxShadow: '3px 3px 0px var(--color-black)',
            color: 'white',
            fontWeight: 800,
            fontSize: '20px',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Feather size={20} />
            <span>Chhayapoth</span>
          </div>
        </Link>

        {/* DESKTOP CATEGORY NAV */}
        <nav style={{ display: 'none' }} className="desktop-nav">
          <ul style={{ display: 'flex', listStyle: 'none', gap: '20px', alignItems: 'center' }}>
            <li>
              <Link 
                href="/explore"
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: pathname === '/explore' ? 'var(--color-orange)' : 'var(--color-black)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: pathname === '/explore' ? '2px solid var(--color-black)' : '2px solid transparent',
                  backgroundColor: pathname === '/explore' ? 'var(--color-white)' : 'transparent',
                  boxShadow: pathname === '/explore' ? '2.5px 2.5px 0px var(--color-black)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Explore Spaces
              </Link>
            </li>
            <div style={{ width: '2px', height: '16px', backgroundColor: 'var(--color-black)', opacity: 0.3 }}></div>
            {genres.map((g) => {
              const href = g === 'All' ? '/' : `/?genre=${g}`;
              return (
                <li key={g}>
                  <Link 
                    href={href}
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: pathname === href || (g === 'All' && pathname === '/') ? 'var(--color-orange)' : 'var(--color-black-soft)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    {g}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* AUTH CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Write Button (Desktop Only) */}
          <div style={{ display: 'none' }} className="desktop-nav">
            <Button3D href="/author/new" variant="orange" style={{ padding: '8px 20px', fontSize: '14px' }}>
              <PlusCircle size={16} style={{ marginRight: '6px' }} />
              Write
            </Button3D>
          </div>

          {/* Clerk Auth Integration */}
          <div>
            {isSignedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'none' }} className="desktop-nav">
                  <Link href="/author">
                    <Button3D variant="white" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      <LayoutDashboard size={16} style={{ marginRight: '6px' }} />
                      Dashboard
                    </Button3D>
                  </Link>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button3D variant="blue" style={{ padding: '8px 20px', fontSize: '14px' }}>
                  Sign In
                </Button3D>
              </SignInButton>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              background: 'none',
              border: '2px solid var(--color-black)',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--color-black)'
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-cream)',
          borderBottom: '3px solid var(--color-black)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          zIndex: 99
        }} className="mobile-menu animate-pop-in">
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', listStyle: 'none' }}>
            <li>
              <Link 
                href="/explore"
                onClick={closeMobileMenu}
                style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  display: 'block',
                  color: pathname === '/explore' ? 'var(--color-orange)' : 'var(--color-black)'
                }}
              >
                🧭 Explore Spaces
              </Link>
            </li>
            <div style={{ height: '1px', backgroundColor: 'var(--color-grey-light)' }}></div>
            {genres.map((g) => {
              const href = g === 'All' ? '/' : `/?genre=${g}`;
              return (
                <li key={g}>
                  <Link 
                    href={href}
                    onClick={closeMobileMenu}
                    style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      display: 'block',
                      color: pathname === href || (g === 'All' && pathname === '/') ? 'var(--color-orange)' : 'var(--color-black)'
                    }}
                  >
                    {g}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div style={{ height: '2px', backgroundColor: 'var(--color-black)' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button3D 
              href="/author/new" 
              variant="orange" 
              onClick={closeMobileMenu} 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <PlusCircle size={18} style={{ marginRight: '8px' }} />
              Write a Post
            </Button3D>
            
            {isSignedIn && (
              <Button3D 
                href="/author" 
                variant="white" 
                onClick={closeMobileMenu} 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LayoutDashboard size={18} style={{ marginRight: '8px' }} />
                Author Dashboard
              </Button3D>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
