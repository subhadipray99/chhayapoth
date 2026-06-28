import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
} else {
  console.warn(
    'Supabase Warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Database calls will fail at runtime.'
  );
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase Database connection is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your env keys.'
    );
  }
}

export async function getPosts(filter = {}) {
  ensureSupabase();
  let query = supabase
    .from('posts')
    .select('*, author:authors(*), series:series(*)')
    .order('published_at', { ascending: false });

  if (filter.category) query = query.eq('category', filter.category);
  if (filter.status) query = query.eq('status', filter.status);
  if (filter.author_id) query = query.eq('author_id', filter.author_id);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching posts from Supabase:', error);
    throw error;
  }
  return data || [];
}

export async function getPostById(id) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:authors(*), series:series(*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    // If not found, try slug match
    const { data: dataSlug, error: errorSlug } = await supabase
      .from('posts')
      .select('*, author:authors(*), series:series(*)')
      .eq('slug', id)
      .maybeSingle();

    if (errorSlug) {
      console.error('Error fetching post by ID or Slug from Supabase:', errorSlug);
      throw errorSlug;
    }
    return dataSlug;
  }
  return data;
}

export async function createPost(postData) {
  ensureSupabase();
  const newId = 'post-' + Math.random().toString(36).substr(2, 9);
  
  let episodeNumber = null;
  let title = postData.title;
  let seriesId = postData.series_id || null;

  if (seriesId) {
    // Fetch series type
    const { data: seriesRec } = await supabase
      .from('series')
      .select('*')
      .eq('id', seriesId)
      .single();

    if (seriesRec && seriesRec.type === 'series') {
      // Find count of posts in this series to auto-number the episode
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('series_id', seriesId);

      episodeNumber = (count || 0) + 1;
      if (!title || !title.trim()) {
        title = `Episode ${episodeNumber}`;
      }
    }
  }

  // Fallback for single submissions (tweet-like posts) where title might be empty
  if (!title || !title.trim()) {
    const textSnippet = postData.content.replace(/<[^>]*>/g, '').substring(0, 50);
    title = textSnippet.trim() ? `${textSnippet}...` : 'Untitled Post';
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || newId;

  const post = {
    id: newId,
    slug: `${slug}-${Math.random().toString(36).substr(2, 4)}`, // make slug unique
    title: title,
    excerpt: postData.excerpt || postData.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
    content: postData.content,
    preview_image: postData.preview_image || (seriesId ? null : 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800'),
    author_id: postData.author_id,
    category: postData.category || 'General',
    genres: postData.genres || 'Random',
    series_id: seriesId,
    episode_number: episodeNumber,
    read_time: `${Math.max(1, Math.ceil(postData.content.split(/\s+/).length / 200))} min read`,
    views: 0,
    likes: 0,
    status: postData.status || 'published',
    published_at: postData.status === 'draft' ? null : new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error) {
    console.error('Error creating post in Supabase:', error);
    throw error;
  }

  // Atomically update author posts_count
  await supabase.rpc('increment_posts_count', { author_row_id: postData.author_id });

  return data;
}

export async function updatePost(id, postData) {
  ensureSupabase();
  const updatedPost = {
    ...postData,
    updated_at: new Date().toISOString()
  };

  // Set published_at if transitioning to published status
  if (postData.status === 'published') {
    updatedPost.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updatedPost)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating post in Supabase:', error);
    throw error;
  }
  return data;
}

export async function deletePost(id) {
  ensureSupabase();
  // Get post to reference author ID
  const post = await getPostById(id);

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting post in Supabase:', error);
    throw error;
  }

  if (post && post.author_id) {
    // Atomically decrement author posts_count
    await supabase.rpc('decrement_posts_count', { author_row_id: post.author_id });
  }

  return true;
}

export async function getCommentsByPostId(postId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments from Supabase:', error);
    throw error;
  }
  return data || [];
}

export async function createComment(commentData) {
  ensureSupabase();
  const newComment = {
    id: 'comment-' + Math.random().toString(36).substr(2, 9),
    post_id: commentData.post_id,
    author_name: commentData.author_name || 'Anonymous Reader',
    content: commentData.content,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('comments')
    .insert(newComment)
    .select()
    .single();

  if (error) {
    console.error('Error creating comment in Supabase:', error);
    throw error;
  }
  return data;
}

export async function getAuthorById(id) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching author from Supabase:', error);
    throw error;
  }
  return data;
}

export async function getOrCreateAuthor(userData) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', userData.id)
    .maybeSingle();

  if (data) {
    // Keep local database profile synced if name, avatar, or email changes in Clerk
    if (data.name !== userData.name || data.avatar !== userData.avatar || data.email !== userData.email) {
      const { data: updated, error: updateErr } = await supabase
        .from('authors')
        .update({
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar || data.avatar
        })
        .eq('id', userData.id)
        .select()
        .single();
      
      if (!updateErr && updated) {
        return updated;
      }
    }
    return data;
  }

  const newAuthor = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    bio: userData.bio || 'Chhayapoth Author',
    posts_count: 0,
    created_at: new Date().toISOString()
  };

  const { data: created, error: createError } = await supabase
    .from('authors')
    .insert(newAuthor)
    .select()
    .single();

  if (createError) {
    if (createError.code === '23505') {
      const { data: existing, error: fetchErr } = await supabase
        .from('authors')
        .select('*')
        .eq('id', userData.id)
        .maybeSingle();
      if (existing) return existing;
    }
    console.error('Error creating author in Supabase:', createError);
    throw createError;
  }
  return created;
}

export async function updateAuthor(id, authorData) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('authors')
    .update(authorData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating author in Supabase:', error);
    throw error;
  }
  return data;
}

export async function incrementPostViews(id) {
  ensureSupabase();
  const { error } = await supabase.rpc('increment_views', { row_id: id });
  if (error) {
    console.error('Error incrementing views in Supabase:', error);
  }
  return true;
}

export async function getSeriesByAuthorId(authorId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching series by author:', error);
    throw error;
  }
  return data || [];
}

export async function createSeries(seriesData) {
  ensureSupabase();
  const newId = 'series-' + Math.random().toString(36).substr(2, 9);
  
  const newSeries = {
    id: newId,
    title: seriesData.title,
    description: seriesData.description || '',
    cover_image: seriesData.cover_image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800',
    type: seriesData.type || 'blog',
    author_id: seriesData.author_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('series')
    .insert(newSeries)
    .select()
    .single();

  if (error) {
    console.error('Error creating series in Supabase:', error);
    throw error;
  }
  return data;
}

export async function getSeriesById(id) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('series')
    .select('*, author:authors(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching series by ID:', error);
    throw error;
  }
  return data;
}

export async function getAllSeries() {
  ensureSupabase();
  const { data, error } = await supabase
    .from('series')
    .select('*, author:authors(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all series:', error);
    throw error;
  }
  return data || [];
}

export async function getPostsBySeriesId(seriesId) {
  ensureSupabase();
  const { data, error } = await supabase
    .from('posts')
    .select('*, author:authors(*)')
    .eq('series_id', seriesId)
    .order('episode_number', { ascending: true })
    .order('published_at', { ascending: true });

  if (error) {
    console.error('Error fetching posts by series ID:', error);
    throw error;
  }
  return data || [];
}

export async function updateSeries(id, seriesData) {
  ensureSupabase();
  try {
    const { data, error } = await supabase
      .from('series')
      .update({
        title: seriesData.title,
        description: seriesData.description,
        cover_image: seriesData.cover_image,
        type: seriesData.type
      })
      .eq('id', id)
      .select('*, author:authors(*)')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating series in Supabase:', error);
    throw error;
  }
}

