import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getArticles } from '../articles/route'; // Assuming getArticles is exported and available

export async function POST(req: NextRequest) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
    }

    const articles = await getArticles();
    const article = articles.find((a: any) => a.id === articleId);

    if (!article) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public', 'articles', article.filename);
    await fs.writeFile(filePath, article.content);

    return NextResponse.json({ url: `/articles/${article.filename}` });

  } catch (error) {
    console.error('Error preparing download:', error);
    return NextResponse.json({ message: 'Error preparing file for download' }, { status: 500 });
  }
}
