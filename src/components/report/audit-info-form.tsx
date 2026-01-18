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
import { zhCN } from 'date-fns/locale';

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
          <Card className="w-full opacity-60 shadow-sm border-slate-200 border-dashed bg-slate-50/50">
              <CardHeader className="pb-3 border-b border-slate-100 border-dashed">
                  <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                    <span className="w-1 h-4 bg-slate-300 rounded-full"></span>
                    审计信息录入
                  </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-400 py-8 text-center">
                  请先完成上方基本信息的填写和提交
              </CardContent>
          </Card>
      );
  }

  return (
    <Card className="w-full mb-4 shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            审计信息录入
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
         <div className="grid grid-cols-2 gap-5">
            {/* 金额单位 */}
            <div className="space-y-2">
                <Label className="text-slate-600 font-medium">金额单位</Label>
                <Select disabled={isAuditSubmitted} value={auditInfo.amountUnit} onValueChange={(val) => setAuditInfo({ amountUnit: val })}>
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20">
                        <SelectValue placeholder="请选择" />
                    </SelectTrigger>
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
                <Label className="text-slate-600 font-medium">小数位数</Label>
                <Select disabled={isAuditSubmitted} value={auditInfo.decimalPlaces} onValueChange={(val) => setAuditInfo({ decimalPlaces: val })}>
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20">
                        <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">0位</SelectItem>
                        <SelectItem value="2">2位</SelectItem>
                        <SelectItem value="4">4位</SelectItem>
                    </SelectContent>
                </Select>
            </div>
         </div>

         {/* 是否审计 */}
         <div className="space-y-2">
            <Label className="text-slate-600 font-medium">是否审计</Label>
            <Select disabled={isAuditSubmitted} value={auditInfo.isAudited} onValueChange={(val) => setAuditInfo({ isAudited: val })}>
                <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20">
                    <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="yes">是</SelectItem>
                    <SelectItem value="no">否</SelectItem>
                </SelectContent>
            </Select>
         </div>

         {/* 条件渲染字段 */}
         <div className={cn("space-y-4 border-l-2 pl-4 ml-1 transition-colors duration-300", isAuditedYes ? "border-blue-400" : "border-slate-200")}>
            {/* 审计日期 */}
            <div className="space-y-2">
                <Label className={cn("text-slate-600 font-medium", !isAuditedYes && "text-slate-400")}>审计日期</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal bg-white border-slate-200 hover:bg-slate-50",
                                !auditInfo.auditDate && "text-slate-400"
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
                            locale={zhCN}
                            fromYear={1990}
                            toYear={new Date().getFullYear() + 5}
                            selected={auditInfo.auditDate ? new Date(auditInfo.auditDate) : undefined}
                            onSelect={(date) => setAuditInfo({ auditDate: date ? format(date, 'yyyy-MM-dd') : undefined })}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* 审计报告编号 */}
            <div className="space-y-2">
                <Label className={cn("text-slate-600 font-medium", !isAuditedYes && "text-slate-400")}>审计报告编号</Label>
                <Input 
                    disabled={!isAuditedYes || isAuditSubmitted} 
                    value={reportNumber} 
                    onChange={(e) => setReportNumber(e.target.value)}
                    onBlur={() => setAuditInfo({ reportNumber })}
                    className="bg-white border-slate-200 focus:ring-blue-500/20"
                />
            </div>

            {/* 审计事务所 */}
            <div className="space-y-2">
                <Label className={cn("text-slate-600 font-medium", !isAuditedYes && "text-slate-400")}>审计会计事务所</Label>
                <Select disabled={!isAuditedYes || isAuditSubmitted} value={auditInfo.auditFirm} onValueChange={(val) => setAuditInfo({ auditFirm: val })}>
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20"><SelectValue placeholder="请选择事务所" /></SelectTrigger>
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
                <Label className={cn("text-slate-600 font-medium", !isAuditedYes && "text-slate-400")}>审计意见</Label>
                <Select disabled={!isAuditedYes || isAuditSubmitted} value={auditInfo.auditOpinion} onValueChange={(val) => setAuditInfo({ auditOpinion: val })}>
                    <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20"><SelectValue placeholder="请选择审计意见" /></SelectTrigger>
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
                <Label className={cn("text-slate-600 font-medium", !isAuditedYes && "text-slate-400")}>查验码</Label>
                <Input 
                    disabled={!isAuditedYes || isAuditSubmitted} 
                    value={verificationCode} 
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onBlur={() => setAuditInfo({ verificationCode })}
                    className="bg-white border-slate-200 focus:ring-blue-500/20"
                />
            </div>

            {/* 无审计报告原因 */}
            {!isAuditedYes && (
                <div className="space-y-2">
                    <Label className="text-slate-600 font-medium">无审计报告原因</Label>
                    <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
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

         <Button 
            onClick={handleSubmit} 
            disabled={isAuditSubmitted} 
            className={cn(
                "w-full transition-all duration-300 shadow-sm",
                isAuditSubmitted 
                    ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20"
            )}
         >
            {isAuditSubmitted ? '已提交' : '提交审计信息'}
         </Button>
      </CardContent>
    </Card>
  );
}
