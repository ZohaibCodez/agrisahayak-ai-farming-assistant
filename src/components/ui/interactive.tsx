"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Enhanced Button with better press animations
interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  pressEffect?: boolean
  rippleEffect?: boolean
}

export const InteractiveButton = React.forwardRef<HTMLButtonElement, InteractiveButtonProps>(
  ({ className, variant = "default", size = "default", pressEffect = true, rippleEffect = true, children, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false)
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([])

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (pressEffect) {
        setIsPressed(true)
      }
      
      if (rippleEffect) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const newRipple = { id: Date.now(), x, y }
        
        setRipples(prev => [...prev, newRipple])
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
      }
      
      props.onMouseDown?.(e)
    }

    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (pressEffect) {
        setIsPressed(false)
      }
      props.onMouseUp?.(e)
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (pressEffect) {
        setIsPressed(false)
      }
      props.onMouseLeave?.(e)
    }

    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          pressEffect && "active:scale-95",
          isPressed && "scale-95",
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
        {rippleEffect && ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute pointer-events-none animate-ping"
            style={{
              left: ripple.x - 4,
              top: ripple.y - 4,
              width: 8,
              height: 8,
              backgroundColor: 'currentColor',
              opacity: 0.3,
              borderRadius: '50%',
            }}
          />
        ))}
      </button>
    )
  }
)
InteractiveButton.displayName = "InteractiveButton"

// Enhanced Card with hover effects
interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  clickable?: boolean
  pressEffect?: boolean
}

export const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, hoverEffect = true, clickable = false, pressEffect = false, children, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false)

    const handleMouseDown = () => {
      if (pressEffect) {
        setIsPressed(true)
      }
    }

    const handleMouseUp = () => {
      if (pressEffect) {
        setIsPressed(false)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-300",
          hoverEffect && "hover:shadow-lg hover:scale-[1.02]",
          clickable && "cursor-pointer",
          pressEffect && "active:scale-95",
          isPressed && "scale-95",
          className
        )}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {children}
      </div>
    )
  }
)
InteractiveCard.displayName = "InteractiveCard"

// Scroll-triggered animation wrapper
interface ScrollAnimationProps {
  children: React.ReactNode
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scaleIn"
  delay?: number
  duration?: number
  threshold?: number
  className?: string
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = "fadeIn",
  delay = 0,
  duration = 500,
  threshold = 0.1,
  className
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay, threshold])

  const animationClasses = {
    fadeIn: "opacity-0 translate-y-4",
    slideUp: "opacity-0 translate-y-8",
    slideLeft: "opacity-0 translate-x-8",
    slideRight: "opacity-0 -translate-x-8",
    scaleIn: "opacity-0 scale-95"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        isVisible ? "opacity-100 translate-y-0 translate-x-0 scale-100" : animationClasses[animation],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Touch gesture handler
interface TouchGestureProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  children: React.ReactNode
  className?: string
}

export const TouchGesture: React.FC<TouchGestureProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  children,
  className
}) => {
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number } | null>(null)
  const [initialDistance, setInitialDistance] = React.useState<number | null>(null)

  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })

    if (e.targetTouches.length === 2) {
      const distance = Math.hypot(
        e.targetTouches[0].clientX - e.targetTouches[1].clientX,
        e.targetTouches[0].clientY - e.targetTouches[1].clientY
      )
      setInitialDistance(distance)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })

    if (e.targetTouches.length === 2 && initialDistance) {
      const distance = Math.hypot(
        e.targetTouches[0].clientX - e.targetTouches[1].clientX,
        e.targetTouches[0].clientY - e.targetTouches[1].clientY
      )
      const scale = distance / initialDistance
      onPinch?.(scale)
    }
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const deltaX = touchStart.x - touchEnd.x
    const deltaY = touchStart.y - touchEnd.y

    const isLeftSwipe = deltaX > minSwipeDistance
    const isRightSwipe = deltaX < -minSwipeDistance
    const isUpSwipe = deltaY > minSwipeDistance
    const isDownSwipe = deltaY < -minSwipeDistance

    if (isLeftSwipe) onSwipeLeft?.()
    if (isRightSwipe) onSwipeRight?.()
    if (isUpSwipe) onSwipeUp?.()
    if (isDownSwipe) onSwipeDown?.()
  }

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

// Focus trap for modals and dropdowns
export const FocusTrap: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => container.removeEventListener('keydown', handleTabKey)
  }, [])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
