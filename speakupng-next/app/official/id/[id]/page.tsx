'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OfficialIdRedirect() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [error, setError] = useState('');

  const slugify = (name: string) => {
    return name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  };

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/officials/${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => {
        if (data.official) {
          const o = data.official;
          router.replace(`/official/${slugify(o.full_name)}--${o.id}`);
        } else {
          setError('Official not found');
        }
      })
      .catch(() => {
        setError('Error loading official profile');
      });
  }, [id, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#141714] text-[#f8f7f2] flex items-center justify-center font-sans">
        <div className="text-center max-w-md p-6 bg-[#1d211b] border border-[#2c312a] rounded-xl">
          <h1 className="text-2xl font-bold text-[#e84040] mb-2">Redirect Error</h1>
          <p className="text-[#6b7163]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141714] flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b368]"></div>
    </div>
  );
}
