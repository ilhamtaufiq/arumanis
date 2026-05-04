import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

interface SearchInputProps {
    defaultValue: string;
    onSearch: (val: string) => void;
    placeholder?: string;
    className?: string;
    delay?: number;
}

export const SearchInput = ({ 
    defaultValue, 
    onSearch, 
    placeholder = "Cari...", 
    className = "",
    delay = 500 
}: SearchInputProps) => {
    const [localValue, setLocalValue] = useState(defaultValue);

    // Sync with parent state if it changes (e.g. cleared from outside)
    useEffect(() => {
        setLocalValue(defaultValue);
    }, [defaultValue]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== defaultValue) {
                onSearch(localValue);
            }
        }, delay);
        return () => clearTimeout(timer);
    }, [localValue, onSearch, defaultValue, delay]);

    return (
        <div className={`relative ${className}`}>
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="pl-10"
            />
        </div>
    );
};
