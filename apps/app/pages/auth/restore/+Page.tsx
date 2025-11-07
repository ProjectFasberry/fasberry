import { Button } from "@repo/ui/button"

const Restore = () => {
  return (
    <div className="flex flex-col gap-4 w-full p-3 sm:p-4 lg:p-6 max-w-xl border rounded-lg border-neutral-800
    data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60">
      <Button className="text-lg font-semibold bg-neutral-800">
        Продолжить
      </Button>
    </div>
  )
}

export default function Page() {
  return (
    <div className="flex flex-col gap-4 h-dvh items-center justify-center w-full">
      <Restore />
    </div>
  )
}