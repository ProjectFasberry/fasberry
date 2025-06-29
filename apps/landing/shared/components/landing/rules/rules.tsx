import { RulesRuleItem } from './rules-rule-item';
import { RulesTerminItem } from './rules-termin-item';
import { FORUM_SHARED_API } from '@repo/shared/constants/api';
import { reatomResource, withCache, withDataAtom, withStatusesAtom } from '@reatom/async';
import { reatomComponent } from '@reatom/npm-react';
import { Skeleton } from '@repo/ui/skeleton';

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
  if ("error" in data) return null;
  return data.data
}

const rulesResource = reatomResource(async (ctx) => {
  return await ctx.schedule(() => getRules())
}, "rulesResource").pipe(withDataAtom(), withCache(), withStatusesAtom())

export const RulesListNull = () => {
  return (
    <p className="text-2xl dark:text-neutral-400 text-neutral-600">
      Не удалось получить правила. Попробуйте позже
    </p>
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

export const Rules = reatomComponent(({ ctx }) => {
  const data = ctx.spy(rulesResource.dataAtom);

  if (ctx.spy(rulesResource.statusesAtom).isPending) return <RulesListSkeleton />;
  if (ctx.spy(rulesResource.statusesAtom).isRejected) return <RulesListNull />;
  if (!data) return <RulesListNull />;

  return (
    <div id="rules-list" className="flex flex-col gap-6 w-full h-full">
      <RulesTerminItem {...data.terms} />
      <RulesRuleItem categoryTitle={data.rules.chat.categoryTitle} content={data.rules.chat.content} />
      <RulesRuleItem {...data.rules.game} />
      <RulesRuleItem {...data.rules.based} />
    </div>
  );
}, "Rules")