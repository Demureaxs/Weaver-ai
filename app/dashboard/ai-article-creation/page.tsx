'use client';

import Button from '@/app/components/ui/Button';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '../../contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function AiArticleGenerationPage() {
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState<any[]>([]);
  const [sections, setSections] = useState(6);
  const [tone, setTone] = useState('Casual');
  const [language, setLanguage] = useState('English');
  const [serpAnalysis, setSerpAnalysis] = useState(false);
  const [hasFaq, setHasFaq] = useState(false);
  const [internalLinking, setInternalLinking] = useState(true);
  const [externalLinking, setExternalLinking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showOptions, setShowOptions] = useState(true);
  const [minWordsPerSection, setMinWordsPerSection] = useState(300);
  const [generatedArticleUuid, setGeneratedArticleUuid] = useState<string | null>(null);
  const [hasUserSitemap, setHasUserSitemap] = useState(false);
  const { user, updateUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetch(`/api/v1/keywords?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setKeywords(data));

      // Fetch sitemap status
      fetch(`/api/v1/sitemap?userId=${user.id}`)
        .then((res) => {
          if (res.ok) {
            setHasUserSitemap(true);
          } else {
            setHasUserSitemap(false);
          }
        })
        .catch(() => setHasUserSitemap(false));
    }
  }, [user]);

  const handleSubmit = async () => {
    if (user && user.credits < 5) {
      alert("You don't have enough credits to generate an article.");
      return;
    }

    setIsLoading(true);
    setResult('');
    setGeneratedArticleUuid(null); // Reset UUID on new generation
    let finalResult = '';

    if (internalLinking && !hasUserSitemap) {
      alert('Internal linking is enabled, but no sitemap found for your user. Please upload a sitemap first.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/v1/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          sections,
          tone,
          language,
          serpAnalysis,
          hasFaq,
          minWordsPerSection,
          userId: user?.id,
          internalLinking,
          externalLinking,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          alert(errorData.message);
        }
        throw new Error(errorData.message || 'Something went wrong');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value, { stream: true });
        setResult((prevResult) => prevResult + chunk);
        finalResult += chunk;
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      if (finalResult) {
        const title = finalResult.split('\n')[0].replace('# ', '');
        const saveResponse = await fetch('/api/v1/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content: finalResult, userId: user?.id }),
        });

        if (saveResponse.ok) {
          router.refresh(); // Re-fetch data for the current route
          const savedArticle = await saveResponse.json();
          setGeneratedArticleUuid(savedArticle.id); // Correctly use .id instead of .uuid
          if (user) {
            const updatedUser = { ...user, credits: user.credits - 5 };
            updateUser(updatedUser);
          }
        }
      }
    }
  };

  const handleDownload = () => {
    const slug = (keyword || 'untitled-article')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

    const filename = `${slug}-article.md`;
    const blob = new Blob([result], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className='space-y-4 h-full overflow-y-auto'>
      <div className='space-y-2'>
        <h1 className='text-4xl font-semibold'>AI Content Generation</h1>
        <p>Generate and manage your AI-Powered content</p>
      </div>
      <div>
        <div
          className={`${
            showOptions ? 'block' : 'h-0 overflow-clip transition-all duration-300 ease-in-out'
          } space-y-4 transition-all duration-300 ease-in-out`}
        >
          <div className='flex items-center gap-8 justify-between'>
            <div className='flex flex-col space-y-2 flex-1'>
              <label htmlFor='keyword' className='font-medium'>
                Target Keyword
              </label>
              <input
                type='text'
                id='keyword'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className='border border-foreground/10 p-2 rounded w-full outline-primary'
                placeholder='Enter your target keyword'
                disabled={isLoading}
              />
            </div>
            <div className='flex flex-col space-y-2 flex-1'>
              <label htmlFor='keywordsList' className='font-medium'>
                My Keywords List
              </label>
              <select
                id='keywordsList'
                onChange={(e) => setKeyword(e.target.value)}
                className='border border-foreground/10 p-2 rounded w-full outline-primary'
                value={keyword}
                disabled={isLoading}
              >
                <option value=''>Select a keyword...</option>
                {keywords.map((kw) => (
                  <option key={kw.id} value={kw.text}>
                    {kw.text}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='sections' className='font-medium'>
              Number of Sections
            </label>
            <select
              id='sections'
              onChange={(e) => setSections(Number(e.target.value))}
              className='border border-foreground/10 p-2 rounded w-full outline-primary'
              value={sections}
              disabled={isLoading}
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='minWordsPerSection' className='font-medium'>
              Minimum Words Per Section
            </label>
            <select
              id='minWordsPerSection'
              onChange={(e) => setMinWordsPerSection(Number(e.target.value))}
              className='border border-foreground/10 p-2 rounded w-full outline-primary'
              value={minWordsPerSection}
              disabled={isLoading}
            >
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={300}>300</option>
              <option value={400}>400</option>
              <option value={500}>500</option>
            </select>
          </div>
          <div>
            <div className='flex flex-col space-y-2'>
              <label htmlFor='language' className='font-medium'>
                Language
              </label>
              <select
                id='language'
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className='border border-foreground/10 p-2 rounded w-full outline-primary'
                disabled={isLoading}
              >
                <option value='English'>English</option>
                <option value='Spanish'>Spanish</option>
                <option value='French'>French</option>
                <option value='German'>German</option>
                <option value='Italian'>Italian</option>
                <option value='Portuguese'>Portuguese</option>
                <option value='Russian'>Russian</option>
                <option value='Chinese'>Chinese</option>
                <option value='Japanese'>Japanese</option>
                <option value='Korean'>Korean</option>
              </select>
            </div>
          </div>
          <div>
            <div className='flex flex-col space-y-2'>
              <label htmlFor='tone' className='font-medium'>
                Tone
              </label>
              <select
                id='tone'
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className='border border-foreground/10 p-2 rounded w-full outline-primary'
                disabled={isLoading}
              >
                <option value='Casual'>Casual</option>
                <option value='Professional'>Professional</option>
                <option value='Informative'>Informative</option>
                <option value='Educational'>Educational</option>
              </select>
            </div>
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='serpAnalysis' className='font-medium'>
              Search Results Analysis
            </label>
            <input
              type='checkbox'
              id='serpAnalysis'
              checked={serpAnalysis}
              onChange={(e) => setSerpAnalysis(e.target.checked)}
              className=' p-2 w-fit outline-primary border-primary'
              disabled={isLoading}
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='hasFaq' className='font-medium'>
              Include FAQ
            </label>
            <input
              type='checkbox'
              id='hasFaq'
              checked={hasFaq}
              onChange={(e) => setHasFaq(e.target.checked)}
              className='  p-2 outline-primary border-primary w-fit'
              disabled={isLoading}
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='internalLinking' className='font-medium'>
              Include Internal Linking
            </label>
            <input
              type='checkbox'
              id='internalLinking'
              checked={internalLinking}
              onChange={(e) => setInternalLinking(e.target.checked)}
              className='  p-2 outline-primary border-primary w-fit'
              disabled={isLoading || !hasUserSitemap}
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='externalLinking' className='font-medium'>
              Include External Linking
            </label>
            <input
              type='checkbox'
              id='externalLinking'
              checked={externalLinking}
              onChange={(e) => setExternalLinking(e.target.checked)}
              className='  p-2 outline-primary border-primary w-fit'
              disabled={isLoading}
            />
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
            setShowOptions(false);
          }}
          className='mt-8'
        >
          {isLoading ? 'Generating...' : 'Generate Article'}
        </Button>
        {result && (
          <div className='mt-8 '>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-semibold'>Generated Article</h2>
              {!isLoading && (
                <div className='flex gap-2'>
                  {generatedArticleUuid && (
                    <Button onClick={() => router.push(`/dashboard/ai-article-editor/${generatedArticleUuid}`)}>Edit Article</Button>
                  )}
                  <Button
                    onClick={handleDownload}
                    icon={
                      <Download
                        size={16}
                        className='bg-primary rounded-full h-8 w-8 p-2 group-hover:bg-foreground transition-all duration-300 ease-in-out'
                      />
                    }
                  >
                    Download Article
                  </Button>
                </div>
              )}
            </div>

            <div className='prose prose-lg markdown dark:prose-invert max-w-none bg-foreground/5 border border-primary/20 shadow-lg p-4 rounded-md mt-2 overflow-y-scroll scrollbar-hide max-h-[60vh]'>
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => <a className='text-blue-500 hover:text-blue-700 hover:underline' {...props} />,
                  h2: ({ node, ...props }) => <h2 className='mt-6 mb-2' {...props} />,
                  h3: ({ node, ...props }) => <h3 className='mt-4 mb-1' {...props} />,
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
