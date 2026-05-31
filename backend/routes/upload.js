const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { parseFile } = require('../utils/fileParser');
const pool = require('../utils/db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload
router.post('/', (req, res) => {
  const broadcast = req.app.locals.broadcast;

  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError)
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    if (err)
      return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file)
      return res.status(400).json({ error: 'No file uploaded or unsupported file type (CSV/XLSX only)' });

    const fileId = uuidv4();
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const userId = req.user.id;

    try {
      broadcast({ type: 'upload_status', status: 'parsing', fileId, fileName: originalName, progress: 30 });

      const { data, columns, rowCount, summary } = await parseFile(filePath, originalName);

      broadcast({ type: 'upload_status', status: 'saving', fileId, progress: 70 });

      // Save metadata to datasets table
      await pool.query(
        `INSERT INTO datasets (file_id, user_id, file_name, row_count, column_count, summary, columns_meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [fileId, userId, originalName, rowCount, columns.length, JSON.stringify(summary), JSON.stringify(columns)]
      );

      // Save row data to dataset_rows table
      await pool.query(
        `INSERT INTO dataset_rows (file_id, rows) VALUES ($1, $2)`,
        [fileId, JSON.stringify(data)]
      );

      fs.unlink(filePath, () => {});

      broadcast({ type: 'upload_status', status: 'complete', fileId, fileName: originalName, progress: 100, rowCount, columns: columns.length });

      res.json({ success: true, fileId, fileName: originalName, rowCount, columns, summary });
    } catch (parseErr) {
      console.error('Upload/parse error:', parseErr);
      fs.unlink(filePath, () => {});
      broadcast({ type: 'upload_status', status: 'error', fileId, error: parseErr.message });
      res.status(500).json({ error: `Failed to process file: ${parseErr.message}` });
    }
  });
});

// GET /api/upload — list user's datasets
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT file_id, file_name, uploaded_at, row_count, column_count
       FROM datasets WHERE user_id = $1
       ORDER BY uploaded_at DESC`,
      [req.user.id]
    );
    res.json({
      datasets: rows.map(r => ({
        fileId: r.file_id,
        fileName: r.file_name,
        uploadedAt: r.uploaded_at,
        rowCount: r.row_count,
        columnCount: r.column_count,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/upload/:fileId — get full dataset
router.get('/:fileId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.file_id, d.file_name, d.uploaded_at, d.row_count, d.summary,
              d.columns_meta, dr.rows
       FROM datasets d
       JOIN dataset_rows dr ON d.file_id = dr.file_id
       WHERE d.file_id = $1 AND d.user_id = $2`,
      [req.params.fileId, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Dataset not found' });

    const r = rows[0];
    res.json({
      fileId: r.file_id,
      fileName: r.file_name,
      uploadedAt: r.uploaded_at,
      rowCount: r.row_count,
      summary: r.summary,
      columns: r.columns_meta,
      data: r.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/upload/:fileId
router.delete('/:fileId', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM datasets WHERE file_id = $1 AND user_id = $2',
      [req.params.fileId, req.user.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Dataset not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;