'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
}

export function AdBanner({ adSlot, adFormat = 'auto', responsive = true }: AdBannerProps) {
  useEffect(() => {
    try {
      // Ensure the adsbygoogle array exists and push to trigger ad load
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.warn('AdSense failed to load banner:', err);
    }
  }, []);

  // Determine fixed sizes or responsive slots to prevent layout shifts
  const getBannerStyles = () => {
    if (adFormat === 'rectangle') return 'w-[300px] h-[250px] mx-auto';
    if (adFormat === 'horizontal') return 'w-full h-[90px] max-w-[728px] mx-auto';
    return 'w-full min-h-[90px]';
  };

  return (
    <div className="my-8 mx-auto text-center flex flex-col items-center justify-center">
      {/* Label indicating it is an advertisement, satisfying Google policies */}
      <span className="text-[9px] text-[#6b7163] uppercase tracking-widest font-extrabold mb-1 block select-none">
        Advertisement
      </span>
      <div 
        className={`bg-[#1d211b]/30 border border-[#2c312a]/50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center ${getBannerStyles()}`}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-7561066830588126"
          data-ad-slot={adSlot}
          data-ad-format={adFormat}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>
    </div>
  );
}
