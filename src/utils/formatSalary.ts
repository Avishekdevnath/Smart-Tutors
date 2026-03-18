export function formatSalary(salary: { min?: number; max?: number } | string | undefined): string {
  if (!salary) return 'N/A';
  if (typeof salary === 'string') return salary; // backward compat
  const { min, max } = salary;
  if (min && max && min !== max) return `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
  if (min) return `৳${min.toLocaleString()}`;
  if (max) return `৳${max.toLocaleString()}`;
  return 'N/A';
}
