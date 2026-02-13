import React from 'react';

const DataTable = ({ 
  columns, 
  data, 
  loading, 
  emptyMessage = 'No data found',
  onRowClick,
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}>
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-3 text-slate-500">
            <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider first:pl-6 last:pr-6"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick?.(row)}
                className={`
                  transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer hover:bg-sky-50/50' : 'hover:bg-slate-50/50'}
                `}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 first:pl-6 last:pr-6">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
