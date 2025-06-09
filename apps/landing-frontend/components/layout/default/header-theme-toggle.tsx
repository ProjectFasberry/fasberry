"use client"

import { useTheme } from "next-themes";
import { Typography } from "@repo/landing-ui/src/typography";
import { TooltipWrapper } from "#components/wrappers/tooltip-wrapper";
import { toast } from "sonner"

export const ThemeToggle = () => {
	const { setTheme, theme } = useTheme();
	
	const handleTheme = () => {
		if (theme === 'light') {
			toast.info(`Изменена тема на темную!`)
			
			setTheme("dark")
		} else if (theme === 'dark') {
			toast.info(`Изменена тема на светлую!`)
			
			setTheme("light")
		}
	}
	
	if (!theme) return null;
	
	return (
		<TooltipWrapper
			trigger={
				<img
					onClick={handleTheme}
					src={`/images/minecraft/icons/${theme === 'dark' ? 'white_baloon' : 'black_baloon'}.webp`}
					width={36}
					height={36}
					loading="eager"
					alt=""
				/>
			}
			content={
				<Typography className="text-neutral-400" size="md">
					{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
				</Typography>
			}
		/>
	)
}