import { http, HttpResponse } from 'msw';
import { FinancialReport, UserPermissions } from '@/src/types/business';

const reports: FinancialReport[] = [
  {
    id: '1',
    customerId: '1',
    period: '202504',
    type: 'small_enterprise',
    cycle: 'quarter',
    nature: 'summary',
    status: 'confirmed',
    isAudited: true,
    auditDate: '2025-05-01',
    auditFirm: 'ABC CPA',
    auditOpinion: 'Standard Unqualified'
  },
  {
    id: '2',
    customerId: '1',
    period: '202412',
    type: 'enterprise_new_2019',
    cycle: 'year',
    nature: 'consolidated',
    status: 'unconfirmed',
    isAudited: false
  },
  {
    id: '3',
    customerId: '2',
    period: '202406',
    type: 'enterprise_old_2019',
    cycle: 'half_year',
    nature: 'base',
    status: 'confirmed',
    isAudited: true
  }
];

const permissions: UserPermissions = {
  canCreateReport: true,
  canInputCreditReport: true,
  canGenerateAIReport: false,
  canInputPublicReport: true
};

export const financialReportHandlers = [
  http.get('/api/financial-reports', ({ request }) => {
    const url = new URL(request.url);
    const customerId = url.searchParams.get('customerId');
    
    // Simple filter by customerId
    const customerReports = reports.filter(r => r.customerId === customerId);

    return HttpResponse.json({
      reports: customerReports,
      permissions
    });
  }),
];
