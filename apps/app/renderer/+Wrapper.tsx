import { isDevelopment } from "@/shared/env";
import { Button } from "@repo/ui/button";
import { PropsWithChildren } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col gap-2 h-dvh responsive mx-auto w-full items-center justify-center">
      <div className="flex flex-col w-full items-center justify-center">
        <p className="text-lg font-semibold">Произошла ошибка в работе приложения</p>
        <span>Мы уже работаем над исправлением!</span>
      </div>
      <Button
        className="text-lg font-semibold px-4 bg-neutral-50 text-neutral-950"
        onClick={() => resetErrorBoundary()}
      >
        Обновить
      </Button>
      {isDevelopment && <pre style={{ color: "red" }}>{error.message}</pre>}
    </div>
  );
}

function logError(error: Error, info: React.ErrorInfo) {
  console.error(error)
};

export default function Wrapper({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={logError}
    >
      {children}
    </ErrorBoundary>
  )
}