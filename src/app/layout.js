import './globals.css';
import Header from '@/components/Header';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'Chhayapoth - A Soft Pop Multipage Blog & Author Panel',
  description: 'Chhayapoth: A Medium-like blogging platform with rich author dashboards, 3D button depths, and custom aesthetics.',
};

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({ children }) {
  if (!clerkKey) {
    return (
      <html lang="en">
        <body style={{ 
          fontFamily: 'sans-serif', 
          padding: '40px', 
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          margin: 0
        }}>
          <div style={{
            border: '3px solid black',
            padding: '30px',
            borderRadius: '24px',
            backgroundColor: 'white',
            boxShadow: '8px 8px 0px black',
            maxWidth: '500px'
          }}>
            <h2 style={{ color: '#ef4444', fontWeight: 900, marginBottom: '12px' }}>⚠️ Setup Required: Clerk Key Missing</h2>
            <p style={{ fontWeight: 600, color: '#334155', lineHeight: 1.5 }}>
              Chhayapoth is running but the Clerk Publishable Key is missing from the environment.
            </p>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '10px', lineHeight: 1.5 }}>
              Please add <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px' }}>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in your Vercel Project Settings under Environment Variables, and then redeploy the site.
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en">
        <body>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            
            {/* Main Content */}
            <main style={{ flexGrow: 1, padding: '40px 0' }}>
              {children}
            </main>

            {/* Footer */}
            <footer style={{
              backgroundColor: 'var(--color-black)',
              color: 'var(--color-white)',
              borderTop: '3px solid var(--color-black)',
              padding: '48px 0 24px 0',
              marginTop: '60px'
            }}>
              <div className="container" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '32px'
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '24px'
                }}>
                  <div>
                    <h3 style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 800,
                      fontSize: '24px',
                      color: 'var(--color-orange)',
                      marginBottom: '8px'
                    }}>
                      Chhayapoth
                    </h3>
                    <p style={{
                      color: 'var(--color-grey-dark)',
                      maxWidth: '380px',
                      fontSize: '14px'
                    }}>
                      A cool, shaded pathway for writing, thinking, and design. Express yourself with absolute freedom.
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '14px',
                    fontWeight: 700
                  }}>
                    <a href="/" style={{ color: 'var(--color-grey-medium)' }} className="footer-link">Home</a>
                    <a href="/author" style={{ color: 'var(--color-grey-medium)' }} className="footer-link">Dashboard</a>
                    <a href="/author/new" style={{ color: 'var(--color-grey-medium)' }} className="footer-link">Write</a>
                  </div>
                </div>

                <div style={{
                  height: '1px',
                  backgroundColor: 'var(--color-black-soft)'
                }}></div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: 'var(--color-grey-dark)',
                  gap: '12px'
                }}>
                  <p>© {new Date().getFullYear()} Chhayapoth. All rights reserved.</p>
                  <p>Designed with Soft Pop Aesthetics & 3D Depth.</p>
                </div>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
