import MainLayout from "@/components/layout/MainLayout";

export default function Expense() {
  return (
    <MainLayout>
      <div className="mb-8 animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Expense
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage your Expense
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
