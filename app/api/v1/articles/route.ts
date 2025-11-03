import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const articlesFilePath = path.join(process.cwd(), 'data', 'articles.json');

// Helper function to read and validate articles
export async function getArticles() {
  try {
    const fileContents = await fs.readFile(articlesFilePath, 'utf8');
    const articles = JSON.parse(fileContents);
    // Validate that the parsed content is an array
    if (Array.isArray(articles)) {
      return articles;
    }
    // If not an array, return an empty array to prevent errors
    return [];
  } catch (error) {
    // If file doesn't exist or is empty, return an empty array
    return [];
  }
}

// GET handler to fetch articles
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const articleId = searchParams.get('id');

  // console.log('GET /api/v1/articles received. userId:', userId, 'articleId:', articleId);

  let articles = await getArticles();
  // console.log('Articles after getArticles():', articles);

  if (userId) {
    articles = articles.filter((article: any) => {
      // console.log('Filtering: article.userId:', article.userId, 'parsedUserId:', parseInt(userId));
      return article.userId === parseInt(userId);
    });
    // console.log('Articles after filtering by userId:', articles);
  }

  if (articleId) {
    articles = articles.find((article: any) => article.id === articleId);
    // console.log('Article after finding by articleId:', articles);
  }

  return NextResponse.json(articles);
}

// POST handler to create a new article
export async function POST(req: NextRequest) {
  try {
    const { title, content, userId } = await req.json();

    if (!title || !content || !userId) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const existingArticles = await getArticles();

    const newArticle = {
      id: new Date().getTime().toString(), // Simple unique ID
      title,
      content,
      userId,
      createdAt: new Date().toISOString(),
      status: 'Draft',
      filename: `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}.md`,
    };

    const updatedArticles = [...existingArticles, newArticle];

    await fs.writeFile(articlesFilePath, JSON.stringify(updatedArticles, null, 2));

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json({ message: 'Error saving article' }, { status: 500 });
  }
}

// DELETE handler to remove an article
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: 'Article ID is required' }, { status: 400 });
    }

    let articles = await getArticles();

    const updatedArticles = articles.filter((article: any) => article.id !== id);

    if (articles.length === updatedArticles.length) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    await fs.writeFile(articlesFilePath, JSON.stringify(updatedArticles, null, 2));

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ message: 'Error deleting article' }, { status: 500 });
  }
}

// PUT handler to update an article
export async function PUT(req: NextRequest) {
  try {
    const { id, title, content } = await req.json();

    if (!id || !title || !content) {
      return NextResponse.json({ message: 'Article ID, title, and content are required' }, { status: 400 });
    }

    let articles = await getArticles();

    const articleIndex = articles.findIndex((article: any) => article.id === id);

    if (articleIndex === -1) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    articles[articleIndex] = { ...articles[articleIndex], title, content };

    await fs.writeFile(articlesFilePath, JSON.stringify(articles, null, 2));

    return NextResponse.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ message: 'Error updating article' }, { status: 500 });
  }
}
