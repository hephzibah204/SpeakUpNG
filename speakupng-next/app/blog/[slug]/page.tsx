'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface BlogPost {
  title: string;
  summary?: string;
  category?: string;
  author?: string;
  published_at?: string;
  content?: string;
  slug: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog/${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        setPost(data.post || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load blog post:', err);
        setLoading(false);
      });
  }, [slug]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141714] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#141714] text-[#f8f7f2] flex items-center justify-center font-sans">
        <div className="text-center max-w-md p-6 bg-[#1d211b] border border-[#2c312a] rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold font-display text-[#e84040] mb-3">Post Not Found</h1>
          <p className="text-[#6b7163] mb-6">We could not find this blog post. Go back and select another.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white font-medium rounded-lg transition-all">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const postMeta = [post.category, formatDate(post.published_at)].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="flex justify-between items-center gap-4 mb-8 border-b border-[#2c312a] pb-6">
          <Link href="/blog" className="px-3 py-1.5 border border-[#2c312a] hover:border-zinc-600 text-[#6b7163] hover:text-white text-xs font-bold rounded-lg transition-colors">
            ← Back to Blog
          </Link>
          <Link href="/polls" className="px-3 py-1.5 bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold rounded-lg transition-colors">
            See Polls
          </Link>
        </div>

        <article className="bg-[#1d211b] border border-[#2c312a] rounded-xl overflow-hidden shadow-2xl p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mb-3 leading-snug">
            {post.title}
          </h1>
          <div className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-6">
            {postMeta}{post.author ? ` · ${post.author}` : ''}
          </div>

          {post.content && (
            <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base space-y-4">
              {post.content}
            </div>
          )}

          <div className="flex gap-3 flex-wrap mt-10 pt-6 border-t border-[#2c312a]">
            <Link href="/blog" className="px-4 py-2 border border-[#2c312a] hover:border-zinc-600 text-[#6b7163] hover:text-white text-sm font-bold rounded-lg transition-colors">
              More Blog Posts
            </Link>
            <Link href="/" className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-lg transition-colors">
              Rate an Official
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
