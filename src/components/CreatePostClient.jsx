'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichEditor from './RichEditor';
import Button3D from './Button3D';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function CreatePostClient({ authorId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (postData) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postData,
          status: 'published' // Auto-publish for simplicity, can support draft toggling
        })
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/posts/${data.post.id}`);
        router.refresh();
      } else {
        const err = await res.json();
        alert('Failed to publish story: ' + err.error);
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('An error occurred during publishing. Please try again.');
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
            <h1 style={{ fontSize: '24px', fontWeight: 900 }}>Create New Reflection</h1>
            <p style={{ fontSize: '13px', color: 'var(--color-grey-dark)' }}>Draft and publish a new story on Chhayapoth.</p>
          </div>
        </div>
      </div>

      {/* Editor component */}
      <RichEditor
        authorId={authorId}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Publish Story"
      />
    </div>
  );
}
