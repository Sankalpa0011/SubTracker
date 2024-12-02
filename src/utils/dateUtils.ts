import { format, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (date: string) => {
  return format(parseISO(date), 'MMM dd, yyyy');
};

export const getDaysUntilRenewal = (renewalDate: string) => {
  const today = new Date();
  const renewal = parseISO(renewalDate);
  return differenceInDays(renewal, today);
};

export const isUpcomingRenewal = (renewalDate: string, days: number = 30) => {
  const daysUntil = getDaysUntilRenewal(renewalDate);
  return daysUntil >= 0 && daysUntil <= days;
};