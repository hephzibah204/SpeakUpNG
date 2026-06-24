'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { RatingModal } from '@/components/RatingModal';

export default function PoliticianProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [politician, setPolitician] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/api/politicians?search=${encodeURIComponent(slug.replace(/-/g, ' '))}`).then(r => r.json()),
      fetch(`/api/ratings?politician_slug=${encodeURIComponent(slug)}`).then(r => r.json()),
    ]).then(([pData, rData]) => {
      setPolitician(pData.politicians?.[0] || null);
      setRatings(rData.results || rData || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!politician) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Politician Not Found</h1>
          <p className="text-zinc-600 dark:text-zinc-400">The politician you're looking for doesn't exist.</p>
          <a href="/politicians" className="mt-4 inline-block text-green-600 hover:underline">← Back to Politicians</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <a href="/politicians" className="text-green-600 hover:text-green-700">← Back to Politicians</a>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <img
                src={politician.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`}
                alt={politician.full_name}
                className="w-full aspect-square object-cover rounded-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
                }}
              />
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Party</h3>
                  <span className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm font-medium">
                    {politician.party}
                  </span>
                </div>
                {politician.aspiration_title && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Aspiration</h3>
                    <p className="text-zinc-900 dark:text-zinc-100">{politician.aspiration_title}</p>
                  </div>
                )}
                {politician.previous_offices && (
                  <div>
                    <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Previous Offices</h3>
                    <p className="text-zinc-900 dark:text-zinc-100">{politician.previous_offices}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{politician.full_name}</h1>
              {politician.common_name && (
                <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-4">Also known as: {politician.common_name}</p>
              )}

              <div className="space-y-6">
                {politician.bio && (
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Bio</h2>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{politician.bio}</p>
                  </div>
                )}
                {politician.profile_bio && (
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Profile</h2>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{politician.profile_bio}</p>
                  </div>
                )}
              </div>

              {politician.social_links && Object.keys(politician.social_links).length > 0 && (
                <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Social Links</h2>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(politician.social_links).map(([platform, url]) => (
                      <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                        className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {politician.rating_avg ? Number(politician.rating_avg).toFixed(1) : '—'}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-500">
                      ({politician.rating_count || 0} ratings)
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Rate This Politician
                  </button>
                </div>
              </div>

              {ratings.length > 0 && (
                <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Recent Ratings</h2>
                  <div className="space-y-4">
                    {ratings.slice(0, 10).map((r: any, i: number) => (
                      <div key={r.id || i} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-500">{'★'.repeat(Math.round(r.overall || 0))}{'☆'.repeat(5 - Math.round(r.overall || 0))}</span>
                          <span className="font-semibold">{Number(r.overall).toFixed(1)}</span>
                        </div>
                        {r.review_text && <p className="text-sm text-zinc-600 dark:text-zinc-400">{r.review_text}</p>}
                        <p className="text-xs text-zinc-500 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRatingModal && (
        <RatingModal
          targetId={politician.id}
          targetType="politician"
          targetName={politician.full_name}
          onClose={() => setShowRatingModal(false)}
          onSubmit={() => {
            setShowRatingModal(false);
            setTimeout(() => window.location.reload(), 500);
          }}
        />
      )}
    </div>
  );
}
