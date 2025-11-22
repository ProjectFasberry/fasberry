import { useUpdate } from "@reatom/npm-react";
import { clientOnly } from "vike-react/clientOnly";
import { playerAtom, userParamAtom } from "../models/player.model";
import { action, atom } from "@reatom/core";
import { withInit } from "@reatom/framework";
import { tv } from "tailwind-variants";
import { skinAction } from "../../player/models/skin.model";
import { skinViewerAtom } from "../../player/models/skin-animation.model";
import { reatomComponent } from "@reatom/npm-react";
import { Skeleton } from "@repo/ui/skeleton";
import { Typography } from "@repo/ui/typography";
import { HTMLAttributes } from "react";
import { skinRotatingAtom, skinAnimationAtom, SKIN_ANIMATIONS } from "../../player/models/skin-animation.model";
import { VariantProps } from "tailwind-variants";
import { IconRotate } from "@tabler/icons-react";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { API_PREFIX_URL } from "@/shared/env";
import { isClientAtom } from "@/shared/models/page-context.model";

const ReactSkinview3d = clientOnly(() => import("react-skinview3d").then(m => m.ReactSkinview3d))

const SkinRenderSkeleton = () => {
  return (
    <div className="flex items-center justify-center w-2/3 rounded-lg h-[390px]">
      <Skeleton className="w-full h-full" />
    </div>
  )
}

const SkinRender = reatomComponent(({ ctx }) => {
  const skin = ctx.spy(skinAction.dataAtom)

  if (!ctx.spy(isClientAtom) || ctx.spy(skinAction.statusesAtom).isPending) {
    return <SkinRenderSkeleton />;
  }

  if (!skin) return null;

  return (
    <div className="flex items-center h-[390px] justify-center overflow-hidden w-full">
      {ctx.spy(hardwareAccIsEnabledAtom) ? (
        <ReactSkinview3d
          skinUrl={skin}
          height="390"
          width="300"
          options={{ zoom: 0.8 }}
          className="cursor-move"
          onReady={({ viewer }) => skinViewerAtom(ctx, viewer)}
          fallback={<SkinRenderSkeleton />}
        />
      ) : (
        <div className="flex w-full px-2 py-6 items-center justify-center h-full">
          <Typography color="gray" className="text-lg truncate text-center whitespace-pre-wrap">
            Графическое аппаратное ускорение не включено
          </Typography>
        </div>
      )}
    </div>
  );
}, "SkinRender")

function hardwareAccelerationIsActive(): boolean {
  let gl: WebGLRenderingContext | null = null;

  const canvas = document.createElement('canvas');

  try {
    gl = (
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })
      || canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: true })) as WebGLRenderingContext | null;
  } catch (e) {
    return false;
  }

  if (!gl) {
    try {
      gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    } catch (e) {
      return false;
    }

    if (!gl) return false;
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  let rendererName = '';

  if (debugInfo) {
    rendererName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gl.getParameter(gl.RENDERER);
  } else {
    rendererName = gl.getParameter(gl.RENDERER);
  }

  rendererName = rendererName.toLowerCase();

  const softwareRenderers = [
    'swiftshader',
    'llvmpipe',
    'software rasterizer',
    'microsoft basic render driver',
    'vmware svga ii',
    'virtualbox graphics adapter'
  ];

  for (const softwareKeyword of softwareRenderers) {
    if (rendererName.includes(softwareKeyword)) {
      console.warn(`Potential software WebGL renderer detected: ${rendererName}`);
      return false;
    }
  }

  return true;
}

export const hardwareAccIsEnabledAtom = atom(false, "hardwareAccIsEnabled").pipe(
  withInit(() => hardwareAccelerationIsActive())
)

export const initSkinAction = action((ctx) => {
  const isHardwareAccEnabled = ctx.get(hardwareAccIsEnabledAtom)
  if (!isHardwareAccEnabled) return;

  const nickname = ctx.get(userParamAtom)
  if (!nickname) return;

  skinAction(ctx, nickname)
}, "initSkinAction")

const skinHeadVariant = tv({
  base: `self-center *:rounded-lg p-0.5 aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-green-600`,
  variants: {
    variant: {
      desktop: "h-12 w-12",
      mobile: "w-32 h-32"
    }
  }
})

const SkinRenderWrapper = reatomComponent(({ ctx }) => {
  const player = ctx.spy(playerAtom)
  if (!player) return null;

  const { avatar, nickname } = player;

  return (
    <div className="flex flex-col justify-between w-full lg:min-h-[450px] lg:border lg:border-neutral-700 rounded-lg">
      <div className="hidden lg:flex flex-col py-4 items-center gap-2 w-full h-full">
        <SkinRender />
        <div className="flex items-center justify-center w-full h-full">
          <div className={skinHeadVariant()}>
            <img
              src={avatar}
              width={36}
              alt={nickname}
              fetchPriority="high"
              loading="eager"
              height={36}
              draggable={false}
            />
          </div>
        </div>
      </div>
      <div className="flex lg:hidden flex-col justify-center items-center gap-2 p-6 w-full text-neutral-400">
        <div className={skinHeadVariant({ variant: "mobile" })}>
          <img
            src={avatar}
            width={128}
            height={128}
            fetchPriority="high"
            loading="eager"
            alt={nickname}
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}, "SkinRenderWrapper")

const skinControlVariants = tv({
  base: `flex items-center justify-center cursor-pointer border border-neutral-800 rounded-xl h-10 w-10`,
  variants: {
    variant: {
      default: "bg-transparent",
      active: "bg-neutral-700/80"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

type SkinControlProps = HTMLAttributes<HTMLDivElement>
  & VariantProps<typeof skinControlVariants>

const SkinControl = ({ variant, className, ...props }: SkinControlProps) => {
  return <div className={skinControlVariants({ variant, className })} {...props} />
}

const SkinControlRotate = reatomComponent(({ ctx }) => {
  const variant = ctx.spy(skinRotatingAtom) ? "active" : "default"

  return (
    <div
      key="rotate"
      onClick={() => skinRotatingAtom(ctx, (state) => !state)}
      className={skinControlVariants({ variant })}
    >
      <IconRotate size={18} />
    </div>
  )
}, "SkinControlRotate")

const SkinControlsList = reatomComponent(({ ctx }) => {
  const variant = (c: typeof SKIN_ANIMATIONS[number]) => ctx.spy(skinAnimationAtom) === c.animation 
    ? "active" : "default"

  return (
    SKIN_ANIMATIONS.map((control, i) => (
      <SkinControl
        key={i}
        onClick={() => skinAnimationAtom(ctx, control.animation)}
        className={skinControlVariants({ variant: variant(control) })}
      >
        <control.icon size={18} />
      </SkinControl>
    ))
  )
}, "SkinControlsList")

const SkinControls = () => {
  return (
    <div className="hidden lg:flex flex-col items-center w-full justify-center gap-4">
      <div className="flex items-center justify-center gap-1 w-full">
        <SkinControlsList />
        <SkinControlRotate />
      </div>
    </div >
  );
}

const getSkinDownloadUrl = (nickname: string) => `${API_PREFIX_URL}/server/skin/download/${nickname}`

const SkinDownloadLink = reatomComponent(({ ctx }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const nickname = ctx.spy(userParamAtom)
  if (!nickname) return null;

  const downloadUrl = getSkinDownloadUrl(nickname)

  return (
    <Dialog open={dialogOpen} onOpenChange={v => setDialogOpen(v)}>
      <DialogTrigger asChild className="w-full">
        <Button className="bg-neutral-50 items-center justify-center h-12">
          <Typography className="text-lg font-semibold text-neutral-900">
            Скачать скин
          </Typography>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-none">
        <DialogTitle>Скачать скин?</DialogTitle>
        <div className="flex items-center justify-end gap-2 w-full">
          <DialogClose asChild>
            <Button className="font-semibold text-lg bg-red-700">
              Отмена
            </Button>
          </DialogClose>
          <a
            href={downloadUrl}
            onClick={() => setDialogOpen(false)}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button className="flex bg-neutral-50 items-center justify-center">
              <Typography className="text-neutral-950 font-semibold">
                Скачать
              </Typography>
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}, "SkinDownloadLink")

export const PlayerSkin = reatomComponent(({ ctx }) => {
  const player = ctx.spy(playerAtom)

  useUpdate((ctx) => player && initSkinAction(ctx), [player])

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      <SkinRenderWrapper />
      <SkinControls />
    </div>
  )
}, "PlayerSkin")