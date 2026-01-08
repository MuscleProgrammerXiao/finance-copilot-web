import { http, HttpResponse } from 'msw';
import { USER_INFO } from '@/src/constants/flow';
import type { paths } from '@/src/gen/api-types';

type CustomerListResponse = paths['/api/customers']['get']['responses']['200']['content']['application/json'];

// 模拟客户数据
const MOCK_CUSTOMERS = [
  { id: '1', name: '阿里巴巴(中国)网络技术有限公司', socialCreditCode: '91330100799655058B' },
  { id: '2', name: '腾讯科技(深圳)有限公司', socialCreditCode: '9144030071526726XG' },
  { id: '3', name: '北京字节跳动科技有限公司', socialCreditCode: '911101085923662400' },
  { id: '4', name: '京东集团股份有限公司', socialCreditCode: '91110000661138245X' },
  { id: '5', name: '美团点评有限公司', socialCreditCode: '911101055620819586' },
  { id: '6', name: '网易(杭州)网络有限公司', socialCreditCode: '913301007882833053' },
  { id: '7', name: '百度在线网络技术(北京)有限公司', socialCreditCode: '91110000802100433B' },
  { id: '8', name: '快手科技', socialCreditCode: '91110108MA005F7D3L' },
  { id: '9', name: '滴滴出行科技有限公司', socialCreditCode: '911201163409833307' },
  { id: '10', name: '拼多多(上海)网络技术有限公司', socialCreditCode: '91310000MA1G52G84W' },
  { id: '11', name: '小米科技有限责任公司', socialCreditCode: '91110108551385082Q' },
  { id: '12', name: '携程计算机技术(上海)有限公司', socialCreditCode: '913100006073806051' },
];

export const customerHandlers = [
  http.get('/api/customers', ({ request }) => {
    const url = new URL(request.url);
    const loginName = url.searchParams.get('loginName');
    const userCode = url.searchParams.get('userCode');
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    const nameFilter = url.searchParams.get('name');

    // 校验用户信息（模拟鉴权）
    if (loginName !== USER_INFO.loginName || userCode !== USER_INFO.userCode) {
        return new HttpResponse(null, { status: 403, statusText: 'Forbidden' });
    }

    // 过滤数据
    let filteredCustomers = MOCK_CUSTOMERS;
    if (nameFilter) {
      filteredCustomers = filteredCustomers.filter(c => c.name.includes(nameFilter));
    }

    // 分页逻辑
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filteredCustomers.slice(start, end);

    const responseData: CustomerListResponse = {
      items,
      total: filteredCustomers.length,
    };

    return HttpResponse.json(responseData);
  }),
];
