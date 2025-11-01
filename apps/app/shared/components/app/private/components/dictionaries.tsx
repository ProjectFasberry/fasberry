import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { 
  dictionariesCreateAction, 
  dictionariesDeleteAction, 
  dictionariesEditAction, 
  dictionariesEditKeyAtom, 
  dictionariesEditValueAtom, 
  DictionariesItem, 
  dictionariesListAction 
} from "../models/dictionaries.model";
import { Typography } from "@repo/ui/typography";
import { ActionButton, DeleteButton, EditButton } from "./ui";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { useState } from "react";

type DictionariesListItemProps = Omit<DictionariesItem, "key"> & {
  itemKey: string
}

const DictionariesCreate = reatomComponent(({ ctx }) => {
  return (
    <Button
      className="gap-2 border h-8 border-neutral-800"
      disabled={ctx.spy(dictionariesCreateAction.statusesAtom).isPending}
      onClick={() => dictionariesCreateAction(ctx)}
    >
      Создать
      <IconPlus size={16} />
    </Button>
  )
}, "DictionariesCreate")

const DictionariesListItem = reatomComponent<DictionariesListItemProps>(({ ctx, id, itemKey, value }) => {
  const [isEdit, setIsEdit] = useState(false)

  return (
    <div className="flex justify-between items-center gap-1 p-2 border border-neutral-800 rounded-lg">
      <div className="flex items-center gap-2">
        {isEdit ? (
          <Input
            value={ctx.spy(dictionariesEditKeyAtom) ?? itemKey}
            onChange={e => dictionariesEditKeyAtom(ctx, e.target.value)}
            className="h-6"
          />
        ) : (
          <Typography className="text-neutral-400 text-sm">
            [{itemKey}]
          </Typography>
        )}
        {isEdit ? (
          <Input
            value={ctx.spy(dictionariesEditValueAtom) ?? value}
            onChange={e => dictionariesEditValueAtom(ctx, e.target.value)}
            className="h-6"
          />
        ) : (
          <Typography>
            {value}
          </Typography>
        )}
      </div>
      <div className="flex items-center gap-1">
        <EditButton
          disabled={ctx.spy(dictionariesEditAction.statusesAtom).isPending}
          onClick={() => setIsEdit((state) => !state)}
        />
        {isEdit ? (
          <ActionButton
            variant="selected"
            onClick={() => dictionariesEditAction(ctx, id)}
            icon={IconCheck}
          />
        ) : (
          <DeleteButton
            disabled={ctx.spy(dictionariesDeleteAction.statusesAtom).isPending}
            onClick={() => dictionariesDeleteAction(ctx, id)}
          />
        )}
      </div>
    </div >
  )
}, "DictionariesListItem")

export const DictionariesHeader = reatomComponent(({ ctx }) => {
  return (
    <div className="flex items-center justify-between w-full">
      <Typography className="text-xl font-bold">
        Справочник
      </Typography>
      <DictionariesCreate />
    </div>
  )
})

export const DictionariesList = reatomComponent(({ ctx }) => {
  useUpdate(dictionariesListAction, [])

  const data = ctx.spy(dictionariesListAction.dataAtom)

  if (ctx.spy(dictionariesListAction.statusesAtom).isPending) {
    return null;
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      {data.map((o) => <DictionariesListItem key={o.id} itemKey={o.key} value={o.value} created_at={o.created_at} id={o.id} />)}
    </div>
  )
}, "DictionariesList")

export const Dictionaries = () => {
  return (
    <>
      <DictionariesList />
    </>
  )
}