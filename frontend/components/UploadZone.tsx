'use client';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { uploadFile, listDatasets, getDataset, deleteDataset } from '@/lib/api';

interface Props {
  onDatasetLoaded: (dataset: any) => void;
  subscribe: (fn: (msg: any) => void) => () => void;
}

export default function UploadZone({ onDatasetLoaded, subscribe }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [datasets, setDatasets] = useState<any[]>([]);

  useEffect(() => {
    loadDatasets();
    const unsub = subscribe((msg) => {
      if (msg.type === 'upload_status') {
        setProgress(msg.progress || 0);
        setStatus(msg.status);
        if (msg.status === 'error') setError(msg.error || 'Upload failed');
      }
    });
    return unsub;
  }, [subscribe]);

  const loadDatasets = async () => {
    try {
      const { datasets } = await listDatasets();
      setDatasets(datasets);
    } catch {}
  };

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setUploading(true);
    setError('');
    setProgress(5);
    setStatus('uploading');

    try {
      const result = await uploadFile(files[0]);
      setProgress(100);
      setStatus('complete');
      await loadDatasets();
      setTimeout(() => {
        setUploading(false);
        // Load the full dataset and navigate
        getDataset(result.fileId).then(onDatasetLoaded);
      }, 800);
    } catch (e: any) {
      setError(e.message);
      setUploading(false);
    }
  }, [onDatasetLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleDelete = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteDataset(fileId);
    loadDatasets();
  };

  const statusIcon = () => {
    if (status === 'complete') return <CheckCircle size={24} style={{ color: 'var(--success)' }} />;
    if (error) return <AlertCircle size={24} style={{ color: 'var(--danger)' }} />;
    if (uploading) return <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />;
    return <Upload size={40} style={{ color: isDragActive ? 'var(--accent)' : 'var(--text-muted)' }} />;
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Upload Dataset</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Support for CSV and Excel files up to 10MB. Get instant AI-powered insights.</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-8"
        style={{
          borderColor: isDragActive ? 'var(--accent)' : error ? 'var(--danger)' : 'var(--border)',
          background: isDragActive ? 'rgba(99,102,241,0.05)' : 'var(--surface)',
        }}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {statusIcon()}
          {uploading ? (
            <div className="w-full max-w-xs">
              <p className="text-sm mb-2 capitalize" style={{ color: 'var(--text-muted)' }}>{status}...</p>
              <div className="w-full rounded-full h-1.5" style={{ background: 'var(--border)' }}>
                <div className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }} />
              </div>
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-dim)' }}>{progress}%</p>
            </div>
          ) : error ? (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
          ) : (
            <>
              <p className="font-medium" style={{ color: 'var(--text)' }}>
                {isDragActive ? 'Drop it here' : 'Drag & drop your dataset'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>or click to browse — CSV, XLSX, XLS</p>
              <div className="flex gap-2 flex-wrap justify-center mt-2">
                {['Sales data', 'Survey results', 'Financial reports', 'Any CSV'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent datasets */}
      {datasets.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>RECENT DATASETS</h2>
          <div className="flex flex-col gap-2">
            {datasets.map(ds => (
              <div key={ds.fileId}
                className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:border-indigo-500"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                onClick={() => getDataset(ds.fileId).then(onDatasetLoaded)}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={18} style={{ color: 'var(--accent)' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{ds.fileName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ds.rowCount?.toLocaleString()} rows · {ds.columnCount} columns</p>
                  </div>
                </div>
                <button onClick={(e) => handleDelete(ds.fileId, e)} className="p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity">
                  <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
