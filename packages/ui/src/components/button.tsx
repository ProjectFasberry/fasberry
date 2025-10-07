import { ButtonHTMLAttributes } from "react"
import { tv, VariantProps } from "tailwind-variants"

const buttonVariants = tv({
  base: `inline-flex px-4 py-2 cursor-pointer items-center justify-center
    disabled:select-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 
  `,
  variants: {
    variant: {
      default: "rounded-md active:scale-[0.98] duration-300 ease-in-out",
      minecraft: "rounded-none button"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export const Button = ({ className, variant, ...props }: ButtonProps) => {
  return (
    <button className={buttonVariants({ className, variant })} {...props} />
  )
}