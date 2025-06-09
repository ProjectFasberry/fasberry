import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/landing-ui/src/tooltip";
import { forwardRef, ReactNode } from "react";

type TooltipWrapperProps = {
	trigger: ReactNode,
	content: ReactNode
} & {
	classNames?: Partial<{
		trigger: string,
		content: string
	}>
}

export const TooltipWrapper = forwardRef<HTMLButtonElement, TooltipWrapperProps>(({
	trigger, content, classNames, ...props
}, ref) => {
	return (
		<Tooltip delayDuration={1}>
			<TooltipTrigger ref={ref} className={classNames?.trigger}>
				{trigger}
			</TooltipTrigger>
			<TooltipContent className={classNames?.content}>
				{content}
			</TooltipContent>
		</Tooltip>
	)
})