import { Loader2 } from "lucide-react";

import { BudgetForm } from "@/features/budgets/components/budget-form";
import { useEditBudget } from "@/features/budgets/hooks/use-edit-budget";
import { useGetBudget } from "@/features/budgets/api/use-get-budget";
import { useUpdateBudget } from "@/features/budgets/api/use-update-budget";
import { useDeleteBudget } from "@/features/budgets/api/use-delete-budget";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useConfirm } from "@/hooks/use-confirm";
import { convertAmountFromMilliunits } from "@/lib/utils";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const EditBudgetSheet = () => {
  const { isOpen, onClose, id } = useEditBudget();
  
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete budget goal?",
    "This budget goal will be permanently deleted."
  );

  const budgetQuery = useGetBudget(id);
  const updateBudget = useUpdateBudget(id);
  const deleteBudget = useDeleteBudget(id);
  const categoriesQuery = useGetCategories();

  const categories = categoriesQuery.data || [];
  
  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const isPending = updateBudget.isPending || deleteBudget.isPending;
  const isLoading = budgetQuery.isLoading || categoriesQuery.isLoading;

  const onSubmit = (values: {
    name: string;
    amount: number;
    month: Date;
    categoryId?: string | null;
  }) => {
    updateBudget.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) {
      deleteBudget.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const defaultValues = budgetQuery.data
    ? {
        name: budgetQuery.data.name,
        amount: convertAmountFromMilliunits(budgetQuery.data.amount).toString(),
        month: new Date(budgetQuery.data.month),
        categoryId: budgetQuery.data.categoryId,
      }
    : {
        name: "",
        amount: "0",
        month: new Date(),
        categoryId: null,
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Budget Goal</SheetTitle>
            <SheetDescription>
              Modify your existing budget goal
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <BudgetForm
              id={id}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              defaultValues={defaultValues}
              categoryOptions={categoryOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

