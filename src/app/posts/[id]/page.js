import { getPostById, getCommentsByPostId, incrementPostViews } from '@/lib/db';
import CommentForm from '@/components/CommentForm';
import Button3D from '@/components/Button3D';
import Link from 'next/link';
import { ArrowLeft, Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react';

const formatContentToHtml = (rawContent) => {
  if (!rawContent) return '';
  // Check if it already has block-level HTML tags that structure layout
  const hasBlockTags = /<(p|div|h[1-6]|blockquote|ul|ol|li|br|section|article|pre|code)\b/i.test(rawContent);
  if (hasBlockTags) return rawContent;
  
  // Split by double newlines or carriage returns to get separate paragraphs
  return rawContent
    .split(/\r?\n\s*\r?\n/)
    .map(para => {
      const cleanPara = para.trim();
      if (!cleanPara) return '';
      // Replace single line breaks with <br /> tags
      return `<p>${cleanPara.replace(/\r?\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('\n');
};

export default async function PostDetail({ params }) {
  const { id } = await params;
  
  const post = await getPostById(id);

  if (!post) {
    return (
      <div className="container" style={{ padding: '60px 24px' }}>
        <div className="soft-pop-card" style={{
          textAlign: 'center',
          backgroundColor: 'var(--color-white)',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-red)', marginBottom: '12px' }}>
            Story Not Found
          </h2>
          <p style={{ color: 'var(--color-grey-dark)', marginBottom: '24px' }}>
            The article you are looking for might have been deleted, draft-saved, or the address was entered incorrectly.
          </p>
          <Button3D href="/" variant="orange">
            Back to Home Feed
          </Button3D>
        </div>
      </div>
    );
  }

  // Increment views
  await incrementPostViews(post.id);

  // Fetch comments
  const comments = await getCommentsByPostId(post.id);

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Draft';

  // Soft pop color based on category
  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'design': return 'var(--color-orange)';
      case 'philosophy': return 'var(--color-blue)';
      case 'tech': return 'var(--color-black)';
      case 'life': return 'var(--color-red)';
      default: return 'var(--color-grey-dark)';
    }
  };

  return (
    <article className="container" style={{ maxWidth: '800px' }}>
      {/* Back navigation */}
      <div style={{ marginBottom: '24px' }}>
        <Button3D href="/" variant="white" style={{ padding: '8px 16px', fontSize: '14px' }}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Back to Feed
        </Button3D>
      </div>

      {/* Category and Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {post.series ? (
          <Link href={`/series/${post.series.id}`} style={{ textDecoration: 'none' }}>
            <span style={{
              backgroundColor: post.series.type === 'series' ? 'var(--color-orange)' : post.series.type === 'single' ? 'var(--color-green)' : 'var(--color-blue)',
              color: 'white',
              fontWeight: 900,
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '8px',
              border: '2px solid var(--color-black)',
              boxShadow: '2px 2px 0px var(--color-black)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {post.series.type === 'series' ? '📚' : post.series.type === 'single' ? '💬' : '📝'} {post.series.title}
            </span>
          </Link>
        ) : post.category && post.category !== 'General' ? (
          <span style={{
            backgroundColor: getCategoryColor(post.category),
            color: 'white',
            fontWeight: 800,
            fontSize: '12px',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '8px',
            border: '2px solid var(--color-black)',
            boxShadow: '2px 2px 0px var(--color-black)'
          }}>
            {post.category}
          </span>
        ) : null}
        <span style={{ fontSize: '14px', color: 'var(--color-grey-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={14} />
          {formattedDate}
        </span>
        <span style={{ fontSize: '14px', color: 'var(--color-grey-dark)' }}>•</span>
        <span style={{ fontSize: '14px', color: 'var(--color-grey-dark)' }}>{post.read_time}</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
        fontWeight: 900,
        lineHeight: 1.15,
        color: 'var(--color-black)',
        marginBottom: '24px'
      }}>
        {post.title}
      </h1>

      {/* Author Header Profile */}
      {post.author && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '2px solid var(--color-black)',
          borderBottom: '2px solid var(--color-black)',
          padding: '16px 0',
          marginBottom: '32px',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href={`/authors/${post.author.id}`}>
              <img
                src={post.author.avatar}
                alt={post.author.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid var(--color-black)',
                  objectFit: 'cover'
                }}
              />
            </Link>
            <div>
              <Link href={`/authors/${post.author.id}`} style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-black)' }}>
                {post.author.name}
              </Link>
              <p style={{ fontSize: '13px', color: 'var(--color-grey-dark)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.author.bio}
              </p>
            </div>
          </div>
          
          <Button3D href={`/authors/${post.author.id}`} variant="white" style={{ padding: '6px 14px', fontSize: '13px' }}>
            View Profile
          </Button3D>
        </div>
      )}

      {/* Cover Image Frame */}
      {post.preview_image && (
        <div className="soft-pop-card" style={{
          padding: 0,
          borderRadius: '24px',
          overflow: 'hidden',
          height: 'clamp(200px, 40vw, 420px)',
          marginBottom: '40px',
          boxShadow: '8px 8px 0px var(--color-black)'
        }}>
          <img
            src={post.preview_image}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Genres Hashtags */}
      {post.genres && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {post.genres.split(',').map((g) => {
            const genreTrimmed = g.trim();
            if (!genreTrimmed) return null;
            return (
              <span 
                key={genreTrimmed} 
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  color: 'var(--color-grey-dark)',
                  backgroundColor: 'var(--color-grey-light)',
                  border: '2px solid var(--color-black)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  boxShadow: '1.5px 1.5px 0px var(--color-black)',
                  textTransform: 'uppercase'
                }}
              >
                #{genreTrimmed}
              </span>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <section 
        className="blog-content-body"
        style={{
          fontSize: '18px',
          lineHeight: '1.8',
          color: 'var(--color-black-soft)',
          marginBottom: '60px'
        }}
        dangerouslySetInnerHTML={{ __html: formatContentToHtml(post.content) }}
      />

      {/* Views and Likes footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        borderTop: '2px solid var(--color-grey-light)',
        paddingTop: '24px',
        marginBottom: '60px',
        color: 'var(--color-grey-dark)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
          <Eye size={18} />
          {post.views + 1} views
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
          <Heart size={18} />
          {post.likes} likes
        </span>
      </div>

      {/* Comments section */}
      <section style={{
        backgroundColor: 'var(--color-white)',
        border: '3px solid var(--color-black)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '6px 6px 0px var(--color-black)',
        marginBottom: '40px'
      }}>
        <h3 style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '22px',
          fontWeight: 800,
          borderBottom: '2px solid var(--color-black)',
          paddingBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MessageCircle size={22} style={{ color: 'var(--color-blue)' }} />
          Responses ({comments.length})
        </h3>

        {/* Existing responses */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--color-grey-dark)', fontStyle: 'italic', padding: '12px 0' }}>
              No responses yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id}
                style={{
                  backgroundColor: 'var(--color-grey-light)',
                  border: '2px solid var(--color-black)',
                  borderRadius: '16px',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} style={{ color: 'var(--color-grey-dark)' }} />
                    {comment.author_name}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-grey-dark)' }}>
                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-black-soft)', whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Comment input form */}
        <CommentForm postId={post.id} />
      </section>


    </article>
  );
}
