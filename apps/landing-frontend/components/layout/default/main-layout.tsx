import { forwardRef, HTMLAttributes, } from "react"
import { VariantProps, cva } from "class-variance-authority"
import { cn } from "@repo/lib/cn"

const layoutVariants = cva("min-h-screen", {
	variants: {
		variant: {
			default: "responsive mx-auto py-24 lg:py-36",
			with_section: "w-full"
		},
	},
	defaultVariants: {
		variant: "default",
	}
})

interface LayoutVariantsProps
	extends HTMLAttributes<HTMLDivElement>,
	VariantProps<typeof layoutVariants> {
}

export const MainLayoutPage = forwardRef<HTMLDivElement, LayoutVariantsProps>(({
	className, variant, ...props
}, ref) => {
	return <div ref={ref} className={cn(layoutVariants({ variant, }))}{...props} />
})