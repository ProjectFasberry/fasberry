import { atom } from "@reatom/core";
import { FlyingAnimation, IdleAnimation, RunningAnimation, SkinViewer } from "skinview3d";

type SkinAnimationType = "idle" | "run" | "flying";
type SkinAnimation = typeof FlyingAnimation | typeof IdleAnimation | typeof RunningAnimation

type SkinControls = {
  animation: SkinAnimationType;
  icon: SkinIconType;
};

type SkinIconType =
  | "sprite/people-idle"
  | "sprite/people-running"
  | "sprite/people-flying";

export const SKIN_ANIMATIONS: SkinControls[] = [
  {
    animation: "idle",
    icon: "sprite/people-idle",
  },
  {
    animation: "run",
    icon: "sprite/people-running",
  },
  {
    animation: "flying",
    icon: "sprite/people-flying",
  },
];

export const skinAnimationAtom = atom<SkinAnimationType>("idle", "skinAnimation")
export const skinRotatingAtom = atom<boolean>(false, "skinRotating")
export const skinViewerAtom = atom<SkinViewer | null>(null, "skinViewer")

const animationClasses: Record<SkinAnimationType, SkinAnimation> = {
  idle: IdleAnimation,
  run: RunningAnimation,
  flying: FlyingAnimation,
};

skinRotatingAtom.onChange((ctx, state) => {
  let viewer = ctx.get(skinViewerAtom)
  if (!viewer) return;

  viewer.autoRotate = state
  skinViewerAtom(ctx, viewer)
})

skinAnimationAtom.onChange((ctx, state) => {
  let viewer = ctx.get(skinViewerAtom)
  if (!viewer) return;

  viewer.animation = new animationClasses[state]();
  skinViewerAtom(ctx, viewer)
})