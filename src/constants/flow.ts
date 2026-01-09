import { FlowStep, StepId } from "@/src/types/chat";
import { UserInfo } from "@/src/types/business";

export const STEP_ORDER: StepId[] = [
  "select-customer",
  "basic-info",
  "upload-report",
  "verify-report",
  "complete",
];
export const USER_INFO: UserInfo = {
  loginName: "zhang san",
  userName: "张三",
  userCode: "001",
};

// 卡片按钮
export const CARD_COMPONENT = {
  CustomerList: "客户列表",
  CustomerLock: "客户锁定",
  NewFinancialReport: "新增财务报表",
  CreditReportInput: "授信报告录入",
  AIGenerateReport: "AI生成报告",
  PublicCompanyReportInput: "上市公司财报录入",
  BasicInfoInput: "基本信息录入",
  ImportReport: "导入报表",
  VerifyReport: "校验财报",
  Feedback: "吐槽反馈",
} as const;

export type CardComponentType = typeof CARD_COMPONENT;
export type CardComponentValue = (typeof CARD_COMPONENT)[keyof typeof CARD_COMPONENT];
// 流程步骤
export const FLOW_STEPS: Record<StepId, FlowStep> = {
  "select-customer": {
    id: "select-customer",
    title: "选择客户",
    initialMessage:
      "您好，请先选择需要录入报表的客户。您可以直接输入客户名称，或从下方列表中选择。",
    quickActions: [
      { id: "cust-1", label: "示例客户A", value: "选择客户：示例客户A" },
      { id: "cust-2", label: "示例客户B", value: "选择客户：示例客户B" },
      { id: "cust-new", label: "新建客户", value: "我要新建一个客户" },
    ],
  },
  "basic-info": {
    id: "basic-info",
    title: "填写基本信息",
    initialMessage:
      "客户已确认。请填写报表的基本信息，包括报表类型、年份和期数。",
    quickActions: [
      { id: "info-2023", label: "2023年年报", value: "2023年年报" },
      { id: "info-2024-q1", label: "2024年一季报", value: "2024年一季报" },
    ],
  },
  "upload-report": {
    id: "upload-report",
    title: "上传识别报表",
    initialMessage:
      "基本信息已录入。您可以上传报表文件进行自动识别（支持PDF/Excel），也可以跳过此步骤直接录入数据。",
    quickActions: [
      { id: "upload-skip", label: "跳过上传", value: "跳过上传步骤" },
      { id: "upload-help", label: "查看支持格式", value: "支持哪些文件格式？" },
    ],
  },
  "verify-report": {
    id: "verify-report",
    title: "校验报表",
    initialMessage: "数据准备就绪。请校验以下关键指标是否正确。",
    quickActions: [
      { id: "verify-ok", label: "校验无误", value: "确认校验无误" },
      { id: "verify-error", label: "有数据错误", value: "数据有误，需要修改" },
    ],
  },
  complete: {
    id: "complete",
    title: "完成录入",
    initialMessage: "恭喜！报表录入流程已完成。您可以查看详情或开始新的录入。",
    quickActions: [
      { id: "done-view", label: "查看详情", value: "查看详情" },
      { id: "done-new", label: "开始新录入", value: "开始新的录入" },
    ],
  },
};