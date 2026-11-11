import { queryFirst, queryAll } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 0; // Disable cache to always get live metrics

export default async function AdminDashboard() {
  const officialsCount = await queryFirst<{ count: string }>('SELECT COUNT(*) as count FROM officials');
  const politiciansCount = await queryFirst<{ count: string }>('SELECT COUNT(*) as count FROM politicians');
  const promisesCount = await queryFirst<{ count: string }>('SELECT COUNT(*) as count FROM official_promises');
  const reportsCount = await queryFirst<{ count: string }>('SELECT COUNT(*) as count FROM misconduct_reports');

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

  const recentReports = await queryAll<any>(`
    SELECT r.*, o.full_name as official_name
    FROM misconduct_reports r
    LEFT JOIN officials o ON r.official_id = o.id
    ORDER BY r.created_at DESC LIMIT 5
  `);

  const cards = [
    { label: 'Total officials', value: officialsCount?.count || '0', href: '/admin/officials' },
    { label: 'Total politicians', value: politiciansCount?.count || '0', href: '/admin/politicians' },
    { label: 'Mandate promises', value: promisesCount?.count || '0', href: '/admin/mandate' },
    { label: 'Misconduct reports', value: reportsCount?.count || '0', href: '/admin/reports' },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-ink mb-1">System overview</h1>
        <p className="text-muted text-sm">Key indicators and recent activity across the registry.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="p-5 bg-paper-2 border border-rule hover:border-ink/20 rounded transition-colors group"
          >
            <span className="text-xs text-muted block mb-2">{card.label}</span>
            <div className="text-2xl font-bold font-serif text-ink group-hover:text-accent transition-colors">
              {card.value}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-paper-2 border border-rule rounded p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-ink">Recent citizen reviews</h2>
            <Link href="/admin/ratings" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentReviews.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">No recent reviews submitted.</p>
            ) : (
              recentReviews.map((rev) => (
                <div key={rev.id} className="p-3.5 bg-paper-3 border border-rule rounded text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">
                      {rev.official_name || rev.politician_name || 'Unknown record'}
                    </span>
                    <span className="font-mono text-gold">{Number(rev.overall).toFixed(1)} / 5.0</span>
                  </div>
                  {rev.review_text && <p className="text-ink-2 italic">"{rev.review_text}"</p>}
                  <div className="text-[11px] text-muted font-mono">
                    {new Date(rev.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Misconduct Reports */}
        <div className="bg-paper-2 border border-rule rounded p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-ink">Recent misconduct reports</h2>
            <Link href="/admin/reports" className="text-xs text-accent hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-xs text-muted text-center py-8">No reports filed.</p>
            ) : (
              recentReports.map((rep) => (
                <div key={rep.id} className="p-3.5 bg-paper-3 border border-rule rounded text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{rep.official_name || 'General Report'}</span>
                    <span className="px-2 py-0.5 bg-error/10 text-error border border-error/20 text-[11px] font-mono rounded">
                      {rep.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-ink font-medium">{rep.report_title}</p>
                  <p className="text-muted line-clamp-2">{rep.report_detail}</p>
                  <div className="text-[11px] text-muted font-mono">
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
