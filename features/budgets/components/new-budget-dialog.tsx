"use client";

import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { useCreateBudget } from "@/features/budgets/api/use-create-budget";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-category";

export const NewBudgetDialog = () => {
  const newBudget = useNewBudget();
  const createBudget = useCreateBudget();
  const createCategory = useCreateCategory();
  const categoriesQuery = useGetCategories();

  const categoryOptions = (categoriesQuery.data || []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <Dialog open={newBudget.isOpen} onOpenChange={newBudget.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new budget</DialogTitle>
          <DialogDescription>Add a new budget to track your spending</DialogDescription>
        </DialogHeader>
        <BudgetForm
          onSubmit={(values) => {
            createBudget.mutate(values, {
              onSuccess: () => {
                newBudget.onClose();
              },
            });
          }}
          disabled={createBudget.isPending}
          categoryOptions={categoryOptions}
          onCreateCategory={(name) => {
            createCategory.mutate({ name });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

