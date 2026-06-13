'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadFile, listDatasets, getDataset, deleteDataset } from '@/lib/api';

interface Props {
  onDatasetLoaded: (dataset: any) => void;
  subscribe: (fn: (msg: any) => void) => () => void;
}

const STATUS_LABELS: Record<string, string> = {
  uploading: 'Uploading file',
  parsing: 'Parsing dataset',
  processing: 'Computing column stats',
  saving: 'Saving to database',
  complete: 'Ready!',
  error: 'Failed',
};

const FILE_COLORS: Record<string, string> = {
  CSV: '#2DD4A7', XLS: '#6D5EF5', XLSX: '#6D5EF5',
};

export default function UploadZone({ onDatasetLoaded, subscribe }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => { loadDatasets(); }, []);

  useEffect(() => {
    const unsub = subscribe((msg) => {
      if (msg.type === 'upload_status') {
        if (msg.progress) setProgress(msg.progress);
        if (msg.status) setStatus(msg.status);
        if (msg.status === 'error') setError(msg.error || 'Upload failed');
      }
    });
    return unsub;
  }, [subscribe]);

  const loadDatasets = async () => {
    try { setDatasets((await listDatasets()).datasets); } catch {}
    setLoadingList(false);
  };

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setUploading(true);
    setError('');
    setProgress(8);
    setStatus('uploading');

    const ticker = setInterval(() => setProgress(p => p < 55 ? p + 4 : p), 350);

    try {
      const result = await uploadFile(files[0]);
      clearInterval(ticker);
      setProgress(100);
      setStatus('complete');
      await loadDatasets();
      setTimeout(async () => {
        setUploading(false);
        setProgress(0);
        setStatus('');
        onDatasetLoaded(await getDataset(result.fileId));
      }, 600);
    } catch (e: any) {
      clearInterval(ticker);
      setError(e.message || 'Upload failed — check the backend is running');
      setUploading(false);
      setProgress(0);
      setStatus('');
    }
  }, [onDatasetLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleDelete = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await deleteDataset(fileId); } catch {}
    loadDatasets();
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-6 py-10">

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3" style={{ background: 'var(--grad-soft)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--indigo)' }} />
            <span className="text-xs font-semibold grad-text">Step 1 of 2</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1.5">Upload your dataset</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Drop a CSV or Excel file — we'll detect column types, compute stats, and generate AI insights automatically.
          </p>
        </motion.div>

        {/* Drop zone */}
        <div {...getRootProps()}
          className="relative rounded-3xl p-12 mb-10 transition-all cursor-pointer overflow-hidden hover:scale-[1.005]"
          style={{
            border: `2px dashed ${isDragActive ? 'var(--indigo)' : error ? 'var(--red)' : 'var(--border-2)'}`,
            background: isDragActive ? 'var(--grad-soft)' : 'var(--surface)',
            cursor: uploading ? 'default' : 'pointer',
          }}>
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border)" strokeWidth="5" />
                    <motion.circle cx="32" cy="32" r="28" fill="none" stroke="var(--indigo)" strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 28}
                      animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - progress / 100) }}
                      transition={{ duration: 0.4 }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold mono">{progress}%</div>
                </div>
                <p className="text-sm font-semibold">{STATUS_LABELS[status] || 'Working…'}</p>
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,107,107,0.1)' }}>
                  <span className="text-xl">⚠</span>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--red)' }}>{error}</p>
                <p className="text-xs" style={{ color: 'var(--dim)' }}>Click anywhere to try again</p>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center text-center gap-4">
                <motion.div animate={{ y: isDragActive ? -6 : 0 }} className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--grad-soft)' }}>
                  <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
                    <path d="M8 11V3M8 3L5 6M8 3L11 6M3 13H13" stroke="var(--indigo)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                <div>
                  <p className="text-base font-bold mb-1">{isDragActive ? 'Drop it here!' : 'Drag & drop your file'}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>or <span className="grad-text font-semibold">browse</span> from your computer</p>
                </div>
                <div className="flex gap-2 mt-1">
                  {['CSV', 'XLSX', 'XLS'].map(ext => (
                    <span key={ext} className="text-xs font-bold mono px-2.5 py-1 rounded-lg" style={{ background: 'var(--surface-2)', color: FILE_COLORS[ext] || 'var(--muted)' }}>{ext}</span>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--dim)' }}>Max 10MB</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Recent datasets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold">Recent uploads</p>
            {datasets.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>{datasets.length}</span>
            )}
          </div>

          {loadingList ? (
            <div className="space-y-2.5">
              {[1,2].map(i => <div key={i} className="h-[68px] rounded-2xl skeleton" />)}
            </div>
          ) : datasets.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--dim)' }}>No datasets yet — upload one above to get started ✨</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {datasets.map((ds, i) => {
                const ext = ds.fileName?.split('.').pop()?.toUpperCase() || '';
                return (
                  <motion.div key={ds.fileId}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer transition-shadow lift group"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    onClick={() => getDataset(ds.fileId).then(onDatasetLoaded).catch(() => {})}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
                        <span className="text-xs font-bold mono" style={{ color: FILE_COLORS[ext] || 'var(--muted)' }}>{ext.slice(0,4)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{ds.fileName}</p>
                        <p className="text-xs mono" style={{ color: 'var(--dim)' }}>
                          {ds.rowCount?.toLocaleString()} rows · {ds.columnCount} cols
                        </p>
                      </div>
                    </div>
                    <button onClick={(e) => handleDelete(ds.fileId, e)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      style={{ background: 'var(--surface-2)', color: 'var(--red)' }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path d="M3 4H13M6 4V2.5C6 2.2 6.2 2 6.5 2H9.5C9.8 2 10 2.2 10 2.5V4M12 4V13C12 13.5 11.5 14 11 14H5C4.5 14 4 13.5 4 13V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
