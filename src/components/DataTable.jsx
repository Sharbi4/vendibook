import React, { useState, useMemo } from 'react';

// Generic data table with optional basic client sorting and loading / empty states.
// columns: [{ key, header, width?, render?(row), sortable? }]
export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No records found',
  getRowKey = (row) => row.id || JSON.stringify(row),
  rowClassName = '',
  onRowClick
}) {
  const [sortConfig, setSortConfig] = useState(null); // { key, direction }

  const handleSort = (col) => {
    if (!col.sortable) return;
    setSortConfig((prev) => {
      if (prev?.key === col.key) {
        // toggle direction
        const direction = prev.direction === 'asc' ? 'desc' : 'asc';
        return { key: col.key, direction };
      }
      return { key: col.key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    const col = columns.find((c) => c.key === sortConfig.key);
    if (!col) return data;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (av == null && bv == null) return 0;
      if (av == null) return -1 * direction;
      if (bv == null) return 1 * direction;
      if (av < bv) return -1 * direction;
      if (av > bv) return 1 * direction;
      return 0;
    });
  }, [sortConfig, data, columns]);

  return (
    <div className="bg-white rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((col) => {
              const isSorted = sortConfig?.key === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`px-6 py-3 text-left text-sm font-bold text-gray-900 select-none ${col.sortable ? 'cursor-pointer hover:text-blue-600' : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={isSorted ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && isSorted && (
                      <span className="text-xs text-gray-500">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12">
                <div className="space-y-3 animate-pulse">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-200 rounded" />
                  ))}
                </div>
              </td>
            </tr>
          )}
          {!isLoading && sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading && sortedData.map((row) => (
            <tr
              key={getRowKey(row)}
              className={`border-b hover:bg-gray-50 transition ${rowClassName}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-3 text-sm text-gray-700">
                  {col.render ? col.render(row) : formatCell(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value) {
  if (value == null) return '–';
  if (value instanceof Date) return value.toLocaleDateString();
  return value;
}