'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button3D from './Button3D';
import { PlusCircle, Image as ImageIcon, Send, Sparkles, BookOpen, AlertCircle, X, Loader2, Heading, Bold, Italic, Quote, Link as LinkIcon, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickComposer({ authorId }) {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const textareaRef = useRef(null);

  // Helper to insert formatting tags
  const insertFormatting = (tagStart, tagEnd = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    if (tagEnd) {
      replacement = tagStart + selectedText + tagEnd;
    } else {
      replacement = '\n' + tagStart + (selectedText || 'Text') + '\n';
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagStart.length, start + tagStart.length + (selectedText || 'Text').length);
    }, 50);
  };
  
  // Modal State for New Series
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDesc, setNewSeriesDesc] = useState('');
  const [newSeriesType, setNewSeriesType] = useState('blog'); // series | blog | single
  const [newSeriesCover, setNewSeriesCover] = useState('');
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Genre selection states
  const [selectedGenres, setSelectedGenres] = useState(['Random']);
  const AVAILABLE_GENRES = ['Random', 'Fiction', 'Poetry', 'Sci-Fi', 'Philosophy', 'Life', 'Tech', 'Mystery', 'Romance', 'Essay', 'Humor', 'History'];

  const handleGenreToggle = (genre) => {
    if (genre === 'Random') {
      setSelectedGenres(['Random']);
      return;
    }

    let updated = [...selectedGenres].filter(g => g !== 'Random');
    if (updated.includes(genre)) {
      updated = updated.filter(g => g !== genre);
      if (updated.length === 0) {
        updated = ['Random'];
      }
    } else {
      if (updated.length >= 3) {
        alert('You can select up to 3 genres.');
        return;
      }
      updated.push(genre);
    }
    setSelectedGenres(updated);
  };

  // Fetch author's series list
  useEffect(() => {
    if (authorId) {
      fetchSeries();
    }
  }, [authorId]);

  const fetchSeries = async () => {
    try {
      const res = await fetch(`/api/series?author_id=${authorId}`);
      const data = await res.json();
      if (data.series) {
        setSeriesList(data.series);
        if (data.series.length > 0) {
          // Select default or first series
          setSelectedSeriesId(data.series[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load series:', err);
    }
  };

  const selectedSeries = seriesList.find(s => s.id === selectedSeriesId);

  // Handle post image upload
  const handlePostImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setPostImage(data.url);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle series cover upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        setNewSeriesCover(data.url);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Submit new series
  const handleCreateSeries = async (e) => {
    e.preventDefault();
    if (!newSeriesTitle.trim()) return alert('Space title is required');

    setCreatingSeries(true);
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSeriesTitle,
          description: newSeriesDesc,
          cover_image: newSeriesCover,
          type: newSeriesType
        })
      });
      const data = await res.json();
      if (data.series) {
        // Refresh list
        setSeriesList(prev => [data.series, ...prev]);
        setSelectedSeriesId(data.series.id);
        
        // Reset modal fields
        setNewSeriesTitle('');
        setNewSeriesDesc('');
        setNewSeriesCover('');
        setNewSeriesType('blog');
        setIsModalOpen(false);
      } else {
        alert(data.error || 'Failed to create series');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating series');
    } finally {
      setCreatingSeries(false);
    }
  };

  // Submit post
  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return alert('Post content cannot be empty!');
    if (!selectedSeriesId) return alert('Please select a Series or Space to post to!');

    setLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedSeries?.type === 'single' ? '' : title,
          content: content,
          preview_image: postImage,
          series_id: selectedSeriesId,
          genres: selectedGenres.join(','),
          status: 'published'
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        // Clear fields
        setTitle('');
        setContent('');
        setPostImage('');
        setSelectedGenres(['Random']);
        
        // Refresh Dashboard feed
        router.refresh();
      } else {
        alert(data.error || 'Failed to publish post');
      }
    } catch (err) {
      console.error(err);
      alert('Error publishing post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soft-pop-card animate-pop-in" style={{
      backgroundColor: 'var(--color-white)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Space selector bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '2px solid var(--color-grey-light)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexGrow: 1 }}>
          <span style={{ fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', color: 'var(--color-grey-dark)' }}>
            Publish to:
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexGrow: 1, maxWidth: '300px' }}>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="soft-pop-input"
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                flexGrow: 1
              }}
            >
              {seriesList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.type === 'series' ? '📚 ' : s.type === 'single' ? '💬 ' : '📝 '}
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--color-blue)',
              color: 'white',
              border: '2.5px solid var(--color-black)',
              padding: '8px 14px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '2px 2px 0px var(--color-black)',
              transition: 'transform 0.1s ease'
            }}
            className="btn-pop"
          >
            <PlusCircle size={14} style={{ marginRight: '6px' }} />
            New Space
          </button>
        </div>

        {/* Selected Space Type Indicator */}
        {selectedSeries && (
          <div style={{
            backgroundColor: selectedSeries.type === 'series' ? 'rgba(249, 115, 22, 0.12)' : selectedSeries.type === 'single' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
            color: selectedSeries.type === 'series' ? 'var(--color-orange)' : selectedSeries.type === 'single' ? 'var(--color-green)' : 'var(--color-blue)',
            border: '2.5px solid var(--color-black)',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={12} />
            <span>
              {selectedSeries.type === 'series' ? 'Serialized Novel (Episodes)' : selectedSeries.type === 'single' ? 'Standalone Single (Micro-post)' : 'Blog Space (Articles)'}
            </span>
          </div>
        )}
      </div>

      {/* Write Post Box */}
      <form onSubmit={handlePublishPost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Title Input (only shown if type is NOT single) */}
        {selectedSeries?.type !== 'single' && (
          <input
            type="text"
            placeholder={selectedSeries?.type === 'series' ? "Episode Title (Optional, defaults to Episode #)" : "Post Title (Recommended)"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="soft-pop-input"
            style={{
              padding: '10px 14px',
              fontSize: '16px',
              fontWeight: 700
            }}
          />
        )}

        {/* Content Box */}
        <div style={{ position: 'relative' }}>
          {/* Markdown/HTML Toolbar */}
          <div style={{
            display: 'flex',
            gap: '8px',
            border: '3px solid var(--color-black)',
            borderBottom: 'none',
            backgroundColor: 'var(--color-white)',
            padding: '6px 12px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            flexWrap: 'wrap'
          }}>
            <button 
              type="button" 
              onClick={() => insertFormatting('<h2>', '</h2>')}
              title="Heading"
              style={{
                border: '1.5px solid var(--color-black)',
                padding: '4px 6px',
                display: 'flex',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
                boxShadow: '1px 1px 0px var(--color-black)'
              }}
            >
              <Heading size={13} />
            </button>
            <button 
              type="button" 
              onClick={() => insertFormatting('<strong>', '</strong>')}
              title="Bold"
              style={{
                border: '1.5px solid var(--color-black)',
                padding: '4px 6px',
                display: 'flex',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
                boxShadow: '1px 1px 0px var(--color-black)'
              }}
            >
              <Bold size={13} />
            </button>
            <button 
              type="button" 
              onClick={() => insertFormatting('<em>', '</em>')}
              title="Italic"
              style={{
                border: '1.5px solid var(--color-black)',
                padding: '4px 6px',
                display: 'flex',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
                boxShadow: '1px 1px 0px var(--color-black)'
              }}
            >
              <Italic size={13} />
            </button>
            <button 
              type="button" 
              onClick={() => insertFormatting('<blockquote>\n  "', '"\n</blockquote>')}
              title="Quote"
              style={{
                border: '1.5px solid var(--color-black)',
                padding: '4px 6px',
                display: 'flex',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
                boxShadow: '1px 1px 0px var(--color-black)'
              }}
            >
              <Quote size={13} />
            </button>
            <button 
              type="button" 
              onClick={() => insertFormatting('<a href="https://example.com" target="_blank">', '</a>')}
              title="Link"
              style={{
                border: '1.5px solid var(--color-black)',
                padding: '4px 6px',
                display: 'flex',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
                boxShadow: '1px 1px 0px var(--color-black)'
              }}
            >
              <LinkIcon size={13} />
            </button>
            <button 
              type="button" 
              onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
              title="Bullet List"
              style={{
                border: '1.5px solid var(--color-black)',
                padding: '4px 6px',
                display: 'flex',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: 'white',
                boxShadow: '1px 1px 0px var(--color-black)'
              }}
            >
              <List size={13} />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            placeholder={
              selectedSeries?.type === 'single' 
                ? "Write a standalone story, micro-post, or tweet... (Markdown and links are supported)" 
                : selectedSeries?.type === 'series' 
                ? "Write the next episode chapter... Just type like you are posting on Twitter, backend takes care of chapter ordering." 
                : "Write a new blog post article..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '130px',
              border: '3px solid var(--color-black)',
              borderTopLeftRadius: '0px',
              borderTopRightRadius: '0px',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              lineHeight: '1.6',
              outline: 'none',
              backgroundColor: 'var(--color-cream)',
              resize: 'vertical'
            }}
            required
          />
        </div>

        {/* Uploaded Post Image Preview */}
        {postImage && (
          <div style={{
            position: 'relative',
            border: '3px solid var(--color-black)',
            borderRadius: '16px',
            overflow: 'hidden',
            width: '180px',
            height: '110px',
            boxShadow: '3px 3px 0px var(--color-black)'
          }}>
            <img src={postImage} alt="Post preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => setPostImage('')}
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                backgroundColor: 'var(--color-red)',
                color: 'white',
                border: '2px solid var(--color-black)',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 900
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Genre Multi-select Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0' }}>
          <label style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-grey-dark)' }}>
            Select Genres (Up to 3):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {AVAILABLE_GENRES.map(genre => {
              const isSelected = selectedGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-black)' : 'var(--color-white)',
                    color: isSelected ? 'white' : 'var(--color-black)',
                    border: '2px solid var(--color-black)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '1.5px 1.5px 0px var(--color-black)' : 'none',
                    transition: 'all 0.1s ease'
                  }}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '4px'
        }}>
          {/* Left Toolbar */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="file"
              accept="image/*"
              id="post-image-upload"
              style={{ display: 'none' }}
              onChange={handlePostImageUpload}
              disabled={uploadingImage}
            />
            <label
              htmlFor="post-image-upload"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-white)',
                border: '2.5px solid var(--color-black)',
                padding: '8px 12px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '13px',
                boxShadow: '2px 2px 0px var(--color-black)'
              }}
              className="btn-pop"
            >
              {uploadingImage ? <Loader2 className="animate-spin" size={14} /> : <ImageIcon size={14} style={{ marginRight: '6px' }} />}
              {uploadingImage ? 'Uploading...' : 'Attach Image'}
            </label>
          </div>

          {/* Right Publish Button */}
          <Button3D
            variant="orange"
            type="submit"
            disabled={loading || uploadingImage}
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            {loading ? 'Posting...' : 'Publish'}
            <Send size={14} style={{ marginLeft: '8px' }} />
          </Button3D>
        </div>
      </form>

      {/* CREATE NEW SPACE MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="soft-pop-card animate-pop-in" style={{
            backgroundColor: 'var(--color-white)',
            maxWidth: '500px',
            width: '100%',
            padding: '24px',
            position: 'relative'
          }}>
            {/* Modal Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
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

            <h3 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} style={{ color: 'var(--color-orange)' }} />
              Create New Space / Series
            </h3>

            <form onSubmit={handleCreateSeries} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>Space Title</label>
                <input
                  type="text"
                  placeholder="e.g. Chronicles of Eldoria, Tech Insights"
                  value={newSeriesTitle}
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  className="soft-pop-input"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>Publication Type</label>
                <select
                  value={newSeriesType}
                  onChange={(e) => setNewSeriesType(e.target.value)}
                  className="soft-pop-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="series">📚 Series (Serialized episodes - Ep 1, Ep 2, Ep 3...)</option>
                  <option value="blog">📝 Blog (Normal blog posts, news, articles)</option>
                  <option value="single">💬 Standalone (Short micro-stories, tweets, reddit-style singles)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>Description</label>
                <textarea
                  placeholder="Briefly describe what this space is about..."
                  value={newSeriesDesc}
                  onChange={(e) => setNewSeriesDesc(e.target.value)}
                  style={{
                    width: '100%',
                    height: '80px',
                    border: '3px solid var(--color-black)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Cover Image Upload */}
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>Space Banner Cover</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="series-cover-upload"
                    style={{ display: 'none' }}
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                  />
                  <label
                    htmlFor="series-cover-upload"
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
                    {uploadingCover ? <Loader2 className="animate-spin" size={14} /> : 'Choose Image'}
                  </label>
                  {newSeriesCover && (
                    <img 
                      src={newSeriesCover} 
                      alt="Cover" 
                      style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid var(--color-black)' }} 
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  disabled={creatingSeries || uploadingCover}
                  style={{ padding: '10px 24px', fontSize: '14px' }}
                >
                  {creatingSeries ? 'Creating...' : 'Create Space'}
                </Button3D>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
