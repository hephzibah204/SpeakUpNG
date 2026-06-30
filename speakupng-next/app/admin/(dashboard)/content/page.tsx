'use client';

import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category?: string;
  author?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
}

export default function AdminContentPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', summary: '', content: '', category: 'blog', author: '', published: false,
  });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', slug: '', summary: '', content: '', category: 'blog', author: '', published: false });
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title, slug: post.slug, summary: post.summary || '',
      content: post.content || '', category: post.category || 'blog',
      author: post.author || '', published: post.published,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/admin/content/${editing.id}` : '/api/admin/content';
      await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowForm(false);
      fetchPosts();
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const togglePublish = async (post: BlogPost) => {
    await fetch(`/api/admin/content/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    });
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
    fetchPosts();
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Content Management</h1>
          <p className="text-[#6b7163] text-sm">Create and manage blog posts, editorials, and analysis content.</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl transition-colors">
          + New Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">{editing ? 'Edit Post' : 'New Post'}</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Title</label>
              <input required type="text" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: autoSlug(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
                placeholder="Post title" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Slug</label>
              <input required type="text" value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
                placeholder="url-slug" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] focus:outline-none focus:border-[#00b368]">
                <option value="blog">Blog</option>
                <option value="editorial">Editorial</option>
                <option value="analysis">Analysis</option>
                <option value="explainer">Explainer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Author</label>
              <input type="text" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368]"
                placeholder="Author name" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Summary</label>
            <textarea value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} rows={2}
              className="w-full px-4 py-3 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] resize-none"
              placeholder="Short description shown in listings" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-1">Content (Markdown)</label>
            <textarea required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={10}
              className="w-full px-4 py-3 bg-[#141714] border border-[#2c312a] rounded-lg text-sm text-[#f8f7f2] font-mono placeholder-[#6b7163] focus:outline-none focus:border-[#00b368] resize-y"
              placeholder="Write post content in Markdown..." />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="published" checked={form.published}
              onChange={e => setForm(p => ({ ...p, published: e.target.checked }))}
              className="w-4 h-4 accent-[#008751]" />
            <label htmlFor="published" className="text-sm text-[#f8f7f2] font-medium">Publish immediately</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="px-4 py-2 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
              {submitting ? 'Saving...' : (editing ? 'Update Post' : 'Create Post')}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#2c312a] text-[#6b7163] text-sm font-bold rounded-xl hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#6b7163] text-sm">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-[#6b7163] text-sm">No posts yet. Create one above.</div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#2c312a] text-[#6b7163]">{post.category}</span>
                  {post.published ? (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#008751]/10 border border-[#008751]/30 text-[#00b368]">Published</span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#2c312a] text-[#6b7163]">Draft</span>
                  )}
                </div>
                <div className="font-bold text-white text-sm">{post.title}</div>
                {post.summary && <p className="text-[#6b7163] text-xs mt-1 line-clamp-2">{post.summary}</p>}
                <div className="text-[10px] text-[#6b7163] mt-2">/{post.slug} · {post.author || 'Anonymous'}</div>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0 text-xs font-bold">
                <button onClick={() => openEdit(post)} className="text-[#00b368] hover:underline">Edit</button>
                <button onClick={() => togglePublish(post)} className="text-[#e8a020] hover:underline">
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => deletePost(post.id)} className="text-red-400 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
