import { reatomComponent, useUpdate } from "@reatom/npm-react";
import { Skeleton } from "@repo/ui/skeleton";
import { clientOnly } from "vike-react/clientOnly";
import { SkinControls } from "../../skin/components/skin-controls";
import { playerAtom, userParamAtom } from "../models/player.model";
import { action, atom } from "@reatom/core";
import { skinAction } from "../../skin/models/skin.model";
import { withInit } from "@reatom/framework";

const SkinRender = clientOnly(() => import("@/shared/components/app/skin/components/skin-render").then(m => m.SkinRender))

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

const SkinRenderWrapper = reatomComponent(({ ctx }) => {
  const player = ctx.spy(playerAtom)
  if (!player) return null;

  const { avatar, nickname } = player;

  return (
    <div className="flex flex-col gap-2 justify-between w-full lg:min-h-[520px] lg:border lg:border-neutral-700 rounded-lg">
      <div className="hidden lg:flex flex-col items-center gap-2 w-full text-neutral-400">
        <SkinRender fallback={<Skeleton className="w-full h-[450px]" />} />
        <img
          src={avatar}
          width={48}
          alt={nickname}
          fetchPriority="high"
          loading="eager"
          height={48}
          className="cursor-pointer rounded-lg p-0.5 border-2 border-green-600"
        />
      </div>
      <div className="flex lg:hidden flex-col justify-center items-center gap-2 p-6 w-full text-neutral-400">
        <img
          src={avatar}
          width={128}
          height={128}
          fetchPriority="high"
          loading="eager"
          alt={nickname}
          className="w-32 h-32 cursor-pointer rounded-lg p-0.5 border-2 border-green-600"
        />
      </div>
    </div>
  )
}, "SkinRenderWrapper") 

export const PlayerSkin = reatomComponent(({ ctx }) => {
  const player = ctx.spy(playerAtom)

  useUpdate((ctx) => player && initSkinAction(ctx), [player])

  return (
    <div className="flex flex-col h-full gap-2 w-full lg:w-1/3 lg:sticky pt-2 lg:top-0">
      <SkinRenderWrapper />
      <SkinControls />
    </div>
  )
}, "PlayerSkin")