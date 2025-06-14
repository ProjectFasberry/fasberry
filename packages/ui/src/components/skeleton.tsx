import { cn } from "@repo/lib/cn";
import { HTMLAttributes } from "react";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        `isolate bg-secondary-color rounded-lg overflow-hidden shadow-xl shadow-black/5 before:border-t
        before:border-green-500 relative
        before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_3s_infinite] before:bg-gradient-to-r before:from-transparent
        before:via-green-500/20 before:to-transparent`,
        className,
      )}
      {...props}
    >
      <div
        className={`bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]`}
      />
    </div>
  );
}
