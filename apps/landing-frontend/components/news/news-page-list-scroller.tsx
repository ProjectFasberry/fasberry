"use client"

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useQueryClient } from "@tanstack/react-query";
import { newsFiltrationQuery, useUpdateNews } from "./news-page-search";
import { NewsType } from "./news-item-wrapper";
import { NEWS_QUERY_KEY } from "./news-page-list";

export const NewsPageListInView = () => {
  const qc = useQueryClient()
  const { ref, inView } = useInView({ threshold: 1 })
  const { data: { hasNextPage } } = newsFiltrationQuery()
  const { updateNewsMutation } = useUpdateNews()

  useEffect(() => {
    if (inView && hasNextPage) {
      const cursor = qc.getQueryData<{ data: NewsType[], meta: { endCursor?: string }}>(NEWS_QUERY_KEY)?.meta?.endCursor

      updateNewsMutation.mutate({ cursor })
    }
  }, [inView, hasNextPage]);

  return hasNextPage && <div ref={ref} className="h-[1px] w-full border" />
}