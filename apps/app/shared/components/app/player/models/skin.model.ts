import { reatomAsync, withCache, withDataAtom, withStatusesAtom } from "@reatom/async";
import { getObjectUrl } from "@/shared/lib/volume-helpers";
import { clientInstance } from "@/shared/api/client";
import { action, atom, batch, Ctx } from "@reatom/core";
import { sleep, withAssign, withReset } from "@reatom/framework";
import { logError } from "@/shared/lib/log";
import { client } from "@/shared/lib/client-wrapper";
import { SkinsHistory } from "@repo/shared/types/entities/other";
import { isIdentityAtom, playerParamAtom } from "./player.model";
import { toast } from "sonner";
import { avatarAction, avatarsAtom } from "../../avatar/models/avatar.model";

export function hardwareAccelerationIsActive(): boolean {
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

export async function getSkinDetails(
  { type, nickname }: { type: "head" | "skin", nickname: string },
  init?: RequestInit
) {
  const fallback = getObjectUrl(
    "static",
    type === 'skin' ? "steve_skin.png" : "steve_head.png"
  )

  const res = await clientInstance(`server/skin/${type}/${nickname}`, {
    ...init,
    credentials: "omit"
  })

  if (!res.ok) return fallback;

  const data = await res.text()
  return data
}

//#region
type SkinSelected = {
  skin_head_url: string | null,
  skin_url: string | null,
  identifier: string
}

export const skinsSelectedAtom = atom<SkinSelected | null>(null, "skinSelected").pipe(withReset())

export const skinsHistoryAction = reatomAsync(async (ctx, nickname: string) => {
  return await ctx.schedule(() =>
    client<SkinsHistory[]>(`server/skin/history/${nickname}`).exec()
  )
}, {
  name: "skinsHistoryAction",
  onFulfill: (ctx, res) => {
    if (!res) return;

    const first = res[0]
    if (!first) return;

    skinsSelectedAtom(ctx, {
      skin_url: first.skin_url!,
      skin_head_url: first.skin_head_url!,
      identifier: first.skin_identifier
    })
  }
}).pipe(
  withDataAtom(null, (_, data) => data.length ? data : null),
  withStatusesAtom(),
  withCache({ swr: false })
)
//#endregion

function updateSkinAndHead(ctx: Ctx) {
  const nickname = ctx.get(playerParamAtom);
  if (!nickname) throw new Error("Nickname is not defined");

  batch(ctx, () => {
    skinsHistoryAction.cacheAtom.reset(ctx);
    skinsHistoryAction(ctx, nickname);

    avatarsAtom.delete(ctx, nickname);
    avatarAction(ctx, nickname);
  })
}

//#region
export const skinControlDialogIsOpenAtom = atom(false, "skinControlDialogIsOpen").pipe(withReset());

export const getIsUploadAvailableAtom = atom((ctx) => {
  if (!ctx.spy(isIdentityAtom)) {
    return false;
  }

  return true;
}, "getIsUploadAvailable")

export const changeSkinAction = reatomAsync(async (ctx) => {
  const payloadFormData = new FormData()

  payloadFormData.append("file", ctx.get(skinFileAtom)!)
  payloadFormData.append("variant", ctx.get(skinVariantAtom))

  const result = await ctx.schedule(() =>
    client.post<{ url: string }>("server/skin/upload", { body: payloadFormData, timeout: 10000 }).exec()
  )

  await ctx.schedule(() => sleep(2000));

  return { result }
}, {
  name: "changeSkinAction",
  onFulfill: async (ctx, res) => {
    toast.success("Скин обновлен", { description: "Если вы в игре - перезайдите" })

    updateSkinAndHead(ctx)

    skinControlDialogIsOpenAtom.reset(ctx)

    await ctx.schedule(() => sleep(200));

    skinFileAtom.reset(ctx)
    skinVariantAtom.reset(ctx)
  },
  onReject: (_, e) => {
    logError(e, { type: "combined" })
  }
}).pipe(withStatusesAtom())

export const variants = ["classic", "slim"] as const
export type SkinVariant = typeof variants[number]

export const skinFileAtom = atom<File | null>(null, "skinFile").pipe(
  withAssign((target, name) => ({
    reset: action((ctx) => {
      const url = ctx.get(skinFileDataAtom)?.url
      if (!url) return;

      URL.revokeObjectURL(url);

      target(ctx, null);
      skinFileDataAtom.reset(ctx)
    }, `${name}.reset`)
  }))
)

type SkinFileData = { name: string, size: number, url: string }

export const skinFileDataAtom = atom<SkinFileData | null>(null, "skinFileData").pipe(withReset())

export const skinSubmitIsDisabledAtom = atom((ctx) => {
  if (ctx.spy(changeSkinAction.statusesAtom).isPending) return true;
  return !ctx.spy(skinFileAtom);
}, "skinSubmitIsDisabled")

export const getSkinVariantIsActiveAtom = (type: string) => atom(
  (ctx) => ctx.spy(skinVariantAtom) === type,
  "getSkinVariantIsActive"
)

export const skinVariantAtom = atom<SkinVariant>("classic", "skinVariant").pipe(withReset())

skinFileAtom.onChange((ctx, state) => {
  if (!state) return;
  setupSkinFileDataAction(ctx)
})

export const setupSkinFileDataAction = reatomAsync(async (ctx) => {
  const target = ctx.get(skinFileAtom)
  if (!target) return null;

  const url = URL.createObjectURL(target)

  const info = {
    name: target.name,
    size: target.size * 1024,
    url
  }

  skinFileDataAtom(ctx, info)
}, "setupSkinFileDataAction").pipe(withStatusesAtom())
//#endregion

//#region
export const getIsSelectSkinAtom = atom(
  (ctx) => {
    if (!ctx.spy(isIdentityAtom)) {
      return false;
    }

    const state = ctx.spy(skinsHistoryAction.dataAtom)
    if (!state) return false;

    return state[0].skin_identifier !== ctx.spy(skinsSelectedAtom)?.identifier
  },
  "getIsSelectSkin"
)

export const setSkinAction = reatomAsync(async (ctx) => {
  const selectedSkin = ctx.get(skinsSelectedAtom)
  if (!selectedSkin) return null;

  const id = selectedSkin.identifier

  return await ctx.schedule(() =>
    client<"success" | "error">("server/skin/set", { searchParams: { id }, retry: 1 }).exec()
  )
}, {
  name: "setSkinAction",
  onFulfill: (ctx, res) => {
    toast.success("Скин обновлен", { description: "Если вы в игре - перезайдите" })
    updateSkinAndHead(ctx)
  }
}).pipe(withStatusesAtom())
//#endregion