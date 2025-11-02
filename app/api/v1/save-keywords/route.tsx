// In app/api/v1/save-keywords/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import currentKeywords from '../../../../data/keywords.json';

const keywordsFilePath = path.join(process.cwd(), 'data', 'keywords.json');

export async function POST(req: NextRequest) {
  const { keywords } = await req.json();

  

  try {
    // You'd add logic here to read existing keywords and merge them
    const fileData = JSON.stringify({ keywords });
    await fs.writeFile(keywordsFilePath, fileData);

    return NextResponse.json({ message: 'Keywords saved' });
  } catch (error) {
    return NextResponse.json({ message: 'Error saving keywords' }, { status: 500 });
  }
}
