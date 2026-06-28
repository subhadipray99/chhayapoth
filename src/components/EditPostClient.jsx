'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichEditor from './RichEditor';
import Button3D from './Button3D';
import { ArrowLeft } from 'lucide-react';

export default function EditPostClient({ post, authorId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (postData) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (res.ok) {
        router.push(`/posts/${post.id}`);
        router.refresh();
      } else {
        const err = await res.json();
        alert('Failed to update story: ' + err.error);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('An error occurred during updating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '3px solid var(--color-black)',
        paddingBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button3D href="/author" variant="white" style={{ padding: '8px 16px', fontSize: '14px' }}>
            <ArrowLeft size={16} />
          </Button3D>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900 }}>Edit Story</h1>
            <p style={{ fontSize: '13px', color: 'var(--color-grey-dark)' }}>Modify your published reflection or draft.</p>
          </div>
        </div>
      </div>

      {/* Editor component populated with current post details */}
      <RichEditor
        authorId={authorId}
        initialSeriesId={post.series_id}
        initialTitle={post.title}
        initialCategory={post.category}
        initialImage={post.preview_image}
        initialContent={post.content}
        initialGenres={post.genres}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Save Changes"
      />
    </div>
  );
}
