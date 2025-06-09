import { forwardRef, ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@repo/landing-ui/src/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type DialogWrapperProps = {
	trigger: ReactNode,
	content: ReactNode,
	classNames?: Partial<{
		trigger: string,
		content: string
	}>,
	triggerAsChild?: boolean,
	title: string
}

export const DialogWrapper = forwardRef<HTMLButtonElement, DialogWrapperProps>(({
	trigger, content, classNames, triggerAsChild, title
}, ref) => {
	return (
		<Dialog>
			<DialogTrigger asChild={triggerAsChild} className={classNames?.trigger} ref={ref}>
				{trigger}
			</DialogTrigger>
			<DialogContent className={classNames?.content}>
				<VisuallyHidden>
					<DialogTitle>{title}</DialogTitle>
				</VisuallyHidden>
				{content}
			</DialogContent>
		</Dialog>
	)
})