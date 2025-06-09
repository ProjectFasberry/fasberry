import { cva, VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes } from "react";
import { X } from "lucide-react";
import { Button } from "./button.js";

const deleteButtonVariants = cva(
  "rounded-sm items-center duration-150 z-[3] hover:bg-red-800 bg-red-700 justify-center cursor-pointer overflow-hidden flex",
  {
    variants: {
      variant: {
        invisible:
          "md:opacity-0 md:group-hover:opacity-100 absolute top-1 right-1 group-hover:duration-150",
      },
      size: {
        default: "h-1 w-1 p-2",
        small: "h-5 w-5",
        medium: "h-10 w-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type DeleteButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof deleteButtonVariants>

export const DeleteButton = ({
  size, variant, className, ...props
}: DeleteButtonProps) => {
  return (
    <Button className={deleteButtonVariants({ variant, className, size })} {...props}>
      <X size={14} className="text-shark-50" />
    </Button>
  );
};