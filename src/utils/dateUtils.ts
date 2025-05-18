/**
 * Formats a date as a relative time string (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: Date | string): string {
  // Ensure date is a Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  const diffInDays = Math.floor(diffInSeconds / 86400);
  
  if (diffInSeconds < 0) {
    // Future date
    const absDiffInSeconds = Math.abs(diffInSeconds);
    
    if (absDiffInSeconds < 60) {
      return 'in less than a minute';
    } else if (absDiffInSeconds < 3600) {
      const minutes = Math.floor(absDiffInSeconds / 60);
      return `in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    } else if (absDiffInSeconds < 86400) {
      const hours = Math.floor(absDiffInSeconds / 3600);
      return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else if (absDiffInSeconds < 604800) {
      const days = Math.floor(absDiffInSeconds / 86400);
      return `in ${days} ${days === 1 ? 'day' : 'days'}`;
    } else {
      return formatDate(dateObj);
    }
  } else {
    // Past date
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(dateObj);
    }
  }
}

/**
 * Formats a date as a string (e.g., "Jan 1, 2023")
 * @param date The date to format
 * @param format Optional format ('short', 'simple', 'full', 'iso')
 */
export function formatDate(date: Date, format: 'short' | 'simple' | 'full' | 'iso' = 'short'): string {
  if (format === 'iso') {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  
  if (format === 'simple') {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
  
  if (format === 'full') {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }
  
  // Default 'short' format
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

/**
 * Returns a simple date string in YYYY-MM-DD format
 * Used for date comparisons and grouping
 */
export function getSimpleDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formats a date as a time string (e.g., "3:45 PM")
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
}

/**
 * Gets the start and end dates for the current week
 */
export function getCurrentWeekDates(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
  
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - dayOfWeek);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { start: startDate, end: endDate };
}

/**
 * Gets an array of dates for the last n days
 */
export function getLastNDays(n: number): Date[] {
  const result: Date[] = [];
  const now = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);
    result.push(date);
  }
  
  return result;
}

/**
 * Formats a duration in milliseconds to a string (e.g., "1h 30m")
 */
export function formatDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
} 