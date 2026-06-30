import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'View the live leaderboard of Nigerian government officials based on citizen ratings.',
  openGraph: {
    title: 'Leaderboard - evote.ng',
    description: 'View the live leaderboard of Nigerian government officials based on citizen ratings.',
    url: 'https://evote.ng/leaderboard',
  }
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
