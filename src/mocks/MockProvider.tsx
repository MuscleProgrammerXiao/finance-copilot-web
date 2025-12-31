'use client';

import { useEffect, useState } from 'react';
import { initMocks } from './index';

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function start() {
      if (process.env.NEXT_PUBLIC_API_MOCK === 'true') {
        await initMocks();
      }
      setReady(true);
    }

    start();
  }, []);

  // ⛔ MSW 没启动前，什么都不渲染
  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
