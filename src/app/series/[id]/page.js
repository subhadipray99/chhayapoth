import { getSeriesById, getPostsBySeriesId } from '@/lib/db';
import Button3D from '@/components/Button3D';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Heart, Eye, Calendar, Sparkles } from 'lucide-react';

export default async function SeriesDetailPage({ params }) {
  const { id } = await params;

  const series = await getSeriesById(id);
  if (!series) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="soft-pop-card" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-red)', marginBottom: '12px' }}>
            Space Not Found
          </h2>
          <p style={{ color: 'var(--color-grey-dark)', marginBottom: '24px' }}>
            The space or series you are looking for might have been deleted, or the address was entered incorrectly.
          </p>
          <Button3D href="/explore" variant="orange">
            Back to Explore Page
          </Button3D>
        </div>
      </div>
    );
  }

  const posts = await getPostsBySeriesId(id);
  const totalPosts = posts.length;
  
  // Calculate total views and likes of the series
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);

  const startReadingUrl = totalPosts > 0 ? `/posts/${posts[0].id}` : '#';

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      
      {/* Back button */}
      <div>
        <Link href="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: 'var(--color-black)', fontSize: '15px' }}>
          <ArrowLeft size={16} />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Series Header Banner Block */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px'
      }} className="series-layout">
        
        {/* Left Side: Series Cover and Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="soft-pop-card" style={{
            backgroundColor: 'var(--color-white)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Aspect Ratio Image Poster */}
            <div style={{
              border: '3px solid var(--color-black)',
              borderRadius: '16px',
              overflow: 'hidden',
              height: '320px',
              backgroundColor: 'var(--color-grey-light)',
              boxShadow: '4px 4px 0px var(--color-black)'
            }}>
              <img src={series.cover_image} alt={series.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{
                  backgroundColor: series.type === 'series' ? 'var(--color-orange)' : series.type === 'single' ? 'var(--color-green)' : 'var(--color-blue)',
                  color: 'white',
                  border: '2px solid var(--color-black)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  boxShadow: '2px 2px 0px var(--color-black)'
                }}>
                  {series.type === 'series' ? 'Serialized Novel' : series.type === 'single' ? 'Micro-Stories' : 'Blog Space'}
                </span>
              </div>

              <h1 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--font-serif)', lineHeight: 1.1 }}>{series.title}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={series.author?.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--color-black)' }} />
                <div>
                  <Link href={`/authors/${series.author?.id}`} style={{ fontWeight: 800, color: 'var(--color-black)', textDecoration: 'underline' }}>
                    {series.author?.name}
                  </Link>
                  <p style={{ fontSize: '11px', color: 'var(--color-grey-dark)' }}>Creator / Writer</p>
                </div>
              </div>

              <p style={{ fontSize: '15px', color: 'var(--color-black-soft)', lineHeight: 1.5 }}>
                {series.description || 'No description provided for this space.'}
              </p>
            </div>

            {/* Quick Analytics Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              borderTop: '2px dashed var(--color-grey-light)',
              paddingTop: '16px',
              textAlign: 'center'
            }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-grey-dark)', textTransform: 'uppercase' }}>
                  {series.type === 'series' ? 'Episodes' : 'Posts'}
                </p>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>{totalPosts}</h3>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-grey-dark)', textTransform: 'uppercase' }}>Views</p>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>{totalViews}</h3>
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-grey-dark)', textTransform: 'uppercase' }}>Likes</p>
                <h3 style={{ fontSize: '20px', fontWeight: 900 }}>{totalLikes}</h3>
              </div>
            </div>

            {/* Start Reading Call to Action */}
            <div style={{ marginTop: '8px' }}>
              <Button3D 
                href={startReadingUrl} 
                variant="orange" 
                disabled={totalPosts === 0} 
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                <BookOpen size={18} style={{ marginRight: '8px' }} />
                {series.type === 'series' ? 'Start Reading Ep 1' : 'Start Reading'}
              </Button3D>
            </div>
          </div>
        </div>

        {/* Right Side: Chapter / Episodes List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="soft-pop-card" style={{
            backgroundColor: 'var(--color-white)',
            padding: '24px',
            flexGrow: 1
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 900,
              borderBottom: '2.5px solid var(--color-black)',
              paddingBottom: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>
                {series.type === 'series' ? 'Table of Episodes' : 'Space Content'}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-grey-dark)', backgroundColor: 'var(--color-grey-light)', border: '1.5px solid var(--color-black)', padding: '2px 8px', borderRadius: '8px' }}>
                {totalPosts} {totalPosts === 1 ? 'item' : 'items'}
              </span>
            </h3>

            {totalPosts === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-grey-dark)' }}>
                <Sparkles size={32} style={{ margin: '0 auto 12px auto', color: 'var(--color-grey-light)' }} />
                <p style={{ fontWeight: 700, fontSize: '15px' }}>No chapters published yet.</p>
                <p style={{ fontSize: '13px' }}>Check back soon! The author has not uploaded any episodes in this space yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {posts.map((post, index) => (
                  <div key={post.id} className="table-row" style={{
                    border: '2.5px solid var(--color-black)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'transform 0.1s ease',
                    boxShadow: '3px 3px 0px var(--color-black)',
                    backgroundColor: 'var(--color-cream)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        backgroundColor: 'var(--color-white)',
                        border: '1.5px solid var(--color-black)',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {series.type === 'series' ? `Episode ${post.episode_number || index + 1}` : `Post #${index + 1}`}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-grey-dark)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {post.read_time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          {new Date(post.published_at || post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '17px', fontWeight: 850 }}>
                      <Link href={`/posts/${post.id}`} style={{ color: 'var(--color-black)', textDecoration: 'none' }} className="hover-orange">
                        {post.title}
                      </Link>
                    </h4>

                    <p style={{
                      fontSize: '14px',
                      color: 'var(--color-black-soft)',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {post.excerpt}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-grey-dark)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} />
                          {post.views || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={12} />
                          {post.likes || 0}
                        </span>
                      </div>
                      
                      <Link href={`/posts/${post.id}`} style={{ display: 'inline-flex' }}>
                        <Button3D variant="white" style={{ padding: '6px 14px', fontSize: '12px' }}>
                          Read Content →
                        </Button3D>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
