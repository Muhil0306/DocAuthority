import React, { useState } from 'react';
import { PlayCircle, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { searchKnowledge } from '../api';
import { useAuth } from '../context/AuthContext';

const FailureTests = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string | null>(null);

  const tests = [
    {
      id: 'test1',
      name: 'Older Approved vs Newer Draft',
      description: 'System should select an older approved version over a newer draft version.',
      query: 'Pricing Policy',
      role: 'Consultant',
      expected: 'Should resolve to Version 1 (APPROVED) instead of Version 2 (DRAFT)'
    },
    {
      id: 'test2',
      name: 'Unauthorized Access',
      description: 'User attempts to access a document they do not have permissions for.',
      query: 'Employee Disciplinary Procedure',
      role: 'Consultant',
      expected: 'Should return Access Denied / 403 status.'
    },
    {
      id: 'test3',
      name: 'Conflicting Approvals',
      description: 'Document has two versions both marked as APPROVED.',
      query: 'Data Security Policy',
      role: 'Administrator',
      expected: 'Should detect conflict and display warning flag.'
    }
  ];

  const runTest = async (testId: string, query: string, role: string) => {
    setLoading(testId);
    try {
      const result = await searchKnowledge(query, role);
      setResults(prev => ({ ...prev, [testId]: { success: true, data: result } }));
    } catch (err: any) {
      setResults(prev => ({ ...prev, [testId]: { success: false, error: err.response?.data?.detail || "Error" } }));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Failure Tests</h2>
          <p className="text-slate-500 mt-1">Run specific edge-case scenarios against the backend resolver.</p>
        </div>
      </div>

      <div className="space-y-4">
        {tests.map(test => (
          <div key={test.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                {test.name}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{test.description}</p>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div><span className="text-slate-400">Query:</span> <span className="font-medium text-slate-700">"{test.query}"</span></div>
                <div><span className="text-slate-400">Role:</span> <span className="font-medium text-slate-700">{test.role}</span></div>
                <div className="col-span-2"><span className="text-slate-400">Expected:</span> <span className="font-medium text-slate-700">{test.expected}</span></div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
              <button 
                onClick={() => runTest(test.id, test.query, test.role)}
                disabled={loading === test.id}
                className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg font-medium flex items-center justify-center transition-colors mb-4"
              >
                {loading === test.id ? 'Running...' : <><PlayCircle size={18} className="mr-2" /> Run Test</>}
              </button>
              
              {results[test.id] && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                  {results[test.id].success ? (
                    <div>
                      <div className="flex items-center text-green-600 font-bold mb-2">
                        <CheckCircle size={16} className="mr-1" /> Request Succeeded
                      </div>
                      <div className="text-slate-700">Selected: <span className="font-medium">v{results[test.id].data.selected_version.version_num}</span></div>
                      <div className="text-slate-700">Status: {results[test.id].data.selected_version.approval_status}</div>
                      {results[test.id].data.has_conflict && <div className="text-amber-600 font-medium mt-1 text-xs">Conflict Detected ✅</div>}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center text-red-600 font-bold mb-2">
                        <XCircle size={16} className="mr-1" /> Request Failed (Expected for Access Denied)
                      </div>
                      <div className="text-slate-700">Error: {results[test.id].error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FailureTests;
