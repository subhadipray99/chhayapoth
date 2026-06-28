import { NextResponse } from 'next/server';
import { uploadMedia } from '@/lib/storage';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert Web File to ArrayBuffer, then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileUrl = await uploadMedia(buffer, file.name, file.type);

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('API upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 500 });
  }
}
