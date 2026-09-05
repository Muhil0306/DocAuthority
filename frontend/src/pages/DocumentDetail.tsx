import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDocument, getDocumentVersions } from '../api';
import { FileText, ArrowLeft, Clock, ShieldCheck, CheckCircle } from 'lucide-react';

const DocumentDetail = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([getDocument(Number(id)), getDocumentVersions(Number(id))])
        .then(([docData, versionsData]) => {
          setDoc(docData);
          setVersions(versionsData.sort((a: any, b: any) => b.version_num - a.version_num));
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading document details...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/documents" className="text-blue-600 hover:underline flex items-center text-sm font-medium">
        <ArrowLeft size={16} className="mr-1" /> Back to Documents
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="text-blue-600" size={28} />
              <h2 className="text-3xl font-bold text-slate-800">{doc.title}</h2>
            </div>
            <p className="text-slate-500 flex items-center mt-2">
              <ShieldCheck size={16} className="mr-2 text-slate-400" />
              Department: {doc.department}
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mt-10 mb-4 border-b border-slate-200 pb-2">Version History</h3>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
          {versions.map((v, i) => (
            <div key={v.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {v.approval_status === 'APPROVED' ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <Clock size={16} />
                )}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">Version {v.version_num}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    v.approval_status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    v.approval_status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {v.approval_status}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mb-3">{new Date(v.updated_at).toLocaleDateString()} by {v.owner}</div>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{v.content}</p>
                <div className="mt-3 text-xs text-slate-400">Allowed Roles: {v.allowed_roles}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
