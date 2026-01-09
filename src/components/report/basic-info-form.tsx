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
    <Card className="w-full mb-4 shadow-none border-0 sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">基本信息录入</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 报表性质 */}
        <div className="space-y-2">
          <Label>报表性质</Label>
          <Select 
            disabled={isBasicSubmitted} 
            value={basicInfo.reportNature} 
            onValueChange={(val) => setBasicInfo({ reportNature: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择报表性质" />
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
          <Label>报表周期</Label>
          <Select 
            disabled={isBasicSubmitted} 
            value={basicInfo.reportCycle} 
            onValueChange={(val) => setBasicInfo({ reportCycle: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择报表周期" />
            </SelectTrigger>
            <SelectContent>
               <SelectItem value="year">年报</SelectItem>
               <SelectItem value="half_year">半年报</SelectItem>
               <SelectItem value="quarter">季报</SelectItem>
               <SelectItem value="month">月报</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 报表类型 */}
        <div className="space-y-2">
          <Label>报表类型</Label>
          <Select 
             disabled={isBasicSubmitted} 
             value={basicInfo.reportType} 
             onValueChange={(val) => setBasicInfo({ reportType: val })}
          >
            <SelectTrigger>
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
           <Label>货币类型</Label>
           <Select 
              disabled={isBasicSubmitted} 
              value={basicInfo.currency} 
              onValueChange={(val) => setBasicInfo({ currency: val })}
           >
             <SelectTrigger>
               <SelectValue placeholder="请选择货币" />
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
           <Label>报表期次</Label>
           <Select 
              disabled={isBasicSubmitted} 
              value={basicInfo.reportPeriod} 
              onValueChange={(val) => setBasicInfo({ reportPeriod: val })}
           >
             <SelectTrigger>
               <SelectValue placeholder="请选择期次" />
             </SelectTrigger>
             <SelectContent className="max-h-60">
                {periodOptions.map(p => (
                   <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
             </SelectContent>
           </Select>
        </div>

        {/* 社会统一信用代码 */}
        <div className="space-y-2">
           <Label>社会统一信用代码</Label>
           <Input value={selectedCustomer?.socialCreditCode || ''} disabled readOnly className="bg-gray-50" />
        </div>

        <Button onClick={handleSubmit} disabled={isBasicSubmitted} className="w-full">
           {isBasicSubmitted ? '已提交' : '提交基本信息'}
        </Button>
      </CardContent>
    </Card>
  );
}
