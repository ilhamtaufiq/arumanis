import React from 'react';
import DocViewer, { DocViewerRenderers } from "@iamjariwala/react-doc-viewer";
import "@iamjariwala/react-doc-viewer/dist/index.css";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X, ExternalLink, Download, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    documents: { uri: string; fileName?: string; fileType?: string }[];
    title?: string;
}

export const DocViewerModal: React.FC<DocViewerModalProps> = ({
    isOpen,
    onClose,
    documents,
    title = "Pratinjau Dokumen"
}) => {
    if (!documents || documents.length === 0) return null;

    // Filter out invalid URIs or documents without URI
    const validDocuments = documents.filter(doc => doc && doc.uri);

    if (validDocuments.length === 0) return null;

    const handleDownload = () => {
        const currentDoc = validDocuments[0]; // For now assuming single doc or first doc
        if (!currentDoc) return;
        
        const link = document.createElement('a');
        link.href = currentDoc.uri;
        link.download = currentDoc.fileName || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenNewTab = () => {
        const currentDoc = validDocuments[0];
        if (currentDoc) {
            window.open(currentDoc.uri, '_blank', 'noopener,noreferrer');
        }
    };

    const toggleFullscreen = () => {
        const element = document.getElementById('doc-viewer-container');
        if (element) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                element.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                });
            }
        }
    };

    const isLocalDomain = (url: string) => {
        try {
            const hostname = new URL(url).hostname;
            return hostname.endsWith('.test') || 
                   hostname === 'localhost' || 
                   hostname === '127.0.0.1';
        } catch (e) {
            return false;
        }
    };

    const isOfficeDoc = (url: string) => {
        const ext = url.split('.').pop()?.toLowerCase();
        return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '');
    };

    const currentDoc = validDocuments[0];
    const needsPublicAccess = currentDoc && isLocalDomain(currentDoc.uri) && isOfficeDoc(currentDoc.uri);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-(--screen-xl) w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden gap-0 border-none shadow-2xl rounded-xl">
                <DialogHeader className="px-4 py-3 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg h-10 w-10 transition-all cursor-pointer"
                            onClick={toggleFullscreen}
                            title="Layar Penuh (Monitor)"
                        >
                            <Maximize2 size={20} className="text-blue-700" />
                        </Button>
                        <div>
                            <DialogTitle className="text-base font-bold truncate max-w-[200px] md:max-w-md">
                                {title}
                            </DialogTitle>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                {needsPublicAccess ? "Pratinjau Terbatas (Lokal)" : "Document Viewer"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1.5 px-2 md:px-3 bg-blue-50 border-blue-200 text-blue-700"
                            onClick={toggleFullscreen}
                            title="Layar Penuh (Monitor)"
                        >
                            <Maximize2 size={14} />
                            <span className="hidden sm:inline">Fullscreen</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1.5 px-2 md:px-3"
                            onClick={handleOpenNewTab}
                            title="Buka di Tab Baru"
                        >
                            <ExternalLink size={14} />
                            <span className="hidden sm:inline">Tab Baru</span>
                        </Button>
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="h-8 gap-1.5 px-2 md:px-3"
                            onClick={handleDownload}
                        >
                            <Download size={14} />
                            <span className="hidden xs:inline">Unduh</span>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </Button>
                    </div>
                </DialogHeader>
                
                <div id="doc-viewer-container" className="flex-1 bg-muted/10 relative overflow-hidden flex flex-col">
                    {needsPublicAccess && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
                            <div className="max-w-md text-center space-y-4 p-8 border rounded-2xl bg-card shadow-lg animate-in fade-in zoom-in duration-300">
                                <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                                    <ExternalLink size={32} />
                                </div>
                                <h3 className="text-lg font-bold">Butuh Akses Publik</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Dokumen <span className="font-mono text-primary">{currentDoc.uri.split('/').pop()}</span> tidak bisa dipratinjau di <strong>domain lokal (.test)</strong> karena membutuhkan layanan Office Online.
                                </p>
                                <div className="flex flex-col gap-2 pt-2">
                                    <Button onClick={handleDownload} className="w-full gap-2">
                                        <Download size={16} />
                                        Unduh File untuk Dilihat
                                    </Button>
                                    <p className="text-[10px] text-muted-foreground italic">
                                        *Pratinjau akan bekerja normal jika aplikasi sudah online/hosting.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <DocViewer
                        documents={validDocuments}
                        pluginRenderers={DocViewerRenderers}
                        theme={{
                            primary: "#0f172a",
                            secondary: "#ffffff",
                            tertiary: "#f1f5f9",
                            textPrimary: "#0f172a",
                            textSecondary: "#64748b",
                            textTertiary: "#94a3b8",
                            disableThemeScrollbar: false,
                        }}
                        config={{
                            header: {
                                disableHeader: true,
                                disableFileName: true,
                                retainURLParams: false,
                            },
                        }}
                        style={{
                            height: '100%',
                            width: '100%',
                            backgroundColor: 'transparent'
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
