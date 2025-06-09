import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@repo/lib/utils/ui/cn.ts";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

const Separator = forwardRef<
  ElementRef<typeof SeparatorPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-shark-600",
        orientation === "horizontal"
          ? "h-[1px] w-full"
          : "h-full min-h-[16px] w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
