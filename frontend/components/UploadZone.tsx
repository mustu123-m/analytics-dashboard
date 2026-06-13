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

const FILE_GLOW: Record<string, string> = { CSV: 'var(--lime)', XLS: 'var(--violet)', XLSX: 'var(--violet)' };

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
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5">Upload your dataset</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            CSV or Excel files, up to 10MB. Columns are typed automatically.
          </p>
        </motion.div>

        {/* Bento grid: dropzone + format cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div {...getRootProps()}
            className="sm:col-span-2 relative rounded-3xl p-8 sm:p-12 transition-smooth cursor-pointer overflow-hidden glass hover:scale-[1.005]"
            style={{
              borderColor: isDragActive ? 'var(--cyan)' : error ? 'var(--coral)' : 'var(--glass-br)',
              boxShadow: isDragActive ? '0 0 40px rgba(46,230,214,0.15)' : 'none',
              cursor: uploading ? 'default' : 'pointer',
            }}>
            <input {...getInputProps()} />

            <AnimatePresence mode="wait">
              {uploading ? (
                <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center gap-4 w-full max-w-xs mx-auto">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold mono" style={{ background: 'var(--grad-1)', color: '#05060A' }}>
                    {progress}%
                  </div>
                  <p className="text-sm font-semibold">{STATUS_LABELS[status] || 'Working…'}</p>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-2)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: 'var(--grad-1)' }}
                      animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                  </div>
                </motion.div>
              ) : error ? (
                <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,111,156,0.1)' }}>⚠</div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--coral)' }}>{error}</p>
                  <p className="text-xs" style={{ color: 'var(--dim)' }}>Click anywhere to try again</p>
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center gap-4">
                  <motion.div animate={{ y: isDragActive ? -8 : 0, scale: isDragActive ? 1.1 : 1 }} className="w-16 h-16 rounded-2xl flex items-center justify-center relative" style={{ background: 'var(--grad-1)' }}>
                    <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
                      <path d="M8 11V3M8 3L5 6M8 3L11 6M3 13H13" stroke="#05060A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="absolute inset-0 rounded-2xl" style={{ background: 'var(--grad-1)', filter: 'blur(20px)', opacity: 0.5, zIndex: -1 }} />
                  </motion.div>
                  <div>
                    <p className="text-lg font-bold mb-1">{isDragActive ? 'Drop it here!' : 'Drag & drop your file'}</p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>or <span className="grad-text-1 font-bold">browse</span> to upload</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Format info cards — bento side column */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
            {[
              { ext: 'CSV', desc: 'Comma-separated', color: 'var(--lime)' },
              { ext: 'XLSX', desc: 'Excel workbook', color: 'var(--violet)' },
              { ext: '10MB', desc: 'Max file size', color: 'var(--cyan)' },
            ].map((f, i) => (
              <motion.div key={f.ext} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl p-4 glass flex flex-col justify-center">
                <p className="text-lg font-bold mono mb-0.5" style={{ color: f.color }}>{f.ext}</p>
                <p className="text-xs" style={{ color: 'var(--dim)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent datasets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold">Recent uploads</p>
            {datasets.length > 0 && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full mono" style={{ background: 'var(--glass-2)', color: 'var(--muted)' }}>{datasets.length}</span>
            )}
          </div>

          {loadingList ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1,2].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
            </div>
          ) : datasets.length === 0 ? (
            <div className="rounded-2xl p-8 text-center glass">
              <p className="text-sm" style={{ color: 'var(--dim)' }}>No datasets yet — upload one to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {datasets.map((ds, i) => {
                const ext = ds.fileName?.split('.').pop()?.toUpperCase() || '';
                const glow = FILE_GLOW[ext] || 'var(--cyan)';
                return (
                  <motion.div key={ds.fileId}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-smooth glass group"
                    onClick={() => getDataset(ds.fileId).then(onDatasetLoaded).catch(() => {})}
                    style={{ borderColor: 'var(--glass-br)' }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{ background: 'var(--glass-2)' }}>
                        <span className="text-xs font-bold mono" style={{ color: glow }}>{ext.slice(0,4)}</span>
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
                      style={{ background: 'var(--glass-2)', color: 'var(--coral)' }}>
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
