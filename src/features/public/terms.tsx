import { FileText } from 'lucide-react'

export function Terms() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-4xl bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-8 sm:p-10 space-y-8">
                    <div className="flex items-center space-x-4 border-b border-border pb-6">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <FileText className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Syarat & Ketentuan</h1>
                            <p className="text-muted-foreground mt-1">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-foreground mb-3">Syarat dan Ketentuan Penggunaan ARUMANIS</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Silakan hubungi administrator sistem.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
