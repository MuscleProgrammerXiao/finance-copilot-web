export async function initMocks() {
  if (typeof window === 'undefined') return;
  if (process.env.NEXT_PUBLIC_API_MOCK !== 'true') return;

  const { worker } = await import('./browser');
  await worker.start({
    onUnhandledRequest: 'bypass', // 避免干扰真实接口
  });
}
