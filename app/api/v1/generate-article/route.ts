import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { sitemap } from '../../../../data/sitemap';
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

// Helper function to create a URL-friendly slug
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { keyword, sections, tone, language, serpAnalysis, hasFaq, minWordsPerSection, userId, internalLinking, externalLinking } = body;

  // --- Credit Deduction Logic ---
  try {
    const users = await readUsersFile();
    const userIndex = users.findIndex((u: any) => u.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = users[userIndex];

    if (user.credits < 5) {
      return NextResponse.json({ message: 'Insufficient credits' }, { status: 403 });
    }

    users[userIndex].credits -= 5;
    users[userIndex].updatedAt = new Date().toISOString();
    await writeUsersFile(users);
  } catch (error) {
    console.error('Error processing credits:', error);
    return NextResponse.json({ message: 'Error processing user credits' }, { status: 500 });
  }
  // --- End Credit Deduction Logic ---

  const userSitemap = sitemap.find((s) => s.userId === userId);

  if (internalLinking && !userSitemap) {
    return NextResponse.json({ message: 'Sitemap not found for user' }, { status: 404 });
  }

  let prompt = `
    As an expert SEO content writer, please generate a comprehensive, engaging, and plagiarism-free article based on the following parameters.
    Your response should be in markdown format.

    **Primary Keyword:** "${keyword}"

    **Article Structure:**
    - The article should be well-structured with a clear introduction, body, and conclusion.
    - It must contain exactly ${sections} sections, each with a relevant heading and aim for at least ${minWordsPerSection} words per section.
    - The tone of the article should be ${tone}.
    - The article should feature images that match the text for the sections you decide to include images for, these images must be sourced from the web and be valid links (include full href).
    - Refrain from use of em dashes; use commas or parentheses instead.
    - Avoid buzzwords and jargon; write in a clear and accessible manner.
    - The language of the article must be ${language}.

    **Content Requirements:**
    - The primary keyword, "${keyword}", should be naturally integrated throughout the article, including in headings where appropriate.
    - The content must be informative, accurate, and provide real value to the reader.
    - Ensure the article is easy to read and flows logically from one section to the next.
    - The article must feature a conclusion or summary that encapsulates the main points discussed.
`;

  if (internalLinking && userSitemap) {
    prompt += `
    **Internal Linking:**
    - Where relevant, please include internal links to the following pages from our sitemap.
    - Do not force links; they should only be included if they provide value to the reader and are contextually appropriate.
    - Here are the available pages for internal linking:
      ${userSitemap.services.map((service) => `- [${service.title}](${service.url})`).join('\n      ')}
`;
  }

  if (externalLinking) {
    prompt += `
    **External Linking:**
    - Include links to authoritative external sources to back up any claims or data presented in the article.
    - Ensure that external links use appropriate anchor text.
`;
  }

  prompt += `
    **Advanced Options:**
    - **SERP Analysis:** ${
      serpAnalysis
        ? 'Please analyze the top-ranking articles for the keyword and include similar topics and entities to improve our ranking potential.'
        : 'No SERP analysis required.'
    }
    - **FAQ Section:** ${
      hasFaq
        ? 'Please include a FAQ section at the end of the article that answers common questions related to the keyword.'
        : 'No FAQ section required.'
    }

    Please begin the article now.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContentStream(prompt);

    // --- NEW: This will buffer the full text on the server ---
    let fullArticleText = '';

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        let articleStarted = false;

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();

          if (articleStarted) {
            fullArticleText += chunkText; // Add to server buffer
            controller.enqueue(new TextEncoder().encode(chunkText)); // Send to client
            continue;
          }

          buffer += chunkText;
          const markdownStart = buffer.indexOf('# ');

          if (markdownStart !== -1) {
            articleStarted = true;
            const relevantText = buffer.substring(markdownStart);
            fullArticleText += relevantText; // Add to server buffer
            controller.enqueue(new TextEncoder().encode(relevantText)); // Send to client
          }
        }

        // --- NEW: Save the file after the stream is done ---
        try {
          // Generate a unique filename
          const slug = slugify(keyword || 'untitled-article');
          const filename = `${slug}-${Date.now()}.md`;

          // Define the path to your 'data' directory (at the root of your project)
          const dataDir = path.join(process.cwd(), 'public', 'articles');
          const filePath = path.join(dataDir, filename);

          // Ensure the 'data' directory exists
          await fs.mkdir(dataDir, { recursive: true });

          // Write the file
          await fs.writeFile(filePath, fullArticleText);

          console.log(`Article saved to: ${filePath}`);
        } catch (saveError) {
          // Log the error, but don't stop the client stream
          console.error('Failed to save article to file:', saveError);
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
    console.error('Error generating content:', error);
    return NextResponse.json({ message: 'Error generating content', error: error.message }, { status: 500 });
  }
}
