const API_URL = 'https://saas-dashboard-th24.onrender.com/api';

const getHeaders = (founderId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (founderId) {
    headers['x-founder-id'] = founderId;
  }
  return headers;
};

export const api = {
  get: async (endpoint: string, founderId?: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: getHeaders(founderId),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
  post: async (endpoint: string, data: any, founderId?: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(founderId),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
  put: async (endpoint: string, data: any, founderId?: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(founderId),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
  delete: async (endpoint: string, founderId?: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(founderId),
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  }
};
