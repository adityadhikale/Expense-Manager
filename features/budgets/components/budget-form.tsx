"use client";

import React, { forwardRef } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Select } from "@/components/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/date-picker";
import { convertAmountToMilliunits } from "@/lib/utils";
import { AmountInput } from "@/components/amount-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.string()
    .trim()
    .refine(
      (val) => val.length > 0,
      { message: "Amount is required" }
    )
    .refine(
      (val) => {
        const amount = parseFloat(val.replace(/,/g, ''));
        return !isNaN(amount);
      },
      { message: "Amount must be a valid number" }
    )
    .refine(
      (val) => {
        const amount = parseFloat(val.replace(/,/g, ''));
        return amount > 0;
      },
      { message: "Amount must be positive" }
    )
    .refine(
      (val) => {
        const amount = parseFloat(val.replace(/,/g, ''));
        return amount <= 1000000;
      },
      { message: "Amount cannot exceed 1,000,000" }
    ),
  month: z.date(),
  categoryId: z.string().nullable().optional(),
});

// API schema type
type FormValues = z.infer<typeof formSchema>;
type ApiFormValues = {
  name: string;
  amount: number;
  month: Date;
  categoryId?: string | null;
};

type Props = {
  id?: string;
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  categoryOptions: { label: string; value: string }[];
  onCreateCategory?: (name: string) => void;
};

export const BudgetForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  categoryOptions,
  onCreateCategory,
}: Props) => {
  // Initialize form with defaults and validation
  // Format amount if it exists in default values
  const initialAmount = defaultValues?.amount 
    ? defaultValues.amount.toString().replace(/^0+/, '') // Remove leading zeros
    : "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      amount: initialAmount,
      month: defaultValues?.month || new Date(),
      categoryId: defaultValues?.categoryId || null,
    },
  });

  // Convert form values to API format and submit
  const handleSubmit = (values: FormValues) => {
    // Remove any commas, whitespace, and leading zeros
    const cleanAmount = values.amount
      .replace(/,/g, '')
      .trim()
      .replace(/^0+/, '') || "0";  // Default to "0" if empty after cleaning
      
    const parsedAmount = parseFloat(cleanAmount);
    
    // Safety check for invalid numbers
    if (isNaN(parsedAmount)) {
      console.warn("Invalid amount detected:", values.amount);
      return;
    }
    
    // Convert to milliunits for storage
    const amountInMilliunits = convertAmountToMilliunits(parsedAmount);
    
    onSubmit({
      name: values.name,
      amount: amountInMilliunits,
      month: values.month,
      categoryId: values.categoryId,
    });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  // Custom DatePicker that only shows month/year
  const MonthPicker = forwardRef<
    HTMLDivElement,
    {
      value?: Date;
      onChange?: (date?: Date) => void;
      disabled?: boolean;
    }
  >(({ value, onChange, disabled }, ref) => {
    return (
      <DatePicker
        value={value}
        onChange={(date) => onChange?.(date)}
        disabled={disabled}
      />
    );
  });
  
  MonthPicker.displayName = "MonthPicker";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="e.g. Monthly Groceries, Entertainment"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                <AmountInput
                  {...field}
                  disabled={disabled}
                  placeholder="Enter amount"
                  onValueChange={(val) => {
                    field.onChange(val);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="month"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Month</FormLabel>
              <FormControl>
                <MonthPicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category (Optional)</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select a category"
                  options={categoryOptions}
                  onCreate={onCreateCategory}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create budget"}
        </Button>
        
        {id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Delete budget
          </Button>
        )}
      </form>
    </Form>
  );
};

