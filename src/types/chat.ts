import { Customer } from "@/src/types/business";

export type Role = 'user' | 'assistant'; // 消息角色：用户或助手

export type StepId = 
  | 'select-customer' // 选择客户
  | 'basic-info' // 基本信息
  | 'upload-report' // 上传报告
  | 'verify-report' // 验证报告
  | 'complete'; // 完成

export interface QuickAction {
  id: string; // 快速操作 ID
  label: string; // 显示标签
  value: string; // 点击后发送的文本内容
  actionType?: 'navigate' | 'input' | 'upload'; // 操作类型：导航、输入、上传
}

export interface FlowStep {
  id: StepId; // 步骤 ID
  title: string; // 步骤标题
  description?: string; // 步骤描述
  initialMessage: string; // 进入步骤时，机器人发送的初始消息
  quickActions: QuickAction[]; // 快速操作列表
}

export interface Message {  
  id: string; // 消息 ID
  role: Role; // 消息角色
  content: string; // 消息内容
  timestamp: number; // 发送时间戳
  stepId?: StepId; // 消息所属步骤 ID
  widget?: 'customer-list' | 'financial-report-list'; // Widget type to render
  widgetData?: any; // Data for the widget
}

export interface ChatState {
  messages: Message[]; // 消息列表
  currentStep: StepId; // 当前步骤 ID
  isTyping: boolean; // 是否正在输入
  selectedCustomer?: Customer; // 当前选中的客户
}
