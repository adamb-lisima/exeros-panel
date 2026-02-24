export function calculateAbsoluteXFromDate(date: Date, minDate: Date, msPerPx: number, padding: number): number;
export function calculateAbsoluteXFromDate(date?: Date, minDate?: Date, msPerPx?: number, padding?: number): number | undefined {
  return date == null || minDate == null || msPerPx == null || padding == null ? undefined : (date.valueOf() - minDate.valueOf()) / msPerPx + padding;
}

export function calculateDateFromAbsoluteX(x: number, minDate: Date, padding: number, msPerPx: number): Date;
export function calculateDateFromAbsoluteX(x?: number, minDate?: Date, padding?: number, msPerPx?: number): Date | undefined {
  if (x == null || minDate == null || padding == null || msPerPx == null) {
    return undefined;
  }
  const xMin = calculateAbsoluteXFromDate(minDate, minDate, msPerPx, padding);
  if (xMin == null) {
    return undefined;
  }
  const ms = minDate.valueOf() + (x - xMin) * msPerPx + 2 * padding;
  return new Date(ms);
}

export function calculateDateFromVisibleX(x: number, msPerPx: number, timelineScrollContainerScrollX: number, padding: number, minDate: Date): Date;
export function calculateDateFromVisibleX(x?: number, msPerPx?: number, timelineScrollContainerScrollX?: number, padding?: number, minDate?: Date): Date | undefined {
  return x == null || msPerPx == null || timelineScrollContainerScrollX == null || padding == null || minDate == null ? undefined : new Date(minDate.valueOf() + (x - padding + timelineScrollContainerScrollX) * msPerPx);
}

export function min<T>(a: T, b: T) {
  return a < b ? a : b < a ? b : a ?? b ?? undefined;
}

export function max<T>(a: T, b: T) {
  return a > b ? a : b > a ? b : a ?? b ?? undefined;
}

export function minBy<T, U>(items: T[], accessor: (a: T) => U): T | undefined {
  return !items.length ? undefined : findByComparator(items, accessor, (t1, t2) => t1 < t2);
}

export function maxBy<T, U>(items: T[], accessor: (a: T) => U): T | undefined {
  return !items.length ? undefined : findByComparator(items, accessor, (t1, t2) => t1 > t2);
}

export function findByComparator<T, U>(items: T[], accessor: (a: T) => U, comparator: (u1: U, u2: U) => boolean): T | undefined {
  return !items.length ? undefined : items.reduce((val, acc) => (comparator(accessor(val), accessor(acc)) ? val : acc), items[0]);
}

export function parseDate(value: string | Date | undefined): Date {
  return typeof value === 'string' ? new Date(value?.replace(' ', 'T')) : value ?? new Date();
}
