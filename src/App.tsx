import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { KegiatanRoutes } from '@/features/kegiatan/routes';
import { DashboardRoutes } from '@/features/dashboard/routes';
import { KecamatanRoutes } from '@/features/kecamatan/routes';
import { DesaRoutes } from '@/features/desa/routes';
import { PekerjaanRoutes } from '@/features/pekerjaan/routes';
import { KontrakRoutes } from '@/features/kontrak/routes';
import { OutputRoutes } from '@/features/output/routes';
import { PenerimaRoutes } from '@/features/penerima/routes';
import { FotoRoutes } from '@/features/foto/routes';
import { BerkasRoutes } from '@/features/berkas/routes';
import { UserRoutes } from '@/features/users/routes';
import { RoleRoutes } from '@/features/roles/routes';
import { PermissionRoutes } from '@/features/permissions/routes';
import { Toaster } from '@/components/ui/sonner';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { ThemeProvider } from '@/context/theme-provider';
import { SignIn } from '@/features/auth/sign-n';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route element={<AuthenticatedLayout />}>
            <Route path="/*" element={<DashboardRoutes />} />
            <Route path="/kegiatan/*" element={<KegiatanRoutes />} />
            <Route path="/kecamatan/*" element={<KecamatanRoutes />} />
            <Route path="/desa/*" element={<DesaRoutes />} />
            <Route path="/pekerjaan/*" element={<PekerjaanRoutes />} />
            <Route path="/kontrak/*" element={<KontrakRoutes />} />
            <Route path="/output/*" element={<OutputRoutes />} />
            <Route path="/penerima/*" element={<PenerimaRoutes />} />
            <Route path="/foto/*" element={<FotoRoutes />} />
            <Route path="/berkas/*" element={<BerkasRoutes />} />
            <Route path="/users/*" element={<UserRoutes />} />
            <Route path="/roles/*" element={<RoleRoutes />} />
            <Route path="/permissions/*" element={<PermissionRoutes />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;