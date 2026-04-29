import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Clock, Database, Search } from 'lucide-react';
import { api } from '../lib/api';

interface BackupFile {
  name: string;
  size: number;
  createdAt: string;
}

export default function CSVArchive() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await api.sync.listBackups();
      setBackups(data);
    } catch (err) {
      console.error('Failed to fetch backups', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filtered = backups.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>CSV Backup Archive</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '4px 0 0', fontWeight: 600 }}>
            Every Google Sheet sync is automatically archived here as a permanent CSV record.
          </p>
        </div>
        <button onClick={fetchBackups} className="btn-ghost" style={{ padding: '10px 16px', fontSize: 12 }}>
          Refresh List
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          className="input-field" 
          style={{ paddingLeft: 44, background: '#f1f5f9' }} 
          placeholder="Search backups by filename..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bright-panel" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Database size={48} color="var(--border)" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 16, color: 'var(--text-dim)', fontWeight: 700 }}>No backup files found</div>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8 }}>Try syncing your Google Sheet to create your first archive.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {filtered.map((file, i) => (
            <motion.div 
              key={file.name} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className="bright-panel" 
              style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileText size={22} color="var(--primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>
                    <Clock size={12} /> {new Date(file.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 800, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>
                    {formatSize(file.size)}
                  </div>
                </div>
              </div>
              <a 
                href={api.sync.getBackupUrl(file.name)} 
                download={file.name}
                className="bright-button" 
                style={{ width: 40, height: 40, borderRadius: 10, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Download size={18} />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
