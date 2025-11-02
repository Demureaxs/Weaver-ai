'use client';

import Button from '@/app/components/ui/Button';
import { FilePlus2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

// --- Define the structure for our categorized results ---
interface SuggestionCategories {
  questions: string[];
  prepositions: string[];
  comparisons: string[];
  alphabetical: string[];
}

// --- NEW: Helper component to render a single, expandable list ---
const SuggestionCategory = ({ title, list, onAddKeyword }: { title: string; list: string[]; onAddKeyword: (keyword: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render the section if the list is empty
  if (!list || list.length === 0) return null;

  return (
    // --- UPDATED: Added flex and flex-col to allow list to grow ---
    <div className='space-y-3 bg-foreground/5 p-4 rounded-lg shadow border border-foreground/10 shrink-0 flex flex-col'>
      {/* Header Row: Title, Count, and Expand Button */}
      <div className='flex justify-between items-center'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-semibold capitalize'>{title}</h2>
          <p className='text-sm text-foreground/50'>Found {list.length} keywords</p>
        </div>
        <Button onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? 'Collapse' : 'Expand'}</Button>
      </div>

      {/* Expandable List */}
      {isExpanded && (
        // --- UPDATED: Added max-h and overflow-y-auto to make the list scrollable ---
        <ul className='list-inside space-y-3 pt-3 border-t border-foreground/10 overflow-y-auto max-h-96 scrollbar-hide'>
          {list.map((suggestion, index) => (
            <li key={index} className='text-foreground flex justify-between items-center group'>
              <p>{suggestion}</p>
              <FilePlus2
                size={16}
                className='cursor-pointer text-foreground/50 group-hover:text-primary transition-colors'
                // Pass the suggestion string directly for reliability
                onClick={() => onAddKeyword(suggestion)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function KeywordIdeasToolPage() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  // const [showKeywords, setShowKeywords] = useState(false); // This is no longer needed

  // --- Updated State: Holds the categorized object or null ---
  const [suggestions, setSuggestions] = useState<SuggestionCategories | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear previous suggestions when keyword changes
    console.log('Selected Keywords:', selectedKeywords);
  }, [selectedKeywords]);

  async function handleSubmit() {
    setIsLoading(true);
    setSuggestions(null); // Clear old results
    setError(null); // Clear old errors

    try {
      // --- FIXED: Use the correct API route ---
      const response = await fetch('/api/v1/get-keyword-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch suggestions');
      }

      const data = await response.json();

      // --- Updated Logic: Check for the new object structure ---
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(null);
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // --- FIXED: Simplified function to accept the keyword string directly ---
  function handleAddKeyword(keywordToAdd: string) {
    if (keywordToAdd && !selectedKeywords.includes(keywordToAdd)) {
      setSelectedKeywords([...selectedKeywords, keywordToAdd]);
    }
  }

  // On KeywordIdeasToolPage.tsx

  async function saveKeywordsToDashboard(e: React.MouseEvent) {
    await fetch('/api/v1/save-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: selectedKeywords }),
    });

    // Optionally, navigate to the dashboard
    // router.push('/dashboard');
  }
  // --- REMOVED: Old renderSuggestionList function ---

  return (
    // --- UPDATED: Added flex-1 and overflow-hidden to make this container fill space ---
    <div className='flex flex-1 flex-col space-y-4 overflow-hidden'>
      {/* --- UPDATED: Added flex-shrink-0 --- */}
      <div className='space-y-2 shrink-0'>
        <h1 className='text-4xl font-semibold'>Keyword Ideas Tool</h1>
        <p>Find the best idea's for your articles.</p>
      </div>
      {/* --- UPDATED: Added flex-shrink-0 --- */}
      <div className='flex flex-col space-y-4 shrink-0'>
        <label htmlFor='keyword' className='font-medium'>
          Seed Keyword
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

      {/* --- UPDATED: Added flex-shrink-0 and fixed disabled prop --- */}
      <div className='shrink-0 flex justify-between items-center'>
        <Button onClick={handleSubmit}>{isLoading ? 'Finding...' : 'Find Keyword Ideas'}</Button>
        <div className='flex items-center space-x-2'>
          <aside>{`${selectedKeywords.length} keywords added`}</aside>
          <Button
            icon={<Save className='-ml-3 p-1 bg-primary rounded-full' />}
            onClick={(e) => {
              e.preventDefault();
              saveKeywordsToDashboard(e);
              setSelectedKeywords([]);
            }}
          />
        </div>
      </div>

      {/* --- UPDATED: Added flex-1 and overflow-y-auto to make this section fill and scroll --- */}
      <div className='mt-6 rounded-lg space-y-6 flex-1 overflow-y-scroll scrollbar-hide'>
        {isLoading && <p className='text-foreground/50'>Loading suggestions...</p>}

        {error && <p className='text-red-500'>Error: {error}</p>}

        {/* --- Render categorized results using the new component --- */}
        {suggestions && (
          <>
            <SuggestionCategory title='Questions' list={suggestions.questions} onAddKeyword={handleAddKeyword} />
            <SuggestionCategory title='Prepositions' list={suggestions.prepositions} onAddKeyword={handleAddKeyword} />
            <SuggestionCategory title='Comparisons' list={suggestions.comparisons} onAddKeyword={handleAddKeyword} />
            <SuggestionCategory title='Alphabetical' list={suggestions.alphabetical} onAddKeyword={handleAddKeyword} />
          </>
        )}
      </div>
    </div>
  );
}
