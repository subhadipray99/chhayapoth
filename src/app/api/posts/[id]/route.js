import { NextResponse } from 'next/server';
import { updatePost, deletePost } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Update a post
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postData = await request.json();
    const updated = await updatePost(id, postData);

    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error('API post update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
  }
}

// Delete a post
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await deletePost(id);
    if (!success) {
      return NextResponse.json({ error: 'Post not found or delete failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API post delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}
