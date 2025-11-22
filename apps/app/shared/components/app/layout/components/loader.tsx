import { Typography } from "@repo/ui/typography";
import { useEffect } from "react";

export type LoaderProps = { title: string, subtitle?: string }

export const LoaderNode = ({ title, subtitle }: LoaderProps) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 fixed inset-0 bg-black/60 pointer-events-auto overflow-hidden z-[100] items-center justify-center h-full w-full">
      <div className="ui-loader loader-blk">
        <svg viewBox="22 22 44 44" className="multiColor-loader">
          <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation">
          </circle>
        </svg>
      </div>
      <Typography className="font-semibold text-xl">
        {title}
      </Typography>
      {subtitle && (
        <Typography className="text-sm text-neutral-400">
          {subtitle}
        </Typography>
      )}
    </div>
  )
}