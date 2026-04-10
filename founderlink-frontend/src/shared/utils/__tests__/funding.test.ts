import { describe, it, expect } from 'vitest';
import { calculateFundingMetrics } from '../funding';
import { Payment } from '../../types';

describe('calculateFundingMetrics', () => {
  // ═══════════════════════════════════════════════════════════
  //  Normal: Standard funding scenario
  // ═══════════════════════════════════════════════════════════

  it('should calculate metrics from valid payments', () => {
    const payments: Payment[] = [
      { id: 1, startupId: 1, investorId: 10, amount: 100000, status: 'SUCCESS' },
      { id: 2, startupId: 1, investorId: 20, amount: 50000, status: 'COMPLETED' },
      { id: 3, startupId: 1, investorId: 30, amount: 30000, status: 'AWAITING_APPROVAL' },
    ];

    const result = calculateFundingMetrics(payments, 500000);

    expect(result.totalRaised).toBe(180000);
    expect(result.progress).toBeCloseTo(36, 0);
    expect(result.uniqueInvestors).toBe(3);
    expect(result.remaining).toBe(320000);
  });

  it('should exclude PENDING and FAILED payments', () => {
    const payments: Payment[] = [
      { id: 1, startupId: 1, investorId: 10, amount: 100000, status: 'SUCCESS' },
      { id: 2, startupId: 1, investorId: 20, amount: 200000, status: 'PENDING' },
      { id: 3, startupId: 1, investorId: 30, amount: 50000, status: 'FAILED' },
    ];

    const result = calculateFundingMetrics(payments, 500000);

    expect(result.totalRaised).toBe(100000); // Only SUCCESS
    expect(result.uniqueInvestors).toBe(1);
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Empty payments
  // ═══════════════════════════════════════════════════════════

  it('should return zeros for empty payments array', () => {
    const result = calculateFundingMetrics([], 100000);

    expect(result.totalRaised).toBe(0);
    expect(result.progress).toBe(0);
    expect(result.uniqueInvestors).toBe(0);
    expect(result.remaining).toBe(100000);
  });

  it('should handle undefined payments (default to empty)', () => {
    const result = calculateFundingMetrics(undefined as any, 100000);

    expect(result.totalRaised).toBe(0);
    expect(result.progress).toBe(0);
    expect(result.remaining).toBe(100000);
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Zero goal
  // ═══════════════════════════════════════════════════════════

  it('should return 0% progress when goal is zero', () => {
    const payments: Payment[] = [
      { id: 1, startupId: 1, investorId: 10, amount: 50000, status: 'SUCCESS' },
    ];

    const result = calculateFundingMetrics(payments, 0);

    expect(result.totalRaised).toBe(50000);
    expect(result.progress).toBe(0);
    expect(result.remaining).toBe(0); // max(0 - 50000, 0) = 0
  });

  it('should handle undefined goal (default to 0)', () => {
    const result = calculateFundingMetrics([], undefined as any);

    expect(result.progress).toBe(0);
    expect(result.remaining).toBe(0);
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Overfunded (cap at 100%)
  // ═══════════════════════════════════════════════════════════

  it('should cap progress at 100% when overfunded', () => {
    const payments: Payment[] = [
      { id: 1, startupId: 1, investorId: 10, amount: 200000, status: 'SUCCESS' },
    ];

    const result = calculateFundingMetrics(payments, 100000);

    expect(result.totalRaised).toBe(200000);
    expect(result.progress).toBe(100); // Capped
    expect(result.remaining).toBe(0); // max(100k - 200k, 0) = 0
  });

  // ═══════════════════════════════════════════════════════════
  //  Unique investors
  // ═══════════════════════════════════════════════════════════

  it('should count duplicate investor IDs only once', () => {
    const payments: Payment[] = [
      { id: 1, startupId: 1, investorId: 10, amount: 50000, status: 'SUCCESS' },
      { id: 2, startupId: 1, investorId: 10, amount: 30000, status: 'COMPLETED' },
      { id: 3, startupId: 1, investorId: 20, amount: 20000, status: 'SUCCESS' },
    ];

    const result = calculateFundingMetrics(payments, 500000);

    expect(result.uniqueInvestors).toBe(2); // 10 and 20
    expect(result.totalRaised).toBe(100000);
  });

  // ═══════════════════════════════════════════════════════════
  //  Edge: Exact goal match
  // ═══════════════════════════════════════════════════════════

  it('should show exactly 100% when raised equals goal', () => {
    const payments: Payment[] = [
      { id: 1, startupId: 1, investorId: 10, amount: 500000, status: 'SUCCESS' },
    ];

    const result = calculateFundingMetrics(payments, 500000);

    expect(result.progress).toBe(100);
    expect(result.remaining).toBe(0);
  });
});
