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

type CustomerListResponse = paths['/api/customers']['get']['responses']['200']['content']['application/json'];
type CustomerListParams = paths['/api/customers']['get']['parameters']['query'];

export async function getCustomers(params: CustomerListParams): Promise<CustomerListResponse> {
  const searchParams = new URLSearchParams();
  if (params.loginName) searchParams.append('loginName', params.loginName);
  if (params.userCode) searchParams.append('userCode', params.userCode);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
  if (params.name) searchParams.append('name', params.name);

  const res = await fetch(`/api/customers?${searchParams.toString()}`);

  if (!res.ok) {
    throw new Error('request failed');
  }

  return res.json();
}

type FinancialReportsResponse = paths['/api/financial-reports']['get']['responses']['200']['content']['application/json'];
type FinancialReportsParams = paths['/api/financial-reports']['get']['parameters']['query'];

export async function getFinancialReports(params: FinancialReportsParams): Promise<FinancialReportsResponse> {
  const searchParams = new URLSearchParams();
  if (params.customerId) searchParams.append('customerId', params.customerId);
  if (params.loginName) searchParams.append('loginName', params.loginName);
  if (params.userCode) searchParams.append('userCode', params.userCode);

  const res = await fetch(`/api/financial-reports?${searchParams.toString()}`);

  if (!res.ok) {
    throw new Error('request failed');
  }

  return res.json();
}

type SubmitBasicInfoResponse = paths['/api/report/basic-info']['post']['responses']['200']['content']['application/json'];
type SubmitBasicInfoBody = paths['/api/report/basic-info']['post']['requestBody']['content']['application/json'];

export async function submitBasicInfo(data: SubmitBasicInfoBody): Promise<SubmitBasicInfoResponse> {
  const res = await fetch('/api/report/basic-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('submit basic info failed');
  return res.json();
}

type SubmitAuditInfoResponse = paths['/api/report/audit-info']['post']['responses']['200']['content']['application/json'];
type SubmitAuditInfoBody = paths['/api/report/audit-info']['post']['requestBody']['content']['application/json'];

export async function submitAuditInfo(data: SubmitAuditInfoBody): Promise<SubmitAuditInfoResponse> {
  const res = await fetch('/api/report/audit-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('submit audit info failed');
  return res.json();
}
