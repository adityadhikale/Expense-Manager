import CurrencyInput from "react-currency-input-field";
import { Info, MinusCircle, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { placeholder } from "drizzle-orm";

type Props = {
    value: string;
    onChange: (value: string | undefined) => void;
    onValueChange?: (value: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
};

export const AmountInput = ({
    value,
    onChange,
    onValueChange,
    placeholder,
    disabled,
}: Props) => {

    // Handle empty string or invalid values gracefully
    const parsedValue = value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
    const isIncome = parsedValue > 0;
    const isExpense = parsedValue < 0;

    const onReverseValue = () => {
        if (!value) return;
        const newValue = parseFloat(value) * -1;
        onChange(newValue.toString());
    };

    return (
        <div className="relative" >
            <TooltipProvider>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={onReverseValue}
                            className={cn(
                                "bg-slate-400 hover:bg-slate-500 absolute top-1.5 left-1.5 rounded-md p-2 flex items-center justify-center transition",
                                isIncome && "bg-emerald-500 hover:bg-emerald-600",
                                isExpense && "bg-rose-500 hover:bg-rose-600",
                            )}
                        >
                            {!parsedValue && <Info className="size-3 text-white" />}
                            {isIncome && <PlusCircle className="size-3 text-white" />}
                            {isExpense && <MinusCircle className="size-3 text-white" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Use [+] for income and [-] for expenses
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <CurrencyInput
                prefix="₹"
                className="pl-10 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={placeholder || "Enter amount"}
                value={value === "0" ? "" : value}
                decimalsLimit={2}
                decimalScale={2}
                onValueChange={(val) => {
                    // Call custom onValueChange handler if provided
                    if (onValueChange) {
                        onValueChange(val);
                        return;
                    }
                    
                    // Default handling
                    // Handle empty input and zero cases properly
                    if (!val || val === "0" || val === "0.00") {
                        onChange("");
                        return;
                    }
                    
                    // Handle leading zeros by removing them
                    if (val.startsWith('0') && val.length > 1 && !val.startsWith('0.')) {
                        // Remove leading zeros but keep decimal values like 0.5
                        const cleanedVal = val.replace(/^0+/, '');
                        onChange(cleanedVal);
                        return;
                    }
                    
                    onChange(val);
                }}
                disabled={disabled}
                allowNegativeValue={true}
                step={1}
                intlConfig={{ locale: 'en-IN', currency: 'INR' }}
            />
            <p className="text-xs text-muted-foreground mt-2">
                {isIncome && "This will count as income."}
                {isExpense && "This will count as expense."}
            </p>
        </div>
    )
}