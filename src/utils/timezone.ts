import { ValidationError } from './errors.js';

const MANILA_OFFSET = '+08:00';

const toDateWithOffset = (date: string, time: string) => {
  const iso = `${date}T${time}${MANILA_OFFSET}`;
  const parsed = new Date(iso);

  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`Invalid date provided: ${date}`);
  }

  return parsed;
};

export const getManilaDayRange = (date: string) => ({
  start: toDateWithOffset(date, '00:00:00.000'),
  end: toDateWithOffset(date, '23:59:59.999')
});

export const getManilaRange = (startDate: string, endDate: string) => ({
  start: toDateWithOffset(startDate, '00:00:00.000'),
  end: toDateWithOffset(endDate, '23:59:59.999')
});