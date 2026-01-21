import { BasicInfoForm } from './basic-info-form';
import { AuditInfoForm } from './audit-info-form';
import { Button } from '@/src/components/ui/button';
import { useReportStore } from '@/src/store/report-store';
import { useChatStore } from '@/src/store/chat-store';
import { toast } from 'sonner';

export function NewReportForm({ isOverwritePrompt }: { isOverwritePrompt?: boolean }) {
    const { isBasicSubmitted, isAuditSubmitted, setVerifyOpen, setImportOpen, reportId, reset } = useReportStore();
    const { selectedCustomer } = useChatStore();

    const isAllSubmitted = isBasicSubmitted && isAuditSubmitted;

    const handleVerify = () => {
        if (!selectedCustomer) {
            toast.error('请先选择客户');
            return;
        }
        if (!reportId) {
             toast.error('报表ID缺失，请重新提交基本信息');
             return;
        }
        setVerifyOpen(true);
    };

    const handleImport = () => {
        setImportOpen(true);
    };

    const handleReset = () => {
        reset();
        toast.success("已重置，请开始新的录入");
    }

    if (isOverwritePrompt) {
        return (
            <div className="w-full max-w-lg mx-auto space-y-6 bg-gray-50/50 p-6 rounded-xl flex flex-col items-center">
                 <div className="text-center space-y-2">
                    <h3 className="font-medium text-gray-900">继续或重新开始?</h3>
                    <p className="text-sm text-gray-500">
                        您可以查看当前已录入的信息，或者点击下方按钮清除所有数据并开始新的录入。
                    </p>
                 </div>
                 <div className="flex gap-4 w-full">
                    <Button 
                        variant="destructive" 
                        className="flex-1"
                        onClick={handleReset}
                    >
                        重新开始 (清除当前)
                    </Button>
                    {/* The form below will show current info if rendered, but here we just show options. 
                        Actually, requirement says "View current entered info" and "Continue New".
                        If "View Current", we should just show the form as is (which is what happens if we don't return early).
                        So maybe this "Prompt" mode is just a wrapper or top section?
                    */}
                 </div>
                 {/* Show the form below so user can see what's there */}
                 <div className="w-full border-t border-gray-200 pt-4 mt-2">
                    <BasicInfoForm />
                    <AuditInfoForm />
                    <div className="flex gap-4 pt-4 px-1">
                        <Button 
                            className="flex-1" 
                            variant="outline" 
                            disabled={!isAllSubmitted}
                            onClick={handleVerify}
                        >
                            校验财报
                        </Button>
                        <Button 
                            className="flex-1" 
                            disabled={!isAllSubmitted}
                            onClick={handleImport}
                        >
                            导入报表
                        </Button>
                    </div>
                 </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg mx-auto space-y-6 bg-gray-50/50 p-1 rounded-xl">
            <BasicInfoForm />
            <AuditInfoForm />
            
            <div className="flex gap-4 pt-4 px-1">
                <Button 
                    className="flex-1" 
                    variant="outline" 
                    disabled={!isAllSubmitted}
                    onClick={handleVerify}
                >
                    校验财报
                </Button>
                <Button 
                    className="flex-1" 
                    disabled={!isAllSubmitted}
                    onClick={handleImport}
                >
                    导入报表
                </Button>
            </div>
        </div>
    );
}
