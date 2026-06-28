'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button3D from './Button3D';
import { Heart, MessageCircle, Eye, Share2, Sparkles, BookOpen, MessageSquare, FileText, X, Loader2, Calendar } from 'lucide-react';

export default function SocialPostCard({ post }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  // Series browser modal states
  const [showSeriesModal, setShowSeriesModal] = useState(false);
  const [seriesPosts, setSeriesPosts] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  const author = post.author || {};
  const series = post.series || {};

  // Formatter for relative time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString || post.created_at);
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const elapsed = now - past;

    if (elapsed < msPerMinute) {
      return 'just now';
    } else if (elapsed < msPerHour) {
      const minutes = Math.round(elapsed / msPerMinute);
      return `${minutes}m ago`;
    } else if (elapsed < msPerDay) {
      const hours = Math.round(elapsed / msPerHour);
      return `${hours}h ago`;
    } else {
      return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    if (hasLiked) return;

    setLikes(prev => prev + 1);
    setHasLiked(true);

    try {
      await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likes: likes + 1 })
      });
    } catch (err) {
      console.error('Failed to register like:', err);
    }
  };

  // Open the series browser modal
  const handleOpenSeries = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setShowSeriesModal(true);
    if (seriesPosts.length > 0) return;

    setLoadingSeries(true);
    try {
      const res = await fetch(`/api/series?id=${series.id}`);
      const data = await res.json();
      if (data.posts) {
        setSeriesPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to load series details:', err);
    } finally {
      setLoadingSeries(false);
    }
  };

  // Truncate content for feed
  const plainTextContent = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
  const isLongContent = plainTextContent.length > 280;
  const displayContent = isLongContent 
    ? plainTextContent.substring(0, 280) + '...'
    : plainTextContent;

  const getSpaceIcon = (type) => {
    switch (type) {
      case 'series': return <BookOpen size={13} style={{ marginRight: '4px', color: 'var(--color-orange)' }} />;
      case 'single': return <MessageSquare size={13} style={{ marginRight: '4px', color: 'var(--color-green)' }} />;
      default: return <FileText size={13} style={{ marginRight: '4px', color: 'var(--color-blue)' }} />;
    }
  };

  // Base card element
  const cardContent = (
    <div className="soft-pop-card" style={{
      backgroundColor: 'var(--color-white)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      transition: 'transform 0.15s ease',
      position: 'relative',
      zIndex: 2
    }}>
      {/* Header: Space & Author Tags */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* Author Avatar */}
        <Link href={`/authors/${author.id}`}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '2px solid var(--color-black)',
            overflow: 'hidden',
            boxShadow: '2px 2px 0px var(--color-black)'
          }}>
            <img src={author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </Link>

        {/* Space & Creator Sub-Labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', fontWeight: 800 }}>
            {series.id ? (
              <span 
                onClick={handleOpenSeries} 
                style={{ color: 'var(--color-orange)', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }} 
                className="hover-orange"
              >
                {getSpaceIcon(series.type)}
                <span>s/{series.title}</span>
              </span>
            ) : (
              <span style={{ color: 'var(--color-grey-dark)' }}>Standalone Post</span>
            )}
            
            <span style={{ color: 'var(--color-grey-dark)', fontWeight: 500 }}>•</span>
            
            <Link href={`/authors/${author.id}`} style={{ color: 'var(--color-black)', textDecoration: 'none' }} className="hover-orange">
              <span>u/{author.name}</span>
            </Link>
          </div>
          
          <div style={{ fontSize: '11px', color: 'var(--color-grey-dark)', fontWeight: 700 }}>
            {getRelativeTime(post.published_at || post.created_at)}
          </div>
        </div>
      </div>

      {/* Title / Episode Tag */}
      {series.type !== 'single' && (
        <div style={{ marginTop: '4px' }}>
          <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'var(--color-black)' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 900,
              lineHeight: 1.2
            }} className="hover-orange">
              {series.type === 'series' && post.episode_number ? (
                <span>
                  <span style={{ color: 'var(--color-orange)', marginRight: '6px' }}>Episode {post.episode_number}:</span>
                  {post.title}
                </span>
              ) : post.title}
            </h3>
          </Link>
        </div>
      )}

      {/* Content Text Block */}
      <div style={{
        fontSize: '15px',
        lineHeight: '1.6',
        color: 'var(--color-black-soft)',
        fontWeight: 500,
        whiteSpace: 'pre-line'
      }}>
        {displayContent}
        {isLongContent && (
          <Link href={`/posts/${post.id}`} style={{
            color: 'var(--color-blue)',
            fontWeight: 800,
            marginLeft: '6px',
            textDecoration: 'underline'
          }}>
            read full story
          </Link>
        )}
      </div>

      {/* Genres Hashtags */}
      {post.genres && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {post.genres.split(',').map((g) => {
            const genreTrimmed = g.trim();
            if (!genreTrimmed) return null;
            return (
              <span 
                key={genreTrimmed} 
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  color: 'var(--color-grey-dark)',
                  backgroundColor: 'var(--color-grey-light)',
                  border: '1.5px solid var(--color-black)',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  boxShadow: '1px 1px 0px var(--color-black)',
                  textTransform: 'uppercase'
                }}
              >
                #{genreTrimmed}
              </span>
            );
          })}
        </div>
      )}

      {/* Media Attachment (Cover Photo) */}
      {post.preview_image && (
        <Link href={`/posts/${post.id}`}>
          <div style={{
            border: '2.5px solid var(--color-black)',
            borderRadius: '16px',
            overflow: 'hidden',
            height: '240px',
            position: 'relative',
            boxShadow: '3px 3px 0px var(--color-black)',
            marginTop: '4px'
          }}>
            <img src={post.preview_image} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </Link>
      )}

      {/* Footer Interactive Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1.5px dashed var(--color-grey-light)',
        paddingTop: '12px',
        marginTop: '8px'
      }}>
        {/* Left Side: Upvotes & Comments */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button3D
            variant={hasLiked ? 'orange' : 'white'}
            onClick={handleLike}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            <Heart size={14} style={{ marginRight: '6px', fill: hasLiked ? 'white' : 'none' }} />
            {likes}
          </Button3D>

          <Link href={`/posts/${post.id}#comments`} style={{ display: 'inline-flex' }}>
            <Button3D variant="white" style={{ padding: '6px 14px', fontSize: '12px' }}>
              <MessageCircle size={14} style={{ marginRight: '6px' }} />
              Discuss
            </Button3D>
          </Link>
        </div>

        {/* Right Side: Views Counter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 800,
          color: 'var(--color-grey-dark)'
        }}>
          <Eye size={14} />
          <span>{post.views || 0} views</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {series.id && series.cover_image ? (
        <div style={{ position: 'relative', marginTop: '42px', zIndex: 10 }}>
          {/* Tilted Cover Peeker behind the card */}
          <div 
            onClick={handleOpenSeries}
            style={{
              position: 'absolute',
              top: '0px',
              left: '16px',
              right: '16px',
              height: '100%',
              zIndex: 1,
              border: '3px solid var(--color-black)',
              borderRadius: '24px',
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.45)), url(${series.cover_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: 'rotate(-2.5deg) translateY(-34px)',
              boxShadow: '4px 4px 0px var(--color-black)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              padding: '12px 20px',
              color: 'white',
              transition: 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
            className="series-peeker-card"
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-orange)',
              border: '1.5px solid var(--color-black)',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '10px',
              fontWeight: 900,
              boxShadow: '1.5px 1.5px 0px var(--color-black)',
              color: 'white'
            }}>
              <span>BROWSE SERIES</span>
            </div>
          </div>
          
          {/* Main Card */}
          {cardContent}
        </div>
      ) : cardContent}

      {/* Series Episodes Browser Modal */}
      {showSeriesModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} onClick={() => setShowSeriesModal(false)}>
          <div 
            style={{
              backgroundColor: 'var(--color-white)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              borderRadius: '24px',
              border: '3.5px solid var(--color-black)',
              boxShadow: '8px 8px 0px var(--color-black)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
            className="animate-pop-in"
            onClick={(e) => e.stopPropagation()} // Prevent close on card click
          >
            {/* Header / Banner area */}
            <div style={{
              position: 'relative',
              height: '180px',
              backgroundColor: 'var(--color-black)',
              flexShrink: 0
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.85)), url(${series.cover_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowSeriesModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'var(--color-white)',
                  border: '2px solid var(--color-black)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 900,
                  boxShadow: '2px 2px 0px var(--color-black)',
                  zIndex: 10
                }}
              >
                <X size={16} />
              </button>

              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <span style={{
                  alignSelf: 'flex-start',
                  backgroundColor: series.type === 'series' ? 'var(--color-orange)' : series.type === 'single' ? 'var(--color-green)' : 'var(--color-blue)',
                  border: '1.5px solid var(--color-black)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '9px',
                  fontWeight: 900,
                  textTransform: 'uppercase'
                }}>
                  {series.type === 'series' ? 'Novel Series' : series.type === 'single' ? 'Micro-post stream' : 'Blog Space'}
                </span>
                <h3 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-serif)' }}>{series.title}</h3>
              </div>
            </div>

            {/* Description & Episodes list */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flexGrow: 1
            }}>
              {series.description && (
                <p style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: 'var(--color-black-soft)',
                  borderBottom: '2px dashed var(--color-grey-light)',
                  paddingBottom: '14px',
                  margin: 0
                }}>
                  {series.description}
                </p>
              )}

              <h4 style={{ fontSize: '15px', fontWeight: 900, margin: 0, textTransform: 'uppercase', color: 'var(--color-grey-dark)' }}>
                {series.type === 'series' ? 'Table of Episodes' : 'Publications'}
              </h4>

              {loadingSeries ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 className="animate-spin" size={24} style={{ color: 'var(--color-orange)' }} />
                </div>
              ) : seriesPosts.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--color-grey-dark)', fontSize: '13px' }}>No episodes loaded.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {seriesPosts.map((ep, idx) => (
                    <Link 
                      key={ep.id} 
                      href={`/posts/${ep.id}`}
                      style={{ textDecoration: 'none', color: 'var(--color-black)' }}
                      onClick={() => setShowSeriesModal(false)}
                    >
                      <div className="table-row" style={{
                        border: '2px solid var(--color-black)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        boxShadow: '2px 2px 0px var(--color-black)',
                        backgroundColor: 'var(--color-cream)'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--color-grey-dark)' }}>
                            {series.type === 'series' ? `Episode ${ep.episode_number || idx + 1}` : `Post #${idx + 1}`}
                          </span>
                          <span style={{ fontWeight: 800, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ep.title || 'Untitled Post'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-grey-dark)', flexShrink: 0 }}>
                          {ep.read_time}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '2.5px solid var(--color-black)',
              backgroundColor: 'var(--color-grey-light)',
              display: 'flex',
              justifyContent: 'flex-end',
              flexShrink: 0
            }}>
              <Link href={`/series/${series.id}`} onClick={() => setShowSeriesModal(false)}>
                <Button3D variant="orange" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Open Show Page
                </Button3D>
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
