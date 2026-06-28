import { NextResponse } from 'next/server';
import { createSeries, getSeriesByAuthorId, getAllSeries, updateSeries, getSeriesById, getPostsBySeriesId } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get('author_id');
    const seriesId = searchParams.get('id');

    if (seriesId) {
      const series = await getSeriesById(seriesId);
      if (!series) {
        return NextResponse.json({ error: 'Series not found' }, { status: 404 });
      }
      const posts = await getPostsBySeriesId(seriesId);
      return NextResponse.json({ series, posts });
    }

    let seriesList = [];
    if (authorId) {
      seriesList = await getSeriesByAuthorId(authorId);
    } else {
      seriesList = await getAllSeries();
    }

    return NextResponse.json({ series: seriesList });
  } catch (error) {
    console.error('API get series error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch series' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const seriesData = await request.json();
    
    if (!seriesData.title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    const newSeries = await createSeries({
      title: seriesData.title,
      description: seriesData.description,
      cover_image: seriesData.cover_image,
      type: seriesData.type || 'blog',
      author_id: user.id
    });

    return NextResponse.json({ series: newSeries }, { status: 201 });
  } catch (error) {
    console.error('API create series error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create series' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { id, title, description, cover_image, type } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Space ID is required.' }, { status: 400 });
    }

    const existing = await getSeriesById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Space not found.' }, { status: 404 });
    }
    if (existing.author_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized. You do not own this space.' }, { status: 403 });
    }

    const updated = await updateSeries(id, {
      title: title || existing.title,
      description: description || '',
      cover_image: cover_image || existing.cover_image,
      type: type || existing.type
    });

    return NextResponse.json({ series: updated });
  } catch (error) {
    console.error('API update series error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update series' }, { status: 500 });
  }
}

