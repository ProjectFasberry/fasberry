import { UsersFilters, UsersFiltersViewer } from "@/shared/components/app/private/components/users.filters";
import { Users, UsersViewer } from "@/shared/components/app/private/components/users.list";

export default function Page() {
  return (
    <div className="bg-neutral-900 rounded-xl">
      <UsersFilters />
      <UsersFiltersViewer />
      <div className="flex flex-col p-4">
        <Users />
        <UsersViewer />
      </div>
    </div>
  )
}