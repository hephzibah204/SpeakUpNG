import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-extrabold text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-[#6b7163] mb-8">Last Updated: July 7, 2026</p>

        <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Introduction</h2>
            <p>
              Welcome to evote.ng. We are committed to protecting your privacy while enabling transparent, data-driven civic intelligence. This Privacy Policy details how we handle user data and our compliance with Google AdSense terms and general regulatory frameworks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">2. Information Collection</h2>
            <p>
              evote.ng is designed as an anonymous civic accountability platform. We do not require or collect personal identifying information (such as your real name, email, or physical address) to access rankings, DNA scores, or to submit reviews. 
            </p>
            <p>
              Our verification systems (e.g. for mock elections or fact checking) use locally computed device fingerprints and anonymous hashes to prevent coordinated bot manipulation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">3. Cookies and Advertising</h2>
            <p>
              We partner with Google AdSense to serve advertisements on our platform. Google, as a third-party vendor, uses cookies to serve ads on evote.ng based on users' visits to this and other websites on the internet.
            </p>
            <p>
              Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#00b368] hover:underline">Google Ad Settings</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">4. Data Security</h2>
            <p>
              All submissions, ratings, and signatures are stored securely on encrypted server databases. Since we do not collect personal identify records, your participation across the platform remains strictly decoupled from your real-world identity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">5. Contact</h2>
            <p>
              For privacy-related inquiries or feedback on our methodologies, please reference our Trust Centre or contact our ethics board.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
