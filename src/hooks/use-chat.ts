import { useState, useCallback, useEffect } from "react";
import { Message, ChatState } from "@/src/types/chat";
import { FLOW_STEPS, STEP_ORDER, USER_INFO } from "@/src/constants/flow";
import { getCustomers, getFinancialReports } from "@/src/api/client";

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
  }, []); // Empty dependency array ensures this runs once on mount

  /**
   * 发送消息
   * @param content 用户输入的内容
   * @param options 额外配置
   */
  const sendMessage = useCallback(
    async (content: string, options?: { skipAutoReply?: boolean }) => {
      // 1. 添加用户消息到列表
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
        isTyping: !options?.skipAutoReply, // 如果需要回复，则显示输入状态
      }));

      // 2. 模拟机器人回复（延迟效果）
      if (!options?.skipAutoReply) {
        setTimeout(() => {
          handleBotResponse(content);
        }, 1000);
      }
    },
    [state.currentStep]
  );

  /**
   * 处理 Widget 交互动作
   */
  const handleWidgetAction = useCallback(async (action: string, data?: any) => {
    if (action === 'select-customer') {
      const customer = data;
      // 发送用户选择消息，不触发默认回复
      await sendMessage(`选择客户：${customer.name}`, { skipAutoReply: true });
      
      setState(prev => ({ ...prev, isTyping: true, selectedCustomer: customer }));
      
      try {
        // 获取财报和权限数据
        const response = await getFinancialReports({
           customerId: customer.id,
           loginName: USER_INFO.loginName,
           userCode: USER_INFO.userCode
        });
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        setState(prev => {
           // 推进到下一步
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
        // 按钮点击，发送消息
        await sendMessage(data);
    } else if (action === 'report-action') {
        // 财报操作（删除、继续录入、查看）
        const { action: reportAction, report } = data;
        let msg = '';
        switch(reportAction) {
          case 'delete': msg = `删除财报：${report.period}`; break;
          case 'continue': msg = `继续录入：${report.period}`; break;
          case 'view': msg = `查看财报：${report.period}`; break;
        }
        await sendMessage(msg);
    }
  }, [sendMessage]);

  /**
   * 处理机器人回复逻辑
   * 包含简单的步骤跳转判断
   */
  const handleBotResponse = (userContent: string) => {
    // 获取当前步骤和下一步骤的 ID
    const currentStepIndex = STEP_ORDER.indexOf(state.currentStep);
    const nextStepId = STEP_ORDER[currentStepIndex + 1];

    let botContent = `收到：${userContent}`;
    let shouldAdvance = false;

    // 简单的关键词匹配逻辑，决定是否跳转到下一步
    if (
      userContent.includes("确认") ||
      userContent.includes("跳过")
    ) {
      shouldAdvance = true;
    }

    // 更新状态
    setState((prev) => {
      const newMessages = [...prev.messages];

      // 添加机器人对当前输入的回复
      newMessages.push({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botContent,
        timestamp: Date.now(),
        stepId: prev.currentStep,
      });

      let nextStep = prev.currentStep;

      // 如果满足条件且还有下一步，则自动跳转
      if (shouldAdvance && nextStepId) {
        nextStep = nextStepId;
        // 添加下一步的引导语
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
        isTyping: false, // 结束正在输入状态
      };
    });
  };

  return {
    messages: state.messages,
    currentStep: state.currentStep,
    isTyping: state.isTyping,
    sendMessage,
    handleWidgetAction,
    currentStepData: FLOW_STEPS[state.currentStep],
    selectedCustomer: state.selectedCustomer,
  };
}
