import { ArrowDown } from "lucide-react";

export const MenuArrow = () => {
  return (
    <ArrowDown
      size={20}
      className="transition-all duration-150 ease-in 
        group-data-[state=closed]:rotate-0 group-data-[state=open]:rotate-180 text-shark-300"
    />
  )
}