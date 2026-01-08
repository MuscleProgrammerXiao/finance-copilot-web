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
    <Card className="w-full mt-2 shadow-none border-border">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base font-medium">财报列表</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {reports?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">报表期次</TableHead>
                  <TableHead className="whitespace-nowrap">报表类型</TableHead>
                  <TableHead className="whitespace-nowrap">报表周期</TableHead>
                  <TableHead className="whitespace-nowrap">报表性质</TableHead>
                  <TableHead className="whitespace-nowrap">状态</TableHead>
                  <TableHead className="whitespace-nowrap">是否审计</TableHead>
                  <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.period}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={TYPE_MAP[report.type]}>
                      {TYPE_MAP[report.type] || report.type}
                    </TableCell>
                    <TableCell>{CYCLE_MAP[report.cycle] || report.cycle}</TableCell>
                    <TableCell>{NATURE_MAP[report.nature] || report.nature}</TableCell>
                    <TableCell>{STATUS_MAP[report.status] || report.status}</TableCell>
                    <TableCell>{report.isAudited ? "是" : "否"}</TableCell>
                    <TableCell className="text-right whitespace-nowrap space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onAction?.('delete', report)}
                      >
                        删除
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => onAction?.('continue', report)}
                      >
                        继续录入
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
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
            <div className="text-sm text-gray-500 p-4 text-center">暂无财报数据</div>
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
              disabled={!permissions.canInputCreditReport}
              onClick={() => onQuickAction?.('授信报告录入')}
              variant="outline"
              className="w-full justify-start"
            >
              <span className="truncate">授信报告录入</span>
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
