'use client';

import Button from '@/app/components/ui/Button';
import { FilePlus2, Save, FileMinus2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';

// --- Define the structure for our categorized results ---
interface SuggestionCategories {
  questions: string[];
  prepositions: string[];
  comparisons: string[];
  alphabetical: string[];
}

// --- NEW: Helper component to render a single, expandable list ---
const SuggestionCategory = ({
  title,
  list,
  onAddKeyword,
  onRemoveKeyword,
  selectedKeywords,
}: {
  title: string;
  list: string[];
  onAddKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  selectedKeywords: string[];
}) => {
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
          {list.map((suggestion, index) => {
            const isSelected = selectedKeywords.includes(suggestion);
            return (
              <li key={index} className='text-foreground flex justify-between items-center group'>
                <p>{suggestion}</p>
                {isSelected ? (
                  <FileMinus2
                    size={16}
                    className='cursor-pointer text-red-500 group-hover:text-red-700 transition-colors'
                    onClick={() => onRemoveKeyword(suggestion)}
                  />
                ) : (
                  <FilePlus2
                    size={16}
                    className='cursor-pointer text-foreground/50 group-hover:text-primary transition-colors'
                    onClick={() => onAddKeyword(suggestion)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default function KeywordIdeasToolPage() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const { user } = useUser();

  // const [showKeywords, setShowKeywords] = useState(false); // This is no longer needed

  // --- Updated State: Holds the categorized object or null ---
  const [suggestions, setSuggestions] = useState<SuggestionCategories | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetch(`/api/v1/keywords?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data)) {
            setSelectedKeywords(data.map((kw: any) => kw.text));
          }
        })
        .catch((err) => console.error('Error fetching existing keywords:', err));
    }
  }, [user]);

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

  async function handleAddKeyword(keywordToAdd: string) {
    if (!user || selectedKeywords.includes(keywordToAdd)) return;

    try {
      const response = await fetch('/api/v1/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keywordToAdd, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add keyword');
      }

      // Assuming the API returns the newly added keyword object
      const addedKeyword = await response.json();
      setSelectedKeywords((prev) => [...prev, addedKeyword.text]);
    } catch (error) {
      console.error('Error adding keyword:', error);
      setError('Failed to add keyword.');
    }
  }

  async function handleRemoveKeyword(keywordToRemove: string) {
    if (!user) return;

    try {
      // Find the keyword ID to delete from the backend
      // This assumes selectedKeywords might contain objects with IDs, or we need to fetch them.
      // For now, let's assume we need to fetch the ID or the backend can handle text-based deletion.
      // Given the current backend DELETE expects an ID, we need to get the ID first.
      // A simpler approach for now is to just remove from frontend state and rely on saveKeywordsToDashboard for persistence.
      // However, the request implies immediate backend update.

      // First, let's get the ID of the keyword to remove.
      const allUserKeywordsRes = await fetch(`/api/v1/keywords?userId=${user.id}`);
      const allUserKeywords = await allUserKeywordsRes.json();
      const keywordToDelete = allUserKeywords.find((kw: any) => kw.text === keywordToRemove);

      if (keywordToDelete) {
        const response = await fetch('/api/v1/keywords', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: keywordToDelete.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to remove keyword');
        }

        setSelectedKeywords((prev) => prev.filter((kw) => kw !== keywordToRemove));
      } else {
        console.warn('Keyword not found in backend for deletion:', keywordToRemove);
        setSelectedKeywords((prev) => prev.filter((kw) => kw !== keywordToRemove));
      }
    } catch (error) {
      console.error('Error removing keyword:', error);
      setError('Failed to remove keyword.');
    }
  }

  // On KeywordIdeasToolPage.tsx

  async function saveKeywordsToDashboard(e: React.MouseEvent) {
    if (!user) return;
    // This function now becomes less critical if handleAddKeyword and handleRemoveKeyword update backend directly.
    // However, if it's meant to be a 'save all changes' button, it needs to send the current selectedKeywords state.
    // Given the new requirements, this function might be redundant or need re-evaluation.
    // For now, I'll keep it as is, but it might not be used as frequently.
    await fetch('/api/v1/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: selectedKeywords, userId: user.id }),
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
          {/* <Button
            icon={<Save className='-ml-3 p-1 bg-primary rounded-full' />}
            onClick={(e) => {
              e.preventDefault();
              saveKeywordsToDashboard(e);
              setSelectedKeywords([]);
            }}
          /> */}
        </div>
      </div>

      {/* --- UPDATED: Added flex-1 and overflow-y-auto to make this section fill and scroll --- */}
      <div className='mt-6 rounded-lg space-y-6 flex-1 overflow-y-scroll scrollbar-hide'>
        {isLoading && <p className='text-foreground/50'>Loading suggestions...</p>}

        {error && <p className='text-red-500'>Error: {error}</p>}

        {/* --- Render categorized results using the new component --- */}
        {suggestions && (
          <>
            <SuggestionCategory
              title='Questions'
              list={suggestions.questions}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
              selectedKeywords={selectedKeywords}
            />
            <SuggestionCategory
              title='Prepositions'
              list={suggestions.prepositions}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
              selectedKeywords={selectedKeywords}
            />
            <SuggestionCategory
              title='Comparisons'
              list={suggestions.comparisons}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
              selectedKeywords={selectedKeywords}
            />
            <SuggestionCategory
              title='Alphabetical'
              list={suggestions.alphabetical}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
              selectedKeywords={selectedKeywords}
            />
          </>
        )}
      </div>
    </div>
  );
}
