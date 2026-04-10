import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { FileUpload } from '../FileUpload';

describe('FileUpload Component', () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: Renders UI elements
  // ═══════════════════════════════════════════════════════════

  it('should render the upload prompt text', () => {
    renderWithProviders(<FileUpload {...defaultProps} />);

    expect(screen.getByText(/Drag & drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/browse from your computer/i)).toBeInTheDocument();
  });

  it('should display default max size', () => {
    renderWithProviders(<FileUpload {...defaultProps} />);
    expect(screen.getByText('Max 5MB')).toBeInTheDocument();
  });

  it('should display custom max size', () => {
    renderWithProviders(<FileUpload {...defaultProps} maxSizeInMB={10} />);
    expect(screen.getByText('Max 10MB')).toBeInTheDocument();
  });

  it('should display custom accept format', () => {
    renderWithProviders(<FileUpload {...defaultProps} accept=".pdf,.doc" />);
    expect(screen.getByText('.pdf,.doc')).toBeInTheDocument();
  });

  it('should display "All formats" when no accept prop', () => {
    renderWithProviders(<FileUpload {...defaultProps} />);
    expect(screen.getByText('All formats')).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: File selection via input
  // ═══════════════════════════════════════════════════════════

  it('should call onFileSelect when a valid file is selected via input', () => {
    const onFileSelect = vi.fn();
    renderWithProviders(<FileUpload onFileSelect={onFileSelect} />);

    const input = screen.getByLabelText(/browse from your computer/i) as HTMLInputElement;
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 }); // 1 KB

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: File size validation
  // ═══════════════════════════════════════════════════════════

  it('should show error when file exceeds max size via input', () => {
    const onFileSelect = vi.fn();
    renderWithProviders(<FileUpload onFileSelect={onFileSelect} maxSizeInMB={1} />);

    const input = screen.getByLabelText(/browse from your computer/i) as HTMLInputElement;
    const file = new File(['x'.repeat(100)], 'big.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB > 1MB limit

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/File exceeds maximum size of 1MB/i)).toBeInTheDocument();
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it('should accept file exactly at limit via input', () => {
    const onFileSelect = vi.fn();
    renderWithProviders(<FileUpload onFileSelect={onFileSelect} maxSizeInMB={5} />);

    const input = screen.getByLabelText(/browse from your computer/i) as HTMLInputElement;
    const file = new File(['x'], 'exact.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // exactly 5MB

    fireEvent.change(input, { target: { files: [file] } });

    // The source uses: file.size > maxSizeInMB * 1024 * 1024
    // 5*1024*1024 > 5*1024*1024 = false, so file IS accepted (exactly at limit)
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  // ═══════════════════════════════════════════════════════════
  //  Drag and drop interaction
  // ═══════════════════════════════════════════════════════════

  it('should handle drag over', () => {
    renderWithProviders(<FileUpload {...defaultProps} />);

    const dropZone = screen.getByText(/Drag & drop your file here/i).closest('div[class*="border-dashed"]') || screen.getByText(/Drag & drop your file here/i).parentElement!;

    fireEvent.dragOver(dropZone, { preventDefault: vi.fn() });

    // The component applies hover styles — we just confirm no error
    expect(dropZone).toBeInTheDocument();
  });

  it('should call onFileSelect on valid drop', async () => {
    const onFileSelect = vi.fn();
    renderWithProviders(<FileUpload onFileSelect={onFileSelect} />);

    const dropZone = screen.getByText(/Drag & drop your file here/i).parentElement!;
    const file = new File(['content'], 'dropped.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 100 });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('should show error when dropped file exceeds limit', () => {
    const onFileSelect = vi.fn();
    renderWithProviders(<FileUpload onFileSelect={onFileSelect} maxSizeInMB={1} />);

    const dropZone = screen.getByText(/Drag & drop your file here/i).parentElement!;
    const file = new File(['x'], 'toobig.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByText(/File exceeds maximum size of 1MB/i)).toBeInTheDocument();
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════
  //  Exception: No files selected
  // ═══════════════════════════════════════════════════════════

  it('should not call onFileSelect when input change has no files', () => {
    const onFileSelect = vi.fn();
    renderWithProviders(<FileUpload onFileSelect={onFileSelect} />);

    const input = screen.getByLabelText(/browse from your computer/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [] } });

    expect(onFileSelect).not.toHaveBeenCalled();
  });
});
