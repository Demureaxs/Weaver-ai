'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/app/components/ui/Button';
import { Save } from 'lucide-react';
import RefinementTooltip from '@/app/components/ui/RefinementTooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PreviousPosts from '@/app/components/ui/PreviousPosts';
import { useUser } from '@/app/contexts/UserContext';

interface Article {
  id: string;
  title: string;
  content: string;
}

interface Block {
  id: number;
  type: string;
  content: string;
}

export default function ArticleEditorInstancePage() {
  const params = useParams();
  const { uuid } = params;
  const { user, updateUser } = useUser();

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const refinementTooltipRef = useRef<HTMLDivElement>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const calculateTooltipPosition = useCallback(() => {
    if (activeTextareaRef.current) {
      const rect = activeTextareaRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY + 8, // 8px offset from the bottom of the textarea
        left: rect.left + window.scrollX,
      });
    }
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    if (activeTextareaRef.current) {
      activeTextareaRef.current.style.height = '0px'; // Reset height to recalculate
      activeTextareaRef.current.style.height = activeTextareaRef.current.scrollHeight + 'px';
      calculateTooltipPosition(); // Recalculate tooltip position after textarea height adjusts
    }
  }, [calculateTooltipPosition]);

  useEffect(() => {
    if (uuid) {
      setIsLoading(true);
      fetch(`/api/v1/articles?id=${uuid}`)
        .then((res) => res.json())
        .then((data) => {
          setArticle(data);
          setTitle(data.title);
          // Parse content into blocks with better handling
          const lines = data.content.split('\n');
          const contentBlocks: Block[] = [];
          let currentBlock = '';
          let blockId = 0;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if this line starts a new block (heading or after empty line)
            const isHeading = /^#{1,6}\s/.test(line);
            const isEmpty = line.trim() === '';

            if (isHeading && currentBlock.trim()) {
              // Save previous block if it has content
              contentBlocks.push({
                id: blockId++,
                type: getBlockType(currentBlock),
                content: currentBlock.trim(),
              });
              currentBlock = line;
            } else if (isEmpty && currentBlock.trim()) {
              // Empty line - save current block and start new one
              contentBlocks.push({
                id: blockId++,
                type: getBlockType(currentBlock),
                content: currentBlock.trim(),
              });
              currentBlock = '';
            } else if (!isEmpty) {
              // Add line to current block
              if (currentBlock && !isHeading) {
                currentBlock += '\n' + line;
              } else {
                currentBlock = line;
              }
            }
          }

          // Add the final block if it has content
          if (currentBlock.trim()) {
            contentBlocks.push({
              id: blockId++,
              type: getBlockType(currentBlock),
              content: currentBlock.trim(),
            });
          }

          // Ensure we have at least one block
          if (contentBlocks.length === 0) {
            contentBlocks.push({
              id: 0,
              type: 'p',
              content: data.content || 'Start writing your article...',
            });
          }

          setBlocks(contentBlocks);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching article:', error);
          setIsLoading(false);
        });
    }
  }, [uuid]);

  const getBlockType = (content: string): string => {
    const trimmed = content.trim();
    if (trimmed.startsWith('# ')) return 'h1';
    if (trimmed.startsWith('## ')) return 'h2';
    if (trimmed.startsWith('### ')) return 'h3';
    if (trimmed.startsWith('#### ')) return 'h4';
    if (trimmed.startsWith('##### ')) return 'h5';
    if (trimmed.startsWith('###### ')) return 'h6';
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) return 'list';
    if (trimmed.startsWith('> ')) return 'blockquote';
    if (trimmed.startsWith('```')) return 'code';
    return 'p';
  };

  useEffect(() => {
    if (editingBlockId !== null) {
      adjustTextareaHeight(); // Adjust height when a new block is selected for editing
      window.addEventListener('scroll', calculateTooltipPosition);
      window.addEventListener('resize', calculateTooltipPosition);
    } else {
      window.removeEventListener('scroll', calculateTooltipPosition);
      window.removeEventListener('resize', calculateTooltipPosition);
    }
    return () => {
      window.removeEventListener('scroll', calculateTooltipPosition);
      window.removeEventListener('resize', calculateTooltipPosition);
    };
  }, [editingBlockId, calculateTooltipPosition, adjustTextareaHeight]);

  const handleSave = async () => {
    if (!article) return;
    setIsSaving(true);
    const content = blocks.map((block) => block.content).join('\n');
    await fetch('/api/v1/articles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: article.id, title, content }),
    });
    setIsSaving(false);
    setEditingBlockId(null); // Exit edit mode on save
  };

  const handleBlockChange = (id: number, newContent: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, content: newContent } : block)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, blockId: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const textarea = e.currentTarget;
      const cursorPosition = textarea.selectionStart;
      const content = textarea.value;

      // Split the content at cursor position
      const beforeCursor = content.substring(0, cursorPosition);
      const afterCursor = content.substring(cursorPosition);

      if (afterCursor.trim()) {
        // Create new block with content after cursor
        const currentBlockIndex = blocks.findIndex((b) => b.id === blockId);
        const newBlock: Block = {
          id: Math.max(...blocks.map((b) => b.id)) + 1,
          type: 'p',
          content: afterCursor.trim(),
        };

        // Update current block with content before cursor
        const updatedBlocks = [...blocks];
        updatedBlocks[currentBlockIndex] = {
          ...updatedBlocks[currentBlockIndex],
          content: beforeCursor.trim(),
        };

        // Insert new block after current one
        updatedBlocks.splice(currentBlockIndex + 1, 0, newBlock);
        setBlocks(updatedBlocks);

        // Focus on new block
        setTimeout(() => setEditingBlockId(newBlock.id), 0);
      } else {
        // Just create an empty new block
        addNewBlock(blockId);
      }
    }

    if (e.key === 'Backspace' && !e.currentTarget.value.trim()) {
      e.preventDefault();
      deleteBlock(blockId);
    }
  };

  const addNewBlock = (afterBlockId?: number) => {
    const newBlock: Block = {
      id: Math.max(...blocks.map((b) => b.id), 0) + 1,
      type: 'p',
      content: '',
    };

    if (afterBlockId !== undefined) {
      const index = blocks.findIndex((b) => b.id === afterBlockId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }

    setEditingBlockId(newBlock.id);
  };

  const deleteBlock = (blockId: number) => {
    if (blocks.length <= 1) return; // Don't delete the last block

    const blockIndex = blocks.findIndex((b) => b.id === blockId);
    const newBlocks = blocks.filter((b) => b.id !== blockId);
    setBlocks(newBlocks);

    // Focus on previous block if available, otherwise next block
    if (newBlocks.length > 0) {
      const targetIndex = Math.max(0, blockIndex - 1);
      const targetBlock = newBlocks[targetIndex];
      if (targetBlock) {
        setEditingBlockId(targetBlock.id);
      }
    }
  };

  const moveBlock = (blockId: number, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex((b) => b.id === blockId);
    if ((direction === 'up' && currentIndex === 0) || (direction === 'down' && currentIndex === blocks.length - 1)) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    [newBlocks[currentIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[currentIndex]];
    setBlocks(newBlocks);
  };

  const handleRefine = async (prompt: string) => {
    if (user && user.credits < 1) {
      alert("You don't have enough credits to refine a block.");
      return;
    }

    if (editingBlockId === null) return;

    setIsRefining(true);
    const blockToRefine = blocks.find((b) => b.id === editingBlockId);
    if (!blockToRefine) return;

    try {
      const response = await fetch('/api/v1/refine-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockContent: blockToRefine.content, refinementPrompt: prompt, userId: user?.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          alert(errorData.message);
        }
        throw new Error(errorData.message || 'Failed to refine content');
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let refinedContent = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        refinedContent += chunk;
        handleBlockChange(editingBlockId, refinedContent);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefining(false);
      if (user) {
        const updatedUser = { ...user, credits: user.credits - 1 };
        updateUser(updatedUser);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found.</div>;
  }

  const renderBlock = (block: Block) => {
    const isEditing = block.id === editingBlockId;

    if (isEditing) {
      return (
        <div key={block.id} className='relative'>
          <textarea
            ref={activeTextareaRef}
            value={block.content}
            onChange={(e) => {
              handleBlockChange(block.id, e.target.value);
              adjustTextareaHeight();
            }}
            onFocus={calculateTooltipPosition}
            onBlur={(e) => {
              if (!e.relatedTarget || !refinementTooltipRef.current?.contains(e.relatedTarget as Node)) {
                setEditingBlockId(null);
              }
            }}
            className='border border-foreground/10 p-2 rounded w-full outline-primary h-fit overflow-hidden'
            autoFocus
          />
          {editingBlockId === block.id && (
            <RefinementTooltip
              ref={refinementTooltipRef}
              onRefine={handleRefine}
              isRefining={isRefining}
              top={tooltipPosition.top}
              left={tooltipPosition.left}
            />
          )}
        </div>
      );
    }

    // Render markdown content using ReactMarkdown
    return (
      <div key={block.id} onClick={() => setEditingBlockId(block.id)} className='prose prose-lg markdown dark:prose-invert max-w-none cursor-pointer'>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
      </div>
    );
  };

  return (
    <div className='space-y-4 h-full overflow-y-scroll scrollbar-hide'>
      <div className='flex justify-between items-center'>
        <h1 className='text-4xl font-semibold'>Edit Article</h1>
        <Button
          onClick={handleSave}
          icon={<Save size={16} className='bg-primary rounded-full h-8 w-8 p-2 group-hover:bg-foreground transition-all duration-300 ease-in-out' />}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      <div className='space-y-4'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='border border-foreground/10 p-2 rounded w-full outline-primary text-2xl font-semibold'
        />
        <div className='prose prose-lg markdown dark:prose-invert max-w-none bg-foreground/5 border border-primary/20 shadow-lg p-4 rounded-md mt-2'>
          {blocks.map((block) => renderBlock(block))}
        </div>
      </div>
      <PreviousPosts />
    </div>
  );
}
