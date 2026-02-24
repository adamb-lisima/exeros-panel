import { DateTime } from 'luxon';
import DateConst from './date';

type Key = 'TODAY' | 'LAST_48H' | 'LAST_72H' | 'LAST_7_DAYS' | 'LAST_14_DAYS' | 'LAST_30_DAYS';

interface Range {
  id: number;
  key: Key;
  getFrom: () => string;
  getTo: () => string;
  text: string;
}

export const RANGES: Range[] = [
  {
    id: 1,
    key: 'TODAY',
    getFrom: () => DateTime.now().setZone('Europe/London').startOf('day').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat),
    text: 'Today'
  },
  {
    id: 2,
    key: 'LAST_48H',
    getFrom: () => DateTime.now().setZone('Europe/London').minus({ day: 1 }).startOf('day').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat),
    text: 'Last 48h'
  },
  {
    id: 3,
    key: 'LAST_72H',
    getFrom: () => DateTime.now().setZone('Europe/London').minus({ day: 2 }).startOf('day').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat),
    text: 'Last 72h'
  },
  {
    id: 4,
    key: 'LAST_7_DAYS',
    getFrom: () => DateTime.now().setZone('Europe/London').minus({ day: 6 }).startOf('day').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat),
    text: 'Last 7 days'
  },
  {
    id: 5,
    key: 'LAST_14_DAYS',
    getFrom: () => DateTime.now().setZone('Europe/London').minus({ day: 13 }).startOf('day').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat),
    text: 'Last 14 days'
  },
  {
    id: 6,
    key: 'LAST_30_DAYS',
    getFrom: () => DateTime.now().setZone('Europe/London').minus({ day: 29 }).startOf('day').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('day').toFormat(DateConst.serverDateTimeFormat),
    text: 'Last 30 days'
  }
];

export const MAPPED_RANGES = RANGES.reduce((prev, curr) => ({ ...prev, [curr.key]: curr }), {} as Record<Key, Range>);

interface CalendarRange {
  id: number;
  key: CalendarKey;
  getFrom: () => string;
  getTo: () => string;
  text: string;
}

type CalendarKey = 'YESTERDAY' | 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR';

export const CALENDAR_RANGES: CalendarRange[] = [
  {
    id: 1,
    key: 'YESTERDAY',
    getFrom: () => DateTime.now().setZone('Europe/London').minus({ day: 1 }).startOf('day').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').minus({ day: 1 }).endOf('day').toFormat(DateConst.serverDateTimeFormat),
    text: 'Yesterday'
  },
  {
    id: 2,
    key: 'THIS_WEEK',
    getFrom: () => DateTime.now().setZone('Europe/London').startOf('week').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('week').toFormat(DateConst.serverDateTimeFormat),
    text: 'This week'
  },
  {
    id: 3,
    key: 'LAST_WEEK',
    getFrom: () => DateTime.now().setZone('Europe/London').minus({ week: 1 }).startOf('week').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').minus({ week: 1 }).endOf('week').toFormat(DateConst.serverDateTimeFormat),
    text: 'Last week'
  },
  {
    id: 4,
    key: 'THIS_MONTH',
    getFrom: () => DateTime.now().setZone('Europe/London').startOf('month').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('month').toFormat(DateConst.serverDateTimeFormat),
    text: 'This month'
  },
  {
    id: 5,
    key: 'LAST_MONTH',
    getFrom: () => DateTime.now().setZone('Europe/London').minus({ month: 1 }).startOf('month').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').minus({ month: 1 }).endOf('month').toFormat(DateConst.serverDateTimeFormat),
    text: 'Last month'
  },
  {
    id: 6,
    key: 'THIS_YEAR',
    getFrom: () => DateTime.now().setZone('Europe/London').startOf('year').toFormat(DateConst.serverDateTimeFormat),
    getTo: () => DateTime.now().setZone('Europe/London').endOf('year').toFormat(DateConst.serverDateTimeFormat),
    text: 'This year'
  }
];

export const MAPPED_CALENDAR_RANGES = CALENDAR_RANGES.reduce((prev, curr) => ({ ...prev, [curr.key]: curr }), {} as Record<CalendarKey, CalendarRange>);
