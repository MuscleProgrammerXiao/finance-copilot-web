import { http, HttpResponse } from 'msw';
import { USER_INFO } from '@/src/constants/flow';
import type { paths } from '@/src/gen/api-types';

type CustomerListResponse = paths['/api/customers']['get']['responses']['200']['content']['application/json'];

// 模拟客户数据
const MOCK_CUSTOMERS = [
  // 科技/制造
  { id: '1', name: '深圳云天励飞技术股份有限公司', socialCreditCode: '91440300311726707K' },
  { id: '2', name: '成都极米科技股份有限公司', socialCreditCode: '91510100083329994F' },
  { id: '3', name: '上海概伦电子股份有限公司', socialCreditCode: '913100005529452362' },
  { id: '4', name: '苏州纳芯微电子股份有限公司', socialCreditCode: '913205940695027581' },
  { id: '5', name: '北京华大九天科技股份有限公司', socialCreditCode: '91110108689234856E' },
  { id: '6', name: '广州禾信仪器股份有限公司', socialCreditCode: '91440101761912630P' },
  { id: '7', name: '江苏卓胜微电子股份有限公司', socialCreditCode: '913202115935260188' },
  { id: '8', name: '武汉精测电子集团股份有限公司', socialCreditCode: '914201007831614041' },
  { id: '9', name: '杭州当虹科技股份有限公司', socialCreditCode: '91330100555163234F' },
  { id: '10', name: '西安铂力特增材技术股份有限公司', socialCreditCode: '91610131577789178K' },
  // 环保/新材料
  { id: '11', name: '青岛惠城环保科技股份有限公司', socialCreditCode: '91370211783492770P' },
  { id: '12', name: '深圳市星源材质科技股份有限公司', socialCreditCode: '91440300754269550Q' },
  { id: '13', name: '广东嘉元科技股份有限公司', socialCreditCode: '914414007320579603' },
  { id: '14', name: '宁波容百新能源科技股份有限公司', socialCreditCode: '913302003169623838' },
  { id: '15', name: '天津久日新材料股份有限公司', socialCreditCode: '911201137004655938' },
  { id: '16', name: '福建福光股份有限公司', socialCreditCode: '91350000759367290J' },
  { id: '17', name: '烟台睿创微纳技术股份有限公司', socialCreditCode: '91370600699661849A' },
  { id: '18', name: '湖南科力远新能源股份有限公司', socialCreditCode: '91430000712106316D' },
  { id: '19', name: '深圳新宙邦科技股份有限公司', socialCreditCode: '91440300736259463J' },
  { id: '20', name: '江苏国泰国际集团股份有限公司', socialCreditCode: '91320582134791557R' },
  // 生物医药
  { id: '21', name: '上海君实生物医药科技股份有限公司', socialCreditCode: '91310000059365511L' },
  { id: '22', name: '苏州泽璟生物制药股份有限公司', socialCreditCode: '91320594686774653A' },
  { id: '23', name: '康希诺生物股份公司', socialCreditCode: '91120116681867885M' },
  { id: '24', name: '深圳微芯生物科技股份有限公司', socialCreditCode: '914403007271477755' },
  { id: '25', name: '北京热景生物技术股份有限公司', socialCreditCode: '91110107777053531U' },
  { id: '26', name: '博瑞生物医药(苏州)股份有限公司', socialCreditCode: '913205947322965476' },
  { id: '27', name: '成都先导药物开发股份有限公司', socialCreditCode: '915101005875796288' },
  { id: '28', name: '南京在此生物医药科技有限公司', socialCreditCode: '91320115MA1XYJ4R9K' },
  { id: '29', name: '武汉海特生物制药股份有限公司', socialCreditCode: '914201007198154695' },
  { id: '30', name: '江苏硕世生物科技股份有限公司', socialCreditCode: '91321204692558778E' },
  // 消费/服务
  { id: '31', name: '广州若羽臣科技股份有限公司', socialCreditCode: '914401015740456247' },
  { id: '32', name: '良品铺子股份有限公司', socialCreditCode: '91420112558434386T' },
  { id: '33', name: '三只松鼠股份有限公司', socialCreditCode: '91340200590176885Q' },
  { id: '34', name: '值得买科技股份有限公司', socialCreditCode: '911101065844439178' },
  { id: '35', name: '杭州壹网壹创科技股份有限公司', socialCreditCode: '91330108593069022G' },
  { id: '36', name: '四川天味食品集团股份有限公司', socialCreditCode: '91510100799403876X' },
  { id: '37', name: '绝味食品股份有限公司', socialCreditCode: '91430100682806294C' },
  { id: '38', name: '广东丸美生物技术股份有限公司', socialCreditCode: '914401017349147573' },
  { id: '39', name: '珀莱雅化妆品股份有限公司', socialCreditCode: '91330000789665033B' },
  { id: '40', name: '上海家化联合股份有限公司', socialCreditCode: '91310000631168478P' },
  // 机械/设备
  { id: '41', name: '浙江杭可科技股份有限公司', socialCreditCode: '91330100697071900W' },
  { id: '42', name: '广东瀚蓝环境股份有限公司', socialCreditCode: '91440600231938361R' },
  { id: '43', name: '无锡奥特维科技股份有限公司', socialCreditCode: '91320200550275827Q' },
  { id: '44', name: '上海克来机电自动化工程股份有限公司', socialCreditCode: '913100007503348873' },
  { id: '45', name: '苏州瀚川智能科技股份有限公司', socialCreditCode: '91320594056673645N' },
  { id: '46', name: '江苏北人智能制造科技股份有限公司', socialCreditCode: '91320594588427771R' },
  { id: '47', name: '浙江中控技术股份有限公司', socialCreditCode: '91330000719543884C' },
  { id: '48', name: '北京天智航医疗科技股份有限公司', socialCreditCode: '911101085636049280' },
  { id: '49', name: '合肥埃科光电科技股份有限公司', socialCreditCode: '91340100568971168B' },
  { id: '50', name: '武汉帝尔激光科技股份有限公司', socialCreditCode: '91420100672772592Y' },
  // 信息技术/软件
  { id: '51', name: '安恒信息技术股份有限公司', socialCreditCode: '91330100799691925J' },
  { id: '52', name: '山石网科通信技术股份有限公司', socialCreditCode: '91320500792336335B' },
  { id: '53', name: '奇安信科技集团股份有限公司', socialCreditCode: '911101023064618776' },
  { id: '54', name: '优刻得科技股份有限公司', socialCreditCode: '913101105916429402' },
  { id: '55', name: '青云科技股份有限公司', socialCreditCode: '91110105592383561H' },
  { id: '56', name: '北京金山办公软件股份有限公司', socialCreditCode: '91110108587704285D' },
  { id: '57', name: '虹软科技股份有限公司', socialCreditCode: '91330100747155694D' },
  { id: '58', name: '深圳市财富趋势科技股份有限公司', socialCreditCode: '91440300797967280A' },
  { id: '59', name: '北京致远互联软件股份有限公司', socialCreditCode: '911101087364654522' },
  { id: '60', name: '成都佳发安泰教育科技股份有限公司', socialCreditCode: '91510100743620959W' },
  // 其他小众/细分领域
  { id: '61', name: '北京八亿时空液晶科技股份有限公司', socialCreditCode: '91110108765038848N' },
  { id: '62', name: '龙岩卓越新能源股份有限公司', socialCreditCode: '91350800731872123G' },
  { id: '63', name: '吉林奥来德光电材料股份有限公司', socialCreditCode: '91220101774163973E' },
  { id: '64', name: '安徽大地熊新材料股份有限公司', socialCreditCode: '91340100754898236Q' },
  { id: '65', name: '南京伟思医疗科技股份有限公司', socialCreditCode: '91320100726084666W' },
  { id: '66', name: '上海复洁环保科技股份有限公司', socialCreditCode: '91310110585253842C' },
  { id: '67', name: '杭州爱科科技股份有限公司', socialCreditCode: '91330108799656291N' },
  { id: '68', name: '北京浩瀚深度信息技术股份有限公司', socialCreditCode: '91110108665645362X' },
  { id: '69', name: '西安瑞联新材料股份有限公司', socialCreditCode: '91610131719782559X' },
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
