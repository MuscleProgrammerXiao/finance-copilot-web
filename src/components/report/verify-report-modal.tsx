import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { useReportStore } from "@/src/store/report-store";
import { useChatStore } from "@/src/store/chat-store";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Upload, ZoomIn, ZoomOut, RotateCcw, FileSpreadsheet, ChevronLeft, ChevronRight, X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

type ReportType = 'balance' | 'profit' | 'cash';
type ReportStatus = 'unuploaded' | 'success' | 'failed';

interface ReportState {
    status: ReportStatus;
    files: Array<{ type: 'image' | 'excel', url: string }>;
    currentIndex: number;
}

const MOCK_DATA = [
    { id: 1, item: "货币资金", amount: "1,234,567.00" },
    { id: 2, item: "应收账款", amount: "567,890.00" },
    { id: 3, item: "存货", amount: "890,123.00" },
    { id: 4, item: "固定资产", amount: "2,345,678.00" },
    { id: 5, item: "短期借款", amount: "456,789.00" },
    { id: 6, item: "预付账款", amount: "123,456.00" },
    { id: 7, item: "其他应收款", amount: "78,901.00" },
    { id: 8, item: "长期股权投资", amount: "3,456,789.00" },
    { id: 9, item: "无形资产", amount: "567,890.00" },
    { id: 10, item: "应付账款", amount: "987,654.00" },
];

export function VerifyReportModal() {
    const { isVerifyOpen, setVerifyOpen } = useReportStore();
    const { selectedCustomer } = useChatStore();
    
    const [activeTab, setActiveTab] = useState<ReportType>('balance');
    const [selectedColumn, setSelectedColumn] = useState('closing');

    // Mock State for Reports
    const [reports, setReports] = useState<Record<ReportType, ReportState>>({
        balance: { status: 'unuploaded', files: [], currentIndex: 0 },
        profit: { status: 'success', files: [{ type: 'image', url: '/mock-report.jpg' }], currentIndex: 0 },
        cash: { status: 'failed', files: [{ type: 'excel', url: '' }], currentIndex: 0 }
    });

    // Image Viewer State
    const [scale, setScale] = useState(100);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const imageRef = useRef<HTMLDivElement>(null);

    // Reset viewer when tab changes
    useEffect(() => {
        setScale(100);
        setPosition({ x: 0, y: 0 });
    }, [activeTab]);

    const handleUpload = () => {
        // Mock upload action
        setReports(prev => ({
            ...prev,
            [activeTab]: {
                status: 'success',
                files: [{ type: 'image', url: 'https://placehold.co/800x1200?text=Report+Image' }],
                currentIndex: 0
            }
        }));
    };

    const handleReUpload = () => {
         handleUpload();
    };

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

    const handleMouseUp = () => {
        setIsDragging(false);
    };

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
            case 'success': return <span className="ml-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">校验成功</span>;
            case 'failed': return <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">校验失败</span>;
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
        <Dialog open={isVerifyOpen} onOpenChange={setVerifyOpen}>
            <DialogContent 
                className="w-screen h-screen max-w-none m-0 p-0 rounded-none flex flex-row bg-gray-50 overflow-hidden data-[state=open]:slide-in-from-bottom-0 sm:max-w-none border-none focus:outline-none"
                showCloseButton={false}
            >
                {/* Left: Image Viewer */}
                <div className="w-[55%] border-r flex flex-col bg-white h-full shadow-sm z-10">
                     <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportType)} className="flex flex-col h-full">
                        <div className="h-16 px-6 border-b bg-white flex items-center shrink-0">
                            <TabsList className="w-full justify-start h-10 bg-gray-100/50 p-1">
                                {['balance', 'profit', 'cash'].map((type) => (
                                    <TabsTrigger 
                                        key={type} 
                                        value={type}
                                        className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                                    >
                                        {getTabLabel(type as ReportType)}
                                        {getStatusBadge(reports[type as ReportType].status)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div 
                            className="flex-1 relative overflow-hidden flex flex-col bg-gray-50/50"
                            onWheel={handleWheel}
                        >
                            {currentReport.status === 'unuploaded' ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-6">
                                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
                                        <Upload className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-lg font-medium text-gray-900">暂无影像文件</h3>
                                        <p className="text-sm text-gray-500">
                                            请上传《{getTabLabel(activeTab)}》相关影像文件进行校验
                                        </p>
                                    </div>
                                    <Button onClick={handleUpload} size="lg" className="shadow-lg hover:shadow-xl transition-all">
                                        <Upload className="w-4 h-4 mr-2" />
                                        点击上传报表
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Toolbar */}
                                    <div className="absolute top-6 right-6 z-20 flex items-center space-x-2">
                                        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-gray-100 flex items-center space-x-1">
                                            {currentReport.files[0]?.type === 'image' && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={() => handleZoom(-10)}>
                                                        <ZoomOut className="w-4 h-4 text-gray-600" />
                                                    </Button>
                                                    <span className="text-xs font-medium w-12 text-center text-gray-600">{scale}%</span>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={() => handleZoom(10)}>
                                                        <ZoomIn className="w-4 h-4 text-gray-600" />
                                                    </Button>
                                                    <div className="w-px h-4 bg-gray-200 mx-1" />
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={handleFitScreen}>
                                                        <Maximize2 className="w-4 h-4 text-gray-600" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                        <Button 
                                            variant="white" 
                                            size="sm" 
                                            onClick={handleReUpload} 
                                            className="h-11 shadow-lg border border-gray-100 text-gray-600 hover:text-gray-900"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-2" />
                                            重新上传
                                        </Button>
                                    </div>

                                    {/* Content Area */}
                                    <div 
                                        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-slate-50"
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                                            <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                                        </div>
                                        
                                        {currentReport.files[0]?.type === 'excel' ? (
                                            <div className="w-full h-full flex items-center justify-center p-12 overflow-auto">
                                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center text-center max-w-md w-full">
                                                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                                                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Excel 文件预览</h3>
                                                    <p className="text-sm text-gray-500">
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
                                                    className="max-w-none shadow-2xl ring-1 ring-black/5 rounded-sm"
                                                    draggable={false}
                                                 />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Pagination */}
                                    {currentReport.files.length > 1 && (
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                            <div className="bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-full shadow-lg border border-gray-100 flex items-center space-x-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></Button>
                                                <span className="text-xs font-medium px-2 text-gray-600">1 / {currentReport.files.length}</span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Tabs>
                </div>

                {/* Right: Verification Results */}
                <div className="w-[45%] flex flex-col bg-white h-full">
                    {/* Right Header */}
                    <div className="h-16 px-6 border-b flex items-center justify-between shrink-0 bg-white">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-medium mb-0.5">当前客户</span>
                            <div className="text-lg font-semibold text-gray-900 flex items-center">
                                {selectedCustomer?.name || '未选择客户'}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                             <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full" onClick={() => setVerifyOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-6 border-b bg-gray-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-1 bg-blue-600 rounded-full" />
                                <h3 className="text-base font-semibold text-gray-900">识别结果</h3>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-500">识别列</span>
                                <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                                    <SelectTrigger className="w-[160px] bg-white border-gray-200 shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="opening">期初余额</SelectItem>
                                        <SelectItem value="closing">期末余额</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto bg-white">
                        <Table>
                            <TableHeader className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableHead className="w-[80px] pl-6 font-semibold text-gray-600">序号</TableHead>
                                    <TableHead className="font-semibold text-gray-600">项目科目</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-600">金额 (元)</TableHead>
                                    <TableHead className="w-[100px] text-center font-semibold text-gray-600 pr-6">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {MOCK_DATA.map((row) => (
                                    <TableRow key={row.id} className="hover:bg-blue-50/50 border-gray-50 group transition-colors">
                                        <TableCell className="pl-6 font-medium text-gray-500">{row.id}</TableCell>
                                        <TableCell className="font-medium text-gray-900">{row.item}</TableCell>
                                        <TableCell className="text-right font-mono text-gray-700">{row.amount}</TableCell>
                                        <TableCell className="text-center pr-6">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                修正
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    
                    <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-xs text-gray-500">
                        <span>共 {MOCK_DATA.length} 条数据</span>
                        <span>最后更新: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
