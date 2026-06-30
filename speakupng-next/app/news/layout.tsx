import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Political News Hub',
  description: 'Breaking Nigerian political news, governance updates, security reports and economic analysis.',
  openGraph: {
    title: 'Political News Hub - evote.ng',
    description: 'Breaking Nigerian political news, governance updates, security reports and economic analysis.',
    url: 'https://evote.ng/news',
  }
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
