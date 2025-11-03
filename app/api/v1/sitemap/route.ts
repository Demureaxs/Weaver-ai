import { NextRequest, NextResponse } from 'next/server';
import { sitemap } from '../../../../data/sitemap';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  const userSitemap = sitemap.find((s) => s.userId === parseInt(userId));

  if (!userSitemap) {
    return NextResponse.json({ message: 'Sitemap not found for user' }, { status: 404 });
  }

  return NextResponse.json(userSitemap);
}
