import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { BudgetForm } from "@/features/budgets/components/budget-form";
import { useCreateBudget } from "@/features/budgets/api/use-create-budget";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const NewBudgetSheet = () => {
  const { isOpen, onClose } = useNewBudget();
  const createBudget = useCreateBudget();
  const categoriesQuery = useGetCategories();
  const categoryMutation = useCreateCategory();

  const categories = categoriesQuery.data || [];
  
  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const onCreateCategory = (name: string) => categoryMutation.mutate({ name });

  const onSubmit = (values: {
    name: string;
    amount: number;
    month: Date;
    categoryId: string;
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
          disabled={createBudget.isPending || categoriesQuery.isLoading || categoryMutation.isPending}
          categoryOptions={categoryOptions}
          onCreateCategory={onCreateCategory}
          defaultValues={{
            name: "",
            amount: "0",
            month: new Date(),
            categoryId: "",
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

