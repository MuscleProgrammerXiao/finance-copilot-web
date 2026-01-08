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

import { components } from "@/src/gen/api-types";

export type Customer = components["schemas"]["Customer"];

export type FinancialReport = components["schemas"]["FinancialReport"];

export type UserPermissions = components["schemas"]["UserPermissions"];