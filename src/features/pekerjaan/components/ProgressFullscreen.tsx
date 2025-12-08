import { useParams } from '@tanstack/react-router';
import ProgressTabContent from './ProgressTabContent';

export default function ProgressFullscreen() {
    const { id } = useParams({ strict: false });
    const pekerjaanId = parseInt(id || '0');

    return (
        <div className="min-h-screen bg-background p-4">
            <ProgressTabContent pekerjaanId={pekerjaanId} />
        </div>
    );
}
