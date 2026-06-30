'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  category?: string;
  author?: string;
  published_at?: string;
  created_at: string;
}

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      fetch(`/api/blog?${params}`)
        .then(res => res.json())
        .then(data => setPosts(data.posts || []))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold font-display text-white mb-3">Blog</h1>
          <p className="text-[#6b7163] text-lg max-w-2xl">
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
              className="w-full px-4 py-3 pl-10 border border-[#2c312a] rounded-lg bg-[#1d211b] text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] transition-colors text-sm"
            />
            <svg className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6b7163]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-[#1d211b] border border-[#2c312a] rounded-xl">
            <p className="text-[#6b7163] text-lg font-medium">No blog posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-[#1d211b] border border-[#2c312a] hover:border-zinc-700 rounded-xl overflow-hidden transition-all flex flex-col">
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3 text-xs text-[#6b7163] font-bold uppercase tracking-wider">
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                      {post.category && (
                        <span className="px-2 py-0.5 bg-[#008751]/10 text-[#00b368] rounded-full text-[10px]">{post.category}</span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-white font-display mb-3 leading-snug">
                      <Link href={`/blog/${post.slug}`} className="hover:text-[#00b368] transition-colors">
                        {post.title}
                      </Link>
                    </h2>

                    {post.summary && (
                      <p className="text-sm text-zinc-400 leading-relaxed mb-4 line-clamp-3">{post.summary}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#6b7163] font-semibold">{post.author || ''}</span>
                    <Link href={`/blog/${post.slug}`} className="text-sm font-bold text-[#00b368] hover:underline">
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
