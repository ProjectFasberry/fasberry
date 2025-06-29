import { atom, Atom, AtomState, Ctx } from '@reatom/core';

export function withHistory<T extends Atom>(length = 2): (target: T) => T & {
  history: Atom<[current: AtomState<T>, ...past: Array<AtomState<T>>]>
} {
  return (target) =>
    Object.assign(target, {
      history: atom(
        (ctx, state = []) =>
          [ctx.spy(target), ...state.slice(0, length)] as [
            current: AtomState<T>,
            ...past: Array<AtomState<T>>,
          ],
      ),
    })
}

export const isChanged = (
  ctx: Ctx,
  param: Atom<string | null> & { history: Atom<[current: string | null, ...past: (string | null)[]]> },
  target: string | null,
  callback: Function
) => {
  if (!target) return;

  const prev = ctx.get(param.history)[1]

  if (prev !== undefined && target !== prev) {
    callback()
  }
}