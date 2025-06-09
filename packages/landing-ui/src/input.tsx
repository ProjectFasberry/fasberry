import { cn } from "@repo/lib/cn"
import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<
  HTMLInputElement, InputProps
>(({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex min-h-8 lg:min-h-12 w-full " +
          "rounded-[8px] border-2 text-background-dark/80 dark:text-neutral-50 dark:bg-background-dark/80 border-neutral-300 " +
          "dark:border-neutral-600 focus:border-[#fabbfb] focus:dark:border-[#fabbfb] px-2 py-2 lg:py-4 ring-offset-background " +
          " placeholder:text-neutral-400 dark:placeholder:text-neutral-400 outline-none " +
          " focus:duration-300 focus-visible:duration-300 duration-300 " +
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }