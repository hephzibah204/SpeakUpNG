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
  
  let official;
  const baseQuery = `SELECT * FROM officials`;
  
  if (possibleId) {
    official = await queryFirst<any>(`${baseQuery} WHERE id = ?`, [possibleId]);
  }
  if (!official) {
    official = await queryFirst<any>(`${baseQuery} WHERE id = ?`, [slug]);
  }
  if (!official) {
    official = await queryFirst<any>(`${baseQuery} WHERE LOWER(full_name) LIKE LOWER(?) AND status = 'active'`, [namePattern]);
  }

  if (!official) {
    return { title: 'Official Not Found' };
  }

  const title = `${official.full_name} - ${official.role || 'Official'}`;
  const description = official.bio ? official.bio.substring(0, 160) : `View performance ratings, career timeline, and reviews for ${official.full_name}, ${official.role || 'Official'}.`;
  
  const images = official.photo_url ? [official.photo_url] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://evote.ng/official/${slug}`,
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

export default function OfficialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
