import { cn } from "@/lib/utils";
import { Loader2, Leaf, Sparkles, Zap } from "lucide-react";

export default function LoadingSpinner({ 
  message, 
  className, 
  size = "default",
  variant = "default",
  showProgress = false,
  progress = 0
}: {
  message?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "agricultural" | "sparkle" | "pulse";
  showProgress?: boolean;
  progress?: number;
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
        {showProgress && (
          <div className="mt-4 w-48">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === "sparkle") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4", className)}>
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="h-3 w-3 text-primary animate-bounce" />
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

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4", className)}>
        <div className="relative">
          <div className="animate-pulse rounded-full h-12 w-12 bg-primary/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
        {message && (
          <p className={cn("mt-4 text-center text-primary font-medium animate-pulse", textSizeClasses[size])}>
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
