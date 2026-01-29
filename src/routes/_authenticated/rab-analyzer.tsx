import { createFileRoute } from '@tanstack/react-router';
import { RabAnalyzer } from '@/features/rab-analyzer/components/RabAnalyzer';

export const Route = createFileRoute('/_authenticated/rab-analyzer')({
    component: RabAnalyzer,
});
