import { getAllSeries } from '@/lib/db';
import Button3D from '@/components/Button3D';
import Link from 'next/link';
import { Compass, BookOpen, MessageSquare, Sparkles, User, FileText } from 'lucide-react';

export default async function ExplorePage() {
  const seriesList = await getAllSeries();

  // Group spaces by type
  const novels = seriesList.filter(s => s.type === 'series');
  const blogs = seriesList.filter(s => s.type === 'blog');
  const singles = seriesList.filter(s => s.type === 'single');

  // Select a featured space for the top hero banner (e.g. the first series, or fallback)
  const featured = seriesList.length > 0 ? seriesList[0] : null;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '60px' }}>
      
      {/* Netflix-Style Hero Banner */}
      {featured && (
        <div style={{
          position: 'relative',
          border: '3px solid var(--color-black)',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: 'var(--color-black)',
          minHeight: '340px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '8px 8px 0px var(--color-black)',
          marginTop: '12px'
        }} className="animate-pop-in">
          {/* Cover Art Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.3) 100%), url(${featured.cover_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.85
          }}></div>

          {/* Banner Content */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            padding: '40px',
            maxWidth: '600px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              alignSelf: 'flex-start',
              backgroundColor: 'var(--color-orange)',
              border: '2px solid var(--color-black)',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'white',
              boxShadow: '2px 2px 0px var(--color-black)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Sparkles size={10} />
              <span>FEATURED SPACE</span>
            </div>

            <h1 style={{ 
              fontSize: 'clamp(28px, 4vw, 42px)', 
              fontWeight: 900, 
              fontFamily: 'var(--font-serif)', 
              lineHeight: 1.1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.6)' 
            }}>
              {featured.title}
            </h1>

            <p style={{ 
              fontSize: '15px', 
              color: 'rgba(255,255,255,0.8)', 
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {featured.description || 'Step inside this publication space and explore serial content from the creator.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
              <img 
                src={featured.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                alt="" 
                style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1.5px solid white' }}
              />
              <span>by {featured.author?.name}</span>
            </div>

            <div style={{ marginTop: '8px' }}>
              <Button3D href={`/series/${featured.id}`} variant="white">
                Enter Space
              </Button3D>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      {!featured && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
          <Compass size={32} style={{ color: 'var(--color-orange)' }} />
          <h1 style={{ fontSize: '32px', fontWeight: 900 }}>Explore Spaces & Series</h1>
        </div>
      )}

      {/* ROW 1: SERIALIZED NOVELS */}
      {novels.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} style={{ color: 'var(--color-orange)' }} />
            <span>Serialized Novels & Stories</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-grey-dark)' }}>Ongoing novels published episode by episode, just like a weekly series.</p>
          
          <div className="netflix-row-container">
            {novels.map(space => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}

      {/* ROW 2: BLOG & ARTICLE SPACES */}
      {blogs.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: 'var(--color-blue)' }} />
            <span>Publications & Blogs</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-grey-dark)' }}>Traditional article channels, essays, commentaries, and newsletter logs.</p>
          
          <div className="netflix-row-container">
            {blogs.map(space => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}

      {/* ROW 3: STANDALONE SINGLE SPACES */}
      {singles.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} style={{ color: 'var(--color-green)' }} />
            <span>Micro-Posting & Standalone Streams</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-grey-dark)' }}>Twitter/Reddit style space streams for short snippets, single posts, and micro-stories.</p>
          
          <div className="netflix-row-container">
            {singles.map(space => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Netflix Style Space Card Component
function SpaceCard({ space }) {
  return (
    <div className="netflix-card soft-pop-card" style={{
      backgroundColor: 'var(--color-white)',
      display: 'flex',
      flexDirection: 'column',
      height: '350px',
      overflow: 'hidden'
    }}>
      {/* Poster Cover Art */}
      <div style={{
        height: '160px',
        position: 'relative',
        backgroundColor: 'var(--color-grey-light)'
      }}>
        <img 
          src={space.cover_image} 
          alt={space.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Type Badge */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'var(--color-black)',
          color: 'white',
          border: '1.5px solid white',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: 800
        }}>
          {space.type === 'series' ? 'Serialized' : space.type === 'single' ? 'Micro-Space' : 'Publication'}
        </div>
      </div>

      {/* Card Info */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flexGrow: 1,
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 850,
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'var(--color-black)'
          }}>
            {space.title}
          </h3>
          
          <p style={{
            fontSize: '12px',
            color: 'var(--color-grey-dark)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {space.description || 'No description provided.'}
          </p>
        </div>

        {/* Card Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1.5px dashed var(--color-grey-light)',
          paddingTop: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700 }}>
            <img 
              src={space.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
              alt="" 
              style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid black' }}
            />
            <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {space.author?.name}
            </span>
          </div>

          <Link href={`/series/${space.id}`} style={{ display: 'inline-flex' }}>
            <Button3D variant="white" style={{ padding: '6px 12px', fontSize: '11px' }}>
              Read
            </Button3D>
          </Link>
        </div>
      </div>
    </div>
  );
}
