import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { PageContainer } from '@/components/layout/page-container';
import { Settings } from 'lucide-react';
import RoleList from '@/features/roles/components/RoleList';
import PermissionList from '@/features/permissions/components/PermissionList';
import UserList from '@/features/users/components/UserList';
import KegiatanRoleList from '@/features/kegiatan-role/components/KegiatanRoleList';
import RoutePermissionList from '@/features/route-permissions/components/RoutePermissionList';

export default function SettingsPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center space-x-4">
                <Settings className="h-8 w-8" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
                    <p className="text-muted-foreground">Kelola pengguna, role, dan permissions sistem</p>
                </div>
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="route-permissions">Route Permissions</TabsTrigger>
                    <TabsTrigger value="kegiatan-role">Kegiatan-Role</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-6">
                    <UserList />
                </TabsContent>

                <TabsContent value="roles" className="mt-6">
                    <RoleList />
                </TabsContent>

                <TabsContent value="permissions" className="mt-6">
                    <PermissionList />
                </TabsContent>

                <TabsContent value="route-permissions" className="mt-6">
                    <RoutePermissionList />
                </TabsContent>

                <TabsContent value="kegiatan-role" className="mt-6">
                    <KegiatanRoleList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
