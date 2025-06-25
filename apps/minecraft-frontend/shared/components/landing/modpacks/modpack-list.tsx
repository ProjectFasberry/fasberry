import { reatomResource, withCache, withDataAtom, withStatusesAtom } from '@reatom/async';
import { ModpackItem, ModpackItemDialog } from '../modpacks/modpack-item';
import { FORUM_SHARED_API } from '@repo/shared/constants/api';
import { Typography } from '@/shared/ui/typography';
import { Skeleton } from '@/shared/ui/skeleton';
import { reatomComponent } from '@reatom/npm-react';

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

const getModpacks = async () => {
  const res = await FORUM_SHARED_API("get-modpacks")
  const data = await res.json<{ data: Array<Modpack> } | { error: string }>()
  if ("error" in data) return null;
  return data.data
}

const modpacksResource = reatomResource(async (ctx) => {
  return await ctx.schedule(() => getModpacks())
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