import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getEvaluation } from '../api';
import { Database, FileText, MessageSquare, Video, Mail, CheckCircle } from 'lucide-react';

const Evaluation = () => {
  const [data, setData] = useState<any[]>([]);
  const [datasetSpec, setDatasetSpec] = useState<any>(null);

  useEffect(() => {
    getEvaluation().then(res => {
      const formatted = [
        { name: 'Accuracy', Baseline: res.metrics.baseline.accuracy, Proposed: res.metrics.proposed.accuracy },
        { name: 'Precision', Baseline: res.metrics.baseline.precision, Proposed: res.metrics.proposed.precision },
        { name: 'Recall', Baseline: res.metrics.baseline.recall, Proposed: res.metrics.proposed.recall },
      ];
      setData(formatted);
      if (res.dataset_spec) {
        setDatasetSpec(res.dataset_spec);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Evaluation & Dataset Specifications</h2>
          <p className="text-slate-500 mt-1">Comparing Baseline (Newest Version) vs Proposed (DocAuthority) on Labeled Corpus.</p>
        </div>
      </div>

      {/* Dataset Specification Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-xl shadow-md p-6 border border-slate-800">
        <div className="flex items-center space-x-3 mb-3">
          <Database className="text-blue-400" size={24} />
          <h3 className="text-lg font-bold">Evaluation Dataset Specification</h3>
        </div>
        <p className="text-sm text-slate-300 mb-4">
          Evaluated against a structured enterprise consulting benchmark dataset with ground-truth labeled query-answer pairs across heterogeneous input channels.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 block">Total Documents</span>
            <span className="text-xl font-bold text-white">{datasetSpec?.sample_size?.total_documents || 105}</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 block">Total Versions</span>
            <span className="text-xl font-bold text-white">{datasetSpec?.sample_size?.total_versions || 312}</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 block">Labeled Queries</span>
            <span className="text-xl font-bold text-white">{datasetSpec?.sample_size?.benchmark_queries || 50}</span>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 block">Input Source Types</span>
            <span className="text-xl font-bold text-white">4 Channels</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <FileText size={14} className="text-blue-400" />
            <span>PDF Documents (65)</span>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare size={14} className="text-green-400" />
            <span>Slack/Teams Chats (20)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Video size={14} className="text-purple-400" />
            <span>Meeting Transcripts (12)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail size={14} className="text-amber-400" />
            <span>Email Records (8)</span>
          </div>
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
          <h3 className="text-xl font-bold text-slate-800 mb-4">Why DocAuthority Outperforms</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-0.5 shrink-0" size={18} />
              <div>
                <span className="text-sm font-bold text-slate-700 block">Prevents Unapproved Draft Leakage</span>
                <span className="text-sm text-slate-500">Baseline methods pick newest timestamps (which are often unapproved drafts). DocAuthority scores APPROVED status highest.</span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-0.5 shrink-0" size={18} />
              <div>
                <span className="text-sm font-bold text-slate-700 block">Heterogeneous Data Normalization</span>
                <span className="text-sm text-slate-500">Maps unstructured chats, meeting transcripts, and PDFs into a unified authority framework with exact traceable citations.</span>
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircle className="text-green-500 mr-3 mt-0.5 shrink-0" size={18} />
              <div>
                <span className="text-sm font-bold text-slate-700 block">Security & RBAC Enforcement</span>
                <span className="text-sm text-slate-500">Prunes restricted content before ranking to guarantee zero unauthorized retrievals.</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;
