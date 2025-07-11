function wrapWithAbort<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  signal: AbortSignal
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error("Aborted"));

    const onAbort = () => {
      reject(new Error("Aborted"));
    };

    signal.addEventListener("abort", onAbort);

    fn(signal)
      .then(resolve)
      .catch(reject)
      .finally(() => signal.removeEventListener("abort", onAbort));
  });
}

export async function abortablePromiseAll<T>(
  tasks: ((signal: AbortSignal) => Promise<T>)[],
  controller: AbortController = new AbortController()
): Promise<T[]> {
  const wrapped = tasks.map(task => wrapWithAbort(
    task, controller.signal)
  );

  return Promise.all(wrapped).catch(err => {
    controller.abort();
    throw err;
  });
}

export async function abortablePromiseRace<T>(
  tasks: ((signal: AbortSignal) => Promise<T>)[],
  controller: AbortController = new AbortController()
): Promise<T> {
  const wrapped = tasks.map(task => wrapWithAbort(
    task, controller.signal)
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