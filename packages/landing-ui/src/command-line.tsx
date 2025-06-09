import { cn } from "@repo/lib/cn"
import { VariantProps, cva } from "class-variance-authority"
import { HTMLAttributes } from 'react';

const commandLineVariants = cva("p-1 cursor-pointer inline-flex", {
  variants: {
    variant: {
      default: "px-2 py-1 rounded-md bg-neutral-600 dark:bg-neutral-800 text-white"
    },
    padding: {
      normal: "px-4 py-2",
      big: "px-6 py-4",
    },
  },
  defaultVariants: {
    variant: "default"
  }
})

export interface CommandLineProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof commandLineVariants> {}

export const CommandLine = ({
  className, variant, padding, children, ...props
}: CommandLineProps) => {
  return (
    <span className={cn(commandLineVariants({ variant, padding }), className)} {...props}>
      {children}
    </span>
  )
}