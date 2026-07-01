import type { Metadata } from 'next';
import ResearchPortalClient from './ResearchPortalClient';

export const metadata: Metadata = {
  title: 'Media & Research Portal | evote.ng',
  description: 'Download civic datasets in JSON/CSV formats and explore open APIs to monitor government officials, elections, and public service performance in Nigeria.',
  keywords: ['evote.ng datasets', 'nigerian election API', 'governorship candidates data', 'citizen verifications data', 'nigerian politics open data'],
};

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-20">
      {/* Hero section */}
      <header className="hero border-b border-[#2c312a] mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hero-eyebrow">RESEARCH & TRANSPARENCY</div>
          <h1 id="research-portal-title" className="text-white">
            Media & <em>Research Portal</em>
          </h1>
          <p className="max-w-2xl mx-auto text-zinc-400">
            Empowering journalists, civil organizations, and policy researchers with programmatic APIs and open datasets to audit governance in Nigeria.
          </p>
        </div>
      </header>

      {/* Main content container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ResearchPortalClient />
      </main>
    </div>
  );
}
