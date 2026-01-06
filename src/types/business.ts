export interface UserInfo {
  loginName: string; // 登录名
  userName: string; // 用户名
  userCode: string; // 用户编码
}
export type ReportType =
  | 'small_enterprise' // 小企业财务报表
  | 'enterprise_new_2019' // 企业财务报表格式（已执行新金融准则、新收入准则和新租赁准则）2019年版
  | 'enterprise_old_2019'; // 企业财务报表格式（未执行新金融准则、新收入准则和新租赁准则）2019年版

export type ReportCycle = 'year' | 'half_year' | 'quarter' | 'month'; // 报表周期：年报，半年报，季度报，月度报

export type ReportNature = 'summary' | 'headquarters' | 'base' | 'consolidated'; // 报表性质：摘要报表，总部报表，基础报表，合并报表

export type ReportStatus = 'confirmed' | 'unconfirmed'; // 报表状态：已确认，未确认 

export interface Customer {
  id: string;
  name: string;
  socialCreditCode: string; // 社会统一信用代码 
}

export interface FinancialReport {
  id: string;
  customerId: string;
  period: string; // 报表期次，如 202504 
  type: ReportType; // 报表类型 
  cycle: ReportCycle; // 报表周期 
  nature: ReportNature; // 报表性质 
  status: ReportStatus; // 报表状态 
  isAudited: boolean; // 是否审计 
  auditDate?: string; // 审计日期 
  auditFirm?: string; // 审计会计事务所 
  auditOpinion?: string; // 审计意见 
}

export interface UserPermissions {
  canCreateReport: boolean; // 新增财务报表权限 
  canInputCreditReport: boolean; // 授信报告录入权限 
  canGenerateAIReport: boolean; // AI生成报告权限 
  canInputPublicReport: boolean; // 上市公司财报录入权限 
}