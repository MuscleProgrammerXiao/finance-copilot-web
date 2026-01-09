import { BasicInfoForm } from './basic-info-form';
import { AuditInfoForm } from './audit-info-form';
import { Button } from '@/src/components/ui/button';
import { useReportStore } from '@/src/store/report-store';

export function NewReportForm() {
    const { isBasicSubmitted, isAuditSubmitted } = useReportStore();

    const isAllSubmitted = isBasicSubmitted && isAuditSubmitted;

    const handleVerify = () => {
        alert('校验财报功能开发中...');
    };

    const handleImport = () => {
        alert('导入报表功能开发中...');
    };

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
