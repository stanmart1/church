export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateJoined: string;
  membershipStatus: 'active' | 'inactive' | 'visitor';
  role: 'member' | 'leader' | 'volunteer';
  birthday?: string;
  gender?: 'male' | 'female';
  maritalStatus?: 'single' | 'married' | 'widowed';
}

export interface Attendance {
  id: string;
  memberId: string;
  date: string;
  serviceType: string;
  present: boolean;
}
