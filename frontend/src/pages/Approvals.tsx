import React from 'react';
import { AlertCircle } from 'lucide-react';

const Approvals = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pending Approvals</h2>
          <p className="text-slate-500 mt-1">Review and approve document versions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center">
        <AlertCircle size={48} className="text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-700">No Pending Approvals</h3>
        <p className="text-slate-500 mt-1">You're all caught up. There are no documents awaiting your review.</p>
      </div>
    </div>
  );
};

export default Approvals;
