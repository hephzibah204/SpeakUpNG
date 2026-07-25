'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'pending_review' | 'published';
  author_name: string;
  author_role: string;
  seo_score: number;
  readability_score: number;
  updated_at: string;
}

export default function BlogDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'published' | 'draft' | 'pending_review'>('all');
  
  // Quick Edit State
  const [quickEditPost, setQuickEditPost] = useState<BlogPost | null>(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickSlug, setQuickSlug] = useState('');
  const [quickStatus, setQuickStatus] = useState<'draft' | 'pending_review' | 'published'>('draft');

  const fetchPosts = () => {
    setLoading(true);
    fetch('/api/blog/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddNew = async () => {
    try {
      const res = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Post',
          slug: `untitled-post-${Math.random().toString(36).substring(2, 7)}`,
          status: 'draft'
        })
      });
      const data = await res.json();
      if (data.post) {
        router.push(`/admin/blog/edit/${data.post.id}`);
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await fetch(`/api/blog/posts/${id}`, { method: 'DELETE' });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditPost) return;

    try {
      await fetch(`/api/blog/posts/${quickEditPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickTitle,
          slug: quickSlug,
          status: quickStatus
        })
      });
      setQuickEditPost(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const openQuickEdit = (post: BlogPost) => {
    setQuickEditPost(post);
    setQuickTitle(post.title);
    setQuickSlug(post.slug);
    setQuickStatus(post.status);
  };

  const filteredPosts = posts.filter(p => {
    if (tab === 'all') return true;
    return p.status === tab;
  });

  const getSeoBadgeClass = (score: number) => {
    if (score >= 80) return 'text-[#00b368] bg-[#008751]/10 border-[#008751]/20';
    if (score >= 50) return 'text-[#e8a020] bg-[#e8a020]/10 border-[#e8a020]/20';
    return 'text-[#e57368] bg-[#e57368]/10 border-[#e57368]/20';
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2c312a] pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-white">Posts Dashboard</h1>
            <p className="text-sm text-[#6b7163] mt-1">Manage platform blog posts, SEO configurations, and publications.</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-[#008751] hover:bg-[#00b368] text-white font-bold px-5 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider"
          >
            Add New Post
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-[#2c312a] pb-3 mb-6 gap-6 text-xs font-bold uppercase tracking-wider">
          {(['all', 'published', 'draft', 'pending_review'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 border-b-2 transition-all ${
                tab === t ? 'border-[#00b368] text-white' : 'border-transparent text-[#6b7163] hover:text-zinc-300'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Posts Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b368]"></div>
          </div>
        ) : (
          <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#2c312a] bg-[#141714] text-[10px] uppercase tracking-wider font-extrabold text-[#6b7163]">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4 text-center">SEO Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Last Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2c312a]/50 text-xs">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-bold">
                        No posts found. Click "Add New Post" to start.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map(p => (
                      <tr key={p.id} className="hover:bg-[#141714]/30 transition-colors group">
                        <td className="px-6 py-4 max-w-md">
                          <span className="font-bold text-white block truncate">{p.title}</span>
                          <span className="text-[10px] text-zinc-500 block mt-0.5 truncate">{p.slug}</span>
                          {/* WordPress hover actions */}
                          <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[#6b7163]">
                            <Link href={`/admin/blog/edit/${p.id}`} className="text-[#00b368] hover:underline">Edit</Link>
                            <button onClick={() => openQuickEdit(p)} className="text-[#e8a020] hover:underline">Quick Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="text-[#e57368] hover:underline">Trash</button>
                            <Link href={`/blog/${p.slug}`} target="_blank" className="text-zinc-400 hover:underline">View</Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-300">
                          <span className="font-semibold block">{p.author_name || 'Chief Editor'}</span>
                          <span className="text-[9px] text-zinc-500 uppercase">{p.author_role || 'Admin'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block border px-2.5 py-1 rounded-full text-[10px] font-bold ${getSeoBadgeClass(p.seo_score)}`}>
                            {p.seo_score} / 100
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] uppercase font-bold ${
                            p.status === 'published' 
                              ? 'bg-[#008751]/10 text-[#00b368] border border-[#008751]/20'
                              : p.status === 'pending_review'
                              ? 'bg-[#e8a020]/10 text-[#e8a020] border border-[#e8a020]/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}>
                            {p.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-400 font-mono text-[10px]">
                          {new Date(p.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WordPress Quick Edit Dialog */}
        {quickEditPost && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#1d211b] border border-[#2c312a] w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-[#2c312a] pb-3">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Quick Edit</h3>
                <button onClick={() => setQuickEditPost(null)} className="text-zinc-500 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleQuickSave} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-400">Post Title</label>
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    required
                    className="bg-[#141714] border border-[#2c312a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00b368]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-400">Slug</label>
                  <input
                    type="text"
                    value={quickSlug}
                    onChange={(e) => setQuickSlug(e.target.value)}
                    required
                    className="bg-[#141714] border border-[#2c312a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00b368]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-zinc-400">Status</label>
                  <select
                    value={quickStatus}
                    onChange={(e) => setQuickStatus(e.target.value as any)}
                    className="bg-[#141714] border border-[#2c312a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#00b368]"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#2c312a] mt-6">
                  <button
                    type="button"
                    onClick={() => setQuickEditPost(null)}
                    className="border border-[#2c312a] text-zinc-400 hover:text-white px-4 py-2 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#008751] hover:bg-[#00b368] text-white px-5 py-2 rounded-xl font-bold transition-all"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
