import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Governance explainers and accountability guides for Nigerian citizens.',
  openGraph: {
    title: 'Blog - evote.ng',
    description: 'Governance explainers and accountability guides for Nigerian citizens.',
    url: 'https://evote.ng/blog',
  }
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
