'use client';

import Button from '@/app/components/ui/Button';
import { useEffect, useState } from 'react';

export default function AiArticleGenerationPage() {
  const [keyword, setKeyword] = useState('');
  const [sections, setSections] = useState(6);
  const [tone, setTone] = useState('Professional');
  const [language, setLanguage] = useState('English');
  const [serpAnalysis, setSerpAnalysis] = useState(false);
  const [hasFaq, setHasFaq] = useState(false);

  useEffect(() => {
    console.log(keyword, sections, tone, language, serpAnalysis, hasFaq);
  }, [keyword, sections, tone, language, serpAnalysis, hasFaq]);

  return (
    <div className='space-y-4'>
      <h1 className='text-4xl font-semibold'>AI Content Generation</h1>
      <p>Generate and manage your AI-Powered content</p>
      <div>
        <form className='space-y-4'>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='keyword' className='font-medium'>
              Target Keyword
            </label>
            <input
              type='text'
              id='keyword'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='border border-foreground/10 p-2 rounded w-full'
              placeholder='Enter your target keyword'
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <label htmlFor='sections' className='font-medium'>
              Number of Sections
            </label>
            <input
              type='number'
              id='sections'
              value={sections}
              onChange={(e) => setSections(Number(e.target.value))}
              className='border border-foreground/10 p-2 rounded w-full'
              min={1}
              max={20}
            />
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
                className='border border-foreground/10 p-2 rounded w-full'
              >
                <option value='English'>English</option>
                <option value='Spanish'>Spanish</option>
                <option value='French'>French</option>
                <option value='German0'>German</option>
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
              <select id='tone' value={tone} onChange={(e) => setTone(e.target.value)} className='border border-foreground/10 p-2 rounded w-full'>
                <option value='Professional'>Professional</option>
                <option value='Casual'>Casual</option>
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
              className=' border-foreground/10 p-2 w-full'
              placeholder='Enter your target keyword'
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
              className=' border-foreground/10 p-2 w-full'
            />
          </div>
          <Button>Generate Article</Button>
        </form>
      </div>
    </div>
  );
}
