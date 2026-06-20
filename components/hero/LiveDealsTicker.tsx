'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TickerItem {
  store: string;
  discount: string;
  slug: string;
}

export default function LiveDealsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from('coupons')
      .select('discount, store:stores(name, slug)')
      .not('discount', 'is', null)
      .limit(12)
      .then(({ data }) => {
        if (!active || !data) return;
        const mapped: TickerItem[] = data
          .filter((c: any) => c.store?.name && c.discount)
          .map((c: any) => ({
            store: c.store.name,
            discount: c.discount,
            slug: c.store.slug,
          }));
        setItems(mapped);
      });
    return () => { active = false; };
  }, []);

  if (items.length === 0) return null;

  // Duplicate the list so the scroll loops seamlessly
  const loop = [...items, ...items];

  return (
    <div className="ticker-mask mt-7 overflow-hidden">
      <div className="ticker-track">
        {loop.map((item, i) => (
          <a
            key={i}
            href={`/store/${item.slug}`}
            className="flex-shrink-0 text-sm text-white whitespace-nowrap rounded-lg px-3.5 py-2 transition-colors hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <span className="font-semibold">{item.store}</span>
            <span className="ml-1.5" style={{ color: '#FED7AA' }}>{item.discount}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
