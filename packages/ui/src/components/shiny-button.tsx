import React from "react";
import { cn } from "@repo/lib/utils/ui/cn.ts";

interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
}

export const PulsatingButton = React.forwardRef<
  HTMLButtonElement,
  PulsatingButtonProps
>(
  (
    {
      className,
      children,
      pulseColor = "#9567eb",
      duration = "3.5s",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-gradient-to-tr from-green-400 via-green-500 to-biloba-flower-300 px-4 py-2 text-center text-shark-50",
          className,
        )}
        style={
          {
            "--pulse-color": pulseColor,
            "--duration": duration,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className="relative z-10">{children}</div>
        <div className="absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-lg bg-biloba-flower-700" />
      </button>
    );
  },
);

PulsatingButton.displayName = "PulsatingButton";