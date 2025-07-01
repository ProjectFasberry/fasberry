import { RotateCw } from "lucide-react";
import { HTMLAttributes } from "react";
import { skinRotatingAtom, skinAnimationAtom, SKIN_ANIMATIONS } from "../models/skin-animation.model";
import { ProfileSkinDownloadLink } from "./profile-skin-download";
import { reatomComponent } from "@reatom/npm-react";
import { tv, VariantProps } from "tailwind-variants";

const profileSkinControlVariants = tv({
  base: `flex items-center justify-center cursor-pointer border border-neutral-800 rounded-xl h-[46px] w-[46px]`,
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

type ProfileSkinControlProps = HTMLAttributes<HTMLDivElement>
  & VariantProps<typeof profileSkinControlVariants>

const ProfileSkinControl = ({ variant, className, ...props }: ProfileSkinControlProps) => {
  return <div className={profileSkinControlVariants({ variant, className })} {...props} />
}

const ProfileSkinControlRotate = reatomComponent(({ ctx }) => {
  return (
    <ProfileSkinControl
      key="rotate"
      onClick={() => skinRotatingAtom(ctx, (state) => !state)}
      variant={ctx.spy(skinRotatingAtom) ? "active" : "default"}
    >
      <RotateCw size={20} />
    </ProfileSkinControl>
  )
})

const ProfileSkinControlsList = reatomComponent(({ ctx }) => {
  return (
    SKIN_ANIMATIONS.map((control, i) => (
      <ProfileSkinControl
        key={i}
        onClick={() => skinAnimationAtom(ctx, control.animation)}
        variant={ctx.spy(skinAnimationAtom) === control.animation ? "active" : "default"}
      >
        <control.icon className="text-xl" />
      </ProfileSkinControl>
    ))
  )
})

export const ProfileSkinControls = reatomComponent(() => {
  const isAuthenticated = true

  return (
    <div className="hidden lg:flex flex-col items-center w-full justify-center gap-4">
      <div className="flex items-center justify-center gap-4 w-full">
        <ProfileSkinControlsList />
        <ProfileSkinControlRotate />
      </div>
      {isAuthenticated && (
        <div className="flex flex-col items-center justify-end gap-4 w-full">
          {/* <Suspense>
            <ProfileSkinHowToChange />
          </Suspense> */}
          <ProfileSkinDownloadLink />
        </div>
      )}
    </div >
  );
}, "ProfileSkinControls")