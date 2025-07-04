import { HTMLAttributes } from 'react';
import { tv, VariantProps } from 'tailwind-variants';
import { reatomComponent, useUpdate } from '@reatom/npm-react';
import { reatomAsync } from '@reatom/async';
import { Skeleton } from '@repo/ui/skeleton';
import { getSkinDetails } from '../skin/models/skin.model';
import { atom } from '@reatom/core';

const avatarVariants = tv({
  base: `relative rounded-lg border border-neutral-600/20`,
  variants: {
    variant: {
      default: 'max-w-[68px] max-h-[68px]',
    }
  },
});

interface Avatar {
  withStatus?: boolean,
  propHeight?: number;
  propWidth?: number;
  nickname: string;
}

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof avatarVariants>, Avatar {
}

const avatarsUrls = atom<Record<string, string>>({}, "avatarUrls")
const avatarsIsLoading = atom<Record<string, boolean>>({}, "avatarUrls")

const selectAvatar = (target: string) => atom((ctx) => {
  const value = ctx.spy(avatarsUrls)[target]
  return value
}, `${target}.avatar`)

const selectAvatarStatus = (target: string) => atom((ctx) => {
  const value = ctx.spy(avatarsIsLoading)[target]
  return value
}, `${target}.avatarStatus`)

const avatarAction = reatomAsync(async (ctx, nickname: string) => {
  const cache = ctx.get(selectAvatar(nickname))

  if (cache) {
    return { target: nickname, url: cache }
  }

  avatarsIsLoading(ctx, (state) => ({ ...state, [nickname]: true }))

  const url = await ctx.schedule(() => getSkinDetails({ type: "head", nickname }))

  return { url, target: nickname }
}, {
  name: "avatarAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const { url, target } = res

    avatarsUrls(ctx, (state) => ({ ...state, [target]: url }))
    avatarsIsLoading(ctx, (state) => ({ ...state, [target]: false }))
  }
})

const SyncAvatar = ({ nickname }: { nickname: string }) => {
  useUpdate((ctx) => avatarAction(ctx, nickname), [nickname])
  return null;
}

export const Avatar = reatomComponent<AvatarProps>(({ ctx, ...values }) => {
  return (
    <>
      <SyncAvatar nickname={values.nickname} />
      <AvatarImage {...values} />
    </>
  )
}, "AvatarImage")

const AvatarImage = reatomComponent<AvatarProps>(({
  ctx, className, children, withStatus, variant, propWidth, propHeight, nickname, ...props
}) => {
  const url = ctx.spy(selectAvatar(nickname))
  const isLoading = ctx.spy(selectAvatarStatus(nickname))

  if (isLoading) {
    return <Skeleton style={{ height: propHeight, width: propWidth }} />
  }

  return (
    <div
      className={avatarVariants({ variant, className })} style={{ height: propHeight, width: propWidth }} {...props}
    >
      <img
        src={url}
        width={propWidth}
        height={propHeight}
        className={`rounded-sm`}
        loading="eager"
        alt=""
      />
    </div>
  );
}, "Avatar")