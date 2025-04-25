import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Client ID format: HIS-YYYY-XXX
export function generateClientId(id: number): string {
  return `HIS-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`;
}

// Format date to human readable string
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd MMM yyyy');
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid date';
  }
}

// Format date with time
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd MMM yyyy, h:mm a');
  } catch (error) {
    console.error("Error formatting date time:", error);
    return 'Invalid date';
  }
}

// Calculate age from date of birth
export function calculateAge(dob: string | Date): number {
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Format program status
export function formatProgramStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return {
        label: 'Active',
        className: 'bg-success bg-opacity-10 text-success'
      };
    case 'follow-up':
      return {
        label: 'Follow-up',
        className: 'bg-warning bg-opacity-10 text-warning'
      };
    case 'inactive':
      return {
        label: 'Inactive',
        className: 'bg-neutral-500 bg-opacity-10 text-neutral-500'
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-primary bg-opacity-10 text-primary'
      };
    default:
      return {
        label: status,
        className: 'bg-neutral-200 text-neutral-700'
      };
  }
}

// Format program badge
export function formatProgramBadge(code: string) {
  switch (code.toUpperCase()) {
    case 'TB':
      return 'bg-primary bg-opacity-10 text-primary';
    case 'HIV':
      return 'bg-secondary bg-opacity-10 text-secondary';
    case 'MALARIA':
      return 'bg-secondary bg-opacity-10 text-secondary';
    case 'DIABETES':
      return 'bg-warning bg-opacity-10 text-warning';
    default:
      return 'bg-neutral-200 text-neutral-700';
  }
}
