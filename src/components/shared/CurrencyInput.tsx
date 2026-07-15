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

/** Format number for display: 1234567.89 -> "1.234.567,89" */
function formatRupiahDisplay(num: number | string): string {
    if (num === '' || num === null || num === undefined) return '';

    const n = typeof num === 'number' ? num : Number(num);
    if (!Number.isFinite(n)) return '';

    const negative = n < 0;
    const abs = Math.abs(n);
    const [intPart, decPart] = abs.toString().split('.');
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formatted = decPart !== undefined ? `${intFormatted},${decPart}` : intFormatted;

    return negative ? `-${formatted}` : formatted;
}

/** Parse Indonesian currency string: "1.234.567,89" -> 1234567.89 */
function parseRupiahInput(input: string): { display: string; value: number } {
    // Keep digits, one decimal comma, optional leading minus
    let raw = input.replace(/[^\d,]/g, '');

    const commaIdx = raw.indexOf(',');
    if (commaIdx !== -1) {
        raw = raw.slice(0, commaIdx + 1) + raw.slice(commaIdx + 1).replace(/,/g, '');
    }

    const [intRaw = '', decRaw] = raw.split(',');
    const intFormatted = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const display = decRaw !== undefined ? `${intFormatted},${decRaw}` : intFormatted;

    if (intRaw === '' && (decRaw === undefined || decRaw === '')) {
        return { display: '', value: 0 };
    }

    const numericString =
        decRaw !== undefined ? `${intRaw || '0'}.${decRaw}` : (intRaw || '0');
    const value = Number(numericString);

    return {
        display,
        value: Number.isFinite(value) ? value : 0,
    };
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
    const [isFocused, setIsFocused] = useState(false);

    // Sync from parent only when not actively typing (avoids caret jumps / reformat mid-edit)
    useEffect(() => {
        if (isFocused) return;

        if (value !== undefined && value !== null && Number.isFinite(value)) {
            setDisplayValue(value === 0 ? '' : formatRupiahDisplay(value));
        } else {
            setDisplayValue('');
        }
    }, [value, isFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { display, value: numericValue } = parseRupiahInput(e.target.value);
        setDisplayValue(display);

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
                inputMode="decimal"
                value={displayValue}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setIsFocused(false);
                    // Normalize display from numeric value after edit
                    if (value !== undefined && value !== null && Number.isFinite(value) && value !== 0) {
                        setDisplayValue(formatRupiahDisplay(value));
                    } else if (!value) {
                        setDisplayValue('');
                    }
                }}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`pl-10 ${className}`}
            />
        </div>
    );
};
