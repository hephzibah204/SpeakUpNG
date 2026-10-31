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
          title: 'Untitled post',
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
    if (score >= 80) return 'text-accent-light bg-paper-3 border-rule';
    if (score >= 50) return 'text-gold bg-paper-3 border-rule';
    return 'text-error bg-paper-3 border-rule';
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-body pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-rule pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-ink">Posts directory</h1>
            <p className="text-sm text-muted mt-1">Manage platform blog posts, SEO configurations, and publications.</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-accent hover:bg-accent-light text-accent-ink font-bold px-5 py-2.5 rounded-xl transition-colors text-xs focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 disabled:opacity-50"
          >
            Add new post
          </button>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-rule pb-3 mb-6 gap-6 text-xs font-semibold">
          {(['all', 'published', 'draft', 'pending_review'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 border-b-2 transition-colors focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 disabled:opacity-50 ${
                tab === t ? 'border-accent-light text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {t === 'all' ? 'All posts' : t === 'pending_review' ? 'Pending review' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts Table */}
        {loading ? (
          <div className="text-center py-20 text-muted">
            <div className="inline-block motion-safe:animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="bg-paper-2 border border-rule rounded-2xl overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-rule bg-paper text-xs font-semibold text-muted">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4 text-center">SEO score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Last modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule text-xs">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted font-medium">
                        No posts found. Select “Add new post” to write an article.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map(p => (
                      <tr key={p.id} className="hover:bg-paper-3/40 transition-colors group">
                        <td className="px-6 py-4 max-w-md">
                          <span className="font-bold text-ink block truncate">{p.title}</span>
                          <span className="text-xs text-muted block mt-0.5 truncate">{p.slug}</span>
                          {/* Hover actions */}
                          <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-muted">
                            <Link href={`/admin/blog/edit/${p.id}`} className="text-accent-light hover:underline focus-visible:outline-2 focus-visible:outline-focus">Edit</Link>
                            <button onClick={() => openQuickEdit(p)} className="text-gold hover:underline focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 disabled:opacity-50">Quick edit</button>
                            <button onClick={() => handleDelete(p.id)} className="text-error hover:underline focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 disabled:opacity-50">Delete</button>
                            <Link href={`/blog/${p.slug}`} target="_blank" className="text-ink-2 hover:underline focus-visible:outline-2 focus-visible:outline-focus">View</Link>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-ink-2">
                          <span className="font-semibold block">{p.author_name || 'Chief Editor'}</span>
                          <span className="text-xs text-muted">{p.author_role || 'Admin'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block border px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${getSeoBadgeClass(p.seo_score)}`}>
                            {p.seo_score} / 100
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            p.status === 'published' 
                              ? 'bg-paper-3 text-accent-light border-rule'
                              : p.status === 'pending_review'
                              ? 'bg-paper-3 text-gold border-rule'
                              : 'bg-paper text-muted border-rule'
                          }`}>
                            {p.status === 'pending_review' ? 'Pending review' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-muted tabular-nums text-xs">
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

        {/* Quick Edit Dialog */}
        {quickEditPost && (
          <div className="fixed inset-0 z-50 bg-paper/80 flex items-center justify-center p-4">
            <div className="bg-paper-2 border border-rule w-full max-w-lg rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex justify-between items-center border-b border-rule pb-3">
                <h3 className="font-extrabold text-ink text-sm font-display">Quick edit metadata</h3>
                <button
                  onClick={() => setQuickEditPost(null)}
                  aria-label="Close dialog"
                  className="text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 disabled:opacity-50"
                >
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleQuickSave} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-muted">Post title</label>
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    required
                    className="bg-paper border border-rule rounded-xl px-4 py-2.5 text-ink focus-visible:outline-2 focus-visible:outline-focus"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-muted">URL slug</label>
                  <input
                    type="text"
                    value={quickSlug}
                    onChange={(e) => setQuickSlug(e.target.value)}
                    required
                    className="bg-paper border border-rule rounded-xl px-4 py-2.5 text-ink focus-visible:outline-2 focus-visible:outline-focus"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-muted">Publication status</label>
                  <select
                    value={quickStatus}
                    onChange={(e) => setQuickStatus(e.target.value as any)}
                    className="bg-paper border border-rule rounded-xl px-4 py-2.5 text-ink focus-visible:outline-2 focus-visible:outline-focus"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending review</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-rule mt-6">
                  <button
                    type="button"
                    onClick={() => setQuickEditPost(null)}
                    className="border border-rule text-muted hover:text-ink px-4 py-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-light text-accent-ink px-5 py-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-focus active:translate-y-0.5 disabled:opacity-50"
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
