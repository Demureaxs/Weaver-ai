'use client';

import React, { useState } from 'react';
import { useUser } from '@/app/contexts/UserContext';

interface ServicePage {
  title: string;
  url: string;
}

const SitemapPage = () => {
  const { user } = useUser();
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [servicePages, setServicePages] = useState<ServicePage[]>([]);
  const [omitDomain, setOmitDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSitemapUrl(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleProcessSitemap = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (uploadedFile) {
      formData.append('file', uploadedFile);
    } else if (sitemapUrl) {
      formData.append('url', sitemapUrl);
    } else {
      setError('Please upload a file or enter a URL.');
      setIsLoading(false);
      return;
    }
    formData.append('omitDomain', String(omitDomain));

    try {
      const response = await fetch('/api/v1/process-sitemap', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process sitemap');
      }

      const data = await response.json();
      setServicePages(data.services);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSitemap = async () => {
    console.log('handleSaveSitemap called');
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    let servicesToSave = servicePages;

    if (omitDomain) {
      servicesToSave = servicePages.map((page) => {
        try {
          const url = new URL(page.url);
          return { ...page, url: url.pathname };
        } catch (e) {
          // if it's already a path, it will throw an error, so we just return the page
          return page;
        }
      });
    }

    console.log('Services to save:', servicesToSave);

    try {
      const response = await fetch('/api/v1/save-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ services: servicesToSave, userId: user?.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save sitemap');
      }

      setSuccess('Sitemap saved successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-4'>Sitemap Internal Linking</h1>
      <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Upload Sitemap</h2>
        <div className='flex items-center space-x-4'>
          <input type='file' onChange={handleFileChange} className='border rounded-lg p-2' />
          <span className='text-gray-500'>or</span>
          <input type='text' placeholder='Enter sitemap URL' value={sitemapUrl} onChange={handleUrlChange} className='border rounded-lg p-2 w-full' />
        </div>
        <div className='mt-4'>
          <label className='flex items-center'>
            <input type='checkbox' checked={omitDomain} onChange={(e) => setOmitDomain(e.target.checked)} className='mr-2' />
            Omit base URL
          </label>
        </div>
        <button onClick={handleProcessSitemap} className='mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700' disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Process Sitemap'}
        </button>
      </div>

      {error && <div className='bg-red-100 text-red-700 p-4 rounded-lg mb-6'>{error}</div>}
      {success && <div className='bg-green-100 text-green-700 p-4 rounded-lg mb-6'>{success}</div>}

      {servicePages.length > 0 && (
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Filtered Service Pages</h2>
          <ul className='space-y-2'>
            {servicePages.map((page, index) => (
              <li key={index} className='text-blue-600 hover:underline'>
                <a href={page.url} target='_blank' rel='noopener noreferrer'>
                  {page.title} ({page.url})
                </a>
              </li>
            ))}
          </ul>
          <button onClick={handleSaveSitemap} className='mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Sitemap'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SitemapPage;
