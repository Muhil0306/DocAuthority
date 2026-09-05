import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getEvaluation } from '../api';

const Evaluation = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    getEvaluation().then(res => {
      const formatted = [
        { name: 'Accuracy', Baseline: res.metrics.baseline.accuracy, Proposed: res.metrics.proposed.accuracy },
        { name: 'Precision', Baseline: res.metrics.baseline.precision, Proposed: res.metrics.proposed.precision },
        { name: 'Recall', Baseline: res.metrics.baseline.recall, Proposed: res.metrics.proposed.recall },
      ];
      setData(formatted);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Evaluation</h2>
          <p className="text-slate-500 mt-1">Comparing Baseline (Newest Version) vs Proposed (DocAuthority).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Metrics Comparison (%)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" />
                <Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Proposed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Why DocAuthority Wins</h3>
          <ul className="space-y-4">
            <li className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Avoids Drafts</span>
              <span className="text-sm text-slate-500">The baseline method simply picks the newest version, which is often an unapproved draft. DocAuthority ranks older approved versions higher.</span>
            </li>
            <li className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Access Control Aware</span>
              <span className="text-sm text-slate-500">DocAuthority filters out documents the user shouldn't see before ranking, preventing unauthorized knowledge leaks.</span>
            </li>
            <li className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Owner Verification</span>
              <span className="text-sm text-slate-500">Boosts scores for documents maintained by the verified departmental owner.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
