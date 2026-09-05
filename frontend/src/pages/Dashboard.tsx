import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Layers, 
  CheckCircle, 
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getDocuments } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalVersions: 0,
    approvedVersions: 0,
    conflicts: 0,
  });

  useEffect(() => {
    // In a real app we'd have a specific stats endpoint, 
    // here we mock the fetch or calculate from documents if needed
    setStats({
      totalDocs: 105,
      totalVersions: 312,
      approvedVersions: 145,
      conflicts: 2,
    });
  }, []);

  const data = [
    { name: 'Finance', docs: 24 },
    { name: 'HR', docs: 18 },
    { name: 'Strategy', docs: 15 },
    { name: 'Ops', docs: 22 },
    { name: 'Tech', docs: 26 },
  ];

  const accuracyData = [
    { name: 'Week 1', baseline: 45, proposed: 88 },
    { name: 'Week 2', baseline: 42, proposed: 91 },
    { name: 'Week 3', baseline: 47, proposed: 93 },
    { name: 'Week 4', baseline: 45, proposed: 95 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Executive Dashboard</h2>
          <p className="text-slate-500 mt-1">Overview of knowledge base health and authority resolution.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <FileText className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Documents</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalDocs}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="rounded-full bg-indigo-100 p-3 mr-4">
            <Layers className="text-indigo-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Versions</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalVersions}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Approved Versions</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.approvedVersions}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="rounded-full bg-amber-100 p-3 mr-4">
            <AlertTriangle className="text-amber-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Conflicting Versions</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.conflicts}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Documents by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="docs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Resolver vs Baseline Accuracy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="proposed" name="DocAuthority" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="baseline" name="Baseline (Newest)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={{r: 3}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">System Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <Activity className="text-green-500" size={20} />
            <div>
              <p className="text-sm font-medium text-slate-700">Database</p>
              <p className="text-xs text-green-600 font-medium">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <ShieldCheck className="text-green-500" size={20} />
            <div>
              <p className="text-sm font-medium text-slate-700">Access Control</p>
              <p className="text-xs text-green-600 font-medium">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <TrendingUp className="text-green-500" size={20} />
            <div>
              <p className="text-sm font-medium text-slate-700">Resolver Engine</p>
              <p className="text-xs text-green-600 font-medium">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <FileText className="text-green-500" size={20} />
            <div>
              <p className="text-sm font-medium text-slate-700">Citation Engine</p>
              <p className="text-xs text-green-600 font-medium">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
