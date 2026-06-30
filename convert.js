const fs = require('fs');

const html = fs.readFileSync('live_evote.html', 'utf8');

// Extract the middle part (from HERO to before FOOTER)
const heroStart = html.indexOf('<!-- HERO -->');
const footerStart = html.indexOf('<!-- FOOTER -->');
const middleHtml = html.substring(heroStart, footerStart);

// Extract the modals
const modalStart = html.indexOf('<!-- ══════════ RATING MODAL ══════════ -->');
const scriptStart = html.indexOf('<script type="module">');
const modalHtml = html.substring(modalStart, scriptStart);

// Extract the script
const scriptPrefix = '<script type="module">';
const scriptStartIndex = html.indexOf(scriptPrefix);
const scriptEndIndex = html.indexOf('</script>', scriptStartIndex);
const scriptContent = html.substring(scriptStartIndex + scriptPrefix.length, scriptEndIndex);

fs.writeFileSync('speakupng-next/public/js/legacy-index.js', scriptContent);

const pageTsx = `'use client';

import Script from "next/script";

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: \`${middleHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
      <div dangerouslySetInnerHTML={{ __html: \`${modalHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
      <Script src="/js/legacy-index.js" type="module" strategy="afterInteractive" />
    </>
  );
}
`;

fs.writeFileSync('speakupng-next/app/page.tsx', pageTsx);

console.log('Conversion complete!');
