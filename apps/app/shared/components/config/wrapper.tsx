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
      default: "py-24 lg:py-36",
      small: "py-8"
    }
  },
  defaultVariants: {
    variant: 'default',
    padding: "default"
  }
});

export const MainWrapperPage = ({
  className, variant, ...props
}: LayoutVariantsProps) => {
  return <div className={modernLayoutVars({ variant, className })} {...props} />
}