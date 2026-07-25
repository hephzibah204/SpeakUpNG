'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'blockquote';
  content: string;
  meta?: string; // Image alt text, heading level
}

interface SEOConfig {
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  status: 'draft' | 'pending_review' | 'published';
}

export default function BlogEditPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'b-init', type: 'paragraph', content: 'Start writing your story here...' }
  ]);
  const [seo, setSeo] = useState<SEOConfig>({
    focusKeyword: '',
    metaTitle: '',
    metaDescription: '',
    slug: '',
    status: 'draft'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedBlockIdx, setDraggedBlockIdx] = useState<number | null>(null);

  // Fetch existing post content
  useEffect(() => {
    fetch(`/api/blog/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.post) {
          setTitle(data.post.title);
          setSeo({
            focusKeyword: data.post.focus_keyword || '',
            metaTitle: data.post.meta_title || data.post.title,
            metaDescription: data.post.meta_description || '',
            slug: data.post.slug,
            status: data.post.status
          });
          try {
            const parsedBlocks = typeof data.post.content === 'string' 
              ? JSON.parse(data.post.content) 
              : data.post.content;
            setBlocks(parsedBlocks);
          } catch {
            setBlocks([{ id: 'b-err', type: 'paragraph', content: data.post.content || '' }]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // RankMath SEO Scoring Engine calculations
  const calculateSeoScore = () => {
    let score = 0;
    const kw = seo.focusKeyword.toLowerCase().trim();
    if (!kw) return { score: 0, checks: [] };

    const checks: { label: string; passed: boolean; value?: string }[] = [];
    const textContent = blocks.map(b => b.content).join(' ').toLowerCase();
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;

    // --- 1. Basic SEO (40 Points) ---
    const kwInTitle = title.toLowerCase().includes(kw);
    checks.push({ label: 'Focus keyword in SEO title', passed: kwInTitle });
    if (kwInTitle) score += 10;

    const kwInDesc = seo.metaDescription.toLowerCase().includes(kw);
    checks.push({ label: 'Focus keyword in Meta Description', passed: kwInDesc });
    if (kwInDesc) score += 10;

    const kwInUrl = seo.slug.toLowerCase().includes(kw.replace(/\s+/g, '-'));
    checks.push({ label: 'Focus keyword in URL slug', passed: kwInUrl });
    if (kwInUrl) score += 10;

    const wordCountCheck = wordCount >= 600;
    checks.push({ label: `Minimum 600 words (${wordCount} words)`, passed: wordCountCheck });
    if (wordCountCheck) score += 10;
    else if (wordCount >= 300) score += 5;

    // --- 2. Additional (30 Points) ---
    const kwInHeadings = blocks.some(b => b.type === 'heading' && b.content.toLowerCase().includes(kw));
    checks.push({ label: 'Focus keyword in Subheadings (H2, H3)', passed: kwInHeadings });
    if (kwInHeadings) score += 10;

    const imageAltCheck = blocks.some(b => b.type === 'image' && b.meta?.toLowerCase().includes(kw));
    checks.push({ label: 'Image alt tag contains focus keyword', passed: imageAltCheck });
    if (imageAltCheck) score += 10;

    const internalLinkCheck = textContent.includes('evote.ng') || textContent.includes('href="/');
    checks.push({ label: 'Contains internal linking', passed: internalLinkCheck });
    if (internalLinkCheck) score += 10;

    // --- 3. Readability (30 Points) ---
    const longSentences = textContent.split(/[.!?]/).filter(s => s.split(/\s+/).length > 20).length;
    const readabilityPassed = longSentences < 3;
    checks.push({ label: 'Sentence complexity (short sentences)', passed: readabilityPassed });
    if (readabilityPassed) score += 15;

    const richMedia = blocks.some(b => b.type === 'image');
    checks.push({ label: 'Rich media (images, embeds) included', passed: richMedia });
    if (richMedia) score += 15;

    return { score: Math.min(100, score), checks };
  };

  const { score: seoScore, checks: seoChecks } = calculateSeoScore();

  // Save changes
  const handleSave = async (statusOverride?: 'draft' | 'pending_review' | 'published') => {
    setSaving(true);
    const finalStatus = statusOverride || seo.status;
    try {
      await fetch(`/api/blog/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: seo.slug,
          content: blocks,
          status: finalStatus,
          focus_keyword: seo.focusKeyword,
          meta_title: seo.metaTitle || title,
          meta_description: seo.metaDescription,
          seo_score: seoScore,
          readability_score: 85
        })
      });
      setSeo(prev => ({ ...prev, status: finalStatus }));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Block management
  const addBlock = (type: 'paragraph' | 'heading' | 'image' | 'blockquote') => {
    const newBlock: Block = {
      id: `b-${Math.random().toString(36).substring(2, 7)}`,
      type,
      content: type === 'paragraph' ? 'Add paragraph text...' : type === 'heading' ? 'Heading Text' : '',
      meta: type === 'heading' ? 'H2' : type === 'image' ? 'Image Alt Description' : ''
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const updateBlock = (idx: number, content: string, meta?: string) => {
    setBlocks(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], content, meta: meta !== undefined ? meta : copy[idx].meta };
      return copy;
    });
  };

  const removeBlock = (idx: number) => {
    if (blocks.length === 1) return;
    setBlocks(prev => prev.filter((_, i) => i !== idx));
  };

  // HTML5 Drag-and-Drop Handlers for Block Reordering
  const handleDragStart = (idx: number) => {
    setDraggedBlockIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedBlockIdx === null || draggedBlockIdx === idx) return;

    // Swap items in state to reflect reorder instantly
    setBlocks(prev => {
      const copy = [...prev];
      const draggedItem = copy[draggedBlockIdx];
      copy.splice(draggedBlockIdx, 1);
      copy.splice(idx, 0, draggedItem);
      return copy;
    });
    setDraggedBlockIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggedBlockIdx(null);
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[90vh]">
        
        {/* Top Control Bar */}
        <div className="flex justify-between items-center border-b border-[#2c312a] pb-4 mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/admin/blog" className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              ← Back to Posts
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="text-xs text-[#6b7163] font-mono">ID: {id}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="border border-[#2c312a] hover:bg-[#2c312a] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="bg-[#008751] hover:bg-[#00b368] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b368]"></div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-0">
            
            {/* Left Content Canvas (WordPress Block Editor) */}
            <div className="lg:col-span-8 flex flex-col bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 overflow-y-auto">
              
              {/* Post Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  // Generate automatic slug
                  if (!seo.slug.startsWith('custom-')) {
                    setSeo(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }));
                  }
                }}
                placeholder="Enter post title here..."
                className="w-full bg-transparent text-3xl font-black font-display text-white border-b border-[#2c312a]/50 pb-4 mb-8 focus:outline-none focus:border-[#00b368] transition-colors"
              />

              {/* Block Canvas Area */}
              <div className="flex-1 space-y-6">
                {blocks.map((b, idx) => (
                  <div
                    key={b.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative flex gap-4 p-3 rounded-xl border border-transparent hover:border-[#2c312a] hover:bg-[#141714]/20 transition-all ${
                      draggedBlockIdx === idx ? 'opacity-40 border-[#00b368]' : ''
                    }`}
                  >
                    {/* Drag Grab Handle */}
                    <div className="cursor-grab opacity-0 group-hover:opacity-100 flex items-center text-zinc-600 hover:text-white transition-opacity select-none">
                      ☰
                    </div>

                    {/* Block inputs */}
                    <div className="flex-1">
                      {b.type === 'paragraph' && (
                        <textarea
                          value={b.content}
                          onChange={(e) => updateBlock(idx, e.target.value)}
                          className="w-full bg-transparent text-sm text-zinc-300 focus:outline-none resize-none leading-relaxed"
                          rows={3}
                        />
                      )}

                      {b.type === 'heading' && (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            {['H2', 'H3', 'H4'].map(h => (
                              <button
                                key={h}
                                type="button"
                                onClick={() => updateBlock(idx, b.content, h)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                  b.meta === h ? 'bg-[#008751] border-[#00b368] text-white' : 'border-[#2c312a] text-zinc-500'
                                }`}
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            value={b.content}
                            onChange={(e) => updateBlock(idx, e.target.value)}
                            className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                          />
                        </div>
                      )}

                      {b.type === 'image' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={b.content}
                            onChange={(e) => updateBlock(idx, e.target.value)}
                            placeholder="Paste image URL here..."
                            className="w-full bg-[#141714] border border-[#2c312a] text-xs text-white px-3 py-2 rounded-lg focus:outline-none"
                          />
                          <input
                            type="text"
                            value={b.meta || ''}
                            onChange={(e) => updateBlock(idx, b.content, e.target.value)}
                            placeholder="Image Alt text (Yoast keyword alt check)..."
                            className="w-full bg-transparent border-b border-[#2c312a] text-[10px] text-zinc-500 focus:outline-none"
                          />
                        </div>
                      )}

                      {b.type === 'blockquote' && (
                        <textarea
                          value={b.content}
                          onChange={(e) => updateBlock(idx, e.target.value)}
                          className="w-full bg-transparent border-l-4 border-[#00b368] pl-4 italic text-sm text-zinc-400 focus:outline-none resize-none"
                          rows={2}
                        />
                      )}
                    </div>

                    {/* Block Delete Control */}
                    <button
                      onClick={() => removeBlock(idx)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-[#e57368] text-[10px] transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {/* Block Addition Control Bar */}
              <div className="flex gap-2 justify-center border-t border-[#2c312a]/50 pt-4 mt-6">
                {(['paragraph', 'heading', 'image', 'blockquote'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addBlock(type)}
                    className="bg-[#141714] hover:bg-[#2c312a] border border-[#2c312a] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors capitalize"
                  >
                    + {type}
                  </button>
                ))}
              </div>

            </div>

            {/* Right Section (RankMath SEO Sidebar Panel) */}
            <div className="lg:col-span-4 flex flex-col bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 overflow-y-auto space-y-6">
              
              {/* Radial SEO Score Indicator */}
              <div className="flex flex-col items-center border-b border-[#2c312a] pb-6">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b7163] mb-3">RankMath SEO Score</span>
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Radial SVG Progress bar */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="46" fill="transparent" stroke="#141714" strokeWidth="6" />
                    <circle 
                      cx="56" cy="56" r="46" 
                      fill="transparent" 
                      stroke={seoScore >= 80 ? '#00b368' : seoScore >= 50 ? '#e8a020' : '#e57368'} 
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 46}
                      strokeDashoffset={(2 * Math.PI * 46) * (1 - seoScore / 100)}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-black text-white">{seoScore}</span>
                    <span className="text-[10px] text-zinc-500 block">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Keyword Settings */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400">Focus Keyword</label>
                  <input
                    type="text"
                    value={seo.focusKeyword}
                    onChange={(e) => setSeo(prev => ({ ...prev, focusKeyword: e.target.value }))}
                    placeholder="Enter focus keyword..."
                    className="bg-[#141714] border border-[#2c312a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b368]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400">Custom URL Slug</label>
                  <input
                    type="text"
                    value={seo.slug}
                    onChange={(e) => setSeo(prev => ({ ...prev, slug: 'custom-' + e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="custom-url-slug"
                    className="bg-[#141714] border border-[#2c312a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00b368]"
                  />
                </div>
              </div>

              {/* Snippet Preview Selector */}
              <div className="bg-[#141714] border border-[#2c312a] rounded-xl p-4 space-y-3">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#00b368] block">Google SERP Snippet Preview</span>
                <div className="space-y-1">
                  <span className="text-xs text-sky-400 font-semibold block hover:underline truncate">
                    {seo.metaTitle || title || 'Untitled Post'}
                  </span>
                  <span className="text-[10px] text-green-600 block truncate">
                    https://evote.ng/blog/{seo.slug || 'slug'}
                  </span>
                  <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2">
                    {seo.metaDescription || 'Add custom meta description below to customize this preview snippet...'}
                  </p>
                </div>
              </div>

              {/* Meta Inputs */}
              <div className="space-y-4 pt-4 border-t border-[#2c312a]/50">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400">Meta Title</label>
                  <input
                    type="text"
                    value={seo.metaTitle}
                    onChange={(e) => setSeo(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Meta Title"
                    className="bg-[#141714] border border-[#2c312a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-400">Meta Description</label>
                  <textarea
                    value={seo.metaDescription}
                    onChange={(e) => setSeo(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Write meta description..."
                    rows={3}
                    className="bg-[#141714] border border-[#2c312a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Accordion Checklist */}
              <div className="space-y-3 pt-4 border-t border-[#2c312a]/50">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#6b7163] block">SEO Performance Indicators</span>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto text-xs pr-1">
                  {seoChecks.map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between text-zinc-400 leading-normal">
                      <span className="truncate pr-3">{check.label}</span>
                      <span className={`font-bold font-mono shrink-0 ${check.passed ? 'text-[#00b368]' : 'text-[#e57368]'}`}>
                        {check.passed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
