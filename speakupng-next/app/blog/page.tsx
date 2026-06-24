'use client';

import { useState } from 'react';

export default function BlogPage() {
  const [search, setSearch] = useState('');

  const blogPosts = [
    {
      id: '1',
      title: 'How to Evaluate Government Officials Effectively',
      url: 'https://example.com/blog/evaluate-officials',
      published_at: '2024-12-15T10:00:00Z',
      content_hash: 'blog123',
      summary: 'A comprehensive guide for citizens on how to effectively evaluate and rate government officials.',
      sentiment_score: 0.9,
      topic: 'guide',
      categories: ['civic engagement', 'guide'],
      is_politics: false,
      matched_profiles: [],
      image_url: 'https://example.com/blog/evaluate-officials.jpg',
      site_name: 'evote.ng Blog',
      author: 'Civic Engagement Team',
      content_text: 'Evaluating government officials is a crucial part of civic engagement. This guide provides practical tips for citizens on how to assess official performance, from tracking service delivery to analyzing policy outcomes.',
      content_html: '<p>Evaluating government officials is a crucial part of civic engagement. This guide provides practical tips for citizens on how to assess official performance, from tracking service delivery to analyzing policy outcomes.</p>',
      content_extracted_at: '2024-12-15T10:05:00Z',
      moderation_status: 'approved',
    },
    {
      id: '2',
      title: 'Understanding the Nigerian Political System',
      url: 'https://example.com/blog/nigerian-politics',
      published_at: '2024-12-10T14:30:00Z',
      content_hash: 'blog456',
      summary: 'An overview of Nigeria\'s political structure and how different branches of government interact.',
      sentiment_score: 0.8,
      topic: 'education',
      categories: ['education', 'politics'],
      is_politics: false,
      matched_profiles: [],
      image_url: 'https://example.com/blog/nigerian-politics.jpg',
      site_name: 'evote.ng Blog',
      author: 'Political Analyst',
      content_text: 'Nigeria\'s political system is complex but understanding it is essential for effective civic engagement. This article breaks down the federal structure and explains how different branches of government interact.',
      content_html: '<p>Nigeria\'s political system is complex but understanding it is essential for effective civic engagement. This article breaks down the federal structure and explains how different branches of government interact.</p>',
      content_extracted_at: '2024-12-10T14:35:00Z',
      moderation_status: 'approved',
    },
  ];

  const filtered = blogPosts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.summary.toLowerCase().includes(search.toLowerCase()) ||
    post.categories.some(cat => cat.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Blog</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Governance explainers and accountability guides for Nigerian citizens.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search blog posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((post) => (
            <article key={post.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              {post.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm text-zinc-500 dark:text-zinc-500">
                    {formatDate(post.published_at)}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                    Blog
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  <a href={post.url} className="hover:text-green-600 transition-colors">
                    {post.title}
                  </a>
                </h2>

                <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">
                  {post.summary}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category, index) => (
                      <span key={index} className="text-xs text-zinc-500 dark:text-zinc-500">
                        {category}
                      </span>
                    ))}
                  </div>

                  <a
                    href={post.url}
                    className="text-green-600 dark:text-green-400 font-medium hover:underline"
                  >
                    Read more →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">No blog posts found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
