import { reatomResource, withCache, withDataAtom, withStatusesAtom } from '@reatom/async';
import { ModpackItem, ModpackItemDialog } from '../modpacks/modpack-item';
import { Typography } from '@repo/ui/typography';
import { Skeleton } from '@repo/ui/skeleton';
import { reatomComponent } from '@reatom/npm-react';
import { BASE } from '@/shared/api/client';

export type Modpack = {
  name: string,
  client: string,
  version: string,
  id: string,
  mods: Array<string>,
  downloadLink: string,
  created_at: string | Date,
  shaders: Array<string>,
  imageUrl: string
}

const modpacksResource = reatomResource(async (ctx) => {
  return await ctx.schedule(async () => {
    const res = await BASE("shared/modpacks", { 
      throwHttpErrors: false, signal: ctx.controller.signal 
    })

    const data = await res.json<{ data: Array<Modpack> } | { error: string }>()
    
    if ("error" in data) return null;

    return data.data
  })
}).pipe(withDataAtom(), withStatusesAtom(), withCache())

const ModpackListNull = () => {
  return (
    <Typography className="text-neutral-400 text-2xl">
      Не удалось загрузить список модпаков. Попробуйте позже
    </Typography>
  );
};

const ModpackListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-rows-2">
      <Skeleton className="w-full h-80" />
      <Skeleton className="w-full h-80" />
      <Skeleton className="w-full h-80" />
      <Skeleton className="w-full h-80" />
    </div>
  );
};

export const ModpackList = reatomComponent(({ ctx }) => {
  const modpacks = ctx.spy(modpacksResource.dataAtom);

  if (ctx.spy(modpacksResource.statusesAtom).isPending) return <ModpackListSkeleton />;
  if (ctx.spy(modpacksResource.statusesAtom).isRejected) return <ModpackListNull />;
  if (!modpacks) return <ModpackListNull />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-rows-2">
      <ModpackItemDialog />
      {modpacks.map(modpack => <ModpackItem key={modpack.id} {...modpack} />)}
    </div>
  );
}, "ModpacksList")