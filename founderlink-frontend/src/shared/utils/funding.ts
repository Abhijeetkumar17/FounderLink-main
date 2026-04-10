import { Payment } from '../types';

/**
 * Calculates funding metrics using real Razorpay payment statuses.
 * Payments that are SUCCESS or AWAITING_APPROVAL count towards the progress.
 */
export const calculateFundingMetrics = (payments: Payment[] = [], goal: number = 0) => {
  const validPayments = payments.filter(
    (p) => p.status === 'SUCCESS' || p.status === 'AWAITING_APPROVAL' || p.status === 'COMPLETED'
  );
  
  const totalRaised = validPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const progress = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;
  const uniqueInvestors = new Set(validPayments.map((p) => p.investorId)).size;
  
  return {
    totalRaised,
    progress,
    uniqueInvestors,
    remaining: Math.max(goal - totalRaised, 0)
  };
};
