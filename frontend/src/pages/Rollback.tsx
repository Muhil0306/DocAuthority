import React, { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { rollbackVersion } from '../api';
import { useAuth } from '../context/AuthContext';

const Rollback = () => {
  const { role } = useAuth();
  const [docId, setDocId] = useState('');
  const [versionId, setVersionId] = useState('');
  const [status, setStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);

  const handleRollback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rollbackVersion(Number(docId), Number(versionId), role);
      setStatus({ type: 'success', msg: `Successfully rolled back Document ${docId} to Version ${versionId}. Newer versions have been archived.` });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.response?.data?.detail || 'Rollback failed.' });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Version Rollback</h2>
          <p className="text-slate-500 mt-1">Restore a previous authoritative version.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start mb-6">
          <AlertTriangle className="mr-3 flex-shrink-0 mt-0.5 text-amber-600" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Warning</h4>
            <p className="text-sm mt-1">Performing a rollback will mark all versions newer than the target version as ARCHIVED. The target version will become the new APPROVED authoritative source.</p>
          </div>
        </div>

        <form onSubmit={handleRollback} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Document ID</label>
            <input 
              type="number" 
              required 
              value={docId} 
              onChange={e => setDocId(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" 
              placeholder="e.g. 1" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Version ID to Restore</label>
            <input 
              type="number" 
              required 
              value={versionId} 
              onChange={e => setVersionId(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" 
              placeholder="e.g. 1" 
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg flex items-center justify-center transition-colors">
            <RotateCcw size={18} className="mr-2" /> Execute Rollback
          </button>
        </form>

        {status && (
          <div className={`mt-6 p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rollback;
