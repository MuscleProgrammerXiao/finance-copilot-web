import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReportStore } from "@/src/store/report-store";
import { useChatStore } from "@/src/store/chat-store";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Input } from "@/src/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { 
    Upload, ZoomIn, ZoomOut, RotateCcw, FileSpreadsheet, 
    ChevronLeft, ChevronRight, X, Maximize2, Copy, 
    AlertCircle, Calculator, ArrowRight, CheckCircle2,
    ScanLine, Sparkles, Layout, Image as ImageIcon, Table as TableIcon
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import TEMPLATE_DATA from "@/src/constants/template-subject-data.json";
import { CALCULATION_RULES } from "@/src/lib/calculation-rules";
import { toast } from "sonner";

// --- Types ---

type ReportType = 'balance' | 'profit' | 'cash';
type ReportStatus = 'unuploaded' | 'success' | 'failed';

interface ReportState {
    status: ReportStatus;
    files: Array<{ type: 'image' | 'excel', url: string }>;
    currentIndex: number;
}

interface SubjectItem {
    name: string;
    type: string;
    indent_level: number;
    sortIndex: number;
    amount: string;
}

// --- Helper Components ---

const IndentationGuide = ({ level }: { level: number }) => {
    if (level <= 0) return null;
    return (
        <div className="absolute left-0 top-0 bottom-0 flex select-none pointer-events-none">
            {Array.from({ length: level }).map((_, i) => (
                <div 
                    key={i} 
                    className="h-full w-4 border-l border-gray-100 first:border-transparent ml-4"
                />
            ))}
        </div>
    );
};

// Memoized Row Component for Performance
const ReportTableRow = memo(({ 
    row, 
    index, 
    validation, 
    isRelated, 
    isHovered,
    onHover, 
    onLeave, 
    onChange, 
    onCopy,
    onFix
}: {
    row: SubjectItem;
    index: number;
    validation: any;
    isRelated: boolean;
    isHovered: boolean;
    onHover: (name: string) => void;
    onLeave: () => void;
    onChange: (index: number, value: string) => void;
    onCopy: (val: string) => void;
    onFix: (index: number, val: number) => void;
}) => {
    return (
        <TableRow 
            className={cn(
                "group transition-colors duration-150 ease-in-out border-b border-gray-100/50",
                // Base backgrounds
                row.type === '其他项' && "bg-gray-50/80 font-semibold",
                row.type === '计算项' && "bg-gray-50/30",
                row.type === '录入项' && "bg-white",
                // Hover & Relation states
                isHovered && "bg-blue-50/30",
                isRelated && "bg-blue-50/60",
            )}
            onMouseEnter={() => onHover(row.name)}
            onMouseLeave={onLeave}
        >
            {/* Index Column with Relation Indicator */}
            <TableCell className="relative w-[40px] min-w-[40px] max-w-[40px] pl-2 py-2 text-center border-r border-gray-50">
                {isRelated && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 animate-in fade-in duration-300" />
                )}
                <span className={cn(
                    "text-[10px] font-mono tracking-tighter",
                    row.type === '其他项' ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
                )}>
                    {String(row.sortIndex).padStart(3, '0')}
                </span>
            </TableCell>

            {/* Name Column */}
            <TableCell className="py-2 pl-0 border-r border-gray-50 relative overflow-hidden text-left">
                <IndentationGuide level={row.indent_level} />
                <div 
                    className="flex items-center justify-start relative z-10"
                    style={{ paddingLeft: `${row.indent_level * 16 + 24}px` }}
                >
                    <span className={cn(
                        "transition-colors duration-200 truncate",
                        row.type === '计算项' ? "text-gray-700 font-medium" : "text-gray-600",
                        row.type === '其他项' && "text-gray-900 text-sm",
                        row.type === '录入项' && "font-normal",
                        isRelated && "text-blue-700 font-medium"
                    )}>
                        {row.name}
                    </span>
                    {row.type === '计算项' && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-gray-100 text-gray-500 border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                            计算
                        </span>
                    )}
                </div>
            </TableCell>

            {/* Amount Column */}
            <TableCell className="text-right pr-4 py-1.5 w-[240px]">
                {row.type !== '其他项' ? (
                    <div className="flex items-center justify-end gap-2 group/cell">
                        {/* Validation Warning */}
                        {validation && !validation.isValid && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 p-0 animate-pulse">
                                        <AlertCircle className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[340px] p-0 shadow-xl border-red-100" align="end" sideOffset={5}>
                                    <div className="bg-gradient-to-r from-red-50 to-white px-4 py-3 border-b border-red-100 flex items-center justify-between">
                                        <div className="flex items-center text-red-700 font-medium">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            <span>计算校验异常</span>
                                        </div>
                                        <span className="text-[10px] text-red-400 bg-white px-2 py-0.5 rounded-full border border-red-100">
                                            差额 {validation.diff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-500 block">当前录入</span>
                                                <span className="font-mono font-medium text-red-600 text-base block">
                                                    {validation.current.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <span className="text-xs text-gray-500 block">系统试算</span>
                                                <span className="font-mono font-medium text-green-600 text-base block">
                                                    {validation.expected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-xs bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                                            <div className="px-3 py-2 bg-gray-100/50 border-b border-gray-100 font-medium text-gray-600 flex items-center">
                                                <Calculator className="w-3 h-3 mr-1.5" />
                                                计算公式详情
                                            </div>
                                            <div className="max-h-[160px] overflow-y-auto p-2 space-y-1">
                                                {validation.details.map((part: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center py-1 px-2 hover:bg-white rounded transition-colors group/formula">
                                                        <div className="flex items-center text-gray-600">
                                                            <span className={cn(
                                                                "w-4 h-4 flex items-center justify-center rounded-full mr-2 text-[10px] font-bold",
                                                                part.operator === '+' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                                            )}>
                                                                {part.operator}
                                                            </span>
                                                            <span className="truncate max-w-[140px]" title={part.source}>{part.source}</span>
                                                        </div>
                                                        <span className="font-mono text-gray-900 group-hover/formula:text-blue-600">
                                                            {part.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button 
                                            size="sm" 
                                            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200"
                                            onClick={() => onFix(index, validation.expected)}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            一键修正为计算值
                                        </Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}

                        {/* Copy Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-gray-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover/cell:opacity-100 transition-all scale-90"
                            onClick={() => onCopy(row.amount)}
                            title="复制金额"
                        >
                            <Copy className="w-3 h-3" />
                        </Button>
                        
                        {/* Input / Display */}
                        {row.type === '计算项' ? (
                            <div className={cn(
                                "w-[140px] text-right font-mono text-sm h-8 flex items-center justify-end font-medium pr-3 rounded-md transition-colors",
                                validation && !validation.isValid ? "text-red-600 bg-red-50/50" : "text-gray-900",
                                isRelated && "bg-blue-100/30"
                            )}>
                                {row.amount || "0.00"}
                            </div>
                        ) : (
                            <div className="relative group/input">
                                <Input
                                    value={row.amount}
                                    onChange={(e) => onChange(index, e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                    className={cn(
                                        "w-[140px] text-right font-mono text-sm h-8 transition-all border-transparent bg-transparent rounded-md shadow-none focus:pr-3",
                                        "text-gray-700 hover:bg-white hover:shadow-sm focus:bg-white focus:border-blue-200 focus:ring-2 focus:ring-blue-100 focus:shadow-sm",
                                        !row.amount && "text-gray-300",
                                        isRelated && "bg-blue-50/30 hover:bg-white"
                                    )}
                                    placeholder="0.00"
                                />
                                <div className="absolute inset-0 border border-transparent group-hover/input:border-gray-200 rounded-md pointer-events-none transition-colors" />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-end pr-4">
                        <span className="text-gray-300 text-xs font-mono">-</span>
                    </div>
                )}
            </TableCell>
        </TableRow>
    );
}, (prev, next) => {
    return (
        prev.row === next.row &&
        prev.isRelated === next.isRelated &&
        prev.isHovered === next.isHovered &&
        prev.validation?.isValid === next.validation?.isValid &&
        prev.validation?.current === next.validation?.current
    );
});
ReportTableRow.displayName = "ReportTableRow";

// --- Main Component ---

export function VerifyReportModal() {
    const { isVerifyOpen, setVerifyOpen, setImportOpen, importData } = useReportStore();
    const { selectedCustomer } = useChatStore();
    
    const [activeTab, setActiveTab] = useState<ReportType>('balance');
    const [selectedColumn, setSelectedColumn] = useState('closing');
    
    // View Mode State: 'split' | 'image' | 'data'
    const [viewMode, setViewMode] = useState<'split' | 'image' | 'data'>('split');

    // Auto-switch view mode based on screen width
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) { // Laptop/Tablet breakpoint
                setViewMode(prev => prev === 'split' ? 'data' : prev);
            } else {
                setViewMode('split');
            }
        };
        
        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initial data load
    const [tableData, setTableData] = useState<SubjectItem[]>(() => {
        return TEMPLATE_DATA.map(item => ({
            ...item,
            amount: item.amount ? Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
        }));
    });

    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // Optimized Validation Calculation
    const getValidationStatus = useCallback((row: SubjectItem, allRows: SubjectItem[]) => {
        const rule = CALCULATION_RULES.find(r => r.target === row.name);
        if (!rule) return null;

        let expected = 0;
        const details = rule.formula.map(part => {
            const sourceItem = allRows.find(r => r.name === part.source);
            const amount = sourceItem ? parseFloat(sourceItem.amount.replace(/,/g, '') || '0') : 0;
            if (part.operator === '+') expected += amount;
            else expected -= amount;
            return { ...part, amount };
        });

        const current = parseFloat(row.amount.replace(/,/g, '') || '0');
        const diff = Math.abs(current - expected);
        const isValid = diff < 0.01;

        return { isValid, expected, current, diff, details, rule };
    }, []);

    // Optimized Relation Check
    const checkRelation = useCallback((targetName: string, currentRowName: string) => {
        if (targetName === currentRowName) return true;

        // Check if hovered row is target and current row is source
        const targetRule = CALCULATION_RULES.find(r => r.target === targetName);
        if (targetRule && targetRule.formula.some(p => p.source === currentRowName)) return true;

        // Check if hovered row is source and current row is target
        const sourceRule = CALCULATION_RULES.find(r => r.target === currentRowName);
        if (sourceRule && sourceRule.formula.some(p => p.source === targetName)) return true;

        return false;
    }, []);

    const handleAmountChange = useCallback((index: number, value: string) => {
        setTableData(prev => {
            const newData = [...prev];
            newData[index] = { ...newData[index], amount: value };
            return newData;
        });
    }, []);

    const handleFixAmount = useCallback((index: number, val: number) => {
        handleAmountChange(index, val.toFixed(2));
        toast.success("已自动修正金额");
    }, [handleAmountChange]);

    const handleCopy = useCallback((amount: string) => {
        const cleanAmount = amount.replace(/,/g, '');
        navigator.clipboard.writeText(cleanAmount);
        toast.success('已复制金额 (无千分位)');
    }, []);

    // Image Viewer State
    const [reports, setReports] = useState<Record<ReportType, ReportState>>({
        balance: { status: 'unuploaded', files: [], currentIndex: 0 },
        profit: { status: 'unuploaded', files: [], currentIndex: 0 },
        cash: { status: 'unuploaded', files: [], currentIndex: 0 }
    });

    // Sync with imported data
    useEffect(() => {
        if (importData && Array.isArray(importData)) {
            const newReports = { ...reports };
            
            importData.forEach((file: any) => {
                let type: ReportType | null = null;
                if (file.recognizedType === '资产负债表') type = 'balance';
                else if (file.recognizedType === '利润表') type = 'profit';
                else if (file.recognizedType === '现金流量表') type = 'cash';

                if (type) {
                    newReports[type] = {
                        status: 'success',
                        files: [{ type: file.type, url: file.url || '' }],
                        currentIndex: 0
                    };
                }
            });
            
            setReports(newReports);
        }
    }, [importData]);

    const [scale, setScale] = useState(100);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setScale(100);
        setPosition({ x: 0, y: 0 });
    }, [activeTab]);

    const handleUpload = () => {
        setImportOpen(true);
        // We might want to close verify modal temporarily or keep it open in background?
        // The requirement says "Clicking these shows the import report module".
        // Usually import modal is on top of verify or verify closes.
        // "4. When recognition is complete, click import... enter verification module".
        // This implies verification module might be closed or we are just switching context.
        // Since ImportModal is global, we can just open it.
        // But if VerifyModal is open, ImportModal will be on top (z-index).
    };

    const handleReUpload = () => handleUpload();

    const handleMouseDown = (e: React.MouseEvent) => {
        if (reports[activeTab].files[0]?.type !== 'image') return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleZoom = (delta: number) => {
        setScale(prev => Math.max(10, Math.min(500, prev + delta)));
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (reports[activeTab].files[0]?.type !== 'image') return;
        const delta = e.deltaY > 0 ? -10 : 10;
        handleZoom(delta);
    };

    const handleFitScreen = () => {
        setScale(100);
        setPosition({ x: 0, y: 0 });
    };

    if (!isVerifyOpen) return null;

    const currentReport = reports[activeTab];

    const getStatusBadge = (status: ReportStatus) => {
        switch (status) {
            case 'success': return <span className="ml-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 ring-1 ring-inset ring-green-600/20">校验成功</span>;
            case 'failed': return <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">校验失败</span>;
            default: return null;
        }
    };

    const getTabLabel = (type: ReportType) => {
        switch(type) {
            case 'balance': return '资产负债表';
            case 'profit': return '利润表';
            case 'cash': return '现金流量表';
        }
    };

    return (
        <AnimatePresence>
            {isVerifyOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
                    {/* Backdrop with Blur and Tech Grid */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => setVerifyOpen(false)}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-20" />
                    </motion.div>

                    {/* Main Content Window */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ 
                            scale: 1, 
                            opacity: 1, 
                            y: 0,
                            transition: { 
                                type: "spring",
                                damping: 25,
                                stiffness: 300
                            }
                        }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-screen h-screen max-w-none flex flex-col bg-white overflow-hidden shadow-2xl ring-1 ring-black/5"
                    >
                        {/* Tech Scan Line Effect (One-time on mount) */}
                        <motion.div 
                            initial={{ top: -100, opacity: 1 }}
                            animate={{ top: "100%", opacity: 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent z-50 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                        />

                        {/* GLOBAL HEADER */}
                        <div className="h-14 px-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm flex items-center justify-between shrink-0 z-40 relative">
                            {/* Left: Title & Customer */}
                            <div className="flex items-center space-x-4">
                                <div className="flex flex-col">
                                    <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-blue-500" />
                                        智能报表校验
                                    </h2>
                                    <div className="flex items-center space-x-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                                        <span className="text-[10px] text-gray-500 font-medium">{selectedCustomer?.name || '未选择客户'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Center: View Switcher */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="flex items-center bg-gray-100/80 p-1 rounded-lg border border-gray-200/50 shadow-inner">
                                    <button
                                        onClick={() => setViewMode('image')}
                                        className={cn(
                                            "flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                                            viewMode === 'image' 
                                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        )}
                                    >
                                        <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                                        原始影像
                                    </button>
                                    <button
                                        onClick={() => setViewMode('split')}
                                        className={cn(
                                            "hidden md:flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                                            viewMode === 'split' 
                                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        )}
                                        title="分屏对比 (大屏模式)"
                                    >
                                        <Layout className="w-3.5 h-3.5 mr-1.5" />
                                        分屏对比
                                    </button>
                                    <button
                                        onClick={() => setViewMode('data')}
                                        className={cn(
                                            "flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                                            viewMode === 'data' 
                                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" 
                                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                        )}
                                    >
                                        <TableIcon className="w-3.5 h-3.5 mr-1.5" />
                                        数据核对
                                    </button>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-red-50 hover:text-red-600 transition-colors" onClick={() => setVerifyOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* CONTENT BODY */}
                        <div className="flex-1 flex overflow-hidden relative">
                            {/* Left Panel: Image Viewer */}
                            <div className={cn(
                                "flex-col bg-white h-full border-r border-gray-100 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] relative z-10",
                                viewMode === 'split' ? "w-1/2 flex" : (viewMode === 'image' ? "w-full flex" : "w-0 hidden border-none")
                            )}>
                                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportType)} className="flex flex-col h-full">
                                    <div className="h-10 px-4 border-b bg-white flex items-center shrink-0">
                                        <TabsList className="w-full justify-start h-8 bg-gray-100/50 p-1">
                                            {['balance', 'profit', 'cash'].map((type) => (
                                                <TabsTrigger 
                                                    key={type} 
                                                    value={type}
                                                    className="flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                                                >
                                                    {getTabLabel(type as ReportType)}
                                                    {getStatusBadge(reports[type as ReportType].status)}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    <div 
                                        className="flex-1 relative overflow-hidden flex flex-col bg-slate-50/50"
                                        onWheel={handleWheel}
                                    >
                                        {currentReport.status === 'unuploaded' ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-6">
                                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                                                    <Upload className="w-10 h-10 text-gray-300" />
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <h3 className="text-base font-medium text-gray-900">暂无影像文件</h3>
                                                    <p className="text-xs text-gray-500">
                                                        请上传《{getTabLabel(activeTab)}》相关影像文件进行校验
                                                    </p>
                                                </div>
                                                <Button onClick={handleUpload} className="shadow-lg hover:shadow-xl transition-all">
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    点击上传报表
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Image Toolbar */}
                                                <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
                                                    <div className="bg-white/90 backdrop-blur-md p-1 rounded-lg shadow-sm border border-gray-200/50 flex items-center space-x-1">
                                                        {currentReport.files[0]?.type === 'image' && (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100" onClick={() => handleZoom(-10)}>
                                                                    <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
                                                                </Button>
                                                                <span className="text-[10px] font-medium w-10 text-center text-gray-500 tabular-nums">{scale}%</span>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100" onClick={() => handleZoom(10)}>
                                                                    <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
                                                                </Button>
                                                                <div className="w-px h-3 bg-gray-200 mx-1" />
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100" onClick={handleFitScreen}>
                                                                    <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={handleReUpload} 
                                                        className="h-9 shadow-sm border-gray-200 text-gray-600 hover:text-gray-900 bg-white"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 mr-2" />
                                                        重新上传
                                                    </Button>
                                                </div>

                                                {/* Canvas Area */}
                                                <div 
                                                    className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#F8FAFC]"
                                                    onMouseDown={handleMouseDown}
                                                    onMouseMove={handleMouseMove}
                                                    onMouseUp={handleMouseUp}
                                                    onMouseLeave={handleMouseUp}
                                                >
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
                                                        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                                                    </div>
                                                    
                                                    {currentReport.files[0]?.type === 'excel' ? (
                                                        <div className="w-full h-full flex items-center justify-center p-12">
                                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center max-w-sm">
                                                                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                                                                    <FileSpreadsheet className="w-7 h-7 text-green-600" />
                                                                </div>
                                                                <h3 className="text-base font-medium text-gray-900 mb-1">Excel 文件预览</h3>
                                                                <p className="text-xs text-gray-500">
                                                                    系统已自动识别 Excel 内容，请在右侧查看解析结果
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            ref={imageRef}
                                                            className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-linear origin-center"
                                                            style={{ 
                                                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale / 100})`,
                                                            }}
                                                        >
                                                             <img 
                                                                src="https://placehold.co/800x1200/e2e8f0/64748b?text=Report+Image" 
                                                                alt="Report" 
                                                                className="max-w-none shadow-xl ring-1 ring-black/5 rounded-sm"
                                                                draggable={false}
                                                             />
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Tabs>
                            </div>

                            {/* Right Panel: Data Table */}
                            <div className={cn(
                                "flex-col bg-white h-full transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] relative z-20",
                                viewMode === 'split' ? "w-1/2 flex" : (viewMode === 'data' ? "w-full flex" : "w-0 hidden")
                            )}>
                                {/* Data Panel Header */}
                                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/30 shrink-0">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                            <TableIcon className="w-3.5 h-3.5" />
                                            数据识别与校验
                                        </span>
                                    </div>
                                    <div className="flex items-center bg-white p-0.5 rounded-md border border-gray-200 shadow-sm">
                                        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                                            <SelectTrigger className="w-[130px] h-7 bg-transparent border-none shadow-none text-xs font-medium focus:ring-0">
                                                <div className="flex items-center text-gray-600">
                                                    <span className="mr-2 text-gray-400">识别列:</span>
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="opening">期初余额</SelectItem>
                                                <SelectItem value="closing">期末余额</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Table Area */}
                                <div className="flex-1 overflow-auto bg-white scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                    <Table>
                                        <TableHeader className="bg-white sticky top-0 z-20 shadow-sm ring-1 ring-black/5">
                                            <TableRow className="hover:bg-transparent border-b border-gray-100">
                                                <TableHead className="w-[40px] min-w-[40px] max-w-[40px] pl-2 text-center font-semibold text-gray-500 text-xs">序号</TableHead>
                                                <TableHead className="font-semibold text-gray-500 text-xs">项目科目</TableHead>
                                                <TableHead className="text-right font-semibold text-gray-500 text-xs pr-7">金额 (元)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tableData.map((row, index) => (
                                                <ReportTableRow
                                                    key={index}
                                                    index={index}
                                                    row={row}
                                                    validation={getValidationStatus(row, tableData)}
                                                    isRelated={hoveredRow ? checkRelation(hoveredRow, row.name) : false}
                                                    isHovered={hoveredRow === row.name}
                                                    onHover={setHoveredRow}
                                                    onLeave={() => setHoveredRow(null)}
                                                    onChange={handleAmountChange}
                                                    onCopy={handleCopy}
                                                    onFix={handleFixAmount}
                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                {/* Footer */}
                                <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-[10px] text-gray-500 shrink-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1.5">
                                            <div className="w-2 h-2 bg-gray-200 rounded-sm"></div>
                                            <span>计算项</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <div className="w-2 h-2 bg-white border border-gray-200 rounded-sm"></div>
                                            <span>录入项</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5">
                                            <div className="w-2 h-2 bg-blue-100 rounded-sm"></div>
                                            <span>关联项</span>
                                        </div>
                                    </div>
                                    <span className="font-mono text-gray-400">Total: {tableData.length}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
