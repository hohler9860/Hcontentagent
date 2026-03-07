const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || res.statusText);
  }
  return res.json();
}

// Accounts
export const getAccounts = (params) => request(`/accounts?${new URLSearchParams(params || {})}`);
export const getAccount = (id) => request(`/accounts/${id}`);
export const getAccountByHandle = (handle) => request(`/accounts/handle/${handle}`);
export const createAccount = (data) => request('/accounts', { method: 'POST', body: JSON.stringify(data) });
export const updateAccount = (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAccount = (id) => request(`/accounts/${id}`, { method: 'DELETE' });

// Posts
export const getPosts = (params) => request(`/posts?${new URLSearchParams(params || {})}`);
export const getPost = (id) => request(`/posts/${id}`);
export const getRecentWinners = (days = 7) => request(`/posts/winners/recent?days=${days}`);

// Scrape
export const scrapeAll = () => request('/scrape/all', { method: 'POST', body: '{}' });
export const triggerScrape = (data) => request('/scrape/trigger', { method: 'POST', body: JSON.stringify(data || {}) });
export const triggerHashtagScrape = () => request('/scrape/hashtags', { method: 'POST', body: '{}' });
export const getScrapeRuns = (limit = 20) => request(`/scrape/runs?limit=${limit}`);

// Scores
export const runScoring = () => request('/scores/run', { method: 'POST', body: '{}' });
export const getLeaderboard = (days = 7, limit = 20) => request(`/scores/leaderboard?days=${days}&limit=${limit}`);
export const getWinners = (days = 7) => request(`/scores/winners?days=${days}`);

// Pipeline
export const getPipeline = () => request('/pipeline');
export const createPipelineItem = (data) => request('/pipeline', { method: 'POST', body: JSON.stringify(data) });
export const updatePipelineItem = (id, data) => request(`/pipeline/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deletePipelineItem = (id) => request(`/pipeline/${id}`, { method: 'DELETE' });

// Scripts
export const getScripts = (params) => request(`/scripts?${new URLSearchParams(params || {})}`);
export const getScript = (id) => request(`/scripts/${id}`);
export const createScript = (data) => request('/scripts', { method: 'POST', body: JSON.stringify(data) });
export const updateScript = (id, data) => request(`/scripts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteScript = (id) => request(`/scripts/${id}`, { method: 'DELETE' });

// Settings
export const getSettings = () => request('/settings');
export const updateSettings = (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) });
export const getSetting = (key) => request(`/settings/${key}`);
export const updateSetting = (key, value) => request(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });

// Stats
export const getOverviewStats = () => request('/stats/overview');
export const getAccountStats = (id) => request(`/stats/account/${id}`);

// Remix
export const remixPost = (data) => request('/remix', { method: 'POST', body: JSON.stringify(data) });
export const remixBatch = (post_ids) => request('/remix/batch', { method: 'POST', body: JSON.stringify({ post_ids }) });

// Health
export const healthCheck = () => request('/health');
