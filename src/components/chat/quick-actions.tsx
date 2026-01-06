import { QuickAction } from "@/src/types/chat";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface QuickActionsProps {
  actions: QuickAction[];
  onAction: (value: string) => void;
}

export function QuickActions({ actions, onAction }: QuickActionsProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-4 no-scrollbar">
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction(action.value)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-colors whitespace-nowrap"
        >
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-700 font-medium">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
