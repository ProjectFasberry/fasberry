import { HTMLAttributes } from "react";
import { tv, VariantProps } from "tailwind-variants";

export const typographyVariants = tv({
  base: "",
  variants: {
    variant: {
      "page-title": "text-5xl lg:text-6xl xl:text-7xl",
      block_title: "text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl",
      block_paragraph: "text-md lg:text-lg xl:text-xl 2xl:text-2xl text-white",
      block_subtitle: "text-2xl md:text-3xl text-project-color"
    },
    shadow: {
      none: "text-shadow-none",
      md: "text-shadow-md",
      lg: "text-shadow-lg",
      xl: "text-shadow-xl",
    },
    color: {
      "gray": "text-neutral-400",
      "black": "text-black",
      "white": "text-white"
    }
  }
})

type TypographyProps = HTMLAttributes<HTMLParagraphElement> & VariantProps<typeof typographyVariants>

export const Typography = ({ className, shadow, variant, color, ...props }: TypographyProps) => {
  return (
    <p className={typographyVariants({ variant, shadow, color, className })} {...props} />
  )
}