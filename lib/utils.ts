import { twMerge } from 'tailwind-merge'
import { type ClassValue, clsx } from 'clsx'
import { eachDayOfInterval, format, isSameDay, subDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertAmountFromMilliunits(amount: number | string): number {
  // Handle zero case
  if (amount === 0 || amount === '0') return 0;
  
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/^0+/, '')) : amount;
  
  // Handle invalid inputs
  if (isNaN(numericAmount)) {
    console.warn(`Invalid amount value in convertAmountFromMilliunits: ${amount}`);
    return 0;
  }
  
  // Convert milliunits (paise) to display units (rupees)
  return numericAmount / 100;
}

export function convertAmountToMilliunits(amount: number | string): number {
  // Handle zero case
  if (amount === 0 || amount === '0') return 0;
  
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/^0+/, '')) : amount;
  
  // Handle invalid inputs
  if (isNaN(numericAmount)) {
    console.warn(`Invalid amount value in convertAmountToMilliunits: ${amount}`);
    return 0;
  }
  
  // Convert display units (rupees) to milliunits (paise)
  return Math.round(numericAmount * 100);
}

export function formatCurrency(value: number) {
  return Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
}

export function fillMissingDays(
  activeDays: {
    date: Date;
    income: number;
    expenses: number;
  }[],
  startDate: Date,
  endDate: Date
) {
  if (activeDays.length === 0) return [];

  const allDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const transactionsByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
    if (found) return found;
    else {
      return {
        date: day,
        income: 0,
        expenses: 0,
      };
    }
  });

  return transactionsByDay;
}

type Period = {
  from: string | Date | undefined;
  to: string | Date | undefined;
};

export function formatDateRange(period?: Period) {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  if (!period?.from) {
    return `${format(defaultFrom, 'LLL dd')} - ${format(
      defaultTo,
      'LLL dd, y'
    )}`;
  }

  if (period?.to) {
    return `${format(period.from, 'LLL dd')} - ${format(
      period.to,
      'LLL dd, y'
    )}`;
  }

  return format(period.from, 'LLL dd, y');
}

export function formatPercentage(
  value: number,
  options: { addPrefix?: boolean } = { addPrefix: false }
) {
  const result = new Intl.NumberFormat('en-US', {
    style: 'percent',
  }).format(value / 100);

  if (options.addPrefix && value > 0) return `+${result}`;

  return result;
}