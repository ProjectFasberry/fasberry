import { HTMLAttributes } from 'react';
import { tv, VariantProps } from 'tailwind-variants';
import { reatomComponent, useUpdate } from '@reatom/npm-react';
import { Skeleton } from '@repo/ui/skeleton';
import { avatarAction, avatarsAtom, getAvatar, getAvatarState } from '../models/avatar.model';
import { getStaticImage } from '@/shared/lib/volume-helpers';

export const avatarVariants = tv({
  base: `relative rounded-lg aspect-square border border-neutral-800/20`,
  variants: {
    variant: {
      default: 'min-h-16 min-w-16 w-16 h-16 max-w-16 max-h-16',
    }
  },
})

interface AvatarProps extends HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof avatarVariants> {
  withStatus?: boolean,
  propHeight?: number;
  propWidth?: number;
  nickname: string;
}

const AvatarImage = reatomComponent<AvatarProps>(({
  ctx, className, children, withStatus, variant, propWidth, propHeight, nickname, ...props
}) => {
  const url = ctx.spy(getAvatar(nickname))
  const isLoading = ctx.spy(getAvatarState(nickname))

  if (!url || isLoading) {
    return <Skeleton style={{ height: propHeight, width: propWidth }} />
  }

  return (
    <div
      className={avatarVariants({ variant, className })}
      style={{ height: propHeight, width: propWidth }}
      {...props}
    >
      <img
        src={url}
        width={propWidth}
        height={propHeight}
        className="rounded-sm"
        loading="eager"
        alt=""
        onError={() => avatarsAtom.set(ctx, nickname, getStaticImage("fallback/steve_head.png"))}
      />
    </div>
  );
}, "AvatarImage")

export const Avatar = reatomComponent<AvatarProps>(({ ctx, ...values }) => {
  const nickname = values.nickname;

  useUpdate((ctx) => avatarAction(ctx, nickname), [nickname])

  return <AvatarImage {...values} />
}, "Avatar")