import { reatomComponent, useUpdate } from "@reatom/npm-react";
import {
  getIsSelectedActionAtom,
  ActionParent,
  actionsGoBackAction,
  actionsParentAtom,
  actionsTargetAtom,
  actionsTypeAtom,
  ActionType,
  createActionsLink,
  createNewsAction,
  createNewsContentAtom,
  createNewsContentIsValidAtom,
  createNewsDescriptionAtom,
  createNewsImageAtom,
  createNewsIsValidAtom,
  createNewsTempContentAtom,
  createNewsTitleAtom,
  deleteNewsAction,
  newsListAction
} from "../models/actions.model";
import { Skeleton } from "@repo/ui/skeleton";
import { Avatar } from "../../avatar/components/avatar";
import { createLink, Link } from "@/shared/components/config/link";
import { Typography } from "@repo/ui/typography";
import { Button } from "@repo/ui/button";
import { News } from "@repo/shared/types/entities/news";
import { Input } from "@repo/ui/input";
import { editorExtensions, EditorMenuBar } from "@/shared/components/config/editor";
import { EditorContent, generateJSON, useEditor } from "@tiptap/react";
import { Placeholder } from "@tiptap/extensions";
import { toast } from "sonner";
import { atom, AtomState } from "@reatom/core";
import { ReactNode } from "react";
import { DeleteButton, EditButton, ToLink } from "./ui";
import { IconPlus, IconX } from "@tabler/icons-react";

const CreateNewsSubmit = reatomComponent(({ ctx }) => {
  const isDisabled = !ctx.spy(createNewsIsValidAtom) || ctx.spy(createNewsAction.statusesAtom).isPending;

  return (
    <Button
      disabled={isDisabled}
      onClick={() => createNewsAction(ctx)}
      className="px-4 bg-neutral-50"
    >
      <Typography className="text-lg font-semibold text-neutral-950">
        Создать
      </Typography>
    </Button>
  )
}, "CreateNewsSubmit")

const CreateNewsContentApply = reatomComponent(({ ctx }) => {
  const handle = () => {
    const contentStr = ctx.get(createNewsTempContentAtom)

    if (!contentStr) {
      console.warn("Content is empty")
      return
    }

    const json = generateJSON(contentStr, editorExtensions)

    createNewsContentAtom(ctx, json);
    toast.success("Изменения применены")
  }

  const isDisabled = !ctx.spy(createNewsContentIsValidAtom)

  return (
    <Button
      onClick={handle}
      disabled={isDisabled}
      className="self-start bg-neutral-50 text-neutral-950 px-2 w-fit"
    >
      Сохранить
    </Button>
  )
}, "CreateNewsContentApply")

const CreateNewsContent = reatomComponent(({ ctx }) => {
  const editor = useEditor({
    extensions: [
      ...editorExtensions,
      Placeholder.configure({
        placeholder: 'Напишите что-нибудь...',
      }),
    ],
    onUpdate: ({ editor }) => {
      createNewsTempContentAtom(ctx, editor.getHTML())
    }
  })

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <EditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}, "CreateNewsContent")

const CreateNewsTitle = reatomComponent(({ ctx }) => {
  return (
    <Input
      placeholder="Заголовок"
      value={ctx.spy(createNewsTitleAtom)}
      onChange={(e) => createNewsTitleAtom(ctx, e.target.value)}
    />
  )
}, "CreateNewsTitle")

const CreateNewsDesc = reatomComponent(({ ctx }) => {
  return (
    <Input
      placeholder="Описание"
      value={ctx.spy(createNewsDescriptionAtom)}
      onChange={(e) => createNewsDescriptionAtom(ctx, e.target.value)}
    />
  )
}, "CreateNewsDesc")

const CreateNewsImage = reatomComponent(({ ctx }) => {
  return (
    <Input
      placeholder="Изображение"
      value={ctx.spy(createNewsImageAtom)}
      onChange={e => createNewsImageAtom(ctx, e.target.value)}
    />
  )
}, "CreateNewsImage")

const CreateNewsForm = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <CreateNewsTitle />
      <CreateNewsDesc />
      <CreateNewsImage />
      <div className="flex flex-col gap-2 w-full">
        <CreateNewsContent />
        <CreateNewsContentApply />
      </div>
      <div className="w-fit">
        <CreateNewsSubmit />
      </div>
    </div>
  )
}

const EditNewsForm = reatomComponent(({ ctx }) => {
  const id = ctx.get(actionsTargetAtom);
  if (!id) {
    console.warn("Actions target is not defined")
    return null;
  }

  const targetEditItem = ctx.get(newsListAction.dataAtom)?.data.find(target => target.id === Number(id))
  if (!targetEditItem) {
    return <Typography>Выбранный объект не найден</Typography>
  }

  return (
    <div>
      {targetEditItem.title}
    </div>
  )
})

const NewsListItem = reatomComponent<News>(({ ctx, id, title, imageUrl, creator }) => {
  return (
    <div
      className="flex h-22 border border-neutral-800 p-2 
        rounded-lg overflow-hidden items-center gap-2 justify-between w-full"
    >
      <div className="flex items-center gap-2">
        <img
          src={imageUrl!}
          alt={title}
          draggable={false}
          className="h-18 w-28 rounded-lg select-none object-cover"
        />
        <div className="flex flex-col items-start gap-1">
          <Typography className="font-semibold">
            {title}
          </Typography>
          <div className="flex items-center gap-3 w-full justify-start">
            <Link
              href={createLink("player", creator)}
              className="flex items-center border border-neutral-800 p-1 rounded-lg gap-1"
            >
              <Avatar nickname={creator} propWidth={18} propHeight={18} />
              <Typography>
                {creator}
              </Typography>
            </Link>
            <div className="flex items-center border border-neutral-800 p-1 rounded-lg gap-1">
              <ToLink
                link={createLink("news", id)}
              />
              <EditButton
                onClick={() => createActionsLink(ctx, { parent: "news", type: "edit", target: id.toString() })}
              />
              <DeleteButton
                onClick={() => deleteNewsAction(ctx, id)}
                disabled={ctx.spy(deleteNewsAction.statusesAtom).isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}, "NewsListItem")

const NewsList = reatomComponent(({ ctx }) => {
  useUpdate(newsListAction, [])

  const data = ctx.spy(newsListAction.dataAtom)?.data;

  if (ctx.spy(newsListAction.statusesAtom).isPending) {
    return <Skeleton className="h-16 w-full" />
  }

  if (!data) return null;

  return (
    <div className="flex flex-col w-full gap-2 h-full">
      {data.map(news => <NewsListItem key={news.id} {...news} />)}
    </div>
  )
}, "NewsList")

const NEWS_VARIANTS: Record<AtomState<typeof actionsTypeAtom>, ReactNode> = {
  "create": <CreateNewsForm />,
  "edit": <EditNewsForm />,
  "view": <NewsList />
}

export const getSelectedParentAtom = (parent: ActionParent) => atom((ctx) => ctx.spy(actionsParentAtom) === parent)

export const NewsWrapper = reatomComponent(({ ctx }) => {
  if (!ctx.spy(getSelectedParentAtom("news"))) {
    return NEWS_VARIANTS["view"]
  }

  return NEWS_VARIANTS[ctx.spy(actionsTypeAtom)]
}, "NewsWrapper")

export const CreateNews = () => <ToActionButtonX title="Создать" parent="news" type="create" />
export const EditNews = () => <ToActionButtonX parent="news" type="edit" />

export const ToActionButtonX = reatomComponent<{
  parent: ActionParent, type: ActionType, title?: string
}>(({
  ctx, parent, type, title
}) => {
  const isSelected = ctx.spy(getIsSelectedActionAtom(parent, type));

  const handle = () => {
    if (isSelected) {
      actionsGoBackAction(ctx)
    } else {
      createActionsLink(ctx, { parent, type })
    }
  }

  if (!isSelected && type === 'edit') return null;

  return (
    <Button
      onClick={handle}
      data-state={isSelected ? "selected" : "default"}
      className="
        h-8 min-w-8 gap-2 border border-neutral-800 rounded-lg font-semibold text-lg
        data-[state=selected]:text-neutral-950 data-[state=selected]:bg-neutral-50 data-[state=selected]:p-0
        data-[state=default]:text-neutral-50 data-[state=default]:bg-transparent data-[state=default]:px-4
      "
    >
      {isSelected ? null : title}
      {isSelected ? <IconX size={18} /> : <IconPlus size={18} />}
    </Button>
  )
}, "ToActionButtonX")