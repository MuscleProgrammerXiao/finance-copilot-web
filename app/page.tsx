'use client';

import { useEffect, useState } from 'react';
import { getHello } from '@/src/api/client';

export default function Page() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getHello().then((res) => {
      setMsg(res.message);
    });
  }, []);

  return <div>{msg}</div>;
}
