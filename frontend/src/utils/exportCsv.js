/**
 * Export array of objects to CSV download
 */
export const exportToCsv = (filename, rows, headers) => {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = headers ? headers.map(h => h.key) : Object.keys(rows[0]);
  const headerLabels = headers ? headers.map(h => `"${h.label}"`) : keys.map(k => `"${k}"`);

  const csvContent = [
    headerLabels.join(separator),
    ...rows.map(row =>
      keys
        .map(key => {
          let cell = row[key];
          if (cell === null || cell === undefined) {
            cell = '';
          } else if (typeof cell === 'object') {
            cell = JSON.stringify(cell);
          } else {
            cell = String(cell);
          }
          // Escape double quotes
          cell = cell.replace(/"/g, '""');
          return `"${cell}"`;
        })
        .join(separator)
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

