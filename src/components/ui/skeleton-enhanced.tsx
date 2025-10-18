"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// Enhanced Skeleton Components for different use cases
export function SkeletonCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 shadow-sm", className)} {...props}>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, className, ...props }: { rows?: number } & React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonReportCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)} {...props}>
      <div className="flex items-start space-x-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonDashboard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      {/* Welcome Section */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-6 w-32" />
          <SkeletonReportCard />
          <SkeletonReportCard />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}

export function SkeletonForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-6", className)} {...props}>
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

// Pulse animation for loading states
export function SkeletonPulse({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

// Shimmer effect for enhanced loading
export function SkeletonShimmer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

// Progress skeleton for multi-step processes
export function SkeletonProgress({ steps = 3, currentStep = 1, className, ...props }: { 
  steps?: number; 
  currentStep?: number; 
} & React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center space-x-4">
        {Array.from({ length: steps }).map((_, i) => (
          <React.Fragment key={i}>
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              i < currentStep ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-muted"
            )}>
              {i < currentStep ? (
                <div className="h-4 w-4 rounded-full bg-primary-foreground" />
              ) : (
                <Skeleton className="h-4 w-4 rounded-full" />
              )}
            </div>
            {i < steps - 1 && (
              <div className={cn(
                "h-0.5 w-16",
                i < currentStep ? "bg-primary" : "bg-muted"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}
