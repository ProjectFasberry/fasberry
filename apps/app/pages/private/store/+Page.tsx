import { DeleteButton, EditButton, ToLink } from "@/shared/components/app/private/components/ui"
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
import { editorExtensions, EditorMenuBar } from "@/shared/components/config/editor"
import { createLink } from "@/shared/components/config/link"
import { startPageEvents } from "@/shared/lib/events"
import { pageContextAtom } from "@/shared/models/page-context.model"
import { action, atom, AtomState } from "@reatom/core"
import { reatomComponent, useUpdate } from "@reatom/npm-react"
import { StoreItem as StoreItemType } from "@repo/shared/types/entities/store"
import { Button } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { Skeleton } from "@repo/ui/skeleton"
import { Typography } from "@repo/ui/typography"
import { IconArrowLeft, IconPlus } from "@tabler/icons-react"
import { PropsWithChildren, ReactNode } from "react"
import { navigate } from "vike/client/router"
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react"
import { belkoinImage, charismImage } from "@/shared/consts/images"
import { appDictionariesAtom } from "@/shared/models/app.model"

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
    <div className="flex items-center border border-neutral-800 gap-2 sm:gap-4 justify-between px-2 sm:px-4 py-2 w-full h-18 rounded-lg">
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
        <div className="flex items-center border border-neutral-800 p-1 rounded-lg gap-1">
          <ToLink
            link={createLink("store", id)}
          />
          <EditButton
            onClick={() => navigate(`/private/store?target=edit&id=${id}`)}
          />
          <DeleteButton
            onClick={() => removeStoreItemBeforeAction(ctx, item)}
          />
        </div>
      </div>
    </div>
  )
}, "StoreItem")

const StoreCreateItem = () => {
  return (
    <Button
      className="h-10 w-fit items-center gap-2 justify-center px-4 border border-neutral-800"
      onClick={() => navigate("/private/store?target=create")}
    >
      <Typography className="font-semibold text-lg text-neutral-50">
        Создать
      </Typography>
      <IconPlus size={18} />
    </Button>
  )
}

const StoreItemsSkeleton = () => {
  return Array.from({ length: 12 }).map((_, idx) => <Skeleton key={idx} className="h-18 w-full" />)
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
      className="flex flex-col gap-4 w-full h-full 
        data-[state=loading]:pointer-events-none data-[state=loading]:opacity-60 data-[state=idle]:pointer-events-auto"
    >
      {children}
    </div>
  )
}, "Wrapper")

const CURRENCY_IMAGE: Record<string, string> = {
  "CHARISM": charismImage,
  "BELKOIN": belkoinImage
}

const EditItem = reatomComponent(({ ctx }) => {
  const data = ctx.spy(editItemAtom);

  const editor = useEditor({
    extensions: editorExtensions,
  })

  useUpdate((ctx) => {
    if (!data) return;
    editor.commands.setContent(data.content as JSONContent)
  }, [data?.content, editor])

  if (ctx.spy(storeItemsAction.statusesAtom).isPending) {
    return <Skeleton className="h-24 w-full" />
  }

  if (!data) {
    return <Typography>Товар не найден</Typography>;
  }

  const { id, content, title, currency, command, imageUrl, price, value, type, description } = data

  if (!content) throw new Error("Content is not defined")

  const currencyTitle = appDictionariesAtom.get(ctx, currency)

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Typography className="text-2xl font-semibold">
        {title}
      </Typography>
      <div className="flex overflow-hidden h-40">
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="object-cover w-auto h-full"
        />
      </div>
      <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 w-full p-2">
        <EditorMenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <div className="flex flex-wrap *:grow *:sm:grow-0 items-center gap-2 w-full justify-start">
        <div className="flex items-center gap-1 border px-2 py-1 border-neutral-800 rounded-lg">
          <Typography className="font-semibold">
            Цена: {price}
          </Typography>
          <img src={CURRENCY_IMAGE[currency]} alt="" width={20} height={20} />
        </div>
        <div className="flex items-center gap-1 border px-2 py-1 border-neutral-800 rounded-lg">
          <Typography className="font-semibold">
            Валюта: {currencyTitle}
          </Typography>
          <img src={CURRENCY_IMAGE[currency]} alt="" width={20} height={20} />
        </div>
        <div className="flex items-center gap-1 border px-2 py-1 border-neutral-800 rounded-lg">
          <Typography className="font-semibold">
            Тип товара: {type}
          </Typography>
        </div>
        <div className="flex items-center gap-1 border px-2 py-1 border-neutral-800 rounded-lg">
          <Typography className="font-semibold">
            Значение товара: {value}
          </Typography>
        </div>
        <div className="flex items-center gap-1 border px-2 py-1 border-neutral-800 rounded-lg">
          <Typography className="font-semibold">
            Команда выдачи товара: {command ?? "нет"}
          </Typography>
        </div>
      </div>
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

const ViewStoreItems = () => (
  <>
    <div className="flex flex-col gap-2 w-full h-full">
      <StoreItems />
    </div>
    <AlertDialog />
  </>
)

const Components = reatomComponent(({ ctx }) => COMPONENTS[ctx.spy(searchParamTargetAtom)], "Components")

const COMPONENTS: Record<string, ReactNode> = {
  "create": <CreateItem />,
  "view": <ViewStoreItems />,
  "edit": <EditItem />
}

const Back = reatomComponent(({ ctx }) => {
  const isVisible = ctx.spy(backIsVisibleAtom)
  if (!isVisible) return null;

  return (
    <Button
      className="p-0 h-8 w-8 aspect-square bg-neutral-800"
      onClick={() => window.history.back()}
    >
      <IconArrowLeft size={16} />
    </Button>
  )
}, "Back")

const Header = reatomComponent(({ ctx }) => {
  const title = ctx.spy(headerTitleAtom);

  return (
    <div className="flex items-center justify-between gap-1 w-full">
      <div className="flex gap-2 items-center justify-start w-full">
        <Back />
        <Typography className='text-lg font-semibold text-neutral-50'>
          {title}
        </Typography>
      </div>
      <StoreCreateItem />
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