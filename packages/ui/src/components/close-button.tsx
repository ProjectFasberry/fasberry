import { X } from "lucide-react";
import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

const closeButtonVariants = cva(
  `absolute hover:bg-red-600 p-2 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2
 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground`,
  {
    variants: {
      variant: {
        top: "right-4 top-4",
        center: "right-4 top-50",
      },
    },
    defaultVariants: {
      variant: "top",
    },
  },
);

interface CloseButtonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof closeButtonVariants> {}

export const CloseButton = ({
  className,
  variant,
  ...props
}: CloseButtonProps) => {
  return (
    <div className={closeButtonVariants({ className, variant })} {...props}>
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </div>
  );
};
