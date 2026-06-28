import Link from 'next/link';
import { Eye, Heart, Calendar } from 'lucide-react';

export default function PostCard({ post }) {
  if (!post) return null;

  const {
    id,
    title,
    excerpt,
    preview_image,
    category,
    read_time,
    views = 0,
    likes = 0,
    published_at,
    author
  } = post;

  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString('en-US', {
        month: 'short',
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

  const categoryBg = getCategoryColor(category);

  return (
    <article className="soft-pop-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      padding: 0,
      backgroundColor: 'var(--color-white)'
    }}>
      {/* Post Cover Link */}
      <Link href={`/posts/${id}`} style={{ display: 'block', position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
        <img
          src={preview_image}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          className="post-card-img"
        />
        {/* Category Badge */}
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: categoryBg,
          color: 'white',
          fontWeight: 800,
          fontSize: '12px',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '8px',
          border: '2px solid var(--color-black)',
          boxShadow: '2px 2px 0px var(--color-black)'
        }}>
          {category}
        </span>
      </Link>

      {/* Card Content */}
      <div style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '12px'
      }}>
        {/* Author Metadata */}
        {author && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href={`/authors/${author.id}`}>
              <img
                src={author.avatar}
                alt={author.name}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--color-black)',
                  objectFit: 'cover'
                }}
              />
            </Link>
            <Link href={`/authors/${author.id}`} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-black-soft)' }}>
              {author.name}
            </Link>
            <span style={{ fontSize: '12px', color: 'var(--color-grey-dark)' }}>•</span>
            <span style={{ fontSize: '12px', color: 'var(--color-grey-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} />
              {formattedDate}
            </span>
          </div>
        )}

        {/* Title */}
        <Link href={`/posts/${id}`}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 800,
            lineHeight: 1.3,
            color: 'var(--color-black)',
            fontFamily: 'var(--font-sans)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }} className="post-card-title">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p style={{
          fontSize: '14px',
          color: 'var(--color-grey-dark)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flexGrow: 1
        }}>
          {excerpt}
        </p>

        {/* Bottom Metadata */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'between',
          borderTop: '2px solid var(--color-grey-light)',
          paddingTop: '16px',
          marginTop: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-grey-dark)', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={14} />
              {views}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Heart size={14} />
              {likes}
            </span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-grey-dark)', marginLeft: 'auto' }}>
            {read_time}
          </span>
        </div>
      </div>


    </article>
  );
}
