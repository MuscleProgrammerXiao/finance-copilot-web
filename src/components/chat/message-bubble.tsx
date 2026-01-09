import { Message } from "@/src/types/chat";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { CustomerList } from "./customer-list";
import { FinancialReportList } from "./financial-report-list";
import { NewReportForm } from "../report/new-report-form";

interface MessageBubbleProps {
  message: Message;
  onWidgetAction?: (action: string, data?: any) => void;
}

export function MessageBubble({ message, onWidgetAction }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full gap-3 mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-[90%] md:max-w-[80%]">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isUser
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none"
          )}
        >
          {message.content}
        </div>
        
        {/* Render Widget */}
        {!isUser && message.widget === 'customer-list' && message.widgetData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <CustomerList 
              data={message.widgetData} 
              onSelect={(customer) => onWidgetAction?.('select-customer', customer)} 
            />
          </motion.div>
        )}

        {!isUser && message.widget === 'financial-report-list' && message.widgetData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <FinancialReportList
              reports={message.widgetData.reports}
              permissions={message.widgetData.permissions}
              onAction={(action, report) => onWidgetAction?.('report-action', { action, report })}
              onQuickAction={(action) => onWidgetAction?.('quick-action', action)}
            />
          </motion.div>
        )}

        {!isUser && message.widget === 'placeholder' && message.widgetData && (
          <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-400 flex flex-col items-center gap-2"
          >
             <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-gray-300" />
             </div>
             <p>{message.widgetData.title} 模块开发中</p>
          </motion.div>
        )}

        {!isUser && message.widget === 'new-report' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
             <NewReportForm />
          </motion.div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </motion.div>
  );
}
