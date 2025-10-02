import { Link } from "@/shared/components/config/link";
import { MainWrapperPage } from "@/shared/components/config/wrapper";
import { Button } from "@repo/ui/button";
import { Typography } from "@repo/ui/typography";
import { ReactNode } from "react";
import { usePageContext } from "vike-react/usePageContext";

const Back = () => {
  return (
    <Link href="/">
      <Button className="md:w-max bg-neutral-800">
        <Typography className='text-neutral-50 text-center text-base md:text-xl'>
          Вернуться в безопасное место
        </Typography>
      </Button>
    </Link>
  )
}

const NotFoundPage = () => {
  return (
    <>
      <Typography color="white" className="text-base md:text-xl text-center font-normal">
        Не удалось найти нужный ресурс.
      </Typography>
      <Back />
    </>
  )
}

const ErrorPage = () => {
  return (
    <>
      <Back />
    </>
  )
}

const VARIANTS: Record<string, ReactNode> = {
  "404": <NotFoundPage />,
  "500": <ErrorPage />
}

export default function Page() {
  const { is404 } = usePageContext();

  return (
    <MainWrapperPage>
      <div className="flex flex-col items-center gap-2">
        <Typography color="gray" className="text-neutral-400 text-base md:text-xl font-normal">
          Отключено
        </Typography>
        {VARIANTS[is404 ? "404" : "500"]}
      </div>
    </MainWrapperPage>
  );
}