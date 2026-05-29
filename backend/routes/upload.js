const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { parseFile } = require('../utils/fileParser');

const router = express.Router();

// In-memory dataset store (swap for DB in production)
const dataStore = new Map();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only CSV and Excel files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload
router.post('/', (req, res, next) => {
  // Multer v2 + Express 5: call as middleware manually to catch errors
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'File upload error' });
    }

    const broadcast = req.app.locals.broadcast;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const filePath = req.file.path;

    broadcast({ type: 'upload_status', status: 'parsing', fileId, fileName: req.file.originalname, progress: 10 });

    try {
      broadcast({ type: 'upload_status', status: 'parsing', fileId, progress: 40 });

      const { data, columns, rowCount, summary } = await parseFile(filePath, req.file.originalname);

      broadcast({ type: 'upload_status', status: 'processing', fileId, progress: 70 });

      const dataset = {
        fileId,
        fileName: req.file.originalname,
        uploadedAt: new Date().toISOString(),
        rowCount,
        columns,
        data,
        summary,
      };

      dataStore.set(fileId, dataset);
      fs.unlink(filePath, () => {});

      broadcast({ type: 'upload_status', status: 'complete', fileId, fileName: req.file.originalname, progress: 100, rowCount, columns: columns.length });

      res.json({ success: true, fileId, fileName: req.file.originalname, rowCount, columns, summary });
    } catch (parseErr) {
      fs.unlink(filePath, () => {});
      broadcast({ type: 'upload_status', status: 'error', fileId, error: parseErr.message });
      res.status(500).json({ error: `Failed to parse file: ${parseErr.message}` });
    }
  });
});

// GET /api/upload
router.get('/', (req, res) => {
  const list = Array.from(dataStore.values()).map(({ fileId, fileName, uploadedAt, rowCount, columns }) => ({
    fileId, fileName, uploadedAt, rowCount, columnCount: columns.length,
  }));
  res.json({ datasets: list });
});

// GET /api/upload/:fileId
router.get('/:fileId', (req, res) => {
  const dataset = dataStore.get(req.params.fileId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
  res.json(dataset);
});

// DELETE /api/upload/:fileId
router.delete('/:fileId', (req, res) => {
  const deleted = dataStore.delete(req.params.fileId);
  if (!deleted) return res.status(404).json({ error: 'Dataset not found' });
  res.json({ success: true });
});

module.exports = router;
module.exports.dataStore = dataStore;
