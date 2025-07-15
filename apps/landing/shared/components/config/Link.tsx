import { AnchorHTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { usePageContext } from "vike-react/usePageContext";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

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