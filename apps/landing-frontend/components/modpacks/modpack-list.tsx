'use client';

import { ModpackItem } from '../modpacks/modpack-item';
import { Typography } from '@repo/landing-ui/src/typography';
import { Skeleton } from '@repo/landing-ui/src/skeleton';
import { useQuery } from '@tanstack/react-query';
import { FORUM_SHARED_API } from '@repo/shared/constants/api';

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

  if ("error" in data) {
    return null;
  }

  return data.data
}

const modpacksQuery = () => useQuery({
  queryKey: ["modpacks"],
  queryFn: () => getModpacks(),
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: 2
})

const ModpackListNull = () => {
  return (
    <Typography text_color="adaptiveGray" className="text-2xl">
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

export const ModpackList = () => {
  const { data: modpacks, isLoading, isError } = modpacksQuery();

  if (isLoading) return <ModpackListSkeleton />;
  if (isError) return <ModpackListNull />;
  if (!modpacks) return <ModpackListNull />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 grid-rows-2">
      {modpacks.map(modpack => <ModpackItem key={modpack.id} {...modpack} />)}
    </div>
  );
};