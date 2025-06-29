import { Link } from "@/shared/components/config/Link";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { usePageContext } from "vike-react/usePageContext";

export default function Page() {
  const { is404 } = usePageContext();

  if (is404) {
    return (
      <div
        className="flex min-h-screen justify-center items-center px-8"
        style={{
          backgroundImage: 'url("/images/static/dirt.webp")'
        }}
      >
        <div className="flex flex-col items-center gap-y-2">
          <Typography className="text-neutral-400 text-base md:text-xl font-normal">
            Отключено
          </Typography>
          <Typography className="text-white text-base md:text-xl text-center font-normal">
            Не удалось найти нужный ресурс.
          </Typography>
          <Link href="/">
            <Button
              className="md:w-max mt-6 raised-slot-button text-center text-neutral-800 text-base md:text-xl py-1 px-4 md:px-6"
            >
              Вернуться в безопасное место
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen justify-center items-center px-8"
      style={{
        backgroundImage: 'url("/images/static/dirt.webp")'
      }}
    >
      <div className="flex flex-col items-center gap-y-2">
        <Typography className="text-neutral-400 text-base md:text-xl font-normal">
          Отключено
        </Typography>
        <Link href="/">
          <Button
            className="bg-neutral-600 md:w-max mt-6 raised-slot-button text-center text-base md:text-xl py-1 px-4 md:px-6"
          >
            Вернуться в безопасное место
          </Button>
        </Link>
      </div>
    </div>
  );
}
