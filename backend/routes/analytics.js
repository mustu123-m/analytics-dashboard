const express = require('express');
const pool = require('../utils/db');

const router = express.Router();

// Helper — fetch dataset from DB
const getDataset = async (fileId, userId) => {
  const { rows } = await pool.query(
    `SELECT d.columns_meta, d.summary, d.row_count, dr.rows
     FROM datasets d
     JOIN dataset_rows dr ON d.file_id = dr.file_id
     WHERE d.file_id = $1 AND d.user_id = $2`,
    [fileId, userId]
  );
  if (!rows[0]) return null;
  return {
    columns: rows[0].columns_meta,
    summary: rows[0].summary,
    rowCount: rows[0].row_count,
    data: rows[0].rows,
  };
};

// GET /api/analytics/:fileId/kpis
router.get('/:fileId/kpis', async (req, res) => {
  try {
    const dataset = await getDataset(req.params.fileId, req.user.id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const { columns, summary } = dataset;
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/:fileId/chart/:columnName
router.get('/:fileId/chart/:columnName', async (req, res) => {
  try {
    const dataset = await getDataset(req.params.fileId, req.user.id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const { data, columns } = dataset;
    const colName = req.params.columnName;
    const colMeta = columns.find(c => c.name === colName);
    if (!colMeta) return res.status(404).json({ error: 'Column not found' });

    if (colMeta.type === 'number') {
      const values = data.map(r => parseFloat(r[colName])).filter(v => !isNaN(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binSize = (max - min) / 10 || 1;
      const bins = Array.from({ length: 10 }, (_, i) => ({
        range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
        count: 0,
      }));
      values.forEach(v => { bins[Math.min(Math.floor((v - min) / binSize), 9)].count++; });
      res.json({ type: 'histogram', data: bins, column: colName });
    } else {
      const freq = {};
      data.forEach(r => { const v = String(r[colName] || 'N/A').substring(0, 30); freq[v] = (freq[v] || 0) + 1; });
      const chartData = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name, value]) => ({ name, value }));
      res.json({ type: 'bar', data: chartData, column: colName });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/:fileId/scatter
router.get('/:fileId/scatter', async (req, res) => {
  try {
    const dataset = await getDataset(req.params.fileId, req.user.id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const { data, columns } = dataset;
    const numericCols = columns.filter(c => c.type === 'number');
    if (numericCols.length < 2) return res.status(400).json({ error: 'Need at least 2 numeric columns' });

    const xCol = req.query.x || numericCols[0].name;
    const yCol = req.query.y || numericCols[1].name;

    const scatterData = data
      .slice(0, 500)
      .map(row => ({ x: parseFloat(row[xCol]), y: parseFloat(row[yCol]) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));

    res.json({ data: scatterData, xCol, yCol });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/:fileId/correlation
router.get('/:fileId/correlation', async (req, res) => {
  try {
    const dataset = await getDataset(req.params.fileId, req.user.id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

    const { data, columns } = dataset;
    const numericCols = columns.filter(c => c.type === 'number').slice(0, 8);
    if (numericCols.length < 2) return res.status(400).json({ error: 'Need at least 2 numeric columns' });

    const pearson = (xs, ys) => {
      const n = xs.length;
      const mx = xs.reduce((a, b) => a + b, 0) / n;
      const my = ys.reduce((a, b) => a + b, 0) / n;
      const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
      const den = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0) * ys.reduce((s, y) => s + (y - my) ** 2, 0));
      return den === 0 ? 0 : Math.round((num / den) * 100) / 100;
    };

    const matrix = numericCols.map(col1 => {
      const xs = data.map(r => parseFloat(r[col1.name])).filter(v => !isNaN(v));
      return numericCols.map(col2 => {
        const ys = data.map(r => parseFloat(r[col2.name]));
        const paired = xs.map((x, i) => [x, ys[i]]).filter(([, y]) => !isNaN(y));
        return pearson(paired.map(p => p[0]), paired.map(p => p[1]));
      });
    });

    res.json({ columns: numericCols.map(c => c.name), matrix });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;