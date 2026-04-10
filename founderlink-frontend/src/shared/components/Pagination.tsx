import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm mt-4">
      <p className="text-sm text-gray-500 font-medium">
        Page <span className="text-gray-900 font-semibold">{page}</span> of <span className="text-gray-900 font-semibold">{totalPages}</span>
      </p>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
