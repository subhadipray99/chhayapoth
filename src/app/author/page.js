import { getSessionUser } from '@/lib/auth';
import { getPosts, getOrCreateAuthor, getSeriesByAuthorId } from '@/lib/db';
import DashboardLoginPrompt from '@/components/DashboardLoginPrompt';
import DashboardPostList from '@/components/DashboardPostList';
import DashboardSpacesManager from '@/components/DashboardSpacesManager';
import Button3D from '@/components/Button3D';
import Link from 'next/link';
import { BookOpen, Eye, Heart, PlusCircle, BarChart3, User, Settings, Compass } from 'lucide-react';


export default async function AuthorDashboard() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DashboardLoginPrompt />
      </div>
    );
  }

  // Fetch author posts, profile, and spaces
  const allPosts = await getPosts();
  const authorPosts = allPosts.filter(p => p.author_id === user.id);
  const authorProfile = await getOrCreateAuthor(user);
  const spaces = await getSeriesByAuthorId(user.id);

  // Compute analytics
  const totalPosts = authorPosts.length;
  const totalViews = authorPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = authorPosts.reduce((acc, p) => acc + (p.likes || 0), 0);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Dashboard Welcome Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        borderBottom: '3px solid var(--color-black)',
        paddingBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: '3.5px solid var(--color-black)',
            overflow: 'hidden',
            boxShadow: '3px 3px 0px var(--color-black)'
          }}>
            <img src={authorProfile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900 }}>Welcome back, {authorProfile.name}</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-grey-dark)' }}>Manage your publications and monitor your insights.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button3D href="/author/new" variant="orange">
            <PlusCircle size={16} style={{ marginRight: '6px' }} />
            Write New Story
          </Button3D>
        </div>
      </div>

      {/* Analytics Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} style={{ color: 'var(--color-blue)' }} />
          <span>Dashboard Analytics</span>
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1: Stories */}
          <div className="soft-pop-card" style={{
            backgroundColor: 'var(--color-white)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'rgba(29, 78, 216, 0.1)',
              border: '2px solid var(--color-black)',
              borderRadius: '12px',
              padding: '12px',
              color: 'var(--color-blue)',
              display: 'flex'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-grey-dark)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Total Stories</p>
              <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{totalPosts}</h2>
            </div>
          </div>

          {/* Card 2: Views */}
          <div className="soft-pop-card" style={{
            backgroundColor: 'var(--color-white)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 90, 31, 0.1)',
              border: '2px solid var(--color-black)',
              borderRadius: '12px',
              padding: '12px',
              color: 'var(--color-orange)',
              display: 'flex'
            }}>
              <Eye size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-grey-dark)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Total Views</p>
              <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{totalViews}</h2>
            </div>
          </div>

          {/* Card 3: Likes */}
          <div className="soft-pop-card" style={{
            backgroundColor: 'var(--color-white)',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid var(--color-black)',
              borderRadius: '12px',
              padding: '12px',
              color: 'var(--color-red)',
              display: 'flex'
            }}>
              <Heart size={24} />
            </div>
            <div>
              <p style={{ color: 'var(--color-grey-dark)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>Total Likes</p>
              <h2 style={{ fontSize: '28px', fontWeight: 900 }}>{totalLikes}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces Customization Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px solid var(--color-black)', paddingBottom: '8px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} style={{ color: 'var(--color-blue)' }} />
            <span>Your Spaces & Publication Channels</span>
          </h3>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-grey-dark)' }}>{spaces.length} channels</span>
        </div>

        <DashboardSpacesManager spaces={spaces} authorId={user.id} />
      </section>

      {/* Stories List Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-black)', paddingBottom: '8px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--color-orange)' }} />
            <span>Your Publications</span>
          </h3>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-grey-dark)' }}>{totalPosts} items</span>
        </div>

        <DashboardPostList posts={authorPosts} />
      </section>
    </div>
  );
}
