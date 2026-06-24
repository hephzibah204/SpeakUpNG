'use client';

import { notFound, useParams } from 'next/navigation';

export default function OfficialPage() {
  const params = useParams();
  const slug = params.slug as string;

  const officials = [
    {
      id: '1',
      slug: 'bola-ahmed-tinubu',
      full_name: 'Bola Ahmed Tinubu',
      common_name: 'Tinubu',
      role: 'President',
      tier: 'federal_executive',
      state: 'FCT',
      website: 'https://president.gov.ng',
      photo_url: '',
      rating_avg: 4.2,
      rating_count: 1245,
      status: 'active',
      bio: 'Former governor of Lagos State and current President of Nigeria.',
      profile_bio: 'A seasoned politician with decades of experience in Nigerian politics.',
      aspiring_for: 'President',
      previous_offices: 'Governor of Lagos State (1999-2007)',
      wiki_title: 'Bola_Ahmed_Tinubu',
      wiki_url: 'https://en.wikipedia.org/wiki/Bola_Ahmed_Tinubu',
      social_links: { twitter: '@tinubu' },
      source_urls: ['https://en.wikipedia.org/wiki/Bola_Ahmed_Tinubu'],
      source_notes: 'Verified politician profile',
    },
    {
      id: '2',
      slug: 'seyi-makinde',
      full_name: 'Seyi Makinde',
      common_name: 'Makinde',
      role: 'Governor',
      tier: 'state_executive',
      state: 'Oyo',
      website: 'https://oyostate.gov.ng',
      photo_url: '',
      rating_avg: 4.5,
      rating_count: 892,
      status: 'active',
      bio: 'Current governor of Oyo State known for infrastructure development.',
      profile_bio: 'A forward-thinking leader focused on economic growth and social development.',
      aspiring_for: 'President',
      previous_offices: 'Current Governor of Oyo State',
      wiki_title: 'Seyi_Makinde',
      wiki_url: 'https://en.wikipedia.org/wiki/Seyi_Makinde',
      social_links: { twitter: '@seyyymakinde' },
      source_urls: ['https://en.wikipedia.org/wiki/Seyi_Makinde'],
      source_notes: 'Current governor of Oyo State',
    },
    {
      id: '3',
      slug: 'babajide-sanwo-olu',
      full_name: 'Babajide Sanwo-Olu',
      common_name: 'Sanwo-Olu',
      role: 'Governor',
      tier: 'state_executive',
      state: 'Lagos',
      website: 'https://lagosstate.gov.ng',
      photo_url: '',
      rating_avg: 4.0,
      rating_count: 756,
      status: 'active',
      bio: 'Current governor of Lagos State.',
      profile_bio: 'A dedicated public servant focused on infrastructure and technology.',
      aspiring_for: 'Governor',
      previous_offices: 'Commissioner for Lagos State',
      wiki_title: 'Babajide_Sanwo-Olu',
      wiki_url: 'https://en.wikipedia.org/wiki/Babajide_Sanwo-Olu',
      social_links: { twitter: '@jidesanwoolu' },
      source_urls: ['https://en.wikipedia.org/wiki/Babajide_Sanwo-Olu'],
      source_notes: 'Current governor of Lagos State',
    },
  ];

  const official = officials.find(o => o.id === slug || o.slug === slug);

  if (!official) {
    notFound();
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(official.full_name)}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <a href="/" className="text-green-600 hover:text-green-700">&larr; Back to Home</a>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <img
                src={avatarUrl}
                alt={official.full_name}
                className="w-full aspect-square object-cover rounded-xl"
              />

              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Party</h3>
                  <p className="text-zinc-900 dark:text-zinc-100">APC</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">State</h3>
                  <p className="text-zinc-900 dark:text-zinc-100">{official.state}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Website</h3>
                  <a href={official.website} className="text-green-600 hover:text-green-700 break-all">
                    {official.website}
                  </a>
                </div>
              </div>
            </div>

            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{official.full_name}</h1>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-6">{official.role}</p>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Bio</h2>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{official.bio}</p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Profile</h2>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{official.profile_bio}</p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Previous Offices</h2>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{official.previous_offices}</p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Aspiring For</h2>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{official.aspiring_for}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {official.rating_avg ? official.rating_avg.toFixed(1) : '\u2014'}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-500">
                      ({official.rating_count || 0} ratings)
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                    Rate This Official
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
