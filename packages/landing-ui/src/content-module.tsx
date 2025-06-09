import { VariantProps, cva } from "class-variance-authority"
import { TabsContent } from "./tabs"
import { HTMLAttributes } from 'react';

const contentModuleVariants = cva("data-[state=active]:flex data-[state=inactive]:hidden flex-col gap-y-4 overflow-x-auto", {
  variants: {
    variant: {
      started: "items-start",
      centered: "items-center"
    },
    defaultVariant: {
      variant: "started",
    }
  }
})

export interface ContentModule
  extends HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof contentModuleVariants> {
  id: string,
  value: string,
}

export const ContentModule = ({ 
  id, value, className, variant, ...props
}: ContentModule) => {
  return (
    <TabsContent
      id={id}
      value={value}
      className={contentModuleVariants({ className, variant })} 
      {...props}
    />
  )
}