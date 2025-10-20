import { RulesRuleItem } from './rules-rule-item';
import { RulesTerminItem } from './rules-termin-item';
import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from '@reatom/async';
import { reatomComponent } from '@reatom/npm-react';
import { Skeleton } from '@repo/ui/skeleton';
import { BASE } from '@/shared/api/client';
import { Typography } from '@repo/ui/typography';

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

const rulesAction = reatomAsync(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await BASE("shared/rules", { signal: ctx.controller.signal, throwHttpErrors: false })
    const data = await res.json<{ data: Rules } | { error: string }>()

    if ("error" in data) return null;

    return data.data
  })
}, "rulesAction").pipe(
  withDataAtom(null),
  withCache({ swr: false }),
  withStatusesAtom()
)

export const RulesListEmpty = () => {
  return <Typography className="text-2xl dark:text-neutral-400 text-neutral-600">Не удалось получить список правил</Typography>
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

export const Rules = reatomComponent(({ ctx }) => {
  const data = ctx.spy(rulesAction.dataAtom);

  if (ctx.spy(rulesAction.statusesAtom).isPending) {
    return <RulesListSkeleton />;
  }

  if (ctx.spy(rulesAction.statusesAtom).isRejected || !data) {
    return <RulesListEmpty />;
  }

  return (
    <div id="rules-list" className="flex flex-col gap-6 w-full h-full">
      <RulesTerminItem {...data.terms} />
      <RulesRuleItem categoryTitle={data.rules.chat.categoryTitle} content={data.rules.chat.content} />
      <RulesRuleItem {...data.rules.game} />
      <RulesRuleItem {...data.rules.based} />
    </div>
  );
}, "Rules")