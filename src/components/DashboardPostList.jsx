'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button3D from './Button3D';
import { Edit, Trash2, Eye, Heart, ExternalLink } from 'lucide-react';

export default function DashboardPostList({ posts }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert('Failed to delete post: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px',
        border: '3px dashed var(--color-grey-medium)',
        borderRadius: '24px',
        backgroundColor: 'var(--color-white)',
        marginTop: '16px'
      }}>
        <p style={{ color: 'var(--color-grey-dark)', fontWeight: 600, marginBottom: '16px' }}>
          You haven't written any stories yet.
        </p>
        <Button3D href="/author/new" variant="orange">
          Write Your First Story
        </Button3D>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
      {/* Mobile Card View / Desktop Table View */}
      <div className="posts-table-container" style={{
        backgroundColor: 'var(--color-white)',
        border: '3px solid var(--color-black)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '4px 4px 0px var(--color-black)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{
              backgroundColor: 'var(--color-grey-light)',
              borderBottom: '3px solid var(--color-black)'
            }}>
              <th style={{ padding: '16px', fontWeight: 800 }}>Story</th>
              <th style={{ padding: '16px', fontWeight: 800, display: 'none' }} className="desktop-col">Status</th>
              <th style={{ padding: '16px', fontWeight: 800, display: 'none' }} className="desktop-col">Stats</th>
              <th style={{ padding: '16px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <tr key={post.id} style={{
                  borderBottom: '2px solid var(--color-grey-light)'
                }} className="table-row">
                  {/* Title & Preview Image */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '60px',
                        height: '45px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid var(--color-black)',
                        flexShrink: 0
                      }}>
                        <img src={post.preview_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {post.title}
                          {post.status === 'published' && (
                            <Link href={`/posts/${post.id}`} target="_blank" style={{ color: 'var(--color-blue)', display: 'inline-flex' }}>
                              <ExternalLink size={12} />
                            </Link>
                          )}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--color-grey-dark)' }}>Created {formattedDate}</span>
                        {/* Mobile status display */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }} className="mobile-only-flex">
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            backgroundColor: post.status === 'published' ? 'rgba(29, 78, 216, 0.1)' : 'rgba(255, 90, 31, 0.1)',
                            color: post.status === 'published' ? 'var(--color-blue)' : 'var(--color-orange)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            border: '1.5px solid var(--color-black)'
                          }}>
                            {post.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status (Desktop only) */}
                  <td style={{ padding: '16px', display: 'none' }} className="desktop-col">
                    <span style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      backgroundColor: post.status === 'published' ? 'rgba(29, 78, 216, 0.1)' : 'rgba(255, 90, 31, 0.1)',
                      color: post.status === 'published' ? 'var(--color-blue)' : 'var(--color-orange)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      border: '2px solid var(--color-black)',
                      boxShadow: '1.5px 1.5px 0px var(--color-black)'
                    }}>
                      {post.status}
                    </span>
                  </td>

                  {/* Stats (Desktop only) */}
                  <td style={{ padding: '16px', display: 'none' }} className="desktop-col">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--color-grey-dark)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} />
                        {post.views}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={14} />
                        {post.likes}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Button3D href={`/author/edit/${post.id}`} variant="white" style={{ padding: '6px 10px', borderRadius: '10px' }} title="Edit Story">
                        <Edit size={14} style={{ color: 'var(--color-blue)' }} />
                      </Button3D>
                      <Button3D
                        variant="red"
                        onClick={() => handleDelete(post.id, post.title)}
                        style={{ padding: '6px 10px', borderRadius: '10px' }}
                        disabled={deletingId === post.id}
                        title="Delete Story"
                      >
                        <Trash2 size={14} />
                      </Button3D>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


    </div>
  );
}
