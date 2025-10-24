import { Link } from "@/shared/components/config/link"
import { Button } from "@repo/ui/button"
import { IconArrowRight, IconPencil, IconX } from "@tabler/icons-react"
import { ButtonHTMLAttributes } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const DeleteButton = (props: ButtonProps) => {
  return (
    <Button
      className="h-6 w-6 aspect-square p-0 bg-neutral-800"
      {...props}
    >
      <IconX size={18} />
    </Button>
  )
}

export const EditButton = (props: ButtonProps) => {
  return (
    <Button
      className="h-6 w-6 aspect-square p-0 bg-neutral-800"
      {...props}
    >
      <IconPencil size={18} />
    </Button>
  )
}

export const ToLink = ({ link }: { link: string }) => {
  return (
    <Link
      href={link}
      className="flex items-center justify-center rounded-md h-6 w-6 aspect-square p-0 bg-neutral-800"
    >
      <IconArrowRight size={18} className="-rotate-45" />
    </Link>
  )
}