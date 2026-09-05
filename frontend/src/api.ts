import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const searchKnowledge = async (query: string, role: string) => {
  const response = await api.get('/search', { params: { q: query, role } });
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data;
};

export const getDocument = async (id: number) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const getDocumentVersions = async (id: number) => {
  const response = await api.get(`/documents/${id}/versions`);
  return response.data;
};

export const getAuditLogs = async () => {
  const response = await api.get('/audit-logs');
  return response.data;
};

export const rollbackVersion = async (docId: number, targetVersionId: number, role: string) => {
  const response = await api.post('/rollback', null, { 
    params: { doc_id: docId, target_version_id: targetVersionId, role } 
  });
  return response.data;
};

export const getEvaluation = async () => {
  const response = await api.get('/evaluation');
  return response.data;
};
