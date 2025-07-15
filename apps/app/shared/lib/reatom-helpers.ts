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

export function atomHasChanged<T>(
  ctx: Ctx,
  atomWithHistory: Atom<T> & { history: Atom<[current: T, ...past: T[]]> },
  options: {
    compareWithIndex?: number,          
    comparator?: (a: T, b: T) => boolean 
    onChange?: () => void
  } = {},
): boolean {
  const { 
    compareWithIndex = 1, 
    comparator = (a, b) => a !== b, 
    onChange 
  } = options;

  const history = ctx.get(atomWithHistory.history);
  const current = history[0];
  const prev = history[compareWithIndex];

  const changed = prev !== undefined && comparator(current, prev);

  if (changed && onChange) {
    onChange();
  }

  return changed;
}