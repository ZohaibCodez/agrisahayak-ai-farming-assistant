import { cn } from "@/lib/utils";
import { Loader2, Leaf } from "lucide-react";

export default function LoadingSpinner({ 
  message, 
  className, 
  size = "default",
  variant = "default"
}: { 
  message?: string; 
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "agricultural";
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const textSizeClasses = {
    sm: "text-sm",
    default: "text-base",
    lg: "text-lg"
  };

  if (variant === "agricultural") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4", className)}>
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        {message && (
          <p className={cn("mt-4 text-center text-primary font-medium", textSizeClasses[size])}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center p-2", className)}>
      <Loader2 className={cn("animate-spin text-current", sizeClasses[size])} />
      {message && (
        <p className={cn("ml-3 text-current", textSizeClasses[size])}>
          {message}
        </p>
      )}
    </div>
  );
}
