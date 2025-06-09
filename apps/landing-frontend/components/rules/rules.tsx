'use client';

import { Typography } from '@repo/landing-ui/src/typography';
import { RulesRuleItem } from '../rules/rules-rule-item';
import { RulesTerminItem } from '../rules/rules-termin-item';
import { Skeleton } from '@repo/landing-ui/src/skeleton';
import { useQuery } from "@tanstack/react-query";
import { FORUM_SHARED_API } from '@repo/shared/constants/api';

type Rules = {
  rules: {
    chat: {
      categoryTitle: string;
      content: any[];
    },
    game: {
      categoryTitle: string;
      content: any[];
    },
    based: {
      categoryTitle: string;
      content: any[];
    }
  };
  terms: {
    categoryTitle: string;
    content: {
      id: number;
      article_desc: string;
      article_title: string;
    }[];
  };
}

async function getRules() {
  const res = await FORUM_SHARED_API("get-rules")
  const data = await res.json<{ data: Rules } | { error: string }>()

  if ("error" in data) {
    return null;
  }

  return data.data
}

const rulesQuery = () => useQuery({
  queryKey: ["rules"],
  queryFn: () => getRules(),
  refetchOnWindowFocus: false,
  refetchOnMount: false
})

export const RulesListNull = () => {
  return (
    <Typography text_color="adaptiveGray" className="text-2xl">
      Не удалось получить правила. Попробуйте позже
    </Typography>
  );
};

const RulesListSkeleton = () => {
  return (
    <div id="rules-list" className="flex flex-col gap-6 w-full h-full">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
};

export const Rules = () => {
  const { data, isLoading, isError } = rulesQuery();

  if (isLoading) return <RulesListSkeleton />;
  if (isError) return <RulesListNull />;
  if (!data) return <RulesListNull />;

  return (
    <div id="rules-list" className="flex flex-col gap-6 w-full h-full">
      <RulesTerminItem {...data.terms} />
      <RulesRuleItem categoryTitle={data.rules.chat.categoryTitle} content={data.rules.chat.content} />
      <RulesRuleItem {...data.rules.game} />
      <RulesRuleItem {...data.rules.based} />
    </div>
  );
};