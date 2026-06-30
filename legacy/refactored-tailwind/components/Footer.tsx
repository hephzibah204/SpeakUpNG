export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-3">evote.ng</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Nigerian Civic Accountability Platform. All submissions are 100% anonymous. No personal data collected.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Quick Links</h3>
            <div className="space-y-2">
              <a href="/" className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-green-600 transition-colors">Officials</a>
              <a href="/agencies" className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-green-600 transition-colors">Agencies</a>
              <a href="/politicians" className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-green-600 transition-colors">Politicians</a>
              <a href="/leaderboard" className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-green-600 transition-colors">Rankings</a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Content</h3>
            <div className="space-y-2">
              <a href="/blog" className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-green-600 transition-colors">Blog</a>
              <a href="/news" className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-green-600 transition-colors">News</a>
              <a href="/news?tab=editorial" className="block text-sm text-zinc-600 dark:text-zinc-400 hover:text-green-600 transition-colors">Editorial</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-600 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} evote.ng — Nigerian Civic Accountability Platform
        </div>
      </div>
    </footer>
  );
}
