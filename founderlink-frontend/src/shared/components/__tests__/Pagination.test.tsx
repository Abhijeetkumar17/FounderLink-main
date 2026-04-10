import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { Pagination } from '../Pagination';

describe('Pagination Component', () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: Renders page info and buttons
  // ═══════════════════════════════════════════════════════════

  it('should render current page and total pages', () => {
    renderWithProviders(<Pagination {...defaultProps} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should call onPageChange with next page when next button is clicked', () => {
    const onPageChange = vi.fn();
    renderWithProviders(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);

    const buttons = screen.getAllByRole('button');
    const nextButton = buttons[1]; // second button is next
    fireEvent.click(nextButton);

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange with previous page when prev button is clicked', () => {
    const onPageChange = vi.fn();
    renderWithProviders(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);

    const buttons = screen.getAllByRole('button');
    const prevButton = buttons[0];
    fireEvent.click(prevButton);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: First and last pages
  // ═══════════════════════════════════════════════════════════

  it('should disable previous button on first page', () => {
    renderWithProviders(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    renderWithProviders(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();
  });

  it('should not call onPageChange when disabled prev button is clicked', () => {
    const onPageChange = vi.fn();
    renderWithProviders(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Single page
  // ═══════════════════════════════════════════════════════════

  it('should disable both buttons when there is only one page', () => {
    renderWithProviders(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  // ═══════════════════════════════════════════════════════════
  //  Mid-range page
  // ═══════════════════════════════════════════════════════════

  it('should enable both buttons on a middle page', () => {
    renderWithProviders(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
    expect(buttons[1]).not.toBeDisabled();
  });
});
