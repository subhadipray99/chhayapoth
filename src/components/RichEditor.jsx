'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button3D from './Button3D';
import { Image, Heading, Bold, Italic, Quote, Link as LinkIcon, List, Eye, Edit3, Loader2, BookOpen, X } from 'lucide-react';

// Helper to convert plain text newlines to HTML if no tags exist
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

export default function RichEditor({
  authorId,
  initialSeriesId = '',
  initialTitle = '',
  initialCategory = 'Design',
  initialImage = '',
  initialContent = '',
  initialGenres = 'Random',
  onSubmit,
  submitLabel = 'Publish Post',
  submitting = false
}) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState(initialCategory);
  const [previewImage, setPreviewImage] = useState(initialImage);
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState('write'); // write | preview
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);

  // Genre selection states
  const [selectedGenres, setSelectedGenres] = useState(
    initialGenres ? initialGenres.split(',') : ['Random']
  );
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

  // Series selection states
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState(initialSeriesId);

  // Modal State for New Series
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDesc, setNewSeriesDesc] = useState('');
  const [newSeriesType, setNewSeriesType] = useState('blog'); // series | blog | single
  const [newSeriesCover, setNewSeriesCover] = useState('');
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const categories = ['Design', 'Philosophy', 'Tech', 'Life'];

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
        if (data.series.length > 0 && !selectedSeriesId) {
          setSelectedSeriesId(data.series[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load series:', err);
    }
  };

  const selectedSeries = seriesList.find(s => s.id === selectedSeriesId);

  // Handle preview image upload
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
        setPreviewImage(data.url);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (selectedSeries?.type !== 'single' && selectedSeries?.type !== 'series' && !title.trim()) {
      return alert('Please enter a title');
    }
    if (!content.trim()) return alert('Please write some content');
    
    onSubmit({
      title: selectedSeries?.type === 'single' ? '' : title,
      category,
      preview_image: previewImage,
      content: formatContentToHtml(content),
      series_id: selectedSeriesId,
      genres: selectedGenres.join(',')
    });
  };

  return (
    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="editor-grid">
        {/* Editor Settings Panel (Left/Top) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Series / Space Selection */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 800, fontSize: '15px' }}>Space / Series</label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-blue)',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                + Create New Space
              </button>
            </div>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="soft-pop-input"
              style={{ cursor: 'pointer' }}
            >
              {seriesList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.type === 'series' ? '📚 ' : s.type === 'single' ? '💬 ' : '📝 '}
                  {s.title}
                </option>
              ))}
            </select>
            {selectedSeries && (
              <p style={{ fontSize: '12px', color: 'var(--color-grey-dark)', marginTop: '6px', fontWeight: 700 }}>
                Type: {selectedSeries.type === 'series' ? 'Serialized Novel (Episodes)' : selectedSeries.type === 'single' ? 'Standalone (Micro-post)' : 'Blog Space'}
              </p>
            )}
          </div>

          {/* Title Input (Hidden if space type is single) */}
          {selectedSeries?.type !== 'single' && (
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>Post Title</label>
              <input
                type="text"
                placeholder={selectedSeries?.type === 'series' ? "Episode Title (Optional, defaults to Episode #)" : "Enter a compelling title..."}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="soft-pop-input"
                style={{ fontSize: '20px', fontWeight: 700 }}
                required={selectedSeries?.type !== 'series'}
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="soft-pop-input"
                style={{ appearance: 'none', cursor: 'pointer' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>Cover Image</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="cover-image-file"
                />
                <label 
                  htmlFor="cover-image-file"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    border: '3px solid var(--color-black)',
                    borderRadius: '16px',
                    backgroundColor: 'var(--color-white)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px var(--color-black)'
                  }}
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Image size={16} />}
                  {uploading ? 'Uploading...' : 'Choose Image'}
                </label>
              </div>
            </div>
          </div>

          {/* Genres selection */}
          <div>
            <label style={{ display: 'block', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>
              Genres (Select up to 3)
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
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 850,
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

          {/* Preview Image Frame */}
          {previewImage && (
            <div style={{
              border: '3px solid var(--color-black)',
              borderRadius: '16px',
              overflow: 'hidden',
              height: '180px',
              position: 'relative',
              boxShadow: '4px 4px 0px var(--color-black)'
            }}>
              <img 
                src={previewImage} 
                alt="Cover Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => setPreviewImage('')}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'var(--color-red)',
                  color: 'white',
                  border: '2px solid var(--color-black)',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 800
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Content Editor Panel */}
        <div className="soft-pop-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '450px' }}>
          {/* Editor Header / Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--color-black)',
            paddingBottom: '12px',
            marginBottom: '12px',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {activeTab === 'write' ? (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('<h2>', '</h2>')}
                  title="Heading"
                  className="editor-tool-btn"
                >
                  <Heading size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('<strong>', '</strong>')}
                  title="Bold"
                  className="editor-tool-btn"
                >
                  <Bold size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('<em>', '</em>')}
                  title="Italic"
                  className="editor-tool-btn"
                >
                  <Italic size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('<blockquote>\n  "', '"\n</blockquote>')}
                  title="Quote"
                  className="editor-tool-btn"
                >
                  <Quote size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('<a href="https://example.com" target="_blank">', '</a>')}
                  title="Link"
                  className="editor-tool-btn"
                >
                  <LinkIcon size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                  title="Bullet List"
                  className="editor-tool-btn"
                >
                  <List size={16} />
                </button>
              </div>
            ) : <div />}

            <div style={{
              display: 'flex',
              backgroundColor: 'var(--color-grey-light)',
              borderRadius: '8px',
              padding: '2px',
              border: '2px solid var(--color-black)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'write' ? 'var(--color-white)' : 'transparent',
                  color: activeTab === 'write' ? 'var(--color-black)' : 'var(--color-grey-dark)'
                }}
              >
                <Edit3 size={14} />
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: activeTab === 'preview' ? 'var(--color-white)' : 'transparent',
                  color: activeTab === 'preview' ? 'var(--color-black)' : 'var(--color-grey-dark)'
                }}
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>

          {/* Editing Area */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'write' ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your story here..."
                style={{
                  width: '100%',
                  flexGrow: 1,
                  minHeight: '350px',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  backgroundColor: 'transparent'
                }}
              />
            ) : (
              <div 
                className="blog-preview-content"
                style={{
                  minHeight: '350px',
                  maxHeight: '550px',
                  overflowY: 'auto',
                  lineHeight: '1.7',
                  fontSize: '16px'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: formatContentToHtml(content) || '<p style="color: var(--color-grey-dark); font-style: italic;">Nothing to preview yet. Start writing!</p>' 
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
        <Button3D
          variant="orange"
          type="submit"
          disabled={submitting}
          style={{ padding: '14px 40px' }}
        >
          {submitting ? 'Saving Post...' : submitLabel}
        </Button3D>
      </div>

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
            <button
              onClick={() => setIsModalOpen(false)}
              type="button"
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  onClick={handleCreateSeries}
                  disabled={creatingSeries || uploadingCover}
                  style={{ padding: '10px 24px', fontSize: '14px' }}
                >
                  {creatingSeries ? 'Creating...' : 'Create Space'}
                </Button3D>
              </div>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}
