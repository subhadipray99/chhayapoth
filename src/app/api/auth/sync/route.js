import { NextResponse } from 'next/server';
import { getOrCreateAuthor } from '@/lib/db';

export async function POST(request) {
  try {
    const userData = await request.json();
    if (!userData || !userData.name || !userData.email) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    const author = await getOrCreateAuthor(userData);
    return NextResponse.json({ author });
  } catch (error) {
    console.error('API auth sync handler error:', error);
    return NextResponse.json({ error: error.message || 'Failed to sync user' }, { status: 500 });
  }
}
