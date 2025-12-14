import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import { cn } from "@repo/shared/lib/cn"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        `peer border-neutral-800 data-[state=checked]:bg-neutral-600 data-[state=checked]:text-neutral-50
        data-[state=checked]:border-neutral-600 
        focus-visible:border-neutral-600 focus-visible:ring-neutral-700/50 aria-invalid:ring-red-600/20 
        aria-invalid:border-red-600 size-4 shrink-0 
        rounded-[4px] transition-shadow outline-none focus-visible:ring-[3px] 
        disabled:cursor-not-allowed disabled:opacity-50`,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
