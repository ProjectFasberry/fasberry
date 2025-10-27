import { Registrations, RegistrationsSettings } from "@/shared/components/app/private/components/analytics";

export default function Page() {
  return (
    <>
      <div className="flex flex-col gap-8 bg-neutral-900 rounded-xl p-4 w-full h-full">
        <Registrations />
        <RegistrationsSettings />
      </div>
    </>
  )
}