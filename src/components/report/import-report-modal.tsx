import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReportStore } from "@/src/store/report-store";
import { Button } from "@/src/components/ui/button";
import { Upload, X, FileSpreadsheet, FileImage, CheckCircle2, AlertCircle, Loader2, RefreshCw, Trash2, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

interface ImportedFile {
    id: string;
    name: string;
    type: 'image' | 'excel';
    status: 'pending' | 'processing' | 'success' | 'failed';
    recognizedType?: '资产负债表' | '利润表' | '现金流量表' | '未知表类型';
    url?: string;
}

const MOCK_FILES: ImportedFile[] = [
    { id: '1', name: '2023年度资产负债表.png', type: 'image', status: 'pending', url: '/mock-balance.png' },
    { id: '2', name: '2023年度利润表.png', type: 'image', status: 'pending', url: '/mock-profit.png' },
    { id: '3', name: '2023年度现金流量表.xlsx', type: 'excel', status: 'pending', url: '/mock-cash.xlsx' }
];

export function ImportReportModal() {
    const { isImportOpen, setImportOpen, setVerifyOpen, setImportData } = useReportStore();
    const [files, setFiles] = useState<ImportedFile[]>([]);
    const [isRecognizing, setIsRecognizing] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isImportOpen) {
            setFiles([]);
            setIsRecognizing(false);
        }
    }, [isImportOpen]);

    const handleSelectSample = () => {
        setFiles(MOCK_FILES.map(f => ({ ...f, status: 'pending' })));
    };

    const handleStartRecognition = () => {
        if (files.length === 0) return;
        setIsRecognizing(true);
        
        // Update all pending to processing
        setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'processing' } : f));

        // Simulate processing for each file
        files.forEach((file, index) => {
            if (file.status !== 'pending') return;

            setTimeout(() => {
                setFiles(prev => prev.map(f => {
                    if (f.id === file.id) {
                        let recognizedType: ImportedFile['recognizedType'] = '未知表类型';
                        if (f.name.includes('资产负债表')) recognizedType = '资产负债表';
                        else if (f.name.includes('利润表')) recognizedType = '利润表';
                        else if (f.name.includes('现金流量表')) recognizedType = '现金流量表';

                        return {
                            ...f,
                            status: 'success',
                            recognizedType
                        };
                    }
                    return f;
                }));
            }, 1500 * (index + 1));
        });

        // Finish global recognizing state after all are done (roughly)
        setTimeout(() => {
            setIsRecognizing(false);
            toast.success("识别完成");
        }, 1500 * files.length + 500);
    };

    const handleReRecognize = (id: string) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'processing' } : f));
        setTimeout(() => {
            setFiles(prev => prev.map(f => {
                if (f.id === id) {
                    let recognizedType: ImportedFile['recognizedType'] = '未知表类型';
                    if (f.name.includes('资产负债表')) recognizedType = '资产负债表';
                    else if (f.name.includes('利润表')) recognizedType = '利润表';
                    else if (f.name.includes('现金流量表')) recognizedType = '现金流量表';
                    
                    return { ...f, status: 'success', recognizedType };
                }
                return f;
            }));
            toast.success("重新识别完成");
        }, 1500);
    };

    const handleDelete = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleImport = () => {
        const successFiles = files.filter(f => f.status === 'success');
        if (successFiles.length === 0) {
            toast.error("没有识别成功的报表可导入");
            return;
        }

        setImportData(successFiles);
        setImportOpen(false);
        setVerifyOpen(true);
        toast.success(`成功导入 ${successFiles.length} 份报表`);
    };

    return (
        <AnimatePresence>
            {isImportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
                     {/* Backdrop */}
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setImportOpen(false)}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">导入财务报表</h2>
                                <p className="text-xs text-gray-500 mt-0.5">支持图片(JPG/PNG)及Excel文件，智能识别报表类型</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setImportOpen(false)}>
                                <X className="w-5 h-5 text-gray-400" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                            {files.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                        <Upload className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h3 className="text-base font-medium text-gray-900 mb-2">点击或拖拽文件到此处上传</h3>
                                    <p className="text-sm text-gray-500 mb-8 text-center max-w-md">
                                        支持上传资产负债表、利润表、现金流量表<br/>
                                        单次最多上传 10 个文件，单个文件不超过 20MB
                                    </p>
                                    
                                    <div className="flex flex-col items-center gap-4 w-full max-w-md">
                                        <Button className="w-full">选择文件</Button>
                                        
                                        <div className="relative w-full text-center">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                            <span className="relative bg-gray-50/50 px-2 text-xs text-gray-400">或使用案例数据</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 w-full">
                                            <button onClick={handleSelectSample} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all group">
                                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <FileImage className="w-5 h-5 text-orange-500" />
                                                </div>
                                                <span className="text-xs text-gray-600">资产负债表</span>
                                            </button>
                                            <button onClick={handleSelectSample} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all group">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <FileImage className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <span className="text-xs text-gray-600">利润表</span>
                                            </button>
                                            <button onClick={handleSelectSample} className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all group">
                                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <FileSpreadsheet className="w-5 h-5 text-green-500" />
                                                </div>
                                                <span className="text-xs text-gray-600">现金流量表</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-medium text-gray-700">已上传 {files.length} 个文件</h3>
                                        <Button variant="outline" size="sm" onClick={() => setFiles([])} disabled={isRecognizing}>
                                            清空列表
                                        </Button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {files.map((file) => (
                                            <div key={file.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                                                {/* File Icon */}
                                                <div className={cn(
                                                    "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                                                    file.type === 'excel' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                                                )}>
                                                    {file.type === 'excel' ? <FileSpreadsheet className="w-6 h-6" /> : <FileImage className="w-6 h-6" />}
                                                </div>

                                                {/* File Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                                                        {file.status === 'success' && (
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                                                file.recognizedType === '未知表类型' 
                                                                    ? "bg-gray-100 text-gray-600 border-gray-200"
                                                                    : "bg-blue-50 text-blue-700 border-blue-100"
                                                            )}>
                                                                {file.recognizedType}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Status Bar */}
                                                    <div className="flex items-center gap-2">
                                                        {file.status === 'pending' && <span className="text-xs text-gray-400">等待识别...</span>}
                                                        {file.status === 'processing' && (
                                                            <span className="text-xs text-blue-600 flex items-center gap-1">
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                正在智能识别中...
                                                            </span>
                                                        )}
                                                        {file.status === 'success' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 识别成功</span>}
                                                        {file.status === 'failed' && <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> 识别失败</span>}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {file.status === 'success' || file.status === 'failed' ? (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => handleReRecognize(file.id)} title="重新识别">
                                                                <RefreshCw className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(file.id)} title="删除">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(file.id)} disabled={file.status === 'processing'}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="h-20 px-6 border-t border-gray-100 bg-white flex items-center justify-end gap-4 shrink-0">
                            {files.length > 0 && files.some(f => f.status === 'pending') ? (
                                <Button size="lg" className="w-40 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={handleStartRecognition} disabled={isRecognizing}>
                                    {isRecognizing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            识别中...
                                        </>
                                    ) : (
                                        <>
                                            <ScanLine className="w-4 h-4 mr-2" />
                                            开始识别
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button 
                                    size="lg" 
                                    className="w-40" 
                                    disabled={files.length === 0 || isRecognizing || !files.some(f => f.status === 'success')}
                                    onClick={handleImport}
                                >
                                    导入报表
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Icon helper
function ScanLine({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>
    )
}
