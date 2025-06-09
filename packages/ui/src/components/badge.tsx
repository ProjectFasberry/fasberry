import { cva, VariantProps } from "class-variance-authority";
import { forwardRef, HTMLAttributes } from "react";

const badgeVariants = cva(
  `flex rounded-md text-[12px]
		text-shark-50 font-normal bg-caribbean-green-600 outline-none border-none`,
  {
    variants: {
      size: {
        small: "px-[4px] py-0",
        medium: "px-4 py-1",
      },
      state: {
        default: "",
        active: "bg-green-600",
      }
    },
    defaultVariants: {
      state: "default",
      size: "small",
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, size, state, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={badgeVariants({ size, state, className })}
        {...props}
      />
    );
  },
);
