import { http, HttpResponse } from 'msw';

export const reportSubmissionHandlers = [
  http.post('/api/report/basic-info', async ({ request }) => {
    const body = await request.json();
    console.log('Received Basic Info:', body);
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 800));

    return HttpResponse.json({
        reportId: 'R-' + Date.now(),
        status: 'success'
    });
  }),

  http.post('/api/report/audit-info', async ({ request }) => {
    const body = await request.json();
    console.log('Received Audit Info:', body);

    await new Promise(r => setTimeout(r, 800));

    return HttpResponse.json({
        status: 'success'
    });
  })
];
