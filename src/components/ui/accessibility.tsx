"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Screen reader only text
export const SrOnly: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <span className={cn("sr-only", className)}>
    {children}
  </span>
)

// Skip to main content link
export const SkipToMain: React.FC<{ href?: string; children?: React.ReactNode }> = ({
  href = "#main-content",
  children = "Skip to main content"
}) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  >
    {children}
  </a>
)

// Enhanced focus ring component
export const FocusRing: React.FC<{
  children: React.ReactNode
  className?: string
  focusClassName?: string
}> = ({ children, className, focusClassName }) => {
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div
      className={cn(
        "relative",
        isFocused && focusClassName,
        className
      )}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
      {isFocused && (
        <div className="absolute inset-0 rounded-md ring-2 ring-primary ring-offset-2 pointer-events-none" />
      )}
    </div>
  )
}

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    loadingText = "Loading...",
    icon,
    iconPosition = "left",
    ariaLabel,
    ariaDescribedBy,
    className,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variantClasses = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
      ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
    }

    const sizeClasses = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg"
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isDisabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
            <SrOnly>{loadingText}</SrOnly>
            <span aria-hidden="true">{children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="mr-2" aria-hidden="true">
                {icon}
              </span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="ml-2" aria-hidden="true">
                {icon}
              </span>
            )}
          </>
        )}
      </button>
    )
  }
)
AccessibleButton.displayName = "AccessibleButton"

// Accessible card with proper heading structure
interface AccessibleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6
  description?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}

export const AccessibleCard = React.forwardRef<HTMLDivElement, AccessibleCardProps>(
  ({
    title,
    titleLevel = 3,
    description,
    ariaLabel,
    ariaDescribedBy,
    children,
    className,
    ...props
  }, ref) => {
    const HeadingTag = `h${titleLevel}` as keyof JSX.IntrinsicElements

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        role="article"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {(title || description) && (
          <div className="p-6 pb-0">
            {title && (
              <HeadingTag className="text-2xl font-semibold leading-none tracking-tight">
                {title}
              </HeadingTag>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="p-6 pt-4">
          {children}
        </div>
      </div>
    )
  }
)
AccessibleCard.displayName = "AccessibleCard"

// Live region for announcements
export const LiveRegion: React.FC<{
  children: React.ReactNode
  className?: string
  politeness?: "polite" | "assertive" | "off"
}> = ({ children, className, politeness = "polite" }) => (
  <div
    className={cn("sr-only", className)}
    role="status"
    aria-live={politeness}
    aria-atomic="true"
  >
    {children}
  </div>
)

// Accessible form field
interface AccessibleFormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  children,
  className
}) => {
  const fieldId = React.useId()
  const errorId = React.useId()
  const hintId = React.useId()

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      
      <div
        aria-invalid={!!error}
        aria-describedby={cn(
          error ? errorId : undefined,
          hint ? hintId : undefined
        )}
      >
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          "aria-required": required,
          "aria-invalid": !!error,
          "aria-describedby": cn(
            error ? errorId : undefined,
            hint ? hintId : undefined
          )
        })}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Color contrast checker utility
export const getContrastRatio = (color1: string, color2: string): number => {
  // This is a simplified version - in production, you'd want a more robust implementation
  // that handles different color formats and calculates actual luminance values
  return 4.5 // Placeholder - would need actual color parsing and calculation
}

// WCAG compliance checker
export const isWCAGCompliant = (contrastRatio: number, level: "AA" | "AAA" = "AA"): boolean => {
  const thresholds = {
    AA: { normal: 4.5, large: 3 },
    AAA: { normal: 7, large: 4.5 }
  }
  
  return contrastRatio >= thresholds[level].normal
}
