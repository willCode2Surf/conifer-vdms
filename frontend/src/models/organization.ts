import { API_BASE } from '../utils/constants';
import { baseHeaders } from '../utils/request';

const Organization = {
  createNew: async (orgName: string) => {
    let error;
    const organization = await fetch(`${API_BASE}/v1/create-org`, {
      method: 'POST',
      cache: 'no-cache',
      headers: baseHeaders(),
      body: JSON.stringify({ orgName }),
    })
      .then((res) => res.json())
      .then((res) => {
        error = res?.error || '[001] Failed to create organization.';
        return res.organization;
      })
      .catch((e) => {
        console.error(e);
        error = '[002] Failed to create organization.';
        return null;
      });

    if (!organization) return { organization: null, error };
    return { organization, error: null };
  },
  bySlug: async (slug: string) => {
    const organization = await fetch(`${API_BASE}/v1/org/${slug}`, {
      method: 'GET',
      cache: 'no-cache',
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.organization)
      .catch((e) => {
        console.error(e);
        return null;
      });

    return { organization };
  },
  stats: async (slug: string, metric: string) => {
    return fetch(`${API_BASE}/v1/org/${slug}/statistics/${metric}`, {
      method: 'GET',
      headers: baseHeaders(),
    }).then((res) => res.json());
  },
  documents: async (slug: string) => {
    return fetch(`${API_BASE}/v1/org/${slug}/documents`, {
      method: 'GET',
      cache: 'no-cache',
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.documents || [])
      .catch((e) => {
        console.error(e);
        return [];
      });
  },
  workspaces: async (slug: string) => {
    return fetch(`${API_BASE}/v1/org/${slug}/workspaces`, {
      method: 'GET',
      cache: 'no-cache',
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.workspaces || [])
      .catch((e) => {
        console.error(e);
        return [];
      });
  },
  apiKey: async (slug: string) => {
    return fetch(`${API_BASE}/v1/org/${slug}/api-key`, {
      method: 'GET',
      cache: 'no-cache',
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.apiKey || null)
      .catch((e) => {
        console.error(e);
        return null;
      });
  },
};

export default Organization;
