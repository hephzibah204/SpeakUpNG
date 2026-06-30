import { Metadata } from 'next';
import { queryFirst } from '@/lib/db';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug || '');
  
  const parts = slug.split('--');
  const possibleId = parts.length > 1 ? parts[parts.length - 1] : null;
  const nameSlug = parts[0];
  const namePattern = '%' + nameSlug.replace(/-/g, '%') + '%';
  
  let politician;
  const baseQuery = `SELECT * FROM politicians`;
  
  if (possibleId) {
    politician = await queryFirst<any>(`${baseQuery} WHERE id = ?`, [possibleId]);
  }
  if (!politician) {
    politician = await queryFirst<any>(`${baseQuery} WHERE id = ?`, [slug]);
  }
  if (!politician) {
    politician = await queryFirst<any>(`${baseQuery} WHERE LOWER(full_name) LIKE LOWER(?) OR LOWER(common_name) LIKE LOWER(?)`, [namePattern, namePattern]);
  }

  if (!politician) {
    return { title: 'Politician Not Found' };
  }

  const title = `${politician.full_name} - ${politician.party || 'Politician'}`;
  const description = politician.bio ? politician.bio.substring(0, 160) : `View performance ratings, promises, and reviews for ${politician.full_name}, ${politician.party || 'Politician'}.`;
  
  const images = politician.photo_url ? [politician.photo_url] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://evote.ng/politician/${slug}`,
      images,
      type: 'profile'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    }
  };
}

export default function PoliticianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
