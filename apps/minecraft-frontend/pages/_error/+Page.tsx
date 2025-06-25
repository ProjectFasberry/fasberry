import { Link } from "@/shared/components/config/Link";
import { Typography } from "@/shared/ui/typography";
import { usePageContext } from "vike-react/usePageContext";

export default function Page() {
  const { is404 } = usePageContext();

  if (is404) {
    return (
      <div
        id="not-found"
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
            <button
              className="btn  md:w-max mt-6 raised-slot-button text-center text-neutral-800 text-base md:text-xl py-1 px-4 md:px-6"
            >
              Вернуться в безопасное место
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      id="not-found"
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
          <button
            className="btn bg-neutral-600 md:w-max mt-6 raised-slot-button text-center text-base md:text-xl py-1 px-4 md:px-6"
          >
            Вернуться в безопасное место
          </button>
        </Link>
      </div>
    </div>
  );
}
