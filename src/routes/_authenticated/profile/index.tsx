import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import ProfilePage from '@/features/profile/components/ProfilePage';

export const Route = createFileRoute('/_authenticated/profile/')({
    component: ProfilePageRoute,
});

function ProfilePageRoute() {
    return (
        <>
            <Header fixed>
            </Header>
            <Main>
                <ProfilePage />
            </Main>
        </>
    );
}
