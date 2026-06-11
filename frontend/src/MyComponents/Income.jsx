import MainLayout from "@/components/layout/MainLayout";

export default function Income() {
  return (
    <MainLayout>
      <div className="mb-8 animate-fade-in flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Income
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track and manage your income
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
