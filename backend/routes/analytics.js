const express = require('express');
const { dataStore } = require('./upload');

const router = express.Router();

// GET /api/analytics/:fileId/kpis
router.get('/:fileId/kpis', (req, res) => {
  const dataset = dataStore.get(req.params.fileId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

  const { data, columns, summary } = dataset;
  const numericCols = columns.filter(c => c.type === 'number');

  const kpis = numericCols.slice(0, 6).map(col => ({
    name: col.name,
    min: col.stats.min,
    max: col.stats.max,
    mean: col.stats.mean,
    median: col.stats.median,
    count: col.stats.count,
    nullCount: col.stats.nullCount,
  }));

  res.json({ kpis, summary });
});

// GET /api/analytics/:fileId/chart/:columnName
router.get('/:fileId/chart/:columnName', (req, res) => {
  const dataset = dataStore.get(req.params.fileId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

  const { data, columns } = dataset;
  const colName = req.params.columnName;
  const colMeta = columns.find(c => c.name === colName);
  if (!colMeta) return res.status(404).json({ error: 'Column not found' });

  if (colMeta.type === 'number') {
    // Histogram with 10 bins
    const values = data.map(r => parseFloat(r[colName])).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / 10 || 1;
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0,
    }));
    values.forEach(v => {
      const idx = Math.min(Math.floor((v - min) / binSize), 9);
      bins[idx].count++;
    });
    res.json({ type: 'histogram', data: bins, column: colName });
  } else {
    // Frequency chart for categorical
    const freq = {};
    data.forEach(r => {
      const v = String(r[colName] || 'N/A').substring(0, 30);
      freq[v] = (freq[v] || 0) + 1;
    });
    const chartData = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, value]) => ({ name, value }));
    res.json({ type: 'bar', data: chartData, column: colName });
  }
});

// GET /api/analytics/:fileId/scatter
router.get('/:fileId/scatter', (req, res) => {
  const dataset = dataStore.get(req.params.fileId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

  const { data, columns } = dataset;
  const numericCols = columns.filter(c => c.type === 'number');

  if (numericCols.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 numeric columns for scatter plot' });
  }

  const xCol = req.query.x || numericCols[0].name;
  const yCol = req.query.y || numericCols[1].name;

  const scatterData = data
    .slice(0, 500)
    .map(row => ({
      x: parseFloat(row[xCol]),
      y: parseFloat(row[yCol]),
    }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y));

  res.json({ data: scatterData, xCol, yCol });
});

// GET /api/analytics/:fileId/timeseries
router.get('/:fileId/timeseries', (req, res) => {
  const dataset = dataStore.get(req.params.fileId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

  const { data, columns } = dataset;
  const dateCols = columns.filter(c => c.type === 'date');
  const numericCols = columns.filter(c => c.type === 'number');

  if (dateCols.length === 0 || numericCols.length === 0) {
    return res.status(400).json({ error: 'No date/numeric columns found for time series' });
  }

  const dateCol = req.query.date || dateCols[0].name;
  const valueCol = req.query.value || numericCols[0].name;

  const points = data
    .map(row => ({ date: new Date(row[dateCol]), value: parseFloat(row[valueCol]) }))
    .filter(p => !isNaN(p.date.getTime()) && !isNaN(p.value))
    .sort((a, b) => a.date - b.date)
    .slice(0, 200)
    .map(p => ({ date: p.date.toISOString().split('T')[0], value: p.value }));

  res.json({ data: points, dateCol, valueCol });
});

// GET /api/analytics/:fileId/correlation
router.get('/:fileId/correlation', (req, res) => {
  const dataset = dataStore.get(req.params.fileId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

  const { data, columns } = dataset;
  const numericCols = columns.filter(c => c.type === 'number').slice(0, 8);

  if (numericCols.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 numeric columns' });
  }

  const pearson = (xs, ys) => {
    const n = xs.length;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    const num = xs.reduce((s, x, i) => s + (x - meanX) * (ys[i] - meanY), 0);
    const denom = Math.sqrt(xs.reduce((s, x) => s + (x - meanX) ** 2, 0) * ys.reduce((s, y) => s + (y - meanY) ** 2, 0));
    return denom === 0 ? 0 : Math.round((num / denom) * 100) / 100;
  };

  const matrix = numericCols.map(col1 => {
    const xs = data.map(r => parseFloat(r[col1.name])).filter((v, i, arr) => !isNaN(v));
    return numericCols.map(col2 => {
      const ys = data.map(r => parseFloat(r[col2.name]));
      const paired = xs.map((x, i) => [x, ys[i]]).filter(([, y]) => !isNaN(y));
      return pearson(paired.map(p => p[0]), paired.map(p => p[1]));
    });
  });

  res.json({ columns: numericCols.map(c => c.name), matrix });
});

module.exports = router;
