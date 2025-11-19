import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300 transition-colors peer-checked:bg-purple-600 peer-checked:border-purple-600 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-purple-600 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            checked && 'bg-purple-600 border-purple-600',
            className,
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 text-white" />}
        </div>
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
