import { Skeleton } from "@/design-system/components/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-24">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-3/4 max-w-md" />
        <Skeleton className="h-4 w-2/3 max-w-lg" />
        <div className="flex gap-3">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    </main>
  );
}
