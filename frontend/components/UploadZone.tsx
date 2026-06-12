'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile, listDatasets, getDataset, deleteDataset } from '@/lib/api';

interface Props {
  onDatasetLoaded: (dataset: any) => void;
  subscribe: (fn: (msg: any) => void) => () => void;
}

const STATUS_LABELS: Record<string, string> = {
  uploading: 'Uploading',
  parsing: 'Parsing dataset',
  processing: 'Computing column stats',
  saving: 'Writing to database',
  complete: 'Ready',
  error: 'Failed',
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
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs mono px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--dim)' }}>01</span>
            <p className="text-xs mono uppercase tracking-wider" style={{ color: 'var(--dim)' }}>Data ingestion</p>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Upload a dataset</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            CSV or Excel, up to 10MB. Columns are typed automatically — numeric, categorical, or date.
          </p>
        </div>

        {/* Drop zone */}
        <div {...getRootProps()}
          className="relative rounded-lg p-10 mb-8 transition-colors"
          style={{
            border: `1px solid ${isDragActive ? 'var(--blue)' : error ? 'var(--red)' : 'var(--border)'}`,
            background: isDragActive ? 'var(--blue-bg)' : 'var(--surface)',
            cursor: uploading ? 'default' : 'pointer',
          }}>
          <input {...getInputProps()} />

          {/* corner brackets */}
          {!uploading && (
            <>
              <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
            </>
          )}

          <div className="flex flex-col items-center text-center gap-3 relative z-10">
            {uploading ? (
              <div className="w-full max-w-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs mono" style={{ color: 'var(--muted)' }}>
                    {STATUS_LABELS[status] || 'Working'}
                  </span>
                  <span className="text-xs mono" style={{ color: 'var(--blue)' }}>{progress}%</span>
                </div>
                <div className="w-full rounded-full h-1" style={{ background: 'var(--border)' }}>
                  <div className="h-1 rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'var(--blue)' }} />
                </div>
              </div>
            ) : error ? (
              <>
                <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'rgba(247,129,102,0.1)', border: '1px solid rgba(247,129,102,0.3)' }}>
                  <span className="mono text-sm" style={{ color: 'var(--red)' }}>!</span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>{error}</p>
                <p className="text-xs" style={{ color: 'var(--dim)' }}>Click anywhere to retry</p>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 11V3M8 3L5 6M8 3L11 6M3 13H13" stroke={isDragActive ? 'var(--blue)' : 'var(--muted)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium mb-0.5">{isDragActive ? 'Drop to upload' : 'Drag a file here'}</p>
                  <p className="text-xs" style={{ color: 'var(--dim)' }}>or click to browse</p>
                </div>
                <div className="flex gap-1.5 mt-1">
                  {['.csv', '.xlsx', '.xls'].map(ext => (
                    <span key={ext} className="text-xs mono px-2 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--dim)', border: '1px solid var(--border)' }}>{ext}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent datasets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs mono uppercase tracking-wider" style={{ color: 'var(--dim)' }}>Recent datasets</p>
            {datasets.length > 0 && <p className="text-xs mono" style={{ color: 'var(--dim)' }}>{datasets.length}</p>}
          </div>

          {loadingList ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />)}
            </div>
          ) : datasets.length === 0 ? (
            <div className="rounded-lg p-6 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--dim)' }}>No datasets yet — upload one to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {datasets.map(ds => (
                <div key={ds.fileId}
                  className="flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors group"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  onClick={() => getDataset(ds.fileId).then(onDatasetLoaded).catch(() => {})}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <span className="text-xs mono" style={{ color: 'var(--muted)' }}>{ds.fileName?.split('.').pop()?.toUpperCase().slice(0,3)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ds.fileName}</p>
                      <p className="text-xs mono" style={{ color: 'var(--dim)' }}>
                        {ds.rowCount?.toLocaleString()} rows · {ds.columnCount} cols
                      </p>
                    </div>
                  </div>
                  <button onClick={(e) => handleDelete(ds.fileId, e)}
                    className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: 'var(--dim)' }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4H13M6 4V2.5C6 2.2 6.2 2 6.5 2H9.5C9.8 2 10 2.2 10 2.5V4M12 4V13C12 13.5 11.5 14 11 14H5C4.5 14 4 13.5 4 13V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Corner({ pos }: { pos: 'tl'|'tr'|'bl'|'br' }) {
  const styles: Record<string, string> = {
    tl: 'top-2 left-2 border-t border-l',
    tr: 'top-2 right-2 border-t border-r',
    bl: 'bottom-2 left-2 border-b border-l',
    br: 'bottom-2 right-2 border-b border-r',
  };
  return <div className={`absolute w-2.5 h-2.5 ${styles[pos]}`} style={{ borderColor: 'var(--border-2)' }} />;
}
