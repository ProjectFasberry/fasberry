import { ArrowDown, ArrowUp } from "lucide-react";
import { reatomComponent } from "@reatom/npm-react";
import { tv, VariantProps } from "tailwind-variants";
import { InputHTMLAttributes } from "react";
import { newsFilterAtom, updateNewsAction } from "./news.model";

const inputVariants = tv({
	base: `flex min-h-10 w-full px-4 py-1 file:border-0 file:bg-transparent file:text-sm font-normal file:font-medium focus-visible:outline-none " +
	"disabled:cursor-not-allowed disabled:opacity-50`,
	variants: {
		variant: {
			default: "border-none text-sm text-neutral-50 placeholder:text-neutral-300",
			minecraft:
				"border-[2px] text-neutral-100 rounded-none bg-neutral-800 text-sm dark:bg-neutral-800 font-[Minecraft] placeholder:text-neutral-200",
			form: "h-12 border border-transparent focus-visible:border-caribbean-green-200/40 text-[16px] placeholder:text-neutral-300",
		},
		status: {
			default: "border-black/80",
			error: "border-red-400",
		},
		background: {
			default: "bg-shark-900",
			transparent: "bg-transparent",
		},
		rounded: {
			none: "rounded-none",
			default: "rounded-[8px]",
		},
	},
	defaultVariants: {
		variant: "default",
		status: "default",
		background: "default",
	},
},
);

export interface InputProps
	extends InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> { }

export const Input = ({ variant, className, status, background, rounded, type, ...props }: InputProps) => {
	return (
		<input
			type={type}
			className={inputVariants({ variant, status, background, rounded, className })}
			{...props}
		/>
	);
}

export const NewsPageSearch = reatomComponent(({ ctx }) => {
	const { searchQuery, ascending } = ctx.spy(newsFilterAtom)

	return (
		<div className="flex w-full gap-4 items-center">
			<div
				onClick={() => updateNewsAction(ctx, { ascending: !ascending })}
				className="flex rounded-[8px] cursor-pointer aspect-square p-4 border-neutral-600 border-2  
				text-neutral-50 bg-background-dark/80"
			>
				{ascending
					? <ArrowUp className="text-neutral-400" />
					: <ArrowDown className="text-neutral-400" />
				}
			</div>
			<Input
				placeholder="Добавлены"
				className="p-6"
				onChange={e => updateNewsAction(ctx, { searchQuery: e.target.value })}
				value={searchQuery}
				maxLength={1000}
			/>
		</div>
	)
}, "NewsPageSearch")