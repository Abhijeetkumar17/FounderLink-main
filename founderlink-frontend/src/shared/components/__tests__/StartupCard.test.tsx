import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders, authenticatedState, investorState, cofounderState } from './test-utils';
import { mockStartup, mockStartupNoFunding, mockStartupOverfunded, mockStartupZeroGoal } from './mockData';
import StartupCard from '../StartupCard';

// We need to mock useAuth for controlled role testing
vi.mock('../../hooks/useAuth', () => ({
  default: vi.fn(() => ({
    isFounder: false,
    isCoFounder: false,
    isInvestor: false,
    isAdmin: false,
    userId: 99,
    role: 'ROLE_INVESTOR',
    user: null,
    isAuthenticated: true,
  })),
}));

// Import the mocked hook for runtime control
import useAuth from '../../hooks/useAuth';
const mockedUseAuth = vi.mocked(useAuth);

// Mock the funding utility — we let it run real logic through the mockData
vi.mock('../../utils/funding', () => ({
  calculateFundingMetrics: vi.fn((payments = [], goal = 0) => {
    const validPayments = payments.filter(
      (p: any) => p.status === 'SUCCESS' || p.status === 'AWAITING_APPROVAL' || p.status === 'COMPLETED',
    );
    const totalRaised = validPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const progress = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;
    return {
      totalRaised,
      progress,
      uniqueInvestors: new Set(validPayments.map((p: any) => p.investorId)).size,
      remaining: Math.max(goal - totalRaised, 0),
    };
  }),
}));

describe('StartupCard Component', () => {
  // ═══════════════════════════════════════════════════════════
  //  Normal: Renders startup information
  // ═══════════════════════════════════════════════════════════

  it('should render startup name, description, and location', () => {
    renderWithProviders(<StartupCard startup={mockStartup} />, {
      preloadedState: investorState,
    });

    expect(screen.getByText('AeroTech Dynamics')).toBeInTheDocument();
    expect(screen.getByText(/AI-driven aerospace/i)).toBeInTheDocument();
    expect(screen.getByText('Seattle, WA')).toBeInTheDocument();
    expect(screen.getByText('Aerospace')).toBeInTheDocument();
    expect(screen.getByText('EARLY_TRACTION')).toBeInTheDocument();
  });

  it('should render "View Details" link', () => {
    renderWithProviders(<StartupCard startup={mockStartup} />, {
      preloadedState: investorState,
    });

    const link = screen.getByText(/View Details/i).closest('a');
    expect(link).toBeInTheDocument();
  });

  it('should show funding progress percentage', () => {
    renderWithProviders(<StartupCard startup={mockStartup} />, {
      preloadedState: investorState,
    });

    // mockStartup has 1M / 2M = 50%
    expect(screen.getByText(/50\.0% funded/)).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: No funding / Zero goal / Overfunded
  // ═══════════════════════════════════════════════════════════

  it('should show 0% when startup has no payments', () => {
    renderWithProviders(<StartupCard startup={mockStartupNoFunding} />, {
      preloadedState: investorState,
    });

    expect(screen.getByText(/0\.0% funded/)).toBeInTheDocument();
  });

  it('should cap progress at 100% for overfunded startups', () => {
    renderWithProviders(<StartupCard startup={mockStartupOverfunded} />, {
      preloadedState: investorState,
    });

    expect(screen.getByText(/100\.0% funded/)).toBeInTheDocument();
  });

  it('should handle zero funding goal gracefully', () => {
    renderWithProviders(<StartupCard startup={mockStartupZeroGoal} />, {
      preloadedState: investorState,
    });

    expect(screen.getByText(/0\.0% funded/)).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════
  //  Routing based on role/props
  // ═══════════════════════════════════════════════════════════

  it('should link to investor route when isFounder prop is false', () => {
    mockedUseAuth.mockReturnValue({
      isFounder: false, isCoFounder: false, isInvestor: true,
      isAdmin: false, userId: 2, role: 'ROLE_INVESTOR',
      user: null, isAuthenticated: true,
    });

    renderWithProviders(<StartupCard startup={mockStartup} />, {
      preloadedState: investorState,
    });

    const link = screen.getByText(/View Details/i).closest('a');
    expect(link).toHaveAttribute('href', '/investor/startups/101');
  });

  it('should link to founder route when isFounder prop is true', () => {
    mockedUseAuth.mockReturnValue({
      isFounder: false, isCoFounder: false, isInvestor: false,
      isAdmin: false, userId: 1, role: 'ROLE_INVESTOR',
      user: null, isAuthenticated: true,
    });

    renderWithProviders(<StartupCard startup={mockStartup} isFounder={true} />, {
      preloadedState: investorState,
    });

    const link = screen.getByText(/View Details/i).closest('a');
    expect(link).toHaveAttribute('href', '/founder/startups/101');
  });

  it('should link to cofounder route for cofounder role', () => {
    mockedUseAuth.mockReturnValue({
      isFounder: false, isCoFounder: true, isInvestor: false,
      isAdmin: false, userId: 3, role: 'ROLE_COFOUNDER',
      user: null, isAuthenticated: true,
    });

    renderWithProviders(<StartupCard startup={mockStartup} />, {
      preloadedState: cofounderState,
    });

    const link = screen.getByText(/View Details/i).closest('a');
    expect(link).toHaveAttribute('href', '/cofounder/startups/101');
  });
});
