"use client"

import React, {
  ComponentPropsWithoutRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { AnimatePresence, motion, MotionProps, useInView } from "motion/react"

import { cn } from "@/lib/utils"

export function AnimatedListItem({ children }: { children: React.ReactNode }) {
  const animations: MotionProps = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0, opacity: 0 },
    transition: { type: "spring", stiffness: 350, damping: 40 },
  }

  return (
    <motion.div {...animations} layout className="mx-auto w-full">
      {children}
    </motion.div>
  )
}

export interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode
  delay?: number
  initialDelay?: number
  startOnView?: boolean
}

export const AnimatedList = React.memo(
  ({ children, className, delay = 1000, initialDelay = 0, startOnView = true, ...props }: AnimatedListProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(containerRef, { once: true, amount: 0.3 })
    const [index, setIndex] = useState(0)
    const [hasStarted, setHasStarted] = useState(!startOnView)
    const [initialDelayPassed, setInitialDelayPassed] = useState(initialDelay === 0)

    const childrenArray = useMemo(
      () => React.Children.toArray(children),
      [children]
    )

    useEffect(() => {
      if (startOnView && isInView && !hasStarted) {
        setHasStarted(true)
      }
    }, [isInView, startOnView, hasStarted])

    useEffect(() => {
      if (!hasStarted || initialDelayPassed) return
      const timeout = setTimeout(() => {
        setInitialDelayPassed(true)
      }, initialDelay)
      return () => clearTimeout(timeout)
    }, [hasStarted, initialDelay, initialDelayPassed])

    useEffect(() => {
      if (!hasStarted || !initialDelayPassed) return
      if (index < childrenArray.length - 1) {
        const timeout = setTimeout(() => {
          setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length)
        }, delay)

        return () => clearTimeout(timeout)
      }
    }, [index, delay, childrenArray.length, hasStarted, initialDelayPassed])

    const itemsToShow = useMemo(() => {
      if (!hasStarted || !initialDelayPassed) return []
      const result = childrenArray.slice(0, index + 1).reverse()
      return result
    }, [index, childrenArray, hasStarted, initialDelayPassed])

    return (
      <div
        ref={containerRef}
        className={cn(`flex flex-col items-center gap-4`, className)}
        {...props}
      >
        <AnimatePresence>
          {itemsToShow.map((item) => (
            <AnimatedListItem key={(item as React.ReactElement).key}>
              {item}
            </AnimatedListItem>
          ))}
        </AnimatePresence>
      </div>
    )
  }
)

AnimatedList.displayName = "AnimatedList"
