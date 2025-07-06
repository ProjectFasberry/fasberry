import { Modpack } from './modpack-list';
import { Typography } from '@repo/ui/typography';
import { dayjs } from '@/shared/lib/create-dayjs';
import { Dialog, DialogContent } from '@repo/ui/dialog';
import { reatomComponent } from '@reatom/npm-react';
import { action, atom } from '@reatom/core';
import { withReset } from '@reatom/framework';
import { Button } from '@repo/ui/button';

const selectedModpackItem = atom<Modpack | null>(null, "selectedModpackItem").pipe(withReset())
const selectedModpackDialogIsOpen = atom(false, "selectedModpackDialogIsOpen")

const openModpackMore = action((ctx, values: Modpack) => {
  selectedModpackItem(ctx, values)
  selectedModpackDialogIsOpen(ctx, true)
})

selectedModpackDialogIsOpen.onChange((ctx, target) => {
  if (!target) {
    selectedModpackItem.reset(ctx)
  }
})

export const ModpackItemDialog = reatomComponent(({ ctx }) => {
  const modpack = ctx.spy(selectedModpackItem)
  if (!modpack) return null;

  const { mods, shaders, created_at } = modpack

  const formattedCreatedAt = dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')

  return (
    <Dialog
      open={ctx.spy(selectedModpackDialogIsOpen)}
      onOpenChange={v => selectedModpackDialogIsOpen(ctx, v)}
    >
      <DialogContent className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-2">
          <Typography className="text-xl">Моды</Typography>
          {!mods && <Typography color="gray" className="text-lg">пусто</Typography>}
          {mods && (
            <div className="flex items-center gap-2 flex-wrap">
              {mods.map((mod, idx) =>
                <div key={idx} className="flex bg-neutral-600/80 px-4 py-1 rounded-[4px]">
                  <Typography className="text-lg text-white">{mod}</Typography>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Typography className='text-xl'>Шейдеры</Typography>
          {!shaders && <Typography color="gray" className="text-lg">пусто</Typography>}
          {shaders && (
            <div className="flex items-center gap-2 flex-wrap">
              {shaders.map((shader, idx) =>
                <div key={idx} className="flex bg-neutral-600/80 px-4 py-1 rounded-[4px]">
                  <Typography color="white" className="text-lg">{shader}</Typography>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="self-end">
          <Typography color="gray" className='text-md'>Создан {formattedCreatedAt}</Typography>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "ModpackItemDialog")

export const ModpackItem = reatomComponent<Modpack>(({ ctx, ...values }) => {
  const { version, client, name, mods, shaders, downloadLink, imageUrl } = values

  return (
    <div className="flex flex-col rounded-xl gap-4 justify-between h-full bg-neutral-950 p-4 relative">
      <div className="flex flex-col gap-2 justify-between grow">
        <Typography className="text-xl lg:text-2xl text-project-color">{name}</Typography>
        <div className="flex items-center gap-2">
          <Typography color="white" className='text-lg'>Клиент: {client}</Typography>
          <Typography color="gray" className="text-lg">({version})</Typography>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-2">
          <a href={downloadLink} target="_blank" rel="noreferrer" className='w-full md:w-1/2'>
            <Button variant="minecraft" className="py-0.5 w-full">
              <Typography color="white" className="text-xl">Скачать</Typography>
            </Button>
          </a>
          <Button
            variant="minecraft"
            onClick={() => openModpackMore(ctx, values)}
            className="w-full py-0.5 md:w-1/2"
          >
            <Typography color="white" className="text-xl">Подробнее</Typography>
          </Button>
        </div>
      </div>
      <div
        className="h-[200px] group bg-cover relative overflow-hidden rounded-xl cursor-pointer"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        <div
          className="flex flex-col gap-4 px-4 py-12 translate-y-64 focus:translate-y-0 group-hover:translate-y-0
            absolute bottom-0 right-0 left-0 bg-black/70 backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-y-1">
            <Typography className='text-lg'>Моды</Typography>
            {!mods && <Typography color="gray" className="text-sm">пусто</Typography>}
            {mods && (
              <div className="flex items-center gap-1 flex-wrap">
                {mods.slice(0, 3).map((mod, idx) =>
                  <div key={idx} className="flex bg-neutral-600/80 px-2 py-0.5 rounded-[4px]">
                    <Typography color="white" className="text-md">{mod}</Typography>
                  </div>
                )}
                {(mods.length >= 3) && (
                  <div className="flex bg-neutral-600/80 px-2 py-0.5 rounded-[4px]">
                    <Typography color="white" className="text-md">+{mods.length - 3}</Typography>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Typography className='text-lg'>Шейдеры</Typography>
            {(shaders.length <= 0) && <Typography color="gray" className="text-sm">пусто</Typography>}
            {(shaders && shaders.length > 0) && (
              <div className="flex items-center gap-1 flex-wrap">
                {shaders.slice(0, 3).map((shader, idx) =>
                  <div key={idx} className="flex bg-neutral-600/80 px-2 py-0.5 rounded-[4px]">
                    <Typography color="white" className="text-md">{shader}</Typography>
                  </div>,
                )}
                {shaders.length >= 3 && (
                  <div className="flex bg-neutral-600/80 px-2 py-0.5 rounded-[4px]">
                    <Typography color="white" className="text-md">+{shaders.length - 3}</Typography>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, "ModpackItem")