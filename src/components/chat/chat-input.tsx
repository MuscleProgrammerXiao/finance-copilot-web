import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ChatInputProps {
  onSend: (value: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSend(value);
      setValue("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="relative flex items-center w-full p-2 bg-white border border-slate-200 rounded-full shadow-sm focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all duration-300"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入消息..."
        disabled={disabled}
        className="flex-1 px-4 py-2 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 disabled:opacity-50 font-medium"
      />
      
      <motion.button
        type="submit"
        disabled={!value.trim() || disabled}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "p-2.5 rounded-full transition-all duration-300 shadow-sm",
          value.trim() && !disabled
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        )}
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </form>
  );
}
