import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl font-black text-[#2c312a] mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>404</div>
      <h1 className="text-2xl font-extrabold text-white mb-3">Page Not Found</h1>
      <p className="text-[#6b7163] text-sm max-w-sm mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/"
          className="px-6 py-2.5 bg-[#008751] hover:bg-[#00b368] text-white text-sm font-bold rounded-xl transition-colors">
          Go Home
        </Link>
        <Link href="/leaderboard"
          className="px-6 py-2.5 border border-[#2c312a] hover:border-[#3c4139] text-[#6b7163] hover:text-[#f8f7f2] text-sm font-bold rounded-xl transition-colors">
          View Rankings
        </Link>
      </div>
    </div>
  );
}
