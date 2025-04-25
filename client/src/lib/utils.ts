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
        className: 'bg-green-100 text-green-700 border border-green-300'
      };
    case 'follow-up':
      return {
        label: 'Follow-up',
        className: 'bg-amber-100 text-amber-700 border border-amber-300'
      };
    case 'inactive':
      return {
        label: 'Inactive',
        className: 'bg-slate-100 text-slate-700 border border-slate-300'
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-blue-100 text-blue-700 border border-blue-300'
      };
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border border-slate-300'
      };
  }
}

// Format program badge
export function formatProgramBadge(code: string) {
  switch (code.toUpperCase()) {
    case 'TB':
      return 'bg-purple-100 text-purple-700 border border-purple-300';
    case 'HIV':
      return 'bg-red-100 text-red-700 border border-red-300';
    case 'MALARIA':
      return 'bg-blue-100 text-blue-700 border border-blue-300';
    case 'DIABETES':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
    case 'MATERNAL':
      return 'bg-pink-100 text-pink-700 border border-pink-300';
    default:
      return 'bg-violet-100 text-violet-700 border border-violet-300';
  }
}
