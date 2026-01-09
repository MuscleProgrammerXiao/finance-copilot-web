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
import { Input } from "@/src/components/ui/input";
import { Search } from "lucide-react";

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

  return (
    <Card className="w-full mt-2 shadow-none border-border">
      <CardHeader className="p-3 pb-2">
         <div className="flex items-center gap-2">
            <Input 
              placeholder="搜索客户名称..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button size="sm" variant="ghost" onClick={handleSearch} className="h-8 w-8 p-0">
               <Search className="h-4 w-4 text-gray-500" />
            </Button>
         </div>
      </CardHeader>
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
            ) : items.length === 0 ? (
                <TableRow>
                 <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                   暂无客户数据
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
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
          <div className="py-2 border-t border-border">
            <Pagination className="justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => handlePageChange(page - 1, e)}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>{page}</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => handlePageChange(page + 1, e)}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
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
