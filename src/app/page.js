import { getPosts, getAllSeries } from '@/lib/db';
import SocialPostCard from '@/components/SocialPostCard';
import QuickComposer from '@/components/QuickComposer';
import Button3D from '@/components/Button3D';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { Search, Flame, BookOpen, Compass, Sparkles } from 'lucide-react';

export default async function Home({ searchParams }) {
  // Await searchParams in Next.js 16/App Router
  const params = await searchParams;
  const genre = params?.genre || '';
  const searchQuery = params?.q || '';

  const user = await getSessionUser();
  
  let posts = [];
  let allSeries = [];
  let dbError = null;

  try {
    posts = await getPosts();
    allSeries = await getAllSeries();
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    dbError = err.message || 'Supabase connection failed';
  }

  // Apply search query filter in code if present
  if (searchQuery && posts.length > 0) {
    const q = searchQuery.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }

  // Apply genre filter (checks if query matches one of the comma-separated genres)
  if (genre && genre !== 'All' && posts.length > 0) {
    posts = posts.filter((p) => {
      if (!p.genres) return false;
      return p.genres.split(',').some(g => g.trim().toLowerCase() === genre.toLowerCase());
    });
  }

  // Pick top 4 recommended spaces for sidebar
  const recommendedSeries = allSeries.slice(0, 4);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      
      {/* Graceful Database Error Notice */}
      {dbError && (
        <div style={{
          border: '3px solid var(--color-black)',
          backgroundColor: '#fee2e2',
          color: 'var(--color-black)',
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '4px 4px 0px var(--color-black)',
          textAlign: 'left',
          marginTop: '20px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '8px', color: 'var(--color-red)' }}>
            ⚠️ Database Connection Issue
          </h3>
          <p style={{ fontSize: '14px', fontWeight: 650, margin: 0, lineHeight: 1.5 }}>
            Chhayapoth is currently unable to query Supabase. Please ensure your environment variables (like <code style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px' }}>NEXT_PUBLIC_SUPABASE_URL</code>) are set correctly in your Vercel Project dashboard.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-grey-dark)', marginTop: '12px', fontFamily: 'monospace' }}>
            Diagnostic message: {dbError}
          </p>
        </div>
      )}
      
      {/* Hero & Search Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
        textAlign: 'center',
        padding: '24px 0 12px 0'
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          color: 'var(--color-black)'
        }}>
          Walk the <span style={{ color: 'var(--color-orange)', borderBottom: '4px solid var(--color-black)' }}>Chhayapoth</span>
        </h1>
        
        <p style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-grey-dark)',
          maxWidth: '550px'
        }}>
          A beautifully shaded space where design, code, philosophy, and everyday poetry meet.
        </p>

        {/* Search Bar (Soft Pop design) */}
        <form action="/" method="GET" style={{
          position: 'relative',
          maxWidth: '450px',
          width: '100%',
          marginTop: '8px'
        }}>
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search feed, posts, or keywords..."
            className="soft-pop-input"
            style={{
              paddingRight: '60px',
              boxShadow: '4px 4px 0px var(--color-black)'
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: '2px solid var(--color-black)',
              backgroundColor: 'var(--color-orange)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '2px 2px 0px var(--color-black)'
            }}
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      {/* Main Grid Feed Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
        alignItems: 'start'
      }} className="feed-layout">
        
        {/* Left Column: Composer (if logged in) + Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* QuickComposer (shows only when logged in) */}
          {user && (
            <div>
              <QuickComposer authorId={user.id} />
            </div>
          )}

          {/* Feed Title Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3.5px solid var(--color-black)',
            paddingBottom: '8px',
            marginTop: '8px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} style={{ color: 'var(--color-orange)' }} />
              <span>
                {category ? `${category} Stories` : searchQuery ? `Search Results` : 'Stories Stream'}
              </span>
            </h2>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-grey-dark)', backgroundColor: 'var(--color-grey-light)', border: '1.5px solid var(--color-black)', padding: '2px 8px', borderRadius: '8px' }}>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {/* Posts Feed */}
          {posts.length === 0 ? (
            <div className="soft-pop-card" style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: 'var(--color-white)'
            }}>
              <Flame size={48} style={{ color: 'var(--color-grey-medium)', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontWeight: 800, marginBottom: '8px' }}>No posts found</h3>
              <p style={{ color: 'var(--color-grey-dark)', marginBottom: '16px' }}>
                We could not find any posts matching your criteria. Try adjusting filters or search query.
              </p>
              <Button3D href="/" variant="orange">
                Reset Feed
              </Button3D>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {posts.map((post) => (
                <SocialPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Spaces Sidebar (Desktop Only) */}
        <aside style={{ display: 'none' }} className="desktop-sidebar">
          <div className="soft-pop-card" style={{
            backgroundColor: 'var(--color-white)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'sticky',
            top: '112px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 900,
              borderBottom: '2.5px solid var(--color-black)',
              paddingBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Compass size={16} style={{ color: 'var(--color-orange)' }} />
              <span>Recommended Spaces</span>
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recommendedSeries.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--color-grey-dark)', fontStyle: 'italic' }}>No spaces created yet.</p>
              ) : (
                recommendedSeries.map(space => (
                  <div key={space.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={space.cover_image} 
                      alt="" 
                      style={{ 
                        width: '38px', 
                        height: '38px', 
                        borderRadius: '8px', 
                        objectFit: 'cover', 
                        border: '2px solid var(--color-black)' 
                      }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, gap: '1px' }}>
                      <Link href={`/series/${space.id}`} style={{ fontWeight: 800, color: 'var(--color-black)', textDecoration: 'none', fontSize: '13px' }} className="hover-orange font-sans">
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>s/{space.title}</span>
                      </Link>
                      <span style={{ fontSize: '11px', color: 'var(--color-grey-dark)', fontWeight: 600 }}>by {space.author?.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link href="/explore" style={{ display: 'inline-flex', marginTop: '6px' }}>
              <Button3D variant="white" style={{ padding: '8px 12px', fontSize: '12px', width: '100%', justifyContent: 'center' }}>
                Explore All Spaces
              </Button3D>
            </Link>
          </div>
        </aside>

      </div>
    </div>
  );
}
