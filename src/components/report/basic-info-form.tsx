import { useReportStore } from '@/src/store/report-store';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { useChatStore } from '@/src/store/chat-store';
import { USER_INFO } from '@/src/constants/flow';
import { submitBasicInfo } from '@/src/api/client';
import { SubmitBasicInfoRequest } from '@/src/types/business';
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

export function BasicInfoForm() {
  const { basicInfo, setBasicInfo, isBasicSubmitted, setBasicSubmitted, setReportId, commitToSubmitted } = useReportStore();
  const { selectedCustomer } = useChatStore();

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      toast.error('请先选择客户');
      return;
    }
    // 简单校验
    if (!basicInfo.reportNature || !basicInfo.reportCycle || !basicInfo.reportType || !basicInfo.currency || !basicInfo.reportPeriod) {
       toast.error('请填写完整基本信息');
       return;
    }

    const payload: SubmitBasicInfoRequest = {
       customerId: selectedCustomer.id,
       customerName: selectedCustomer.name,
       userCode: USER_INFO.userCode,
       loginName: USER_INFO.loginName,
       ...basicInfo
    };

    try {
      const res = await submitBasicInfo(payload);
      if (res.status === 'success') {
         setBasicSubmitted(true);
         setReportId(res.reportId || 'mock-id'); 
         commitToSubmitted();
         toast.success(`基本信息提交成功，报表编号：${res.reportId}`);
      }
    } catch (e) {
      console.error(e);
      toast.error('提交失败，请重试');
    }
  };

  // 生成报表期次选项 (前后5年)
  const currentYear = new Date().getFullYear();
  const periodOptions: string[] = [];
  for (let y = currentYear - 5; y <= currentYear + 5; y++) {
    for (let m = 1; m <= 12; m++) {
      periodOptions.push(`${y}${m.toString().padStart(2, '0')}`);
    }
  }

  return (
    <Card className="w-full mb-4 shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            基本信息录入
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="grid grid-cols-2 gap-5">
            {/* 报表性质 */}
            <div className="space-y-2">
            <Label className="text-slate-600 font-medium">报表性质</Label>
            <Select 
                disabled={isBasicSubmitted} 
                value={basicInfo.reportNature} 
                onValueChange={(val) => setBasicInfo({ reportNature: val })}
            >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20">
                <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="summary">汇总报表</SelectItem>
                <SelectItem value="headquarters">总公司报表</SelectItem>
                <SelectItem value="base">本部报表</SelectItem>
                <SelectItem value="consolidated">合并报表</SelectItem>
                </SelectContent>
            </Select>
            </div>

            {/* 报表周期 */}
            <div className="space-y-2">
            <Label className="text-slate-600 font-medium">报表周期</Label>
            <Select 
                disabled={isBasicSubmitted} 
                value={basicInfo.reportCycle} 
                onValueChange={(val) => setBasicInfo({ reportCycle: val })}
            >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20">
                <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="year">年报</SelectItem>
                <SelectItem value="half_year">半年报</SelectItem>
                <SelectItem value="quarter">季报</SelectItem>
                <SelectItem value="month">月报</SelectItem>
                </SelectContent>
            </Select>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
            {/* 报表类型 */}
            <div className="space-y-2 col-span-2">
            <Label className="text-slate-600 font-medium">报表类型</Label>
            <Select 
                disabled={isBasicSubmitted} 
                value={basicInfo.reportType} 
                onValueChange={(val) => setBasicInfo({ reportType: val })}
            >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20">
                <SelectValue placeholder="请选择报表类型" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="small_enterprise">小企业财务报表</SelectItem>
                <SelectItem value="enterprise_new_2019">企业财务报表格式（已执行新金融准则...）2019年版</SelectItem>
                <SelectItem value="enterprise_old_2019">企业财务报表格式（未执行新金融准则...）2019年版</SelectItem>
                </SelectContent>
            </Select>
            </div>

            {/* 货币类型 */}
            <div className="space-y-2">
            <Label className="text-slate-600 font-medium">货币类型</Label>
            <Select 
                disabled={isBasicSubmitted} 
                value={basicInfo.currency} 
                onValueChange={(val) => setBasicInfo({ currency: val })}
            >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20">
                <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                <SelectItem value="USD">美元 (USD)</SelectItem>
                <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                </SelectContent>
            </Select>
            </div>

            {/* 报表期次 */}
            <div className="space-y-2">
            <Label className="text-slate-600 font-medium">报表期次</Label>
            <Select 
                disabled={isBasicSubmitted} 
                value={basicInfo.reportPeriod} 
                onValueChange={(val) => setBasicInfo({ reportPeriod: val })}
            >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-500/20">
                <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                    {periodOptions.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            </div>
        </div>

        {/* 社会统一信用代码 */}
        <div className="space-y-2">
           <Label className="text-slate-600 font-medium">社会统一信用代码</Label>
           <Input value={selectedCustomer?.socialCreditCode || ''} disabled readOnly className="bg-slate-50 border-slate-200 text-slate-500" />
        </div>

        <Button 
            onClick={handleSubmit} 
            disabled={isBasicSubmitted} 
            className={cn(
                "w-full transition-all duration-300 shadow-sm",
                isBasicSubmitted 
                    ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20"
            )}
        >
           {isBasicSubmitted ? '已提交' : '提交基本信息'}
        </Button>
      </CardContent>
    </Card>
  );
}
