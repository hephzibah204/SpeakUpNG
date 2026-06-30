import { queryFirst, queryAll } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 0; // Disable cache to always get live metrics

export default async function AdminDashboard() {
  // Fetch summary counts
  const officialsCount = await queryFirst<{ count: string }>('SELECT COUNT(*) as count FROM officials');
  const politiciansCount = await queryFirst<{ count: string }>('SELECT COUNT(*) as count FROM politicians');
  const promisesCount = await queryFirst<{ count: string }>('SELECT COUNT(*) as count FROM official_promises');
  const reportsCount = await queryFirst<{ count: string }>('SELECT COUNT(*) as count FROM misconduct_reports');

  // Fetch recent ratings/reviews
  const recentReviews = await queryAll<any>(`
    SELECT r.*, o.full_name as official_name, p.full_name as politician_name
    FROM (
      SELECT id, 'official' as type, official_id as target_id, overall, review_text, created_at FROM public_ratings
      UNION ALL
      SELECT id, 'politician' as type, politician_id as target_id, overall, review_text, created_at FROM politician_ratings
    ) r
    LEFT JOIN officials o ON r.type = 'official' AND r.target_id = o.id
    LEFT JOIN politicians p ON r.type = 'politician' AND r.target_id = p.id
    ORDER BY created_at DESC LIMIT 5
  `);

  // Fetch recent misconduct reports
  const recentReports = await queryAll<any>(`
    SELECT r.*, o.full_name as official_name
    FROM misconduct_reports r
    LEFT JOIN officials o ON r.official_id = o.id
    ORDER BY r.created_at DESC LIMIT 5
  `);

  const cards = [
    { label: 'Total Officials', value: officialsCount?.count || '0', icon: '🏛️', href: '/admin/officials' },
    { label: 'Total Politicians', value: politiciansCount?.count || '0', icon: '👨‍💼', href: '/admin/politicians' },
    { label: 'Mandate Promises', value: promisesCount?.count || '0', icon: '📝', href: '/admin/mandate' },
    { label: 'Misconduct Reports', value: reportsCount?.count || '0', icon: '🚨', href: '/admin/reports' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white mb-2">Overview</h1>
        <p className="text-[#6b7163] text-sm">Real-time civic intelligence insights and administration metrics.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="p-6 bg-[#1d211b] border border-[#2c312a] hover:border-zinc-700 rounded-2xl transition-all flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">{card.label}</span>
              <div className="text-3xl font-extrabold font-display text-white mt-1 group-hover:text-[#00b368] transition-colors">
                {card.value}
              </div>
            </div>
            <span className="text-3xl bg-[#141714] p-3.5 rounded-xl border border-[#2c312a]">{card.icon}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reviews */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-display text-white">Recent Citizen Reviews</h2>
            <Link href="/admin/ratings" className="text-xs font-bold text-[#00b368] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentReviews.length === 0 ? (
              <p className="text-xs text-[#6b7163] text-center py-8">No recent reviews submitted.</p>
            ) : (
              recentReviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {rev.official_name || rev.politician_name || 'Unknown Target'}
                    </span>
                    <span className="font-bold text-[#e8a020]">★ {Number(rev.overall).toFixed(1)}</span>
                  </div>
                  {rev.review_text && <p className="text-zinc-450 italic">"{rev.review_text}"</p>}
                  <div className="text-[10px] text-[#6b7163] font-semibold">
                    {new Date(rev.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Misconduct Reports */}
        <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-display text-white">Recent Misconduct Reports</h2>
            <Link href="/admin/reports" className="text-xs font-bold text-[#00b368] hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentReports.length === 0 ? (
              <p className="text-xs text-[#6b7163] text-center py-8">No recent misconduct reports filed.</p>
            ) : (
              recentReports.map((rep) => (
                <div key={rep.id} className="p-4 bg-[#141714] border border-[#2c312a] rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{rep.official_name || 'General Report'}</span>
                    <span className="px-2 py-0.5 bg-red-950/20 text-red-400 border border-red-900/30 font-bold rounded">
                      {rep.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-zinc-300 font-medium">{rep.report_title}</p>
                  <p className="text-zinc-450 line-clamp-2">{rep.report_detail}</p>
                  <div className="text-[10px] text-[#6b7163] font-semibold">
                    {new Date(rep.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
