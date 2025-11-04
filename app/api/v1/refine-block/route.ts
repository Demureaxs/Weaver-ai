import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'YOUR_API_KEY');

const usersFilePath = path.join(process.cwd(), 'data', 'users.ts');

// Define User type locally to avoid import issues
type User = {
  id: number;
  name: string;
  email: string;
  tier: string;
  credits: number;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

async function readUsersFile(): Promise<User[]> {
  const fileContent = await fs.readFile(usersFilePath, 'utf8');
  const match = fileContent.match(/export const users = (\[[\s\S]*?\]);/);
  if (match && match[1]) {
    try {
      // Use eval to parse the JavaScript array directly instead of JSON.parse
      // This is safe since we control the file content
      const arrayString = match[1];
      const users = eval(`(${arrayString})`);
      return users;
    } catch (e) {
      console.error('Error parsing users data:', e);
      return [];
    }
  }
  console.error('Could not find users array in users.ts');
  return [];
}

async function writeUsersFile(usersArray: any[]) {
  try {
    const originalFileContent = await fs.readFile(usersFilePath, 'utf8');

    // Create the updated users content with proper formatting
    const formattedUsers = usersArray.map((user) => ({
      ...user,
      updatedAt: new Date().toISOString(), // Ensure updatedAt is always current
    }));

    const newUsersContent = `export const users = ${JSON.stringify(formattedUsers, null, 2)};`;

    // Find and replace the export statement
    const exportRegex = /export const users = \[[\s\S]*?\];/;
    if (exportRegex.test(originalFileContent)) {
      const newFileContent = originalFileContent.replace(exportRegex, newUsersContent);
      await fs.writeFile(usersFilePath, newFileContent, 'utf8');
    } else {
      console.error('Could not find users array export in users.ts for writing');
      throw new Error('Could not update users file');
    }
  } catch (error) {
    console.error('Error writing users file:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const { blockContent, refinementPrompt, userId } = await req.json();

  if (!blockContent || !refinementPrompt || !userId) {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  // --- Credit Deduction Logic ---
  try {
    const users = await readUsersFile();
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex];

    if (user.credits < 1) {
      return NextResponse.json({ message: 'Insufficient credits' }, { status: 403 });
    }

    users[userIndex].credits -= 1;
    users[userIndex].updatedAt = new Date().toISOString();
    await writeUsersFile(users);
  } catch (error) {
    console.error('Error processing credits:', error);
    return NextResponse.json({ message: 'Error processing user credits' }, { status: 500 });
  }
  // --- End Credit Deduction Logic ---

  const prompt = `
    Based on the following instruction, please refine the text provided.
    Instruction: "${refinementPrompt}"
    Text to refine: "${blockContent}"

    Return only the refined text, without any additional commentary or markdown.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Error refining content:', error);
    return NextResponse.json({ message: 'Error refining content', error: error.message }, { status: 500 });
  }
}
