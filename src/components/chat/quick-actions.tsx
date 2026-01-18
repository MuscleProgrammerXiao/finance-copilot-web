import { QuickAction } from "@/src/types/chat";
import { CARD_COMPONENT } from "@/src/constants/flow";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import { useChatStore } from "@/src/store/chat-store";
import { useReportStore } from "@/src/store/report-store";

interface QuickActionsProps {
  onAction: (key: string, label: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const selectedCustomer = useChatStore((state) => state.selectedCustomer);
  const { submittedBasicInfo, reportId } = useReportStore();

  // Generate actions list from CARD_COMPONENT
  const actionsList = Object.entries(CARD_COMPONENT)
    .filter(([key]) => {
      // 4. Hide BasicInfoInput if no info exists
      if (key === 'BasicInfoInput') {
         return !!(selectedCustomer && submittedBasicInfo && reportId);
      }
      return true;
    })
    .map(([key, label]) => {
     let displayLabel = label as string;
     let value = label as string;
     // Default variant for all buttons
     let variant: "outline" | "default" | "secondary" | "ghost" | "link" | "destructive" = "outline";
     
     if (key === 'CustomerLock') {
       if (selectedCustomer) {
         displayLabel = selectedCustomer.name;
         value = `已锁定客户：${selectedCustomer.name}`;
         variant = "default"; // Highlight when locked
       } else {
         displayLabel = "客户锁定"; 
         value = "请先选择客户";
         variant = "secondary"; // Use secondary for "empty" state to differentiate
       }
     }
     
     return { key, label: displayLabel, value, variant };
  });

  return (
    <div className="w-full overflow-x-auto py-3 px-1 no-scrollbar">
       <div className="flex gap-2 px-2">
         {actionsList.map((item) => (
           <motion.div 
             key={item.key} 
             whileHover={{ scale: 1.05 }} 
             whileTap={{ scale: 0.95 }}
           >
             <Button 
               variant={item.variant} 
               size="sm" 
               className={cn(
                 "whitespace-nowrap rounded-full px-4 shadow-sm transition-all",
                 item.variant === 'outline' && "border-blue-100 hover:border-blue-300 hover:bg-blue-50 text-gray-700",
                 item.variant === 'secondary' && "bg-gray-100 text-gray-500 hover:bg-gray-200 border-transparent",
                 // default variant will use its own styles (usually primary color)
               )}
               onClick={() => onAction(item.key, item.value)}
             >
               {item.label}
             </Button>
           </motion.div>
         ))}
       </div>
    </div>
  );
}
