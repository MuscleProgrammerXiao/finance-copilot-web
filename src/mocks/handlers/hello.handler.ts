import { http, HttpResponse } from 'msw';
import type { paths } from '@/src/gen/api-types';

type HelloResponse =
  paths['/api/hello']['get']['responses']['200']['content']['application/json'];

export const helloHandlers = [
  http.get('/api/hello', () => {
    const data: HelloResponse = {
      message: 'Hello from mock',
    };

    return HttpResponse.json(data);
  }),
];
