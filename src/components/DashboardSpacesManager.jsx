'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button3D from './Button3D';
import { Settings, BookOpen, MessageSquare, FileText, Image as ImageIcon, Loader2, X, PlusCircle } from 'lucide-react';

export default function DashboardSpacesManager({ spaces, authorId }) {
  const router = useRouter();
  const [editingSpace, setEditingSpace] = useState(null); // The space object being edited
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('blog');
  const [coverImage, setCoverImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleEditClick = (space) => {
    setEditingSpace(space);
    setTitle(space.title || '');
    setDescription(space.description || '');
    setType(space.type || 'blog');
    setCoverImage(space.cover_image || '');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert('Space title is required');

    setSaving(true);
    try {
      const res = await fetch('/api/series', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSpace.id,
          title,
          description,
          type,
          cover_image: coverImage
        })
      });

      if (res.ok) {
        setEditingSpace(null);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save space customization');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const getSpaceIcon = (spaceType) => {
    switch (spaceType) {
      case 'series': return <BookOpen size={16} style={{ color: 'var(--color-orange)' }} />;
      case 'single': return <MessageSquare size={16} style={{ color: 'var(--color-green)' }} />;
      default: return <FileText size={16} style={{ color: 'var(--color-blue)' }} />;
    }
  };

  const getSpaceTypeLabel = (spaceType) => {
    switch (spaceType) {
      case 'series': return 'Serialized Novel';
      case 'single': return 'Micro-post stream';
      default: return 'Blog Publication';
    }
  };

  if (!spaces || spaces.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px',
        border: '2.5px dashed var(--color-grey-medium)',
        borderRadius: '20px',
        backgroundColor: 'var(--color-white)',
        marginTop: '12px'
      }}>
        <p style={{ color: 'var(--color-grey-dark)', fontWeight: 700 }}>
          You have not created any publication spaces yet. 
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-grey-dark)', marginTop: '4px', marginBottom: '12px' }}>
          Spaces let you group your novels, blogs, or micro-posts under unique banners and URLs.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {spaces.map(space => (
          <div key={space.id} className="soft-pop-card" style={{
            backgroundColor: 'var(--color-white)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '16px',
            gap: '12px',
            position: 'relative'
          }}>
            {/* Space Cover Banner */}
            <div style={{
              height: '110px',
              borderRadius: '12px',
              border: '2px solid var(--color-black)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img src={space.cover_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* Type tag badge */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                backgroundColor: 'var(--color-black)',
                color: 'white',
                border: '1.5px solid white',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '9px',
                fontWeight: 900,
                textTransform: 'uppercase'
              }}>
                {space.type}
              </div>
            </div>

            {/* Info details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {getSpaceIcon(space.type)}
                <h4 style={{ fontWeight: 900, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                  {space.title}
                </h4>
              </div>
              <p style={{
                fontSize: '12px',
                color: 'var(--color-grey-dark)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {space.description || 'No description provided.'}
              </p>
            </div>

            {/* Customize action footer */}
            <div style={{
              borderTop: '1.5px dashed var(--color-grey-light)',
              paddingTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--color-grey-dark)', fontWeight: 700 }}>
                Prefix: s/{space.title.toLowerCase().replace(/\s+/g, '-').substring(0, 15)}
              </span>
              
              <Button3D
                variant="white"
                onClick={() => handleEditClick(space)}
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                <Settings size={12} style={{ marginRight: '4px' }} />
                Customize
              </Button3D>
            </div>
          </div>
        ))}
      </div>

      {/* SPACE EDIT MODAL */}
      {editingSpace && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <form onSubmit={handleSave} className="soft-pop-card animate-pop-in" style={{
            backgroundColor: 'var(--color-white)',
            maxWidth: '480px',
            width: '100%',
            padding: '24px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <button
              type="button"
              onClick={() => setEditingSpace(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-black)'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} style={{ color: 'var(--color-orange)' }} />
              Space Customization
            </h3>

            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>Space Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="soft-pop-input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>Space Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="soft-pop-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="series">📚 Series (Serialized episodes - Ep 1, Ep 2...)</option>
                <option value="blog">📝 Blog (Standard publication layout)</option>
                <option value="single">💬 Standalone (Short micro-posting stream)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  height: '80px',
                  border: '3px solid var(--color-black)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Banner Cover Art Upload */}
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>Banner Image URL</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  id="space-cover-image-upload"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="space-cover-image-upload"
                  style={{
                    backgroundColor: 'var(--color-white)',
                    border: '2.5px solid var(--color-black)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '13px',
                    boxShadow: '2px 2px 0px var(--color-black)'
                  }}
                  className="btn-pop"
                >
                  {uploading ? <Loader2 className="animate-spin" size={14} /> : 'Change Cover Banner'}
                </label>
                {coverImage && (
                  <img 
                    src={coverImage} 
                    alt="Space Cover Preview" 
                    style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid var(--color-black)' }} 
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setEditingSpace(null)}
                style={{
                  backgroundColor: 'var(--color-cream)',
                  border: '2.5px solid var(--color-black)',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <Button3D
                variant="orange"
                type="submit"
                disabled={saving || uploading}
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                {saving ? 'Saving...' : 'Save Customizations'}
              </Button3D>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
