import { Typography } from '@repo/landing-ui/src/typography';
import dayjs from 'dayjs';
import { Dialog, DialogContent, DialogTrigger } from '@repo/landing-ui/src/dialog';

export type NewsType = {
  id: string,
  imageUrl: string,
  created_at: string,
  description: string,
  title: string
}

export const NewsItemWrapper = ({
  imageUrl, created_at, description, title
}: NewsType) => {
  const formattedTime = dayjs(created_at).format('DD.MM.YYYY HH:mm');
  
  return (
    <Dialog>
      <DialogTrigger className="rounded-[8px] overflow-hidden border-2 border-neutral-600">
        <div className="h-[200px] lg:h-[444px] w-full overflow-hidden">
          <img
            loading="lazy"
            width={1920}
            height={1080}
            src={imageUrl}
            alt=""
            className="object-cover w-full h-full"
          />
        </div>
        <div
          className="flex lg:flex-row flex-col justify-between items-start 
            lg:items-center overflow-hidden p-4 lg:p-6 w-full gap-y-4"
        >
          <div className="block whitespace-normal w-3/4 overflow-hidden truncate">
            <Typography
              color="black"
              position="left"
              size="xl"
              text_color="adaptiveWhiteBlack"
            >
              {title}
            </Typography>
          </div>
          <div className="w-full lg:w-1/4 flex justify-end">
            <Typography color="black" size="lg" text_color="adaptiveGray">
              {formattedTime}
            </Typography>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="flex flex-col xl:flex-row rounded-[8px] p-0 gap-x-6">
        <div className="max-h-[200px] lg:max-h-[420px] w-full overflow-hidden">
          <img
            loading="lazy"
            width={1920}
            height={1080}
            src={imageUrl}
            alt=""
            className="max-h-[220px] lg:max-h-[420px] object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col justify-between gap-6 w-full xl:w-3/4 p-2 md:py-4 md:pl-2 md:pr-6">
          <div className="flex flex-col gap-y-4">
            <Typography text_color="adaptiveWhiteBlack" className="text-xl lg:text-3xl">
              {title}
            </Typography>
            <Typography text_color="adaptiveWhiteBlack" className="text-md lg:text-xl">
              {description}
            </Typography>
          </div>
          <Typography text_color="adaptiveGray" className="text-sm self-end lg:text-base">
            {formattedTime}
          </Typography>
        </div>
      </DialogContent>
    </Dialog>
  );
};