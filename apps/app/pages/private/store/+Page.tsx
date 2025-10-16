import { 
  createStoreItemAction, 
  createStoreItemFormSchema, 
  editItemAtom, 
  editStoreItemAction, 
  removeStoreItemAction, 
  removeStoreItemBeforeAction, 
  searchParamsAtom, 
  searchParamTargetAtom, 
  storeItemsAction 
} from "@/shared/components/app/private/models/store.model"
import { AlertDialog } from "@/shared/components/config/alert-dialog"
import { startPageEvents } from "@/shared/lib/events"
import { pageContextAtom } from "@/shared/models/global.model"
import { action, atom, AtomState } from "@reatom/core"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { StoreItem as StoreItemType } from "@repo/shared/types/entities/store"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { IconArrowLeft, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
import { PropsWithChildren, ReactNode } from "react"
import { navigate } from "vike/client/router"

const events = action((ctx) => {
  const pageContext = ctx.get(pageContextAtom)
  if (!pageContext) return;

  const search = pageContext.urlParsed.search;

  storeItemsAction(ctx)
  searchParamsAtom(ctx, search)
})

const titles: Record<AtomState<typeof searchParamTargetAtom>, string> = {
  "create": "Создание товара",
  "edit": "Редактирование товара",
  "view": "Просмотр товаров"
}

const headerTitleAtom = atom((ctx) => titles[ctx.spy(searchParamTargetAtom)], "headerTitle")
const backIsVisibleAtom = atom((ctx) => !!ctx.spy(searchParamTargetAtom), "backIsVisible")

const StoreItem = reatomComponent<StoreItemType>(({ ctx, imageUrl, summary, description, title, id, ...base }) => {
  const item = { imageUrl, summary, description, title, id, ...base }

  return (
    <div className="flex items-center bg-neutral-900 gap-2 sm:gap-4 justify-between px-2 sm:px-4 py-2 w-full h-12 rounded-lg">
      <div className="flex items-center gap-2 overflow-hidden">
        <img src={imageUrl} alt="" className="hidden sm:block object-cover min-h-10 min-w-10 h-10 w-10" />
        <div className="flex flex-col min-w-0 w-full">
          <Typography className="text-nowrap truncate ">
            {title}
          </Typography>
          <Typography className='text-neutral-400 text-sm text-nowrap truncate'>
            {summary}
          </Typography>
        </div>
      </div>
      <div className="flex items-center gap-2 h-full w-fit">
        <Button
          className="h-10 w-10 p-1 bg-neutral-50 text-neutral-950 font-semibold text-lg"
          onClick={() => navigate(`/private/store?target=edit&id=${id}`)}
        >
          <IconPencil />
        </Button>
        <Button
          className="h-10 w-10 p-1 bg-red-500 text-neutral-50 font-semibold text-lg"
          onClick={() => removeStoreItemBeforeAction(ctx, item)}
        >
          <IconTrash />
        </Button>
      </div>
    </div>
  )
}, "StoreItem")

const StoreCreateItem = () => {
  return (
    <Button
      className="h-10 w-full items-center gap-2 justify-center p-1 bg-neutral-900
        border-2 border-neutral-700 text-neutral-50 font-semibold text-lg"
      onClick={() => navigate("/private/store?target=create")}
    >
      <Typography>Создать</Typography>
      <IconPlus size={18} />
    </Button>
  )
}

const StoreItemsSkeleton = () => {
  return (
    <>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </>
  )
}

const StoreItems = reatomComponent(({ ctx }) => {
  const data = ctx.spy(storeItemsAction.dataAtom)?.data;

  if (ctx.spy(storeItemsAction.statusesAtom).isPending) {
    return <StoreItemsSkeleton />
  }

  if (!data) return null;

  return data.map((item) => <StoreItem key={item.id} {...item} />)
}, "StoreItems")

const Wrapper = reatomComponent<PropsWithChildren>(({ ctx, children }) => {
  const isLoading =
    ctx.spy(removeStoreItemAction.statusesAtom).isPending ||
    ctx.spy(editStoreItemAction.statusesAtom).isPending ||
    ctx.spy(createStoreItemAction.statusesAtom).isPending;

  return (
    <div
      data-state={isLoading ? "loading" : "idle"}
      className="flex flex-col gap-1 w-full h-full 
        data-[state=loading]:pointer-events-none data-[state=loading]:opacity-60 data-[state=idle]:pointer-events-auto"
    >
      {children}
    </div>
  )
}, "Wrapper")

const EditItem = reatomComponent(({ ctx }) => {
  const data = ctx.spy(editItemAtom);
  if (!data) return <Typography>Товар не найден</Typography>;

  const { id } = data

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <Typography>
        {data.title}
      </Typography>
      <Typography>
        {data.summary}
      </Typography>
      <Button
        onClick={() => editStoreItemAction(ctx, id)}
        disabled={ctx.spy(editStoreItemAction.statusesAtom).isPending}
        className="bg-neutral-50 text-neutral-950 font-semibold text-lg self-end"
      >
        Применить изменения
      </Button>
    </div>
  )
}, "EditItem")

const CreateItem = reatomComponent(({ ctx }) => {
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {createStoreItemFormSchema.map((field, i) => {
        switch (field.type) {
          case "input":
            return (
              <Input
                key={i}
                value={field.value(ctx)}
                onChange={e => field.onChange(ctx, e)}
                placeholder={field.placeholder}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}, "CreateItem")

const DefaultComponent = () => (
  <>
    <StoreItems />
    <AlertDialog />
    <StoreCreateItem />
  </>
)

const Components = reatomComponent(({ ctx }) => {
  const target = ctx.spy(searchParamTargetAtom);
  return target ? COMPONENTS[target] ?? <DefaultComponent /> : <DefaultComponent />
}, "Components")

const COMPONENTS: Record<string, ReactNode> = {
  "create": <CreateItem />,
  "view": <DefaultComponent />,
  "edit": <EditItem />
}

const Back = reatomComponent(({ ctx }) => {
  const isVisible = ctx.spy(backIsVisibleAtom)
  if (!isVisible) return null;

  return (
    <Button
      className="rounded-full p-1 h-10 w-10 aspect-square bg-neutral-900"
      onClick={() => window.history.back()}
    >
      <IconArrowLeft size={20} />
    </Button>
  )
}, "Back")

const Header = reatomComponent(({ ctx }) => {
  const title = ctx.spy(headerTitleAtom);

  return (
    <div className="flex gap-4 items-center justify-start w-full">
      <Back />
      <Typography className='text-lg font-semibold text-neutral-50'>
        {title}
      </Typography>
    </div>
  )
}, "Header")

export default function Page() {
  useUpdate((ctx) => startPageEvents(ctx, events), [pageContextAtom]);

  return (
    <Wrapper>
      <Header />
      <Components />
    </Wrapper>
  )
}