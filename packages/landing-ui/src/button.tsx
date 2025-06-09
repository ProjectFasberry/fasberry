import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@repo/lib/cn"
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap " +
  "text-sm font-medium ring-offset-background transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: " ",
        blurred: "bg-black/10 z-20 backdrop-filter backdrop-blur-md",
        positive: "bg-[#14a551] hover:bg-[#1bd96a] border border-[#1bd96a]",
        pageLink: "w-full !px-14 group hover:duration-300 duration-100"
      },
      size: {
        default: "px-4 py-3",
        sm: "h-9 rounded-[8px] px-3 py-3",
        lg: "h-11 rounded-[8px] px-8 py-6",
        icon: "h-10 w-10",
      },
      shadow: {
        swipe: "hover:shadow-[inset_24px_0px_0px_#fff] " +
          "hover:bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] " +
          "hover:duration-700 hover:transition transition " +
          "hover:ease-out duration-500"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<
  HTMLButtonElement, ButtonProps
>(({ className, variant, shadow, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shadow, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }