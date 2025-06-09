// @ts-ignore
import Gear from "@repo/assets/gifs/minecraft-gear.gif";

type GearLoaderProps = Partial<{
  height: number;
  width: number;
}>;

export const GearLoader = ({ height = 36, width = 36 }: GearLoaderProps) => {
  return (
    <div className={`w-[${width}px] h-[${height}px]`}>
      <img
        alt=""
        src={Gear}
        width={width}
        height={height}
        loading="eager"
      />
    </div>
  );
};
