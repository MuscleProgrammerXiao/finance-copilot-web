import type { paths } from '@/src/gen/api-types';

type HelloResponse =
  paths['/api/hello']['get']['responses']['200']['content']['application/json'];

export async function getHello(): Promise<HelloResponse> {
  const res = await fetch('/api/hello');

  if (!res.ok) {
    throw new Error('request failed');
  }

  return res.json();
}
