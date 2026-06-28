import { getAuthorById, getPosts } from '@/lib/db';
import PostCard from '@/components/PostCard';
import Button3D from '@/components/Button3D';
import { ArrowLeft, BookOpen, Feather, Mail } from 'lucide-react';

export default async function AuthorProfile({ params }) {
  const { id } = await params;

  const author = await getAuthorById(id);

  if (!author) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="soft-pop-card" style={{
          textAlign: 'center',
          backgroundColor: 'var(--color-white)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-red)', marginBottom: '12px' }}>
            Author Not Found
          </h2>
          <p style={{ color: 'var(--color-grey-dark)', marginBottom: '24px' }}>
            The profile you are trying to view does not exist or may have been deactivated.
          </p>
          <Button3D href="/" variant="orange">
            Back to Feed
          </Button3D>
        </div>
      </div>
    );
  }

  // Fetch author posts
  const allPosts = await getPosts();
  const authorPosts = allPosts.filter(p => p.author_id === author.id && p.status === 'published');

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Back button */}
      <div>
        <Button3D href="/" variant="white" style={{ padding: '8px 16px', fontSize: '14px' }}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Back to Feed
        </Button3D>
      </div>

      {/* Author Header Card */}
      <section className="soft-pop-card" style={{
        backgroundColor: 'var(--color-white)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        alignItems: 'center',
        textAlign: 'center'
      }} className="soft-pop-card author-header-pop">
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '3px solid var(--color-black)',
          overflow: 'hidden',
          boxShadow: '4px 4px 0px var(--color-black)'
        }}>
          <img
            src={author.avatar}
            alt={author.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '600px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: 'var(--color-black)'
          }}>
            {author.name}
          </h1>

          <p style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '14px',
            color: 'var(--color-grey-dark)',
            fontWeight: 600
          }}>
            <Mail size={14} />
            {author.email}
          </p>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'var(--color-black-soft)',
            marginTop: '8px'
          }}>
            {author.bio}
          </p>
        </div>

        {/* Info badges */}
        <div style={{
          display: 'flex',
          gap: '16px',
          borderTop: '2px solid var(--color-grey-light)',
          paddingTop: '20px',
          width: '100%',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'var(--color-grey-light)',
            border: '2px solid var(--color-black)',
            padding: '8px 16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800,
            fontSize: '14px'
          }}>
            <Feather size={16} style={{ color: 'var(--color-orange)' }} />
            <span>{authorPosts.length} Published {authorPosts.length === 1 ? 'Story' : 'Stories'}</span>
          </div>
        </div>
      </section>

      {/* Author posts grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '20px', borderBottom: '3px solid var(--color-black)', paddingBottom: '12px' }}>
          <BookOpen size={20} style={{ color: 'var(--color-orange)' }} />
          <span>Stories by {author.name}</span>
        </div>

        {authorPosts.length === 0 ? (
          <div className="soft-pop-card" style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'var(--color-white)'
          }}>
            <p style={{ color: 'var(--color-grey-dark)', fontStyle: 'italic' }}>
              This author hasn't published any stories yet.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '32px'
          }}>
            {authorPosts.map((post) => (
              <div key={post.id}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </section>


    </div>
  );
}
