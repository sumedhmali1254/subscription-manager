import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Download } from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { EmptyState } from '../common/EmptyState';
import { TableSkeleton } from '../common/LoadingSkeleton';
import { exportToCsv } from '../../utils/exportCsv';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  searchField = '', // If not provided, searches all text fields
  filterComponent,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search query or filters.',
  emptyActionLabel,
  onEmptyAction,
  pageSize = 10,
  rowKey = 'id',
  onRowClick,
  exportFilename,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchField && item[searchField]) {
        return String(item[searchField]).toLowerCase().includes(term);
      }
      return Object.values(item).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        return false;
      });
    });
  }, [data, searchTerm, searchField]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string') {
        const res = aVal.localeCompare(bVal);
        return sortOrder === 'asc' ? res : -res;
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    const exportHeaders = columns
      .filter(c => c.key && c.header)
      .map(c => ({ key: c.key, label: typeof c.header === 'string' ? c.header : c.key }));
    exportToCsv(exportFilename || 'table_export', sortedData, exportHeaders);
  };

  if (loading) {
    return <TableSkeleton rows={pageSize} cols={columns.length} />;
  }

  return (
    <div className={`bg-white dark:bg-[#1E293B] rounded-xl border border-[#E7EAF0] dark:border-slate-800 shadow-card overflow-hidden ${className}`}>
      {/* Controls Bar */}
      <div className="p-4 border-b border-[#E7EAF0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1E293B]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#E7EAF0] dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-[#5263D9] focus:ring-2 focus:ring-[#5263D9]/15 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-[#202744] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {filterComponent}
          {exportFilename && (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748B] dark:text-slate-300 hover:text-[#202744] dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[#E7EAF0] dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Export current table data to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F5F7FB] dark:bg-[#0F172A] border-b border-[#E7EAF0] dark:border-slate-800">
              {columns.map((col, index) => {
                const isSortable = col.sortable !== false && col.key;
                const isSorted = sortKey === col.key;

                return (
                  <th
                    key={col.key || index}
                    onClick={() => isSortable && handleSort(col.key)}
                    className={`
                      px-4 py-3 font-semibold text-[#8FA3BE] dark:text-slate-400 tracking-wider uppercase text-[10px] select-none whitespace-nowrap
                      ${isSortable ? 'cursor-pointer hover:text-[#202744] dark:hover:text-white' : ''}
                      ${col.className || ''}
                    `}
                  >
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="whitespace-nowrap">{col.header}</span>
                      {isSortable && (
                        <span className="text-slate-400 shrink-0">
                          {isSorted ? (
                            sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-[#5263D9]" /> : <ArrowDown className="w-3 h-3 text-[#5263D9]" />
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="font-sans">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row[rowKey] || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    border-b border-[#F1F4F9] dark:border-slate-800/80 transition-colors duration-150
                    ${onRowClick ? 'hover:bg-[#F8FAFF] dark:hover:bg-slate-800/60 cursor-pointer' : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/30'}
                  `}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={col.key || colIndex}
                      className={`px-4 py-3 text-[#202744] dark:text-slate-200 align-middle text-xs whitespace-nowrap ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};
