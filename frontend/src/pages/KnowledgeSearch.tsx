import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, Clock, User, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { searchKnowledge } from '../api';
import { useAuth } from '../context/AuthContext';

const KnowledgeSearch = () => {
  const { role } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const data = await searchKnowledge(query, role);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl font-bold text-slate-800">Ask the firm's knowledge base...</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          The Authority Resolver will search all documents, verify your access, and return the most current approved version.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative w-full max-w-3xl mx-auto">
        <div className="relative flex items-center w-full h-14 rounded-full focus-within:shadow-lg bg-white border border-slate-300 overflow-hidden transition-shadow">
          <div className="grid place-items-center h-full w-12 text-slate-300 ml-2">
            <Search size={22} />
          </div>
          <input
            className="peer h-full w-full outline-none text-sm text-slate-700 pr-2 bg-transparent"
            type="text"
            id="search"
            placeholder="e.g. What is the current approved pricing policy?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          /> 
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-full font-medium transition-colors">
            {loading ? 'Searching...' : 'Resolve'}
          </button>
        </div>
        <div className="mt-3 flex justify-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Suggestions:</span>
          {["Pricing Policy", "Travel Policy", "Data Security", "Disciplinary"].map(s => (
            <button key={s} type="button" onClick={() => setQuery(s)} className="text-xs text-blue-600 hover:underline">{s}</button>
          ))}
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start max-w-3xl mx-auto shadow-sm">
          <ShieldAlert className="mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-sm">Access Denied or Not Found</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {result && result.selected_version && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-50 border-b border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Authoritative Source
              </span>
              {result.has_conflict && (
                <span className="flex items-center text-amber-600 text-xs font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <AlertTriangle size={14} className="mr-1" />
                  Approval Conflict Detected
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{result.document.title}</h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center"><Layers size={14} className="mr-1" /> Version {result.selected_version.version_num}</span>
              <span className="flex items-center"><User size={14} className="mr-1" /> {result.selected_version.owner}</span>
              <span className="flex items-center"><Clock size={14} className="mr-1" /> {new Date(result.selected_version.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="p-6 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Content Snippet</h4>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 italic text-sm">
              "{result.selected_version.content}"
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Why this source was selected</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle size={16} className={result.scores.approval_score > 0 ? "text-green-500 mt-0.5 mr-2" : "text-slate-300 mt-0.5 mr-2"} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Approval Status ({result.scores.approval_score}/50 pts)</p>
                    <p className="text-xs text-slate-500">Status: {result.selected_version.approval_status}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className={result.scores.ownership_score > 0 ? "text-green-500 mt-0.5 mr-2" : "text-slate-300 mt-0.5 mr-2"} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Verified Ownership ({result.scores.ownership_score}/25 pts)</p>
                    <p className="text-xs text-slate-500">Document owned by {result.selected_version.owner}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle size={16} className={result.scores.recency_score > 0 ? "text-green-500 mt-0.5 mr-2" : "text-slate-300 mt-0.5 mr-2"} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">Recency ({result.scores.recency_score}/25 pts)</p>
                    <p className="text-xs text-slate-500">Relative age of version</p>
                  </div>
                </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-800 flex justify-between">
                  <span>Total Authority Score:</span>
                  <span className="text-blue-600">{result.scores.total_score} / 100</span>
                </p>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${result.scores.total_score}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center">
                <LinkIcon size={14} className="mr-1.5" /> Source Citation
              </h4>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Source File</span>
                  <span className="font-medium">{result.citation.source_file}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Page</span>
                  <span className="font-medium">{result.citation.page}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-500">Section</span>
                  <span className="font-medium">{result.citation.section}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">
                View Full Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearch;
