export interface User {
  id: number;
  userId: number;
  email: string;
  name: string;
  role: 'FOUNDER' | 'INVESTOR' | 'CO_FOUNDER';
}

export interface Startup {
  id: number;
  founderId: number;
  name: string;
  description: string;
  problemStatement?: string;
  solution?: string;
  stage: string;
  industry: string;
  location: string;
  fundingGoal: number;
  isApproved: boolean;
  isRejected?: boolean;
  totalRaised?: number;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  startupId: number;
  investorId: number;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'AWAITING_APPROVAL' | 'FAILED' | 'COMPLETED';
  startupName?: string;
  createdAt?: string;
  paymentMethod?: string;
}

export interface TeamMember {
  id: number;
  startupId: number;
  userId: number;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}
