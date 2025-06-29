import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatDate(dateString: string | Date, format?: string): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  if (format === 'HH:mm:ss') {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export function getUniqueValues<T>(items: T[], key: keyof T): string[] {
  const uniqueValues = new Set<string>();
  
  items.forEach(item => {
    const value = item[key];
    if (value && typeof value === 'string' && value.trim() !== '') {
      uniqueValues.add(value);
    }
  });
  
  return Array.from(uniqueValues).sort();
}

export function countByKey<T>(items: T[], key: keyof T): Record<string, number> {
  const counts: Record<string, number> = {};
  
  items.forEach(item => {
    const value = item[key];
    if (value && typeof value === 'string' && value.trim() !== '') {
      counts[value] = (counts[value] || 0) + 1;
    }
  });
  
  return counts;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  
  return ((current - previous) / previous) * 100;
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result: Record<string, T[]>, currentValue: T) => {
    const keyValue = String(currentValue[key] || 'Unknown');
    (result[keyValue] = result[keyValue] || []).push(currentValue);
    return result;
  }, {});
}

// Format revenue values with Indian currency notation
export function formatRevenue(value: number): string {
  if (value >= 10000000) { // 1 Crore
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) { // 1 Lakh
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) { // 1 Thousand
    return `₹${(value / 1000).toFixed(1)}K`;
  } else {
    return `₹${value}`;
  }
}