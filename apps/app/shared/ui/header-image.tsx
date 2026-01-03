export const PageHeaderImage = ({ img }: { img: string }) => {
  return (
    <div className="flex select-none flex-col items-center justify-end relative overflow-hidden h-[180px] rounded-lg w-full">
      <img
        src={img}
        draggable={false}
        alt=""
        width={800}
        height={800}
        className="absolute w-full h-[300px] rounded-lg object-cover object-top"
      />
      <div className="absolute bottom-0 bg-gradient-to-t h-[60px] from-black/60 via-black/20 to-transparent w-full" />
    </div>
  )
}