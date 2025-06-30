import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { DivideIcon as LucideIcon } from "lucide-react"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-x-2.5 rounded-tremor-full bg-background px-2.5 py-1.5 text-tremor-label border shadow-sm transition-all duration-200 hover:shadow-md",
  {
    variants: {
      status: {
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        error: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        warning: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        info: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        default: "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
)

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  leftLabel: string
  rightLabel: string
}

export function StatusBadge({
  className,
  status,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftLabel,
  rightLabel,
  ...props
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        {LeftIcon && (
          <LeftIcon 
            className={cn(
              "-ml-0.5 size-4 shrink-0",
              status === "success" && "text-emerald-600 dark:text-emerald-500",
              status === "error" && "text-red-600 dark:text-red-500",
              status === "warning" && "text-amber-600 dark:text-amber-500",
              status === "info" && "text-blue-600 dark:text-blue-500"
            )} 
            aria-hidden={true}
          />
        )}
        {leftLabel}
      </span>
      <span className="h-4 w-px bg-border" />
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        {RightIcon && (
          <RightIcon 
            className="-ml-0.5 size-4 shrink-0" 
            aria-hidden={true}
          />
        )}
        {rightLabel}
      </span>
    </span>
  )
}