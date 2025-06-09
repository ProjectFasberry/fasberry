'use client';

import { NewsItemWrapper } from '../news/news-item-wrapper';
import Link from 'next/link';
import { Typography } from '@repo/landing-ui/src/typography';
import { Skeleton } from '@repo/landing-ui/src/skeleton';
import { newsQuery } from './news-page-list';

export const NewsList = () => {
  const { data, isLoading } = newsQuery({ limit: 4, ascending: true });

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </>
    )
  }

  const news = data?.data

  return (
    <div className="flex flex-col gap-6">
      {!news && (
        <Typography text_color="adaptiveGray" className="text-2xl">
          Новостей пока нет :/
        </Typography>
      )}
      {news && (
        <>
          {news.map(i => (
            <NewsItemWrapper key={i.id} {...i} />
          ))}
          {news.length > 3 && (
            <Link href="/news">
              <Typography text_color="adaptiveGray" className="font-bold text-2xl">
                Показать больше
              </Typography>
            </Link>
          )}
        </>
      )}
    </div>
  );
};