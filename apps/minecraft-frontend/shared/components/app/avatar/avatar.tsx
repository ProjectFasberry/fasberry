import { HTMLAttributes } from 'react';
import { tv, VariantProps } from 'tailwind-variants';

const avatarVariants = tv({
  base: `relative rounded-lg border border-shark-600/20`,
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
  url: string | null
}

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof avatarVariants>,
  Avatar {
}

export const Avatar = ({
  className, url, children, withStatus, variant, shadow, propWidth, propHeight, border, nickname, ...props
}: AvatarProps) => {
  if (!url) return null;
  return (
    <div
      className={avatarVariants({ variant, shadow, border, className })}
      {...props}
    >
      <img src={url} width={propWidth} height={propHeight} className="rounded-sm" loading="eager" alt="" />
    </div>
  );
}