import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-[#E7EAF0] text-xs text-[#64748B] ${className}`}>
      <div>
        Showing <span className="font-semibold text-[#202744]">{startItem}</span> to{' '}
        <span className="font-semibold text-[#202744]">{endItem}</span> of{' '}
        <span className="font-semibold text-[#202744]">{totalItems}</span> results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg border border-[#E7EAF0] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          // Show first, last, current, and neighbours
          if (
            totalPages > 7 &&
            pageNum !== 1 &&
            pageNum !== totalPages &&
            Math.abs(pageNum - currentPage) > 1
          ) {
            if (pageNum === 2 || pageNum === totalPages - 1) {
              return <span key={pageNum} className="px-1 text-slate-400">...</span>;
            }
            return null;
          }

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`
                min-w-[30px] h-[30px] px-2 rounded-lg font-medium transition-colors text-xs
                ${currentPage === pageNum
                  ? 'bg-[#5263D9] text-white'
                  : 'text-[#64748B] hover:bg-slate-100 border border-[#E7EAF0]'
                }
              `}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-[#E7EAF0] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

