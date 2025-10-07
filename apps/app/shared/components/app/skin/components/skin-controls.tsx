import { RotateCw } from "lucide-react";
import { HTMLAttributes } from "react";
import { skinRotatingAtom, skinAnimationAtom, SKIN_ANIMATIONS } from "../models/skin-animation.model";
import { SkinDownloadLink } from "./skin-download";
import { reatomComponent } from "@reatom/npm-react";
import { tv, VariantProps } from "tailwind-variants";
import { SkinHowToChange } from "./skin-change";
import { isIdentityAtom } from "../../player/models/player.model";
import { isAuthAtom } from "@/shared/models/global.model";

const skinControlVariants = tv({
  base: `flex items-center justify-center cursor-pointer border border-neutral-800 rounded-xl h-12 w-12`,
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
  return (
    <SkinControl
      key="rotate"
      onClick={() => skinRotatingAtom(ctx, (state) => !state)}
      variant={ctx.spy(skinRotatingAtom) ? "active" : "default"}
    >
      <RotateCw size={20} />
    </SkinControl>
  )
}, "SkinControlRotate")

const SkinControlsList = reatomComponent(({ ctx }) => {
  return (
    SKIN_ANIMATIONS.map((control, i) => (
      <SkinControl
        key={i}
        onClick={() => skinAnimationAtom(ctx, control.animation)}
        variant={ctx.spy(skinAnimationAtom) === control.animation ? "active" : "default"}
      >
        <control.icon className="text-xl" />
      </SkinControl>
    ))
  )
}, "SkinControlsList")

export const SkinControls = reatomComponent(({ ctx }) => {
  const isOwner = ctx.get(isIdentityAtom);
  const isAuthenticated = ctx.get(isAuthAtom);

  return (
    <div className="hidden lg:flex flex-col items-center w-full justify-center gap-4">
      <div className="flex items-center justify-center gap-4 w-full">
        <SkinControlsList />
        <SkinControlRotate />
      </div>
      {isAuthenticated && (
        <div className="flex flex-col items-center justify-end gap-2 w-full">
          {isOwner && <SkinHowToChange />}
          <SkinDownloadLink />
        </div>
      )}
    </div >
  );
}, "SkinControls")