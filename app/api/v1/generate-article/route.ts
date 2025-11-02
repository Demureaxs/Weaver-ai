import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { sitemap } from '../../../../data/sitemap';
import path from 'path';
import fs from 'fs/promises';

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'YOUR_API_KEY');

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
  const { keyword, sections, tone, language, serpAnalysis, hasFaq, minWordsPerSection } = body;

  // Create a mega prompt
  const prompt = `
    As an expert SEO content writer, please generate a comprehensive, engaging, and plagiarism-free article based on the following parameters.
    Your response should be in markdown format.

    **Primary Keyword:** "${keyword}"

    **Article Structure:**
    - The article should be well-structured with a clear introduction, body, and conclusion.
    - It must contain exactly ${sections} sections, each with a relevant heading and aim for at least ${minWordsPerSection} words per section.
    - The tone of the article should be ${tone}.
    - The article should feature images that match the text for the sections you decide to include images for.
    - Refrain from use of em dashes; use commas or parentheses instead.
    - Avoid buzzwords and jargon; write in a clear and accessible manner.
    - The language of the article must be ${language}.

    **Content Requirements:**
    - The primary keyword, "${keyword}", should be naturally integrated throughout the article, including in headings where appropriate.
    - The content must be informative, accurate, and provide real value to the reader.
    - Ensure the article is easy to read and flows logically from one section to the next.

    **Internal Linking:**
    - Where relevant, please include internal links to the following pages from our sitemap.
    - Do not force links; they should only be included if they provide value to the reader and are contextually appropriate.
    - Here are the available pages for internal linking:
      ${sitemap.services.map((service) => `- [${service.title}](${service.url})`).join('\n      ')}

    **External Linking:**
    - Include links to authoritative external sources to back up any claims or data presented in the article.
    - Ensure that external links use appropriate anchor text.

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
