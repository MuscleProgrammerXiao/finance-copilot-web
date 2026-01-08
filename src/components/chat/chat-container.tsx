import { useEffect, useRef } from "react";
import { useChat } from "@/src/hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { QuickActions } from "./quick-actions";
import { ChatInput } from "./chat-input";
import { motion, AnimatePresence } from "framer-motion";
import { USER_INFO } from "@/src/constants/flow";

export function ChatContainer() {
  const { messages, isTyping, sendMessage, currentStepData, handleWidgetAction, selectedCustomer } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col mx-auto shadow-xl h-[calc(100vh-4rem)] border border-gray-200 rounded-3xl overflow-hidden">
      {/* 顶部区域 */}
      <div className="bg-white/80 border-b border-gray-100 p-4 flex items-center justify-between backdrop-blur-md z-10">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">智能报表录入机器人</h2>
          <p className="text-xs text-gray-500">
            当前步骤: {currentStepData.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs text-gray-500">{USER_INFO.userName}</span>
        </div>
      </div>
      {/* 聊天框区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onWidgetAction={handleWidgetAction}
            />
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 text-gray-400 text-sm ml-4"
          >
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* 底部输入框区域 */}
      <div className="bg-white border-t border-gray-100 p-4 space-y-3">
      {/* 卡片按钮 */}
      <div className="relative">
             <QuickActions 
                actions={currentStepData.quickActions} 
                onAction={sendMessage} 
                selectedCustomer={selectedCustomer}
             />
             
        </div>
      {/* 输入框 */}
      <ChatInput onSend={sendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
