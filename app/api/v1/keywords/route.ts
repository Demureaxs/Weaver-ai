import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const keywordsFilePath = path.join(process.cwd(), 'data', 'keywords.json');

// Helper function to read and validate keywords
async function getKeywords() {
    try {
        const fileContents = await fs.readFile(keywordsFilePath, 'utf8');
        const keywords = JSON.parse(fileContents);
        // Validate that the parsed content is an array
        if (Array.isArray(keywords)) {
            return keywords;
        }
        // If not an array, return an empty array to prevent errors
        return [];
    } catch (error) {
        // If file doesn't exist or is empty, return an empty array
        return [];
    }
}


// GET handler to fetch keywords
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  let keywords = await getKeywords();

  if (userId) {
    keywords = keywords.filter((keyword: any) => keyword.userId === parseInt(userId));
  }

  return NextResponse.json(keywords);
}


// POST handler to create new keywords
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    let newKeywordStrings: string[] = [];

    if (body.keyword) {
      newKeywordStrings = [body.keyword];
    } else if (body.keywords && Array.isArray(body.keywords)) {
      newKeywordStrings = body.keywords;
    } else {
      return NextResponse.json({ message: 'Invalid request body: keyword or keywords array is required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ message: 'Invalid request body: userId is required' }, { status: 400 });
    }

    const existingKeywords = await getKeywords();

    const maxId = existingKeywords.reduce((max: number, kw: { id: number }) => (kw.id > max ? kw.id : max), 0);

    const keywordsToAdd = newKeywordStrings.map((text, index) => ({
      id: maxId + 1 + index,
      text,
      userId,
      createdAt: new Date().toISOString(),
    }));

    const updatedKeywords = [...existingKeywords, ...keywordsToAdd];

    await fs.writeFile(keywordsFilePath, JSON.stringify(updatedKeywords, null, 2));

    return NextResponse.json(keywordsToAdd.length === 1 ? keywordsToAdd[0] : keywordsToAdd, { status: 201 });
  } catch (error) {
    console.error('Error saving keywords:', error);
    return NextResponse.json({ message: 'Error saving keywords' }, { status: 500 });
  }
}

// DELETE handler to remove a keyword
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ message: 'Keyword ID is required' }, { status: 400 });
        }

        let keywords = await getKeywords();

        const updatedKeywords = keywords.filter((keyword: any) => keyword.id !== id);

        if (keywords.length === updatedKeywords.length) {
            return NextResponse.json({ message: 'Keyword not found' }, { status: 404 });
        }

        await fs.writeFile(keywordsFilePath, JSON.stringify(updatedKeywords, null, 2));

        return NextResponse.json({ message: 'Keyword deleted successfully' });
    } catch (error) {
        console.error('Error deleting keyword:', error);
        return NextResponse.json({ message: 'Error deleting keyword' }, { status: 500 });
    }
}

// PUT handler to update a keyword
export async function PUT(req: NextRequest) {
    try {
        const { id, text } = await req.json();

        if (!id || !text) {
            return NextResponse.json({ message: 'Keyword ID and text are required' }, { status: 400 });
        }

        let keywords = await getKeywords();

        const keywordIndex = keywords.findIndex((keyword: any) => keyword.id === id);

        if (keywordIndex === -1) {
            return NextResponse.json({ message: 'Keyword not found' }, { status: 404 });
        }

        keywords[keywordIndex].text = text;

        await fs.writeFile(keywordsFilePath, JSON.stringify(keywords, null, 2));

        return NextResponse.json({ message: 'Keyword updated successfully' });
    } catch (error) {
        console.error('Error updating keyword:', error);
        return NextResponse.json({ message: 'Error updating keyword' }, { status: 500 });
    }
}
