import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  disabled = false,
  className,
  loading = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [internalValue, setInternalValue] = React.useState<string | undefined>(value || undefined);
  
  // Sync internal value with prop value
  React.useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      setInternalValue(value);
    } else if (value === null || value === '') {
      setInternalValue(undefined);
    }
  }, [value]);

  const selectedOption = React.useMemo(() => {
    const currentValue = value || internalValue;
    if (!currentValue || currentValue === '') {
      return undefined;
    }
    const found = options.find(
      (option) => String(option.value) === String(currentValue),
    );
    return found;
  }, [options, value, internalValue]);

  // Reset search when value changes
  React.useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open, value]);

  const filteredOptions = React.useMemo(() => {
    if (!search) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [options, search]);

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          'w-full justify-between h-10 dark:bg-slate-700 dark:text-gray-100 dark:border-gray-600',
          !selectedOption && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
      >
        <span className="truncate">
          {selectedOption
            ? selectedOption.label
            : (value || internalValue) && String(value || internalValue) !== ''
              ? String(value || internalValue)
              : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 dark:bg-slate-800 dark:text-gray-100"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                {search && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto p-1">
              {loading ? (
                <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setInternalValue(option.value);
                      if (onValueChange) {
                        onValueChange(option.value);
                      }
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer',
                      String(value || internalValue) === String(option.value) &&
                        'bg-[#4F39F6]/10 text-[#4F39F6] dark:bg-[#4F39F6]/20 dark:text-[#4F39F6]',
                      String(value || internalValue) !== String(option.value) &&
                        'text-gray-900 dark:text-gray-100',
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {String(value || internalValue) === String(option.value) && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
