import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-white mb-6">Terms of Service</h1>
        <p className="text-sm text-[#6b7163] mb-8">Last Updated: July 7, 2026</p>

        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Terms of Use</h2>
            <p>
              By accessing evote.ng, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Acceptable Use Policy</h2>
            <p>
              Users are encouraged to participate in mock elections, score representative performance, and submit fact-checking claims. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Submit deliberately false, malicious, or fabricated information targeting public officials.</li>
              <li>Coordinated system manipulation using proxies, virtual networks, or automated bots to inflate votes or rating scores.</li>
              <li>Scrape data from the site without using the official research APIs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Third-Party Advertisements</h2>
            <p>
              evote.ng utilizes Google AdSense and third-party advertising modules to support our server infrastructure. We do not endorse any specific ads displayed on our platform, which are generated dynamically based on algorithmic preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Disclaimer of Liability</h2>
            <p>
              The platform outputs statistics derived from community metrics, public manifestos, and verified reports. We make no warranties regarding the absolute correctness of political sentiment indicators, which are meant for civic study and public oversight.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
