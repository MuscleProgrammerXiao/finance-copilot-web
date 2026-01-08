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
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";

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
  const pageSize = 5;

  const totalPages = Math.ceil(total / pageSize);

  const fetchCustomers = async (newPage: number) => {
    setLoading(true);
    try {
      const res = await getCustomers({
        loginName: USER_INFO.loginName,
        userCode: USER_INFO.userCode,
        page: newPage,
        pageSize,
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
    fetchCustomers(newPage);
  };

  if (!items.length && !loading) {
    return <div className="text-sm text-gray-500 p-2">暂无客户数据</div>;
  }

  return (
    <Card className="w-full mt-2 shadow-none border-border">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">客户名称</TableHead>
              <TableHead>客户号</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                   加载中...
                 </TableCell>
               </TableRow>
            ) : (
              items.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {customer.socialCreditCode}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
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
          <div className="p-2 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => handlePageChange(page - 1, e)}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                <PaginationItem>
                  <span className="text-sm text-muted-foreground mx-2">
                    {page} / {totalPages}
                  </span>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => handlePageChange(page + 1, e)}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
