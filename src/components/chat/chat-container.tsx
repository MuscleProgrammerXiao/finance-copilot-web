import { useEffect, useRef } from "react";
import { useChat } from "@/src/hooks/use-chat";
import { MessageBubble } from "./message-bubble";
import { QuickActions } from "./quick-actions";
import { ChatInput } from "./chat-input";
import { motion, AnimatePresence } from "framer-motion";
import { USER_INFO } from "@/src/constants/flow";

export function ChatContainer() {
  const { messages, isTyping, sendMessage, currentStepData, handleWidgetAction, handleToolbarAction } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Calculate progress
  const STEPS_LIST = [
    { id: 'select-customer', label: '客户' },
    { id: 'basic-info', label: '基本' },
    { id: 'upload-report', label: '上传' },
    { id: 'verify-report', label: '校验' },
    { id: 'complete', label: '完成' }
  ];
  
  const currentStepIndex = STEPS_LIST.findIndex(s => s.id === currentStepData.id);
  const progress = Math.max(5, ((currentStepIndex + 1) / STEPS_LIST.length) * 100);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col mx-auto h-[calc(100vh-2rem)] rounded-[2.5rem] overflow-hidden bg-slate-50 relative shadow-[0_0_60px_-15px_rgba(0,0,0,0.1)] border border-white/40 ring-1 ring-slate-900/5">
      {/* 动态背景装饰 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/40 blur-[120px] mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-100/40 to-pink-100/40 blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[40%] left-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-emerald-100/40 to-teal-100/40 blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      {/* 顶部区域 */}
      <div className="relative z-20 bg-white/70 backdrop-blur-xl border-b border-white/50 p-5 flex items-center justify-between shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative w-11 h-11 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center shadow-inner ring-1 ring-white/10 overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://api.dicebear.com/9.x/shapes/svg?seed=Finance')] opacity-20 bg-cover"></div>
               <span className="relative text-white font-black text-xl italic tracking-tighter z-10">
                 <span className="text-cyan-400">A</span>I
               </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              财报智能录入机器人
              <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-extrabold uppercase tracking-wider border border-cyan-100/50">Beta</span>
            </h2>
            
            {/* 进度条组件 */}
            <div className="flex items-center gap-3">
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                    {currentStepData.title} ({currentStepIndex + 1}/{STEPS_LIST.length})
                </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-slate-200/50 shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-slate-600">{USER_INFO.userName}</span>
            </div>
        </div>
      </div>

      {/* 聊天框区域 */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
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
            className="flex items-center gap-1.5 ml-2 p-3 w-fit rounded-2xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm"
          >
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></span>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* 底部输入框区域 */}
      <div className="relative z-20 bg-white/70 backdrop-blur-xl border-t border-white/50 p-5 space-y-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        {/* 快捷操作区 */}
        <div className="relative">
            <QuickActions onAction={handleToolbarAction} />
        </div>
        {/* 输入框 */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
            <ChatInput onSend={sendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}
