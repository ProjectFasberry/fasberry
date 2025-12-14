import { atom } from "@reatom/core";
import { FlyingAnimation, IdleAnimation, RunningAnimation, SkinViewer } from "skinview3d";
import { IconButterfly, TablerIcon } from "@tabler/icons-react";
import { IconRun } from "@tabler/icons-react";
import { IconManFilled } from "@tabler/icons-react";

type SkinAnimationType = "idle" | "run" | "flying";
type SkinAnimation = typeof FlyingAnimation | typeof IdleAnimation | typeof RunningAnimation

type SkinControls = {
  animation: SkinAnimationType;
  icon: TablerIcon;
};

export const SKIN_ANIMATIONS: SkinControls[] = [
  { animation: "idle", icon: IconManFilled },
  { animation: "run", icon: IconRun, },
  { animation: "flying", icon: IconButterfly },
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