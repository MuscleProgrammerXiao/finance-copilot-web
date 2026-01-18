import { FinancialReport, UserPermissions } from "@/src/types/business";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

const TYPE_MAP: Record<string, string> = {
  small_enterprise: "小企业财务报表",
  enterprise_new_2019: "企业财务报表格式（已执行新金融准则...）",
  enterprise_old_2019: "企业财务报表格式（未执行新金融准则...）",
};

const CYCLE_MAP: Record<string, string> = {
  year: "年报",
  half_year: "半年报",
  quarter: "季报",
  month: "月报",
};

const NATURE_MAP: Record<string, string> = {
  summary: "摘要报表",
  headquarters: "总部报表",
  base: "基础报表",
  consolidated: "合并报表",
};

const STATUS_MAP: Record<string, string> = {
  confirmed: "已确认",
  unconfirmed: "未确认",
};

interface FinancialReportListProps {
  reports: FinancialReport[];
  permissions?: UserPermissions;
  onAction?: (action: 'delete' | 'continue' | 'view', report: FinancialReport) => void;
  onQuickAction?: (action: string) => void;
}

export function FinancialReportList({ reports, permissions, onAction, onQuickAction }: FinancialReportListProps) {
  return (
    <Card className="w-full mt-2 shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-slate-100">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            财报列表
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {reports?.length ? (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-500 h-10">报表期次</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-500 h-10">报表类型</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-500 h-10">报表周期</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-500 h-10">报表性质</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-500 h-10">状态</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-500 h-10">是否审计</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-500 h-10 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-sm text-slate-700 font-medium">{report.period}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-slate-600" title={TYPE_MAP[report.type]}>
                      {TYPE_MAP[report.type] || report.type}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{CYCLE_MAP[report.cycle] || report.cycle}</TableCell>
                    <TableCell className="text-sm text-slate-600">{NATURE_MAP[report.nature] || report.nature}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${report.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {STATUS_MAP[report.status] || report.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{report.isAudited ? "是" : "否"}</TableCell>
                    <TableCell className="text-right whitespace-nowrap space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded"
                        onClick={() => onAction?.('delete', report)}
                      >
                        删除
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                        onClick={() => onAction?.('continue', report)}
                      >
                        继续
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded"
                        onClick={() => onAction?.('view', report)}
                      >
                        查看
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-sm text-slate-400 p-8 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                </div>
                暂无财报数据
            </div>
          )}
        </div>
        
        {permissions && (
          <div className="p-4 border-t grid grid-cols-2 gap-3">
            <Button 
              disabled={!permissions.canCreateReport}
              onClick={() => onQuickAction?.('新增财务报表')}
              variant="outline"
              className="w-full justify-start"
            >
              <span className="truncate">新增财务报表</span>
            </Button>
            <Button 
              disabled={!permissions.canGenerateAIReport}
              onClick={() => onQuickAction?.('AI生成报告')}
              variant="outline"
              className="w-full justify-start"
            >
              <span className="truncate">AI生成报告</span>
            </Button>
            <Button 
              disabled={!permissions.canInputPublicReport}
              onClick={() => onQuickAction?.('上市公司财报录入')}
              variant="outline"
              className="w-full justify-start"
            >
              <span className="truncate">上市公司财报录入</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
