export const mockUser = {
  id: 1,
  email: 'testfounder@example.com',
  name: 'Jane Doe',
  role: 'ROLE_FOUNDER',
  createdAt: new Date().toISOString()
};

export const mockStartup = {
  id: 101,
  name: 'AeroTech Dynamics',
  description: 'AI-driven aerospace component manufacturing.',
  industry: 'Aerospace',
  stage: 'EARLY_TRACTION',
  fundingGoal: 2000000,
  location: 'Seattle, WA',
  createdAt: new Date().toISOString()
};

export const mockInvitation = {
  id: 50,
  startupId: 101,
  inviterId: 1,
  inviteeId: 2,
  role: 'CTO',
  status: 'PENDING',
  createdAt: new Date().toISOString()
};

export const mockPayment = {
  id: 900,
  investorId: 3,
  startupId: 101,
  amount: 50000,
  currency: 'INR',
  status: 'SUCCESS',
  razorpayPaymentId: 'pay_Mock12345678',
  createdAt: new Date().toISOString()
};
