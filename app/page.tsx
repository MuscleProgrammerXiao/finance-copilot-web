"use client";

import { ChatContainer } from "@/src/components/chat/chat-container";
import { VerifyReportModal } from "@/src/components/report/verify-report-modal";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full ">
        <ChatContainer />
      </div>
      <VerifyReportModal />
    </main>
  );
}
