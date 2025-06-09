import { Typography } from '@repo/landing-ui/src/typography';
import Link from 'next/link';
import { Block } from '@repo/landing-ui/src/block';
import { Button } from '@repo/landing-ui/src/button';
import { Dialog, DialogContent, DialogTrigger } from '@repo/landing-ui/src/dialog';
import dayjs from 'dayjs';
import { Modpack } from './modpack-list';

export const ModpackItem = ({
  name, client, version, id, mods, imageUrl, downloadLink, created_at, shaders,
}: Modpack) => {
  return (
    <Block rounded="big" blockItem size="none" type="column" className="relative gap-y-2">
      <div className="flex flex-col gap-y-4 last:pt-4 justify-between p-4">
        <Typography className="text-xl lg:text-2xl text-[#00cdb0]">
          {name}
        </Typography>
        <div className="flex items-center gap-2">
          <Typography size="lg">
            Клиент: {client}
          </Typography>
          <Typography size="lg" className="text-neutral-400">
            ({version})
          </Typography>
        </div>
        <div className="flex items-center justify-center w-full gap-2">
          <Button
            className="w-full rounded-lg group hover:bg-[#05b458]/80 hover:duration-300
					    duration-100 ease-in-out bg-[#088d47]/80 backdrop-filter backdrop-blur-lg"
          >
            <Link href={downloadLink || ''} target="_blank">
              <Typography size="xl" className="text-white">
                Скачать
              </Typography>
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full rounded-lg group hover:bg-neutral-700/80 hover:duration-300
					    duration-100 ease-in-out bg-neutral-800/80 backdrop-filter backdrop-blur-lg"
              >
                <Typography size="xl" className="text-white">
                  Подробнее
                </Typography>
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-2">
                <Typography size="xl">
                  Моды
                </Typography>
                {!mods && <Typography className="text-neutral-400" size="lg">пусто</Typography>}
                {mods && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {mods.map((mod, idx) =>
                      <div key={idx} className="flex bg-neutral-600/80 px-4 py-1 rounded-[4px]">
                        <Typography size="lg" className="text-white">{mod}</Typography>
                      </div>,
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Typography size="xl">
                  Шейдеры
                </Typography>
                {!shaders && <Typography className="text-neutral-400" size="lg">пусто</Typography>}
                {shaders && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {shaders.map((shader, idx) =>
                      <div key={idx} className="flex bg-neutral-600/80 px-4 py-1 rounded-[4px]">
                        <Typography size="lg" className="text-white">{shader}</Typography>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="self-end">
                <Typography text_color="adaptiveGray" size="md">
                  Создан {dayjs(created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Typography>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div
        className="h-[200px] group bg-cover relative overflow-hidden rounded-xl cursor-pointer"
        style={{ backgroundImage: `url("${imageUrl}")` }}
      >
        <div
          className="translate-y-64 focus:translate-y-0 group-hover:translate-y-0 transition-all ease-in flex flex-col gap-4 px-4
           py-12 absolute bottom-0 right-0 left-0 bg-black/70 backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-y-1">
            <Typography size="lg">
              Моды
            </Typography>
            {!mods && <Typography className="text-neutral-400 text-sm">пусто</Typography>}
            {mods && (
              <div className="flex items-center gap-1 flex-wrap">
                {mods.slice(0, 3).map((mod, idx) =>
                  <div key={idx} className="flex bg-neutral-600/80 px-2 py-0.5 rounded-[4px]">
                    <Typography size="md" className="text-white">{mod}</Typography>
                  </div>,
                )}
                {mods.length >= 3 && (
                  <div className="flex bg-neutral-600/80 px-2 py-0.5 rounded-[4px]">
                    <Typography size="md" className="text-white">+{mods.length - 3}</Typography>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-y-1">
            <Typography size="lg">
              Шейдеры
            </Typography>
            {!shaders && <Typography className="text-neutral-400 text-sm">пусто</Typography>}
            {shaders && (
              <div className="flex items-center gap-1 flex-wrap">
                {shaders.slice(0, 3).map((shader, idx) =>
                  <div key={idx} className="flex bg-neutral-600/80 px-2 py-0.5 rounded-[4px]">
                    <Typography size="md" className="text-white">{shader}</Typography>
                  </div>,
                )}
                {shaders.length >= 3 && (
                  <div className="flex bg-neutral-600/80 px-2 py-0.5 rounded-[4px]">
                    <Typography size="md" className="text-white">+{shaders.length - 3}</Typography>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Block>
  );
};