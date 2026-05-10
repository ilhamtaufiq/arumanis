import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps {
    id?: string;
    name?: string;
    value: number;
    onChange: (name: string, value: number) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
    id,
    name,
    value,
    onChange,
    placeholder = '0',
    required = false,
    disabled = false,
    className = '',
}) => {
    const [displayValue, setDisplayValue] = useState('');

    // Format number to Rupiah: 1000000 -> 1.000.000
    const formatRupiah = (num: number | string) => {
        const numberString = num.toString().replace(/[^0-9]/g, '');
        if (!numberString) return '';
        
        // Use regex for thousand separators
        return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Initialize display value
    useEffect(() => {
        if (value !== undefined && value !== null) {
            setDisplayValue(formatRupiah(value));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        const rawValue = inputVal.replace(/[^0-9]/g, '');
        const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
        
        // Update display value immediately for responsiveness
        setDisplayValue(formatRupiah(rawValue));
        
        // Notify parent
        if (name) {
            onChange(name, numericValue);
        }
    };

    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                Rp
            </span>
            <Input
                id={id}
                type="text"
                value={displayValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`pl-10 ${className}`}
            />
        </div>
    );
};
