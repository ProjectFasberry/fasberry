import { reatomComponent, useUpdate } from "@reatom/npm-react";
import {
  actionsTargetAtom,
  actionsTypeAtom,
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
import { AtomState } from "@reatom/core";
import { ReactNode } from "react";
import { DeleteButton, EditButton, ToLink } from "./ui";

const CreateNewsSubmit = reatomComponent(({ ctx }) => {
  const isDisabled = !ctx.spy(createNewsIsValidAtom) || ctx.spy(createNewsAction.statusesAtom).isPending;

  return (
    <Button
      disabled={isDisabled}
      onClick={() => createNewsAction(ctx)}
      className="w-fit px-4 bg-neutral-50"
    >
      <Typography className="text-lg font-semibold text-neutral-950">
        Создать новость
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
    <div className="flex flex-col gap-2">
      <CreateNewsTitle />
      <CreateNewsDesc />
      <CreateNewsImage />
      <div className="flex flex-col gap-2 w-full">
        <CreateNewsContent />
        <CreateNewsContentApply />
      </div>
      <CreateNewsSubmit />
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

const CreateNews = reatomComponent(({ ctx }) => {
  return (
    <Button
      onClick={() => createActionsLink(ctx, { parent: "news", type: "create" })}
      className="w-full border border-neutral-800 rounded-lg text-neutral-50 font-semibold text-lg"
    >
      Создать новость
    </Button>
  )
}, "CreateNews")


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

  return data.map(news => <NewsListItem key={news.id} {...news} />)
}, "NewsList")

const NewsView = () => {
  return (
    <>
      <NewsList />
      <CreateNews />
    </>
  )
}

const NEWS_VARIANTS: Record<AtomState<typeof actionsTypeAtom>, ReactNode> = {
  "create": <CreateNewsForm />,
  "edit": <EditNewsForm />,
  "view": <NewsView />
}

export const NewsWrapper = reatomComponent(({ ctx }) => NEWS_VARIANTS[ctx.spy(actionsTypeAtom)], "NewsWrapper")