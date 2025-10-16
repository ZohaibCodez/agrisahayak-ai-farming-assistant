import { cn } from "@/lib/utils";

export default function LoadingSpinner({ message, className }: { message?: string, className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-2", className)}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
      {message && <p className="ml-3 text-current">{message}</p>}
    </div>
  );
}
