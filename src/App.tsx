import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { KegiatanRoutes } from '@/features/kegiatan/routes';
import { DashboardRoutes } from '@/features/dashboard/routes';
import { KecamatanRoutes } from '@/features/kecamatan/routes';
import { DesaRoutes } from '@/features/desa/routes';
import { PekerjaanRoutes } from '@/features/pekerjaan/routes';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/*" element={<DashboardRoutes />} />
          <Route path="/kegiatan/*" element={<KegiatanRoutes />} />
          <Route path="/kecamatan/*" element={<KecamatanRoutes />} />
          <Route path="/desa/*" element={<DesaRoutes />} />
          <Route path="/pekerjaan/*" element={<PekerjaanRoutes />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;