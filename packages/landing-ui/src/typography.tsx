import { cn } from "@repo/lib/cn"
import { VariantProps, cva } from "class-variance-authority"
import { HTMLAttributes } from "react";

const typographyVariants = cva("group-hover:duration-100 duration-100 ease-in", {
  variants: {
    variant: {
      page_title: "text-5xl lg:text-6xl xl:text-7xl",
      block_title: "text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl",
      block_paragraph: "text-md lg:text-lg xl:text-xl 2xl:text-2xl text-white",
      block_subtitle: "text-2xl md:text-3xl text-project-color"
    },
    size: {
      md: "text-sm lg:text-md",
      base: "text-base lg:text-lg",
      lg: "text-base lg:text-lg",
      xl: "text-md lg:text-xl",
    },
    text_color: {
      white: "text-white",
      none: "dark:text-white text-white",
      black: "text-black dark:text-white",
      pink: "text-[#FABBFB]",
      dark_red: "text-dark-red",
      red: "text-red",
      gray: "text-neutral-400",
      adaptiveWhiteBlack: "text-black dark:text-white",
      adaptiveGray: "text-neutral-600 dark:text-neutral-400",
      project: "text-project-color"
    },
    position: {
      center: "text-center",
      right: "text-right",
      left: "text-left",
    },
    shadow: {
      none: "text-shadow-none",
      md: "text-shadow-md",
      lg: "text-shadow-lg",
      xl: "text-shadow-xl",
    },
    hover_effects: {
      pink_drop: "dark:group-hover:text-[#FABBFB]",
      fuchsia: "hover:text-fuchsia-400"
    },
    defaultVariants: {
      variant: "block_paragraph",
      shadow: "md"
    }
  }
})

interface TypographyVariantsProps
  extends HTMLAttributes<HTMLParagraphElement>,
  VariantProps<typeof typographyVariants> { }

export const Typography = ({
  className, variant, shadow, position, hover_effects, size, text_color, ...props
}: TypographyVariantsProps) => {
  return (
    <p
      className={cn(typographyVariants({ className, variant, hover_effects, position, text_color, shadow, size }))}
      {...props}
    />
  )
}