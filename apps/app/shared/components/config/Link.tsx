import { AnchorHTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { usePageContext } from "vike-react/usePageContext";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

const LINKS = (target: string | number) => ({
  "land": `/land/${target}`,
  "player": `/player/${target}`,
  "news": `/news/${target}`,
  "store": `/store/i/${target}`
})

export const createLink = (type: keyof ReturnType<typeof LINKS>, target: string | number) => LINKS(target)[type]

export function Link({ href, className, ...props }: LinkProps) {
  const pathname = usePageContext().urlPathname;

  const isActive = href ? href === "/" ? pathname === href : pathname.startsWith(href) : false;
  const isIdentity = href === pathname

  return (
    <a
      href={href}
      data-state={isActive ? "active" : "inactive"}
      style={isIdentity ? { pointerEvents: 'none' } : {}}
      onClick={(e) => {
        if (isIdentity) {
          e.preventDefault();
        }
      }}
      className={tv({ base: `data-[state=active]:is-active` })({ className })}
      {...props}
    />
  );
}