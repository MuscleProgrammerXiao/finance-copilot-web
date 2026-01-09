import { useState, useCallback, useEffect } from "react";
import { Message, ChatState } from "@/src/types/chat";
import { FLOW_STEPS, STEP_ORDER, USER_INFO } from "@/src/constants/flow";
import { getCustomers, getFinancialReports } from "@/src/api/client";
import { useChatStore } from "@/src/store/chat-store";
import { UserPermissions } from "@/src/types/business";
import { useReportStore } from "@/src/store/report-store";
import { toast } from "sonner";

/**
 * 聊天逻辑 Hook
 * 管理消息列表、当前步骤状态以及模拟机器人回复
 */
export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentStep: "select-customer",
    isTyping: false,
  });

  const { selectedCustomer, permissions, setSelectedCustomer, setPermissions } = useChatStore();
  const { reset: resetReport, isBasicSubmitted, loadSubmitted, submittedBasicInfo } = useReportStore();

  // 初始化：加载第一步的欢迎语并获取客户列表
  useEffect(() => {
    const initChat = async () => {
      const firstStep = FLOW_STEPS["select-customer"];
      
      // 防止重复添加
      if (state.messages.length > 0) return;

      let customerData = null;
      try {
        customerData = await getCustomers({
          loginName: USER_INFO.loginName,
          userCode: USER_INFO.userCode,
          page: 1,
          pageSize: 5
        });
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }

      setState((prev) => {
        if (prev.messages.length > 0) return prev;
        return {
          ...prev,
          messages: [
            {
              id: "init-1",
              role: "assistant",
              content: firstStep.initialMessage,
              timestamp: Date.now(),
              stepId: "select-customer",
              widget: "customer-list",
              widgetData: customerData
            },
          ],
        };
      });
    };

    initChat();
  }, []); 

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (content: string, options?: { skipAutoReply?: boolean }) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: Date.now(),
        stepId: state.currentStep,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMsg],
        isTyping: !options?.skipAutoReply,
      }));

      if (!options?.skipAutoReply) {
        setTimeout(() => {
          handleBotResponse(content);
        }, 1000);
      }
    },
    [state.currentStep]
  );

  /**
   * 处理工具栏（QuickActions）动作
   */
  const handleToolbarAction = useCallback(async (key: string, label: string) => {
      // 发送用户消息
      await sendMessage(label, { skipAutoReply: true });
      setState(prev => ({ ...prev, isTyping: true }));
      
      // 模拟思考延迟
      await new Promise(r => setTimeout(r, 600));

      if (key === 'CustomerList') {
          try {
             const res = await getCustomers({
                page: 1, 
                pageSize: 5, 
                loginName: USER_INFO.loginName, 
                userCode: USER_INFO.userCode
             });

             setState(prev => ({
                ...prev,
                messages: [...prev.messages, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: '以下是为您找到的客户列表，请选择：',
                    timestamp: Date.now(),
                    widget: 'customer-list',
                    widgetData: res
                }],
                isTyping: false
             }));
          } catch(e) {
               setState(prev => ({ ...prev, isTyping: false }));
          }
      } else if (['NewFinancialReport', 'CreditReportInput', 'AIGenerateReport', 'PublicCompanyReportInput', 'BasicInfoInput'].includes(key)) {
          if (!selectedCustomer) {
             // 未选择客户
             try {
                const res = await getCustomers({
                   page: 1, 
                   pageSize: 5, 
                   loginName: USER_INFO.loginName, 
                   userCode: USER_INFO.userCode
                });

                setState(prev => ({
                   ...prev,
                   messages: [...prev.messages, {
                       id: Date.now().toString(),
                       role: 'assistant',
                       content: `您还没有选择客户，请先选择客户。`,
                       timestamp: Date.now(),
                       widget: 'customer-list',
                       widgetData: res
                   }],
                   isTyping: false
                }));
             } catch(e) { setState(prev => ({ ...prev, isTyping: false })); }
          } else {
             // 已选择客户，检查权限
             const permKeyMap: Record<string, keyof UserPermissions> = {
                 'NewFinancialReport': 'canCreateReport',
                 'BasicInfoInput': 'canCreateReport',
                 'CreditReportInput': 'canInputCreditReport',
                 'AIGenerateReport': 'canGenerateAIReport',
                 'PublicCompanyReportInput': 'canInputPublicReport'
             };
             
             const permKey = permKeyMap[key];
             if (permissions && permissions[permKey]) {
                 // 有权限
                 if (key === 'NewFinancialReport') {
                     useReportStore.getState().reset();
                     toast.success('已开启新的财务报表录入');
                 }

                 let content = `正在为您打开 ${label} 模块...`;
                 if (key === 'BasicInfoInput') {
                     useReportStore.getState().loadSubmitted();
                     const { submittedBasicInfo } = useReportStore.getState();
                     if (submittedBasicInfo) {
                         content = "您新增了一条财报录入，已为您反显最新内容。";
                         toast.success('已加载最近提交的财报信息');
                     } else {
                         toast.info('暂无已提交的财报信息');
                     }
                 }

                 const widgetType = (key === 'NewFinancialReport' || key === 'BasicInfoInput') ? 'new-report' : 'placeholder';

                 setState(prev => ({
                     ...prev,
                     messages: [...prev.messages, {
                         id: Date.now().toString(),
                         role: 'assistant',
                         content,
                         timestamp: Date.now(),
                         widget: widgetType,
                         widgetData: { title: label }
                     }],
                     isTyping: false
                 }));
             } else {
                 // 无权限
                  setState(prev => ({
                     ...prev,
                     messages: [...prev.messages, {
                         id: Date.now().toString(),
                         role: 'assistant',
                         content: `很抱歉，您没有 ${label} 的权限。`,
                         timestamp: Date.now(),
                     }],
                     isTyping: false
                 }));
             }
          }
      } else {
          // 其他按钮
          let content = `功能 ${label} 正在开发中...`;
          if (key === 'CustomerLock') {
             content = selectedCustomer ? `当前锁定客户：${selectedCustomer.name}` : "当前未锁定任何客户。";
          }

           setState(prev => ({
              ...prev,
              messages: [...prev.messages, {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content,
                  timestamp: Date.now(),
              }],
              isTyping: false
          }));
      }

  }, [sendMessage, selectedCustomer, permissions, resetReport, isBasicSubmitted, loadSubmitted, submittedBasicInfo]);

  /**
   * 处理 Widget 交互动作
   */
  const handleWidgetAction = useCallback(async (action: string, data?: any) => {
    if (action === 'select-customer') {
      const customer = data;
      await sendMessage(`选择客户：${customer.name}`, { skipAutoReply: true });
      
      // 更新 Store
      setSelectedCustomer(customer);
      setPermissions(null);

      setState(prev => ({ ...prev, isTyping: true }));
      
      try {
        const response = await getFinancialReports({
           customerId: customer.id,
           loginName: USER_INFO.loginName,
           userCode: USER_INFO.userCode
        });
        
        // 更新权限 Store
        setPermissions(response.permissions);
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        setState(prev => {
           const currentStepIndex = STEP_ORDER.indexOf(prev.currentStep);
           const nextStepId = STEP_ORDER[currentStepIndex + 1] || prev.currentStep;

           return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                 id: Date.now().toString(),
                 role: 'assistant',
                 content: `已为您查询到 ${customer.name} 的相关信息：`,
                 timestamp: Date.now(),
                 stepId: prev.currentStep,
                 widget: 'financial-report-list',
                 widgetData: {
                   reports: response.reports,
                   permissions: response.permissions
                 }
              }
            ],
            isTyping: false,
            currentStep: nextStepId 
          };
        });
      } catch (e) {
         console.error("Error fetching reports:", e);
         setState(prev => ({ 
           ...prev, 
           isTyping: false,
           messages: [...prev.messages, {
             id: Date.now().toString(),
             role: 'assistant',
             content: '获取数据失败，请稍后重试。',
             timestamp: Date.now(),
             stepId: prev.currentStep
           }]
         }));
      }
    } else if (action === 'quick-action') {
        const labelToKeyMap: Record<string, string> = {
            '新增财务报表': 'NewFinancialReport',
            '授信报告录入': 'CreditReportInput',
            'AI生成报告': 'AIGenerateReport',
            '上市公司财报录入': 'PublicCompanyReportInput'
        };
        const key = labelToKeyMap[data];
        if (key) {
            await handleToolbarAction(key, data);
        } else {
            await sendMessage(data);
        }
    } else if (action === 'report-action') {
        const { action: reportAction, report } = data;
        let msg = '';
        switch(reportAction) {
          case 'delete': msg = `删除财报：${report.period}`; break;
          case 'continue': msg = `继续录入：${report.period}`; break;
          case 'view': msg = `查看财报：${report.period}`; break;
        }
        await sendMessage(msg);
    }
  }, [sendMessage, setSelectedCustomer, setPermissions, handleToolbarAction]);

  /**
   * 处理机器人回复逻辑
   */
  const handleBotResponse = (userContent: string) => {
    const currentStepIndex = STEP_ORDER.indexOf(state.currentStep);
    const nextStepId = STEP_ORDER[currentStepIndex + 1];

    let botContent = `收到：${userContent}`;
    let shouldAdvance = false;

    if (
      userContent.includes("确认") ||
      userContent.includes("跳过")
    ) {
      shouldAdvance = true;
    }

    setState((prev) => {
      const newMessages = [...prev.messages];

      newMessages.push({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botContent,
        timestamp: Date.now(),
        stepId: prev.currentStep,
      });

      let nextStep = prev.currentStep;

      if (shouldAdvance && nextStepId) {
        nextStep = nextStepId;
        newMessages.push({
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: FLOW_STEPS[nextStepId].initialMessage,
          timestamp: Date.now(),
          stepId: nextStepId,
        });
      }

      return {
        messages: newMessages,
        currentStep: nextStep,
        isTyping: false,
      };
    });
  };

  return {
    messages: state.messages,
    currentStep: state.currentStep,
    isTyping: state.isTyping,
    sendMessage,
    handleWidgetAction,
    handleToolbarAction,
    currentStepData: FLOW_STEPS[state.currentStep],
    selectedCustomer
  };
}
