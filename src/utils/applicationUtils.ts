import { formatLocation } from './location';

export interface Application {
  _id: string;
  tutor: {
    _id: string;
    tutorId: string;
    name: string;
    phone: string;
    email?: string;
    universityShortForm?: string;
    version?: string;
    group?: string;
  };
  tuition: {
    _id: string;
    tuitionId: string;
    studentClass: string;
    subject: string[];
    location: any;
    salary: number;
    status: string;
  };
  status: string;
  appliedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  feedback?: string;
  guardianFeedback?: string;
  demoDate?: string;
  demoCompleted?: boolean;
  demoFeedback?: string;
  mediaFee?: {
    amount: number;
    dueDate: string;
    paidAt?: string;
    status: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Validate application data
export const validateApplicationData = (data: {
  tutorId?: string;
  tuitionId?: string;
  status?: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.tutorId?.trim()) {
    errors.push('Tutor ID is required');
  }

  if (!data.tuitionId?.trim()) {
    errors.push('Tuition ID is required');
  }

  if (data.status && !['pending', 'confirmed', 'completed', 'rejected', 'withdrawn'].includes(data.status)) {
    errors.push('Invalid status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format application status for display
export const formatApplicationStatus = (status: string): { label: string; color: string; bgColor: string } => {
  switch (status) {
    case 'pending':
      return { label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-100' };
    case 'confirmed':
      return { label: 'Confirmed', color: 'text-green-800', bgColor: 'bg-green-100' };
    case 'completed':
      return { label: 'Completed', color: 'text-blue-800', bgColor: 'bg-blue-100' };
    case 'rejected':
      return { label: 'Rejected', color: 'text-red-800', bgColor: 'bg-red-100' };
    case 'withdrawn':
      return { label: 'Withdrawn', color: 'text-gray-800', bgColor: 'bg-gray-100' };
    default:
      return { label: status, color: 'text-gray-800', bgColor: 'bg-gray-100' };
  }
};

// Get application statistics
export const getApplicationStats = (applications: Application[]) => {
  return {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    confirmed: applications.filter(a => a.status === 'confirmed').length,
    completed: applications.filter(a => a.status === 'completed').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length,
    withDemo: applications.filter(a => a.demoDate).length,
    demoCompleted: applications.filter(a => a.demoCompleted).length,
  };
};

// Filter applications
export const filterApplications = (
  applications: Application[],
  filters: {
    status?: string;
    tutorName?: string;
    subject?: string;
    dateRange?: { start: string; end: string };
  }
): Application[] => {
  return applications.filter(application => {
    if (filters.status && filters.status !== 'all' && application.status !== filters.status) {
      return false;
    }

    if (filters.tutorName && 
        !application.tutor.name.toLowerCase().includes(filters.tutorName.toLowerCase())) {
      return false;
    }

    if (filters.subject && 
        !application.tuition.subject.some(s => 
          s.toLowerCase().includes(filters.subject!.toLowerCase()))) {
      return false;
    }

    if (filters.dateRange) {
      const appliedDate = new Date(application.appliedAt);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      if (appliedDate < startDate || appliedDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

// Sort applications
export const sortApplications = (
  applications: Application[],
  field: string,
  order: 'asc' | 'desc'
): Application[] => {
  return [...applications].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (field) {
      case 'tutorName':
        aValue = a.tutor.name;
        bValue = b.tutor.name;
        break;
      case 'appliedAt':
        aValue = new Date(a.appliedAt).getTime();
        bValue = new Date(b.appliedAt).getTime();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'salary':
        aValue = a.tuition.salary;
        bValue = b.tuition.salary;
        break;
      default:
        aValue = a[field as keyof Application];
        bValue = b[field as keyof Application];
    }

    if (aValue === undefined) aValue = '';
    if (bValue === undefined) bValue = '';

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Format application for display
export const formatApplicationForDisplay = (application: Application) => {
  return {
    ...application,
    formattedStatus: formatApplicationStatus(application.status),
    formattedAppliedDate: new Date(application.appliedAt).toLocaleDateString(),
    formattedSubjects: application.tuition.subject.join(', '),
    formattedLocation: application.tuition.location ? formatLocation(application.tuition.location) : 'N/A',
    formattedSalary: `৳${application.tuition.salary.toLocaleString()}`,
    daysAgo: Math.floor((Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24)),
  };
};

// Create application
export const createApplication = async (tutorId: string, tuitionId: string, message?: string) => {
  try {
    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tutorId, tuitionId, message })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create application');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create application');
  }
};

// Update application status
export const updateApplicationStatus = async (
  applicationId: string, 
  updates: {
    status?: string;
    feedback?: string;
    guardianFeedback?: string;
    demoDate?: string;
    demoCompleted?: boolean;
    demoFeedback?: string;
    notes?: string;
  }
) => {
  try {
    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update application');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update application');
  }
}; 