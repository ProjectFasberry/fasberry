function wrapWithAbort<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
  onFail: () => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      onFail();
      return reject(new Error("Aborted"));
    }

    const onAbort = () => {
      reject(new Error("Aborted"));
    };

    signal.addEventListener("abort", onAbort);

    fn(signal)
      .then(resolve)
      .catch(err => {
        onFail();
        reject(err);
      })
      .finally(() => signal.removeEventListener("abort", onAbort));
  });
}

export function withAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (!signal) return promise;

  const abortPromise = new Promise<never>((_, reject) => {
    if (signal.aborted) {
      return reject(new Error("Aborted before start"));
    }
    signal.addEventListener("abort", () => {
      reject(new Error("Aborted by signal"));
    });
  });

  return Promise.race([promise, abortPromise]);
}

export async function abortablePromiseAll<T>(
  tasks: ((signal: AbortSignal) => Promise<T>)[],
  controller: AbortController = new AbortController()
): Promise<T[]> {
  const wrapped = tasks.map(task =>
    wrapWithAbort(task, controller.signal, () => controller.abort())
  );

  return Promise.all(wrapped);
}

export async function abortablePromiseRace<T>(
  tasks: ((signal: AbortSignal) => Promise<T>)[],
  controller: AbortController = new AbortController()
): Promise<T> {
  const wrapped = tasks.map(task =>
    wrapWithAbort(task, controller.signal, () => controller.abort())
  );

  return Promise.race(wrapped).finally(() => {
    controller.abort();
  });
}

export const abortableDelay = (ms: number, name: string) => (signal: AbortSignal) =>
  new Promise<string>((resolve, reject) => {
    const id = setTimeout(() => resolve(name), ms);

    signal.addEventListener("abort", () => {
      clearTimeout(id);

      const error = new Error(name + " aborted")
      reject(error);
    });
  });