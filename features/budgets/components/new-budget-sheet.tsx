import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { useCreateBudget } from "@/features/budgets/api/use-create-budget";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const NewBudgetSheet = () => {
  const { isOpen, onClose } = useNewBudget();
  const createBudget = useCreateBudget();
  const categoriesQuery = useGetCategories();

  const categories = categoriesQuery.data || [];
  
  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const onSubmit = (values: {
    name: string;
    amount: number;
    month: Date;
    categoryId?: string | null;
  }) => {
    createBudget.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Budget Goal</SheetTitle>
          <SheetDescription>
            Create a new budget goal to track your spending
          </SheetDescription>
        </SheetHeader>
        <BudgetForm
          onSubmit={onSubmit}
          disabled={createBudget.isPending || categoriesQuery.isLoading}
          categoryOptions={categoryOptions}
          defaultValues={{
            name: "",
            amount: "0",
            month: new Date(),
            categoryId: null,
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

