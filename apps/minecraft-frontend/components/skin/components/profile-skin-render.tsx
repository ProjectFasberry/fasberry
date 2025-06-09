import { skinStateAction } from "../models/skin.model.ts";
import { Skeleton } from "@repo/ui/src/components/skeleton.tsx";
import { Typography } from "@repo/ui/src/components/typography.tsx";
import { reatomComponent } from "@reatom/npm-react";
import { atom, onConnect, withInit } from "@reatom/framework";
import { skinViewerAtom } from "../models/skin-animation.model.ts";
import { lazy, Suspense } from "react";

const ReactSkinview3d = lazy(() => import("react-skinview3d").then(m => ({ default: m.default })))

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

const hardwareAccIsEnabledAtom = atom(false, "hardwareAccIsEnabled").pipe(
  withInit(() => hardwareAccelerationIsActive())
)

onConnect(skinStateAction.dataAtom, (ctx) => {
  const isHardwareAccEnabled = ctx.get(hardwareAccIsEnabledAtom)
  if (!isHardwareAccEnabled) return;

  skinStateAction(ctx)
})

export const ProfileSkinRender = reatomComponent(({ ctx }) => {
  const skin = ctx.spy(skinStateAction.dataAtom)!

  if (ctx.spy(skinStateAction.statusesAtom).isPending) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <div className="flex items-center min-h-[450px] justify-center py-2 overflow-hidden border border-shark-600 rounded-lg w-full">
      {ctx.spy(hardwareAccIsEnabledAtom) ? (
        <Suspense fallback={<Skeleton className="w-full h-full" />}>
          <ReactSkinview3d
            skinUrl={skin}
            height="450"
            width="300"
            options={{ zoom: 0.8 }}
            className="cursor-move"
            // @ts-expect-error
            onReady={({ viewer }) => skinViewerAtom(ctx, viewer)}
          />
        </Suspense>
      ) : (
        <div className="flex w-full px-2 py-6 items-center justify-center h-full">
          <Typography textSize="large" textColor="gray" className="truncate text-center whitespace-pre-wrap">
            Графическое аппаратное ускорение не включено.
          </Typography>
        </div>
      )}
    </div>
  );
}, "ProfileSkinRender")