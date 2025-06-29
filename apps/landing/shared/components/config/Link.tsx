import { HTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { usePageContext } from "vike-react/usePageContext";

type LinkProps = HTMLAttributes<HTMLAnchorElement> & {
  href: string
}

export function Link({ href, className, ...props }: LinkProps) {
  const pathname = usePageContext().urlPathname;

  const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <a
      href={href}
      data-state={isActive ? "active" : "inactive"}
      className={tv({ base: `data-[state=active]:is-active` })({ className })}
      {...props}
    />
  );
}