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
      className="relative flex items-center w-full p-2 bg-white border border-gray-200 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all"
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入消息..."
        disabled={disabled}
        className="flex-1 px-4 py-2 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 disabled:opacity-50"
      />
      
      <motion.button
        type="submit"
        disabled={!value.trim() || disabled}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "p-2 rounded-full transition-colors",
          value.trim() && !disabled
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        )}
      >
        <Send className="w-5 h-5" />
      </motion.button>
    </form>
  );
}
