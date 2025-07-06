import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";

const ConfigItem = ({ title, content }: { title: string, content: string }) => {
  return (
    <div className="flex items-center justify-between gap-2 w-full sm:w-1/3">
      <Typography>
        {title}
      </Typography>
      <Button>
        <Typography>
          {content}
        </Typography>
      </Button>
    </div>
  )
}

export default function PrivateConfigPage() {
  return (
    <>
      <Typography>
        Private Config Page
      </Typography>
      <div className="flex flex-col gap-4 w-full h-full">
        <ConfigItem 
          title="Mode"
          content="on / off"
        />
      </div>
    </>
  )
}