import { NextResponse } from 'next/server';
import { createComment } from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const { post_id, author_name, content } = data;

    if (!post_id || !content) {
      return NextResponse.json({ error: 'Missing required comment fields' }, { status: 400 });
    }

    const comment = await createComment({
      post_id,
      author_name: author_name || 'Anonymous Reader',
      content
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('API comment handler error:', error);
    return NextResponse.json({ error: error.message || 'Failed to post comment' }, { status: 500 });
  }
}
