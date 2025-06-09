import { cva, VariantProps } from 'class-variance-authority';
import { forwardRef, HTMLAttributes } from 'react';
import { userAvatarQuery } from '../queries/avatar-query';

const avatarVariants = cva('relative rounded-lg border border-shark-600/20', {
  variants: {
    variant: {
      default: 'max-w-[68px] max-h-[68px]',
      page: 'max-w-[256px] max-h-[256px]',
    },
    border: {
      withBorder: 'border-[1px] border-shark-300/30',
    },
    shadow: {
      default: 'shadow-md shadow-black/70',
    },
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
  VariantProps<typeof avatarVariants>,
  Avatar {
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(({
  className, children, withStatus, variant, shadow, propWidth, propHeight, border, nickname, ...props
}, ref) => {
  const { data: avatarUrl } = userAvatarQuery(nickname);

  return (
    <div
      className={avatarVariants({ variant, shadow, border, className })}
      ref={ref}
      {...props}
    >
      <img src={avatarUrl} width={propWidth} height={propHeight} className="rounded-sm" loading="eager" alt="" />
    </div>
  );
});