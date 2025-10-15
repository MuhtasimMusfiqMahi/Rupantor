/**
 * Format date to DD/MM/YY format
 * @param dateString - ISO date string, YYYY-MM-DD, or other date string
 * @returns Formatted date string in DD/MM/YY format
 */
export function formatDate(dateString: string): string {
  // Handle YYYY-MM-DD format (from date input) - parse as local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
  }
  
  // Handle ISO timestamps and other formats
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/**
 * Format date and time to DD/MM/YY HH:MM format
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format time to HH:MM format
 * @param dateString - ISO date string
 * @returns Formatted time string
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
