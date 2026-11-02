import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2027 Nigeria Mock Elections - Live Presidential & 28 State Governorship Ballots',
  description: 'Cast your mock ballot for the 2027 Nigerian Presidential election and all 28 State Governorship races. View live regional voting breakdowns and public opinion scoreboards on evote.ng.',
  openGraph: {
    title: '2027 Nigeria Mock Elections | evote.ng',
    description: 'Cast your mock vote for 2027 Presidential and Governorship candidates. Live real-time regional leaderboards and public opinion tracking.',
    url: 'https://evote.ng/elections/2027',
    siteName: 'evote.ng',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2027 Nigeria Mock Elections | evote.ng',
    description: 'Cast your mock vote for 2027 Presidential and 28 State Governorship candidates. Real-time regional results.',
  },
};

export default function Elections2027Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
