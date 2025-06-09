"use client"

import React from "react";
import { Input } from "@repo/landing-ui/src/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";
import { z } from "zod/v4";
import { getNews, getNewsSchema, News, NEWS_QUERY_KEY } from "./news-page-list";

export const NEWS_FILTRATION_QUERY_KEY = ['news-filtration'];

export type NewsFiltrationQuery = z.infer<typeof getNewsSchema> & {
	hasNextPage: boolean
}

export const newsFiltrationQuery = () => useQuery<NewsFiltrationQuery, Error>({
	queryKey: NEWS_FILTRATION_QUERY_KEY,
	initialData: {
		searchQuery: "",
		ascending: false,
		limit: 12,
		hasNextPage: false
	}
})

export const useUpdateNews = () => {
	const qc = useQueryClient()
	const { data: filtrationData } = newsFiltrationQuery()

	const updateNewsMutation = useMutation({
		mutationFn: async (val: Partial<NewsFiltrationQuery>) => {
			qc.setQueryData(NEWS_FILTRATION_QUERY_KEY, (prev: NewsFiltrationQuery) => ({
				...prev, ...val
			}))

			return await getNews({ ...filtrationData, ...val })
		},
		onSuccess: async (data) => {
			if (!data) {
				return qc.setQueryData(NEWS_QUERY_KEY, (prev: News) => prev)
			}

			qc.setQueryData(NEWS_QUERY_KEY, () => data)
		}
	})

	return { updateNewsMutation }
}

export const NewsPageSearch = () => {
	const { updateNewsMutation } = useUpdateNews()
	const { data: { searchQuery, ascending } } = newsFiltrationQuery()

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target

		updateNewsMutation.mutate({ searchQuery: value })
	}

	return (
		<div className="flex w-full gap-4 items-center">
			<div
				onClick={() => updateNewsMutation.mutate({ ascending: !ascending })}
				className="flex rounded-[8px] cursor-pointer aspect-square p-4 dark:border-neutral-600 border-2 text-background-dark/80 
				dark:text-neutral-50 dark:bg-background-dark/80 border-neutral-300"
			>
				{ascending
					? <ArrowUp className="text-neutral-400" />
					: <ArrowDown className="text-neutral-400" />
				}
			</div>
			<Input
				placeholder="Добавлены"
				className="p-6"
				onChange={handleSearch}
				value={searchQuery}
				maxLength={1000}
			/>
		</div>
	)
}