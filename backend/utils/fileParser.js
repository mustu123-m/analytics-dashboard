const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');

/**
 * Detect column type from sample values
 */
function detectType(values) {
  const sample = values.filter(v => v !== null && v !== undefined && v !== '');
  if (sample.length === 0) return 'string';

  const numericCount = sample.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).length;
  if (numericCount / sample.length > 0.8) return 'number';

  const dateCount = sample.filter(v => !isNaN(Date.parse(v))).length;
  if (dateCount / sample.length > 0.7) return 'date';

  return 'string';
}

/**
 * Generate column summary statistics
 */
function summarizeColumn(values, type) {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  const summary = { count: nonNull.length, nullCount: values.length - nonNull.length };

  if (type === 'number') {
    const nums = nonNull.map(v => parseFloat(v)).filter(n => !isNaN(n));
    if (nums.length > 0) {
      summary.min = Math.min(...nums);
      summary.max = Math.max(...nums);
      summary.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      summary.mean = Math.round(summary.mean * 100) / 100;
      const sorted = [...nums].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      summary.median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }
  } else if (type === 'string') {
    const freq = {};
    nonNull.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    summary.uniqueCount = Object.keys(freq).length;
    summary.topValues = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([v, c]) => ({ value: v, count: c }));
  }

  return summary;
}

/**
 * Parse a CSV or Excel file and return structured data
 */
async function parseFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  let rawData = [];

  if (ext === '.csv') {
    rawData = await new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', row => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  } else {
    throw new Error('Unsupported file type');
  }

  if (!rawData.length) throw new Error('File is empty or could not be parsed');

  // Limit to 10000 rows for performance
  const data = rawData.slice(0, 10000);
  const columnNames = Object.keys(data[0]);

  const columns = columnNames.map(name => {
    const values = data.map(row => row[name]);
    const type = detectType(values);
    return { name, type, stats: summarizeColumn(values, type) };
  });

  const summary = {
    totalRows: data.length,
    totalColumns: columns.length,
    numericColumns: columns.filter(c => c.type === 'number').length,
    categoricalColumns: columns.filter(c => c.type === 'string').length,
    dateColumns: columns.filter(c => c.type === 'date').length,
    completeness: Math.round((1 - columns.reduce((acc, c) => acc + c.stats.nullCount, 0) / (data.length * columns.length)) * 100),
  };

  return { data, columns, rowCount: data.length, summary };
}

module.exports = { parseFile };
