import { formatLocation, formatAddress } from './location';

export interface Tutor {
  _id: string;
  tutorId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  version?: string;
  group?: string;
  universityShortForm?: string;
  preferredLocation?: string[];
  status: string;
  gender?: string;
  department?: string;
  yearAndSemester?: string;
  createdAt: string;
}

// Validate tutor data
export const validateTutorData = (data: Partial<Tutor>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  }

  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  } else if (!/^01[3-9]\d{8}$/.test(data.phone)) {
    errors.push('Phone number must be a valid Bangladeshi number');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email must be a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format tutor status for display
export const formatTutorStatus = (status: string): { label: string; color: string; bgColor: string } => {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', color: 'text-green-800', bgColor: 'bg-green-100' };
    case 'pending':
      return { label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-100' };
    case 'completed':
      return { label: 'Completed', color: 'text-blue-800', bgColor: 'bg-blue-100' };
    case 'rejected':
      return { label: 'Rejected', color: 'text-red-800', bgColor: 'bg-red-100' };
    default:
      return { label: status, color: 'text-gray-800', bgColor: 'bg-gray-100' };
  }
};

// Format tutor version for display
export const formatTutorVersion = (version: string): { label: string; color: string; bgColor: string } => {
  switch (version) {
    case 'EM':
      return { label: 'English Medium', color: 'text-blue-800', bgColor: 'bg-blue-100' };
    case 'BM':
      return { label: 'Bangla Medium', color: 'text-green-800', bgColor: 'bg-green-100' };
    case 'EV':
      return { label: 'English Version', color: 'text-purple-800', bgColor: 'bg-purple-100' };
    default:
      return { label: version, color: 'text-gray-800', bgColor: 'bg-gray-100' };
  }
};

// Format tutor group for display
export const formatTutorGroup = (group: string): { label: string; color: string; bgColor: string } => {
  switch (group) {
    case 'Science':
      return { label: 'Science', color: 'text-cyan-800', bgColor: 'bg-cyan-100' };
    case 'Arts':
      return { label: 'Arts', color: 'text-pink-800', bgColor: 'bg-pink-100' };
    case 'Commerce':
      return { label: 'Commerce', color: 'text-orange-800', bgColor: 'bg-orange-100' };
    default:
      return { label: group, color: 'text-gray-800', bgColor: 'bg-gray-100' };
  }
};

// Get tutor statistics
export const getTutorStats = (tutors: Tutor[]) => {
  return {
    total: tutors.length,
    confirmed: tutors.filter(t => t.status === 'confirmed').length,
    pending: tutors.filter(t => t.status === 'pending').length,
    completed: tutors.filter(t => t.status === 'completed').length,
    rejected: tutors.filter(t => t.status === 'rejected').length,
    byVersion: {
      EM: tutors.filter(t => t.version === 'EM').length,
      BM: tutors.filter(t => t.version === 'BM').length,
      EV: tutors.filter(t => t.version === 'EV').length,
    },
    byGroup: {
      Science: tutors.filter(t => t.group === 'Science').length,
      Arts: tutors.filter(t => t.group === 'Arts').length,
      Commerce: tutors.filter(t => t.group === 'Commerce').length,
    }
  };
};

// Filter tutors by multiple criteria
export const filterTutors = (
  tutors: Tutor[],
  searchTerm: string,
  statusFilter: string,
  versionFilter: string,
  groupFilter: string
): Tutor[] => {
  return tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.tutorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.phone.includes(searchTerm) ||
                         (tutor.email && tutor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tutor.address && tutor.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (tutor.universityShortForm && tutor.universityShortForm.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter;
    const matchesVersion = versionFilter === 'all' || tutor.version === versionFilter;
    const matchesGroup = groupFilter === 'all' || tutor.group === groupFilter;

    return matchesSearch && matchesStatus && matchesVersion && matchesGroup;
  });
};

// Sort tutors by field
export const sortTutors = (tutors: Tutor[], field: string, order: 'asc' | 'desc'): Tutor[] => {
  return [...tutors].sort((a, b) => {
    let aValue: any = a[field as keyof Tutor];
    let bValue: any = b[field as keyof Tutor];
    
    if (field === 'createdAt') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
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

// Generate tutor ID
export const generateTutorId = async (): Promise<string> => {
  try {
    const response = await fetch('/api/tutors');
    const tutors = await response.json();
    
    if (tutors.length === 0) {
      return 'T101';
    }
    
    const lastTutor = tutors[tutors.length - 1];
    const lastIdNumber = parseInt(lastTutor.tutorId.replace('T', ''), 10);
    return `T${lastIdNumber + 1}`;
  } catch (error) {
    console.error('Error generating tutor ID:', error);
    return 'T101';
  }
};

// Format tutor for display
export const formatTutorForDisplay = (tutor: Tutor) => {
  return {
    ...tutor,
    formattedStatus: formatTutorStatus(tutor.status),
    formattedVersion: tutor.version ? formatTutorVersion(tutor.version) : null,
    formattedGroup: tutor.group ? formatTutorGroup(tutor.group) : null,
    formattedAddress: tutor.address ? formatAddress(tutor.address) : null,
    formattedLocation: tutor.preferredLocation ? tutor.preferredLocation.map(formatLocation) : null,
  };
}; 