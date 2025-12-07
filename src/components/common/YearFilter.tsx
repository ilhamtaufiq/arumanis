import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from '@/stores/auth-stores';
import { getDashboardStats } from '@/features/dashboard/api/dashboard';

interface YearFilterProps {
    selectedYear: string;
    onYearChange: (year: string) => void;
    className?: string;
}

export function YearFilter({ selectedYear, onYearChange, className }: YearFilterProps) {
    const { auth } = useAuthStore();
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    // Check if user has admin role
    const isAdmin = auth.user?.roles?.includes('admin') ?? false;

    useEffect(() => {
        const fetchYears = async () => {
            if (isAdmin) {
                try {
                    // We use getDashboardStats to get available years
                    // This is a bit heavy but ensures consistency with dashboard
                    const stats = await getDashboardStats();
                    if (stats.availableYears) {
                        setAvailableYears(stats.availableYears.map(y => y.toString()));
                    }
                } catch (error) {
                    console.error('Failed to fetch available years:', error);
                    // Fallback to current year if fetch fails
                    setAvailableYears([new Date().getFullYear().toString()]);
                }
            }
        };

        fetchYears();
    }, [isAdmin]);

    if (!isAdmin) {
        return null;
    }

    return (
        <div className={className}>
            <Select value={selectedYear} onValueChange={onYearChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
