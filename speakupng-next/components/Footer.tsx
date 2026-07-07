export function Footer() {
  return (
    <footer className="border-t border-[#2c312a] bg-[#1d211b] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="font-extrabold text-white mb-3 text-lg">evote.ng</h3>
            <p className="text-sm text-[#6b7163] leading-relaxed">
              Nigerian Civic Accountability Platform.<br />
              All submissions are 100% anonymous.<br />
              No personal data collected.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-3">Accountability</h4>
            <div className="space-y-2">
              {[
                { href: '/', label: 'Officials' },
                { href: '/agencies', label: 'Agencies' },
                { href: '/politicians', label: 'Politicians' },
                { href: '/leaderboard', label: 'Rankings' },
                { href: '/polls', label: 'Polls' },
              ].map(({ href, label }) => (
                <a key={href} href={href}
                  className="block text-sm text-[#6b7163] hover:text-[#00b368] transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b7163] mb-3">Content & Legal</h4>
            <div className="space-y-2">
              {[
                { href: '/news', label: 'News' },
                { href: '/blog', label: 'Blog' },
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
              ].map(({ href, label }) => (
                <a key={href} href={href}
                  className="block text-sm text-[#6b7163] hover:text-[#00b368] transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#2c312a] text-center text-xs text-[#6b7163]">
          &copy; {new Date().getFullYear()} evote.ng — Nigerian Civic Accountability Platform
        </div>
      </div>
    </footer>
  );
}
