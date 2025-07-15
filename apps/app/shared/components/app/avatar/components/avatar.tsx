import { HTMLAttributes } from 'react';
import { tv, VariantProps } from 'tailwind-variants';
import { reatomComponent, useUpdate } from '@reatom/npm-react';
import { Skeleton } from '@repo/ui/skeleton';
import { avatarAction, selectAvatar, selectAvatarStatus } from '../models/avatar.model';

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
      className={avatarVariants({ variant, className })}
      style={{ height: propHeight, width: propWidth }}
      {...props}
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