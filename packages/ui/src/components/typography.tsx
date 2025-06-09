import { cva, VariantProps } from "class-variance-authority";
import { HTMLAttributes } from "react";

const typographyVariants = cva("whitespace-wrap", {
  variants: {
    variant: {
      sectionTitle: "text-xl",
      pageTitle: "",
      dialogTitle: "text-xl font-medium text-shark-50 truncate",
      dialogSubtitle: "text-base font-normal text-shark-50 truncate",
      subtitle: "",
      link: "underline underline-offset-4 cursor-pointer",
    },
    font: {
      default: "",
      pixy: "font-[Pixy]",
      minecraft: "font-[Minecraft]",
    },
    textSize: {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
      big: "text-xl",
      very_big: "text-2xl",
    },
    textColor: {
      shark_white: "text-shark-50",
      shark_black: "text-shark-800",
      white: "text-white",
      black: "text-black",
      pink: "text-pink",
      purple: "text-purple",
      gray: "text-shark-300",
    },
    textShadow: {
      small: "[text-shadow:_1px_1px_0_rgb(0_0_0_/_10%)]",
      medium: "[text-shadow:_1px_2px_0_rgb(0_0_0_/_30%)]",
      big: "[text-shadow:_1px_1px_0_rgb(0_0_0_/_50%)]",
    },
    state: {
      default: "",
      active: "text-caribbean-green-500",
    },
  },
});

export interface TypographyProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof typographyVariants> {}

export const Typography = ({
  variant,
  className,
  font,
  state,
  textSize,
  textShadow,
  textColor,
  ...props
}: TypographyProps) => {
  return (
    <p
      className={typographyVariants({
        variant,
        font,
        textSize,
        state,
        textShadow,
        textColor,
        className,
      })}
      {...props}
    />
  );
};
