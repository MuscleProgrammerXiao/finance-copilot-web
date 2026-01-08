import { QuickAction } from "@/src/types/chat";
import { Customer } from "@/src/types/business";
import { CARD_COMPONENT } from "@/src/constants/flow";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

interface QuickActionsProps {
  actions?: QuickAction[]; 
  onAction: (value: string) => void;
  selectedCustomer?: Customer;
}

export function QuickActions({ onAction, selectedCustomer }: QuickActionsProps) {
  // Generate actions list from CARD_COMPONENT
  const actionsList = Object.entries(CARD_COMPONENT).map(([key, label]) => {
     let displayLabel = label;
     let value = label;
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
               onClick={() => onAction(item.value)}
             >
               {item.label}
             </Button>
           </motion.div>
         ))}
       </div>
    </div>
  );
}
