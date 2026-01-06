import { useState, useCallback, useEffect } from "react";
import { Message, ChatState } from "@/src/types/chat";
import { FLOW_STEPS, STEP_ORDER } from "@/src/constants/flow";

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

  // 初始化：加载第一步的欢迎语
  useEffect(() => {
    const firstStep = FLOW_STEPS["select-customer"];
    setState((prev) => {
      // 防止重复添加
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
          },
        ],
      };
    });
  }, []);

  /**
   * 发送消息
   * @param content 用户输入的内容
   */
  const sendMessage = useCallback(
    async (content: string) => {
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
        isTyping: true, // 显示正在输入状态
      }));

      // 2. 模拟机器人回复（延迟效果）
      // 在实际开发中，这里会调用后端 API
      setTimeout(() => {
        handleBotResponse(content);
      }, 1000);
    },
    [state.currentStep]
  );

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
    // 实际业务中应根据 API 返回结果判断
    if (
      userContent.includes("选择") ||
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
    currentStepData: FLOW_STEPS[state.currentStep],
  };
}
