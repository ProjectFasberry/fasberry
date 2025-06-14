import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { usePageContext } from "vike-react/usePageContext";

export function Link({ href, children, className }: { href: string; children: ReactNode, className?: string }) {
  const urlPathname = usePageContext().urlPathname;
  
  const isActive = href === "/" ? urlPathname === href : urlPathname.startsWith(href);

  return (
    <a href={href} data-state={isActive ? "active" : "inactive"} className={cn(`data-[state=active]:is-active`, className)}>
      {children}
    </a>
  );
}