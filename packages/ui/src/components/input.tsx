import { forwardRef, InputHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex min-h-10 w-full px-4 py-1 file:border-0 file:bg-transparent file:text-sm font-normal file:font-medium focus-visible:outline-none " +
    "disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-none text-sm text-shark-50 placeholder:text-shark-300",
        minecraft:
          "border-[2px] text-shark-100 rounded-none bg-shark-800 text-sm dark:bg-shark-800 font-[Minecraft] placeholder:text-shark-200",
        form: "h-12 border border-transparent focus-visible:border-caribbean-green-200/40 text-[16px] placeholder:text-shark-300",
      },
      status: {
        default: "border-black/80",
        error: "border-red-400",
      },
      backgroundType: {
        default: "bg-shark-900",
        transparent: "bg-transparent",
      },
      roundedType: {
        none: "rounded-none",
        default: "rounded-[8px]",
      },
    },
    defaultVariants: {
      variant: "default",
      status: "default",
      backgroundType: "default",
    },
  },
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { variant, className, status, backgroundType, roundedType, type, ...props },
    ref,
  ) => {
    return (
      <input
        type={type}
        className={inputVariants({
          variant,
          status,
          backgroundType,
          roundedType,
          className,
        })}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
