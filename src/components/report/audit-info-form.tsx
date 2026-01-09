import { useReportStore } from '@/src/store/report-store';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Calendar } from '@/src/components/ui/calendar';
import { useChatStore } from '@/src/store/chat-store';
import { USER_INFO } from '@/src/constants/flow';
import { submitAuditInfo } from '@/src/api/client';
import { SubmitAuditInfoRequest } from '@/src/types/business';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from "sonner";
import { useState, useEffect } from 'react';

export function AuditInfoForm() {
  const { auditInfo, setAuditInfo, isAuditSubmitted, setAuditSubmitted, reportId, isBasicSubmitted, commitToSubmitted } = useReportStore();
  const { selectedCustomer } = useChatStore();

  // Local state for performance optimization
  const [reportNumber, setReportNumber] = useState(auditInfo.reportNumber || '');
  const [verificationCode, setVerificationCode] = useState(auditInfo.verificationCode || '');
  const [noAuditReason, setNoAuditReason] = useState(auditInfo.noAuditReason || '');

  // Sync from store when store updates (e.g. reset or load submitted)
  useEffect(() => {
      setReportNumber(auditInfo.reportNumber || '');
      setVerificationCode(auditInfo.verificationCode || '');
      setNoAuditReason(auditInfo.noAuditReason || '');
  }, [auditInfo.reportNumber, auditInfo.verificationCode, auditInfo.noAuditReason]);

  const isAuditedYes = auditInfo.isAudited === 'yes';

  const handleSubmit = async () => {
    if (!reportId) {
        toast.error('请先提交基本信息');
        return;
    }
    
    // 校验
    if (!auditInfo.amountUnit || !auditInfo.decimalPlaces || !auditInfo.isAudited) {
        toast.error('请填写必要审计信息');
        return;
    }
    
    if (isAuditedYes) {
        if (!auditInfo.auditDate || !reportNumber || !auditInfo.auditFirm || !auditInfo.auditOpinion || !verificationCode) {
            toast.error('请填写完整审计详情');
            return;
        }
    } else {
        if (!noAuditReason) {
            toast.error('请填写未审计原因');
            return;
        }
    }

    // Update store with latest local values before submitting (just in case onBlur didn't fire)
    setAuditInfo({
        reportNumber,
        verificationCode,
        noAuditReason
    });

    const payload: SubmitAuditInfoRequest = {
        reportId,
        customerId: selectedCustomer?.id || '',
        userCode: USER_INFO.userCode,
        amountUnit: auditInfo.amountUnit,
        decimalPlaces: auditInfo.decimalPlaces,
        isAudited: auditInfo.isAudited,
        // Optional fields based on isAudited
        auditDate: isAuditedYes ? auditInfo.auditDate : undefined,
        reportNumber: isAuditedYes ? reportNumber : undefined,
        auditFirm: isAuditedYes ? auditInfo.auditFirm : undefined,
        auditOpinion: isAuditedYes ? auditInfo.auditOpinion : undefined,
        verificationCode: isAuditedYes ? verificationCode : undefined,
        noAuditReason: !isAuditedYes ? noAuditReason : undefined,
    };

    try {
       const res = await submitAuditInfo(payload);
       if (res.status === 'success') {
           setAuditSubmitted(true);
           commitToSubmitted();
           toast.success('审计信息提交成功');
       }
    } catch (e) {
        console.error(e);
        toast.error('提交失败');
    }
  };

  if (!isBasicSubmitted) {
      return (
          <Card className="w-full opacity-50">
              <CardHeader><CardTitle className="text-base">审计信息录入 (请先提交基本信息)</CardTitle></CardHeader>
              <CardContent className="text-sm text-gray-500">
                  请先完成上方基本信息的填写和提交。
              </CardContent>
          </Card>
      );
  }

  return (
    <Card className="w-full mb-4 shadow-none border-0 sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">审计信息录入</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
         {/* 金额单位 */}
         <div className="space-y-2">
            <Label>金额单位</Label>
            <Select disabled={isAuditSubmitted} value={auditInfo.amountUnit} onValueChange={(val) => setAuditInfo({ amountUnit: val })}>
                <SelectTrigger><SelectValue placeholder="请选择金额单位" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="yuan">元</SelectItem>
                    <SelectItem value="thousand">千元</SelectItem>
                    <SelectItem value="ten_thousand">万元</SelectItem>
                    <SelectItem value="million">百万</SelectItem>
                    <SelectItem value="billion">亿</SelectItem>
                </SelectContent>
            </Select>
         </div>

         {/* 小数位数 */}
         <div className="space-y-2">
            <Label>金额保留小数位数</Label>
            <Select disabled={isAuditSubmitted} value={auditInfo.decimalPlaces} onValueChange={(val) => setAuditInfo({ decimalPlaces: val })}>
                <SelectTrigger><SelectValue placeholder="请选择小数位数" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="0">0位</SelectItem>
                    <SelectItem value="2">2位</SelectItem>
                </SelectContent>
            </Select>
         </div>

         {/* 是否已审计 */}
         <div className="space-y-2">
            <Label>是否已审计</Label>
            <Select disabled={isAuditSubmitted} value={auditInfo.isAudited} onValueChange={(val) => setAuditInfo({ isAudited: val })}>
                <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="yes">是</SelectItem>
                    <SelectItem value="no">否</SelectItem>
                </SelectContent>
            </Select>
         </div>

         {/* 条件渲染字段 */}
         <div className={cn("space-y-4 border-l-2 pl-4 ml-1 transition-colors", isAuditedYes ? "border-blue-200" : "border-gray-200")}>
            {/* 审计日期 */}
            <div className="space-y-2">
                <Label className={cn(!isAuditedYes && "text-gray-400")}>审计日期</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !auditInfo.auditDate && "text-muted-foreground"
                            )}
                            disabled={!isAuditedYes || isAuditSubmitted}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {auditInfo.auditDate ? auditInfo.auditDate : <span>选择日期</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={auditInfo.auditDate ? new Date(auditInfo.auditDate) : undefined}
                            onSelect={(date) => setAuditInfo({ auditDate: date ? format(date, 'yyyy-MM-dd') : undefined })}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* 审计报告编号 */}
            <div className="space-y-2">
                <Label className={cn(!isAuditedYes && "text-gray-400")}>审计报告编号</Label>
                <Input 
                    disabled={!isAuditedYes || isAuditSubmitted} 
                    value={reportNumber} 
                    onChange={(e) => setReportNumber(e.target.value)}
                    onBlur={() => setAuditInfo({ reportNumber })}
                />
            </div>

            {/* 审计事务所 */}
            <div className="space-y-2">
                <Label className={cn(!isAuditedYes && "text-gray-400")}>审计会计事务所</Label>
                <Select disabled={!isAuditedYes || isAuditSubmitted} value={auditInfo.auditFirm} onValueChange={(val) => setAuditInfo({ auditFirm: val })}>
                    <SelectTrigger><SelectValue placeholder="请选择事务所" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pwc">普华永道</SelectItem>
                        <SelectItem value="dtt">德勤</SelectItem>
                        <SelectItem value="kpmg">毕马威</SelectItem>
                        <SelectItem value="ey">安永</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 审计意见 */}
            <div className="space-y-2">
                <Label className={cn(!isAuditedYes && "text-gray-400")}>审计意见</Label>
                <Select disabled={!isAuditedYes || isAuditSubmitted} value={auditInfo.auditOpinion} onValueChange={(val) => setAuditInfo({ auditOpinion: val })}>
                    <SelectTrigger><SelectValue placeholder="请选择审计意见" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="unqualified">无保留意见</SelectItem>
                        <SelectItem value="unqualified_emphasis">带强调事项段或其他事项段的无保留意见</SelectItem>
                        <SelectItem value="qualified">保留意见</SelectItem>
                        <SelectItem value="adverse">否定意见</SelectItem>
                        <SelectItem value="disclaimer">无法表示意见</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 查验码 */}
            <div className="space-y-2">
                <Label className={cn(!isAuditedYes && "text-gray-400")}>查验码</Label>
                <Input 
                    disabled={!isAuditedYes || isAuditSubmitted} 
                    value={verificationCode} 
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onBlur={() => setAuditInfo({ verificationCode })}
                />
            </div>

            {/* 无审计报告原因 */}
            {!isAuditedYes && (
                <div className="space-y-2">
                    <Label>无审计报告原因</Label>
                    <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        maxLength={200}
                        disabled={isAuditSubmitted}
                        value={noAuditReason}
                        onChange={(e) => setNoAuditReason(e.target.value)}
                        onBlur={() => setAuditInfo({ noAuditReason })}
                        placeholder="请输入原因（200字以内）"
                    />
                </div>
            )}
         </div>

         <Button onClick={handleSubmit} disabled={isAuditSubmitted} className="w-full">
            {isAuditSubmitted ? '已提交' : '提交审计信息'}
         </Button>
      </CardContent>
    </Card>
  );
}
