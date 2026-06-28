import { NextResponse } from 'next/server';
import { createPost } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const postData = await request.json();
    
    if (!postData.content) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }

    const newPost = await createPost({
      title: postData.title,
      content: postData.content,
      category: postData.category || 'General',
      genres: postData.genres,
      preview_image: postData.preview_image,
      series_id: postData.series_id,
      author_id: user.id,
      status: postData.status || 'published'
    });

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error('API create post error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
  }
}
