import { API_BASE } from '../utils/constants';
import { baseHeaders } from '../utils/request';

const User = {
  login: async (emailAddress: string) => {
    let error;
    const user = await fetch(`${API_BASE}/login-with-email`, {
      method: 'POST',
      cache: 'no-cache',
      body: JSON.stringify({ emailAddress }),
    })
      .then((res) => res.json())
      .then((res) => {
        error = res?.error || '[001] Failed to authenticate';
        return res.user;
      })
      .catch((e) => {
        console.error(e);
        error = '[002] Failed to authenticate';
        return null;
      });

    if (!user) return { user: null, error };
    return { user, error: null };
  },
  createSession: async (authToken: string) => {
    let error;
    const response = await fetch(`${API_BASE}/create-session`, {
      method: 'POST',
      cache: 'no-cache',
      body: JSON.stringify({ token: authToken }),
    })
      .then((res) => res.json())
      .then((res) => res)
      .catch((e) => {
        console.error(e);
        error = '[002] Failed to authenticate';
        return null;
      });

    if (!response) return { token: null, user: null, error };
    return response;
  },
  organizations: async () => {
    const organizations = await fetch(`${API_BASE}/v1/orgs`, {
      method: 'GET',
      cache: 'no-cache',
      headers: baseHeaders(),
    })
      .then((res) => res.json())
      .then((res) => res?.organizations || [])
      .catch((e) => {
        console.error(e);
        return [];
      });

    return organizations;
  },
  workspaces: async () => {
    const workspaces = await fetch(`${API_BASE}/v1/orgs/workspaces`, {
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

    return workspaces;
  },
};

export default User;
