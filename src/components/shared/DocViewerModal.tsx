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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-(--screen-xl) w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden gap-0 border-none shadow-2xl">
                <DialogHeader className="px-4 py-3 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Maximize2 size={18} className="text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold truncate max-w-[300px] md:max-w-md">
                                {title}
                            </DialogTitle>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                Document Viewer
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 gap-1.5 hidden md:flex"
                            onClick={handleOpenNewTab}
                        >
                            <ExternalLink size={14} />
                            Tab Baru
                        </Button>
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="h-8 gap-1.5"
                            onClick={handleDownload}
                        >
                            <Download size={14} />
                            Unduh
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
                
                <div className="flex-1 bg-muted/10 relative overflow-hidden flex flex-col">
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
