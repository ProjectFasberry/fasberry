import { HTMLAttributes } from "react";
import { tv, VariantProps } from "tailwind-variants";

interface LayoutVariantsProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof modernLayoutVars> {}

const modernLayoutVars = tv({
  base: 'min-h-screen',
  variants: {
    variant: {
      default: "responsive mx-auto",
    },
    padding: {
      default: "py-8 lg:py-12",
      small: "py-8"
    }
  },
  defaultVariants: {
    variant: 'default',
    padding: "default"
  }
});

export const MainWrapperPage = ({
  className, variant, padding, ...props
}: LayoutVariantsProps) => {
  return <div className={modernLayoutVars({ variant, padding, className })} {...props} />
}