'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button3D from './Button3D';
import { Send, MessageSquare } from 'lucide-react';

export default function CommentForm({ postId }) {
  const router = useRouter();
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          author_name: authorName,
          content
        })
      });

      if (res.ok) {
        setContent('');
        setAuthorName('');
        router.refresh();
      } else {
        const err = await res.json();
        alert('Failed to post comment: ' + err.error);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginTop: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px' }}>
        <MessageSquare size={18} style={{ color: 'var(--color-orange)' }} />
        <span>Leave a Response</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }} className="comment-form-grid">
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>Your Name (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Satyajit Sen"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="soft-pop-input"
            style={{ padding: '10px 14px', fontSize: '14px' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>Response</label>
          <textarea
            placeholder="What are your thoughts on this story?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="soft-pop-input"
            style={{ height: '100px', resize: 'none', padding: '12px 14px', fontSize: '14px' }}
            required
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button3D
          variant="orange"
          type="submit"
          disabled={submitting}
          style={{ padding: '8px 24px', fontSize: '14px' }}
        >
          <Send size={14} style={{ marginRight: '6px' }} />
          {submitting ? 'Submitting...' : 'Submit'}
        </Button3D>
      </div>


    </form>
  );
}
