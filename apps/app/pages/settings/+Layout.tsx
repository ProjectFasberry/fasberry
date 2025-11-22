import { SETTINGS_NAVIGATION } from "@/shared/components/app/settings/models/settings.model";
import { Link } from "@/shared/components/config/link";
import { Typography } from "@repo/ui/typography";
import { ReactNode } from "react";

const Navigation = () => {
  return (
    Object.entries(SETTINGS_NAVIGATION).map(([key, section]) => (
      <div key={key} className="flex flex-col gap-2">
        <h2 className="font-semibold text-sm text-neutral-400 uppercase">
          {section.title}
        </h2>
        <div className="flex flex-col gap-2">
          {section.nodes.map((node) => (
            <Link
              key={node.href}
              href={node.href}
              className="
                flex items-center justify-start rounded-lg px-2 py-1 
                  data-[state=active]:bg-neutral-700 data-[state=inactive]:hover:bg-neutral-700
              "
            >
              <Typography className="font-medium truncate">
                {node.title}
              </Typography>
            </Link>
          ))}
        </div>
      </div>
    ))
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start w-full gap-4 h-full">
      <div className="flex flex-col gap-8 h-full sticky top-2 w-1/4">
        <Navigation />
      </div>
      <div className="flex flex-col w-3/4 h-full">
        {children}
      </div>
    </div>
  )
}