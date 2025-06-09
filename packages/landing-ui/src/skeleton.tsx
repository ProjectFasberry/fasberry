import { HTMLAttributes } from 'react';
import { cn } from "@repo/lib/cn"

export function Skeleton({
	className, ...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn(`isolate bg-white/10 rounded-lg overflow-hidden shadow-xl shadow-black/5 before:border-t
        before:border-project-color-pink/10 relative
        before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent
        before:via-project-color-pink/10 before:to-transparent`, className)}
			{...props}
		>
			<div
				className={`bg-gradient-to-r from-transparent via-project-color-pink/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]`}
			/>
		</div>
	);
}