import { AnchorHTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { usePageContext } from "vike-react/usePageContext";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

type Links = "land" | "player" | "news" | "store"

const LINKS = (target: string): Record<Links, string> => ({
  "land": `/land/${target}`,
  "player": `/player/${target}`,
  "news": `/news/${target}`,
  "store": `/store/i/${target}`
})

export const createLink = (type: Links, target: string) => LINKS(target)[type]

export function Link({ href, className, ...props }: LinkProps) {
  const pathname = usePageContext().urlPathname;

  const isActive = href ? href === "/" ? pathname === href : pathname.startsWith(href) : false;

  return (
    <a
      href={href}
      data-state={isActive ? "active" : "inactive"}
      className={tv({ base: `data-[state=active]:is-active` })({ className })}
      {...props}
    />
  );
}