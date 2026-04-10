import { Startup, Payment } from '../../types';

// ─── Mock Users ───
export const mockFounderUser = {
  userId: 1,
  role: 'ROLE_FOUNDER',
  email: 'founder@founderlink.com',
  name: 'Jane Doe',
};

export const mockInvestorUser = {
  userId: 2,
  role: 'ROLE_INVESTOR',
  email: 'investor@founderlink.com',
  name: 'John Smith',
};

export const mockCoFounderUser = {
  userId: 3,
  role: 'ROLE_COFOUNDER',
  email: 'cofounder@founderlink.com',
  name: 'Alice Brown',
};

export const mockAdminUser = {
  userId: 4,
  role: 'ROLE_ADMIN',
  email: 'admin@founderlink.com',
  name: 'Admin User',
};

// ─── Mock Payments ───
export const mockPaymentSuccess: Payment = {
  id: 900,
  startupId: 101,
  investorId: 2,
  amount: 500000,
  status: 'SUCCESS',
  startupName: 'AeroTech Dynamics',
  createdAt: '2025-06-15T10:00:00Z',
  paymentMethod: 'UPI',
};

export const mockPaymentPending: Payment = {
  id: 901,
  startupId: 101,
  investorId: 2,
  amount: 250000,
  status: 'PENDING',
  startupName: 'AeroTech Dynamics',
  createdAt: '2025-06-16T12:00:00Z',
};

export const mockPaymentAwaiting: Payment = {
  id: 902,
  startupId: 101,
  investorId: 3,
  amount: 300000,
  status: 'AWAITING_APPROVAL',
  startupName: 'AeroTech Dynamics',
  createdAt: '2025-06-17T14:00:00Z',
};

export const mockPaymentFailed: Payment = {
  id: 903,
  startupId: 101,
  investorId: 2,
  amount: 100000,
  status: 'FAILED',
  startupName: 'AeroTech Dynamics',
  createdAt: '2025-06-18T08:00:00Z',
};

export const mockPaymentCompleted: Payment = {
  id: 904,
  startupId: 101,
  investorId: 4,
  amount: 200000,
  status: 'COMPLETED',
  startupName: 'AeroTech Dynamics',
  createdAt: '2025-06-19T10:00:00Z',
};

// ─── Mock Startups ───
export const mockStartup: Startup = {
  id: 101,
  founderId: 1,
  name: 'AeroTech Dynamics',
  description: 'AI-driven aerospace component manufacturing with next-gen efficiency.',
  problemStatement: 'High cost of aerospace manufacturing',
  solution: 'AI-optimized production pipeline',
  stage: 'EARLY_TRACTION',
  industry: 'Aerospace',
  location: 'Seattle, WA',
  fundingGoal: 2000000,
  isApproved: true,
  payments: [mockPaymentSuccess, mockPaymentAwaiting, mockPaymentCompleted],
};

export const mockStartupNoFunding: Startup = {
  id: 102,
  founderId: 1,
  name: 'GreenBot',
  description: 'Sustainable robotics for agriculture automation.',
  stage: 'PRE_SEED',
  industry: 'AgriTech',
  location: 'Austin, TX',
  fundingGoal: 500000,
  isApproved: true,
  payments: [],
};

export const mockStartupOverfunded: Startup = {
  id: 103,
  founderId: 1,
  name: 'NanoHealth',
  description: 'Nano-technology based health monitoring devices.',
  stage: 'SERIES_A',
  industry: 'HealthTech',
  location: 'Boston, MA',
  fundingGoal: 100000,
  isApproved: true,
  payments: [
    { id: 910, startupId: 103, investorId: 2, amount: 80000, status: 'SUCCESS' },
    { id: 911, startupId: 103, investorId: 3, amount: 50000, status: 'COMPLETED' },
  ],
};

export const mockStartupZeroGoal: Startup = {
  id: 104,
  founderId: 1,
  name: 'ZeroGoal Inc',
  description: 'Testing edge case with zero funding goal.',
  stage: 'IDEA',
  industry: 'Other',
  location: 'Nowhere',
  fundingGoal: 0,
  isApproved: false,
  payments: [],
};

// ─── Mock Chat Messages ───
export const mockChatMessages = [
  { id: 1, senderId: 1, receiverId: 2, content: 'Hello, interested in your startup!', createdAt: '2025-06-15T10:00:00Z' },
  { id: 2, senderId: 2, receiverId: 1, content: 'Thanks! Would love to discuss further.', createdAt: '2025-06-15T10:01:00Z' },
  { id: 3, senderId: 1, receiverId: 2, content: 'Can we schedule a call?', createdAt: '2025-06-15T10:02:00Z' },
];

// ─── Mock API Responses ───
export const mockLoginResponse = {
  data: {
    data: {
      token: 'mock-jwt-access-token',
      refreshToken: 'mock-jwt-refresh-token',
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'founder@founderlink.com',
      name: 'Jane Doe',
    },
  },
};

export const mockRefreshResponse = {
  data: {
    data: {
      token: 'new-access-token',
      refreshToken: 'new-refresh-token',
    },
  },
};

// ─── JWT Token Helpers ───
// Creates a valid base64-encoded JWT payload for testing isTokenExpired
export const createMockJWT = (exp: number): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: '1', role: 'ROLE_FOUNDER', exp }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

export const createExpiredJWT = () => createMockJWT(Math.floor(Date.now() / 1000) - 3600); // 1 hour ago
export const createValidJWT = () => createMockJWT(Math.floor(Date.now() / 1000) + 3600);   // 1 hour from now

// ─── Mock Team Members ───
export const mockTeamMember = {
  id: 50,
  startupId: 101,
  userId: 3,
  role: 'CTO',
  status: 'ACCEPTED' as const,
};

export const mockInvitation = {
  id: 51,
  startupId: 101,
  userId: 5,
  role: 'Designer',
  status: 'PENDING' as const,
};
