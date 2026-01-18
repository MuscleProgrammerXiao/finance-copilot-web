import { useState } from "react";
import { Customer } from "@/src/types/business";
import { getCustomers } from "@/src/api/client";
import { USER_INFO } from "@/src/constants/flow";
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
  import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationEllipsis,
  } from "@/src/components/ui/pagination";
import { Input } from "@/src/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CustomerListProps {
  data: {
    items?: Customer[];
    total?: number;
  };
  onSelect?: (customer: Customer) => void;
}

export function CustomerList({ data: initialData, onSelect }: CustomerListProps) {
  const [items, setItems] = useState<Customer[]>(initialData.items || []);
  const [total, setTotal] = useState<number>(initialData.total || 0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 5;

  const totalPages = Math.ceil(total / pageSize);

  const fetchCustomers = async (newPage: number, nameQuery?: string) => {
    setLoading(true);
    try {
      const res = await getCustomers({
        loginName: USER_INFO.loginName,
        userCode: USER_INFO.userCode,
        page: newPage,
        pageSize,
        name: nameQuery,
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
      setPage(newPage);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (newPage < 1 || newPage > totalPages) return;
    fetchCustomers(newPage, searchTerm);
  };

  const handleSearch = () => {
    fetchCustomers(1, searchTerm);
  };

  // 生成页码数组 logic
  const getPageNumbers = () => {
    const delta = 2; // 当前页前后显示的页码数
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    for (let i = page - delta; i <= page + delta; i++) {
        if (i < totalPages && i > 1) {
            range.push(i);
        }
    }
    if (totalPages > 1) {
        range.push(totalPages);
    }

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }
    return rangeWithDots;
  };

  return (
    <Card className="w-full mt-2 shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-slate-100 space-y-3">
         <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            客户列表
         </CardTitle>
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="搜索客户名称..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-sm bg-white border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 rounded-full transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleSearch} 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
            >
               搜索
            </Button>
         </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="w-[120px] text-xs font-medium text-slate-500 h-10">客户名称</TableHead>
              <TableHead className="text-xs font-medium text-slate-500 h-10">客户号</TableHead>
              <TableHead className="text-right text-xs font-medium text-slate-500 h-10">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center text-slate-400">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      加载中...
                   </div>
                 </TableCell>
               </TableRow>
            ) : items.length === 0 ? (
                <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center text-slate-400">
                   暂无客户数据
                 </TableCell>
               </TableRow>
            ) : (
              items.map((customer) => (
                <TableRow key={customer.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-700">{customer.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {customer.socialCreditCode}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full font-medium"
                      onClick={() => onSelect?.(customer)}
                    >
                      选择
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="py-3 border-t border-slate-100 bg-slate-50/30">
            <Pagination className="justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => handlePageChange(page - 1, e)}
                    className={cn(
                        "gap-1 pl-2.5 h-8 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all",
                        page <= 1 ? "pointer-events-none opacity-50" : ""
                    )}
                    size="default"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>上一页</span>
                  </PaginationLink>
                </PaginationItem>
                
                {getPageNumbers().map((p, i) => (
                    <PaginationItem key={i}>
                        {p === '...' ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink 
                                href="#" 
                                isActive={page === p}
                                onClick={(e) => handlePageChange(Number(p), e)}
                                className={cn(
                                    "h-8 w-8 text-xs transition-all",
                                    page === p 
                                        ? "border-blue-200 bg-blue-50 text-blue-600 font-medium pointer-events-none" 
                                        : "text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100"
                                )}
                            >
                                {p}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => handlePageChange(page + 1, e)}
                    className={cn(
                        "gap-1 pr-2.5 h-8 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100 transition-all",
                        page >= totalPages ? "pointer-events-none opacity-50" : ""
                    )}
                    size="default"
                  >
                    <span>下一页</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
